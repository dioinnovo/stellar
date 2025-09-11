/**
 * Realtime API Configuration Check
 * 
 * Diagnostic endpoint to verify Realtime API configuration
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/realtime/check
 * Check Realtime API configuration and provide diagnostics
 */
export async function GET(request: NextRequest) {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    configuration: {
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      hasAzureEndpoint: !!process.env.AZURE_OPENAI_ENDPOINT,
      hasAzureKey: !!process.env.AZURE_OPENAI_KEY,
      hasAzureDeployment: !!process.env.AZURE_OPENAI_REALTIME_DEPLOYMENT,
      provider: process.env.AZURE_OPENAI_ENDPOINT ? 'azure' : process.env.OPENAI_API_KEY ? 'openai' : 'none'
    },
    recommendations: [] as string[],
    errors: [] as string[],
    warnings: [] as string[]
  };

  // Check for any configuration
  if (!process.env.OPENAI_API_KEY && !process.env.AZURE_OPENAI_ENDPOINT) {
    diagnostics.errors.push('No API configuration found');
    diagnostics.recommendations.push('Set OPENAI_API_KEY in .env.local for OpenAI direct access');
    diagnostics.recommendations.push('Or configure Azure OpenAI with AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_KEY');
  }

  // Check OpenAI configuration
  if (process.env.OPENAI_API_KEY) {
    const key = process.env.OPENAI_API_KEY;
    if (!key.startsWith('sk-')) {
      diagnostics.warnings.push('OpenAI API key should start with "sk-"');
    }
    if (key.length < 40) {
      diagnostics.warnings.push('OpenAI API key seems too short');
    }
    diagnostics.recommendations.push('Ensure your OpenAI account has access to the Realtime API (beta feature)');
    diagnostics.recommendations.push('Check your usage at: https://platform.openai.com/usage');
  }

  // Check Azure configuration
  if (process.env.AZURE_OPENAI_ENDPOINT) {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const key = process.env.AZURE_OPENAI_KEY;
    
    if (!key) {
      diagnostics.errors.push('Azure endpoint configured but AZURE_OPENAI_KEY is missing');
    } else {
      // Validate key format (Azure keys are typically 32 characters)
      if (key.length < 30) {
        diagnostics.warnings.push('Azure API key seems too short');
      }
      // diagnostics.configuration.azureKeyLength = key.length; // Property not in type
    }
    
    if (!endpoint.startsWith('https://')) {
      diagnostics.warnings.push('Azure endpoint should start with https://');
    }
    
    // Check for cognitive services URL pattern
    if (!endpoint.includes('.openai.azure.com') && !endpoint.includes('.cognitiveservices.azure.com')) {
      diagnostics.warnings.push('Azure endpoint should include .openai.azure.com or .cognitiveservices.azure.com');
    }
    
    const deployment = process.env.AZURE_OPENAI_REALTIME_DEPLOYMENT || process.env.AZURE_OPENAI_DEPLOYMENT_GPT4O || 'gpt-4o-mini-realtime-preview';
    // diagnostics.configuration.deployment = deployment; // Property not in type
    
    // Check if using realtime-specific deployment
    if (!deployment.includes('realtime')) {
      diagnostics.warnings.push(`Deployment "${deployment}" doesn't include "realtime" - ensure it supports Realtime API`);
      diagnostics.recommendations.push(`Consider using AZURE_OPENAI_REALTIME_DEPLOYMENT env variable for realtime-specific model`);
    }
    
    diagnostics.recommendations.push('Verify your Azure deployment supports the Realtime API');
    diagnostics.recommendations.push('Check deployment in Azure OpenAI Studio');
    // diagnostics.configuration.azureEndpoint = endpoint.replace(/https?:\/\//, '').split('.')[0]; // Property not in type
  }

  // Test connectivity (optional - only if we want to actually test the connection)
  const testConnection = request.nextUrl.searchParams.get('test') === 'true';
  if (testConnection && diagnostics.configuration.provider !== 'none') {
    try {
      // We can't directly test WebSocket from server-side, but we can check if the configuration would work
      // diagnostics.configuration.testResult = 'Configuration appears valid for connection attempt'; // Property not in type
    } catch (error) {
      // diagnostics.configuration.testResult = `Configuration test failed: ${error}`; // Property not in type
    }
  }

  // Determine overall status
  const status = diagnostics.errors.length > 0 ? 'error' : 
                 diagnostics.warnings.length > 0 ? 'warning' : 
                 diagnostics.configuration.provider !== 'none' ? 'ready' : 'not_configured';

  return NextResponse.json({
    status,
    message: getStatusMessage(status),
    diagnostics,
    quickFix: getQuickFix(diagnostics)
  });
}

function getStatusMessage(status: string): string {
  switch (status) {
    case 'ready':
      return 'Realtime API configuration appears ready';
    case 'warning':
      return 'Configuration found but may have issues';
    case 'error':
      return 'Configuration errors detected';
    case 'not_configured':
      return 'Realtime API not configured';
    default:
      return 'Unknown status';
  }
}

function getQuickFix(diagnostics: any): string[] {
  const fixes: string[] = [];
  
  if (diagnostics.configuration.provider === 'none') {
    fixes.push('Create a .env.local file in /nextjs-app directory');
    fixes.push('Add OPENAI_API_KEY=sk-... to the file');
    fixes.push('Restart the development server');
  }
  
  if (diagnostics.errors.length > 0) {
    fixes.push('Fix the errors listed above');
    fixes.push('Check your environment variables are properly set');
  }
  
  if (diagnostics.warnings.length > 0) {
    fixes.push('Review the warnings for potential issues');
  }
  
  return fixes;
}