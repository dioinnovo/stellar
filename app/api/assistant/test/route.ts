/**
 * Test endpoint for provider functionality
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { getProvider, checkProvidersHealth } from '@/lib/ai/providers/registry';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const testType = searchParams.get('type') || 'health';

  try {
    switch (testType) {
      case 'health': {
        // Test health of all providers
        const health = await checkProvidersHealth();
        return NextResponse.json({
          status: 'success',
          health,
          timestamp: new Date().toISOString(),
        });
      }

      case 'quick': {
        // Test Qlik provider
        try {
          const provider = getProvider('quick');
          const result = await generateText({
            model: provider,
            messages: [{ role: 'user', content: 'What is insurance?' }]
          });

          return NextResponse.json({
            status: 'success',
            provider: 'qlik',
            response: result.text,
            usage: result.usage,
          });
        } catch (error) {
          return NextResponse.json({
            status: 'error',
            provider: 'qlik',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      case 'stella-pro': {
        // Test Azure provider
        try {
          const provider = getProvider('stella-pro');
          const result = await generateText({
            model: provider,
            messages: [{ role: 'user', content: 'What is a deductible?' }]
          });

          return NextResponse.json({
            status: 'success',
            provider: 'azure',
            response: result.text,
            usage: result.usage,
          });
        } catch (error) {
          return NextResponse.json({
            status: 'error',
            provider: 'azure',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      case 'both': {
        // Test both providers
        const results = {
          qlik: { status: 'pending' as any, response: null as any },
          azure: { status: 'pending' as any, response: null as any },
        };

        // Test Qlik
        try {
          const qlikProvider = getProvider('quick');
          const qlikResult = await generateText({
            model: qlikProvider,
            messages: [{ role: 'user', content: 'Hello' }]
          });
          results.qlik = { status: 'success', response: qlikResult.text };
        } catch (error) {
          results.qlik = {
            status: 'error',
            response: error instanceof Error ? error.message : 'Failed'
          };
        }

        // Test Azure
        try {
          const azureProvider = getProvider('stella-pro');
          const azureResult = await generateText({
            model: azureProvider,
            messages: [{ role: 'user', content: 'Hello' }]
          });
          results.azure = { status: 'success', response: azureResult.text };
        } catch (error) {
          results.azure = {
            status: 'error',
            response: error instanceof Error ? error.message : 'Failed'
          };
        }

        return NextResponse.json({
          status: 'success',
          results,
          timestamp: new Date().toISOString(),
        });
      }

      default:
        return NextResponse.json({
          error: 'Invalid test type. Use: health, quick, stella-pro, or both',
        }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}