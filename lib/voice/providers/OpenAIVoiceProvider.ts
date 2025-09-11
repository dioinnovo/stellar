/**
 * OpenAI Voice Provider
 * 
 * Implementation of IVoiceProvider for OpenAI Realtime API
 * Refactored from the original RealtimeClient for provider abstraction
 */

import { IVoiceProvider, VoiceConfig, VoiceSession, VoiceMessage, VoiceTranscript } from './IVoiceProvider';
import { AudioProcessor } from '../../realtime/audio-processor';

interface OpenAIRealtimeSession {
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

interface OpenAIConversationItem {
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

export class OpenAIVoiceProvider extends IVoiceProvider {
  private ws: WebSocket | null = null;
  private openAISession: OpenAIRealtimeSession | null = null;
  private conversationItems: Map<string, OpenAIConversationItem> = new Map();
  private audioProcessor: AudioProcessor | null = null;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private audioInputGain: GainNode | null = null;
  private lastEphemeralKey: string | undefined;
  private lastWsEndpoint: string | undefined;
  private hasExistingContext: boolean = false;
  private pendingUIAction: any = null;
  private audioChunkCount: number = 0;
  private pendingConfirmation: { type: 'email' | 'phone', value: string } | null = null;
  private lastProvidedEmail: string | null = null;
  private lastProvidedPhone: string | null = null;
  
  // Reconnection state
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;

  constructor(config: VoiceConfig) {
    super(config);
  }

  getProviderName(): string {
    return 'OpenAI';
  }

  getProviderVersion(): string {
    return 'Realtime API v1';
  }

  getSupportedVoices(): string[] {
    return ['alloy', 'echo', 'shimmer'];
  }

  getSupportedFeatures(): string[] {
    return [
      'realtime_voice',
      'speech_to_text',
      'text_to_speech',
      'voice_activity_detection',
      'interruption_handling',
      'audio_streaming',
      'context_preservation'
    ];
  }

  async connect(ephemeralKey?: string, wsEndpoint?: string, hasExistingContext: boolean = false): Promise<void> {
    try {
      this.updateConnectionState({ isConnecting: true, error: null });
      
      // Store for reconnection
      if (ephemeralKey) this.lastEphemeralKey = ephemeralKey;
      if (wsEndpoint) this.lastWsEndpoint = wsEndpoint;
      this.hasExistingContext = hasExistingContext;
      
      console.log('OpenAI Provider: Attempting connection:', {
        hasEphemeralKey: !!ephemeralKey,
        hasWsEndpoint: !!wsEndpoint,
        hasExistingContext,
        isReconnect: this.reconnectAttempts > 0
      });
      
      let wsUrl: string;
      
      if (wsEndpoint) {
        wsUrl = wsEndpoint;
      } else {
        const apiKey = ephemeralKey || this.config.apiKey;
        if (!apiKey) {
          throw new Error('No API key provided');
        }
        
        wsUrl = this.config.openai?.wsUrl || 'wss://api.openai.com/v1/realtime';
        wsUrl = `${wsUrl}?authorization=${encodeURIComponent(`Bearer ${apiKey}`)}`;
      }
      
      if (!wsUrl || (!wsUrl.startsWith('ws://') && !wsUrl.startsWith('wss://'))) {
        throw new Error(`Invalid WebSocket URL: ${wsUrl}`);
      }
      
      console.log('OpenAI Provider: Connecting to WebSocket');
      this.ws = new WebSocket(wsUrl);
      this.setupWebSocketHandlers();
      await this.waitForConnection();

      // Initialize audio
      this.audioProcessor = new AudioProcessor(24000);
      await this.audioProcessor.resume();
      await this.initializeAudio();

      // Configure session
      await this.configureSession(hasExistingContext);

      this.updateConnectionState({ 
        isConnected: true, 
        isConnecting: false, 
        error: null 
      });
      
      this.emit('connected');
    } catch (error) {
      console.error('OpenAI Provider: Failed to connect:', error);
      this.updateConnectionState({ 
        isConnecting: false, 
        error: error instanceof Error ? error.message : 'Connection failed' 
      });
      this.emitError(error instanceof Error ? error : new Error('Connection failed'));
      throw error;
    }
  }

