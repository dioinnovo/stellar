/**
 * DEPRECATED: Callback Agent Route
 * 
 * This endpoint is deprecated and redirects to the new unified orchestrate endpoint.
 * Please migrate to /api/orchestrate
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Redirect to new unified endpoint
    const response = await fetch(new URL('/api/orchestrate', request.url).toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: body.message,
        sessionId: body.sessionId,
        conversationType: 'callback',
        customerInfo: body.customerInfo,
        metadata: {
          source: 'callback_agent_redirect',
          deprecated: true,
          ...body.metadata,
        },
      }),
    });

    const data = await response.json();
    
    // Add deprecation warning
    return NextResponse.json({
      ...data,
      warning: 'This endpoint is deprecated. Please use /api/orchestrate instead.',
      migration: {
        old_endpoint: '/api/chat/callback-agent',
        new_endpoint: '/api/orchestrate',
        documentation: '/docs/UNIFIED_LEAD_INTELLIGENCE_SYSTEM.md',
      },
    });
    
  } catch (error) {
    console.error('Callback agent redirect error:', error);
    return NextResponse.json(
      {
        error: 'This endpoint is deprecated. Please use /api/orchestrate instead.',
        migration_guide: '/app/api/MIGRATION_NOTICE.md',
      },
      { status: 410 } // 410 Gone
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      status: 'deprecated',
      message: 'This endpoint has been replaced by /api/orchestrate',
      migration: {
        old_endpoint: '/api/chat/callback-agent',
        new_endpoint: '/api/orchestrate',
        documentation: '/docs/UNIFIED_LEAD_INTELLIGENCE_SYSTEM.md',
      },
    },
    { status: 410 }
  );
}