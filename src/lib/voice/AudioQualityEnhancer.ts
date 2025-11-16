/**
 * Audio Quality Enhancer for Voice Providers
 * 
 * Implements advanced audio processing to improve voice quality
 * and reduce artifacts like raspiness and crackling
 */

export class AudioQualityEnhancer {
  private audioContext: AudioContext;
  private compressor: DynamicsCompressorNode | null = null;
  private highpassFilter: BiquadFilterNode | null = null;
  private lowpassFilter: BiquadFilterNode | null = null;
  private gainNode: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  
  // Audio quality metrics
  private metrics = {
    averageVolume: 0,
    peakVolume: 0,
    noiseFloor: 0,
    clippingEvents: 0,
    dropouts: 0
  };

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
    this.setupProcessingChain();
  }

  /**
   * Setup the audio processing chain for quality enhancement
   */
  private setupProcessingChain() {
    // Dynamic Range Compression - reduces harsh peaks
    this.compressor = this.audioContext.createDynamicsCompressor();
    this.compressor.threshold.value = -24;    // Start compression at -24dB
    this.compressor.knee.value = 30;          // Smooth knee for natural sound
    this.compressor.ratio.value = 4;          // 4:1 compression ratio
    this.compressor.attack.value = 0.003;     // Fast attack (3ms)
    this.compressor.release.value = 0.25;     // Slow release (250ms)

    // High-pass filter to remove low frequency rumble
    this.highpassFilter = this.audioContext.createBiquadFilter();
    this.highpassFilter.type = 'highpass';
    this.highpassFilter.frequency.value = 80;  // Cut below 80Hz
    this.highpassFilter.Q.value = 0.7;         // Butterworth response

    // Low-pass filter to remove high frequency noise
    this.lowpassFilter = this.audioContext.createBiquadFilter();
    this.lowpassFilter.type = 'lowpass';
    this.lowpassFilter.frequency.value = 8000;  // Cut above 8kHz for voice
    this.lowpassFilter.Q.value = 0.7;

    // Gain control for overall volume
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = 0.9;  // Slight reduction to prevent clipping

    // Analyser for monitoring
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.8;
  }

  /**
   * Process audio through enhancement chain
   */
  processAudioStream(source: MediaStreamAudioSourceNode): AudioNode {
    if (!this.highpassFilter || !this.lowpassFilter || 
        !this.compressor || !this.gainNode || !this.analyser) {
      return source;
    }

    // Connect the processing chain
    source
      .connect(this.highpassFilter)
      .connect(this.lowpassFilter)
      .connect(this.compressor)
      .connect(this.gainNode)
      .connect(this.analyser);

    // Start monitoring
    this.startQualityMonitoring();

    return this.gainNode;
  }

  /**
   * Apply de-noising to audio buffer
   */
  denoiseAudioBuffer(buffer: Float32Array, noiseProfile?: Float32Array): Float32Array {
    const denoised = new Float32Array(buffer.length);
    
    // Simple spectral subtraction denoising
    const windowSize = 256;
    const overlap = 128;
    
    for (let i = 0; i < buffer.length - windowSize; i += overlap) {
      const window = buffer.slice(i, i + windowSize);
      const processed = this.applySpectralGating(window, noiseProfile);
      
      // Overlap-add
      for (let j = 0; j < windowSize; j++) {
        denoised[i + j] += processed[j] * this.hannWindow(j, windowSize);
      }
    }
    
    return denoised;
  }

  /**
   * Apply spectral gating for noise reduction
   */
  private applySpectralGating(window: Float32Array, noiseProfile?: Float32Array): Float32Array {
    // FFT would go here for proper implementation
    // For now, apply simple noise gate
    const threshold = 0.01;
    const gated = new Float32Array(window.length);
    
    for (let i = 0; i < window.length; i++) {
      if (Math.abs(window[i]) < threshold) {
        gated[i] = window[i] * 0.1;  // Reduce quiet parts
      } else {
        gated[i] = window[i];
      }
    }
    
    return gated;
  }

  /**
   * Hann window function for overlap-add
   */
  private hannWindow(n: number, N: number): number {
    return 0.5 * (1 - Math.cos(2 * Math.PI * n / (N - 1)));
  }

  /**
   * Enhanced PCM conversion with dithering
   */
  floatTo16BitPCMWithDithering(input: Float32Array): Int16Array {
    const output = new Int16Array(input.length);
    const ditherAmount = 1.0 / 32768.0;  // 1 LSB of dither
    
    for (let i = 0; i < input.length; i++) {
      // Apply soft limiting to prevent harsh clipping
      let sample = this.softLimit(input[i] * 0.95);
      
      // Add triangular dither for better low-level detail
      const dither = (Math.random() - Math.random()) * ditherAmount;
      sample += dither;
      
      // Convert to 16-bit with proper rounding
      const s = Math.max(-1, Math.min(1, sample));
      output[i] = Math.round(s < 0 ? s * 0x8000 : s * 0x7FFF);
    }
    
    return output;
  }

  /**
   * Soft limiting function to prevent harsh clipping
   */
  private softLimit(x: number): number {
    const threshold = 0.95;
    if (Math.abs(x) <= threshold) {
      return x;
    }
    
    // Soft knee compression above threshold
    const sign = x < 0 ? -1 : 1;
    const abs = Math.abs(x);
    return sign * (threshold + (1 - threshold) * Math.tanh((abs - threshold) / (1 - threshold)));
  }

  /**
   * Monitor audio quality metrics
   */
  private startQualityMonitoring() {
    if (!this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const monitor = () => {
      if (!this.analyser) return;
      
      this.analyser.getByteFrequencyData(dataArray);
      
      // Calculate average volume
      let sum = 0;
      let peak = 0;
      for (let i = 0; i < bufferLength; i++) {
        const value = dataArray[i] / 255;
        sum += value;
        peak = Math.max(peak, value);
      }
      
      this.metrics.averageVolume = sum / bufferLength;
      this.metrics.peakVolume = peak;
      
      // Detect clipping
      if (peak > 0.98) {
        this.metrics.clippingEvents++;
      }
      
      // Detect dropouts (sudden silence)
      if (this.metrics.averageVolume < 0.01) {
        this.metrics.dropouts++;
      }
      
      // Continue monitoring
      requestAnimationFrame(monitor);
    };
    
    monitor();
  }

  /**
   * Adjust processing based on detected issues
   */
  autoAdjustSettings() {
    // If clipping detected, reduce gain
    if (this.metrics.clippingEvents > 10) {
      if (this.gainNode) {
        this.gainNode.gain.value = Math.max(0.5, this.gainNode.gain.value - 0.1);
      }
      this.metrics.clippingEvents = 0;
    }
    
    // If too quiet, increase gain
    if (this.metrics.averageVolume < 0.2 && this.metrics.clippingEvents === 0) {
      if (this.gainNode) {
        this.gainNode.gain.value = Math.min(1.0, this.gainNode.gain.value + 0.05);
      }
    }
  }

  /**
   * Get current audio metrics
   */
  getMetrics() {
    return { ...this.metrics };
  }

  /**
   * Cleanup resources
   */
  dispose() {
    this.compressor?.disconnect();
    this.highpassFilter?.disconnect();
    this.lowpassFilter?.disconnect();
    this.gainNode?.disconnect();
    this.analyser?.disconnect();
  }
}

