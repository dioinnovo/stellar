/**
 * Enhanced Orchestration API with Streaming Support
 * 
 * Features:
 * - Real-time streaming responses
 * - State persistence across sessions
 * - Parallel agent execution
 * - Comprehensive error handling
 * - Session management with TTL
 */

import { NextRequest, NextResponse } from 'next/server';
import { HumanMessage } from '@langchain/core/messages';
import { enhancedOrchestrator } from '@/lib/orchestrator/enhanced-master';
import { runQualification } from '@/lib/orchestrator/qualification-subgraph';

/**
 * Request body schema
 */
interface OrchestrateRequest {
  message: string;
  sessionId?: string;
  conversationType?: 'chat' | 'callback' | 'email' | 'form';
  customerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    title?: string;
    industry?: string;
    budget?: string;
  };
  metadata?: {
    source?: string;
    platform?: string;
    language?: string;
    referrer?: string;
  };
  streamResponse?: boolean; // Enable streaming
}

/**
 * Generate session ID if not provided
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * POST /api/orchestrate/enhanced
 * Enhanced orchestration with streaming support
 */
export async function POST(request: NextRequest) {
  try {
    const body: OrchestrateRequest = await request.json();
    
    // Validate required fields
    if (!body.message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }
    
    // Generate or use provided session ID
    const sessionId = body.sessionId || generateSessionId();
    const conversationType = body.conversationType || 'chat';
    
    // Get current state or initialize
    let currentState = await enhancedOrchestrator.getState(sessionId);
    
    if (!currentState.values || Object.keys(currentState.values).length === 0) {
      // Initialize new session
      currentState = {
        values: {
          sessionId,
          conversationType,
          messages: [],
          customerInfo: body.customerInfo || {},
          conversationStatus: 'active',
          currentPhase: 'greeting',
          analytics: {
            conversationDuration: 0,
            messageCount: 0,
            engagementScore: 0,
            sentimentTrend: 'neutral',
            keyMoments: [],
            conversionProbability: 0,
          },
          agentExecutions: [],
          notificationsSent: [],
          errors: [],
          startTime: new Date(),
          lastUpdateTime: new Date(),
        },
        next: [],
        config: {},
        tasks: []
      };
    }
    
    // Add user message to state
    const userMessage = new HumanMessage(body.message);
    const input = {
      messages: [userMessage],
      customerInfo: body.customerInfo ? 
        { ...currentState.values.customerInfo, ...body.customerInfo } : 
        currentState.values.customerInfo,
      lastUpdateTime: new Date(),
    };
    
    // Check if streaming is requested
    if (body.streamResponse) {
      // Return streaming response
      const stream = new ReadableStream({
        async start(controller) {
          try {
            // Stream state updates
            for await (const chunk of enhancedOrchestrator.stream(input, sessionId)) {
              // Format chunk for SSE
              const data = JSON.stringify({
                type: 'state_update',
                data: chunk,
                timestamp: new Date().toISOString(),
              });
              
              controller.enqueue(
                new TextEncoder().encode(`data: ${data}\n\n`)
              );
            }
            
            // Send completion event
            controller.enqueue(
              new TextEncoder().encode(`data: {"type":"complete"}\n\n`)
            );
            
            controller.close();
          } catch (error) {
            console.error('Streaming error:', error);
            controller.error(error);
          }
        },
      });
      
      return new NextResponse(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }
    
    // Non-streaming response
    const result = await enhancedOrchestrator.invoke(input, sessionId);
    
    // Run qualification sub-graph if we have enough info
    let qualification = result.qualification;
    if (!qualification && result.customerInfo?.email) {
      qualification = await runQualification(
        result.customerInfo,
        result.messages || []
      );
      
      // Update state with qualification
      if (qualification) {
        await enhancedOrchestrator.updateState(sessionId, { qualification });
      }
    }
    
    // Extract assistant response
    const assistantMessages = result.messages?.filter(
      m => m._getType() === 'ai'
    ) || [];
    const latestAssistant = assistantMessages[assistantMessages.length - 1];
    const latestResponse = latestAssistant?.content || 'How can I help you today?';
    
    // Extract UI action from message or state
    const uiAction = latestAssistant?.additional_kwargs?.ui_action || 
                     result.latestUiAction;
    
    // Format response
    const response = {
      response: latestResponse,
      sessionId,
      uiAction,
      qualification: qualification ? {
        isQualified: qualification.isQualified,
        score: qualification.totalScore,
        tier: qualification.tier,
        reasons: qualification.qualificationReasons,
        details: {
          budget: qualification.budget.score,
          authority: qualification.authority.score,
          need: qualification.need.score,
          timeline: qualification.timeline.score,
        },
      } : undefined,
      recommendations: result.recommendations ? {
        primary: result.recommendations.primary.name,
        secondary: result.recommendations.secondary.map(r => r.name),
        estimatedValue: result.recommendations.estimatedValue,
      } : undefined,
      nextAction: result.nextAction?.type ? {
        type: result.nextAction.type,
        details: result.nextAction.details,
      } : undefined,
      analytics: result.analytics ? {
        engagementScore: result.analytics.engagementScore,
        sentimentTrend: result.analytics.sentimentTrend,
        conversionProbability: result.analytics.conversionProbability,
        messageCount: result.analytics.messageCount,
      } : undefined,
      metadata: {
        conversationType: result.conversationType || conversationType,
        phase: result.currentPhase || 'greeting',
        messageCount: result.messages?.length || 0,
        sessionActive: result.conversationStatus === 'active',
      },
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Enhanced orchestration error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/orchestrate/enhanced
 * Get current session state
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }
    
    // Get current state
    const state = await enhancedOrchestrator.getState(sessionId);
    
    if (!state.values || Object.keys(state.values).length === 0) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    // Return sanitized state
    return NextResponse.json({
      sessionId,
      customerInfo: state.values.customerInfo,
      qualification: state.values.qualification,
      recommendations: state.values.recommendations,
      analytics: state.values.analytics,
      conversationStatus: state.values.conversationStatus,
      currentPhase: state.values.currentPhase,
      messageCount: state.values.messages?.length || 0,
      startTime: state.values.startTime,
      lastUpdateTime: state.values.lastUpdateTime,
    });
    
  } catch (error) {
    console.error('Get state error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/orchestrate/enhanced
 * Update session state directly
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, updates } = body;
    
    if (!sessionId || !updates) {
      return NextResponse.json(
        { error: 'Session ID and updates are required' },
        { status: 400 }
      );
    }
    
    // Update state
    await enhancedOrchestrator.updateState(sessionId, updates);
    
    return NextResponse.json({ 
      success: true,
      sessionId,
      updatedAt: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Update state error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}