  disconnect(): void {
    console.log('OpenAI Provider: Disconnecting...');
    
    this.updateConnectionState({ 
      isConnected: false,
      isCallActive: false,
      isAssistantSpeaking: false 
    });
    
    this.endCall();
    this.cleanupAudioResources();
    this.cleanupWebSocket();
    
    this.emit('disconnected');
  }

  async startCall(): Promise<void> {
    if (!this.connectionState.isConnected) {
      throw new Error('Not connected to voice service');
    }

    console.log('OpenAI Provider: Starting call...');
    this.updateConnectionState({ isCallActive: true });
    this.audioChunkCount = 0;
    
    if (this.audioProcessor) {
      this.audioProcessor.clear();
    }
    
    // Resume audio context if needed
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
    
    // Trigger initial greeting
    setTimeout(() => {
      this.sendEvent({
        type: 'response.create',
        response: {
          modalities: ['text', 'audio']
        }
      });
    }, 500);
    
    this.emit('call_started');
  }

  endCall(): void {
    console.log('OpenAI Provider: Ending call...');
    
    this.updateConnectionState({ 
      isCallActive: false,
      isAssistantSpeaking: false 
    });
    
    this.audioChunkCount = 0;
    
    if (this.audioProcessor) {
      this.audioProcessor.clear();
    }
    
    // Stop audio processing
    if (this.scriptProcessor) {
      this.scriptProcessor.onaudioprocess = null;
    }
    
    // Clear input buffer
    if (this.connectionState.isConnected) {
      this.sendEvent({
        type: 'input_audio_buffer.clear'
      });
    }
    
    // CRITICAL: Clean up audio resources to release microphone
    this.cleanupAudioResources();
    
    this.emit('call_ended');
  }

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
    
    console.log('OpenAI Provider: Text sent, waiting for natural response');
  }

  sendAudio(audioData: ArrayBuffer): void {
    // Convert ArrayBuffer to Float32Array, then to base64
    const float32Array = new Float32Array(audioData);
    const base64Audio = this.encodeAudioToBase64(float32Array);
    this.sendAudioDelta(base64Audio);
  }

  async configureSession(hasExistingContext: boolean = false): Promise<void> {
    const openAIConfig = this.config.openai || {};
    
    // Different instructions based on context
    const instructions = hasExistingContext 
      ? this.getContinuingInstructions()
      : this.getFreshInstructions();

    const sessionConfig = {
      type: 'session.update',
      session: {
        modalities: ['text', 'audio'],
        instructions: instructions,
        voice: openAIConfig.voice || this.config.voice || 'alloy',
        input_audio_format: 'pcm16',
        output_audio_format: 'pcm16',
        input_audio_transcription: {
          model: 'whisper-1'
        },
        turn_detection: {
          type: 'server_vad',
          threshold: 0.85,
          prefix_padding_ms: 1000,
          silence_duration_ms: 2000
        },
        temperature: 0.8,
        max_response_output_tokens: 'inf'
      }
    };

    this.sendEvent(sessionConfig);
  }

