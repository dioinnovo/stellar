/**
 * Qualification Sub-Graph for BANT Scoring
 * 
 * Modular sub-graph that handles Budget, Authority, Need, and Timeline evaluation
 * Can be composed into the main orchestrator graph
 */

import { StateGraph, END, Annotation } from '@langchain/langgraph';
import { BaseMessage } from '@langchain/core/messages';
import { 
  CustomerInfo, 
  BANTQualification,
  INDUSTRY_MULTIPLIERS,
  calculateFinalScore,
  getQualificationTier
} from './state';

// Sub-graph specific state
const QualificationAnnotation = Annotation.Root({
  customerInfo: Annotation<CustomerInfo>({
    value: (current, update) => ({ ...current, ...update }),
    default: () => ({}),
  }),
  
  messages: Annotation<BaseMessage[]>({
    value: (current, update) => current,
    default: () => [],
  }),
  
  budgetScore: Annotation<number>({
    value: (current, update) => update ?? current,
    default: () => 0,
  }),
  
  authorityScore: Annotation<number>({
    value: (current, update) => update ?? current,
    default: () => 0,
  }),
  
  needScore: Annotation<number>({
    value: (current, update) => update ?? current,
    default: () => 0,
  }),
  
  timelineScore: Annotation<number>({
    value: (current, update) => update ?? current,
    default: () => 0,
  }),
  
  qualification: Annotation<BANTQualification | null>({
    value: (current, update) => update ?? current,
    default: () => null,
  }),
});

type QualificationState = typeof QualificationAnnotation.State;

/**
 * Budget evaluation node (0-30 points)
 */
async function evaluateBudgetNode(
  state: QualificationState
): Promise<Partial<QualificationState>> {
  const { customerInfo } = state;
  let score = 0;
  let status: BANTQualification['budget']['status'] = 'unknown';
  
  // Extract budget from conversation messages (budget/currentSpend not in CustomerInfo)
  const budgetIndicators = [
    ...state.messages.map(m => m.content.toString().toLowerCase())
  ].join(' ').toLowerCase();
  
  // Parse budget amount
  let amount: number | undefined;
  const budgetMatch = budgetIndicators.match(/(\d+)k|\$(\d+),?(\d+)/);
  if (budgetMatch) {
    if (budgetMatch[1]) {
      amount = parseInt(budgetMatch[1]) * 1000;
    } else if (budgetMatch[2]) {
      amount = parseInt(budgetMatch[2] + (budgetMatch[3] || ''));
    }
  }
  
  // Score based on budget
  if (amount) {
    if (amount >= 500000) {
      score = 30;
      status = 'allocated';
    } else if (amount >= 250000) {
      score = 25;
      status = 'allocated';
    } else if (amount >= 100000) {
      score = 20;
      status = 'allocated';
    } else if (amount >= 50000) {
      score = 15;
      status = 'planned';
    } else {
      score = 10;
      status = 'exploring';
    }
  } else if (budgetIndicators.includes('budget') || budgetIndicators.includes('allocated')) {
    score = 15;
    status = 'planned';
  } else {
    score = 5;
    status = 'exploring';
  }
  
  console.log(`💰 Budget Score: ${score}/30 (${status})`);
  
  return {
    budgetScore: score,
    qualification: {
      ...state.qualification,
      budget: { amount, status, score },
      totalScore: 0,
      isQualified: false,
      tier: 'cold',
      qualificationReasons: [],
    } as BANTQualification,
  };
}

/**
 * Authority evaluation node (0-25 points)
 */
async function evaluateAuthorityNode(
  state: QualificationState
): Promise<Partial<QualificationState>> {
  const { customerInfo } = state;
  let score = 0;
  let level: BANTQualification['authority']['level'] = 'unknown';
  let canSign = false;
  let needsApproval = true;
  
  const title = (customerInfo.title || '').toLowerCase();
  const role = (customerInfo.role || '').toLowerCase();
  
  // Decision maker indicators
  const decisionMakerTitles = ['ceo', 'cto', 'cfo', 'coo', 'president', 'owner', 'founder', 'vp', 'vice president', 'director'];
  const influencerTitles = ['manager', 'head', 'lead', 'senior', 'principal', 'architect'];
  
  // Check authority level
  if (decisionMakerTitles.some(t => title.includes(t))) {
    score = 25;
    level = 'decision_maker';
    canSign = true;
    needsApproval = false;
  } else if (role === 'decision_maker') {
    score = 25;
    level = 'decision_maker';
    canSign = true;
    needsApproval = false;
  } else if (influencerTitles.some(t => title.includes(t))) {
    score = 15;
    level = 'influencer';
    canSign = false;
    needsApproval = true;
  } else if (role === 'influencer') {
    score = 15;
    level = 'influencer';
  } else if (customerInfo.teamSize && customerInfo.teamSize > 5) {
    score = 10;
    level = 'influencer';
  } else {
    score = 5;
    level = 'researcher';
  }
  
  console.log(`👔 Authority Score: ${score}/25 (${level})`);
  
  return {
    authorityScore: score,
    qualification: {
      ...state.qualification,
      authority: { 
        level, 
        canSign, 
        needsApproval,
        approver: customerInfo.reportingTo,
        score 
      },
    } as BANTQualification,
  };
}

