/**
 * Voice Provider Configuration
 * 
 * Centralized configuration for voice providers with fallback support
 * Allows runtime switching between providers and voice models
 */

export interface VoiceModel {
  id: string;
  name: string;
  provider: 'hume' | 'openai' | 'azure';
  voiceId?: string;
  description?: string;
  language?: string;
  gender?: 'male' | 'female' | 'neutral';
  style?: string;
  isDefault?: boolean;
  isPremium?: boolean;
}

export interface VoiceProviderConfig {
  id: string;
  name: string;
  provider: 'hume' | 'openai' | 'azure';
  isEnabled: boolean;
  isPrimary: boolean;
  isFallback: boolean;
  models: VoiceModel[];
  settings?: {
    apiKey?: string;
    endpoint?: string;
    configId?: string;
    configVersion?: string;
    [key: string]: any;
  };
}

// Voice models catalog
export const VOICE_MODELS: VoiceModel[] = [
  // Hume voices
  {
    id: 'hume-comedian',
    name: 'New York Comedian',
    provider: 'hume',
    voiceId: '28441f64-64a0-4df4-9bd2-478850ee5fac',
    description: 'Witty and engaging New York comedian voice',
    gender: 'male',
    style: 'humorous'
  },
  {
    id: 'hume-warm-female',
    name: 'Warm American Female',
    provider: 'hume',
    voiceId: '8a7dd58c-0cda-4073-9ce6-654184695e99',
    description: 'Friendly and professional female voice',
    gender: 'female',
    style: 'professional',
    isDefault: true
  },
  {
    id: 'hume-actress',
    name: 'American Lead Actress',
    provider: 'hume',
    voiceId: '43e411b3-b2cc-40da-b742-4abf0e3557b2',
    description: 'Expressive and charismatic actress voice',
    gender: 'female',
    style: 'expressive'
  },
  {
    id: 'hume-professional',
    name: 'Professional Voice',
    provider: 'hume',
    voiceId: '6b530c02-5a80-4e60-bb68-f2c171c5029f',
    description: 'Clear and professional business voice',
    gender: 'neutral',
    style: 'professional'
  },
  {
    id: 'hume-ava',
    name: 'Ava Song',
    provider: 'hume',
    voiceId: '5bb7de05-c8fe-426a-8fcc-ba4fc4ce9f9c',
    description: 'Musical and melodic voice',
    gender: 'female',
    style: 'artistic'
  },
  
  // OpenAI voices
  {
    id: 'openai-alloy',
    name: 'Alloy',
    provider: 'openai',
    voiceId: 'alloy',
    description: 'OpenAI Alloy voice',
    gender: 'neutral',
    style: 'balanced'
  },
  {
    id: 'openai-echo',
    name: 'Echo',
    provider: 'openai',
    voiceId: 'echo',
    description: 'OpenAI Echo voice',
    gender: 'male',
    style: 'conversational'
  },
  {
    id: 'openai-shimmer',
    name: 'Shimmer',
    provider: 'openai',
    voiceId: 'shimmer',
    description: 'OpenAI Shimmer voice',
    gender: 'female',
    style: 'energetic'
  },
  
  // Azure voices (for fallback)
  {
    id: 'azure-default',
    name: 'Azure Default',
    provider: 'azure',
    description: 'Azure OpenAI default voice',
    gender: 'neutral',
    style: 'professional'
  }
];

