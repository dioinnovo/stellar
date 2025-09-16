/**
 * Master Orchestrator for Unified Lead Intelligence System
 * 
 * This is the single source of truth that orchestrates all agents
 * using LangGraph.js StateGraph with proper TypeScript patterns
 */

import { StateGraph, END } from '@langchain/langgraph';
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

/**
 * Router function to determine next agent based on state
 */
function routeConversation(state: MasterOrchestratorState): string | typeof END {
  // Check for errors and retry logic
  const lastError = state.errors[state.errors.length - 1];
  if (lastError && !lastError.recovered) {
    return 'error_recovery';
  }
  
  // Check if we should end
  if (state.conversationStatus === 'completed') {
    // If completed and qualified, ensure notification is sent
    if (state.qualification?.isQualified && 
        !state.notificationsSent?.some(n => n.type === 'qualification')) {
      return 'notification';
    }
    return END;
  }
  
  // Check message limit
  if (state.messages.length > 50) {
    return 'notification';
  }
  
  // Run conversation after every user message
  const lastMessage = state.messages[state.messages.length - 1];
  if (lastMessage && lastMessage._getType() === 'human') {
    // Always respond to user input
    return 'conversation';
  }
  
  // Default to END - wait for next user input
  return END;
}

// Parallel execution removed - conversation handles everything

/**
 * Error recovery node
 */
async function errorRecoveryNode(state: MasterOrchestratorState): Promise<Partial<MasterOrchestratorState>> {
  const lastError = state.errors[state.errors.length - 1];
  
  console.error(`Error recovery for ${lastError.agent}:`, lastError.error);
  
  // Mark error as recovered
  const updatedErrors = [...state.errors];
  updatedErrors[updatedErrors.length - 1].recovered = true;
  
  // Generate recovery message
  const recoveryMessage = new AIMessage(
    "I apologize for the brief interruption. Let me help you with your AI and automation needs. " +
    "Could you tell me a bit more about your business challenges?"
  );
  
  return {
    errors: updatedErrors,
    messages: [recoveryMessage],
    currentPhase: 'discovery',
  };
}


/**
 * Build the master orchestrator graph - Simplified flow
 */
export function buildMasterOrchestrator() {
  // Create the state graph with our unified annotation
  const workflow = new StateGraph(MasterOrchestratorAnnotation)
    // Core nodes - simplified
    .addNode('conversation', conversationNode)
    .addNode('notification', notificationNode)
    .addNode('recommendation', recommendationNode)
    .addNode('scheduling', schedulingNode)
    .addNode('nurture', nurtureNode)
    .addNode('error_recovery', errorRecoveryNode)
    
    // Simple flow: Start -> Conversation -> Conditional routing
    .addEdge('__start__', 'conversation')
    
    // After conversation, check what to do next
    .addConditionalEdges('conversation', (state) => {
      console.log('🔀 Routing after conversation:', {
        status: state.conversationStatus,
        isQualified: state.qualification?.isQualified,
        score: state.qualification?.totalScore,
        hasEmail: !!state.customerInfo.email,
        tier: state.qualification?.tier
      });
      
      // If qualified (30+ score) and has email, send notification
      if (state.qualification?.isQualified && state.customerInfo.email) {
        console.log('➡️ Routing to notification node');
        return 'notification';
      }
      
      // If conversation is complete and qualified, notify
      if (state.conversationStatus === 'completed' && state.qualification?.isQualified) {
        console.log('➡️ Conversation completed and qualified - routing to notification');
        return 'notification';
      }
      
      // If nurture needed
      if (state.qualification && !state.qualification?.isQualified && 
          state.qualification?.tier === 'nurture') {
        console.log('➡️ Routing to nurture node');
        return 'nurture';
      }
      
      // Default: end and wait for next message
      console.log('➡️ Ending conversation flow');
      return END;
    })
    
    // Notification always ends
    .addEdge('notification', END)
    
    // Recommendation ends
    .addEdge('recommendation', END)
    
    // Scheduling to notification
    .addEdge('scheduling', 'notification')
    
    // Nurture ends
    .addEdge('nurture', END)
    
    // Error recovery ends
    .addEdge('error_recovery', END);
  
  // Compile the graph
  return workflow.compile();
}

/**
 * Master Orchestrator class for managing all conversations
 */
export class MasterOrchestrator {
  private orchestrator: ReturnType<typeof buildMasterOrchestrator>;
  private sessions: Map<string, MasterOrchestratorState>;
  
  constructor() {
    this.orchestrator = buildMasterOrchestrator();
    this.sessions = new Map();
    
    // Check for timed out sessions every minute
    setInterval(() => this.checkTimeouts(), 60000);
    
    // Cleanup old sessions periodically
    setInterval(() => this.cleanupSessions(), 3600000); // Every hour
  }
  
