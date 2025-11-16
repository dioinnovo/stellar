/**
 * useRealtimeVoice Hook
 * 
 * Provider-agnostic React hook for managing voice conversations
 * Supports OpenAI Realtime API, Hume EVI, and easy provider switching
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { voiceProviderFactory, VoiceConfig, VoiceProvider } from '@/lib/voice/ProviderFactory';
import { IVoiceProvider, VoiceTranscript } from '@/lib/voice/providers/IVoiceProvider';

export interface UseRealtimeVoiceOptions {
  sessionId: string;
  orchestratorEndpoint?: string;
  autoConnect?: boolean;
  provider?: VoiceProvider;
  voice?: string;
  onUiAction?: (uiAction: any) => void;
  
  // Provider-specific options
  openai?: {
    voice?: 'alloy' | 'echo' | 'shimmer';
    model?: string;
  };
  
  hume?: {
    configId?: string;
    configVersion?: string;
    voiceId?: string;
    resumedChatGroupId?: string;
    verboseTranscription?: boolean;
  };
}

export interface UseRealtimeVoiceReturn {
  // State
  isConnected: boolean;
  isConnecting: boolean;
  isCallActive: boolean;
  error: string | null;
  transcripts: VoiceTranscript[];
  currentTranscript: string;
  currentProvider: VoiceProvider | null;
  
  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  startCall: () => Promise<void>;
  endCall: () => void;
  sendText: (text: string) => void;
  setContext: (messages: Array<{ text: string; isUser: boolean }>) => void;
  switchProvider: (newProvider: VoiceProvider) => Promise<void>;
  
  // Provider info
  getProviderCapabilities: () => { name: string; version: string; voices: string[]; features: string[] } | null;
  getSupportedProviders: () => VoiceProvider[];
  
  // Metrics
  callDuration: number;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'unknown';
}

export function useRealtimeVoice(options: UseRealtimeVoiceOptions): UseRealtimeVoiceReturn {
  const defaultProvider = (process.env.NEXT_PUBLIC_VOICE_PROVIDER as VoiceProvider) || 'hume';
  const {
    sessionId,
    orchestratorEndpoint = '/api/orchestrate',
    autoConnect = false,
    provider = defaultProvider,
    voice = options.voice
  } = options;

  // State
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcripts, setTranscripts] = useState<VoiceTranscript[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor' | 'unknown'>('unknown');
  const [currentProvider, setCurrentProvider] = useState<VoiceProvider | null>(null);
  
  // UI Action queuing state
  const [queuedUIActions, setQueuedUIActions] = useState<any[]>([]);
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);

  // Refs
  const providerRef = useRef<IVoiceProvider | null>(null);
  const callStartTimeRef = useRef<Date | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount - ENHANCED for microphone release
  useEffect(() => {
    return () => {
      console.log('🎤 Voice Provider: Component unmounting - performing complete cleanup');
      
      // Clear timers first
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      // Full provider cleanup to release microphone
      if (providerRef.current) {
        // End call first if active
        if (isCallActive) {
          providerRef.current.endCall();
        }
        // Then disconnect to release all resources
        providerRef.current.disconnect();
        providerRef.current = null;
      }
      
      console.log('✅ Voice Provider: Component cleanup completed');
    };
  }, [isCallActive]);

  // Auto-connect if enabled
  useEffect(() => {
    if (autoConnect && !isConnected && !isConnecting) {
      connect();
    }
  }, [autoConnect]);

  /**
   * Build voice provider configuration
   */
  const buildProviderConfig = useCallback((targetProvider: VoiceProvider = provider, voiceOverride?: string): VoiceConfig => {
    const baseConfig: VoiceConfig = {
      provider: targetProvider,
      sessionId,
      orchestratorEndpoint,
      voice: voiceOverride || voice
    };

    if (targetProvider === 'openai') {
      baseConfig.openai = {
        voice: options.openai?.voice || (voiceOverride as 'alloy' | 'echo' | 'shimmer') || 'alloy',
        model: options.openai?.model || 'gpt-4o-realtime-preview'
      };
    }

    if (targetProvider === 'hume') {
      // For Hume, DON'T use 'alloy' - use the voiceId from options or session
      baseConfig.hume = {
        configId: options.hume?.configId,
        configVersion: options.hume?.configVersion,
        voiceId: options.hume?.voiceId || voiceOverride, // Don't fallback to 'voice' which might be 'alloy'
        resumedChatGroupId: options.hume?.resumedChatGroupId,
        verboseTranscription: options.hume?.verboseTranscription ?? true
      };
    }

    return baseConfig;
  }, [sessionId, orchestratorEndpoint, voice, provider, options]);

  /**
   * Connect to voice provider
   */
  const connect = useCallback(async (hasExistingContext: boolean = false) => {
    if (isConnected || isConnecting || providerRef.current) {
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Get session token from API
      const response = await fetch('/api/realtime/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          sessionId, 
          provider: provider,
          voiceProvider: provider // Add provider info for API
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 503 && errorData.details) {
          console.error('Voice Configuration Error:', errorData);
          throw new Error(errorData.details || 'Voice assistant not configured. Please check your API keys.');
        }
        
        throw new Error(errorData.error || 'Failed to get session token');
      }

      const { token, provider: responseProvider, wsUrl, warning, config: sessionConfig } = await response.json();

      if (warning) {
        console.warn('Voice Provider Warning:', warning);
      }

      // Build provider configuration with voice ID from session
      const voiceId = sessionConfig?.voiceId;
      const config = buildProviderConfig(responseProvider || provider, voiceId);
      config.apiKey = token;
      
      // Ensure Hume uses the correct voice ID from session
      if ((responseProvider || provider) === 'hume' && config.hume && voiceId) {
        config.hume.voiceId = voiceId;
        console.log('Using Hume voice ID from session:', voiceId);
      }
      
      if (wsUrl) {
        if (provider === 'openai' && config.openai) {
          config.openai.wsUrl = wsUrl;
        }
      }

      // Create provider instance
      const voiceProvider = voiceProviderFactory.createProvider(config);
      
      // Setup event listeners
      setupProviderEventListeners(voiceProvider);

      // Connect to voice service
      await voiceProvider.connect(token, wsUrl, hasExistingContext);

      providerRef.current = voiceProvider;
      setCurrentProvider(provider);
      setIsConnected(true);
      setConnectionQuality('excellent');
      
      console.log(`Voice Provider: Connected to ${voiceProvider.getProviderName()}`);
    } catch (err) {
      console.error('Failed to connect to voice provider:', err);
      
      console.log('%c🔍 Troubleshooting Help:', 'color: #3B82F6; font-weight: bold');
      console.log('1. Check configuration: fetch("/api/realtime/check").then(r => r.json()).then(console.log)');
      console.log('2. Verify environment variables for your chosen provider');
      console.log('3. Ensure provider supports your use case');
      
      setError(err instanceof Error ? err.message : 'Connection failed');
      
      const isConfigError = err instanceof Error && 
        (err.message.includes('not configured') || 
         err.message.includes('API key') ||
         err.message.includes('credentials'));
      
      if (!isConfigError) {
        reconnectTimeoutRef.current = setTimeout(() => {
          connect(hasExistingContext);
        }, 5000);
      }
    } finally {
      setIsConnecting(false);
    }
  }, [sessionId, provider, orchestratorEndpoint, isConnected, isConnecting, buildProviderConfig]);

  /**
   * Switch to a different voice provider
   */
  const switchProvider = useCallback(async (newProvider: VoiceProvider) => {
    if (newProvider === currentProvider) {
      console.log('Already using provider:', newProvider);
      return;
    }

    console.log(`Switching voice provider from ${currentProvider} to ${newProvider}`);
    
    // Store current context
    const wasConnected = isConnected;
    const wasInCall = isCallActive;
    const currentTranscripts = [...transcripts];
    
    // Disconnect current provider
    if (providerRef.current) {
      providerRef.current.disconnect();
      providerRef.current = null;
    }
    
    // Reset state
    setIsConnected(false);
    setIsCallActive(false);
    setError(null);
    setCurrentProvider(null);
    
    try {
      // Build new configuration
      const config = buildProviderConfig(newProvider);
      
      // Get new session token
      const response = await fetch('/api/realtime/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          sessionId, 
          provider: newProvider,
          voiceProvider: newProvider
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get session for new provider');
      }

      const { token, wsUrl } = await response.json();
      
      config.apiKey = token;
      if (wsUrl && newProvider === 'openai' && config.openai) {
        config.openai.wsUrl = wsUrl;
      }

      // Create new provider
      const voiceProvider = voiceProviderFactory.createProvider(config);
      setupProviderEventListeners(voiceProvider);

      // Connect with context preservation
      await voiceProvider.connect(token, wsUrl, currentTranscripts.length > 0);
      
      // Restore context if available
      if (currentTranscripts.length > 0) {
        const messages = currentTranscripts.map(t => ({
          text: t.text,
          isUser: t.role === 'user'
        }));
        voiceProvider.setContext(messages);
      }

      providerRef.current = voiceProvider;
      setCurrentProvider(newProvider);
      setIsConnected(true);
      setConnectionQuality('excellent');
      
      // Resume call if it was active
      if (wasInCall) {
        await voiceProvider.startCall();
        setIsCallActive(true);
        startCallTimer();
      }
      
      console.log(`Voice Provider: Successfully switched to ${voiceProvider.getProviderName()}`);
    } catch (error) {
      console.error('Failed to switch provider:', error);
      setError(error instanceof Error ? error.message : 'Provider switch failed');
      setCurrentProvider(provider); // Fall back to original
      throw error;
    }
  }, [currentProvider, isConnected, isCallActive, transcripts, buildProviderConfig, sessionId, provider]);

  /**
   * Setup event listeners for voice provider
   */
  const setupProviderEventListeners = useCallback((voiceProvider: IVoiceProvider) => {
    // Connection events
    voiceProvider.on('connected', () => {
      console.log('Voice Provider: Connected');
      setIsConnected(true);
      setError(null);
      setConnectionQuality('excellent');
    });

    voiceProvider.on('disconnected', () => {
      console.log('Voice Provider: Disconnected');
      setIsConnected(false);
      setIsCallActive(false);
      stopCallTimer();
      setConnectionQuality('unknown');
    });

    voiceProvider.on('reconnected', () => {
      console.log('Voice Provider: Reconnected');
      setIsConnected(true);
      setError(null);
      setConnectionQuality('good');
    });

    voiceProvider.on('connection_error', (error: Error) => {
      console.error('Voice Provider: Connection error:', error);
      setError(error.message);
      setConnectionQuality('poor');
    });

    // Call events
    voiceProvider.on('call_started', () => {
      console.log('Voice Provider: Call started');
      setIsCallActive(true);
    });

    voiceProvider.on('call_ended', () => {
      console.log('Voice Provider: Call ended');
      setIsCallActive(false);
      stopCallTimer();
    });

    // Audio events
    voiceProvider.on('audio_start', () => {
      setIsAssistantSpeaking(true);
    });

    voiceProvider.on('audio_end', () => {
      setIsAssistantSpeaking(false);
      processQueuedUIActions();
    });

    // Transcript events
    voiceProvider.on('transcript', (transcript: VoiceTranscript) => {
      if (transcript.interim) {
        setCurrentTranscript(transcript.text);
      } else {
        addTranscript(transcript.text, transcript.role);
        syncTranscript(transcript.text, transcript.role);
        setCurrentTranscript('');
      }
    });

    voiceProvider.on('interim_transcript', (text: string) => {
      setCurrentTranscript(text);
    });

    // UI events
    voiceProvider.on('ui_action', (uiAction: any) => {
      console.log('Voice Provider: UI action received:', uiAction);
      if (options.onUiAction) {
        if (isAssistantSpeaking) {
          setQueuedUIActions(prev => [...prev, uiAction]);
        } else {
          options.onUiAction(uiAction);
        }
      }
    });

    // Session events
    voiceProvider.on('session_created', (session: any) => {
      console.log('Voice Provider: Session created:', session);
    });

    voiceProvider.on('session_updated', (session: any) => {
      console.log('Voice Provider: Session updated:', session);
    });

    // Metrics events
    voiceProvider.on('metrics_updated', (metrics: any) => {
      if (metrics.quality) {
        setConnectionQuality(metrics.quality);
      }
    });

  }, [isAssistantSpeaking, options.onUiAction]);

  /**
   * Add transcript to history
   */
  const addTranscript = useCallback((text: string, role: 'user' | 'assistant') => {
    if (!text || text.trim() === '') return;
    
    const transcript: VoiceTranscript = {
      text: text.trim(),
      role,
      timestamp: new Date()
    };
    
    setTranscripts(prev => [...prev, transcript]);
  }, []);

  /**
   * Sync transcript with orchestrator
   */
  const syncTranscript = useCallback(async (transcript: string, role: 'user' | 'assistant', inputType: 'voice' | 'typed' = 'voice') => {
    try {
      const response = await fetch('/api/realtime/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId,
          transcript,
          role,
          timestamp: new Date().toISOString(),
          provider: currentProvider,
          metadata: {
            inputType,
            provider: currentProvider
          }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Handle AI response that needs to be spoken
        if (data.aiResponse && data.aiResponse.message && providerRef.current) {
          console.log('Voice Provider: Sending AI confirmation message:', data.aiResponse.message);
          setTimeout(() => {
            if (providerRef.current) {
              providerRef.current.sendText(data.aiResponse.message);
            }
          }, 100);
        }
        
        // Handle UI actions
        if (data.uiAction && options.onUiAction) {
          console.log('Voice Provider: UI action received from orchestrator:', data.uiAction);
          
          if (isAssistantSpeaking) {
            setQueuedUIActions(prev => [...prev, data.uiAction]);
          } else {
            options.onUiAction(data.uiAction);
          }
        }
      }
    } catch (err) {
      console.error('Voice Provider: Failed to sync transcript:', err);
    }
  }, [sessionId, currentProvider, options.onUiAction, isAssistantSpeaking]);

  /**
   * Process all queued UI actions
   */
  const processQueuedUIActions = useCallback(() => {
    if (queuedUIActions.length > 0 && options.onUiAction) {
      console.log(`Voice Provider: Processing ${queuedUIActions.length} queued UI action(s)`);
      queuedUIActions.forEach((uiAction, index) => {
        console.log(`Voice Provider: Processing queued UI action ${index + 1}:`, uiAction);
        options.onUiAction!(uiAction);
      });
      setQueuedUIActions([]);
    }
  }, [queuedUIActions, options.onUiAction]);

  /**
   * Stop call duration timer
   */
  const stopCallTimer = useCallback(() => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    callStartTimeRef.current = null;
    setCallDuration(0);
  }, []);

  /**
   * Start call duration timer
   */
  const startCallTimer = useCallback(() => {
    callTimerRef.current = setInterval(() => {
      if (callStartTimeRef.current) {
        const duration = Math.floor((new Date().getTime() - callStartTimeRef.current.getTime()) / 1000);
        setCallDuration(duration);
      }
    }, 1000);
  }, []);

  /**
   * Disconnect from voice provider
   */
  const disconnect = useCallback(() => {
    if (providerRef.current) {
      providerRef.current.disconnect();
      providerRef.current = null;
    }
    setIsConnected(false);
    setIsCallActive(false);
    setCurrentProvider(null);
    stopCallTimer();
  }, [stopCallTimer]);

  /**
   * Start voice call
   */
  const startCall = useCallback(async (hasExistingMessages: boolean = false) => {
    if (isCallActive) {
      return;
    }

    setIsCallActive(true);
    setError(null);
    setTranscripts([]);
    setCurrentTranscript('');
    callStartTimeRef.current = new Date();
    startCallTimer();

    if (!isConnected) {
      try {
        await connect(hasExistingMessages);
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('Voice Provider: Failed to connect during call start:', error);
        setIsCallActive(false);
        stopCallTimer();
        throw error;
      }
    }

    if (providerRef.current) {
      await providerRef.current.startCall();
      console.log('Voice Provider: Call started', hasExistingMessages ? 'with existing context' : 'fresh');
    }
  }, [isConnected, isCallActive, connect, startCallTimer, stopCallTimer]);

  /**
   * End voice call
   */
  const endCall = useCallback(() => {
    console.log('Voice Provider: Ending call');
    
    setIsCallActive(false);
    setIsAssistantSpeaking(false);
    setQueuedUIActions([]);
    stopCallTimer();
    
    if (providerRef.current) {
      // First end the call
      providerRef.current.endCall();
      
      // CRITICAL: Also disconnect to ensure full cleanup of audio resources
      // This is essential to release microphone access properly
      setTimeout(() => {
        if (providerRef.current) {
          console.log('🎤 Voice Provider: Disconnecting to release microphone resources');
          providerRef.current.disconnect();
        }
      }, 100); // Small delay to ensure endCall cleanup completes first
    }
    
    console.log('Voice Provider: Call ended');
  }, [stopCallTimer]);

  /**
   * Send text message
   */
  const sendText = useCallback((text: string) => {
    if (providerRef.current && isConnected) {
      providerRef.current.sendText(text);
      addTranscript(text, 'user');
      syncTranscript(text, 'user', 'typed');
    }
  }, [isConnected, addTranscript, syncTranscript]);

  /**
   * Set conversation context
   */
  const setContext = useCallback((messages: Array<{ text: string; isUser: boolean }>) => {
    if (providerRef.current) {
      providerRef.current.setContext(messages);
    }
  }, []);

  /**
   * Get current provider capabilities
   */
  const getProviderCapabilities = useCallback(() => {
    if (!currentProvider) return null;
    return voiceProviderFactory.getProviderCapabilities(currentProvider);
  }, [currentProvider]);

  /**
   * Get all supported providers
   */
  const getSupportedProviders = useCallback(() => {
    return voiceProviderFactory.getSupportedProviders();
  }, []);

  return {
    // State
    isConnected,
    isConnecting,
    isCallActive,
    error,
    transcripts,
    currentTranscript,
    currentProvider,
    
    // Actions
    connect,
    disconnect,
    startCall,
    endCall,
    sendText,
    setContext,
    switchProvider,
    
    // Provider info
    getProviderCapabilities,
    getSupportedProviders,
    
    // Metrics
    callDuration,
    connectionQuality
  };
}