/**
 * Hume EVI Voice Provider
 * 
 * Implementation of IVoiceProvider for Hume AI's Speech-to-Speech EVI API
 * Provides advanced emotional voice interactions with context preservation
 */

import { IVoiceProvider, VoiceConfig, VoiceSession, VoiceMessage, VoiceTranscript } from './IVoiceProvider';
import { AudioQualityEnhancer } from '../AudioQualityEnhancer';

interface HumeEVISession {
  id: string;
  config_id?: string;
  config_version?: string;
  resumed_chat_group_id?: string;
  voice_id?: string;
  verbose_transcription?: boolean;
}

interface HumeMessage {
  type: 'audio_input' | 'session_settings' | 'user_input' | 'assistant_input' | 
        'tool_response' | 'tool_error' | 'pause_assistant_message' | 'resume_assistant_message';
  [key: string]: any;
}

interface HumeEvent {
  type: 'assistant_end' | 'assistant_message' | 'assistant_prosody' | 'audio_output' | 
        'chat_metadata' | 'user_message' | 'tool_call_message' | 'error' | 'connection_established';
  [key: string]: any;
}

export class HumeEVIVoiceProvider extends IVoiceProvider {
  private ws: WebSocket | null = null;
  private humeSession: HumeEVISession | null = null;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private audioInputGain: GainNode | null = null;
  private audioChunkCount: number = 0;
  private isRecording: boolean = false;
  private chatGroupId: string | null = null;
  private audioEnhancer: AudioQualityEnhancer | null = null;
  
  // Audio quality monitoring
  private audioQualityMetrics = {
    inputLevel: 0,
    outputLevel: 0,
    latency: 0,
    dropouts: 0,
    lastDropoutTime: 0,
    totalAudioProcessed: 0,
    totalAudioPlayed: 0
  };
  
  // Voice Activity Detection - Optimized for 24kHz @ 1024 samples
  private silenceThreshold: number = 0.02; // Slightly higher for better noise rejection
  private silenceBuffer: Float32Array[] = [];
  private maxSilenceBufferSize: number = 5; // Reduced for lower latency (5 * 43ms = 215ms)
  private lastAudioTime: number = 0;
  private isUserSpeaking: boolean = false;
  private speechStartedTime: number = 0;
  private consecutiveSilentChunks: number = 0;
  private minSpeechDuration: number = 100; // Minimum 100ms to consider as speech
  
  // Reconnection state
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  
  // Prevent orchestrator loops
  private lastUserMessage: string = '';
  private lastUserMessageTime: number = 0;
  private orchestratorCallInProgress: boolean = false;

  constructor(config: VoiceConfig) {
    super(config);
    
    // Initialize Hume-specific session
    this.humeSession = {
      id: config.sessionId,
      config_id: config.hume?.configId,
      config_version: config.hume?.configVersion,
      resumed_chat_group_id: config.hume?.resumedChatGroupId,
      voice_id: config.hume?.voiceId,
      verbose_transcription: config.hume?.verboseTranscription || false
    };
  }

  getProviderName(): string {
    return 'Hume EVI';
  }

  getProviderVersion(): string {
    return 'v1.0-optimized'; // Updated version with audio fixes
  }

  getSupportedVoices(): string[] {
    // Hume EVI supports custom voices from Voice Library
    return ['default', 'empathetic', 'professional', 'friendly'];
  }

  getSupportedFeatures(): string[] {
    return [
      'realtime_voice',
      'speech_to_speech',
      'emotional_intelligence',
      'prosody_control',
      'context_preservation',
      'chat_group_sessions',
      'interim_transcripts',
      'tool_integration',
      'pause_resume_control'
    ];
  }

  async connect(apiKey?: string, wsEndpoint?: string, hasExistingContext: boolean = false): Promise<void> {
    try {
      this.updateConnectionState({ isConnecting: true, error: null });
      
      const key = apiKey || this.config.apiKey;
      if (!key) {
        throw new Error('Hume API key is required');
      }
      
      console.log('Hume EVI Provider: Attempting connection:', {
        hasApiKey: !!key,
        hasExistingContext,
        configId: this.humeSession?.config_id,
        chatGroupId: this.humeSession?.resumed_chat_group_id
      });
      
      // Build WebSocket URL with query parameters
      const baseUrl = wsEndpoint || 'wss://api.hume.ai/v0/evi/chat';
      const url = new URL(baseUrl);
      
      // Add authentication
      url.searchParams.set('apikey', key);
      
      // Add optional configuration parameters
      if (this.humeSession?.config_id) {
        url.searchParams.set('config_id', this.humeSession.config_id);
      }
      
      if (this.humeSession?.config_version) {
        url.searchParams.set('config_version', this.humeSession.config_version);
      }
      
      if (hasExistingContext && this.humeSession?.resumed_chat_group_id) {
        url.searchParams.set('resumed_chat_group_id', this.humeSession.resumed_chat_group_id);
      }
      
      if (this.humeSession?.voice_id) {
        url.searchParams.set('voice_id', this.humeSession.voice_id);
      }
      
      if (this.humeSession?.verbose_transcription) {
        url.searchParams.set('verbose_transcription', 'true');
      }
      
      const wsUrl = url.toString();
      console.log('Hume EVI Provider: Connecting to WebSocket:', {
        baseUrl: baseUrl,
        hasApiKey: !!key,
        configId: this.humeSession?.config_id,
        voiceId: this.humeSession?.voice_id,
        fullUrl: wsUrl.replace(key, 'REDACTED') // Log URL with redacted API key
      });
      
      this.ws = new WebSocket(wsUrl);
      this.setupWebSocketHandlers();
      
      console.log('Hume EVI Provider: Waiting for connection...');
      await this.waitForConnection();

      // Initialize audio
      await this.initializeAudio();

      // Configure session with Hume-specific settings
      await this.configureSession(hasExistingContext);

      this.updateConnectionState({ 
        isConnected: true, 
        isConnecting: false, 
        error: null 
      });
      
      this.emit('connected');
    } catch (error) {
      console.error('Hume EVI Provider: Failed to connect:', error);
      this.updateConnectionState({ 
        isConnecting: false, 
        error: error instanceof Error ? error.message : 'Connection failed' 
      });
      this.emitError(error instanceof Error ? error : new Error('Connection failed'));
      throw error;
    }
  }

