/**
 * LangChain Provider Configuration
 * 
 * Single Azure resource with multiple model deployments
 * Automatically selects the best model based on requirements
 */

import { AzureChatOpenAI } from '@langchain/openai';

export type ModelDeployment = 'gpt4o' | 'gpt5' | 'default';

/**
 * Get configured Azure OpenAI model instance
 * Uses single endpoint/key with different deployment names
 */
export function getAzureModel(deployment?: ModelDeployment) {
  // Get shared configuration
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT || '';
  const apiKey = process.env.AZURE_OPENAI_KEY || '';
  const apiVersion = process.env.AZURE_OPENAI_VERSION || '2024-12-01-preview';
  
  // Determine deployment name
  let deploymentName: string;
  if (!deployment || deployment === 'default') {
    deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o';
  } else if (deployment === 'gpt4o') {
    deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_GPT4O || 'gpt-4o';
  } else if (deployment === 'gpt5') {
    deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_GPT5 || 'gpt-5-chat-01';
  } else {
    deploymentName = deployment;
  }
  
  // Extract instance name from endpoint
  let instanceName = process.env.AZURE_OPENAI_INSTANCE_NAME;
  if (!instanceName && endpoint) {
    // Extract from endpoint: https://xxx.openai.azure.com or https://xxx.cognitiveservices.azure.com
    const match = endpoint.match(/https:\/\/([^.\/]+)/);
    if (match) {
      instanceName = match[1];
    }
  }
  
  if (!instanceName || !apiKey) {
    throw new Error('Azure OpenAI configuration missing. Check AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_KEY');
  }
  
  console.log(`🤖 Using Azure OpenAI: ${deploymentName}`);
  
  return new AzureChatOpenAI({
    azureOpenAIApiKey: apiKey,
    azureOpenAIApiInstanceName: instanceName,
    azureOpenAIApiDeploymentName: deploymentName,
    azureOpenAIApiVersion: apiVersion,
    temperature: 0.3,
    maxTokens: 500,
  });
}

/**
 * Get conversation model with structured output support
 * Uses default deployment from env
 */
export function getConversationModel() {
  return getAzureModel('default');
}

/**
 * Model settings for conversations
 */
export const CONVERSATION_SETTINGS = {
  temperature: 0.3,
  maxTokens: 500,
  topP: 0.95,
  frequencyPenalty: 0,
  presencePenalty: 0,
};

/**
 * Check if model supports json_schema
 * GPT-4o and GPT-4 Turbo support it, GPT-5 doesn't yet
 */
export function supportsJsonSchema(deploymentName: string): boolean {
  const lowerName = deploymentName.toLowerCase();
  return lowerName.includes('gpt-4o') ||
         lowerName.includes('gpt-4-turbo') ||
         lowerName.includes('gpt-4-o');
}

/**
 * Get the best model for structured output
 * Prefers GPT-4o for json_schema support, falls back to GPT-5
 */
export function getBestModelForStructuredOutput(): AzureChatOpenAI {
  const defaultDeployment = process.env.AZURE_OPENAI_DEPLOYMENT || '';
  
  // If default is GPT-4o, use it
  if (defaultDeployment.toLowerCase().includes('gpt-4o')) {
    console.log('✅ Using GPT-4o for structured output (json_schema support)');
    return getAzureModel('default');
  }
  
  // Check if GPT-4o is available
  const gpt4oDeployment = process.env.AZURE_OPENAI_DEPLOYMENT_GPT4O;
  if (gpt4oDeployment && gpt4oDeployment !== 'gpt-4o') {
    console.log('✅ Using GPT-4o for structured output (json_schema support)');
    return getAzureModel('gpt4o');
  }
  
  // Fallback to GPT-5 with jsonMode
  console.log('⚠️ Using GPT-5 for structured output (jsonMode only - less reliable)');
  return getAzureModel('gpt5');
}