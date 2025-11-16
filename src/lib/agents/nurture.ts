/**
 * Nurture Agent
 * 
 * Handles follow-up and nurturing of leads that aren't ready to buy
 */

import { AIMessage } from '@langchain/core/messages';
import { MasterOrchestratorState, AgentExecution } from '../orchestrator/state';

export async function nurtureNode(
  state: MasterOrchestratorState
): Promise<Partial<MasterOrchestratorState>> {
  const startTime = new Date();
  
  try {
    const tier = state.qualification?.tier || 'cold';
    let message: string;
    let nextActionType: 'nurture' | 'follow_up' = 'nurture';
    
    if (tier === 'nurture' || tier === 'disqualified') {
      message = "I understand this might not be the right time for you. " +
                "I'll send you some helpful resources about AI and automation that you can review when you're ready. " +
                "Feel free to reach out anytime if your needs change!";
      nextActionType = 'nurture';
    } else {
      message = "Thanks for exploring our solutions! " +
                "I'll follow up with some case studies relevant to your industry. " +
                "When would be a good time to reconnect and discuss further?";
      nextActionType = 'follow_up';
    }
    
    return {
      messages: [new AIMessage(message)],
      nextAction: {
        type: nextActionType,
        details: {
          tier,
          followUpDays: tier === 'warm' ? 7 : 30,
          resources: ['case_studies', 'whitepapers', 'webinar_invites'],
        },
        scheduledFor: new Date(Date.now() + (tier === 'warm' ? 7 : 30) * 24 * 60 * 60 * 1000),
      },
      currentPhase: 'follow_up',
      conversationStatus: 'paused',
      agentExecutions: [{
        agentId: 'nurture',
        startTime,
        endTime: new Date(),
        status: 'completed',
        result: { action: nextActionType, tier },
        retryCount: 0,
      }],
    };
    
  } catch (error) {
    console.error('Nurture agent error:', error);
    return {
      errors: [{
        timestamp: new Date(),
        agent: 'nurture',
        error: error instanceof Error ? error.message : 'Unknown error',
        recovered: false,
      }],
      agentExecutions: [{
        agentId: 'nurture',
        startTime,
        endTime: new Date(),
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        retryCount: 0,
      }],
    };
  }
}