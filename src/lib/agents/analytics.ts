/**
 * Analytics Agent
 * 
 * Tracks engagement, sentiment, and conversion probability
 */

import { MasterOrchestratorState, AgentExecution } from '../orchestrator/state';

function analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
  const positive = ['great', 'excellent', 'perfect', 'love', 'awesome', 'fantastic', 'interested', 'excited'];
  const negative = ['not', 'no', 'bad', 'poor', 'hate', 'terrible', 'wrong', 'issue', 'problem'];
  
  const textLower = text.toLowerCase();
  let score = 0;
  
  positive.forEach(word => { if (textLower.includes(word)) score++; });
  negative.forEach(word => { if (textLower.includes(word)) score--; });
  
  return score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral';
}

export async function analyticsNode(
  state: MasterOrchestratorState
): Promise<Partial<MasterOrchestratorState>> {
  const startTime = new Date();
  
  try {
    const lastMessage = state.messages[state.messages.length - 1];
    const sentiment = lastMessage ? analyzeSentiment(lastMessage.content.toString()) : 'neutral';
    
    // Calculate engagement score
    const responseTime = state.messages.length > 1 ? 
      (new Date().getTime() - new Date(state.lastUpdateTime).getTime()) / 1000 : 0;
    const engagementScore = Math.max(0, Math.min(100, 
      100 - (responseTime * 2) + (state.messages.length * 5)
    ));
    
    // Update conversion probability based on progress
    let conversionProbability = state.analytics.conversionProbability;
    if (state.qualification) {
      conversionProbability = state.qualification.totalScore / 100;
    } else if (state.customerInfo.email) {
      conversionProbability = Math.max(0.3, conversionProbability);
    }
    
    return {
      analytics: {
        ...state.analytics,
        engagementScore,
        sentimentTrend: sentiment,
        conversionProbability,
        keyMoments: [
          ...state.analytics.keyMoments,
          {
            timestamp: new Date(),
            event: `User message analyzed: ${sentiment} sentiment`,
            impact: sentiment === 'positive' ? 'positive' : 
                   sentiment === 'negative' ? 'negative' : 'neutral',
          },
        ],
      },
      agentExecutions: [{
        agentId: 'analytics',
        startTime,
        endTime: new Date(),
        status: 'completed',
        result: { sentiment, engagementScore },
        retryCount: 0,
      }],
    };
    
  } catch (error) {
    console.error('Analytics agent error:', error);
    return {
      errors: [{
        timestamp: new Date(),
        agent: 'analytics',
        error: error instanceof Error ? error.message : 'Unknown error',
        recovered: true,
      }],
      agentExecutions: [{
        agentId: 'analytics',
        startTime,
        endTime: new Date(),
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        retryCount: 0,
      }],
    };
  }
}