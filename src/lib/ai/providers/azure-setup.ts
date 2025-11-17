/**
 * Azure OpenAI Provider Setup
 * Using AI SDK v5 @ai-sdk/azure
 */

import { createAzure } from '@ai-sdk/azure';
import { LanguageModel } from 'ai';

// Extract resource name from endpoint URL
function getResourceName(): string {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT || '';
  const match = endpoint.match(/https:\/\/([^.]+)\./);
  return match ? match[1] : 'diod-mevihjma-eastus2';
}

// Initialize Azure provider with environment variables
export const azureProvider = createAzure({
  apiKey: process.env.AZURE_OPENAI_KEY || '',
  resourceName: getResourceName(),
  // Note: apiVersion will be handled by the SDK automatically
});

// Model configurations - map deployment names to models
export const azureModels = {
  'gpt-4o-mini': () => azureProvider('gpt-4o-mini'),
  'gpt-5-chat': () => azureProvider('gpt-5-chat-01'),
  'gpt-4o-mini-realtime': () => azureProvider('gpt-4o-mini-realtime-preview'),
} as const;

// Get the default model for Stella Pro (expert analysis)
export function getAzureModel(deploymentName?: string): LanguageModel {
  const deployment = deploymentName || process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o-mini';

  if (deployment in azureModels) {
    return azureModels[deployment as keyof typeof azureModels]();
  }

  // Fallback to creating a model with the deployment name
  return azureProvider(deployment);
}

// Health check for Azure
export async function checkAzureHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  latency?: number;
  error?: string;
}> {
  const startTime = Date.now();

  try {
    // Make a minimal completion request to check if the service is available
    const response = await fetch(
      `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=${process.env.AZURE_OPENAI_VERSION}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.AZURE_OPENAI_KEY || '',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 1,
        }),
      }
    );

    const latency = Date.now() - startTime;

    if (response.ok) {
      return { status: 'healthy', latency };
    }

    return {
      status: 'unhealthy',
      latency,
      error: `Azure API responded with ${response.status}`,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}