  disconnect(): void {
    console.log('Hume EVI Provider: Disconnecting...');
    
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
      throw new Error('Not connected to Hume EVI service');
    }

    console.log('Hume EVI Provider: Starting call...');
    this.updateConnectionState({ isCallActive: true });
    this.audioChunkCount = 0;
    this.isRecording = true;
    
    // Resume audio context if needed
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
    
    // Send session settings to start the conversation
    // Configure Hume session with correct audio settings
    const sessionConfig = {
      type: 'session_settings' as const,
      audio: {
        encoding: 'linear16',
        channels: 1,
        sample_rate: 24000  // Hume's native sample rate
      },
      voice: {
        provider: 'HUME_AI',
        voice_id: this.config.hume?.voiceId || process.env.NEXT_PUBLIC_HUME_VOICE_ID || '8a7dd58c-0cda-4073-9ce6-654184695e99'
      },
      language: {
        model: 'en-US'
      }
    };
    
    console.log('🔧 Sending Hume session configuration:', JSON.stringify(sessionConfig, null, 2));
    this.sendMessage(sessionConfig as HumeMessage);
    
    this.emit('call_started');
    
    // Don't send any initial message - let user speak first
    // This prevents the feedback loop issue
    console.log('🎙️ Voice call started - waiting for user input');
  }

  endCall(): void {
    console.log('Hume EVI Provider: Ending call...');
    
    this.updateConnectionState({ 
      isCallActive: false,
      isAssistantSpeaking: false 
    });
    
    // Clear audio queue to prevent lingering audio
    this.audioQueue = [];
    this.isPlaying = false;
    this.nextStartTime = 0;
    
    this.audioChunkCount = 0;
    this.isRecording = false;
    
    // Reset VAD state
    this.isUserSpeaking = false;
    this.silenceBuffer = [];
    this.lastAudioTime = 0;
    this.speechStartedTime = 0;
    
    // Send pause message to stop assistant
    if (this.connectionState.isConnected) {
      this.sendMessage({
        type: 'pause_assistant_message'
      });
    }
    
    // Stop audio processing
    if (this.scriptProcessor) {
      this.scriptProcessor.onaudioprocess = null;
    }
    
    this.emit('call_ended');
  }

  async sendText(text: string): Promise<void> {
    console.log('Hume EVI Provider: Processing text input:', text);
    
    // SIMPLIFIED: Send text directly to Hume without orchestrator routing
    // This avoids latency and feedback loops for typed input
    this.sendMessage({
      type: 'user_input',
      text: text
    });
    
    // Update orchestrator state asynchronously (non-blocking)
    // This keeps state in sync without adding latency to voice pipeline
    this.updateWorkflowStateAsync(text, 'text_input');
  }

  /**
   * Send user text input using official Hume SDK pattern
   */
  sendUserInput(text: string): void {
    console.log('📝 Sending user text input to Hume:', text);
    this.sendMessage({
      type: 'user_input',
      text: text
    });
  }

  sendAudio(audioData: ArrayBuffer): void {
    if (!this.isRecording || !this.connectionState.isCallActive) {
      console.log('🎤 Audio not sent - isRecording:', this.isRecording, 'isCallActive:', this.connectionState.isCallActive);
      return;
    }
    
    // Validate PCM16 format (should be even number of bytes)
    if (audioData.byteLength % 2 !== 0) {
      console.warn('⚠️ Invalid PCM16 data: odd number of bytes');
      return;
    }
    
    // Validate reasonable chunk size (not too small, not too large)
    if (audioData.byteLength < 320 || audioData.byteLength > 32768) {
      console.warn(`⚠️ Unusual audio chunk size: ${audioData.byteLength} bytes`);
      // Continue anyway, but log for debugging
    }
    
    // Convert ArrayBuffer to base64 with proper binary handling
    const uint8Array = new Uint8Array(audioData);
    const base64Audio = this.arrayBufferToBase64(uint8Array);
    
    // Log sparingly to reduce console noise
    if (this.audioChunkCount % 50 === 0) {
      console.log(`🎤 Sending audio chunk ${this.audioChunkCount} to Hume, size: ${uint8Array.length} bytes`);
    }
    
    // Use official Hume SDK pattern for audio input
    this.sendMessage({
      type: 'audio_input',
      data: base64Audio
    });
  }

  async configureSession(hasExistingContext: boolean = false): Promise<void> {
    // Create standardized session object
    this.session = {
      id: this.humeSession?.id || 'hume-session',
      model: 'hume-evi',
      voice: this.config.voice || this.humeSession?.voice_id || 'default',
      instructions: hasExistingContext ? this.getContinuingInstructions() : this.getFreshInstructions(),
      temperature: 0.8,
      provider: 'hume',
      modalities: ['audio', 'text'],
      inputAudioFormat: 'pcm16',
      outputAudioFormat: 'pcm16',
      turnDetection: {
        type: 'server_vad',
        threshold: 0.85,
        silenceDurationMs: 2000
      },
      providerData: {
        hume: this.humeSession
      }
    };
    
    this.emit('session_created', this.session);
  }

  setContext(messages: Array<{ text: string; isUser: boolean }>): void {
    console.log('Hume EVI Provider: Setting context with', messages.length, 'messages');
    
    // Hume EVI uses chat_group_id for context preservation
    // Context is automatically maintained across sessions when using the same chat group
    if (this.humeSession?.resumed_chat_group_id) {
      console.log('Hume EVI Provider: Context preserved via chat group:', this.humeSession.resumed_chat_group_id);
    }
    
    // For immediate context, send relevant messages as assistant inputs
    messages.forEach((msg, index) => {
      if (index === 0 && !msg.isUser && msg.text.toLowerCase().includes("hello")) {
        return; // Skip initial greetings
      }
      
      this.sendMessage({
        type: msg.isUser ? 'user_input' : 'assistant_input',
        text: msg.text
      });
    });
  }

  updateInstructions(instructions: string): void {
    // Hume EVI uses configurations rather than direct instruction updates
    // This would typically require updating the config via API
    console.log('Hume EVI Provider: Instructions update requested - would require config update');
    
    if (this.session) {
      this.session.instructions = instructions;
      this.emit('session_updated', this.session);
    }
  }

  // Private methods

  private setupWebSocketHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('Hume EVI Provider: WebSocket connected');
      this.reconnectAttempts = 0;
      this.updateConnectionState({ isConnected: true });
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as HumeEvent;
        this.handleServerEvent(data);
      } catch (error) {
        console.error('Hume EVI Provider: Failed to parse message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('Hume EVI Provider: WebSocket error:', error);
      this.emitError(new Error('WebSocket error'));
    };

    this.ws.onclose = (event) => {
      console.log('Hume EVI Provider: WebSocket disconnected:', event.code, event.reason);
      this.updateConnectionState({ isConnected: false });
      this.emit('disconnected');
      
      if (event.code !== 1000) { // Not a normal closure
        this.attemptReconnect();
      }
    };
  }

  private handleServerEvent(event: HumeEvent): void {
    const { type, ...data } = event;
    console.log('📨 Hume event received:', type, Object.keys(data));

    switch (type) {
      case 'connection_established':
        console.log('✅ Hume connection established');
        break;
        
      case 'chat_metadata':
        console.log('Hume EVI Provider: Chat metadata received:', data);
        if (data.chat_group_id) {
          this.chatGroupId = data.chat_group_id;
          if (this.humeSession) {
            this.humeSession.resumed_chat_group_id = data.chat_group_id;
          }
        }
        break;

      case 'user_message':
        const userTranscript: VoiceTranscript = {
          text: data.message?.content || data.text || '',
          role: 'user',
          timestamp: new Date(data.timestamp || Date.now()),
          confidence: data.confidence,
          interim: data.interim || false
        };
        
        if (!userTranscript.interim && userTranscript.text) {
          console.log('🎤 Hume User Transcript:', userTranscript.text);
          
          // LangGraph-style orchestration: Track state, guide context, don't force responses
          const now = Date.now();
          const isDuplicate = userTranscript.text === this.lastUserMessage && 
                             (now - this.lastUserMessageTime) < 2000; // 2 second window
          
          if (!isDuplicate && !this.orchestratorCallInProgress) {
            this.lastUserMessage = userTranscript.text;
            this.lastUserMessageTime = now;
            
            // Route to orchestrator asynchronously to update workflow state
            // Non-blocking to avoid adding latency to voice pipeline
            this.updateWorkflowStateAsync(userTranscript.text, 'voice');
          }
        }
        
        this.emitTranscript(userTranscript);
        break;

      case 'assistant_message':
        const assistantTranscript: VoiceTranscript = {
          text: data.message?.content || data.text || '',
          role: 'assistant',
          timestamp: new Date(data.timestamp || Date.now()),
          confidence: data.confidence,
          interim: data.interim || false
        };
        
        if (!assistantTranscript.interim) {
          console.log('🤖 Hume Assistant Transcript:', assistantTranscript.text);
          this.handleUIActionDetection(assistantTranscript.text);
        }
        
        this.emitTranscript(assistantTranscript);
        break;

      case 'assistant_prosody':
        console.log('Hume EVI Provider: Prosody data received:', data);
        this.emit('prosody_data', data);
        break;

      case 'audio_output':
        console.log('🔊 Hume audio_output event received, data length:', data.data?.length || 0);
        this.emit('audio_chunk', data.data);
        
        if (data.data) {
          // Hume provides audio as base64
          this.playAudioData(data.data);
          
          if (!this.connectionState.isAssistantSpeaking) {
            this.updateConnectionState({ isAssistantSpeaking: true });
            this.updateMicrophoneGain(true);
            this.emit('audio_start');
          }
        }
        break;

      case 'assistant_end':
        console.log('Hume EVI Provider: Assistant finished speaking');
        this.updateConnectionState({ isAssistantSpeaking: false });
        this.updateMicrophoneGain(false);
        this.emit('audio_end');
        break;

      case 'tool_call_message':
        console.log('Hume EVI Provider: Tool call received:', data);
        this.emit('tool_call', data);
        break;

      case 'error':
        console.error('❌ Hume error event:', data);
        this.emitError(new Error(data.message || data.error || 'Hume error'));
        break;
        
      default:
        console.log('Hume EVI Provider: Unknown event type:', type, data);
        this.emit(type, data);
    }
  }

  /**
   * Asynchronous workflow state update - non-blocking
   * Updates orchestrator state without adding latency to voice pipeline
   */
  private async updateWorkflowStateAsync(userText: string, source: string = 'voice'): Promise<void> {
    // Fire and forget - don't await
    this.updateWorkflowState(userText, source).catch(error => {
      console.error('Failed to update workflow state:', error);
    });
  }

  /**
   * LangGraph-style workflow state management
   * Updates orchestrator state without interfering with Hume's natural responses
   */
  private async updateWorkflowState(userText: string, source: string = 'voice'): Promise<void> {
    console.log('📊 Updating workflow state for:', userText);
    
    if (this.orchestratorCallInProgress) {
      console.log('⏸️ Workflow update already in progress, skipping');
      return;
    }
    
    this.orchestratorCallInProgress = true;
    
    try {
      // Call orchestrator to update BANT qualification state
      const response = await fetch('/api/realtime/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.session?.id || 'hume-session',
          transcript: userText,
          role: 'user',
          timestamp: new Date().toISOString(),
          metadata: {
            source: source,
            inputType: source === 'text_input' ? 'typed' : 'verbal',
            orchestrationMode: 'state_tracking' // Don't force responses
          }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📈 Workflow state updated:', data);
        
        // Update Hume's context based on workflow state if needed
        if (data.workflowState?.nextRequiredStep) {
          await this.updateContextForWorkflowState(data.workflowState);
        }
        
        // Emit state changes to UI for progress tracking
        if (data.workflowState) {
          this.emit('workflow_state_updated', data.workflowState);
        }
        
        // Handle UI actions (like form submissions)
        if (data.uiAction) {
          console.log('📱 Emitting UI action from orchestrator:', data.uiAction);
          this.emitUIAction(data.uiAction);
        }
      }
    } catch (error) {
      console.error('Failed to update workflow state:', error);
    } finally {
      this.orchestratorCallInProgress = false;
    }
  }

  /**
   * Update Hume's conversation context based on workflow state
   * This guides the conversation without forcing specific responses
   */
  private async updateContextForWorkflowState(workflowState: any): Promise<void> {
    // This could send a context update to Hume to guide its responses
    // For now, we'll just log the state change
    console.log('🎯 Workflow context update needed:', workflowState.nextRequiredStep);
  }

  private async routeToOrchestrator(userText: string): Promise<void> {
    console.log('🔄 Routing user message to orchestrator for BANT compliance:', userText);
    
    if (this.orchestratorCallInProgress) {
      console.log('⏸️ Orchestrator call already in progress, skipping');
      return;
    }
    
    this.orchestratorCallInProgress = true;
    
    try {
      // Send to orchestrator via sync API
      const response = await fetch('/api/realtime/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.session?.id || 'hume-session',
          transcript: userText,
          role: 'user',
          timestamp: new Date().toISOString(),
          metadata: {
            source: 'voice',
            inputType: 'verbal'
          }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Orchestrator response for verbal input:', data);
        
        // CRITICAL: Make Hume speak the orchestrator's response
        // This ensures compliance with BANT workflow
        if (data.aiResponse?.message) {
          console.log('🗣️ Hume will speak orchestrator BANT response:', data.aiResponse.message);
          
          // Stop any current Hume response
          this.sendMessage({
            type: 'pause_assistant_message'
          });
          
          // Have Hume speak the orchestrator's response
          setTimeout(() => {
            this.sendMessage({
              type: 'assistant_input',
              text: data.aiResponse.message
            });
          }, 200);
        }
        
        // Handle UI actions from orchestrator
        if (data.uiAction) {
          console.log('📱 Emitting UI action from orchestrator:', data.uiAction);
          this.emitUIAction(data.uiAction);
        }
      }
    } catch (error) {
      console.error('Failed to route to orchestrator:', error);
      // Let Hume handle it naturally if orchestrator fails
    } finally {
      this.orchestratorCallInProgress = false;
    }
  }

  private handleUIActionDetection(transcript: string): void {
    if (!transcript) return;
    
    const lowerTranscript = transcript.toLowerCase();
    
    // Detect email requests
    if (lowerTranscript.includes('email') && 
        (lowerTranscript.includes('type') || lowerTranscript.includes('enter'))) {
      this.emitUIAction({
        type: 'show_text_input',
        inputType: 'email',
        placeholder: 'your.email@company.com'
      });
    }
    // Detect phone requests
    else if (lowerTranscript.includes('phone') && 
             (lowerTranscript.includes('type') || lowerTranscript.includes('enter'))) {
      this.emitUIAction({
        type: 'show_text_input',
        inputType: 'phone',
        placeholder: '(555) 123-4567'
      });
    }
    // Detect call ending
    else if ((lowerTranscript.includes('wonderful day') || 
              lowerTranscript.includes('great day')) &&
             lowerTranscript.includes('reach out')) {
      this.emitUIAction({
        type: 'end_call',
        inputType: null,
        placeholder: null
      });
    }
  }

  private audioQueue: AudioBuffer[] = [];
  private isPlaying: boolean = false;
  private nextStartTime: number = 0;

  private async playAudioData(base64Audio: string): Promise<void> {
    if (!this.audioContext) {
      console.error('Hume EVI Provider: No audio context available');
      this.audioQualityMetrics.dropouts++;
      return;
    }
    
    // Track processing start time for latency measurement
    const processingStartTime = performance.now();
    console.log('🎵 Processing audio chunk, base64 length:', base64Audio.length);
    
    try {
      // Decode base64 to ArrayBuffer
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Hume sends linear16 PCM at 24kHz, mono
      // Convert PCM16 to Float32 for Web Audio API
      const pcmData = new Int16Array(bytes.buffer);
      const floatData = new Float32Array(pcmData.length);
      
      // Convert 16-bit PCM to Float32 (-1 to 1 range) with proper clamping
      for (let i = 0; i < pcmData.length; i++) {
        // Ensure proper conversion without clipping
        floatData[i] = Math.max(-1, Math.min(1, pcmData[i] / 32768.0));
      }
      
      // Create AudioBuffer directly at 24kHz - no resampling needed!
      // Since our AudioContext is already at 24kHz, we avoid all resampling artifacts
      const finalAudioBuffer = this.audioContext.createBuffer(1, floatData.length, 24000);
      finalAudioBuffer.copyToChannel(floatData, 0);
      
      // Update quality metrics
      const processingTime = performance.now() - processingStartTime;
      this.audioQualityMetrics.latency = processingTime;
      this.audioQualityMetrics.totalAudioProcessed += finalAudioBuffer.duration * 1000; // Convert to ms
      
      console.log('Hume EVI Provider: Created audio buffer:', {
        duration: finalAudioBuffer.duration,
        length: finalAudioBuffer.length,
        sampleRate: finalAudioBuffer.sampleRate,
        channels: finalAudioBuffer.numberOfChannels,
        processingTimeMs: processingTime.toFixed(2)
      });
      
      // Add to queue for smooth playback
      this.audioQueue.push(finalAudioBuffer);
      
      // Start playback if not already playing
      if (!this.isPlaying) {
        this.processAudioQueue();
      }
      
    } catch (error) {
      console.error('Hume EVI Provider: Error processing audio:', error);
      this.audioQualityMetrics.dropouts++;
      this.audioQualityMetrics.lastDropoutTime = Date.now();
      
      // Emit audio error event for monitoring
      this.emit('audio_error', {
        error: error instanceof Error ? error.message : 'Audio processing failed',
        metrics: this.audioQualityMetrics
      });
    }
  }

  private processAudioQueue(): void {
    if (!this.audioContext || this.audioQueue.length === 0) {
      this.isPlaying = false;
      console.log('🎵 Audio queue empty, stopping playback');
      
      // Report audio quality metrics when playback stops
      if (this.audioQualityMetrics.totalAudioPlayed > 0) {
        this.emitAudioQualityReport();
      }
      return;
    }
    
    this.isPlaying = true;
    const audioBuffer = this.audioQueue.shift()!;
    
    console.log('🎵 Playing audio buffer:');
    console.log(`  Duration: ${audioBuffer.duration.toFixed(3)}s`);
    console.log(`  Sample rate: ${audioBuffer.sampleRate}Hz`);
    console.log(`  Length: ${audioBuffer.length} samples`);
    console.log(`  Channels: ${audioBuffer.numberOfChannels}`);
    
    // Create source and play with proper timing
    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioContext.destination);
    
    // Schedule playback to prevent gaps
    const currentTime = this.audioContext.currentTime;
    const startTime = Math.max(currentTime, this.nextStartTime);
    const delay = startTime - currentTime;
    
    console.log(`  Current time: ${currentTime.toFixed(3)}s`);
    console.log(`  Start time: ${startTime.toFixed(3)}s (delay: ${delay.toFixed(3)}s)`);
    
    source.start(startTime);
    
    // Update next start time
    this.nextStartTime = startTime + audioBuffer.duration;
    console.log(`  Next start time: ${this.nextStartTime.toFixed(3)}s`);
    
    // Update quality metrics
    this.audioQualityMetrics.totalAudioPlayed += audioBuffer.duration * 1000;
    
    // Schedule next buffer
    source.onended = () => {
      console.log('🎵 Audio buffer finished playing');
      this.processAudioQueue();
    };
  }

  private arrayBufferToBase64(buffer: Uint8Array): string {
    // Properly handle binary data encoding to avoid corruption
    // Use chunked processing for large buffers to avoid stack overflow
    const chunkSize = 0x8000; // 32KB chunks
    let binary = '';
    
    for (let i = 0; i < buffer.length; i += chunkSize) {
      const chunk = buffer.subarray(i, Math.min(i + chunkSize, buffer.length));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    return btoa(binary);
  }

  private sendMessage(message: HumeMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('Hume EVI Provider: WebSocket not connected');
    }
  }

  private waitForConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.ws) {
        reject(new Error('WebSocket not initialized'));
        return;
      }

      const timeout = setTimeout(() => {
        console.error('Hume EVI Provider: Connection timeout - WebSocket state:', this.ws?.readyState);
        reject(new Error('Connection timeout'));
      }, 30000); // 30 second timeout for slower connections

      const checkConnection = () => {
        if (this.ws?.readyState === WebSocket.OPEN) {
          clearTimeout(timeout);
          console.log('✅ Hume WebSocket connection established');
          resolve();
        } else if (this.ws?.readyState === WebSocket.CLOSED || this.ws?.readyState === WebSocket.CLOSING) {
          clearTimeout(timeout);
          console.error('❌ Hume WebSocket connection failed, state:', this.ws?.readyState);
          reject(new Error('WebSocket connection failed'));
        } else {
          console.log('⏳ Waiting for Hume connection... state:', this.ws?.readyState);
          setTimeout(checkConnection, 100);
        }
      };

      checkConnection();
    });
  }

  private async initializeAudio(): Promise<void> {
    try {
      // Create audio context at Hume's native 24kHz to avoid resampling artifacts
      // This ensures audio plays at the correct speed without distortion
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000,  // Match Hume's native sample rate exactly
        latencyHint: 'interactive'  // Balance between latency and quality
      });
      
      console.log('🎵 Audio context created:');
      console.log('  Sample rate:', this.audioContext.sampleRate, 'Hz');
      console.log('  State:', this.audioContext.state);
      console.log('  Base latency:', this.audioContext.baseLatency?.toFixed(3) || 'unknown');
      console.log('  Output latency:', this.audioContext.outputLatency?.toFixed(3) || 'unknown');
      
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      // Skip audio quality enhancer for Hume - it provides pre-processed audio
      // this.audioEnhancer = new AudioQualityEnhancer(this.audioContext);

      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          // Remove fixed sample rate - let browser choose optimal rate
          channelCount: 1,
          // Additional constraints for better quality
          googEchoCancellation: true,
          googAutoGainControl: true,
          googNoiseSuppression: true,
          googHighpassFilter: true,
          googTypingNoiseDetection: true
        } as MediaTrackConstraints
      });

      await this.setupAudioProcessor();
      this.emit('audio.initialized');
    } catch (error) {
      console.error('Hume EVI Provider: Failed to initialize audio:', error);
      this.emit('audio.error', error);
      throw error;
    }
  }

  private async setupAudioProcessor(): Promise<void> {
    if (!this.audioContext || !this.mediaStream) return;

    const source = this.audioContext.createMediaStreamSource(this.mediaStream);
    this.audioInputGain = this.audioContext.createGain();
    this.audioInputGain.gain.value = 1.0;

    // Use smaller buffer size for lower latency at 24kHz
    // 1024 samples at 24kHz = ~43ms of audio (good balance)
    const bufferSize = 1024;
    const processor = this.audioContext.createScriptProcessor(bufferSize, 1, 1);
    const bufferDurationMs = (bufferSize / this.audioContext.sampleRate * 1000).toFixed(1);
    console.log(`🎵 Audio processor: ${bufferSize} samples @ ${this.audioContext.sampleRate}Hz = ${bufferDurationMs}ms latency`);
    this.scriptProcessor = processor;
    
    processor.onaudioprocess = (e) => {
      if (!this.isRecording || !this.connectionState.isCallActive || 
          !this.connectionState.isConnected) {
        if (this.audioChunkCount === 0) {
          console.log('🎤 Audio not being processed:', {
            isRecording: this.isRecording,
            isCallActive: this.connectionState.isCallActive,
            isConnected: this.connectionState.isConnected
          });
        }
        return;
      }

      const inputData = e.inputBuffer.getChannelData(0);
      const currentTime = Date.now();
      
      // Voice Activity Detection - calculate RMS and peak levels
      let rms = 0;
      let peak = 0;
      for (let i = 0; i < inputData.length; i++) {
        const sample = Math.abs(inputData[i]);
        rms += sample * sample;
        if (sample > peak) peak = sample;
      }
      rms = Math.sqrt(rms / inputData.length);
      
      // Enhanced VAD: Use both RMS and peak with adaptive thresholds
      const hasSignificantAudio = rms > this.silenceThreshold || peak > (this.silenceThreshold * 3);
      
      // State management for speech detection with debouncing
      if (hasSignificantAudio) {
        this.consecutiveSilentChunks = 0; // Reset silence counter
        if (!this.isUserSpeaking) {
          this.isUserSpeaking = true;
          this.speechStartedTime = currentTime;
          console.log('🗣️ Speech detected - starting to send audio chunks');
          
          // Send any buffered silence for context (helps with sentence beginnings)
          if (this.silenceBuffer.length > 0) {
            console.log(`🔇 Sending ${this.silenceBuffer.length} buffered silence chunks for context`);
            this.silenceBuffer.forEach(silenceChunk => {
              const pcm16Data = this.floatTo16BitPCM(silenceChunk);
              this.sendAudio(pcm16Data.buffer as ArrayBuffer);
              this.audioChunkCount++;
            });
            this.silenceBuffer = [];
          }
        }
        this.lastAudioTime = currentTime;
        
        // Send current audio chunk
        const pcm16Data = this.floatTo16BitPCM(inputData);
        this.sendAudio(pcm16Data.buffer as ArrayBuffer);
        this.audioChunkCount++;
        
        // Debug logging (less frequent)
        if (this.audioChunkCount % 50 === 0) {
          console.log(`🎤 Sending audio chunk ${this.audioChunkCount} - RMS: ${rms.toFixed(4)}, Peak: ${peak.toFixed(4)}`);
        }
        
      } else {
        // Handle silence with improved debouncing
        this.consecutiveSilentChunks++;
        
        if (this.isUserSpeaking) {
          const speechDuration = currentTime - this.speechStartedTime;
          const silenceDuration = this.consecutiveSilentChunks * 43; // ~43ms per chunk at 1024/24kHz
          
          // Use adaptive silence threshold based on speech duration
          const silenceThresholdMs = speechDuration < 500 ? 800 : 1200; // Shorter for brief utterances
          
          // Stop sending if silence is too long (user finished speaking)
          if (silenceDuration > silenceThresholdMs) {
            this.isUserSpeaking = false;
            console.log(`🤐 Speech ended - ${speechDuration}ms speech, ${silenceDuration}ms silence`);
            
            // Send a final silence chunk to signal end of speech
            const pcm16Data = this.floatTo16BitPCM(inputData);
            this.sendAudio(pcm16Data.buffer as ArrayBuffer);
            this.audioChunkCount++;
          } else {
            // Still in speech - send silence to maintain continuity
            const pcm16Data = this.floatTo16BitPCM(inputData);
            this.sendAudio(pcm16Data.buffer as ArrayBuffer);
            this.audioChunkCount++;
          }
        } else {
          // Pure silence - buffer it for context but don't send
          this.silenceBuffer.push(new Float32Array(inputData));
          
          // Limit buffer size to prevent memory issues
          if (this.silenceBuffer.length > this.maxSilenceBufferSize) {
            this.silenceBuffer.shift(); // Remove oldest
          }
          
          // Occasional silence logging (very infrequent)
          if (this.audioChunkCount % 500 === 0 && this.audioChunkCount > 0) {
            console.log(`🔇 Silence detected - buffering (${this.silenceBuffer.length} chunks), RMS: ${rms.toFixed(4)}`);
          }
        }
      }
    };

    source.connect(this.audioInputGain);
    this.audioInputGain.connect(processor);
    const silentGain = this.audioContext.createGain();
    silentGain.gain.value = 0;
    processor.connect(silentGain);
    silentGain.connect(this.audioContext.destination);
  }

  private floatTo16BitPCM(input: Float32Array): Int16Array {
    // Since AudioContext is now at 24kHz, no resampling needed!
    const output = new Int16Array(input.length);
    
    // Convert Float32 to PCM16 with proper clamping and scaling
    for (let i = 0; i < input.length; i++) {
      // Apply slight gain reduction to prevent clipping
      const sample = input[i] * 0.95;
      // Clamp to [-1, 1] range
      const clamped = Math.max(-1, Math.min(1, sample));
      // Convert to 16-bit integer range
      // Use asymmetric scaling for proper PCM16 conversion
      if (clamped < 0) {
        output[i] = Math.round(clamped * 0x8000); // -32768
      } else {
        output[i] = Math.round(clamped * 0x7FFF); // 32767
      }
    }
    
    // Log occasionally for monitoring
    if (this.audioChunkCount % 100 === 0 && this.audioChunkCount > 0) {
      const rms = Math.sqrt(input.reduce((sum, val) => sum + val * val, 0) / input.length);
      console.log(`🎤 Audio chunk ${this.audioChunkCount}: ${input.length} samples, RMS: ${rms.toFixed(4)}`);
    }
    
    return output;
  }

  private updateMicrophoneGain(isSpeaking: boolean): void {
    if (!this.audioInputGain || !this.audioContext) return;
    
    const targetGain = isSpeaking ? 0.1 : 1.0; // Less aggressive than OpenAI
    const currentTime = this.audioContext.currentTime;
    
    this.audioInputGain.gain.cancelScheduledValues(currentTime);
    this.audioInputGain.gain.setValueAtTime(this.audioInputGain.gain.value, currentTime);
    this.audioInputGain.gain.linearRampToValueAtTime(targetGain, currentTime + 0.1);
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Hume EVI Provider: Max reconnection attempts reached');
      this.emit('reconnect.failed');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);
    
    setTimeout(async () => {
      try {
        const apiKey = this.config.apiKey;
        if (apiKey) {
          await this.connect(apiKey, undefined, this.chatGroupId !== null);
          this.reconnectAttempts = 0;
          this.emit('reconnected');
        }
      } catch (error) {
        console.error('Hume EVI Provider: Reconnect failed:', error);
        this.attemptReconnect();
      }
    }, delay);
  }

  private cleanupAudioResources(): void {
    this.isRecording = false;
    
    // Reset VAD state
    this.isUserSpeaking = false;
    this.silenceBuffer = [];
    this.lastAudioTime = 0;
    this.speechStartedTime = 0;
    this.consecutiveSilentChunks = 0;
    
    // Reset audio quality metrics
    this.audioQualityMetrics = {
      inputLevel: 0,
      outputLevel: 0,
      latency: 0,
      dropouts: 0,
      lastDropoutTime: 0,
      totalAudioProcessed: 0,
      totalAudioPlayed: 0
    };

    // Cleanup audio enhancer
    // No audio enhancer to dispose for Hume
    // if (this.audioEnhancer) {
    //   this.audioEnhancer.dispose();
    //   this.audioEnhancer = null;
    // }

    if (this.scriptProcessor) {
      this.scriptProcessor.onaudioprocess = null;
      this.scriptProcessor.disconnect();
      this.scriptProcessor = null;
    }

    if (this.audioInputGain) {
      this.audioInputGain.disconnect();
      this.audioInputGain = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => {
        track.stop();
        this.mediaStream?.removeTrack(track);
      });
      this.mediaStream = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.suspend().then(() => {
        return this.audioContext?.close();
      });
      this.audioContext = null;
    }
  }

  private cleanupWebSocket(): void {
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onerror = null;
      this.ws.onclose = null;
      
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close(1000, 'Normal closure');
      }
      
      this.ws = null;
    }
  }

  private getFreshInstructions(): string {
    return `You are Stella, an empathetic AI assistant helping with AI and automation solutions.
    
    Use your emotional intelligence capabilities to:
    - Detect the user's emotional state and respond appropriately
    - Maintain an encouraging and supportive tone
    - Adapt your communication style based on user preferences
    - Show genuine interest in their business challenges
    
    Your goal is to:
    1. Build rapport and trust through empathetic conversation
    2. Understand their business needs and challenges
    3. Collect qualification information naturally
    4. Demonstrate how AI solutions can transform their business
    
    Follow the same qualification process as before but with enhanced emotional awareness:
    - Listen for emotional cues in their voice and responses
    - Acknowledge their concerns and challenges with empathy
    - Celebrate their successes and positive aspects of their business
    - Adjust your energy level to match their communication style
    
    Be conversational, friendly, and solution-focused while leveraging your emotional intelligence to create a more human-like interaction.`;
  }

  private getContinuingInstructions(): string {
    return `You are Stella, continuing a conversation that started in text. Use your emotional intelligence to:
    
    - Smoothly transition from text to voice interaction
    - Reference previous conversation points with appropriate emotional context
    - Continue building rapport based on what you've learned about the user
    - Maintain consistency with the emotional tone established in text chat
    
    Focus on deepening the conversation about their business needs while demonstrating empathy and understanding for their specific situation.`;
  }

  /**
   * Emit audio quality report for monitoring
   */
  private emitAudioQualityReport(): void {
    const report = {
      ...this.audioQualityMetrics,
      avgLatency: this.audioQualityMetrics.latency,
      dropoutRate: this.audioQualityMetrics.dropouts / Math.max(1, this.audioChunkCount),
      audioEfficiency: this.audioQualityMetrics.totalAudioPlayed / Math.max(1, this.audioQualityMetrics.totalAudioProcessed)
    };
    
    console.log('📊 Audio Quality Report:', {
      avgLatencyMs: report.avgLatency.toFixed(2),
      dropouts: report.dropouts,
      dropoutRate: (report.dropoutRate * 100).toFixed(2) + '%',
      audioEfficiency: (report.audioEfficiency * 100).toFixed(2) + '%',
      totalProcessedMs: report.totalAudioProcessed.toFixed(0),
      totalPlayedMs: report.totalAudioPlayed.toFixed(0)
    });
    
    this.emit('audio_quality_report', report);
  }
  
  /**
   * Get current audio quality metrics
   */
  getAudioQualityMetrics(): typeof this.audioQualityMetrics {
    return { ...this.audioQualityMetrics };
  }
}