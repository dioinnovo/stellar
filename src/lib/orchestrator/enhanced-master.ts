/**
 * Enhanced Master Orchestrator with Persistence and Parallel Processing
 * 
 * Improvements:
 * - State persistence with checkpointer
 * - Parallel agent execution
 * - Streaming support
 * - Better error handling
 * - Session management with TTL
 */

import { StateGraph, END, MemorySaver } from '@langchain/langgraph';
import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import {
  MasterOrchestratorAnnotation,
  MasterOrchestratorState,
  createInitialState,
  isQualified,
  getQualificationTier,
  calculateFinalScore,
} from './state';

// Import all agent nodes
// TODO: Fix these imports - conversationNode and other nodes need to be properly exported
// import { conversationNode } from '../agents/conversation-langchain';
// import { recommendationNode } from '../agents/recommendation';
// import { schedulingNode } from '../agents/scheduling';
// import { notificationNode } from '../agents/notification';
// import { analyticsNode } from '../agents/analytics';
// import { nurtureNode } from '../agents/nurture';

// Temporary placeholder nodes
const conversationNode = async (state: any) => state;
const recommendationNode = async (state: any) => state;
const schedulingNode = async (state: any) => state;
const notificationNode = async (state: any) => state;
const analyticsNode = async (state: any) => state;
const nurtureNode = async (state: any) => state;
import { 
  shouldTriggerUICollection, 
  handleUIResponse,
  UIInteractionState,
  UIToolCall 
} from './ui-interaction-graph';

// Session management with TTL
interface SessionMetadata {
  createdAt: Date;
  lastActivity: Date;
  ttl: number; // in milliseconds
}

class SessionManager {
  private sessions = new Map<string, SessionMetadata>();
  private readonly DEFAULT_TTL = 30 * 60 * 1000; // 30 minutes

  async getSession(sessionId: string): Promise<boolean> {
    const metadata = this.sessions.get(sessionId);
    if (!metadata) return false;

    const now = Date.now();
    const expiry = metadata.lastActivity.getTime() + metadata.ttl;
    
    if (now > expiry) {
      this.sessions.delete(sessionId);
      return false;
    }

    // Update last activity
    metadata.lastActivity = new Date();
    return true;
  }

  async createSession(sessionId: string, ttl?: number): Promise<void> {
    this.sessions.set(sessionId, {
      createdAt: new Date(),
      lastActivity: new Date(),
      ttl: ttl || this.DEFAULT_TTL,
    });
  }

  async cleanup(): Promise<void> {
    const now = Date.now();
    for (const [sessionId, metadata] of this.sessions) {
      const expiry = metadata.lastActivity.getTime() + metadata.ttl;
      if (now > expiry) {
        this.sessions.delete(sessionId);
        console.log(`🧹 Cleaned up expired session: ${sessionId}`);
      }
    }
  }
}

