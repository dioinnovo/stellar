/**
 * Email Notification Schema
 * 
 * Strict structure that MUST be populated for every lead notification
 * This ensures consistent, professional emails with all critical information
 */

export interface EmailNotificationSchema {
  // Header Section - Priority and scoring
  header: {
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    priorityEmoji: '🔥' | '⚡' | '📌';
    score: number;
    maxScore: number;
    tier: 'hot' | 'warm' | 'cold' | 'nurture' | 'disqualified';
    tierColor: string;
    urgencyMessage: string;
    intentType: 'automation_inquiry' | 'demo_request' | 'pricing_inquiry' | 'support' | 'partnership' | 'general_inquiry';
    opportunitySummary?: string;
  };
  
  // Lead Contact Information
  leadDetails: {
    contactInfo: {
      name: string;
      email: string;
      phone: string;
      role: string;
      title: string;
      decisionMaker: boolean;
      decisionMakerLabel: '✅ Decision Maker' | '🤝 Influencer' | '🔍 Researcher' | '❓ Unknown';
    };
    
    companyInfo: {
      name: string;
      industry: string;
      size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise' | 'unknown';
      sizeLabel: string; // e.g., "350 professionals"
      website?: string;
      revenue?: string;
    };
    
    requirements: {
      budget: string;
      budgetNumeric?: number;
      timeline: string;
      timelineUrgency: 'immediate' | 'this_month' | 'this_quarter' | 'this_year' | 'exploring';
      challenges: string[];
      currentSolution?: string;
      painPoints: Array<{
        description: string;
        severity: 'critical' | 'high' | 'medium' | 'low';
      }>;
    };
  };
  
  // Qualification Assessment
  qualificationFactors: {
    bantScore: {
      budget: { score: number; max: 30; status: string; };
      authority: { score: number; max: 25; status: string; };
      need: { score: number; max: 25; status: string; };
      timeline: { score: number; max: 20; status: string; };
    };
    
    checklistItems: Array<{
      met: boolean;
      emoji: '✓' | '✗' | '⚠️';
      label: string;
      detail: string;
      importance: 'critical' | 'important' | 'nice_to_have';
    }>;
    
    strengths: string[];
    concerns: string[];
  };
  
  // Conversation Context
  conversationHighlights: {
    // Key conversation snippets
    keyExchanges: Array<{
      speaker: 'visitor' | 'ai';
      message: string;
      timestamp: string;
      significance: 'critical' | 'important' | 'context';
    }>;
    
    // Important moments in conversation
    keyMoments: Array<{
      event: string;
      impact: 'positive' | 'negative' | 'neutral';
      timestamp: string;
    }>;
    
    // Engagement metrics
    engagement: {
      messageCount: number;
      conversationDuration: string;
      responseTime: string;
      engagementLevel: 'high' | 'medium' | 'low';
    };
  };
  
  // Required Actions
  actionItems: {
    urgency: 'IMMEDIATE' | '2_HOURS' | '24_HOURS' | '48_HOURS' | 'WEEK';
    urgencyColor: string;
    urgencyMessage: string;
    
    recommendedActions: Array<{
      priority: number;
      action: string;
      reasoning: string;
    }>;
    
    primaryFocus: string;
    suggestedApproach: string;
    
    crmActions: {
      tags: string[];
      status: string;
      assignTo?: string;
      notes: string;
    };
  };
  
  // Tracking Metadata
  metadata: {
    sessionId: string;
    source: 'chat_widget' | 'contact_form' | 'email' | 'phone' | 'api';
    sourceDetails: string;
    timestamp: string;
    timestampFormatted: string;
    ipAddress?: string;
    location?: string;
    referrer?: string;
    utmParams?: {
      source?: string;
      medium?: string;
      campaign?: string;
    };
  };
  
  // Email Configuration
  emailConfig: {
    to: string[];
    cc?: string[];
    subject: string;
    preheader: string;
    replyTo?: string;
    trackingEnabled: boolean;
  };
}

