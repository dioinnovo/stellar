/**
 * Voice Provider Session API
 * 
 * Generates tokens and configuration for voice provider connections
 * Supports OpenAI Realtime API, Hume EVI, Azure OpenAI with dynamic fallback
 */

import { NextRequest, NextResponse } from 'next/server';
// Using environment variables for OpenAI configuration instead of direct import
import { selectVoiceModel, getVoiceModel, getBestAvailableProvider, checkProviderHealth } from '@/lib/voice/voice-config';

/**
 * POST /api/realtime/session
 * Generate tokens and configuration for voice providers with fallback support
 */
export async function POST(request: NextRequest) {
  try {
    const { 
      sessionId, 
      provider: requestedProvider, 
      voiceProvider, 
      voiceProfile,
      modelId,
      useFallback = true 
    } = await request.json();
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Try to select voice model with the requested parameters
    let modelSelection = await selectVoiceModel(modelId, requestedProvider || voiceProvider);
    let provider = modelSelection?.provider || requestedProvider || voiceProvider || process.env.VOICE_PROVIDER || 'hume';
    let selectedVoiceId = modelSelection?.voiceId;
    
    // Check if primary provider is healthy (skip for unknown providers)
    let isPrimaryHealthy = true;
    if (['hume', 'openai', 'azure'].includes(provider)) {
      isPrimaryHealthy = await checkProviderHealth(provider);
    } else {
      isPrimaryHealthy = false; // Unknown provider
    }
    
    if (!isPrimaryHealthy && useFallback) {
      console.warn(`Primary provider ${provider} is unhealthy/unknown, attempting fallback...`);
      
      // Try fallback to Azure OpenAI
      if (provider !== 'azure') {
        const azureHealthy = await checkProviderHealth('azure');
        if (azureHealthy) {
          console.log('Falling back to Azure OpenAI');
          provider = 'azure';
          selectedVoiceId = undefined; // Azure will use default voice
        }
      }
      
      // If Azure also fails, try any available provider
      if (!await checkProviderHealth(provider)) {
        const bestProvider = await getBestAvailableProvider();
        if (bestProvider) {
          console.log(`Using best available provider: ${bestProvider.provider}`);
          provider = bestProvider.provider;
          selectedVoiceId = bestProvider.models[0]?.voiceId;
        } else {
          return NextResponse.json(
            { 
              error: 'No voice providers available',
              details: 'All configured voice providers are unavailable. Please check your configuration.',
              fallbackAttempted: true,
              checkedProviders: ['hume', 'openai', 'azure']
            },
            { status: 503 }
          );
        }
      }
    }

    // Handle different voice providers
    switch (provider) {
      case 'hume': {
        const apiKey = process.env.HUME_API_KEY;
        const secretKey = process.env.HUME_SECRET_KEY;
        
        if (!apiKey || !secretKey) {
          // If Hume not configured and fallback enabled, try Azure
          if (useFallback) {
            console.warn('Hume not configured (missing keys), attempting Azure fallback...');
            provider = 'azure';
            // Fall through to Azure case
          } else {
            return NextResponse.json(
              { 
                error: 'Hume EVI not configured',
                details: 'Please configure both HUME_API_KEY and HUME_SECRET_KEY in your environment variables.',
                configurationGuide: 'See documentation for Hume EVI setup instructions'
              },
              { status: 503 }
            );
          }
        } else {
          // In production, use the token service for security
          const useSecureToken = process.env.NODE_ENV === 'production' || process.env.USE_SECURE_TOKENS === 'true';
          
          if (useSecureToken) {
            // Generate secure token instead of exposing API key
            const tokenRequest = {
              sessionId,
              voiceProfile: voiceProfile || 'default',
              scope: 'evi:access' as const,
              expiresIn: 3600
            };
            
            // Call our internal token service
            const tokenResponse = await fetch(`${request.nextUrl.origin}/api/hume/token`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(tokenRequest)
            });
            
            if (tokenResponse.ok) {
              const tokenData = await tokenResponse.json();
              return NextResponse.json({
                token: tokenData.token,
                provider: 'hume',
                sessionId,
                expiresIn: 3600,
                expiresAt: tokenData.expiresAt,
                config: {
                  configId: process.env.HUME_CONFIG_ID,
                  configVersion: process.env.HUME_CONFIG_VERSION,
                  voiceId: selectedVoiceId || tokenData.voiceId,
                  verboseTranscription: true,
                  ...tokenData.config
                },
                secure: true,
                modelInfo: modelSelection
              });
            }
          }
          
          // Development mode: Direct API key (with warning)
          // Select voice based on profile, modelId, or use default
          if (!selectedVoiceId) {
            selectedVoiceId = process.env.HUME_VOICE_ID; // Default voice
            
            if (voiceProfile) {
              // Support named profiles (actress, professional, friendly, support, etc.)
              const profileEnvKey = `HUME_VOICE_ID_${voiceProfile.toUpperCase()}`;
              const profileVoiceId = process.env[profileEnvKey];
              
              if (profileVoiceId) {
                selectedVoiceId = profileVoiceId;
                console.log(`Using voice profile: ${voiceProfile} (${profileEnvKey})`);
              } else {
                console.log(`Voice profile '${voiceProfile}' not found, using default voice`);
              }
            }
          }

          return NextResponse.json({
            token: apiKey,
            secretKey: secretKey,
            provider: 'hume',
            sessionId,
            expiresIn: 3600,
            config: {
              configId: process.env.HUME_CONFIG_ID,
              configVersion: process.env.HUME_CONFIG_VERSION,
              voiceId: selectedVoiceId,
              verboseTranscription: true
            },
            warning: process.env.NODE_ENV === 'development' ? 
              'Using direct API keys in development. Production will use secure tokens.' : undefined,
            modelInfo: modelSelection
          });
        }
      }

      case 'azure':
      case 'openai': {
        // Check if using Azure OpenAI (either as primary or fallback)
        const isAzure = provider === 'azure' || !!process.env.AZURE_OPENAI_ENDPOINT;
        
        if (isAzure) {
          // For Azure OpenAI, we'll use the API key directly
          const apiKey = process.env.AZURE_OPENAI_KEY;
          const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
          const deployment = process.env.AZURE_OPENAI_REALTIME_DEPLOYMENT || 
                            process.env.AZURE_OPENAI_DEPLOYMENT_GPT4O || 
                            process.env.AZURE_OPENAI_DEPLOYMENT ||
                            'gpt-4o-mini-realtime-preview';
          
          if (!apiKey || !endpoint) {
            console.error('Azure OpenAI configuration missing:', {
              hasKey: !!apiKey,
              hasEndpoint: !!endpoint,
              deployment
            });
            
            // If Azure fails and we haven't tried other providers, attempt them
            if (useFallback && provider === 'azure') {
              return NextResponse.json(
                { 
                  error: 'Azure OpenAI configuration missing',
                  details: 'Azure OpenAI is not properly configured and no other providers are available.',
                  fallbackAttempted: true
                },
                { status: 503 }
              );
            }
            
            throw new Error('Azure OpenAI configuration missing. Please check your environment variables.');
          }

          // Construct WebSocket URL for Azure Realtime
          const apiVersion = process.env.AZURE_OPENAI_REALTIME_API_VERSION || '2024-10-01-preview';
          const endpointUrl = new URL(endpoint);
          const wsProtocol = endpointUrl.protocol === 'https:' ? 'wss:' : 'ws:';
          const wsHost = endpointUrl.hostname;
          
          const wsUrl = `${wsProtocol}//${wsHost}/openai/realtime?api-version=${apiVersion}&deployment=${deployment}&api-key=${apiKey}`;
          
          return NextResponse.json({
            token: apiKey,
            wsUrl,
            endpoint,
            deployment,
            provider: 'openai',
            subProvider: 'azure',
            sessionId,
            expiresIn: 3600,
            isFallback: provider === 'azure' && (requestedProvider !== 'azure' && voiceProvider !== 'azure'),
            originalProvider: requestedProvider || voiceProvider,
            modelInfo: modelSelection
          });
        } else {
          // Direct OpenAI
          const apiKey = process.env.OPENAI_API_KEY;
          
          if (!apiKey) {
            // Try Azure fallback
            if (useFallback) {
              console.warn('OpenAI not configured, attempting Azure fallback...');
              provider = 'azure';
              // Recursively call with Azure
              return POST(new NextRequest(request.url, {
                method: 'POST',
                body: JSON.stringify({
                  ...await request.json(),
                  provider: 'azure'
                })
              }));
            }
            
            console.error('OpenAI API key not configured. Please set OPENAI_API_KEY or Azure OpenAI credentials.');
            return NextResponse.json(
              { 
                error: 'Voice assistant not configured',
                details: 'Please configure either OPENAI_API_KEY or Azure OpenAI credentials in your environment variables.',
                configurationGuide: 'See /docs/REALTIME_VOICE_SETUP.md for setup instructions'
              },
              { status: 503 }
            );
          }

          // WARNING: This is not secure for production!
          if (process.env.NODE_ENV === 'production') {
            return NextResponse.json(
              { error: 'Ephemeral key generation not implemented for production' },
              { status: 501 }
            );
          }

          return NextResponse.json({
            token: apiKey,
            provider: 'openai',
            subProvider: 'direct',
            sessionId,
            expiresIn: 3600,
            warning: 'Using development mode - implement ephemeral tokens for production',
            modelInfo: modelSelection
          });
        }
      }

      default: {
        return NextResponse.json(
          { 
            error: 'Unsupported voice provider',
            details: `Provider '${provider}' is not supported. Available providers: openai, hume, azure`
          },
          { status: 400 }
        );
      }
    }
  } catch (error) {
    console.error('Error generating session token:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate session token',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/realtime/session
 * Check voice provider configuration and health
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const checkHealth = searchParams.get('checkHealth') === 'true';
    
    // Check available providers
    const providers: Record<string, any> = {};
    
    // Check OpenAI configuration
    const isAzure = !!process.env.AZURE_OPENAI_ENDPOINT;
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    
    if (isAzure || hasOpenAI) {
      providers.openai = {
        configured: true,
        subProvider: isAzure ? 'azure' : 'direct',
        features: ['realtime', 'transcription', 'tts', 'vad', 'interruption_handling'],
        healthy: checkHealth ? await checkProviderHealth(isAzure ? 'azure' : 'openai') : undefined
      };
    }
    
    // Check Azure separately if it exists
    if (isAzure) {
      providers.azure = {
        configured: true,
        features: ['realtime', 'transcription', 'tts', 'vad', 'interruption_handling', 'fallback'],
        healthy: checkHealth ? await checkProviderHealth('azure') : undefined,
        isFallback: true
      };
    }
    
    // Check Hume EVI configuration
    const hasHume = !!process.env.HUME_API_KEY;
    if (hasHume) {
      providers.hume = {
        configured: true,
        features: ['speech_to_speech', 'emotional_intelligence', 'prosody_control', 'context_preservation', 'transcription'],
        healthy: checkHealth ? await checkProviderHealth('hume') : undefined
      };
    }
    
    // Determine default and fallback providers
    const defaultProvider = process.env.VOICE_PROVIDER || process.env.NEXT_PUBLIC_DEFAULT_PROVIDER || 'hume';
    const fallbackProvider = isAzure ? 'azure' : (hasOpenAI ? 'openai' : null);
    const isConfigured = Object.keys(providers).length > 0;
    
    // Get best available if health check is requested
    let recommendedProvider = defaultProvider;
    if (checkHealth) {
      const bestProvider = await getBestAvailableProvider();
      if (bestProvider) {
        recommendedProvider = bestProvider.provider;
      }
    }
    
    return NextResponse.json({
      configured: isConfigured,
      providers,
      defaultProvider,
      fallbackProvider,
      recommendedProvider,
      availableProviders: Object.keys(providers),
      sessionId,
      status: isConfigured ? 'ready' : 'not_configured'
    });
  } catch (error) {
    console.error('Error checking session configuration:', error);
    return NextResponse.json(
      { error: 'Failed to check configuration' },
      { status: 500 }
    );
  }
}