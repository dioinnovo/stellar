/**
 * Recommendation Agent
 * 
 * Provides tailored service recommendations based on qualification and needs
 */

import { AIMessage } from '@langchain/core/messages';
import { MasterOrchestratorState, ServiceRecommendation, AgentExecution } from '../orchestrator/state';

const SERVICES = {
  'data_transformation': {
    name: 'AI-Powered Data Transformation',
    description: 'Automated data processing and integration',
    fitFor: ['data quality', 'integration', 'manual process', 'errors'],
  },
  'process_automation': {
    name: 'Intelligent Process Automation',
    description: 'End-to-end workflow automation',
    fitFor: ['efficiency', 'speed', 'cost', 'manual', 'repetitive'],
  },
  'ai_insights': {
    name: 'AI Analytics & Insights',
    description: 'Predictive analytics and decision support',
    fitFor: ['analytics', 'reporting', 'insights', 'prediction', 'forecasting'],
  },
  'custom_ai': {
    name: 'Custom AI Solutions',
    description: 'Tailored AI models for specific needs',
    fitFor: ['unique', 'specific', 'custom', 'specialized'],
  },
};

export async function recommendationNode(
  state: MasterOrchestratorState
): Promise<Partial<MasterOrchestratorState>> {
  const startTime = new Date();
  
  try {
    const challenges = state.customerInfo.currentChallenges || [];
    const conversationText = state.messages.map(m => m.content.toString()).join(' ').toLowerCase();
    
    // Score each service
    const serviceScores = Object.entries(SERVICES).map(([id, service]) => {
      let score = 0;
      service.fitFor.forEach(keyword => {
        if (conversationText.includes(keyword)) score += 10;
      });
      challenges.forEach(challenge => {
        service.fitFor.forEach(keyword => {
          if (challenge.toLowerCase().includes(keyword)) score += 15;
        });
      });
      return { id, ...service, score };
    });
    
    // Sort by score
    serviceScores.sort((a, b) => b.score - a.score);
    
    // Create recommendation
    const recommendation: ServiceRecommendation = {
      primary: {
        id: serviceScores[0].id,
        name: serviceScores[0].name,
        reasoning: `Based on your ${challenges[0] || 'needs'}, this solution directly addresses your requirements`,
        fitScore: serviceScores[0].score,
      },
      secondary: serviceScores.slice(1, 3).map(s => ({
        id: s.id,
        name: s.name,
        reasoning: s.description,
        fitScore: s.score,
      })),
      estimatedValue: state.customerInfo.companySize === 'enterprise' ? '$500K-$2M annually' : '$100K-$500K annually',
      estimatedTimeline: '3-6 months full implementation',
      expectedOutcomes: [
        '70% reduction in manual processing',
        '50% faster decision making',
        '30% cost savings within first year',
      ],
    };
    
    const message = new AIMessage(
      `Based on your needs, I recommend our ${recommendation.primary.name}. ` +
      `This solution typically delivers ${recommendation.expectedOutcomes[0]}. ` +
      `Would you like to see a demo or discuss implementation details with our team?`
    );
    
    return {
      recommendations: recommendation,
      messages: [message],
      nextNode: 'scheduling',
      currentPhase: 'recommendation',
      agentExecutions: [{
        agentId: 'recommendation',
        startTime,
        endTime: new Date(),
        status: 'completed',
        result: { primaryService: recommendation.primary.name },
        retryCount: 0,
      }],
    };
    
  } catch (error) {
    console.error('Recommendation agent error:', error);
    return {
      errors: [{
        timestamp: new Date(),
        agent: 'recommendation',
        error: error instanceof Error ? error.message : 'Unknown error',
        recovered: false,
      }],
      agentExecutions: [{
        agentId: 'recommendation',
        startTime,
        endTime: new Date(),
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        retryCount: 0,
      }],
    };
  }
}