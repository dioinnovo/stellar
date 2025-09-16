/**
 * Notification Agent with Structured Email Templates
 * 
 * Sends professional, consistently formatted email notifications for qualified leads
 */

import { MasterOrchestratorState, AgentExecution } from '../orchestrator/state';
import { 
  EmailNotificationSchema,
  createDefaultEmailSchema,
  determinePriority,
  getPriorityEmoji,
  determineUrgency,
  getTierColor
} from '../email/notification-schema';
import { buildNotificationEmail } from '../email/notification-template';
import { 
  ClientEmailSchema,
  createDefaultClientEmailSchema,
  validateClientEmailSchema
} from '../email/client-schema';
import { 
  mapChallengesToSolutions, 
  generateSuccessMetrics, 
  generateIndustryProof 
} from '../email/solution-vision';
import { buildClientEmail } from '../email/client-template';

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';

/**
 * Send email using Resend API
 */
async function sendEmail(to: string, subject: string, html: string, fromName: string = 'Innovoco AI Lead Intel'): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.log('⚠️ RESEND_API_KEY not configured - Email would be sent to:', { 
      to, 
      subject,
      fromName,
      note: 'Set RESEND_API_KEY in .env.local to enable email sending'
    });
    // Log a preview of the email for debugging
    console.log('📧 Email Preview (first 500 chars):', html.substring(0, 500));
    return true; // Simulate success in dev
  }
  
  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const from = `${fromName} <${fromEmail}>`;
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('Resend API error:', response.status, error);
      return false;
    }
    
    const result = await response.json();
    console.log('📧 Email sent successfully:', result.id);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

/**
 * Map job title to decision-making role category
 */
function mapTitleToRole(title: string | undefined): 'decision_maker' | 'influencer' | 'researcher' | 'unknown' {
  const titleLower = title?.toLowerCase() || '';
  
  // C-level and owners are decision makers
  if (titleLower.match(/ceo|coo|cfo|cto|cio|president|owner|founder|partner/)) {
    return 'decision_maker';
  }
  // VPs and Directors are influencers
  else if (titleLower.match(/vp|vice president|director|head of/)) {
    return 'influencer';
  }
  // Managers and analysts are researchers
  else if (titleLower.match(/manager|lead|analyst|coordinator|specialist/)) {
    return 'researcher';
  }
  
  return 'unknown';
}

/**
 * Build structured email data from orchestrator state
 */