  /**
   * Start a new conversation session
   */
  async startSession(
    sessionId: string,
    conversationType: 'chat' | 'callback' | 'email' | 'form' = 'chat',
    initialMessage?: string,
    initialData?: Partial<MasterOrchestratorState['customerInfo']>
  ): Promise<MasterOrchestratorState> {
    // Create initial state
    const initialState = createInitialState(sessionId, conversationType) as MasterOrchestratorState;
    
    // Add initial data if provided
    if (initialData) {
      initialState.customerInfo = { ...initialState.customerInfo, ...initialData };
    }
    
    // Add initial message if provided
    if (initialMessage) {
      initialState.messages = [new HumanMessage(initialMessage)];
    }
    
    // Run the orchestrator
    const result = await this.orchestrator.invoke(initialState);
    
    // Store session
    this.sessions.set(sessionId, result);
    
    return result;
  }
  
  /**
   * Continue an existing session
   */
  async continueSession(
    sessionId: string,
    userMessage: string,
    messageMetadata?: any
  ): Promise<MasterOrchestratorState | null> {
    const currentState = this.sessions.get(sessionId);
    if (!currentState) {
      // Start new session if not found
      return this.startSession(sessionId, 'chat', userMessage);
    }
    
    // Add user message and update state
    const humanMessage = new HumanMessage(userMessage);
    if (messageMetadata) {
      humanMessage.additional_kwargs = { metadata: messageMetadata };
    }
    
    const updatedState: MasterOrchestratorState = {
      ...currentState,
      messages: [...currentState.messages, humanMessage],
      lastUpdateTime: new Date(),
      // Update conversation turn tracking for user input
      conversationTurn: {
        lastSpeaker: 'user',
        turnCount: (currentState.conversationTurn?.turnCount || 0) + 1,
        waitingForUser: false,
        lastQuestionAsked: currentState.conversationTurn?.lastQuestionAsked,
        questionTimestamp: currentState.conversationTurn?.questionTimestamp,
      },
      analytics: {
        ...currentState.analytics,
        messageCount: currentState.analytics.messageCount + 1,
        conversationDuration: 
          (new Date().getTime() - new Date(currentState.startTime).getTime()) / 1000,
      },
    };
    
    // Run the orchestrator with updated state
    // The conversation agent will handle extraction, qualification, and status updates
    // The graph will route to notification if needed
    const result = await this.orchestrator.invoke(updatedState);
    
    // Update stored session
    this.sessions.set(sessionId, result);
    
    return result;
  }
  
  /**
   * Get session state
   */
  getSession(sessionId: string): MasterOrchestratorState | undefined {
    return this.sessions.get(sessionId);
  }
  
  /**
   * Update session state directly (for voice sync)
   */
  updateSession(sessionId: string, state: MasterOrchestratorState): void {
    this.sessions.set(sessionId, state);
  }
  
  /**
   * Trigger notification for qualified lead
   */
  async triggerNotification(sessionId: string): Promise<void> {
    const state = this.sessions.get(sessionId);
    console.log(`🔔 TriggerNotification called for session ${sessionId}:`, {
      hasState: !!state,
      isQualified: state?.qualification?.isQualified,
      score: state?.qualification?.totalScore,
      tier: state?.qualification?.tier,
      hasEmail: !!state?.customerInfo?.email,
      email: state?.customerInfo?.email,
      company: state?.customerInfo?.company,
      challenges: state?.customerInfo?.currentChallenges,
      notificationsSent: state?.notificationsSent
    });
    
    if (!state) {
      console.log(`❌ Cannot send notification: No state found for session ${sessionId}`);
      return;
    }
    
    if (!state.qualification?.isQualified) {
      console.log(`❌ Cannot send notification: Lead not qualified`, {
        sessionId,
        score: state.qualification?.totalScore || 0,
        tier: state.qualification?.tier || 'unknown',
        reasons: state.qualification?.qualificationReasons || []
      });
      return;
    }
    
    if (!state.customerInfo?.email) {
      console.log(`❌ Cannot send notification: No email address`, {
        sessionId,
        customerInfo: state.customerInfo
      });
      return;
    }
    
    if (state && state.qualification?.isQualified && state.customerInfo?.email) {
      console.log(`📧 Executing notification for session ${sessionId}`);
      
      // Run the notification node directly
      const notificationState = await notificationNode(state);
      
      console.log(`✅ Notification result:`, {
        notificationsSent: notificationState.notificationsSent?.length || 0,
        notifications: notificationState.notificationsSent
      });
      
      // Update session with notification results
      const updatedState: MasterOrchestratorState = {
        ...state,
        ...notificationState,
        lastUpdateTime: new Date(),
      };
      
      this.sessions.set(sessionId, updatedState);
    } else {
      console.log(`⚠️ Notification not triggered - conditions not met`);
    }
  }
  
  /**
   * End a session
   */
  async endSession(sessionId: string): Promise<void> {
    const state = this.sessions.get(sessionId);
    if (state) {
      // Mark as completed
      const finalState: MasterOrchestratorState = {
        ...state,
        conversationStatus: 'completed',
        lastUpdateTime: new Date(),
      };
      
      // Run final notification
      await this.orchestrator.invoke(finalState);
      
      // Remove from active sessions
      this.sessions.delete(sessionId);
    }
  }
  
