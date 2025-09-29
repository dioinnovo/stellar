/**
 * Provider Registry
 * Central management for all AI providers using AI SDK v5
 */

import { LanguageModel } from 'ai';
// import { QlikProvider } from './qlik-provider'; // Temporarily disabled
import { getAzureModel, checkAzureHealth } from './azure-setup';
import { ModelType, ProviderType, HealthStatus } from './types';

// Initialize Qlik provider (singleton) - currently falls back to Azure
function getQlikProvider(): LanguageModel {
  // For now, fall back to Azure until Qlik provider is fully compatible with AI SDK v5
  console.warn('Qlik provider temporarily disabled, falling back to Azure');
  return getAzureModel();
}

// Provider mapping
export const providers = {
  qlik: getQlikProvider,
  azure: () => getAzureModel(),
} as const;

// Model to provider mapping
const modelProviderMap: Record<ModelType, ProviderType> = {
  'quick': 'qlik',
  'stella-pro': 'azure',
};

/**
 * Get the appropriate provider for a model type
 */
export function getProvider(model: ModelType): LanguageModel {
  const providerType = modelProviderMap[model];

  if (!providerType) {
    throw new Error(`Unknown model type: ${model}`);
  }

  // Get the provider with fallback support
  try {
    return providers[providerType]();
  } catch (error) {
    console.error(`Failed to get ${providerType} provider:`, error);

    // Fallback to Azure if enabled
    if (process.env.AI_PROVIDER_FALLBACK === 'true' && providerType !== 'azure') {
      console.log('Falling back to Azure provider');
      return providers.azure();
    }

    throw error;
  }
}

/**
 * Get provider by type directly
 */
export function getProviderByType(type: ProviderType): LanguageModel {
  return providers[type]();
}

/**
 * Check health status of all providers
 */
export async function checkProvidersHealth(): Promise<Record<ProviderType, HealthStatus>> {
  const results: Record<ProviderType, HealthStatus> = {
    qlik: {
      status: 'unhealthy',
      lastCheck: new Date(),
    },
    azure: {
      status: 'unhealthy',
      lastCheck: new Date(),
    },
  };

  // Qlik health check disabled - provider falls back to Azure
  results.qlik = {
    status: 'unhealthy',
    latency: 0,
    lastCheck: new Date(),
  };

  // Check Azure health
  try {
    const azureHealth = await checkAzureHealth();
    results.azure = {
      status: azureHealth.status,
      latency: azureHealth.latency,
      lastCheck: new Date(),
    };
  } catch (error) {
    console.error('Azure health check failed:', error);
  }

  return results;
}

/**
 * Reset provider state (useful for new conversations)
 */
export function resetProviderState(type?: ProviderType): void {
  if (type === 'qlik' || !type) {
    // Qlik provider disabled - no reset needed
    console.log('Qlik provider reset requested but provider is disabled');
  }
}

// Export types for convenience
export type { ModelType, ProviderType } from './types';