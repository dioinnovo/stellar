/**
 * Unified State Definition for Master Orchestrator
 * 
 * This combines the best of all existing systems into a single,
 * comprehensive state management system using LangGraph.js Annotation.Root
 */

import { Annotation } from '@langchain/langgraph';
import { BaseMessage } from '@langchain/core/messages';

/**
 * Complete customer information with all fields
 */
export interface CustomerInfo {
  // Basic Information
  name?: string;
  email?: string;
  phone?: string;
  linkedIn?: string;
  preferredContact?: 'email' | 'phone' | 'text';
  
  // Company Information
  company?: string;
  companyWebsite?: string;
  industry?: string;
  companySize?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  employeeCount?: number;
  annualRevenue?: string;
  
  // Role & Authority
  title?: string;
  department?: string;
  role?: 'decision_maker' | 'influencer' | 'researcher' | 'end_user';
  reportingTo?: string;
  teamSize?: number;
  
  // Needs & Challenges
  currentChallenges?: string[];
  painPoints?: Array<{
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    impact: string;
    currentSolution?: string;
  }>;
  goals?: string[];
  successCriteria?: string[];
  
  // Technical Context
  currentStack?: string[];
  integrations?: string[];
  dataVolume?: string;
  complianceNeeds?: string[];
  
  // Engagement
  interests?: string[];
  previousSolutions?: string[];
  competitors?: string[];
  evaluationCriteria?: string[];
  
  // Intent and Opportunity
  intentType?: 'automation_inquiry' | 'demo_request' | 'pricing_inquiry' | 'support' | 'partnership' | 'general_inquiry';
  opportunitySummary?: string;
  
  // New BANT fields from HubSpot best practices
  stakeholders?: string[];  // Other decision makers involved
  evaluationStage?: string; // exploring, comparing, deciding
  currentSpend?: string;    // What they currently spend on this problem
}

/**
 * Complete BANT Qualification with all components
 */
export interface BANTQualification {
  // Budget (0-30 points)
  budget: {
    amount?: number;
    range?: string;
    status: 'allocated' | 'planned' | 'exploring' | 'unknown';
    score: number;
  };
  
  // Authority (0-25 points)
  authority: {
    level: 'decision_maker' | 'influencer' | 'researcher' | 'unknown';
    canSign: boolean;
    needsApproval: boolean;
    approver?: string;
    score: number;
  };
  
  // Need (0-25 points)
  need: {
    painLevel: 'low' | 'medium' | 'high' | 'critical';
    urgency: 'low' | 'medium' | 'high' | 'immediate';
    impact: string;
    consequences?: string;
    score: number;
  };
  
  // Timeline (0-20 points)
  timeline: {
    timeframe: 'immediate' | 'this_quarter' | 'next_quarter' | 'this_year' | 'next_year' | 'exploring';
    deadline?: Date;
    drivingEvent?: string;
    score: number;
  };
  
  // Overall
  totalScore: number;
  isQualified: boolean;
  tier: 'hot' | 'warm' | 'cold' | 'nurture' | 'disqualified';
  qualificationReasons: string[];
  disqualificationReasons?: string[];
}

/**
 * Service recommendation with detailed reasoning
 */
export interface ServiceRecommendation {
  primary: {
    id: string;
    name: string;
    reasoning: string;
    fitScore: number;
  };
  secondary: Array<{
    id: string;
    name: string;
    reasoning: string;
    fitScore: number;
  }>;
  estimatedValue: string;
  estimatedTimeline: string;
  implementationPlan?: string;
  expectedOutcomes: string[];
  risks?: string[];
  competitiveAdvantage?: string;
}

/**
 * Analytics tracking for insights
 */
export interface AnalyticsData {
  conversationDuration: number;
  messageCount: number;
  qualificationTime?: number;
  dropOffPoint?: string;
  engagementScore: number;
  sentimentTrend: 'positive' | 'neutral' | 'negative';
  keyMoments: Array<{
    timestamp: Date;
    event: string;
    impact: 'positive' | 'negative' | 'neutral';
  }>;
  conversionProbability: number;
}

/**
 * Agent execution tracking
 */
export interface AgentExecution {
  agentId: string;
  startTime: Date;
  endTime?: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
  retryCount: number;
}

/**
 * Unified State Annotation using proper LangGraph.js patterns
 */