/**
 * Audio buffer utilities
 */
export class AudioBufferUtils {
  /**
   * Resample audio buffer to target sample rate
   */
  static resample(buffer: Float32Array, fromRate: number, toRate: number): Float32Array {
    if (fromRate === toRate) return buffer;
    
    const ratio = toRate / fromRate;
    const newLength = Math.round(buffer.length * ratio);
    const result = new Float32Array(newLength);
    
    for (let i = 0; i < newLength; i++) {
      const srcIndex = i / ratio;
      const srcIndexInt = Math.floor(srcIndex);
      const srcIndexFrac = srcIndex - srcIndexInt;
      
      if (srcIndexInt + 1 < buffer.length) {
        // Linear interpolation
        result[i] = buffer[srcIndexInt] * (1 - srcIndexFrac) + 
                   buffer[srcIndexInt + 1] * srcIndexFrac;
      } else {
        result[i] = buffer[srcIndexInt];
      }
    }
    
    return result;
  }

  /**
   * Apply fade in/out to prevent pops
   */
  static applyFade(buffer: Float32Array, fadeInSamples: number, fadeOutSamples: number): Float32Array {
    const result = new Float32Array(buffer);
    
    // Fade in
    for (let i = 0; i < fadeInSamples && i < buffer.length; i++) {
      result[i] *= i / fadeInSamples;
    }
    
    // Fade out
    const startFadeOut = buffer.length - fadeOutSamples;
    for (let i = startFadeOut; i < buffer.length; i++) {
      const fadePosition = i - startFadeOut;
      result[i] *= 1 - (fadePosition / fadeOutSamples);
    }
    
    return result;
  }
}