  setContext(messages: Array<{ text: string; isUser: boolean }>): void {
    console.log('OpenAI Provider: Setting context with', messages.length, 'messages');
    
    messages.forEach((msg, index) => {
      // Skip initial greeting messages
      if (index === 0 && !msg.isUser && 
          (msg.text.toLowerCase().includes("hello") && 
           msg.text.toLowerCase().includes("assistant"))) {
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
  }

  updateInstructions(instructions: string): void {
    this.sendEvent({
      type: 'session.update',
      session: {
        instructions: instructions
      }
    });
  }

  // Private methods

  private setupWebSocketHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('OpenAI Provider: WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Add debugging for error events
        if (data.type === 'error') {
          console.warn('OpenAI Provider: Received error event:', data);
        }
        
        this.handleServerEvent(data);
      } catch (error) {
        console.error('OpenAI Provider: Failed to parse message:', error, 'Raw data:', event.data);
      }
    };

    this.ws.onerror = (error) => {
      console.error('OpenAI Provider: WebSocket error:', error);
      this.emitError(new Error('WebSocket error'));
    };

    this.ws.onclose = () => {
      console.log('OpenAI Provider: WebSocket disconnected');
      this.updateConnectionState({ isConnected: false });
      this.emit('disconnected');
      this.attemptReconnect();
    };
  }

  private handleServerEvent(event: any): void {
    const { type, ...data } = event;

    switch (type) {
      case 'session.created':
      case 'session.updated':
        this.openAISession = data.session;
        this.session = this.convertToStandardSession(data.session);
        this.emit('session_created', this.session);
        break;

      case 'conversation.item.created':
        const item = data.item;
        this.conversationItems.set(item.id, item);
        
        if (item.role && item.content) {
          this.syncWithOrchestrator(item);
        }
        break;

      case 'conversation.item.input_audio_transcription.completed':
        const transcript: VoiceTranscript = {
          text: data.transcript,
          role: 'user',
          timestamp: new Date(),
          confidence: 1.0
        };
        this.emitTranscript(transcript);
        this.handleConfirmationLogic(data.transcript);
        break;

      case 'response.audio_transcript.done':
        const assistantTranscript: VoiceTranscript = {
          text: data.transcript,
          role: 'assistant',
          timestamp: new Date(),
          confidence: 1.0
        };
        this.emitTranscript(assistantTranscript);
        this.handleUIActionDetection(data.transcript);
        break;

      case 'response.audio.delta':
        this.emit('audio_chunk', data.delta);
        if (data.delta && this.audioProcessor) {
          try {
            this.audioProcessor.addAudioData(data.delta);
            if (!this.connectionState.isAssistantSpeaking) {
              this.updateConnectionState({ isAssistantSpeaking: true });
              this.updateMicrophoneGain(true);
              this.emit('audio_start');
            }
          } catch (error) {
            console.error('OpenAI Provider: Failed to queue audio:', error);
          }
        }
        break;

      case 'response.audio.done':
        this.updateConnectionState({ isAssistantSpeaking: false });
        this.updateMicrophoneGain(false);
        this.emit('audio_end');
        break;

      case 'response.done':
        console.log('OpenAI Provider: Response completed');
        
        // Notify the sync API that speech has completed
        // This allows UI actions to be triggered after the agent finishes speaking
        this.notifySpeechCompleted();
        
        if (this.pendingUIAction) {
          setTimeout(() => {
            this.emitUIAction(this.pendingUIAction);
            this.pendingUIAction = null;
          }, 300);
        }
        break;

      case 'error':
        this.handleError(data);
        break;

      default:
        this.emit(type, data);
    }
  }

  private handleConfirmationLogic(transcript: string): void {
    if (this.pendingConfirmation && transcript) {
      const userResponse = transcript.toLowerCase();
      if (userResponse.includes('yes') || userResponse.includes('correct') || 
          userResponse.includes('that\'s right') || userResponse.includes('confirm')) {
        console.log(`✅ User confirmed ${this.pendingConfirmation.type}: ${this.pendingConfirmation.value}`);
        this.pendingConfirmation = null;
      } else if (userResponse.includes('no') || userResponse.includes('wrong') || 
                 userResponse.includes('incorrect')) {
        console.log(`❌ User denied ${this.pendingConfirmation.type} - need to re-request`);
        if (this.pendingConfirmation.type === 'email') {
          this.lastProvidedEmail = null;
        } else if (this.pendingConfirmation.type === 'phone') {
          this.lastProvidedPhone = null;
        }
        this.pendingConfirmation = null;
      }
    }
  }

  private async notifySpeechCompleted(): Promise<void> {
    // Send a notification to the sync API that speech has completed
    // This triggers any pending UI actions after the agent finishes speaking
    try {
      const sessionId = this.config.sessionId;
      if (!sessionId) return;
      
      await fetch('/api/realtime/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          role: 'assistant',
          transcript: '',  // Empty transcript, just signaling completion
          speechCompleted: true,
          timestamp: new Date().toISOString()
        })
      });
      
