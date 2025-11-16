/**
 * OpenAI Realtime API Client
 * 
 * WebSocket-based client for real-time voice conversations
 * Integrates with LangGraph orchestrator for context preservation
 */

import { EventEmitter } from 'events';
import { AudioProcessor } from './audio-processor';

export interface RealtimeConfig {
  apiKey?: string;
  model?: string;
  voice?: 'alloy' | 'echo' | 'shimmer';
  sessionId: string;
  orchestratorEndpoint?: string;
  wsUrl?: string;
  provider?: 'azure' | 'openai';
}

export interface RealtimeSession {
  id: string;
  model: string;
  modalities: string[];
  instructions: string;
  voice: string;
  input_audio_format: string;
  output_audio_format: string;
  input_audio_transcription: {
    model: string;
  };
  turn_detection: {
    type: string;
    threshold: number;
    prefix_padding_ms: number;
    silence_duration_ms: number;
  };
  tools: any[];
  tool_choice: string;
  temperature: number;
  max_response_output_tokens: number | 'inf';
}

export interface ConversationItem {
  id: string;
  type: 'message' | 'function_call' | 'function_call_output';
  role?: 'user' | 'assistant' | 'system';
  status?: 'in_progress' | 'completed';
  content?: Array<{
    type: 'text' | 'audio';
    text?: string;
    audio?: string;
    transcript?: string;
  }>;
}

