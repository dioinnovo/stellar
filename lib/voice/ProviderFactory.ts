/**
 * Voice Provider Factory
 * 
 * Factory for creating and managing voice provider instances
 * Enables easy switching between different voice AI providers
 */

import { IVoiceProvider, VoiceConfig, VoiceProvider, ProviderConstructor, ProviderRegistry } from './providers/IVoiceProvider';
import { OpenAIVoiceProvider } from './providers/OpenAIVoiceProvider';
import { HumeEVIVoiceProvider } from './providers/HumeEVIVoiceProvider';

// Registry of available providers
const PROVIDER_REGISTRY: ProviderRegistry = {
  'openai': OpenAIVoiceProvider,
  'hume': HumeEVIVoiceProvider  // RE-ENABLED - Use proven patterns
};

// Default configurations for each provider
const DEFAULT_PROVIDER_CONFIGS: Record<VoiceProvider, Partial<VoiceConfig>> = {
  openai: {
    provider: 'openai',
    openai: {
      voice: 'alloy',
      model: 'gpt-4o-realtime-preview',
      wsUrl: 'wss://api.openai.com/v1/realtime'
    }
  },
  hume: {
    provider: 'hume',
    hume: {
      voiceId: 'default',
      verboseTranscription: true,
      configId: undefined,
      configVersion: undefined,
      resumedChatGroupId: undefined
    }
  }
};

export class VoiceProviderFactory {
  private static instance: VoiceProviderFactory;
  private activeProviders: Map<string, IVoiceProvider> = new Map();
  
  private constructor() {}
  
  static getInstance(): VoiceProviderFactory {
    if (!VoiceProviderFactory.instance) {
      VoiceProviderFactory.instance = new VoiceProviderFactory();
    }
    return VoiceProviderFactory.instance;
  }

  /**
   * Create a voice provider instance
   */
  createProvider(config: VoiceConfig): IVoiceProvider {
    const providerType = config.provider;
    
    if (!providerType) {
      throw new Error('Provider type must be specified in config');
    }
    
    if (!this.isProviderSupported(providerType)) {
      throw new Error(`Unsupported provider: ${providerType}. Supported providers: ${this.getSupportedProviders().join(', ')}`);
    }
    
    // Merge with default configuration
    const mergedConfig = this.mergeWithDefaults(config);
    
    // Validate configuration
    this.validateConfig(mergedConfig);
    
    // Create provider instance
    const ProviderClass = PROVIDER_REGISTRY[providerType];
    const provider = new ProviderClass(mergedConfig);
    
    // Store in active providers (for cleanup and management)
    const providerId = `${providerType}-${config.sessionId}`;
    this.activeProviders.set(providerId, provider);
    
    // Set up cleanup on disconnect
    provider.once('disconnected', () => {
      this.activeProviders.delete(providerId);
    });
    
    console.log(`Voice Provider Factory: Created ${providerType} provider for session ${config.sessionId}`);
    
    return provider;
  }

  /**
   * Get or create a provider for a session
   */
  getProvider(sessionId: string, config?: VoiceConfig): IVoiceProvider | null {
    // Try to find existing provider first
    for (const [providerId, provider] of this.activeProviders.entries()) {
      if (providerId.includes(sessionId)) {
        return provider;
      }
    }
    
    // Create new provider if config provided
    if (config) {
      return this.createProvider(config);
    }
    
    return null;
  }

  /**
   * Switch provider for an existing session
   */
  async switchProvider(sessionId: string, newConfig: VoiceConfig, preserveContext: boolean = true): Promise<IVoiceProvider> {
    console.log(`Voice Provider Factory: Switching provider for session ${sessionId} to ${newConfig.provider}`);
    
    // Get existing provider and context
    const existingProvider = this.getProvider(sessionId);
    let context: Array<{ text: string; isUser: boolean }> = [];
    let wasConnected = false;
    let wasInCall = false;
    
    if (existingProvider) {
      const connectionState = existingProvider.getConnectionState();
      wasConnected = connectionState.isConnected;
      wasInCall = connectionState.isCallActive;
      
      // TODO: Extract context from existing provider if needed
      // This would require implementing a getContext() method
      
      // Disconnect existing provider
      existingProvider.disconnect();
    }
    
    // Create new provider
    const newProvider = this.createProvider(newConfig);
    
    // Restore state if requested
    if (preserveContext && wasConnected) {
      try {
        // Connect new provider
        await newProvider.connect(undefined, undefined, context.length > 0);
        
        // Set context if available
        if (context.length > 0) {
          newProvider.setContext(context);
        }
        
        // Resume call if it was active
        if (wasInCall) {
          await newProvider.startCall();
        }
        
      } catch (error) {
        console.error('Voice Provider Factory: Error restoring state:', error);
        throw error;
      }
    }
    
    return newProvider;
  }

  /**
   * Get all supported providers
   */
  getSupportedProviders(): VoiceProvider[] {
    return Object.keys(PROVIDER_REGISTRY) as VoiceProvider[];
  }

  /**
   * Check if a provider is supported
   */
  isProviderSupported(provider: VoiceProvider): boolean {
    return provider in PROVIDER_REGISTRY;
  }

  /**
   * Get provider capabilities
   */
  getProviderCapabilities(provider: VoiceProvider): {
    name: string;
    version: string;
    voices: string[];
    features: string[];
  } | null {
    if (!this.isProviderSupported(provider)) {
      return null;
    }
    
    const ProviderClass = PROVIDER_REGISTRY[provider];
    const tempInstance = new ProviderClass({
      provider,
      sessionId: 'temp'
    });
    
    return {
      name: tempInstance.getProviderName(),
      version: tempInstance.getProviderVersion(),
      voices: tempInstance.getSupportedVoices(),
      features: tempInstance.getSupportedFeatures()
    };
  }

