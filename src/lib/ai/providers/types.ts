/**
 * Type definitions for AI providers
 * Using AI SDK v5 patterns
 */

import { CoreMessage, LanguageModel } from 'ai';

export type ProviderType = 'qlik' | 'azure';

export type ModelType = 'quick' | 'stella-pro';

export interface ProviderConfig {
  apiKey: string;
  endpoint?: string;
  maxRetries?: number;
  timeout?: number;
}

export interface QlikConfig extends ProviderConfig {
  tenantUrl: string;
  assistantId: string;
  knowledgeBaseId?: string;
}

export interface AzureConfig extends ProviderConfig {
  resourceName: string;
  deploymentName: string;
  apiVersion?: string;
}

export interface ProviderRegistry {
  qlik: LanguageModel;
  azure: LanguageModel;
}

export interface ChatOptions {
  model: ModelType;
  stream?: boolean;
  temperature?: number;
  maxTokens?: number;
  tools?: Record<string, any>;
}

export interface PolicyMetadata {
  policyId?: string;
  claimId?: string;
  provider?: ProviderType;
  threadId?: string;
  sources?: Array<{
    title: string;
    url?: string;
    excerpt?: string;
  }>;
}

export type PolicyMessage = CoreMessage & {
  metadata?: PolicyMetadata;
  attachments?: {
    policyDocument?: File;
    images?: File[];
  };
};

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency?: number;
  lastCheck: Date;
  errorRate?: number;
}