/**
 * Need evaluation node (0-25 points)
 */
async function evaluateNeedNode(
  state: QualificationState
): Promise<Partial<QualificationState>> {
  const { customerInfo } = state;
  let score = 0;
  let painLevel: BANTQualification['need']['painLevel'] = 'low';
  let urgency: BANTQualification['need']['urgency'] = 'low';
  
  // Count pain points and challenges
  const painPoints = customerInfo.painPoints || [];
  const challenges = customerInfo.currentChallenges || [];
  const totalIssues = painPoints.length + challenges.length;
  
  // Check for critical pain points
  const hasCriticalPain = painPoints.some(p => p.severity === 'critical' || p.severity === 'high');
  const hasUrgentNeeds = state.messages.some(m => {
    const content = m.content.toString().toLowerCase();
    return content.includes('urgent') || 
           content.includes('asap') || 
           content.includes('immediately') ||
           content.includes('critical');
  });
  
  // Score based on need
  if (hasCriticalPain || totalIssues >= 3) {
    score = 25;
    painLevel = 'critical';
    urgency = hasUrgentNeeds ? 'immediate' : 'high';
  } else if (totalIssues >= 2) {
    score = 20;
    painLevel = 'high';
    urgency = 'medium';
  } else if (totalIssues >= 1) {
    score = 15;
    painLevel = 'medium';
    urgency = 'medium';
  } else if (customerInfo.goals && customerInfo.goals.length > 0) {
    score = 10;
    painLevel = 'low';
    urgency = 'low';
  } else {
    score = 5;
    painLevel = 'low';
    urgency = 'low';
  }
  
  // Boost for specific high-value needs
  const highValueNeeds = ['compliance', 'fraud', 'security', 'automation', 'ai', 'scale'];
  const hasHighValueNeed = [...challenges, ...(customerInfo.goals || [])].some(
    item => highValueNeeds.some(need => item.toLowerCase().includes(need))
  );
  if (hasHighValueNeed) {
    score = Math.min(25, score + 5);
  }
  
  console.log(`🎯 Need Score: ${score}/25 (${painLevel}/${urgency})`);
  
  return {
    needScore: score,
    qualification: {
      ...state.qualification,
      need: {
        painLevel,
        urgency,
        impact: painPoints[0]?.impact || 'undefined',
        consequences: painPoints[0]?.description,
        score,
      },
    } as BANTQualification,
  };
}

/**
 * Timeline evaluation node (0-20 points)
 */
async function evaluateTimelineNode(
  state: QualificationState
): Promise<Partial<QualificationState>> {
  const { customerInfo } = state;
  let score = 0;
  let timeframe: BANTQualification['timeline']['timeframe'] = 'exploring';
  
  // Check messages for timeline indicators
  const timelineText = state.messages.map(m => m.content.toString().toLowerCase()).join(' ');
  
  // Timeline keywords and scoring
  if (timelineText.includes('immediate') || timelineText.includes('urgent') || timelineText.includes('asap')) {
    score = 20;
    timeframe = 'immediate';
  } else if (timelineText.includes('this month') || timelineText.includes('this quarter')) {
    score = 18;
    timeframe = 'this_quarter';
  } else if (timelineText.includes('next quarter') || timelineText.includes('3 months')) {
    score = 15;
    timeframe = 'next_quarter';
  } else if (timelineText.includes('this year') || timelineText.includes('6 months')) {
    score = 12;
    timeframe = 'this_year';
  } else if (timelineText.includes('next year')) {
    score = 8;
    timeframe = 'next_year';
  } else {
    score = 5;
    timeframe = 'exploring';
  }
  
  console.log(`⏰ Timeline Score: ${score}/20 (${timeframe})`);
  
  return {
    timelineScore: score,
    qualification: {
      ...state.qualification,
      timeline: {
        timeframe,
        score,
      },
    } as BANTQualification,
  };
}

