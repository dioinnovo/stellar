/**
 * Unified Orchestration API Endpoint
 * 
 * Single entry point for all conversation types using the Master Orchestrator
 * Handles chat, callback, email, and form conversations with full multi-agent support
 */

import { NextRequest, NextResponse } from 'next/server';
import { masterOrchestrator } from '@/lib/orchestrator/master';
import { HumanMessage } from '@langchain/core/messages';

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
  };
  metadata?: {
    source?: string;
    platform?: string;
    language?: string;
    referrer?: string;
  };
}

/**
 * Response schema
 */
interface OrchestrateResponse {
  response: string;
  sessionId: string;
  qualification?: {
    isQualified: boolean;
    score: number;
    tier: string;
    reasons: string[];
  };
  recommendations?: {
    primary: string;
    secondary: string[];
  };
  nextAction?: {
    type: string;
    details?: any;
  };
  analytics?: {
    engagementScore: number;
    sentimentTrend: string;
    conversionProbability: number;
  };
  metadata?: {
    conversationType: string;
    phase: string;
    messageCount: number;
  };
}

/**
 * Generate session ID if not provided
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * POST /api/orchestrate
 * Main orchestration endpoint
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
    
    // Get or create session
    let state = masterOrchestrator.getSession(sessionId);
    
    if (!state) {
      // Start new session with initial data
      state = await masterOrchestrator.startSession(
        sessionId,
        conversationType,
        body.message,
        body.customerInfo
      );
    } else {
      // Continue existing session
      const continuedState = await masterOrchestrator.continueSession(
        sessionId,
        body.message
      );
      
      if (!continuedState) {
        throw new Error('Failed to continue conversation');
      }
      
      state = continuedState;
    }
    
    if (!state) {
      throw new Error('Failed to process conversation');
    }
    
    // Extract the latest AI response
    const aiMessages = state.messages
      .filter(msg => msg._getType() === 'ai')
      .map(msg => msg.content.toString());
    
    const latestResponse = aiMessages[aiMessages.length - 1] || 
      "I'm here to help you explore AI and automation solutions. What brings you here today?";
    
    // Build response
    const response: OrchestrateResponse = {
      response: latestResponse,
      sessionId,
      metadata: {
        conversationType: state.conversationType,
        phase: state.currentPhase,
        messageCount: state.messages.length,
      }
    };
    
    // Add qualification if available
    if (state.qualification) {
      response.qualification = {
        isQualified: state.qualification.isQualified,
        score: state.qualification.totalScore,
        tier: state.qualification.tier,
        reasons: state.qualification.qualificationReasons,
      };
    }
    
    // Add recommendations if available
    if (state.recommendations) {
      response.recommendations = {
        primary: state.recommendations.primary.name,
        secondary: state.recommendations.secondary.map(r => r.name),
      };
    }
    
    // Add notification status - removed due to type constraints
    
    // Add conversation status - removed due to type constraints
    
    // Add customer info for debugging - removed due to type constraints
    
    // Add next action if available
    if (state.nextAction?.type) {
      response.nextAction = {
        type: state.nextAction.type,
        details: state.nextAction.details,
      };
    }
    
    // Add analytics
    if (state.analytics) {
      response.analytics = {
        engagementScore: state.analytics.engagementScore,
        sentimentTrend: state.analytics.sentimentTrend,
        conversionProbability: state.analytics.conversionProbability,
      };
    }
    
    // Check if conversation is ending and we have enough info to qualify
    const conversationEnding = latestResponse.toLowerCase().includes('meeting') || 
                              latestResponse.toLowerCase().includes('reach out') ||
                              latestResponse.toLowerCase().includes('contact you') ||
                              latestResponse.toLowerCase().includes('speak soon') ||
                              latestResponse.toLowerCase().includes('follow up') ||
                              latestResponse.toLowerCase().includes('have everything') ||
                              latestResponse.toLowerCase().includes('wonderful')
    
    // Fallback: Also check if we have basic viable lead info even without formal qualification
    const hasViableLeadInfo = !!(
      state.customerInfo?.email && 
      ((state.customerInfo?.currentChallenges && state.customerInfo.currentChallenges.length > 0) || 
       state.customerInfo?.industry || 
       state.customerInfo?.company)
    );
    
    if ((conversationEnding && state.messages.length > 4) || 
        (hasViableLeadInfo && state.messages.length > 6)) {
      
      console.log('🎯 Checking qualification for lead:', {
        sessionId,
        hasEmail: !!state.customerInfo?.email,
        email: state.customerInfo?.email,
        hasChallenges: !!(state.customerInfo?.currentChallenges && state.customerInfo.currentChallenges.length > 0),
        messageCount: state.messages.length,
        isVoice: false // voiceEnabled property not in CustomerInfo type
      });
      
      // Call the qualify endpoint to analyze and send email if qualified
      try {
        const conversationHistory = state.messages.map(msg => ({
          role: msg._getType() === 'human' ? 'user' : 'assistant',
          content: msg.content.toString()
        }))
        
        const qualifyResponse = await fetch(`${request.nextUrl.origin}/api/qualify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            conversationHistory,
            isVoiceConversation: false, // voiceEnabled property not in CustomerInfo type
            customerInfo: state.customerInfo // Pass customer info directly
          })
        })
        
        if (qualifyResponse.ok) {
          const qualifyData = await qualifyResponse.json()
          console.log('📊 Lead qualification completed:', {
            sessionId,
            qualified: qualifyData.qualified,
            score: qualifyData.qualificationScore,
            emailSent: qualifyData.shouldSendNotification
          })
        }
      } catch (qualifyError) {
        console.error('Failed to qualify lead:', qualifyError)
      }
    }
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Orchestration error:', error);
    
    // Return graceful error response
    return NextResponse.json(
      {
        response: "I apologize for the interruption. Let me help you with your AI and automation needs. What specific challenge are you looking to solve?",
        sessionId: generateSessionId(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/orchestrate
 * Get session status and analytics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    if (sessionId) {
      // Get specific session
      const state = masterOrchestrator.getSession(sessionId);
      
      if (!state) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        sessionId,
        status: state.conversationStatus,
        phase: state.currentPhase,
        messageCount: state.messages.length,
        qualified: state.qualification?.isQualified || false,
        score: state.qualification?.totalScore || 0,
        tier: state.qualification?.tier || 'unknown',
        customerInfo: {
          name: state.customerInfo.name,
          company: state.customerInfo.company,
          email: state.customerInfo.email,
        },
        analytics: state.analytics,
        startTime: state.startTime,
        lastUpdate: state.lastUpdateTime,
      });
    } else {
      // Get all sessions analytics
      const sessions = masterOrchestrator.getActiveSessions();
      const analytics = masterOrchestrator.getAnalytics();
      
      return NextResponse.json({
        sessions,
        analytics,
        timestamp: new Date(),
      });
    }
  } catch (error) {
    console.error('GET orchestration error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve session data' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/orchestrate
 * End a session
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }
    
    await masterOrchestrator.endSession(sessionId);
    
    return NextResponse.json({
      message: 'Session ended successfully',
      sessionId,
    });
    
  } catch (error) {
    console.error('DELETE orchestration error:', error);
    return NextResponse.json(
      { error: 'Failed to end session' },
      { status: 500 }
    );
  }
}