  /**
   * Get all active sessions
   */
  getActiveSessions(): Array<{
    sessionId: string;
    conversationType: string;
    status: string;
    startTime: Date;
    lastUpdate: Date;
    qualified: boolean;
  }> {
    const sessions: Array<any> = [];
    
    this.sessions.forEach((state, sessionId) => {
      sessions.push({
        sessionId,
        conversationType: state.conversationType,
        status: state.conversationStatus,
        startTime: state.startTime,
        lastUpdate: state.lastUpdateTime,
        qualified: state.qualification?.isQualified ?? false,
        qualificationScore: state.qualification?.totalScore ?? 0,
        customerName: state.customerInfo.name,
        company: state.customerInfo.company,
      });
    });
    
    return sessions;
  }
  
  /**
   * Check for timed out sessions and handle abandoned conversations
   */
  private async checkTimeouts(): Promise<void> {
    const now = new Date();
    const timeoutMs = 5 * 60 * 1000; // 5 minutes
    
    for (const [sessionId, state] of this.sessions) {
      const timeSinceLastUpdate = now.getTime() - new Date(state.lastUpdateTime).getTime();
      
      // Skip if recently active or already completed
      if (timeSinceLastUpdate < timeoutMs || state.conversationStatus === 'completed') {
        continue;
      }
      
      // Check if we have viable information for a lead
      const hasContact = !!(state.customerInfo.email || state.customerInfo.phone);
      const hasCompany = !!state.customerInfo.company;
      const hasIndustry = !!state.customerInfo.industry;
      const hasChallenges = !!(state.customerInfo.currentChallenges?.length);
      const hasName = !!state.customerInfo.name;
      // Note: timeline, budget, role not available in CustomerInfo interface
      
      // Must have at least contact info to qualify
      if (!hasContact) {
        console.log(`Session ${sessionId} abandoned without contact information`);
        state.conversationStatus = 'abandoned';
        this.sessions.set(sessionId, state);
        continue;
      }
      
      // Must have some business context
      const hasBusinessContext = hasCompany || hasIndustry || hasChallenges;
      if (!hasBusinessContext) {
        console.log(`Session ${sessionId} abandoned with contact but no business context`);
        state.conversationStatus = 'abandoned';
        this.sessions.set(sessionId, state);
        continue;
      }
      
      console.log(`Session ${sessionId} timed out with viable info. Qualifying and notifying...`);
      
      // Mark as abandoned
      state.conversationStatus = 'abandoned';
      
      // Qualification already handled by conversation agent
      // Just add abandoned session note if qualified
      if (state.qualification) {
        if (!state.qualification.qualificationReasons) {
          state.qualification.qualificationReasons = [];
        }
        state.qualification.qualificationReasons.push('⚠️ Session abandoned (5-minute timeout)');
      }
      
      // Send notification if qualified (30+ points with contact and context)
      if (state.qualification?.isQualified && 
          !state.notificationsSent?.some(n => n.type === 'qualification')) {
        const { notificationNode } = await import('../agents/notification');
        const notificationResult = await notificationNode(state);
        
        state.notificationsSent = [
          ...(state.notificationsSent || []),
          ...(notificationResult.notificationsSent || [])
        ];
      }
      
      // Mark session as completed after handling
      state.conversationStatus = 'completed';
      this.sessions.set(sessionId, state);
    }
  }
  
  /**
   * Clean up old sessions
   */
  private cleanupSessions(): void {
    const now = new Date();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    this.sessions.forEach((state, sessionId) => {
      const age = now.getTime() - new Date(state.lastUpdateTime).getTime();
      if (age > maxAge) {
        console.log(`Cleaning up old session: ${sessionId}`);
        this.sessions.delete(sessionId);
      }
    });
  }
  
  /**
   * Get analytics for all sessions
   */
  getAnalytics(): {
    totalSessions: number;
    activeSessions: number;
    qualifiedLeads: number;
    averageQualificationScore: number;
    conversionRate: number;
    averageDuration: number;
  } {
    let totalSessions = this.sessions.size;
    let activeSessions = 0;
    let qualifiedLeads = 0;
    let totalScore = 0;
    let totalDuration = 0;
    
    this.sessions.forEach(state => {
      if (state.conversationStatus === 'active') {
        activeSessions++;
      }
      if (state.qualification?.isQualified) {
        qualifiedLeads++;
        totalScore += state.qualification.totalScore;
      }
      totalDuration += state.analytics.conversationDuration;
    });
    
    return {
      totalSessions,
      activeSessions,
      qualifiedLeads,
      averageQualificationScore: qualifiedLeads > 0 ? totalScore / qualifiedLeads : 0,
      conversionRate: totalSessions > 0 ? (qualifiedLeads / totalSessions) * 100 : 0,
      averageDuration: totalSessions > 0 ? totalDuration / totalSessions : 0,
    };
  }
}

// Export singleton instance
export const masterOrchestrator = new MasterOrchestrator();

// Export for use in API routes
export async function createMasterOrchestrator() {
  return buildMasterOrchestrator();
}