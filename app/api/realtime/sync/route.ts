/**
 * Realtime Transcript Sync API
 * 
 * Synchronizes voice transcripts with LangGraph orchestrator
 * Maintains conversation continuity across voice and text modalities
 */

import { NextRequest, NextResponse } from 'next/server';
import { masterOrchestrator } from '@/lib/orchestrator/master';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { extractEmailFromText, extractPhoneFromText } from '@/lib/utils';

interface SyncRequest {
  sessionId: string;
  transcript: string;
  role: 'user' | 'assistant';
  timestamp?: string;
  metadata?: {
    duration?: number;
    confidence?: number;
    language?: string;
    source?: string;
    inputType?: string;
  };
}

/**
 * POST /api/realtime/sync
 * Sync voice transcript with orchestrator
 */
export async function POST(request: NextRequest) {
  try {
    const body: SyncRequest = await request.json();
    
    // Validate required fields
    if (!body.sessionId || !body.transcript || !body.role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Get or create session
    let state = masterOrchestrator.getSession(body.sessionId);
    
    if (!state) {
      // Start new voice session if it doesn't exist
      state = await masterOrchestrator.startSession(
        body.sessionId,
        'chat', // Use chat type to maintain consistency
        body.role === 'user' ? body.transcript : undefined,
        {
          // source and voiceEnabled properties not in CustomerInfo type
        }
      );
      
      // If this is an assistant message in a new session, add it
      if (body.role === 'assistant' && state) {
        const aiMessage = new AIMessage(body.transcript);
        aiMessage.additional_kwargs = {
          timestamp: body.timestamp,
          source: 'realtime_voice',
          metadata: body.metadata
        };
        state.messages.push(aiMessage);
      }
    } else {
      // Continue existing session
      if (body.role === 'user') {
        console.log('🎤 Processing user voice transcript through orchestrator');
        
        // First, try to extract email/phone from the user's message directly
        const extractedEmail = extractEmailFromText(body.transcript);
        const extractedPhone = extractPhoneFromText(body.transcript);
        
        if (extractedEmail) {
          console.log('📧 Extracted email from user transcript:', extractedEmail);
          state.customerInfo.email = extractedEmail;
        }
        
        if (extractedPhone) {
          console.log('📞 Extracted phone from user transcript:', extractedPhone);
          state.customerInfo.phone = extractedPhone;
        }
        
        // Process user input through orchestrator - this runs conversation agent
        state = (await masterOrchestrator.continueSession(
          body.sessionId,
          body.transcript,
          body.metadata
        )) || undefined;
        
        // The conversation agent has now extracted structured data and updated customerInfo
        console.log('📊 Voice session state after processing:', {
          sessionId: body.sessionId,
          messageLength: state?.messages?.length,
          hasEmail: !!state?.customerInfo?.email,
          email: state?.customerInfo?.email,
          hasPhone: !!state?.customerInfo?.phone,
          hasCompany: !!state?.customerInfo?.company,
          company: state?.customerInfo?.company,
          isQualified: state?.qualification?.isQualified,
          score: state?.qualification?.totalScore,
          tier: state?.qualification?.tier,
          notificationsSent: state?.notificationsSent?.length || 0,
          conversationStatus: state?.conversationStatus
        });
        
        // Check if we should trigger notification after processing
        if (state && state.qualification?.isQualified && state.customerInfo?.email) {
          // Check if notification has already been sent
          const notificationSent = state.notificationsSent?.some(n => 
            n.type === 'follow_up' || n.type === 'meeting' // Use valid notification types
          );
          
          if (!notificationSent) {
            console.log('🔔 Voice session qualified - triggering notification');
            console.log('📧 Customer info for notification:', {
              name: state.customerInfo.name,
              email: state.customerInfo.email,
              company: state.customerInfo.company,
              // challenges: state.customerInfo.currentChallenges, // Property not in type
              // budget: state.customerInfo.budget, // Property not in type
              // timeline: state.customerInfo.timeline, // Property not in type
              // role: state.customerInfo.role // Property not in type
            });
            
            // Run the notification step
            await masterOrchestrator.triggerNotification(body.sessionId);
            
            // Refresh state to get notification status
            state = masterOrchestrator.getSession(body.sessionId) || state;
            
            console.log('📬 After notification trigger:', {
              notificationsSent: state.notificationsSent?.length || 0,
              notifications: state.notificationsSent
            });
          } else {
            console.log('⚠️ Notification already sent for this session');
          }
        }
      } else {
        // Assistant message from voice - still process for extraction
        const aiMessage = new AIMessage(body.transcript);
        aiMessage.additional_kwargs = {
          timestamp: body.timestamp,
          source: 'realtime_voice',
          metadata: body.metadata
        };
        
        // Add to messages
        state.messages.push(aiMessage);
        
        // Try to extract any customer info from assistant's transcript too
        // (in case the assistant repeated back customer info)
        const extractedEmail = extractEmailFromText(body.transcript);
        const extractedPhone = extractPhoneFromText(body.transcript);
        
        if (extractedEmail && !state.customerInfo.email) {
          state.customerInfo.email = extractedEmail;
          console.log('📧 Extracted email from assistant transcript:', extractedEmail);
        }
        
        if (extractedPhone && !state.customerInfo.phone) {
          state.customerInfo.phone = extractedPhone;
          console.log('📞 Extracted phone from assistant transcript:', extractedPhone);
        }
        
        // Update session analytics
        state.analytics = {
          ...state.analytics,
          messageCount: state.analytics.messageCount + 1,
          conversationDuration: 
            (new Date().getTime() - new Date(state.startTime).getTime()) / 1000,
        };
        
        // Preserve any pending confirmation state from the conversation agent
        if ((state as any).pendingConfirmation) {
          console.log('📝 Preserving pending confirmation state:', (state as any).pendingConfirmation);
        }
        
        // Save the updated state
        masterOrchestrator.updateSession(body.sessionId, state);
      }
    }
    
    if (!state) {
      throw new Error('Failed to process transcript');
    }
    
    // Build response with conversation state
    const response = {
      success: true,
      sessionId: body.sessionId,
      messageCount: state.messages.length,
      conversationStatus: state.conversationStatus,
      currentPhase: state.currentPhase,
    };
    
    // Add UI action from the latest conversation response if available
    if (state.latestUiAction) {
      (response as any).uiAction = state.latestUiAction;
    }
    
    // CRITICAL FIX: Always return AI response for ALL user input so Hume can speak it
    // This ensures BANT workflow compliance for both typed and verbal input
    if (body.role === 'user') {
      const latestAIMessage = state.messages
        .slice()
        .reverse()
        .find(msg => msg._getType() === 'ai');
      
      if (latestAIMessage) {
        (response as any).aiResponse = {
          message: latestAIMessage.content.toString(),
          timestamp: new Date().toISOString()
        };
        console.log('🗣️ AI response for typed input confirmation:', latestAIMessage.content.toString());
      }
    }
    
    // Add qualification status if available
    if (state.qualification) {
      (response as any).qualification = {
        isQualified: state.qualification.isQualified,
        score: state.qualification.totalScore,
        tier: state.qualification.tier,
      };
    }
    
    // Add customer info if extracted
    if (state.customerInfo && Object.keys(state.customerInfo).length > 0) {
      (response as any).customerInfo = {
        name: state.customerInfo.name,
        email: state.customerInfo.email,
        company: state.customerInfo.company,
        phone: state.customerInfo.phone,
      };
    }
    
    // Check for pending UI actions that should be triggered after speech completes
    // This is for assistant messages that have finished being spoken
    if (body.role === 'assistant' && (body.metadata as any)?.speechCompleted) {
      const latestAIMessage = state.messages
        .slice()
        .reverse()
        .find(msg => msg._getType() === 'ai');
      
      if (latestAIMessage?.additional_kwargs?.pending_ui_action) {
        // Convert pending_ui_action to actual ui_action now that speech is done
        const pendingAction = latestAIMessage.additional_kwargs.pending_ui_action;
        (response as any).uiAction = {
          type: 'show_text_input',
          inputType: (pendingAction as any).inputType,
          placeholder: (pendingAction as any).placeholder
        };
        console.log('📝 Triggering delayed UI action after speech:', pendingAction);
      }
    }
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Transcript sync error:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync transcript',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/realtime/sync
 * Get voice session status and history
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
    
    // Get session state
    const state = masterOrchestrator.getSession(sessionId);
    
    if (!state) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    // Extract conversation history
    const history = state.messages.map(msg => ({
      role: msg._getType() === 'human' ? 'user' : 'assistant',
      content: msg.content.toString(),
      timestamp: msg.additional_kwargs?.timestamp || null,
    }));
    
    return NextResponse.json({
      sessionId,
      history,
      messageCount: history.length,
      conversationStatus: state.conversationStatus,
      currentPhase: state.currentPhase,
      qualification: state.qualification,
      customerInfo: {
        name: state.customerInfo.name,
        email: state.customerInfo.email,
        company: state.customerInfo.company,
        phone: state.customerInfo.phone,
      },
      startTime: state.startTime,
      lastUpdate: state.lastUpdateTime,
    });
    
  } catch (error) {
    console.error('Error retrieving sync data:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve session data' },
      { status: 500 }
    );
  }
}