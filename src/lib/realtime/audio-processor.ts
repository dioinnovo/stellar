/**
 * Audio Processor for Realtime API
 * 
 * Handles PCM16 audio playback with proper queueing to prevent overlapping
 */

export class AudioProcessor {
  private audioContext: AudioContext;
  private audioQueue: AudioBuffer[] = [];
  private isPlaying = false;
  private currentSource: AudioBufferSourceNode | null = null;
  private nextStartTime: number = 0;
  private gainNode: GainNode | null = null;
  
  constructor(sampleRate: number = 24000) {
    this.audioContext = new AudioContext({ 
      sampleRate,
      latencyHint: 'playback' // Optimize for smooth playback
    });
    
    // Create gain node for smooth volume control
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
    this.gainNode.gain.value = 1.0;
  }
  
  /**
   * Add PCM16 audio data to playback queue
   */
  addAudioData(base64Audio: string): void {
    try {
      // Decode base64
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Convert PCM16 to Float32
      const dataView = new DataView(bytes.buffer);
      const float32Array = new Float32Array(len / 2);
      
      for (let i = 0; i < float32Array.length; i++) {
        // Read as little-endian PCM16
        const int16 = dataView.getInt16(i * 2, true);
        float32Array[i] = int16 / 32768.0;
      }
      
      // Create audio buffer
      const audioBuffer = this.audioContext.createBuffer(
        1, // mono
        float32Array.length,
        24000 // sample rate must match
      );
      
      // Copy data to buffer
      audioBuffer.getChannelData(0).set(float32Array);
      
      // Add to queue
      this.audioQueue.push(audioBuffer);
      
      // Start playback if not already playing
      if (!this.isPlaying) {
        this.playNext();
      }
    } catch (error) {
      console.error('Failed to process audio data:', error);
    }
  }
  
  /**
   * Play next audio buffer in queue
   */
  private playNext(): void {
    if (this.audioQueue.length === 0) {
      this.isPlaying = false;
      this.nextStartTime = 0; // Reset timing for next session
      return;
    }
    
    this.isPlaying = true;
    const audioBuffer = this.audioQueue.shift()!;
    
    // Resume context if needed
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    // Create source
    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    
    // Connect through gain node for volume control
    if (this.gainNode) {
      source.connect(this.gainNode);
    } else {
      source.connect(this.audioContext.destination);
    }
    
    // Calculate when to start this buffer for seamless playback
    const currentTime = this.audioContext.currentTime;
    const startTime = Math.max(currentTime, this.nextStartTime);
    
    // Set up end handler
    source.onended = () => {
      this.currentSource = null;
      // Play next buffer after this one ends
      this.playNext();
    };
    
    // Start playback at calculated time for smooth transitions
    source.start(startTime);
    this.currentSource = source;
    
    // Update next start time for seamless queueing
    this.nextStartTime = startTime + audioBuffer.duration;
    
    console.log(`Playing audio buffer at ${startTime.toFixed(3)}s, duration: ${audioBuffer.duration.toFixed(3)}s, queue: ${this.audioQueue.length}`);
  }
  
  /**
   * Clear audio queue and stop playback
   */
  clear(): void {
    // Stop current playback
    if (this.currentSource) {
      try {
        this.currentSource.stop();
        this.currentSource.disconnect();
      } catch (e) {
        // Ignore if already stopped
      }
      this.currentSource = null;
    }
    
    // Clear queue and reset timing
    this.audioQueue = [];
    this.isPlaying = false;
    this.nextStartTime = 0;
  }
  
  /**
   * Resume audio context if suspended
   */
  async resume(): Promise<void> {
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }
  
  /**
   * Get audio context state
   */
  getState(): AudioContextState {
    return this.audioContext.state;
  }
  
  /**
   * Close audio context
   */
  async close(): Promise<void> {
    this.clear();
    await this.audioContext.close();
  }
}