function buildEmailSchema(state: MasterOrchestratorState): EmailNotificationSchema {
  const schema = createDefaultEmailSchema();
  const { customerInfo, qualification, analytics, messages } = state;
  
  // Header Section
  const score = qualification?.totalScore || 0;
  const priority = determinePriority(score);
  
  schema.header = {
    priority,
    priorityEmoji: getPriorityEmoji(priority),
    score,
    maxScore: 100,
    tier: qualification?.tier || 'nurture',
    tierColor: getTierColor(qualification?.tier || 'nurture'),
    urgencyMessage: priority === 'HIGH' ? 'Contact immediately!' :
                    priority === 'MEDIUM' ? 'Follow up within 2 hours' :
                    'Follow up within 24 hours',
    intentType: customerInfo.intentType || 'general_inquiry',
    opportunitySummary: customerInfo.opportunitySummary,
  };
  
  // Lead Details
  // Map title to role if role is not already a category
  const mappedRole = (customerInfo.role === 'decision_maker' || 
                      customerInfo.role === 'influencer' || 
                      customerInfo.role === 'researcher') 
                      ? customerInfo.role 
                      : mapTitleToRole(customerInfo.role || customerInfo.title);
  
  schema.leadDetails = {
    contactInfo: {
      name: customerInfo.name || 'Not provided',
      email: customerInfo.email || 'Not provided',
      phone: customerInfo.phone || 'Not provided',
      role: mappedRole,
      title: customerInfo.role || customerInfo.title || 'Not specified',
      decisionMaker: mappedRole === 'decision_maker',
      decisionMakerLabel: 
        mappedRole === 'decision_maker' ? '✅ Decision Maker' :
        mappedRole === 'influencer' ? '🤝 Influencer' :
        mappedRole === 'researcher' ? '🔍 Researcher' :
        '❓ Unknown',
    },
    companyInfo: {
      name: customerInfo.company || 'Not specified',
      industry: customerInfo.industry || 'Not specified',
      size: customerInfo.companySize || 'unknown',
      sizeLabel: 
        customerInfo.companySize === 'enterprise' ? '1000+ employees' :
        customerInfo.companySize === 'large' ? '250-1000 employees' :
        customerInfo.companySize === 'medium' ? '50-250 employees' :
        customerInfo.companySize === 'small' ? '10-50 employees' :
        customerInfo.companySize === 'startup' ? '<10 employees' :
        'Size not specified',
      website: customerInfo.companyWebsite,
    },
    requirements: {
      budget: 'Not discussed', // Budget info not stored in CustomerInfo
      budgetNumeric: undefined, // Could parse from budget string
      timeline: 'Not specified', // Timeline info not stored in CustomerInfo
      timelineUrgency: 'exploring' as const, // Timeline info not available in CustomerInfo
      challenges: customerInfo.currentChallenges || [],
      currentSolution: undefined, // Current tools info not available in CustomerInfo
      painPoints: customerInfo.painPoints || [],
    },
  };
  
  // Qualification Factors
  schema.qualificationFactors = {
    bantScore: {
      budget: { 
        score: qualification?.budget.score || 0, 
        max: 30, 
        status: qualification?.budget.status || 'Unknown' 
      },
      authority: { 
        score: qualification?.authority.score || 0, 
        max: 25, 
        status: qualification?.authority.level || 'Unknown' 
      },
      need: { 
        score: qualification?.need.score || 0, 
        max: 25, 
        status: qualification?.need.painLevel || 'Unknown' 
      },
      timeline: { 
        score: qualification?.timeline.score || 0, 
        max: 20, 
        status: qualification?.timeline.timeframe || 'Unknown' 
      },
    },
    checklistItems: [
      {
        met: !!customerInfo.company,
        emoji: customerInfo.company ? '✓' : '✗',
        label: 'Company identified',
        detail: customerInfo.company || 'Not provided',
        importance: 'critical',
      },
      {
        met: false, // Budget info not available in CustomerInfo
        emoji: '⚠️' as const,
        label: 'Budget range',
        detail: 'Not discussed',
        importance: 'important' as const,
      },
      {
        met: false, // Timeline info not available in CustomerInfo
        emoji: '⚠️' as const,
        label: 'Timeline specified',
        detail: 'Not specified',
        importance: 'important' as const,
      },
      {
        met: !!(customerInfo.currentChallenges && customerInfo.currentChallenges.length > 0),
        emoji: customerInfo.currentChallenges?.length ? '✓' : '✗',
        label: 'Pain points identified',
        detail: customerInfo.currentChallenges?.length ? 
                `${customerInfo.currentChallenges.length} challenges identified` : 
                'No specific challenges mentioned',
        importance: 'critical',
      },
      {
        met: customerInfo.role === 'decision_maker' || customerInfo.role === 'influencer',
        emoji: customerInfo.role === 'decision_maker' ? '✓' : '⚠️',
        label: 'Decision authority',
        detail: customerInfo.role || 'Unknown',
        importance: 'important',
      },
    ],
    strengths: qualification?.qualificationReasons || [],
    concerns: qualification?.disqualificationReasons || [],
  };
  
  // Conversation Highlights
  const conversationPairs: Array<{ speaker: 'visitor' | 'ai'; message: string; timestamp: string; significance: 'critical' | 'important' | 'context' }> = [];
  messages.forEach((msg, index) => {
    const speaker = msg._getType() === 'human' ? 'visitor' : 'ai';
    const content = msg.content.toString();
    
    // Only include meaningful exchanges
    if (content.length > 20 && content.length < 300) {
      conversationPairs.push({
        speaker,
        message: content,
        timestamp: new Date().toISOString(),
        significance: index < 2 ? 'critical' : 'context' as const,
      });
    }
  });
  
  schema.conversationHighlights = {
    keyExchanges: conversationPairs.slice(-8), // Last 8 messages
    keyMoments: [], // Simplified for now to avoid timestamp conversion
    engagement: {
      messageCount: messages.length,
      conversationDuration: Math.round(analytics?.conversationDuration / 60) + ' minutes',
      responseTime: 'Real-time',
      engagementLevel: 
        analytics?.engagementScore > 70 ? 'high' :
        analytics?.engagementScore > 40 ? 'medium' : 'low',
    },
  };
  
  // Action Items
  const urgency = determineUrgency(undefined, score); // Timeline not available in CustomerInfo
  schema.actionItems = {
    urgency,
    urgencyColor: urgency === 'IMMEDIATE' ? '#ff4444' : 
                  urgency === '2_HOURS' ? '#ffaa00' : 
                  '#00C851',
    urgencyMessage: 
      urgency === 'IMMEDIATE' ? 'Contact immediately - hot lead!' :
      urgency === '2_HOURS' ? 'Follow up within 2 hours' :
      urgency === '24_HOURS' ? 'Follow up within 24 hours' :
      'Follow up within 48 hours',
    recommendedActions: [
      {
        priority: 1,
        action: 'Review the full conversation transcript below',
        reasoning: 'Understand context and pain points',
      },
      {
        priority: 2,
        action: `Call or email ${customerInfo.name || 'the lead'} with a personalized proposal`,
        reasoning: 'Strike while interest is high',
      },
      {
        priority: 3,
        action: 'Schedule a discovery call or demo',
        reasoning: 'Deepen engagement and build trust',
      },
      {
        priority: 4,
        action: `Add to CRM with "${qualification?.tier || 'new'}" tag`,
        reasoning: 'Track in pipeline',
      },
    ],
    primaryFocus: customerInfo.currentChallenges?.[0] || 'Initial discovery',
    suggestedApproach: 
      score >= 80 ? 'Move fast with a strong value proposition' :
      score >= 60 ? 'Focus on ROI and quick wins' :
      score >= 40 ? 'Educational approach with case studies' :
      'Nurture with valuable content',
    crmActions: {
      tags: [
        qualification?.tier || 'unqualified',
        customerInfo.industry || 'unknown-industry',
        'ai-chat-lead',
        urgency.toLowerCase(),
      ],
      status: qualification?.isQualified ? 'qualified' : 'new',
      notes: `Lead score: ${score}/100. ${customerInfo.currentChallenges?.length || 0} pain points identified.`,
    },
  };
  
  // Metadata
  schema.metadata = {
    sessionId: state.sessionId,
    source: 'chat_widget',
    sourceDetails: 'AI Chat Widget - Innovoco Website',
    timestamp: new Date().toISOString(),
    timestampFormatted: new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    }),
  };
  
  // Email Configuration
  schema.emailConfig = {
    to: ['dio.delahoz@innovoco.com'],
    subject: `🎯 ${priority} Priority Lead: ${customerInfo.name || 'New Lead'} - ${customerInfo.company || 'Unknown Company'} (Score: ${score}/100)`,
    preheader: `${customerInfo.currentChallenges?.[0] || 'New opportunity'} - Requires ${urgency.toLowerCase().replace('_', ' ')} follow-up`,
    trackingEnabled: true,
  };
  
  return schema;
}