export const MasterOrchestratorAnnotation = Annotation.Root({
  // Session Management
  sessionId: Annotation<string>({
    value: (current, update) => update ?? current,
    default: () => '',
  }),
  
  conversationType: Annotation<'chat' | 'callback' | 'email' | 'form'>({
    value: (current, update) => update ?? current,
    default: () => 'chat',
  }),
  
  // Conversation State
  messages: Annotation<BaseMessage[]>({
    value: (current, update) => {
      if (!update) return current;
      if (Array.isArray(update)) {
        return [...current, ...update];
      }
      return [...current, update];
    },
    default: () => [],
  }),
  
  // Customer Information (merged updates)
  customerInfo: Annotation<CustomerInfo>({
    value: (current, update) => {
      if (!update) return current;
      // Deep merge for nested objects
      const merged = { ...current };
      
      // Merge basic info
      Object.assign(merged, update);
      
      // Merge arrays (don't duplicate)
      if (update.currentChallenges) {
        merged.currentChallenges = [
          ...(current.currentChallenges || []),
          ...update.currentChallenges.filter(
            c => !current.currentChallenges?.includes(c)
          )
        ];
      }
      
      if (update.painPoints) {
        merged.painPoints = [
          ...(current.painPoints || []),
          ...update.painPoints
        ];
      }
      
      return merged;
    },
    default: () => ({}),
  }),
  
  // BANT Qualification (replaced entirely on update)
  qualification: Annotation<BANTQualification | null>({
    value: (current, update) => update ?? current,
    default: () => null,
  }),
  
  // Service Recommendations
  recommendations: Annotation<ServiceRecommendation | null>({
    value: (current, update) => update ?? current,
    default: () => null,
  }),
  
  // Analytics Data (merged updates)
  analytics: Annotation<AnalyticsData>({
    value: (current, update) => {
      if (!update) return current;
      return {
        ...current,
        ...update,
        keyMoments: [
          ...(current.keyMoments || []),
          ...(update.keyMoments || [])
        ],
      };
    },
    default: () => ({
      conversationDuration: 0,
      messageCount: 0,
      engagementScore: 0,
      sentimentTrend: 'neutral',
      keyMoments: [],
      conversionProbability: 0,
    }),
  }),
  
  // Next Actions
  nextAction: Annotation<{
    type: 'schedule_meeting' | 'send_info' | 'follow_up' | 'nurture' | 'disqualify' | null;
    details?: any;
    scheduledFor?: Date;
  }>({
    value: (current, update) => update ?? current,
    default: () => ({ type: null }),
  }),
  
  // Meeting Details
  meetingScheduled: Annotation<{
    consultantName: string;
    consultantEmail: string;
    dateTime: Date;
    duration: number;
    meetingType: 'video' | 'phone';
    meetingUrl?: string;
    agendaItems: string[];
    preparationNotes: string[];
  } | null>({
    value: (current, update) => update ?? current,
    default: () => null,
  }),
  
  // Agent Tracking
  agentExecutions: Annotation<AgentExecution[]>({
    value: (current, update) => {
      if (!update) return current;
      if (Array.isArray(update)) {
        return [...current, ...update];
      }
      return [...current, update];
    },
    default: () => [],
  }),
  
  // Workflow Control
  currentPhase: Annotation<'greeting' | 'discovery' | 'qualification' | 'recommendation' | 'closing' | 'follow_up'>({
    value: (current, update) => update ?? current,
    default: () => 'greeting',
  }),
  
  // UI Control
  latestUiAction: Annotation<{
    type: 'show_text_input' | 'hide_text_input' | 'none';
    inputType: 'email' | 'phone' | null;
    placeholder: string | null;
  } | null>({
    value: (current, update) => update ?? current,
    default: () => null,
  }),
  
  // Quick action buttons for UI
  quickActions: Annotation<Array<{
    label: string;
    value: string;
    icon: string | null;
  }> | null>({
    value: (current, update) => update ?? current,
    default: () => null,
  }),
  
  // Conversation turn tracking for natural flow
  conversationTurn: Annotation<{
    lastSpeaker: 'user' | 'assistant' | null;
    turnCount: number;
    waitingForUser: boolean;
    lastQuestionAsked?: string;
    questionTimestamp?: Date;
  }>({
    value: (current, update) => {
      if (!update) return current;
      return {
        ...current,
        ...update,
        turnCount: update.lastSpeaker ? current.turnCount + 1 : current.turnCount,
      };
    },
    default: () => ({
      lastSpeaker: null,
      turnCount: 0,
      waitingForUser: false,
    }),
  }),
  
  nextNode: Annotation<string | null>({
    value: (current, update) => update ?? current,
    default: () => null,
  }),
  
  // Status Tracking
  conversationStatus: Annotation<'active' | 'paused' | 'completed' | 'abandoned'>({
    value: (current, update) => update ?? current,
    default: () => 'active',
  }),
  
  // Pending notification flag
  pendingNotification: Annotation<boolean>({
    value: (current, update) => update ?? current,
    default: () => false,
  }),
  
  // Metadata
  startTime: Annotation<Date>({
    value: (current, update) => update ?? current,
    default: () => new Date(),
  }),
  
  lastUpdateTime: Annotation<Date>({
    value: (current, update) => update ?? current ?? new Date(),
    default: () => new Date(),
  }),
  
  // Email Notification Tracking
  notificationsSent: Annotation<Array<{
    type: 'qualification' | 'meeting' | 'follow_up';
    sentAt: Date;
    recipient: string;
    status: 'sent' | 'failed';
  }>>({
    value: (current, update) => {
      if (!update) return current;
      if (Array.isArray(update)) {
        return [...current, ...update];
      }
      return [...current, update];
    },
    default: () => [],
  }),
  
  // Error Handling
  errors: Annotation<Array<{
    timestamp: Date;
    agent: string;
    error: string;
    recovered: boolean;
  }>>({
    value: (current, update) => {
      if (!update) return current;
      if (Array.isArray(update)) {
        return [...current, ...update];
      }
      return [...current, update];
    },
    default: () => [],
  }),
});