/**
 * Helper function to determine priority based on score
 */
export function determinePriority(score: number): EmailNotificationSchema['header']['priority'] {
  if (score >= 80) return 'HIGH';
  if (score >= 60) return 'MEDIUM';
  return 'LOW';
}

/**
 * Helper function to get priority emoji
 */
export function getPriorityEmoji(priority: EmailNotificationSchema['header']['priority']): '🔥' | '⚡' | '📌' {
  switch (priority) {
    case 'HIGH': return '🔥';
    case 'MEDIUM': return '⚡';
    case 'LOW': return '📌';
  }
}

/**
 * Helper function to determine urgency
 */
export function determineUrgency(
  timeline: string | undefined,
  score: number
): EmailNotificationSchema['actionItems']['urgency'] {
  if (score >= 80 || timeline?.includes('immediate') || timeline?.includes('asap')) {
    return 'IMMEDIATE';
  }
  if (score >= 70 || timeline?.includes('week')) {
    return '2_HOURS';
  }
  if (score >= 60 || timeline?.includes('month')) {
    return '24_HOURS';
  }
  if (score >= 45) {
    return '48_HOURS';
  }
  return 'WEEK';
}

/**
 * Helper to get tier color
 */
export function getTierColor(tier: string): string {
  switch (tier) {
    case 'hot': return '#ff4444';
    case 'warm': return '#ffaa00';
    case 'cold': return '#3B82F6';
    case 'nurture': return '#00C851';
    default: return '#6c757d';
  }
}

/**
 * Default email schema with empty values
 */
export function createDefaultEmailSchema(): EmailNotificationSchema {
  return {
    header: {
      priority: 'LOW',
      priorityEmoji: '📌',
      score: 0,
      maxScore: 100,
      tier: 'nurture',
      tierColor: '#00C851',
      urgencyMessage: 'Follow up within a week',
      intentType: 'general_inquiry',
    },
    leadDetails: {
      contactInfo: {
        name: 'Not provided',
        email: 'Not provided',
        phone: 'Not provided',
        role: 'Not specified',
        title: 'Not specified',
        decisionMaker: false,
        decisionMakerLabel: '❓ Unknown',
      },
      companyInfo: {
        name: 'Not specified',
        industry: 'Not specified',
        size: 'unknown',
        sizeLabel: 'Size unknown',
      },
      requirements: {
        budget: 'Not discussed',
        timeline: 'Not specified',
        timelineUrgency: 'exploring',
        challenges: [],
        painPoints: [],
      },
    },
    qualificationFactors: {
      bantScore: {
        budget: { score: 0, max: 30, status: 'Unknown' },
        authority: { score: 0, max: 25, status: 'Unknown' },
        need: { score: 0, max: 25, status: 'Unknown' },
        timeline: { score: 0, max: 20, status: 'Unknown' },
      },
      checklistItems: [],
      strengths: [],
      concerns: [],
    },
    conversationHighlights: {
      keyExchanges: [],
      keyMoments: [],
      engagement: {
        messageCount: 0,
        conversationDuration: '0 minutes',
        responseTime: 'N/A',
        engagementLevel: 'low',
      },
    },
    actionItems: {
      urgency: 'WEEK',
      urgencyColor: '#6c757d',
      urgencyMessage: 'Follow up when convenient',
      recommendedActions: [],
      primaryFocus: 'Initial outreach',
      suggestedApproach: 'Exploratory conversation',
      crmActions: {
        tags: ['new_lead'],
        status: 'new',
        notes: '',
      },
    },
    metadata: {
      sessionId: '',
      source: 'chat_widget',
      sourceDetails: 'AI Chat Widget - Innovoco Website',
      timestamp: new Date().toISOString(),
      timestampFormatted: new Date().toLocaleString(),
    },
    emailConfig: {
      to: [],
      subject: 'New Lead Notification',
      preheader: 'A new lead requires attention',
      trackingEnabled: true,
    },
  };
}