/**
 * Qualification Agent
 * 
 * Evaluates leads using BANT methodology and assigns qualification tiers
 * Works with extracted data to provide comprehensive scoring
 */

import { AIMessage } from '@langchain/core/messages';
import { 
  MasterOrchestratorState, 
  BANTQualification,
  AgentExecution,
  INDUSTRY_MULTIPLIERS,
  calculateFinalScore,
  getQualificationTier
} from '../orchestrator/state';

/**
 * Score Budget component (0-30 points)
 */
function scoreBudget(state: MasterOrchestratorState): number {
  let score = 0;
  const conversationText = state.messages.map(m => m.content.toString()).join(' ').toLowerCase();
  
  // Check for specific budget amounts
  if (conversationText.match(/\$1m|\$\d+(?:\.\d+)?m|million/i)) {
    score = 30;
  } else if (conversationText.match(/\$500k|500k/i)) {
    score = 25;
  } else if (conversationText.match(/\$250k|250k/i)) {
    score = 20;
  } else if (conversationText.match(/\$100k|100k/i)) {
    score = 15;
  } else if (conversationText.match(/\$50k|50k/i)) {
    score = 10;
  } else if (conversationText.match(/budget|allocated|approved/i)) {
    score = 5;
  }
  
  // Bonus for company size
  if (state.customerInfo.companySize === 'enterprise') {
    score = Math.min(30, score + 10);
  } else if (state.customerInfo.companySize === 'large') {
    score = Math.min(30, score + 5);
  }
  
  return score;
}

/**
 * Score Authority component (0-25 points)
 */
function scoreAuthority(state: MasterOrchestratorState): number {
  let score = 0;
  const title = state.customerInfo.title?.toLowerCase() || '';
  const role = state.customerInfo.role;
  
  // Score based on title
  if (title.match(/ceo|cto|cfo|coo|president|owner|founder/i)) {
    score = 25;
  } else if (title.match(/vp|vice president/i)) {
    score = 20;
  } else if (title.match(/director|head of/i)) {
    score = 15;
  } else if (title.match(/manager|lead/i)) {
    score = 10;
  } else if (title.match(/senior|principal/i)) {
    score = 8;
  } else if (title.match(/analyst|coordinator/i)) {
    score = 5;
  }
  
  // Use role if title scoring is low
  if (score < 10 && role === 'decision_maker') {
    score = 20;
  } else if (score < 10 && role === 'influencer') {
    score = 12;
  }
  
  // Default assumption: if someone is engaging about their business, they have some authority
  if (score === 0) {
    score = 15; // Assume mid-level authority if not specified
  }
  
  return score;
}

/**
 * Score Need component (0-25 points)
 */
function scoreNeed(state: MasterOrchestratorState): number {
  let score = 0;
  const challenges = state.customerInfo.currentChallenges || [];
  const painPoints = state.customerInfo.painPoints || [];
  const conversationText = state.messages.map(m => m.content.toString()).join(' ').toLowerCase();
  
  // Score based on number of challenges
  score += Math.min(10, challenges.length * 3);
  
  // Score based on pain points severity
  painPoints.forEach(pain => {
    if (pain.severity === 'critical') score += 5;
    else if (pain.severity === 'high') score += 3;
    else if (pain.severity === 'medium') score += 2;
    else if (pain.severity === 'low') score += 1;
  });
  
  // Check for urgency indicators
  if (conversationText.match(/critical|urgent|emergency|failing|broken/i)) {
    score += 5;
  } else if (conversationText.match(/major|significant|serious|severe/i)) {
    score += 3;
  }
  
  // Check for business impact
  if (conversationText.match(/revenue|profit|cost|customer|compliance|regulatory/i)) {
    score += 3;
  }
  
  return Math.min(25, score);
}

/**
 * Score Timeline component (0-20 points)
 */
function scoreTimeline(state: MasterOrchestratorState): number {
  const conversationText = state.messages.map(m => m.content.toString()).join(' ').toLowerCase();
  
  if (conversationText.match(/urgent|asap|immediately|right away|today|tomorrow|this week/i)) {
    return 20;
  } else if (conversationText.match(/this month|next month|weeks/i)) {
    return 15;
  } else if (conversationText.match(/this quarter|q1|q2|q3|q4/i)) {
    return 12;
  } else if (conversationText.match(/this year|2025|months/i)) {
    return 8;
  } else if (conversationText.match(/next year|2026|planning|exploring/i)) {
    return 3;
  }
  
  return 0;
}

/**
 * Generate qualification message based on tier
 */
function generateQualificationMessage(
  tier: string,
  customerInfo: any,
  reasons: string[]
): string {
  switch (tier) {
    case 'hot':
      return `Excellent! Based on your ${customerInfo.currentChallenges?.[0] || 'needs'} and timeline, ` +
             `I can see this is a priority for your organization. ` +
             `Let me connect you with our AI & Automation Strategist who specializes in ${customerInfo.industry || 'your industry'}.`;
    
    case 'warm':
      return `Based on what you've shared, I believe we have several solutions that could significantly help ` +
             `${customerInfo.company || 'your organization'}. ` +
             `Would you like to explore how our AI solutions could address your specific challenges?`;
    
    case 'cold':
      return `I understand you're exploring options for ${customerInfo.currentChallenges?.[0] || 'improvement'}. ` +
             `Let me share some insights about how AI and automation could help. ` +
             `What aspect would be most valuable for you to learn about first?`;
    
    case 'nurture':
      return `Thank you for sharing your situation. While the timing might not be ideal right now, ` +
             `I'd love to send you some resources that could be helpful for future planning. ` +
             `What's the best email to send those to?`;
    
    default:
      return `I appreciate you taking the time to explore our solutions. ` +
             `Could you tell me more about your specific goals and timeline so I can better assist you?`;
  }
}