/**
 * Extract TypeScript type from annotation
 */
export type MasterOrchestratorState = typeof MasterOrchestratorAnnotation.State;

/**
 * Helper to create initial state
 */
export function createInitialState(
  sessionId: string,
  conversationType: 'chat' | 'callback' | 'email' | 'form' = 'chat'
): Partial<MasterOrchestratorState> {
  return {
    sessionId,
    conversationType,
    conversationStatus: 'active',
    currentPhase: 'greeting',
    messages: [],
    customerInfo: {},
    qualification: null,
    recommendations: null,
    analytics: {
      conversationDuration: 0,
      messageCount: 0,
      engagementScore: 0,
      sentimentTrend: 'neutral',
      keyMoments: [],
      conversionProbability: 0,
    },
    nextAction: { type: null },
    meetingScheduled: null,
    agentExecutions: [],
    notificationsSent: [],
    errors: [],
    startTime: new Date(),
    lastUpdateTime: new Date(),
    pendingNotification: false,
  };
}

/**
 * Helper to check if lead is qualified
 */
export function isQualified(state: MasterOrchestratorState): boolean {
  return state.qualification?.isQualified ?? false;
}

/**
 * Helper to get qualification tier
 */
export function getQualificationTier(score: number): BANTQualification['tier'] {
  if (score >= 80) return 'hot';
  if (score >= 60) return 'warm';
  if (score >= 40) return 'cold';
  if (score >= 20) return 'nurture';
  return 'disqualified';
}

/**
 * Industry multipliers for scoring
 */
export const INDUSTRY_MULTIPLIERS: Record<string, number> = {
  'financial_services': 1.15,  // High-value industry but capped
  'finance': 1.15,              // Alternative key for finance
  'healthcare': 1.12,           // High regulatory needs
  'manufacturing': 1.10,        // Complex operations
  'retail': 1.05,               // Standard commercial
  'technology': 1.08,           // Tech-savvy buyers
  'legal': 1.10,                // High compliance needs
  'education': 0.95,            // Budget-conscious
  'nonprofit': 0.90,            // Limited budgets
  'government': 1.0,            // Standard baseline
  'other': 1.0,                 // Default multiplier
};

/**
 * Calculate final score with industry multiplier
 */
export function calculateFinalScore(
  baseScore: number,
  industry?: string
): number {
  // Cap base score at reasonable BANT maximum (100 points)
  const cappedBase = Math.min(100, Math.max(0, baseScore));
  
  // Get industry multiplier, capped at 1.15 to prevent overflow
  const industryKey = industry?.toLowerCase().replace(/\s+/g, '_');
  const rawMultiplier = industryKey ? (INDUSTRY_MULTIPLIERS[industryKey] || 1.0) : 1.0;
  const cappedMultiplier = Math.min(1.15, Math.max(0.8, rawMultiplier));
  
  // Calculate final score
  const calculatedScore = cappedBase * cappedMultiplier;
  
  // Hard cap at 100 - scores should NEVER exceed this
  const finalScore = Math.min(100, Math.round(calculatedScore));
  
  console.log('Score calculation:', {
    baseScore,
    cappedBase,
    industry,
    multiplier: cappedMultiplier,
    calculatedScore,
    finalScore
  });
  
  return finalScore;
}