// Enhanced error recovery with exponential backoff
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      const delay = baseDelay * Math.pow(2, i);
      console.error(`Retry ${i + 1}/${maxRetries} after ${delay}ms:`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Parallel processing node for analytics and recommendations
 */
async function parallelProcessingNode(
  state: MasterOrchestratorState
): Promise<Partial<MasterOrchestratorState>> {
  console.log('🚀 Running parallel processing for analytics and recommendations');
  
  // Only run if we have enough information
  if (!state.customerInfo?.email || !state.qualification) {
    return {};
  }

  try {
    // Run analytics and recommendation in parallel
    const [analyticsResult, recommendationResult] = await Promise.allSettled([
      withRetry(() => analyticsNode(state)),
      withRetry(() => recommendationNode(state)),
    ]);

    const updates: Partial<MasterOrchestratorState> = {};

    if (analyticsResult.status === 'fulfilled') {
      Object.assign(updates, analyticsResult.value);
    } else {
      console.error('Analytics failed:', analyticsResult.reason);
    }

    if (recommendationResult.status === 'fulfilled') {
      Object.assign(updates, recommendationResult.value);
    } else {
      console.error('Recommendation failed:', recommendationResult.reason);
    }

    return updates;
  } catch (error) {
    console.error('Parallel processing error:', error);
    return {
      errors: [{
        timestamp: new Date(),
        agent: 'parallel_processing',
        error: String(error),
        recovered: false,
      }],
    };
  }
}

/**
 * UI interaction node for proper email/phone collection
 */
async function uiInteractionNode(
  state: MasterOrchestratorState
): Promise<Partial<MasterOrchestratorState>> {
  console.log('🖥️ UI Interaction Node - Collecting contact info');
  
  const hasEmail = !!state.customerInfo?.email;
  const hasPhone = !!state.customerInfo?.phone;
  
  // Determine what to collect
  if (!hasEmail) {
    // Ask for email with UI push
    const askEmailMessage = new AIMessage({
      content: "I'd be happy to have our AI strategist reach out with specific solutions for your needs. What's the best email address to reach you? I'll open a secure form for you to enter it.",
      additional_kwargs: {
        ui_action: {
          type: 'push_ui',
          inputType: 'email',
          placeholder: 'your@email.com',
        },
      },
    });
    
    return {
      messages: [askEmailMessage],
      latestUiAction: {
        type: 'show_text_input',
        inputType: 'email',
        placeholder: 'your@email.com',
      },
      conversationTurn: {
        ...state.conversationTurn,
        waitingForUser: true,
        lastQuestionAsked: askEmailMessage.content.toString(),
        questionTimestamp: new Date(),
      },
    };
  } else if (!hasPhone) {
    // Confirm email and ask for phone with UI push
    const askPhoneMessage = new AIMessage({
      content: `Perfect! I have your email as ${state.customerInfo.email}. Now, what's the best phone number for our strategist to reach you? I'll open another form for you.`,
      additional_kwargs: {
        ui_action: {
          type: 'push_ui',
          inputType: 'phone',
          placeholder: '(555) 123-4567',
        },
      },
    });
    
    return {
      messages: [askPhoneMessage],
      latestUiAction: {
        type: 'show_text_input',
        inputType: 'phone',
        placeholder: '(555) 123-4567',
      },
      conversationTurn: {
        ...state.conversationTurn,
        waitingForUser: true,
        lastQuestionAsked: typeof askPhoneMessage.content === 'string' ? askPhoneMessage.content : JSON.stringify(askPhoneMessage.content),
        questionTimestamp: new Date(),
      },
    };
  } else {
    // Both collected - confirm and continue
    const confirmMessage = new AIMessage(
      `Excellent! I have your contact information:\n` +
      `Email: ${state.customerInfo.email}\n` +
      `Phone: ${state.customerInfo.phone}\n\n` +
      `Our AI strategist will reach out to you shortly to discuss how we can help with your automation needs.`
    );
    
    return {
      messages: [confirmMessage],
      latestUiAction: {
        type: 'hide_text_input',
        inputType: null,
        placeholder: null,
      },
    };
  }
}

/**
 * Enhanced router with UI interaction support
 */
function routeAfterConversation(state: MasterOrchestratorState): string | typeof END {
  // Check for errors
  const lastError = state.errors[state.errors.length - 1];
  if (lastError && !lastError.recovered) {
    return 'error_recovery';
  }

  // Check if we're waiting for UI response - wait for user input
  if (state.latestUiAction?.type === 'show_text_input') {
    // End here to wait for user response
    return END;
  }

  // Check if we should trigger UI collection
  // Only if we have business context but no contact info
  const hasChallenges = (state.customerInfo?.currentChallenges?.length ?? 0) > 0;
  const hasEmail = !!state.customerInfo?.email;
  const hasPhone = !!state.customerInfo?.phone;

  if (hasChallenges && !hasEmail && !hasPhone) {
    return 'ui_interaction';
  }

  // Check if we should run parallel processing
  if (state.qualification && !state.recommendations) {
    return 'parallel_processing';
  }

  // Check if qualified for notification
  if (state.qualification?.isQualified && 
      state.customerInfo?.email &&
      !state.notificationsSent?.some(n => n.type === 'qualification')) {
    return 'notification';
  }

  // Check for nurture flow
  if (state.qualification && !state.qualification.isQualified) {
    return 'nurture';
  }

  // Default to END
  return END;
}

/**
 * Enhanced error recovery node
 */
async function enhancedErrorRecoveryNode(
  state: MasterOrchestratorState
): Promise<Partial<MasterOrchestratorState>> {
  const lastError = state.errors[state.errors.length - 1];
  
  console.error(`🔧 Error recovery for ${lastError.agent}:`, lastError.error);
  
  // Mark error as recovered
  const updatedErrors = [...state.errors];
  updatedErrors[updatedErrors.length - 1].recovered = true;
  
  // Generate contextual recovery message
  let recoveryMessage = "I apologize for the brief interruption. ";
  
  if (lastError.agent === 'notification') {
    recoveryMessage += "I'll make sure our team gets your information. ";
  } else if (lastError.agent === 'parallel_processing') {
    recoveryMessage += "Let me continue helping you with your needs. ";
  }
  
  recoveryMessage += "How else can I assist you today?";
  
  return {
    errors: updatedErrors,
    messages: [new AIMessage(recoveryMessage)],
  };
}

/**
 * Build enhanced master orchestrator with persistence
 */
export function buildEnhancedMasterOrchestrator() {
  // Create memory saver for persistence
  const memorySaver = new MemorySaver();
  const sessionManager = new SessionManager();
  
  // Start cleanup interval (every 5 minutes)
  setInterval(() => sessionManager.cleanup(), 5 * 60 * 1000);
  
  // Create the enhanced state graph
  const workflow = new StateGraph(MasterOrchestratorAnnotation)
    // Core nodes
    .addNode('conversation', conversationNode)
    .addNode('ui_interaction', uiInteractionNode)
    .addNode('parallel_processing', parallelProcessingNode)
    .addNode('notification', notificationNode)
    .addNode('nurture', nurtureNode)
    .addNode('scheduling', schedulingNode)
    .addNode('error_recovery', enhancedErrorRecoveryNode)
    
    // Define edges
    .addEdge('__start__', 'conversation')
    .addConditionalEdges('conversation', routeAfterConversation)
    .addConditionalEdges('ui_interaction', (state) => {
      // After UI interaction, END to wait for user response
      return END;
    })
    .addConditionalEdges('parallel_processing', (state) => {
      // After parallel processing, check if we need notification
      if (state.qualification?.isQualified && state.customerInfo?.email) {
        return 'notification';
      }
      return END;
    })
    .addEdge('notification', END)
    .addEdge('nurture', END)
    .addEdge('scheduling', END)
    .addEdge('error_recovery', 'conversation');
  
  // Compile with checkpointer for persistence
  const compiledGraph = workflow.compile({
    checkpointer: memorySaver,
  });
  
  return {
    graph: compiledGraph,
    sessionManager,
    
    // Enhanced invoke with session management
    async invoke(
      input: Partial<MasterOrchestratorState>,
      sessionId: string
    ) {
      // Check/create session
      const sessionExists = await sessionManager.getSession(sessionId);
      if (!sessionExists) {
        await sessionManager.createSession(sessionId);
      }
      
      // Run with checkpointing
      const result = await compiledGraph.invoke(input, {
        configurable: { thread_id: sessionId },
      });
      
      return result;
    },
    
    // Stream support for real-time responses
    async *stream(
      input: Partial<MasterOrchestratorState>,
      sessionId: string
    ) {
      // Check/create session
      const sessionExists = await sessionManager.getSession(sessionId);
      if (!sessionExists) {
        await sessionManager.createSession(sessionId);
      }
      
      // Stream values
      const stream = await compiledGraph.stream(input, {
        configurable: { thread_id: sessionId },
        streamMode: 'values',
      });
      
      for await (const chunk of stream) {
        yield chunk;
      }
    },
    
    // Get state with persistence
    async getState(sessionId: string) {
      return await compiledGraph.getState({
        configurable: { thread_id: sessionId },
      });
    },
    
    // Update state directly
    async updateState(
      sessionId: string,
      updates: Partial<MasterOrchestratorState>
    ) {
      return await compiledGraph.updateState(
        {
          configurable: { thread_id: sessionId },
        },
        updates
      );
    },
  };
}

// Export singleton instance
export const enhancedOrchestrator = buildEnhancedMasterOrchestrator();

// Type exports for API usage
export type EnhancedOrchestrator = ReturnType<typeof buildEnhancedMasterOrchestrator>;