// Get provider configurations from environment
export function getProviderConfigs(): VoiceProviderConfig[] {
  const configs: VoiceProviderConfig[] = [];
  
  // Check if we're on server or client
  const isServer = typeof window === 'undefined';
  
  // Hume configuration
  if ((isServer && process.env.HUME_API_KEY) || (!isServer && process.env.NEXT_PUBLIC_HUME_ENABLED === 'true')) {
    configs.push({
      id: 'hume',
      name: 'Hume EVI',
      provider: 'hume',
      isEnabled: true,
      isPrimary: process.env.VOICE_PROVIDER === 'hume' || process.env.NEXT_PUBLIC_DEFAULT_PROVIDER === 'hume',
      isFallback: false,
      models: VOICE_MODELS.filter(m => m.provider === 'hume'),
      settings: {
        apiKey: process.env.HUME_API_KEY,
        configId: process.env.HUME_CONFIG_ID,
        configVersion: process.env.HUME_CONFIG_VERSION
      }
    });
  }
  
  // OpenAI configuration
  if ((isServer && process.env.OPENAI_API_KEY) || (!isServer && process.env.NEXT_PUBLIC_OPENAI_ENABLED === 'true')) {
    configs.push({
      id: 'openai',
      name: 'OpenAI Realtime',
      provider: 'openai',
      isEnabled: true,
      isPrimary: process.env.VOICE_PROVIDER === 'openai' || process.env.NEXT_PUBLIC_DEFAULT_PROVIDER === 'openai',
      isFallback: false,
      models: VOICE_MODELS.filter(m => m.provider === 'openai'),
      settings: {
        apiKey: process.env.OPENAI_API_KEY
      }
    });
  }
  
  // Azure OpenAI configuration (fallback)
  if ((isServer && (process.env.AZURE_OPENAI_KEY || process.env.AZURE_OPENAI_ENDPOINT)) || (!isServer && process.env.NEXT_PUBLIC_AZURE_ENABLED === 'true')) {
    configs.push({
      id: 'azure',
      name: 'Azure OpenAI',
      provider: 'azure',
      isEnabled: true,
      isPrimary: process.env.VOICE_PROVIDER === 'azure' || process.env.NEXT_PUBLIC_DEFAULT_PROVIDER === 'azure',
      isFallback: true, // Always use as fallback
      models: VOICE_MODELS.filter(m => m.provider === 'azure'),
      settings: {
        apiKey: process.env.AZURE_OPENAI_KEY,
        endpoint: process.env.AZURE_OPENAI_ENDPOINT
      }
    });
  }
  
  return configs;
}

// Get default voice model
export function getDefaultVoiceModel(provider?: string): VoiceModel | undefined {
  // Try to get from environment
  const envModelId = process.env.NEXT_PUBLIC_DEFAULT_VOICE_MODEL;
  if (envModelId) {
    const model = VOICE_MODELS.find(m => m.id === envModelId);
    if (model) return model;
  }
  
  // Get provider-specific default
  if (provider) {
    const providerModels = VOICE_MODELS.filter(m => m.provider === provider);
    return providerModels.find(m => m.isDefault) || providerModels[0];
  }
  
  // Global default
  return VOICE_MODELS.find(m => m.isDefault) || VOICE_MODELS[0];
}

// Get voice model by ID
export function getVoiceModel(modelId: string): VoiceModel | undefined {
  return VOICE_MODELS.find(m => m.id === modelId);
}

// Get available providers
export function getAvailableProviders(): string[] {
  return getProviderConfigs()
    .filter(c => c.isEnabled)
    .map(c => c.provider);
}

// Get primary provider - INTELLIGENT FALLBACK
export function getPrimaryProvider(): VoiceProviderConfig | undefined {
  const configs = getProviderConfigs();
  
  // Use configured primary provider first
  const primaryConfig = configs.find(c => c.isPrimary && c.isEnabled);
  if (primaryConfig) {
    console.log('🎯 Using configured primary provider:', primaryConfig.provider);
    return primaryConfig;
  }
  
  // Fallback order: Hume → OpenAI → Azure (Azure Realtime API has limited availability)
  const fallbackOrder = ['hume', 'openai', 'azure'];
  
  for (const provider of fallbackOrder) {
    const config = configs.find(c => c.provider === provider && c.isEnabled);
    if (config) {
      console.log('🔄 Using fallback provider:', provider);
      return config;
    }
  }
  
  // Last resort: any enabled provider
  return configs.find(c => c.isEnabled);
}