/**
 * Main notification node
 */
export async function notificationNode(
  state: MasterOrchestratorState
): Promise<Partial<MasterOrchestratorState>> {
  const startTime = new Date();
  const notifications = [];
  
  try {
    // Send emails for all leads with contact info and minimum score
    console.log('📧 Notification agent checking email conditions:', {
      email: state.customerInfo.email,
      score: state.qualification?.totalScore,
      tier: state.qualification?.tier,
      isQualified: state.qualification?.isQualified,
      name: state.customerInfo.name,
      company: state.customerInfo.company,
      sessionId: state.sessionId
    });
    
    // Lower threshold to 30 to capture more qualified leads
    if (state.customerInfo.email && (state.qualification?.totalScore ?? 0) >= 30) {
      console.log('✅ Email conditions met - preparing to send notifications');
      
      // 1. Build structured email data
      const emailSchema = buildEmailSchema(state);
      
      // 2. Generate HTML email from template
      const internalHtml = buildNotificationEmail(emailSchema);
      
      // 3. Send internal notification to sales team
      const internalSent = await sendEmail(
        'dio.delahoz@innovoco.com',
        emailSchema.emailConfig.subject,
        internalHtml,
        'Innovoco AI Lead Intelligence'
      );
      
      notifications.push({
        type: 'qualification' as const,
        sentAt: new Date(),
        recipient: 'dio.delahoz@innovoco.com',
        status: internalSent ? 'sent' as const : 'failed' as const,
      });
      
      // 4. Send client confirmation using new structured email system
      // No scoring/tier awareness - pure solution vision approach
      console.log('Generating structured client email...');
      
      // Create client email schema
      const clientEmailSchema = createDefaultClientEmailSchema();
      
      // Populate with customer data
      clientEmailSchema.personalization.recipientName = state.customerInfo.name || 'Valued Client';
      clientEmailSchema.personalization.companyName = state.customerInfo.company || 'Your Organization';
      clientEmailSchema.personalization.industry = state.customerInfo.industry || 'Business';
      clientEmailSchema.personalization.companySize = state.customerInfo.companySize || '100+';
      clientEmailSchema.personalization.role = state.customerInfo.role || 'Decision Maker';
      
      // Map challenges to solution visions
      const rawChallenges = state.customerInfo.currentChallenges || [];
      if (rawChallenges.length > 0) {
        const mappedChallenges = mapChallengesToSolutions(
          rawChallenges,
          clientEmailSchema.personalization.industry,
          clientEmailSchema.personalization.companySize,
          'exploring' // Timeline not available in CustomerInfo
        );
        clientEmailSchema.personalization.challenges = mappedChallenges;
        
        // Update primary solution
        if (mappedChallenges.length > 0) {
          clientEmailSchema.solutionVision.primarySolution = mappedChallenges[0].solution;
          clientEmailSchema.solutionVision.secondarySolutions = mappedChallenges.slice(1, 3).map(c => c.solution);
        }
      }
      
      // Set timeline context (timeline not available in CustomerInfo)
      clientEmailSchema.personalization.timeline = {
        phase: 'exploring' as const,
        urgency: 'researching' as const,
        decisionTimeframe: 'evaluating options', // Timeline not available in CustomerInfo
        businessDrivers: rawChallenges.length > 0 ? [rawChallenges[0]] : ['operational efficiency']
      };
      
      // Set decision context
      clientEmailSchema.personalization.decisionContext = {
        stakeholders: state.customerInfo.stakeholders || ['leadership team'],
        decisionProcess: 'collaborative evaluation',
        currentEvaluation: 'exploring automation solutions',
        competitiveFactors: ['multiple solution options']
      };
      
      // Generate industry-specific success metrics and social proof
      clientEmailSchema.solutionVision.successMetrics = generateSuccessMetrics(
        clientEmailSchema.personalization.challenges,
        clientEmailSchema.personalization.industry
      );
      clientEmailSchema.solutionVision.socialProof = generateIndustryProof(
        clientEmailSchema.personalization.industry,
        clientEmailSchema.personalization.companySize
      );
      
      // Configure email settings
      const recipientName = clientEmailSchema.personalization.recipientName !== 'Valued Client' ? 
        clientEmailSchema.personalization.recipientName : '';
      
      clientEmailSchema.emailConfig.subject = `${recipientName ? `${recipientName}, thank you for connecting` : 'Thank you for connecting'} with Innovoco`;
      clientEmailSchema.emailConfig.preheader = `Next steps for your AI transformation journey`;
      
      // Set communication tone based on context
      clientEmailSchema.tone.formality = (clientEmailSchema.personalization.role === 'CEO' || 
                                          clientEmailSchema.personalization.role === 'COO') ? 'executive' : 'professional';
      clientEmailSchema.tone.urgency = (clientEmailSchema.personalization.timeline.urgency === 'immediate') ? 'priority' : 'standard';
      clientEmailSchema.tone.confidence = 'collaborative';
      
      // Validate email quality
      const validation = validateClientEmailSchema(clientEmailSchema);
      console.log('📊 Client email quality:', {
        score: validation.qualityScore,
        issues: validation.issues,
        isValid: validation.isValid
      });
      
      // Build the email
      const clientHtml = buildClientEmail(clientEmailSchema);
      const clientSubject = clientEmailSchema.emailConfig.subject;
      
      console.log('Sending client email to:', state.customerInfo.email);
      
      const clientSent = await sendEmail(
        state.customerInfo.email,
        clientSubject,
        clientHtml,
        'Innovoco AI'
      );
      
      console.log('Client email sent:', clientSent ? 'SUCCESS' : 'FAILED');
      
      notifications.push({
        type: 'follow_up' as const,
        sentAt: new Date(),
        recipient: state.customerInfo.email,
        status: clientSent ? 'sent' as const : 'failed' as const,
      });
    } else {
      console.log('⚠️ Email not sent - conditions not met:', {
        hasEmail: !!state.customerInfo.email,
        score: state.qualification?.totalScore,
        threshold: 30,
        scoreMeetsThreshold: (state.qualification?.totalScore || 0) >= 30
      });
    }
    
    // Log final notification status
    console.log('📊 Notification agent completed:', {
      notificationsSent: notifications.length,
      successful: notifications.filter(n => n.status === 'sent').length,
      failed: notifications.filter(n => n.status === 'failed').length,
      recipients: notifications.map(n => n.recipient)
    });
    
    // Track execution
    const execution: AgentExecution = {
      agentId: 'notification',
      startTime,
      endTime: new Date(),
      status: 'completed',
      result: {
        emailsSent: notifications.filter(n => n.status === 'sent').length,
        emailsFailed: notifications.filter(n => n.status === 'failed').length,
      },
      retryCount: 0,
    };
    
    return {
      notificationsSent: notifications,
      agentExecutions: [execution],
    };
    
  } catch (error) {
    console.error('Notification agent error:', error);
    
    return {
      errors: [{
        timestamp: new Date(),
        agent: 'notification',
        error: error instanceof Error ? error.message : 'Unknown error',
        recovered: false,
      }],
      agentExecutions: [{
        agentId: 'notification',
        startTime,
        endTime: new Date(),
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        retryCount: 0,
      }],
    };
  }
}