  /**
   * Get recommended provider based on requirements
   */
  getRecommendedProvider(requirements: {
    emotionalIntelligence?: boolean;
    contextPreservation?: boolean;
    toolIntegration?: boolean;
    prosodyControl?: boolean;
    lowLatency?: boolean;
  }): VoiceProvider {
    const { 
      emotionalIntelligence, 
      contextPreservation, 
      prosodyControl,
      lowLatency 
    } = requirements;
    
    // Hume EVI is better for emotional intelligence and prosody
    if (emotionalIntelligence || prosodyControl) {
      return 'hume';
    }
    
    // OpenAI is more mature and has lower latency
    if (lowLatency) {
      return 'openai';
    }
    
    // Default to OpenAI for general use
    return 'openai';
  }

  /**
   * Create provider from environment configuration
   */
  createFromEnvironment(sessionId: string, orchestratorEndpoint?: string): IVoiceProvider {
    // NUCLEAR OPTION: Close ALL WebSocket connections to kill Hume
    console.log('🔧 NUCLEAR: Closing all WebSocket connections');
    if (typeof window !== 'undefined') {
      // Force close any existing WebSocket connections
      const wsConnections = (window as any).webSocketConnections || [];
      wsConnections.forEach((ws: WebSocket) => {
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close(1000, 'Forced cleanup');
        }
      });
    }
    
    // EMERGENCY FIX: Disconnect all existing providers to force clean state
    console.log('🔧 EMERGENCY: Disconnecting all providers to force OpenAI');
    this.disconnectAll();
    
    const provider = this.getProviderFromEnv();
    const config = this.buildConfigFromEnv(provider, sessionId, orchestratorEndpoint);
    
    console.log('🔧 Creating new provider:', provider, 'with config:', config);
    return this.createProvider(config);
  }

  /**
   * Disconnect all active providers
   */
  disconnectAll(): void {
    console.log(`Voice Provider Factory: Disconnecting ${this.activeProviders.size} active providers`);
    
    for (const [providerId, provider] of this.activeProviders.entries()) {
      try {
        provider.disconnect();
      } catch (error) {
        console.error(`Voice Provider Factory: Error disconnecting ${providerId}:`, error);
      }
    }
    
    this.activeProviders.clear();
  }

  /**
   * Get active provider count
   */
  getActiveProviderCount(): number {
    return this.activeProviders.size;
  }

  // Private methods

  private getProviderFromEnv(): VoiceProvider {
    // TEMPORARY FIX: Force OpenAI to bypass localStorage override
    const envProvider = process.env.NEXT_PUBLIC_VOICE_PROVIDER;
    if (envProvider && this.isProviderSupported(envProvider as VoiceProvider)) {
      console.log('🔧 Forcing provider from environment:', envProvider);
      return envProvider as VoiceProvider;
    }
    
    // Fallback to OpenAI (working implementation)
    console.log('🔧 Using default OpenAI provider');
    return 'openai';
  }

  private buildConfigFromEnv(provider: VoiceProvider, sessionId: string, orchestratorEndpoint?: string): VoiceConfig {
    const baseConfig: VoiceConfig = {
      provider,
      sessionId,
      orchestratorEndpoint
    };

    if (provider === 'openai') {
      return {
        ...baseConfig,
        openai: {
          voice: 'alloy', // Can be made configurable
          model: 'gpt-4o-realtime-preview'
        }
      };
    }

    if (provider === 'hume') {
      return {
        ...baseConfig,
        hume: {
          voiceId: 'default', // Can be made configurable
          verboseTranscription: true
        }
      };
    }

    return baseConfig;
  }

  private mergeWithDefaults(config: VoiceConfig): VoiceConfig {
    const defaults = DEFAULT_PROVIDER_CONFIGS[config.provider];
    
    return {
      ...defaults,
      ...config,
      // Deep merge provider-specific configs
      [config.provider]: {
        ...defaults[config.provider],
        ...config[config.provider]
      }
    };
  }

  private validateConfig(config: VoiceConfig): void {
    if (!config.sessionId) {
      throw new Error('Session ID is required');
    }

    if (!config.provider) {
      throw new Error('Provider is required');
    }

    // Provider-specific validation
    if (config.provider === 'openai') {
      const openaiConfig = config.openai;
      if (openaiConfig?.voice && !['alloy', 'echo', 'shimmer'].includes(openaiConfig.voice)) {
        throw new Error(`Invalid OpenAI voice: ${openaiConfig.voice}`);
      }
    }

    if (config.provider === 'hume') {
      // Hume-specific validation can be added here
      // e.g., validate configId format, voiceId, etc.
    }
  }
}

// Export convenience functions
export const voiceProviderFactory = VoiceProviderFactory.getInstance();

export function createVoiceProvider(config: VoiceConfig): IVoiceProvider {
  return voiceProviderFactory.createProvider(config);
}

export function switchVoiceProvider(sessionId: string, newConfig: VoiceConfig, preserveContext: boolean = true): Promise<IVoiceProvider> {
  return voiceProviderFactory.switchProvider(sessionId, newConfig, preserveContext);
}

export function getRecommendedVoiceProvider(requirements: {
  emotionalIntelligence?: boolean;
  contextPreservation?: boolean;
  toolIntegration?: boolean;
  prosodyControl?: boolean;
  lowLatency?: boolean;
}): VoiceProvider {
  return voiceProviderFactory.getRecommendedProvider(requirements);
}

// Export types
export type { VoiceConfig, VoiceProvider, IVoiceProvider };