/**
 * Final scoring and qualification node
 */
async function calculateFinalQualificationNode(
  state: QualificationState
): Promise<Partial<QualificationState>> {
  const { budgetScore, authorityScore, needScore, timelineScore, customerInfo } = state;
  
  // Calculate base BANT score
  const baseScore = budgetScore + authorityScore + needScore + timelineScore;
  
  // Apply industry multiplier
  const finalScore = calculateFinalScore(baseScore, customerInfo.industry);
  const tier = getQualificationTier(finalScore);
  const isQualified = finalScore >= 30;
  
  // Generate qualification reasons
  const qualificationReasons: string[] = [];
  
  if (budgetScore >= 20) qualificationReasons.push('Strong budget allocated');
  if (authorityScore >= 20) qualificationReasons.push('Decision-maker identified');
  if (needScore >= 20) qualificationReasons.push('Critical business need');
  if (timelineScore >= 15) qualificationReasons.push('Urgent timeline');
  if (customerInfo.industry && INDUSTRY_MULTIPLIERS[customerInfo.industry] > 1.0) {
    qualificationReasons.push(`High-value ${customerInfo.industry} industry`);
  }
  
  const disqualificationReasons: string[] = [];
  if (budgetScore < 10) disqualificationReasons.push('Insufficient budget');
  if (authorityScore < 10) disqualificationReasons.push('No decision authority');
  if (needScore < 10) disqualificationReasons.push('Unclear business need');
  if (timelineScore < 8) disqualificationReasons.push('No defined timeline');
  
  console.log(`🏆 Final Qualification Score: ${finalScore}/100 (${tier})`);
  console.log(`✅ Qualified: ${isQualified}`);
  
  const qualification: BANTQualification = {
    budget: state.qualification?.budget || { status: 'unknown', score: budgetScore },
    authority: state.qualification?.authority || { 
      level: 'unknown', 
      canSign: false, 
      needsApproval: true, 
      score: authorityScore 
    },
    need: state.qualification?.need || {
      painLevel: 'low',
      urgency: 'low',
      impact: '',
      score: needScore,
    },
    timeline: state.qualification?.timeline || {
      timeframe: 'exploring',
      score: timelineScore,
    },
    totalScore: finalScore,
    isQualified,
    tier,
    qualificationReasons,
    disqualificationReasons: isQualified ? undefined : disqualificationReasons,
  };
  
  return { qualification };
}

/**
 * Router to determine next evaluation step
 */
function routeQualification(state: QualificationState): string | typeof END {
  // Sequential evaluation with early exit for unqualified leads
  if (state.budgetScore === 0) return 'evaluate_budget';
  if (state.authorityScore === 0) return 'evaluate_authority';
  if (state.needScore === 0) return 'evaluate_need';
  if (state.timelineScore === 0) return 'evaluate_timeline';
  if (!state.qualification || state.qualification.totalScore === 0) return 'calculate_final';
  
  return END;
}

/**
 * Build the qualification sub-graph
 */
export function buildQualificationSubgraph() {
  const workflow = new StateGraph(QualificationAnnotation)
    // Add evaluation nodes
    .addNode('evaluate_budget', evaluateBudgetNode)
    .addNode('evaluate_authority', evaluateAuthorityNode)
    .addNode('evaluate_need', evaluateNeedNode)
    .addNode('evaluate_timeline', evaluateTimelineNode)
    .addNode('calculate_final', calculateFinalQualificationNode)
    
    // Define sequential flow with routing
    .addEdge('__start__', 'evaluate_budget')
    .addEdge('evaluate_budget', 'evaluate_authority')
    .addEdge('evaluate_authority', 'evaluate_need')
    .addEdge('evaluate_need', 'evaluate_timeline')
    .addEdge('evaluate_timeline', 'calculate_final')
    .addEdge('calculate_final', END);
  
  return workflow.compile();
}

/**
 * Standalone function to run qualification
 */
export async function runQualification(
  customerInfo: CustomerInfo,
  messages: BaseMessage[]
): Promise<BANTQualification | null> {
  const subgraph = buildQualificationSubgraph();
  
  const result = await subgraph.invoke({
    customerInfo,
    messages,
    budgetScore: 0,
    authorityScore: 0,
    needScore: 0,
    timelineScore: 0,
    qualification: null,
  });
  
  return result.qualification;
}