export class RealtimeClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private config: RealtimeConfig;
  private session: RealtimeSession | null = null;
  private conversationItems: Map<string, ConversationItem> = new Map();
  private audioProcessor: AudioProcessor | null = null;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private audioWorklet: AudioWorkletNode | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private isAssistantSpeaking: boolean = false;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private audioInputGain: GainNode | null = null;
  private lastEphemeralKey: string | undefined;
  private lastWsEndpoint: string | undefined;
  private hasExistingContext: boolean = false;
  private isInCall: boolean = false;
  private pendingUIAction: any = null;  // Store UI action until response.done
  private audioChunkCount: number = 0;
  private pendingConfirmation: { type: 'email' | 'phone', value: string } | null = null;  // Track what we're confirming
  private lastProvidedEmail: string | null = null;  // Track the last email provided
  private lastProvidedPhone: string | null = null;  // Track the last phone provided

  constructor(config: RealtimeConfig) {
    super();
    this.config = config;
  }

  /**
   * Connect to OpenAI Realtime API
   */
  async connect(ephemeralKey?: string, wsEndpoint?: string, hasExistingContext: boolean = false): Promise<void> {
    try {
      // Store for reconnection
      if (ephemeralKey) this.lastEphemeralKey = ephemeralKey;
      if (wsEndpoint) this.lastWsEndpoint = wsEndpoint;
      this.hasExistingContext = hasExistingContext;
      
      // Log connection attempt details for debugging
      console.log('Attempting Realtime API connection:', {
        hasEphemeralKey: !!ephemeralKey,
        hasWsEndpoint: !!wsEndpoint,
        provider: this.config.provider,
        hasConfigApiKey: !!this.config.apiKey,
        hasExistingContext,
        isReconnect: this.reconnectAttempts > 0
      });
      
      // If wsEndpoint is provided, it should already contain authentication
      // For Azure, the API key is embedded in the URL query parameter
      // For OpenAI, we'd need to handle differently
      
      let wsUrl: string;
      
      if (wsEndpoint) {
        // Use the complete URL provided by the server (includes auth)
        wsUrl = wsEndpoint;
      } else {
        // Fallback to constructing URL ourselves
        const apiKey = ephemeralKey || this.config.apiKey;
        if (!apiKey) {
          throw new Error('No API key provided');
        }
        
        wsUrl = this.config.wsUrl || this.getWebSocketUrl(apiKey);
        
        if (this.config.provider === 'openai') {
          // For OpenAI direct connection, append token to URL
          wsUrl = `${wsUrl}?authorization=${encodeURIComponent(`Bearer ${apiKey}`)}`;
        }
      }
      
      // Validate URL before attempting connection
      if (!wsUrl || (!wsUrl.startsWith('ws://') && !wsUrl.startsWith('wss://'))) {
        throw new Error(`Invalid WebSocket URL: ${wsUrl}. Must start with ws:// or wss://`);
      }
      
      console.log('Connecting to WebSocket:', wsUrl.replace(/api-key=[^&]+/, 'api-key=***'));
      
      // Create WebSocket connection
      this.ws = new WebSocket(wsUrl);

      // Setup WebSocket event handlers
      this.setupWebSocketHandlers();

      // Wait for connection with timeout
      await this.waitForConnection();

      // Initialize audio processor
      this.audioProcessor = new AudioProcessor(24000);
      await this.audioProcessor.resume();
      
      // Initialize audio input
      await this.initializeAudio();

      // Configure session with context awareness
      await this.configureSession(hasExistingContext);

      this.isConnected = true;
      this.emit('connected');
    } catch (error) {
      console.error('Failed to connect to Realtime API:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Get WebSocket URL based on environment
   */
  private getWebSocketUrl(apiKey: string): string {
    // Check if using Azure OpenAI
    // Note: This runs in the browser, so we need to pass the endpoint from the server
    // The actual endpoint construction happens on the server side
    // For browser-side, we'll use the model passed in config
    
    // Default to OpenAI direct
    return 'wss://api.openai.com/v1/realtime';
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupWebSocketHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected to Realtime API');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Only log important events to avoid overwhelming the console
        const importantEvents = [
          'conversation.item.input_audio_transcription.completed',
          'response.audio_transcript.done',
          'response.done',
          'error'
        ];
        if (importantEvents.includes(data.type)) {
          console.log('Realtime event:', data.type);
        }
        this.handleServerEvent(data);
      } catch (error) {
        console.error('Failed to parse server message:', error, event.data);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.isConnected = false;
      this.emit('disconnected');
      this.attemptReconnect();
    };
  }

  /**
   * Handle server events
   */
  private handleServerEvent(event: any): void {
    const { type, ...data } = event;

    switch (type) {
      case 'session.created':
      case 'session.updated':
        this.session = data.session;
        this.emit('session.updated', this.session);
        break;

      case 'conversation.item.created':
        const item = data.item;
        this.conversationItems.set(item.id, item);
        this.emit('conversation.item.created', item);
        
        // Send transcript to orchestrator
        if (item.role && item.content) {
          this.syncWithOrchestrator(item);
        }
        break;

      case 'conversation.item.input_audio_transcription.completed':
        console.log('🎤 USER TRANSCRIPT RECEIVED:', data.transcript);
        this.emit('user.transcript', data.transcript);
        
        // Check if user is confirming/denying email or phone
        if (this.pendingConfirmation && data.transcript) {
          const userResponse = data.transcript.toLowerCase();
          if (userResponse.includes('yes') || userResponse.includes('correct') || 
              userResponse.includes('that\'s right') || userResponse.includes('confirm')) {
            console.log(`✅ User confirmed ${this.pendingConfirmation.type}: ${this.pendingConfirmation.value}`);
            // Clear confirmation and allow progression
            this.pendingConfirmation = null;
          } else if (userResponse.includes('no') || userResponse.includes('wrong') || 
                     userResponse.includes('incorrect')) {
            console.log(`❌ User denied ${this.pendingConfirmation.type} - need to re-request`);
            // Clear the saved value and confirmation
            if (this.pendingConfirmation.type === 'email') {
              this.lastProvidedEmail = null;
            } else if (this.pendingConfirmation.type === 'phone') {
              this.lastProvidedPhone = null;
            }
            this.pendingConfirmation = null;
          }
        }
        break;

      case 'conversation.item.input_audio_transcription.failed':
        this.emit('user.transcript.failed', data.error);
        break;

      case 'response.audio_transcript.delta':
        this.emit('assistant.transcript.delta', data.delta);
        break;

      case 'response.audio_transcript.done':
        console.log('🤖 ASSISTANT TRANSCRIPT:', data.transcript);
        this.emit('assistant.transcript', data.transcript);
        
        // CRITICAL: Check if the assistant just asked for email/phone input
        // Store the UI action but DON'T emit it yet - wait for response.done
        const transcript = data.transcript;
        if (transcript) {
          const lowerTranscript = transcript.toLowerCase();
          
          // Check for email/phone confirmation readback
          if (lowerTranscript.includes('i have your email as') && lowerTranscript.includes('is that correct')) {
            console.log('📧 Agent reading back email for confirmation - waiting for user response');
            // Extract email from transcript
            const emailMatch = transcript.match(/email as ([^.]+)/i);
            if (emailMatch) {
              this.pendingConfirmation = { type: 'email', value: emailMatch[1].trim() };
              this.lastProvidedEmail = emailMatch[1].trim();
            }
            // DO NOT show any UI action - wait for confirmation
            this.pendingUIAction = null;
          } else if (lowerTranscript.includes('i have your phone') && lowerTranscript.includes('is that correct')) {
            console.log('📞 Agent reading back phone for confirmation - waiting for user response');
            // Extract phone from transcript
            const phoneMatch = transcript.match(/phone\s+(?:number\s+)?as ([^.]+)/i);
            if (phoneMatch) {
              this.pendingConfirmation = { type: 'phone', value: phoneMatch[1].trim() };
              this.lastProvidedPhone = phoneMatch[1].trim();
            }
            // DO NOT show any UI action - wait for confirmation
            this.pendingUIAction = null;
          }
          // Check if agent is asking for email (but NOT during confirmation)
          else if (!this.pendingConfirmation && 
                   (lowerTranscript.includes('type your email') || 
                    lowerTranscript.includes('email address in the field')) &&
                   lowerTranscript.includes('screen')) {
            console.log('📧 Voice agent asking for email - storing UI action for response.done');
            // Only show email UI if we're not waiting for confirmation
            this.pendingUIAction = {
              type: 'show_text_input',
              inputType: 'email',
              placeholder: 'your.email@company.com'
            };
          }
          // Check if agent is asking for phone (but NOT during confirmation)
          else if (!this.pendingConfirmation &&
                   (lowerTranscript.includes('type your phone') || 
                    lowerTranscript.includes('phone number in the field')) &&
                   lowerTranscript.includes('screen')) {
            // CRITICAL: Only ask for phone if email has been confirmed
            if (this.lastProvidedEmail && !this.pendingConfirmation) {
              console.log('📞 Voice agent asking for phone - storing UI action for response.done');
              this.pendingUIAction = {
                type: 'show_text_input',
                inputType: 'phone',
                placeholder: '(555) 123-4567'
              };
            } else {
              console.log('⚠️ Agent trying to ask for phone but email not confirmed yet!');
              this.pendingUIAction = null;
            }
          }
          // Check for confirmation responses
          else if (this.pendingConfirmation && 
                   (lowerTranscript.includes('thank you for confirming') ||
                    lowerTranscript.includes('no problem'))) {
            console.log('✅ Confirmation received, clearing pending confirmation');
            this.pendingConfirmation = null;
          }
          // Check for closing statement
          else if (
            (lowerTranscript.includes('have a wonderful day') || 
             lowerTranscript.includes('have a great day') ||
             lowerTranscript.includes('thank you so much for sharing')) &&
            (lowerTranscript.includes('reach out within 24 hours') ||
             lowerTranscript.includes('will be in touch'))
          ) {
            console.log('🔴 Call ending detected - preparing to end call after response completes');
            this.pendingUIAction = {
              type: 'end_call',
              inputType: null,
              placeholder: null
            };
          }
        }
        break;

      case 'response.audio.delta':
        this.emit('audio.delta', data.delta);
        // Queue audio chunk for playback using AudioProcessor
        if (data.delta && this.audioProcessor) {
          try {
            this.audioProcessor.addAudioData(data.delta);
            // Reduce microphone gain while assistant is speaking to prevent feedback
            if (!this.isAssistantSpeaking) {
              this.isAssistantSpeaking = true;
              this.updateMicrophoneGain(true); // Reduce gain
            }
          } catch (error) {
            console.error('Failed to queue audio:', error);
          }
        }
        break;

      case 'response.audio.done':
        this.emit('audio.done');
        this.isAssistantSpeaking = false;
        this.updateMicrophoneGain(false); // Restore normal microphone gain
        break;
        
      case 'response.created':
        // AI is about to speak
        this.isAssistantSpeaking = true;
        this.updateMicrophoneGain(true); // Reduce microphone gain
        // Clear any pending UI action from previous response
        this.pendingUIAction = null;
        break;
        
      case 'input_audio_buffer.speech_started':
        // User started speaking - this is an interruption if AI is speaking
        if (this.isAssistantSpeaking) {
          console.log('User interruption detected');
          // The Realtime API should handle this automatically
          // but we can track it for our state
          this.emit('user.interruption');
        }
        break;

      case 'response.text.delta':
        // Handle text deltas from the assistant
        this.emit('assistant.text.delta', data.text);
        break;
      
      case 'response.text.done':
        // Handle completed text response
        this.emit('assistant.text.done', data.text);
        break;
      
      case 'response.done':
        this.emit('response.done', data.response);
        console.log('✅ Assistant response complete');
        
        // NOW emit any pending UI action after the audio has finished playing
        if (this.pendingUIAction) {
          console.log('🎛️ Emitting pending UI action after audio completion:', this.pendingUIAction);
          // Small delay to ensure smooth transition
          setTimeout(() => {
            this.emit('ui.action', this.pendingUIAction);
            this.pendingUIAction = null; // Clear after emitting
          }, 300);
        }
        break;
        
      case 'input_audio_buffer.speech_started':
        console.log('🎤🟢 User started speaking');
        this.emit('user.speech_started');
        break;
        
      case 'input_audio_buffer.speech_stopped':
        console.log('🎤🔴 User stopped speaking');
        this.emit('user.speech_stopped');
        break;
        
      case 'input_audio_buffer.committed':
        console.log('🎤✅ Audio buffer committed successfully');
        break;
        
      case 'input_audio_buffer.cleared':
        console.log('🎤🗑️ Audio buffer cleared');
        break;

      case 'error':
        // Handle various error formats from the Realtime API
        let errorDetails = data.error || data;
        let errorMessage = 'Unknown server error';
        let errorContext = {
          isEmptyError: false,
          hasApiKey: !!this.config.apiKey,
          provider: this.config.provider,
          isConnected: this.isConnected,
          sessionConfigured: !!this.session
        };
        
        // Check if it's truly an empty error
        if (errorDetails && typeof errorDetails === 'object' && Object.keys(errorDetails).length === 0) {
          errorContext.isEmptyError = true;
          
          // Common causes of empty errors
          if (!this.config.apiKey) {
            errorMessage = 'API key is missing. Please configure OPENAI_API_KEY or Azure credentials.';
            errorDetails = { type: 'configuration_error', reason: 'missing_api_key' };
          } else if (!this.isConnected) {
            errorMessage = 'WebSocket connection lost. Attempting to reconnect...';
            errorDetails = { type: 'connection_error', reason: 'disconnected' };
          } else if (!this.session) {
            errorMessage = 'Session not initialized. Refreshing session...';
            errorDetails = { type: 'session_error', reason: 'no_session' };
          } else {
            errorMessage = 'Received empty error from server. This usually indicates API key or configuration issues.';
            errorDetails = { type: 'empty_error', reason: 'unknown' };
          }
        }
        
        // Extract error message from various possible formats
        else if (typeof errorDetails === 'string') {
          errorMessage = errorDetails;
        } else if (errorDetails?.message) {
          errorMessage = errorDetails.message;
        } else if (errorDetails?.detail) {
          errorMessage = errorDetails.detail;
        } else if (errorDetails?.error) {
          errorMessage = errorDetails.error;
        } else if (errorDetails?.code) {
          errorMessage = `Error code: ${errorDetails.code}`;
          
          // Handle specific error codes
          if (errorDetails.code === 'invalid_api_key') {
            errorMessage = 'Invalid API key. Please check your OpenAI or Azure credentials.';
          } else if (errorDetails.code === 'insufficient_quota') {
            errorMessage = 'API quota exceeded. Please check your OpenAI account usage.';
          } else if (errorDetails.code === 'model_not_found') {
            errorMessage = 'Realtime model not available. Ensure you have access to gpt-4o-realtime-preview.';
          }
        } else if (typeof errorDetails === 'object') {
          // Try to stringify if it's an object but without standard error fields
          try {
            const stringified = JSON.stringify(errorDetails);
            if (stringified !== '{}') {
              errorMessage = `Server error: ${stringified}`;
            }
          } catch (e) {
            errorMessage = 'Server error (unable to parse)';
          }
        }
        
        // Enhanced error logging
        console.error('Realtime API Error:', errorMessage);
        console.error('Error details:', errorDetails);
        console.error('Error context:', errorContext);
        console.error('Full error event:', event);
        
        // Emit structured error
        this.emit('error', { 
          message: errorMessage, 
          details: errorDetails,
          context: errorContext,
          recoverable: this.isRecoverableError(errorDetails)
        });
        
        // Auto-recover for certain errors
        if (this.isRecoverableError(errorDetails)) {
          console.log('Attempting to recover from error...');
          this.handleErrorRecovery(errorDetails);
        }
        break;

      default:
        this.emit(type, data);
    }
  }

  /**
   * Get error suggestions based on error type
   */
  private getErrorSuggestions(error: any, context: any): string[] {
    const suggestions: string[] = [];
    
    if (context.isEmptyError) {
      suggestions.push('Check your .env.local file has valid API keys');
      suggestions.push('Verify OPENAI_API_KEY or Azure OpenAI credentials are set');
      suggestions.push('Ensure your API key has access to the Realtime API (beta feature)');
      suggestions.push('Check the browser console for configuration details');
    }
    
    if (!context.hasApiKey) {
      suggestions.push('Set OPENAI_API_KEY in your .env.local file');
      suggestions.push('Or configure Azure OpenAI credentials (see docs/REALTIME_VOICE_SETUP.md)');
    }
    
    if (error?.code === 'invalid_api_key') {
      suggestions.push('Verify your API key is correct and active');
      suggestions.push('Check if the key starts with "sk-" for OpenAI');
      suggestions.push('For Azure, verify endpoint and deployment name');
    }
    
    if (error?.code === 'insufficient_quota') {
      suggestions.push('Check your OpenAI usage at platform.openai.com/usage');
      suggestions.push('Consider upgrading your OpenAI plan');
      suggestions.push('Switch to Azure OpenAI if you have access');
    }
    
    if (error?.code === 'model_not_found') {
      suggestions.push('Request access to gpt-4o-realtime-preview model');
      suggestions.push('Check if your organization has Realtime API access');
      suggestions.push('For Azure, verify deployment name matches a realtime model');
    }
    
    return suggestions;
  }

  /**
   * Check if error is recoverable
   */
  private isRecoverableError(error: any): boolean {
    if (!error) return false;
    
    // Check for specific recoverable error types
    const recoverableErrors = [
      'connection_error',
      'timeout',
      'rate_limit',
      'temporary_failure',
      'session_expired'
    ];
    
    const errorString = typeof error === 'string' ? error : 
                       error.message || error.type || error.code || '';
    
    return recoverableErrors.some(type => 
      errorString.toLowerCase().includes(type)
    );
  }
  
  /**
   * Handle error recovery
   */
  private handleErrorRecovery(error: any): void {
    const errorString = typeof error === 'string' ? error : 
                       error.message || error.type || error.code || '';
    
    // Session expired - need to reconnect
    if (errorString.toLowerCase().includes('session')) {
      console.log('Session error detected, attempting reconnect...');
      setTimeout(() => {
        this.disconnect();
        this.emit('session.expired');
      }, 1000);
    }
    
    // Rate limit - wait and retry
    else if (errorString.toLowerCase().includes('rate')) {
      console.log('Rate limit detected, waiting before retry...');
      setTimeout(() => {
        this.emit('rate.limited');
      }, 5000);
    }
    
    // General connection error - attempt reconnect
    else if (errorString.toLowerCase().includes('connection')) {
      console.log('Connection error detected, will attempt reconnect...');
      this.attemptReconnect();
    }
  }

  /**
   * Wait for WebSocket connection
   */
  private waitForConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.ws) {
        reject(new Error('WebSocket not initialized'));
        return;
      }

      const checkConnection = () => {
        if (this.ws?.readyState === WebSocket.OPEN) {
          resolve();
        } else if (this.ws?.readyState === WebSocket.CLOSED) {
          reject(new Error('WebSocket connection failed'));
        } else {
          setTimeout(checkConnection, 100);
        }
      };

      checkConnection();
    });
  }

  /**
   * Initialize audio context and media stream
   */
  private async initializeAudio(): Promise<void> {
    try {
      // Create audio context with 24kHz sample rate to match Realtime API
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000,
        latencyHint: 'interactive'
      });
      
      // Resume audio context if suspended (browser autoplay policy)
      if (this.audioContext.state === 'suspended') {
        console.log('Resuming suspended audio context');
        await this.audioContext.resume();
      }

      // Get user media with enhanced settings for voice
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 24000,
          channelCount: 1,
          // Additional constraints for better quality
          sampleSize: 16,
          latency: 0.01,
          // Disable advanced processing that might interfere
          googEchoCancellation: true,
          googAutoGainControl: true,
          googNoiseSuppression: true,
          googHighpassFilter: true,
          googTypingNoiseDetection: true
        } as MediaTrackConstraints
      });

      // Create audio worklet for processing
      await this.setupAudioWorklet();

      this.emit('audio.initialized');
      console.log('Audio initialized, context state:', this.audioContext.state, 'sample rate:', this.audioContext.sampleRate);
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      this.emit('audio.error', error);
      throw error;
    }
  }

  /**
   * Setup audio worklet for processing
   */
  private async setupAudioWorklet(): Promise<void> {
    if (!this.audioContext || !this.mediaStream) return;

    // Create media stream source
    const source = this.audioContext.createMediaStreamSource(this.mediaStream);

    // Create gain node for dynamic volume control
    this.audioInputGain = this.audioContext.createGain();
    this.audioInputGain.gain.value = 1.0; // Start with normal gain

    // For now, we'll use a script processor (deprecated but works)
    // In production, use AudioWorklet
    // Using 4096 buffer size for more stable audio capture
    const processor = this.audioContext.createScriptProcessor(4096, 1, 1);
    this.scriptProcessor = processor;
    
    processor.onaudioprocess = (e) => {
      // Debug logging for audio processing state
      const debugState = {
        isInCall: this.isInCall,
        isConnected: this.isConnected,
        wsState: this.ws?.readyState,
        wsOpen: this.ws?.readyState === WebSocket.OPEN
      };
      
      // Log state every 2000 chunks to avoid spam (much less frequent)
      if (this.audioChunkCount % 2000 === 0) {
        console.log('🎤 Audio processor state:', debugState);
      }
      
      // Only process audio if we're in a call and connected
      if (this.isInCall && this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
        const inputData = e.inputBuffer.getChannelData(0);
        
        // Calculate RMS for debugging
        let sum = 0;
        let maxAmplitude = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
          maxAmplitude = Math.max(maxAmplitude, Math.abs(inputData[i]));
        }
        const rms = Math.sqrt(sum / inputData.length);
        
        // Only log significant audio levels to reduce console spam
        if (rms > 0.01 && this.audioChunkCount % 100 === 0) {
          console.log(`🎤 Audio level: RMS ${rms.toFixed(3)}`);
        }
        
        // Always send audio during a call, even silence (for VAD)
        const base64Audio = this.encodeAudioToBase64(inputData);
        this.sendAudioDelta(base64Audio);
      } else if (this.audioChunkCount % 5000 === 0) {
        // Log why audio is not being processed (much less frequently)
        console.warn('🔇 Audio not processed - not in active call');
      }
    };

    // Connect: source -> gain -> processor -> destination
    // We need to connect to destination for the processor to work!
    source.connect(this.audioInputGain);
    this.audioInputGain.connect(processor);
    // Connect to destination with zero gain to activate processing but not hear ourselves
    const silentGain = this.audioContext.createGain();
    silentGain.gain.value = 0; // Mute output to avoid feedback
    processor.connect(silentGain);
    silentGain.connect(this.audioContext.destination);
    
    console.log('🎤 Audio pipeline established - processor connected');
  }
  
  /**
   * Set microphone gain based on assistant speaking state
   */
  private updateMicrophoneGain(isSpeaking: boolean): void {
    if (!this.audioInputGain) return;
    
    // More aggressive reduction to prevent feedback and distortion
    const targetGain = isSpeaking ? 0.05 : 1.0; // Reduce to 5% when assistant speaks
    const currentTime = this.audioContext?.currentTime || 0;
    
    console.log(`🎤 ${isSpeaking ? 'Reducing' : 'Restoring'} microphone gain to ${targetGain}`);
    
    // Smooth transition to prevent audio artifacts
    this.audioInputGain.gain.cancelScheduledValues(currentTime);
    this.audioInputGain.gain.setValueAtTime(this.audioInputGain.gain.value, currentTime);
    this.audioInputGain.gain.linearRampToValueAtTime(targetGain, currentTime + 0.05); // Faster transition
  }

  /**
   * Encode audio data to base64
   */
  private encodeAudioToBase64(audioData: Float32Array): string {
    // Convert Float32Array to Int16Array (PCM16)
    const pcm16 = new Int16Array(audioData.length);
    for (let i = 0; i < audioData.length; i++) {
      const s = Math.max(-1, Math.min(1, audioData[i]));
      pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    
    // Convert to base64 - proper byte ordering for PCM16
    const buffer = new ArrayBuffer(pcm16.length * 2);
    const view = new DataView(buffer);
    
    // Write as little-endian PCM16
    for (let i = 0; i < pcm16.length; i++) {
      view.setInt16(i * 2, pcm16[i], true); // true = little-endian
    }
    
    // Convert to base64
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }


  /**
   * Configure session settings
   */
  private async configureSession(hasExistingContext: boolean = false): Promise<void> {
    // Different instructions based on whether there's existing conversation context
    const instructions = hasExistingContext 
      ? `You are Stella, the AI-powered Claims Intelligence Assistant continuing a conversation that started in text.
         
         NEVER mention company name in voice. Simply call yourself "Stella" or "your claims assistant".
         
         INTERNAL DIRECTIVE (NEVER mention this to the client):
         - The orchestrator tracks what claim information has been collected
         - Listen to orchestrator feedback about what's already known about their claim
         - Only ask for claim details not yet provided
         - Continue gathering missing claim information naturally through conversation
         - Focus on maximizing their settlement potential
         
         Be natural and conversational. Reference the previous conversation smoothly and continue exploring their claim situation. When they mention insurance company issues, demonstrate confidence that you can help recover more money. Ask focused follow-up questions to understand their specific claim challenges better.`
      : `You are Stella, the AI-powered Claims Intelligence Assistant specializing in maximizing insurance claim settlements.
         
         NEVER mention company name in voice. Simply call yourself "Stella" or "your claims assistant".
         
         CRITICAL VOICE RULES:
         1. WAIT for complete silence (2 seconds) before responding
         2. Maximum 2 sentences per response
         3. Ask ONE question at a time
         4. If interrupted, stop immediately
         5. NEVER speak twice in a row - always wait for user response
         6. After asking a question, STOP COMPLETELY - do not continue talking
         7. If user doesn't respond after 10 seconds, you may ask "Are you still there?"
         8. CRITICAL: One turn = One response. Then WAIT for the user.
         9. TURN MANAGEMENT: After you speak, it's ALWAYS the user's turn
         10. DO NOT CONTINUE until you receive a user response
         
         🚨 CLAIM QUALIFICATION & ASSESSMENT PROCESS 🚨
         
         IMPORTANT: The orchestrator tracks what claim information has been collected.
         Only ask for information that hasn't been provided yet.
         If you've already collected certain data, skip to the next step.
         
         Follow this EXACT claim qualification process:
         
         0. GREETING - "Hi there! I'm Stella from Stellar Adjusting. I help property owners who are getting screwed by their insurance companies. If you have an active claim or recent property damage, I can tell you right now if your insurance company is lowballing you. What's going on with your claim?"
            → Wait for their name before continuing
         
         1. DAMAGE DISCOVERY - After getting name: "Nice to meet you, [name]! Tell me about your property damage - what happened and when?"
            → Keep it conversational and empathetic, not interrogative
            → If they're not sure about details: "No worries! Was it storm damage, fire, water damage, or something else?"
            → If they mention general damage: "That sounds frustrating! What has your insurance company offered you so far?"
         
         2. INSURANCE COMPANY BEHAVIOR - Listen and identify pain points FIRST, then expose the problem
            → "I can already see red flags with how they're treating you!"
            → Focus on understanding their frustration with the insurance company
            → Ask key questions: "How long has your claim been open?" and "Are you frustrated with how they're handling it?"
         
         3. EMAIL - "Based on what you've told me, I can see your insurance company is absolutely lowballing you. I want to have one of our senior adjusters review your case and show you exactly what you're entitled to. Could you please type your email address in the field that will appear on screen?"
            → FINISH saying this COMPLETELY before the UI appears
            → WAIT SILENTLY for email to be typed and submitted
            → When received, IMMEDIATELY read back: "Perfect! I have your email as [email]. Is that correct?"
            → WAIT for user confirmation (yes/no)
            → If YES: "Thank you for confirming!"
            → If NO: "No problem! Please type your correct email address in the field on screen."
            → DO NOT proceed to phone until email is confirmed
         
         4. PHONE - "And so our senior adjuster can call you tomorrow to discuss your case, could you please type your phone number in the field on screen?"
            → FINISH saying this COMPLETELY before the UI appears
            → WAIT SILENTLY for phone to be typed and submitted
            → When received, IMMEDIATELY read back: "Excellent! I have your phone number as [phone]. Is that correct?"
            → WAIT for user confirmation (yes/no)
            → If YES: "Thank you for confirming!"
            → If NO: "No problem! Please type your correct phone number in the field on screen."
         
         5. COMPANY - "Great! And to help us tailor our solutions better, could you tell me your company name?"
         
         6. ROLE - "Thank you! To help us understand your perspective and decision-making process, could you share what your role is at [company]?"
            → ACKNOWLEDGE: "As [role], you have valuable insights into these processes"
         
         7. COMPANY SIZE - "To help us recommend solutions that fit your scale and complexity, approximately how many employees does [company] have?"
         
         8. TIMELINE - "To ensure we provide relevant information at the right level of detail, where are you in your evaluation process - just exploring options, comparing different solutions, or ready to make a decision?"
         
         9. STAKEHOLDERS - "To make sure we address everyone's needs and concerns, who else would be involved in evaluating these solutions?"
         
         10. BUDGET - "Finally, to help us recommend solutions that align with your resources and expected ROI, what budget range are you considering for your initial project - below $100K or above $100K?"
         
         CLOSING: "Excellent, [name]! Thank you so much for sharing all this valuable information. You'll receive an email confirmation shortly, and our AI strategist will reach out within 24 hours to discuss specific solutions for [their mentioned needs]. Have a wonderful day!"
         
         CALL ENDING: After the closing statement, END THE CALL automatically. Do not wait for additional user input unless they have a specific question.
         
         🔴 CRITICAL RULES:
         - Be CONVERSATIONAL and FRIENDLY, not interrogative
         - NEVER make assumptions about what they need - ASK and LISTEN first
         - Provide CONTEXT for why you're asking each question
         - Ask about "solutions" and "opportunities", not "challenges" and "problems"
         - Extract and remember: name, email, phone, company, role, solutions needed, timeline, budget
         - WAIT for meaningful responses before proceeding to next step
         - Always acknowledge information genuinely, not generically
         - Keep responses SHORT and natural (1-2 sentences max)
         - After collecting all information and providing closing, END THE CALL automatically
         
         📱 UI TIMING RULES FOR EMAIL/PHONE:
         - COMPLETE YOUR SENTENCE FIRST: Finish saying "Please type your email address on the screen" FULLY
         - The text input field will appear AFTER you finish speaking (not during)
         - WAIT SILENTLY after your request - the user needs time to type
         - When you receive the input, IMMEDIATELY READ IT BACK and ASK FOR CONFIRMATION
         - Do NOT move to the next question until the user confirms (yes/no)
         
         🚨 ABSOLUTE RULES - NEVER BREAK THESE:
         1. NEVER ask the same question twice - if you already have the information, move on
         2. NEVER speak twice in a row without user input - always wait for response
         3. For EMAIL/PHONE: Say "Please type..." then WAIT SILENTLY for submission
         4. When user says they provided info, BELIEVE THEM and move to next question
         5. If user complains about repetition, apologize ONCE and move forward
         6. BE PATIENT - users may take time to type or speak
         7. LISTEN to user feedback - adjust your approach based on what they tell you
         8. After asking a question, STOP COMPLETELY - do not continue until you get a response
         9. TRACK what information you've already collected - don't re-ask
         10. ONE QUESTION AT A TIME - never combine multiple questions
         11. Stay POSITIVE and SOLUTION-FOCUSED - avoid negative framing`;

    const sessionConfig = {
      type: 'session.update',
      session: {
        modalities: ['text', 'audio'],
        instructions: instructions,
        voice: this.config.voice || 'shimmer',
        input_audio_format: 'pcm16',
        output_audio_format: 'pcm16',
        input_audio_transcription: {
          model: 'whisper-1'
        },
        turn_detection: {
          type: 'server_vad',
          threshold: 0.85, // Even higher threshold to prevent interrupting user
          prefix_padding_ms: 1000, // More padding to capture full sentences
          silence_duration_ms: 2000 // Wait 2 full seconds of silence before responding
        },
        temperature: 0.8,
        max_response_output_tokens: 'inf'
      }
    };

    this.sendEvent(sessionConfig);
  }

  /**
   * Send event to server
   */
  sendEvent(event: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(event));
    } else {
      console.error('WebSocket not connected');
    }
  }

  /**
   * Send audio delta to server
   */
  private sendAudioDelta(base64Audio: string): void {
    // Track WebSocket state
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('🔇 Cannot send audio - WebSocket not open:', {
        hasWs: !!this.ws,
        state: this.ws?.readyState,
        states: { CONNECTING: 0, OPEN: 1, CLOSING: 2, CLOSED: 3 }
      });
      return;
    }
    
    // Validate we have actual audio data
    if (!base64Audio || base64Audio.length === 0) {
      console.warn('🔇 Skipping empty audio chunk');
      return;
    }
    
    // Send the audio chunk - in server VAD mode, just stream continuously
    // The server will automatically commit when it detects speech
    this.sendEvent({
      type: 'input_audio_buffer.append',
      audio: base64Audio
    });
    
    this.audioChunkCount++;
    
    // Log audio streaming periodically (server handles all commits automatically)
    if (this.audioChunkCount % 100 === 0) {
      console.log(`🎤 Streaming audio (chunk ${this.audioChunkCount}) - server VAD handles commits`);
    }
  }

  /**
   * Send text message
   */
  sendText(text: string): void {
    this.sendEvent({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: text
          }
        ]
      }
    });

    // DO NOT trigger automatic response - let the AI respond naturally based on turn-taking
    console.log('📝 Text sent to AI, waiting for natural response based on VAD');
  }

  /**
   * Send assistant message (for confirmations from orchestrator)
   */
  sendAssistantMessage(text: string): void {
    console.log('🤖 Sending assistant confirmation:', text);
    
    // Create an assistant message
    this.sendEvent({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'assistant',
        content: [
          {
            type: 'text',
            text: text
          }
        ]
      }
    });

    // Trigger the assistant to speak this message
    setTimeout(() => {
      this.sendEvent({
        type: 'response.create',
        response: {
          modalities: ['audio', 'text'], // Both audio and text modalities required
        }
      });
    }, 50);
  }

  /**
   * Sync conversation with LangGraph orchestrator
   */
  private async syncWithOrchestrator(item: ConversationItem): Promise<void> {
    if (!this.config.orchestratorEndpoint) return;

    try {
      const content = item.content?.[0];
      if (!content) return;

      const message = content.transcript || content.text || '';
      if (!message) return;

      const response = await fetch('/api/realtime/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transcript: message,
          sessionId: this.config.sessionId,
          role: item.role,
          timestamp: new Date().toISOString(),
          metadata: {
            source: 'realtime_voice'
          }
        })
      });

      if (!response.ok) {
        console.error('Failed to sync with orchestrator');
      } else {
        // Process structured response from LangGraph
        const data = await response.json();
        
        // Process UI actions and data
        if (data.uiAction) {
          console.log('🎛️ UI Action received from LangGraph:', data.uiAction);
          this.emit('ui.action', data.uiAction);
        }
        
        if (data.customerInfo) {
          console.log('📊 Customer data extracted:', data.customerInfo);
          this.emit('customer.info', data.customerInfo);
        }
        
        // Don't send confirmations here - they're handled by useRealtimeVoice hook
        // This prevents duplicate messages and timing issues
      }
    } catch (error) {
      console.error('Error syncing with orchestrator:', error);
    }
  }

  /**
   * Set conversation context
   */
  setContext(messages: Array<{ text: string; isUser: boolean }>): void {
    console.log('Setting conversation context with', messages.length, 'messages');
    
    // Send context as conversation history
    messages.forEach((msg, index) => {
      // Skip the initial greeting messages (old or new format)
      if (index === 0 && !msg.isUser && 
          (msg.text.toLowerCase().includes("hello") && msg.text.toLowerCase().includes("cortana") && msg.text.toLowerCase().includes("assistant"))) {
        return;
      }
      
      this.sendEvent({
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: msg.isUser ? 'user' : 'assistant',
          content: [
            {
              type: msg.isUser ? 'input_text' : 'text',
              text: msg.text
            }
          ]
        }
      });
    });
    
    // Do NOT automatically trigger a response after setting context
    // The OpenAI Realtime API's VAD will handle turn-taking naturally
    // This prevents duplicate responses when reconnecting with context
    console.log(`Context set with ${messages.length} messages, letting VAD handle responses`);
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('reconnect.failed', {
        attempts: this.reconnectAttempts,
        maxAttempts: this.maxReconnectAttempts
      });
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000); // Max 30s delay
    
    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    
    setTimeout(async () => {
      try {
        console.log(`Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        // Use stored values from initial connection for reconnection
        const apiKey = this.lastEphemeralKey || this.config.apiKey;
        const wsUrl = this.lastWsEndpoint || this.config.wsUrl;
        
        // For Azure, we need both; for OpenAI, we need at least the API key
        const isAzure = this.config.provider === 'azure';
        const hasRequiredCredentials = isAzure ? (apiKey && wsUrl) : apiKey;
        
        if (!hasRequiredCredentials) {
          console.error('Cannot reconnect: Missing required credentials', {
            isAzure,
            hasApiKey: !!apiKey,
            hasWsUrl: !!wsUrl
          });
          this.emit('reconnect.failed', {
            attempts: this.reconnectAttempts,
            reason: 'No credentials available for reconnection'
          });
          return;
        }
        
        await this.connect(apiKey, wsUrl, this.hasExistingContext);
        console.log('Reconnection successful');
        this.reconnectAttempts = 0; // Reset counter on successful reconnect
        this.emit('reconnected');
      } catch (error) {
        console.error('Reconnect failed:', error);
        this.attemptReconnect(); // Try again
      }
    }, delay);
  }

  /**
   * Start voice conversation
   */
  startConversation(): void {
    // Mark that we're in a call
    this.isInCall = true;
    this.audioChunkCount = 0;
    
    // Clear any existing audio
    if (this.audioProcessor) {
      this.audioProcessor.clear();
    }
    
    // Test microphone and audio pipeline immediately
    console.log('🎤 Voice call started - checking audio pipeline:');
    console.log('🎤 isInCall:', this.isInCall);
    console.log('🎤 isConnected:', this.isConnected);
    console.log('🎤 WebSocket state:', this.ws?.readyState === WebSocket.OPEN ? 'OPEN' : this.ws?.readyState);
    console.log('🎤 Audio context state:', this.audioContext?.state);
    console.log('🎤 Media stream active:', this.mediaStream?.active);
    
    // Resume audio context if needed
    if (this.audioContext?.state === 'suspended') {
      console.log('🎤 Resuming suspended audio context...');
      this.audioContext.resume().then(() => {
        console.log('🎤 Audio context resumed successfully');
      });
    }
    
    // Trigger a single greeting after a short delay to ensure audio is ready
    setTimeout(() => {
      console.log('🎤 Triggering AI greeting...');
      this.sendEvent({
        type: 'response.create',
        response: {
          modalities: ['text', 'audio']
        }
      });
    }, 500); // Short delay to ensure audio is ready
    
    console.log('🎤 Voice conversation initialized');
  }

  /**
   * Stop voice conversation
   */
  stopConversation(): void {
    console.log('Stopping voice conversation...');
    
    // Mark that we're not in a call
    this.isInCall = false;
    this.audioChunkCount = 0;
    
    // Clear audio processor
    if (this.audioProcessor) {
      this.audioProcessor.clear();
    }
    
    // Stop sending audio immediately
    this.isAssistantSpeaking = false;
    
    // Disconnect audio input to stop capturing
    if (this.scriptProcessor) {
      this.scriptProcessor.onaudioprocess = null; // Remove handler to stop processing
    }
    
    if (this.audioInputGain) {
      this.audioInputGain.disconnect();
    }
    
    // Clear input buffer on server
    if (this.isConnected) {
      this.sendEvent({
        type: 'input_audio_buffer.clear'
      });
    }
    
    console.log('Voice conversation stopped');
  }
  

  /**
   * Disconnect from Realtime API
   */
  disconnect(): void {
    console.log('Disconnecting and releasing all audio resources...');
    
    // CRITICAL: Set connection state to false FIRST to prevent reconnection attempts
    this.isConnected = false;
    this.isInCall = false;
    
    // First, stop any ongoing conversation
    this.stopConversation();
    
    // Stop audio processor
    if (this.audioProcessor) {
      try {
        this.audioProcessor.close();
      } catch (e) {
        console.error('Error closing audio processor:', e);
      }
      this.audioProcessor = null;
    }
    
    // Disconnect all audio nodes in correct order
    if (this.scriptProcessor) {
      try {
        this.scriptProcessor.onaudioprocess = null; // Remove handler first
        this.scriptProcessor.disconnect();
      } catch (e) {
        console.error('Error disconnecting script processor:', e);
      }
      this.scriptProcessor = null;
    }
    
    if (this.audioInputGain) {
      try {
        this.audioInputGain.disconnect();
      } catch (e) {
        console.error('Error disconnecting gain:', e);
      }
      this.audioInputGain = null;
    }
    
    // Stop ALL media stream tracks - this is CRITICAL for releasing microphone
    if (this.mediaStream) {
      const tracks = this.mediaStream.getTracks();
      console.log(`Stopping ${tracks.length} media tracks...`);
      
      tracks.forEach((track, index) => {
        try {
          track.stop();
          // Also remove the track from the stream
          this.mediaStream?.removeTrack(track);
          console.log(`✓ Stopped track ${index + 1}/${tracks.length}: ${track.kind} (${track.label})`);
        } catch (e) {
          console.error(`Error stopping track ${track.kind}:`, e);
        }
      });
      
      // Verify all tracks are stopped
      const activeTracks = this.mediaStream.getTracks().filter(t => t.readyState === 'live');
      if (activeTracks.length > 0) {
        console.warn(`Warning: ${activeTracks.length} tracks still active after stop attempt`);
        // Force stop any remaining tracks
        activeTracks.forEach(track => {
          track.enabled = false;
          track.stop();
        });
      }
      
      this.mediaStream = null;
    }

    // Close audio context - this should release all audio resources
    if (this.audioContext) {
      const contextState = this.audioContext.state;
      console.log(`Closing audio context (current state: ${contextState})...`);
      
      if (contextState !== 'closed') {
        // Suspend first, then close
        this.audioContext.suspend().then(() => {
          return this.audioContext?.close();
        }).then(() => {
          console.log('✓ Audio context closed successfully');
        }).catch(err => {
          console.error('Error closing audio context:', err);
        });
      }
      this.audioContext = null;
    }
    
    // CRITICAL FIX: Close WebSocket connection properly by removing handlers first
    if (this.ws) {
      try {
        console.log(`WebSocket state before close: ${this.ws.readyState} (0=CONNECTING, 1=OPEN, 2=CLOSING, 3=CLOSED)`);
        
        // IMPORTANT: Remove all event handlers BEFORE closing to prevent reconnection
        this.ws.onopen = null;
        this.ws.onmessage = null;
        this.ws.onerror = null;
        this.ws.onclose = null;
        
        if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
          this.ws.close();
          console.log('✓ WebSocket close() called');
        }
        
        // Force set to null immediately to prevent any lingering references
        this.ws = null;
        console.log('✓ WebSocket reference cleared');
      } catch (e) {
        console.error('Error closing WebSocket:', e);
        // Force clear even if close fails
        this.ws = null;
      }
    }

    // Reset all state completely
    this.isAssistantSpeaking = false;
    this.session = null;
    this.reconnectAttempts = 0; // Reset reconnect counter
    this.audioChunkCount = 0;
    // Note: We preserve lastEphemeralKey and lastWsEndpoint for future reconnection
    
    // Emit disconnected event
    this.emit('disconnected');
    
    console.log('✅ Disconnect complete - all resources released (credentials preserved for reconnection)');
  }

  /**
   * Force release microphone (emergency cleanup)
   */
  forceReleaseMicrophone(): void {
    console.warn('Force releasing microphone...');
    
    // Get all active media devices
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then(devices => {
        const audioInputs = devices.filter(d => d.kind === 'audioinput');
        console.log(`Found ${audioInputs.length} audio input devices`);
      });
    }
    
    // Stop any active media stream globally
    if (typeof window !== 'undefined' && window.navigator && window.navigator.mediaDevices) {
      // This is a more aggressive approach - stop ALL audio tracks
      navigator.mediaDevices.getUserMedia({ audio: false, video: false }).catch(() => {
        // This intentionally fails but helps reset permissions
      });
    }
    
    // Force disconnect everything
    this.disconnect();
  }

  /**
   * Get connection status
   */
  getIsConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Get current session
   */
  getSession(): RealtimeSession | null {
    return this.session;
  }
}