/**
 * Voice Provider Interface
 * 
 * Standardized interface for voice service providers (OpenAI, Hume, etc.)
 * Enables easy switching between different voice AI providers
 */

import { EventEmitter } from 'events';

export type VoiceProvider = 'openai' | 'hume';

export interface VoiceConfig {
  provider: VoiceProvider;
  apiKey?: string;
  model?: string;
  voice?: string;
  sessionId: string;
  orchestratorEndpoint?: string;
  
  // Provider-specific config
  openai?: {
    voice?: 'alloy' | 'echo' | 'shimmer';
    model?: string;
    wsUrl?: string;
  };
  
  hume?: {
    configId?: string;
    configVersion?: string;
    voiceId?: string;
    resumedChatGroupId?: string;
    verboseTranscription?: boolean;
  };
}

export interface VoiceSession {
  id: string;
  model: string;
  voice: string;
  instructions: string;
  temperature: number;
  provider: VoiceProvider;
  
  // Standardized session properties
  modalities: string[];
  inputAudioFormat: string;
  outputAudioFormat: string;
  turnDetection: {
    type: string;
    threshold: number;
    silenceDurationMs: number;
  };
  
  // Provider-specific session data
  providerData?: any;
}

export interface VoiceMessage {
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
  
  // Provider-specific message data
  providerData?: any;
}

export interface VoiceTranscript {
  text: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  confidence?: number;
  interim?: boolean;
}

export interface VoiceMetrics {
  latency: number;
  quality: 'excellent' | 'good' | 'poor' | 'unknown';
  jitter: number;
  audioLoss: number;
}

export interface VoiceConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  isCallActive: boolean;
  isAssistantSpeaking: boolean;
  error: string | null;
}

export interface VoiceEvents {
  // Connection events
  'connected': () => void;
  'disconnected': () => void;
  'connecting': () => void;
  'connection_error': (error: Error) => void;
  'reconnecting': (attempt: number) => void;
  
  // Call events  
  'call_started': () => void;
  'call_ended': () => void;
  'call_error': (error: Error) => void;
  
  // Audio events
  'audio_start': () => void;
  'audio_end': () => void;
  'audio_chunk': (chunk: ArrayBuffer) => void;
  
  // Transcript events
  'transcript': (transcript: VoiceTranscript) => void;
  'interim_transcript': (text: string) => void;
  
  // Session events
  'session_created': (session: VoiceSession) => void;
  'session_updated': (session: VoiceSession) => void;
  
  // UI events
  'ui_action': (action: any) => void;
  
  // Metrics events
  'metrics_updated': (metrics: VoiceMetrics) => void;
}

export abstract class IVoiceProvider extends EventEmitter {
  protected config: VoiceConfig;
  protected session: VoiceSession | null = null;
  protected connectionState: VoiceConnectionState = {
    isConnected: false,
    isConnecting: false,
    isCallActive: false,
    isAssistantSpeaking: false,
    error: null
  };

  constructor(config: VoiceConfig) {
    super();
    this.config = config;
  }

  // Abstract methods that must be implemented by providers
  abstract connect(ephemeralKey?: string, wsEndpoint?: string, hasExistingContext?: boolean): Promise<void>;
  abstract disconnect(): void;
  abstract startCall(): Promise<void>;
  abstract endCall(): void;
  abstract sendText(text: string): void | Promise<void>;
  abstract sendAudio(audioData: ArrayBuffer): void;
  abstract configureSession(hasExistingContext: boolean): Promise<void>;
  
  // Context management
  abstract setContext(messages: Array<{ text: string; isUser: boolean }>): void;
  abstract updateInstructions(instructions: string): void;
  
  // State getters
  getConnectionState(): VoiceConnectionState {
    return { ...this.connectionState };
  }
  
  getSession(): VoiceSession | null {
    return this.session;
  }
  
  getConfig(): VoiceConfig {
    return { ...this.config };
  }
  
  // Provider information
  abstract getProviderName(): string;
  abstract getProviderVersion(): string;
  abstract getSupportedVoices(): string[];
  abstract getSupportedFeatures(): string[];
  
  // Utility methods
  protected updateConnectionState(updates: Partial<VoiceConnectionState>): void {
    this.connectionState = { ...this.connectionState, ...updates };
  }
  
  protected emitTranscript(transcript: VoiceTranscript): void {
    this.emit('transcript', transcript);
  }
  
  protected emitUIAction(action: any): void {
    this.emit('ui_action', action);
  }
  
  protected emitError(error: Error, type: 'connection' | 'call' = 'connection'): void {
    this.updateConnectionState({ error: error.message });
    this.emit(`${type}_error`, error);
  }
}

// Provider factory types
export interface ProviderConstructor {
  new (config: VoiceConfig): IVoiceProvider;
}

export interface ProviderRegistry {
  [key: string]: ProviderConstructor;
}