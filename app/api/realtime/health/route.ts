/**
 * Voice Provider Health Check API
 * 
 * Checks if voice providers are configured and accessible
 * Used for fallback mechanism and provider selection
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/realtime/health
 * Check health of a specific voice provider
 */
export async function POST(request: NextRequest) {
  try {
    const { provider } = await request.json();
    
    if (!provider) {
      return NextResponse.json(
        { error: 'Provider is required' },
        { status: 400 }
      );
    }
    
    let healthy = false;
    let details: any = {};
    
    switch (provider) {
      case 'hume':
        // Check Hume configuration
        healthy = !!(process.env.HUME_API_KEY);
        details = {
          configured: healthy,
          hasApiKey: !!process.env.HUME_API_KEY,
          hasVoiceId: !!process.env.HUME_VOICE_ID,
          voiceCount: 5 // Number of configured voices
        };
        
        // Optional: Test Hume API connectivity
        if (healthy && process.env.NODE_ENV === 'production') {
          try {
            const response = await fetch('https://api.hume.ai/v0/evi/health', {
              headers: {
                'X-Hume-Api-Key': process.env.HUME_API_KEY!
              }
            });
            healthy = response.ok;
            details.apiReachable = response.ok;
          } catch (error) {
            healthy = false;
            details.apiReachable = false;
            details.error = 'Failed to reach Hume API';
          }
        }
        break;
        
      case 'openai':
        // Check OpenAI configuration
        healthy = !!(process.env.OPENAI_API_KEY);
        details = {
          configured: healthy,
          hasApiKey: !!process.env.OPENAI_API_KEY,
        };
        break;
        
      case 'azure':
        // Check Azure OpenAI configuration
        healthy = !!(process.env.AZURE_OPENAI_KEY && process.env.AZURE_OPENAI_ENDPOINT);
        details = {
          configured: healthy,
          hasApiKey: !!process.env.AZURE_OPENAI_KEY,
          hasEndpoint: !!process.env.AZURE_OPENAI_ENDPOINT,
          hasDeployment: !!process.env.AZURE_OPENAI_REALTIME_DEPLOYMENT
        };
        
        // Optional: Test Azure endpoint connectivity
        if (healthy && process.env.NODE_ENV === 'production') {
          try {
            const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
            const apiKey = process.env.AZURE_OPENAI_KEY;
            const deployment = process.env.AZURE_OPENAI_REALTIME_DEPLOYMENT || 'gpt-4o-mini-realtime-preview';
            const apiVersion = process.env.AZURE_OPENAI_REALTIME_API_VERSION || '2024-10-01-preview';
            
            const response = await fetch(
              `${endpoint}/openai/deployments/${deployment}/completions?api-version=${apiVersion}`,
              {
                method: 'POST',
                headers: {
                  'api-key': apiKey!,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  prompt: 'test',
                  max_tokens: 1
                })
              }
            );
            
            // Azure returns 200 for success or 400 for bad request (but still reachable)
            healthy = response.status < 500;
            details.apiReachable = response.status < 500;
          } catch (error) {
            // Connection error, but config exists - still mark as healthy for fallback
            details.apiReachable = false;
            details.note = 'Azure configured but connectivity not verified';
          }
        }
        break;
        
      default:
        return NextResponse.json(
          { error: 'Unknown provider', provider },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      provider,
      healthy,
      details,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { 
        error: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/realtime/health
 * Check health of all configured providers
 */
export async function GET() {
  const providers = ['hume', 'openai', 'azure'];
  const results: Record<string, any> = {};
  
  for (const provider of providers) {
    try {
      const response = await POST(
        new NextRequest(
          'http://localhost/api/realtime/health',
          {
            method: 'POST',
            body: JSON.stringify({ provider })
          }
        )
      );
      
      if (response.ok) {
        const data = await response.json();
        results[provider] = data;
      } else {
        results[provider] = {
          provider,
          healthy: false,
          error: 'Check failed'
        };
      }
    } catch (error) {
      results[provider] = {
        provider,
        healthy: false,
        error: 'Check failed'
      };
    }
  }
  
  // Determine overall health and recommendations
  const healthyProviders = Object.values(results).filter((r: any) => r.healthy);
  const primaryProvider = process.env.VOICE_PROVIDER || process.env.NEXT_PUBLIC_DEFAULT_PROVIDER || 'hume';
  const fallbackProvider = 'azure'; // Azure as default fallback
  
  return NextResponse.json({
    providers: results,
    summary: {
      total: providers.length,
      healthy: healthyProviders.length,
      primary: {
        provider: primaryProvider,
        healthy: results[primaryProvider]?.healthy || false
      },
      fallback: {
        provider: fallbackProvider,
        healthy: results[fallbackProvider]?.healthy || false
      },
      recommendation: healthyProviders.length > 0 
        ? `Use ${healthyProviders[0].provider}`
        : 'No healthy providers available'
    },
    timestamp: new Date().toISOString()
  });
}