      console.log('📢 Notified sync API that speech has completed');
    } catch (error) {
      console.error('Failed to notify speech completion:', error);
    }
  }

  private handleUIActionDetection(transcript: string): void {
    if (!transcript) return;
    
    const lowerTranscript = transcript.toLowerCase();
    
    // Email confirmation readback
    if (lowerTranscript.includes('i have your email as') && lowerTranscript.includes('is that correct')) {
      const emailMatch = transcript.match(/email as ([^.]+)/i);
      if (emailMatch) {
        this.pendingConfirmation = { type: 'email', value: emailMatch[1].trim() };
        this.lastProvidedEmail = emailMatch[1].trim();
      }
      this.pendingUIAction = null;
    }
    // Phone confirmation readback
    else if (lowerTranscript.includes('i have your phone') && lowerTranscript.includes('is that correct')) {
      const phoneMatch = transcript.match(/phone\s+(?:number\s+)?as ([^.]+)/i);
      if (phoneMatch) {
        this.pendingConfirmation = { type: 'phone', value: phoneMatch[1].trim() };
        this.lastProvidedPhone = phoneMatch[1].trim();
      }
      this.pendingUIAction = null;
    }
    // Request for email input
    else if (!this.pendingConfirmation && 
             (lowerTranscript.includes('type your email') || 
              lowerTranscript.includes('email address in the field')) &&
             lowerTranscript.includes('screen')) {
      this.pendingUIAction = {
        type: 'show_text_input',
        inputType: 'email',
        placeholder: 'your.email@company.com'
      };
    }
    // Request for phone input - improved pattern matching
    else if (!this.pendingConfirmation &&
             (lowerTranscript.includes('type') && lowerTranscript.includes('phone') ||
              lowerTranscript.includes('phone number') && lowerTranscript.includes('field')) &&
             lowerTranscript.includes('screen')) {
      if (this.lastProvidedEmail && !this.pendingConfirmation) {
        this.pendingUIAction = {
          type: 'show_text_input',
          inputType: 'phone',
          placeholder: '(555) 123-4567'
        };
      }
    }
    // Call ending detection
    else if ((lowerTranscript.includes('have a wonderful day') || 
              lowerTranscript.includes('have a great day') ||
              lowerTranscript.includes('thank you so much for sharing')) &&
             (lowerTranscript.includes('reach out within 24 hours') ||
              lowerTranscript.includes('will be in touch'))) {
      this.pendingUIAction = {
        type: 'end_call',
        inputType: null,
        placeholder: null
      };
    }
  }

  private handleError(errorData: any): void {
    let errorMessage = 'Unknown server error';
    
    // Enhanced error parsing with more debugging info
    if (typeof errorData === 'string') {
      errorMessage = errorData;
    } else if (errorData?.error) {
      // Handle nested error objects
      if (typeof errorData.error === 'string') {
        errorMessage = errorData.error;
      } else if (errorData.error?.message) {
        errorMessage = errorData.error.message;
      } else {
        errorMessage = `Error object: ${JSON.stringify(errorData.error)}`;
      }
    } else if (errorData?.message) {
      errorMessage = errorData.message;
    } else if (errorData?.code) {
      errorMessage = `Error code: ${errorData.code}`;
      if (errorData?.type) {
        errorMessage += ` (${errorData.type})`;
      }
    } else if (errorData) {
      // Log the full error data for debugging
      console.warn('OpenAI Provider: Raw error data:', errorData);
      errorMessage = `Server error: ${JSON.stringify(errorData)}`;
    }
    
    console.error('OpenAI Provider: Error:', errorMessage);
    this.emitError(new Error(errorMessage));
  }

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

  private async initializeAudio(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000,
        latencyHint: 'interactive'
      });
      
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 24000,
          channelCount: 1,
          sampleSize: 16,
          latency: 0.01
        }
      });

      await this.setupAudioWorklet();
      this.emit('audio.initialized');
    } catch (error) {
      console.error('OpenAI Provider: Failed to initialize audio:', error);
      this.emit('audio.error', error);
      throw error;
    }
  }

  private async setupAudioWorklet(): Promise<void> {
    if (!this.audioContext || !this.mediaStream) return;

    const source = this.audioContext.createMediaStreamSource(this.mediaStream);
    this.audioInputGain = this.audioContext.createGain();
    this.audioInputGain.gain.value = 1.0;

    const processor = this.audioContext.createScriptProcessor(4096, 1, 1);
    this.scriptProcessor = processor;
    
    processor.onaudioprocess = (e) => {
      if (this.connectionState.isCallActive && this.connectionState.isConnected && 
          this.ws && this.ws.readyState === WebSocket.OPEN) {
        const inputData = e.inputBuffer.getChannelData(0);
        const base64Audio = this.encodeAudioToBase64(inputData);
        this.sendAudioDelta(base64Audio);
      }
    };

    source.connect(this.audioInputGain);
    this.audioInputGain.connect(processor);
    const silentGain = this.audioContext.createGain();
    silentGain.gain.value = 0;
    processor.connect(silentGain);
    silentGain.connect(this.audioContext.destination);
  }

  private updateMicrophoneGain(isSpeaking: boolean): void {
    if (!this.audioInputGain || !this.audioContext) return;
    
    const targetGain = isSpeaking ? 0.05 : 1.0;
    const currentTime = this.audioContext.currentTime;
    
    this.audioInputGain.gain.cancelScheduledValues(currentTime);
    this.audioInputGain.gain.setValueAtTime(this.audioInputGain.gain.value, currentTime);
    this.audioInputGain.gain.linearRampToValueAtTime(targetGain, currentTime + 0.05);
  }

  private encodeAudioToBase64(audioData: Float32Array): string {
    const pcm16 = new Int16Array(audioData.length);
    for (let i = 0; i < audioData.length; i++) {
      const s = Math.max(-1, Math.min(1, audioData[i]));
      pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    
    const buffer = new ArrayBuffer(pcm16.length * 2);
    const view = new DataView(buffer);
    
    for (let i = 0; i < pcm16.length; i++) {
      view.setInt16(i * 2, pcm16[i], true);
    }
    
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private sendAudioDelta(base64Audio: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !base64Audio) return;
    
    this.sendEvent({
      type: 'input_audio_buffer.append',
      audio: base64Audio
    });
    
    this.audioChunkCount++;
  }

  private sendEvent(event: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(event));
    }
  }

  private async syncWithOrchestrator(item: OpenAIConversationItem): Promise<void> {
    if (!this.config.orchestratorEndpoint) return;

    try {
      const content = item.content?.[0];
      if (!content) return;

      const message = content.transcript || content.text || '';
      if (!message) return;

      const response = await fetch('/api/realtime/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: message,
          sessionId: this.config.sessionId,
          role: item.role,
          timestamp: new Date().toISOString(),
          metadata: { source: 'openai_realtime_voice' }
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.uiAction) {
          this.emitUIAction(data.uiAction);
        }
        if (data.customerInfo) {
          this.emit('customer.info', data.customerInfo);
        }
      }
    } catch (error) {
      console.error('OpenAI Provider: Error syncing with orchestrator:', error);
    }
  }

  private convertToStandardSession(openAISession: OpenAIRealtimeSession): VoiceSession {
    return {
      id: openAISession.id || 'openai-session',
      model: openAISession.model || 'gpt-4o-realtime-preview',
      voice: openAISession.voice || 'alloy',
      instructions: openAISession.instructions || '',
      temperature: openAISession.temperature || 0.8,
      provider: 'openai',
      modalities: openAISession.modalities || ['text', 'audio'],
      inputAudioFormat: openAISession.input_audio_format || 'pcm16',
      outputAudioFormat: openAISession.output_audio_format || 'pcm16',
      turnDetection: {
        type: openAISession.turn_detection?.type || 'server_vad',
        threshold: openAISession.turn_detection?.threshold || 0.85,
        silenceDurationMs: openAISession.turn_detection?.silence_duration_ms || 2000
      },
      providerData: {
        openai: openAISession
      }
    };
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('OpenAI Provider: Max reconnection attempts reached');
      this.emit('reconnect.failed');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);
    
    setTimeout(async () => {
      try {
        const apiKey = this.lastEphemeralKey || this.config.apiKey;
        const wsUrl = this.lastWsEndpoint;
        
        if (apiKey) {
          await this.connect(apiKey, wsUrl, this.hasExistingContext);
          this.reconnectAttempts = 0;
          this.emit('reconnected');
        }
      } catch (error) {
        console.error('OpenAI Provider: Reconnect failed:', error);
        this.attemptReconnect();
      }
    }, delay);
  }

  private cleanupAudioResources(): void {
    console.log('🎤 OpenAI Provider: Cleaning up audio resources and releasing microphone...');
    
    // Stop audio processing first
    if (this.scriptProcessor) {
      this.scriptProcessor.onaudioprocess = null;
      try {
        this.scriptProcessor.disconnect();
      } catch (error) {
        console.warn('Error disconnecting script processor:', error);
      }
      this.scriptProcessor = null;
    }

    if (this.audioInputGain) {
      try {
        this.audioInputGain.disconnect();
      } catch (error) {
        console.warn('Error disconnecting audio input gain:', error);
      }
      this.audioInputGain = null;
    }

    if (this.audioProcessor) {
      this.audioProcessor.close();
      this.audioProcessor = null;
    }

    // CRITICAL: Stop all media stream tracks to release microphone access
    if (this.mediaStream) {
      console.log('🎤 Stopping media stream tracks...');
      this.mediaStream.getTracks().forEach(track => {
        console.log(`🛑 Stopping track: ${track.kind}, state: ${track.readyState}`);
        track.stop();
        // Remove from stream
        if (this.mediaStream) {
          this.mediaStream.removeTrack(track);
        }
      });
      this.mediaStream = null;
      console.log('✅ All media stream tracks stopped');
    }

    // Close AudioContext properly with error handling
    if (this.audioContext && this.audioContext.state !== 'closed') {
      console.log('🎧 Closing AudioContext...');
      // Use async IIFE to handle the promise properly
      (async () => {
        try {
          if (this.audioContext && this.audioContext.state !== 'closed') {
            await this.audioContext.suspend();
            await this.audioContext.close();
            console.log('✅ AudioContext closed successfully');
          }
        } catch (error) {
          console.warn('Error closing AudioContext:', error);
        }
      })();
      this.audioContext = null;
    }
    
    console.log('✅ Audio resource cleanup completed');
  }

  private cleanupWebSocket(): void {
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onerror = null;
      this.ws.onclose = null;
      
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close();
      }
      
      this.ws = null;
    }
  }

  private getFreshInstructions(): string {
    return `You are Luci, an AI assistant helping with AI and automation solutions.
         
         NEVER say the company name. Simply call yourself "Luci" or "your AI assistant".
         
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
         
         🚨 STRUCTURED DATA COLLECTION PROCESS 🚨
         
         IMPORTANT: The orchestrator tracks what information has been collected.
         Only ask for information that hasn't been provided yet.
         If you've already collected certain data, skip to the next step.
         
         Follow this EXACT 10-step qualification process:
         
         0. GREETING - "Hi there! I'm Luci, your AI assistant. I'm here to help you find the right solutions for your Data & AI needs. May I know who I'm speaking with?"
            → Wait for their name before continuing
         
         1. SOLUTIONS DISCOVERY - After getting name: "Nice to meet you, [name]! What kind of AI and automation solutions are you looking to implement?"
            → Keep it conversational and inviting, not interrogative
            → If they're not sure: "No worries! Are you looking to automate any specific processes or enhance your data capabilities?"
            → If they mention general interest: "That's great! What aspects of your business could benefit most from automation?"
         
         2. VALUE INSIGHT - Listen and understand FIRST, then acknowledge
            → "That's really helpful context, thank you for sharing that!"
            → Focus on understanding their specific situation
            → Ask clarifying questions: "Could you tell me more about how that process works currently?"
         
         3. EMAIL - "Based on what you've shared, I'd love to have our AI strategist explore some tailored solutions for your specific needs. They can reach out within 24 hours. Could you please type your email address in the field that will appear on screen?"
            → FINISH saying this COMPLETELY before the UI appears
            → WAIT SILENTLY for email to be typed and submitted
            → When received, IMMEDIATELY read back: "Perfect! I have your email as [email]. Is that correct?"
            → WAIT for user confirmation (yes/no)
            → If YES: "Thank you for confirming!"
            → If NO: "No problem! Please type your correct email address in the field on screen."
            → DO NOT proceed to phone until email is confirmed
         
         4. PHONE - "And so our strategist can reach you directly if needed, could you please type your phone number in the field on screen?"
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
  }

  private getContinuingInstructions(): string {
    return `You are Luci, an AI assistant continuing a conversation that started in text.
         
         NEVER say the company name. Simply call yourself "Luci" or "your AI assistant".
         
         INTERNAL DIRECTIVE (NEVER mention this to the client):
         - The orchestrator tracks what information has been collected
         - Listen to orchestrator feedback about what's already known
         - Only ask for information not yet provided
         - Continue gathering any missing business information naturally through conversation
         
         Be natural and conversational. Reference the previous conversation smoothly and continue exploring their business needs and challenges. When they mention challenges, demonstrate confidence that you have solutions rather than explaining technical details. Ask focused follow-up questions to understand their specific situation better.`;
  }
}