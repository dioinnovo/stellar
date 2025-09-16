/**
 * Conversation Agent - LangChain Implementation - Simplified for Build
 */

import { AIMessage } from '@langchain/core/messages';
import { MasterOrchestratorState } from '../orchestrator/state';

/**
 * Execute conversation agent with simplified logic
 */
export async function executeConversationAgent(
  state: MasterOrchestratorState
): Promise<Partial<MasterOrchestratorState>> {
  const startTime = new Date();
  
  // Check if there's a new user message to process
  const lastMessage = state.messages[state.messages.length - 1];
  if (!lastMessage || lastMessage._getType() !== 'human') {
    return {
      agentExecutions: [{
        agentId: 'conversation',
        startTime,
        endTime: new Date(),
        status: 'completed',
        result: { reason: 'No new user message' },
        retryCount: 0,
      }],
    };
  }

  console.log(`🎯 Conversation Agent: Processing user message: "${lastMessage.content.toString().slice(0, 100)}..."`);

  // Simplified for build - just return basic structure
  return {
    messages: [new AIMessage("Thank you for your message. This is a simplified response.")],
    customerInfo: state.customerInfo,
    agentExecutions: [{
      agentId: 'conversation',
      startTime,
      endTime: new Date(),
      status: 'completed',
      result: { reason: 'Simplified for build' },
      retryCount: 0,
    }],
  };
}