/**
 * Main qualification node
 */
export async function qualificationNode(
  state: MasterOrchestratorState
): Promise<Partial<MasterOrchestratorState>> {
  const startTime = new Date();
  
  try {
    // Calculate BANT scores
    const budgetScore = scoreBudget(state);
    const authorityScore = scoreAuthority(state);
    const needScore = scoreNeed(state);
    const timelineScore = scoreTimeline(state);
    
    console.log('BANT Score Breakdown:', {
      budget: budgetScore,
      authority: authorityScore,
      need: needScore,
      timeline: timelineScore,
      sum: budgetScore + authorityScore + needScore + timelineScore,
      maxPossible: '30 + 25 + 25 + 20 = 100'
    });
    
    // Calculate base score
    const baseScore = budgetScore + authorityScore + needScore + timelineScore;
    
    // Apply industry multiplier
    const totalScore = calculateFinalScore(baseScore, state.customerInfo.industry);
    
    console.log('Final Score Calculation:', {
      baseScore,
      industry: state.customerInfo.industry,
      finalScore: totalScore,
      isValid: totalScore <= 100
    });
    
    // Determine tier
    const tier = getQualificationTier(totalScore);
    const isQualified = totalScore >= 45;
    
    // Build qualification reasons
    const reasons: string[] = [];
    
    if (budgetScore >= 20) reasons.push('Strong budget indication');
    else if (budgetScore >= 10) reasons.push('Budget available');
    
    if (authorityScore >= 20) reasons.push('Decision maker engaged');
    else if (authorityScore >= 15) reasons.push('Business owner or manager');
    else if (authorityScore >= 10) reasons.push('Engaged stakeholder');
    
    if (needScore >= 20) reasons.push('Critical business need');
    else if (needScore >= 10) reasons.push('Clear pain points identified');
    
    if (timelineScore >= 15) reasons.push('Urgent timeline');
    else if (timelineScore >= 10) reasons.push('Active project timeline');
    
    // Add company context
    if (state.customerInfo.companySize) {
      const sizeLabels: Record<string, string> = {
        'enterprise': 'Enterprise organization',
        'large': 'Large company',
        'medium': 'Mid-market company',
        'small': 'Small business',
        'startup': 'Startup',
      };
      reasons.push(sizeLabels[state.customerInfo.companySize]);
    }
    
    // Create qualification object
    const qualification: BANTQualification = {
      budget: {
        score: budgetScore,
        status: budgetScore >= 20 ? 'allocated' : 
                budgetScore >= 10 ? 'planned' : 
                budgetScore >= 5 ? 'exploring' : 'unknown',
      },
      authority: {
        level: (state.customerInfo.role === 'decision_maker' || 
                state.customerInfo.role === 'influencer' || 
                state.customerInfo.role === 'researcher' ? 
                state.customerInfo.role : 'unknown') as 'unknown' | 'decision_maker' | 'influencer' | 'researcher',
        canSign: authorityScore >= 20,
        needsApproval: authorityScore < 20,
        score: authorityScore,
      },
      need: {
        painLevel: needScore >= 20 ? 'critical' :
                   needScore >= 15 ? 'high' :
                   needScore >= 10 ? 'medium' : 'low',
        urgency: timelineScore >= 15 ? 'immediate' :
                 timelineScore >= 10 ? 'high' :
                 timelineScore >= 5 ? 'medium' : 'low',
        impact: state.customerInfo.currentChallenges?.[0] || '',
        score: needScore,
      },
      timeline: {
        timeframe: timelineScore >= 15 ? 'immediate' :
                   timelineScore >= 12 ? 'this_quarter' :
                   timelineScore >= 8 ? 'this_year' :
                   timelineScore >= 3 ? 'next_year' : 'exploring',
        score: timelineScore,
      },
      totalScore,
      isQualified,
      tier: tier as any,
      qualificationReasons: reasons,
      disqualificationReasons: !isQualified ? 
        ['Score below threshold', `Current score: ${totalScore}/100`] : undefined,
    };
    
    // Generate response message
    const responseMessage = new AIMessage(
      generateQualificationMessage(tier, state.customerInfo, reasons)
    );
    
    // Determine next node
    let nextNode = 'conversation';
    if (isQualified) {
      nextNode = 'recommendation';
    } else if (tier === 'nurture') {
      nextNode = 'nurture';
    }
    
    // Track execution
    const execution: AgentExecution = {
      agentId: 'qualification',
      startTime,
      endTime: new Date(),
      status: 'completed',
      result: {
        score: totalScore,
        tier,
        qualified: isQualified,
        bantBreakdown: {
          budget: budgetScore,
          authority: authorityScore,
          need: needScore,
          timeline: timelineScore,
        },
      },
      retryCount: 0,
    };
    
    return {
      qualification,
      messages: [responseMessage],
      nextNode,
      currentPhase: 'qualification',
      agentExecutions: [execution],
      analytics: {
        ...state.analytics,
        conversionProbability: totalScore / 100,
        keyMoments: [
          ...state.analytics.keyMoments,
          {
            timestamp: new Date(),
            event: `Lead qualified as ${tier} (${totalScore} points)`,
            impact: isQualified ? 'positive' : 'neutral',
          },
        ],
      },
    };
    
  } catch (error) {
    console.error('Qualification agent error:', error);
    
    return {
      errors: [{
        timestamp: new Date(),
        agent: 'qualification',
        error: error instanceof Error ? error.message : 'Unknown error',
        recovered: false,
      }],
      agentExecutions: [{
        agentId: 'qualification',
        startTime,
        endTime: new Date(),
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        retryCount: 0,
      }],
    };
  }
}