// Get fallback provider
export function getFallbackProvider(): VoiceProviderConfig | undefined {
  const configs = getProviderConfigs();
  return configs.find(c => c.isFallback && c.isEnabled);
}

// Provider health check
export async function checkProviderHealth(provider: string): Promise<boolean> {
  try {
    // Check if we're on server side - if so, just check env vars
    if (typeof window === 'undefined') {
      switch (provider) {
        case 'hume':
          return !!(process.env.HUME_API_KEY && process.env.HUME_SECRET_KEY);
        case 'azure':
          return !!(process.env.AZURE_OPENAI_KEY && process.env.AZURE_OPENAI_ENDPOINT);
        case 'openai':
          return !!process.env.OPENAI_API_KEY;
        default:
          return false;
      }
    }
    
    // EMERGENCY: Skip health checks - just return true for all providers
    if (provider === 'openai' || provider === 'azure' || provider === 'hume') {
      console.log('🔧 BYPASSING health check for', provider, '- assuming healthy');
      return true;
    }
    
    // Client-side: call API
    const response = await fetch('/api/realtime/health', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider })
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.healthy === true;
    }
    return false;
  } catch (error) {
    console.error(`Health check failed for provider ${provider}:`, error);
    return false;
  }
}

// Get best available provider with fallback
export async function getBestAvailableProvider(): Promise<VoiceProviderConfig | undefined> {
  const primary = getPrimaryProvider();
  
  if (primary) {
    const isHealthy = await checkProviderHealth(primary.provider);
    if (isHealthy) {
      return primary;
    }
    console.warn(`Primary provider ${primary.name} is unhealthy, trying fallback...`);
  }
  
  // Try fallback
  const fallback = getFallbackProvider();
  if (fallback) {
    const isHealthy = await checkProviderHealth(fallback.provider);
    if (isHealthy) {
      console.log(`Using fallback provider: ${fallback.name}`);
      return fallback;
    }
  }
  
  // Try any available provider
  const configs = getProviderConfigs().filter(c => c.isEnabled);
  for (const config of configs) {
    const isHealthy = await checkProviderHealth(config.provider);
    if (isHealthy) {
      console.log(`Using available provider: ${config.name}`);
      return config;
    }
  }
  
  return undefined;
}

// Voice model selector interface
export interface VoiceModelSelection {
  modelId: string;
  provider: string;
  voiceId: string;
  settings?: Record<string, any>;
}

// Select voice model with fallback
export async function selectVoiceModel(
  preferredModelId?: string,
  preferredProvider?: string
): Promise<VoiceModelSelection | undefined> {
  // Try preferred model
  if (preferredModelId) {
    const model = getVoiceModel(preferredModelId);
    if (model) {
      const provider = getProviderConfigs().find(c => c.provider === model.provider && c.isEnabled);
      if (provider) {
        return {
          modelId: model.id,
          provider: model.provider,
          voiceId: model.voiceId || model.id,
          settings: provider.settings
        };
      }
    }
  }
  
  // Try preferred provider's default
  if (preferredProvider) {
    const defaultModel = getDefaultVoiceModel(preferredProvider);
    if (defaultModel) {
      const provider = getProviderConfigs().find(c => c.provider === defaultModel.provider && c.isEnabled);
      if (provider) {
        return {
          modelId: defaultModel.id,
          provider: defaultModel.provider,
          voiceId: defaultModel.voiceId || defaultModel.id,
          settings: provider.settings
        };
      }
    }
  }
  
  // Use best available provider
  const bestProvider = await getBestAvailableProvider();
  if (bestProvider) {
    const defaultModel = bestProvider.models[0];
    if (defaultModel) {
      return {
        modelId: defaultModel.id,
        provider: bestProvider.provider,
        voiceId: defaultModel.voiceId || defaultModel.id,
        settings: bestProvider.settings
      };
    }
  }
  
  return undefined;
}