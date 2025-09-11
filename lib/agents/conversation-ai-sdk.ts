/**
 * Conversation Agent - AI SDK Implementation
 * 
 * Uses Vercel AI SDK for structured output with Azure OpenAI
 * Following best practices for model configuration and flexibility
 */

import { generateObject } from 'ai';
import { z } from 'zod';
import { AIMessage } from '@langchain/core/messages';
import { MasterOrchestratorState, AgentExecution, CustomerInfo } from '../orchestrator/state';
import { getStructuredModel, CONVERSATION_MODEL_SETTINGS } from '../ai/providers';

/**
 * Zod schema for structured conversation response
 */
const ConversationResponseSchema = z.object({
  message: z.string().describe('Natural conversational response to the user'),
  
  extracted: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    company: z.string().optional(),
    industry: z.string().optional(),
    challenges: z.array(z.string()).optional(),
    budget: z.string().optional(),
    timeline: z.string().optional(),
    companySize: z.string().optional(),
    role: z.string().optional(),
  }).describe('Extracted customer information from conversation'),
  
  objectives: z.object({
    hasName: z.boolean(),
    hasContact: z.boolean(),
    hasCompany: z.boolean(),
    hasChallenges: z.boolean(),
    hasBudget: z.boolean(),
    hasTimeline: z.boolean(),
  }).describe('Track which objectives are complete'),
  
  qualification: z.object({
    shouldQualify: z.boolean(),
    estimatedScore: z.number().min(0).max(100),
    reasoning: z.string(),
  }).optional(),
  
  intentType: z.enum([
    'automation_inquiry',
    'demo_request', 
    'pricing_inquiry',
    'support',
    'partnership',
    'general_inquiry'
  ]).default('general_inquiry'),
  
  opportunitySummary: z.string().optional().describe('2-3 sentence executive summary when qualifying'),
  
  status: z.enum(['gathering', 'ready_to_qualify', 'qualified', 'human_requested', 'abandoned']),
  
  nextAction: z.enum(['continue', 'notify_sales', 'send_nurture', 'archive']),
  
  missingInfo: z.array(z.string()),
  
  conversationDepth: z.number().default(0),
});

type ConversationResponse = z.infer<typeof ConversationResponseSchema>;

/**
 * System prompt for structured conversation
 */
const STRUCTURED_CONVERSATION_PROMPT = `You are an AI assistant for Innovoco, helping visitors with AI and automation solutions.

Your job is to have a natural conversation while gathering key information and returning STRUCTURED JSON output.

CONVERSATION GUIDELINES:
- Be natural and conversational (1-2 sentences per response)
- Acknowledge what they tell you and build on it
- Ask one relevant follow-up question at a time
- Show understanding of their specific situation
- Be helpful, not salesy

INFORMATION PRIORITY (gather in this order):
1. Challenges/Pain Points - Understand their problem FIRST
2. Company/Industry - Get business context
3. Email - Capture with value proposition (CRITICAL)
4. Timeline - Understand urgency
5. Budget - Ask tactfully with ranges (IMPORTANT)
6. Name/Role - Nice to have but not critical

BUDGET DISCUSSION:
When discussing budget, always provide ranges to help classify:
"Do you have a budget range in mind for this project?
• Under $50K (departmental solution)
• $50K-$250K (company-wide implementation)
• $250K+ (enterprise transformation)
This helps us recommend the right scale of solution."

VALUE-FOCUSED EMAIL CAPTURE:
After understanding their challenge, use value-focused prompts:
- "I'd love to have our AI strategist prepare specific solutions for [their challenge]. What's the best email to send those recommendations to?"
- "Based on what you're describing, our team can create a custom automation roadmap. Where should I send that?"
- "I can arrange for you to receive our [industry] automation playbook. What email works best?"
- NEVER say "in case we get disconnected" or similar

AFTER EMAIL CAPTURE:
- Continue the conversation naturally: "Perfect! Now to make sure we design the right solution..."
- OR "Great, I'll make sure that gets to you. Now, to tailor this specifically..."
- NEVER imply the conversation is ending with phrases like "We'll send recommendations"
- Keep gathering timeline and budget information

QUALIFICATION CRITERIA:
DO NOT mark as ready_to_qualify unless ALL of these are met:
1. Email or phone captured (contact method)
2. SPECIFIC challenges identified (not just "automation" - need details)
3. Company or industry context
4. Timeline discussed
5. Budget range discussed OR explicitly declined to share
6. At least 6 meaningful exchanges completed
7. Conversation shows natural conclusion (user says thanks/goodbye) OR all above info gathered

CONVERSATION DEPTH:
- Count exchanges where user provides substantive information
- Don't qualify immediately after email capture - continue gathering context
- Aim for understanding their ACTUAL business problem, not just surface needs

INTENT DETECTION:
Classify the conversation intent based on what they're asking:
- automation_inquiry: Asking about process automation
- demo_request: Explicitly wants to see a demo
- pricing_inquiry: Asking about costs/budget
- support: Technical help request
- partnership: Business partnership inquiry
- general_inquiry: Exploring options

OPPORTUNITY SUMMARY:
When qualifying, create a 2-3 sentence executive summary:
- What problem are they trying to solve?
- What's the potential business impact?
- Why is this a good/bad fit for our solutions?

IMPORTANT RULES:
- ALWAYS extract information from the ENTIRE conversation history
- Update extracted data cumulatively (don't lose previous info)
- Continue conversation AFTER email capture to understand context
- Only qualify when you have MEANINGFUL business context
- Track conversationDepth (number of substantive exchanges)
- Generate opportunitySummary when ready to qualify
- Return valid JSON in the specified format

QUALIFICATION TRIGGERS:
Mark as ready_to_qualify ONLY when ALL these are true:
- Has email/phone AND
- Has SPECIFIC challenges (not generic "automation") AND
- Has company OR industry context AND
- Has timeline information AND
- Has budget range OR user declined to share AND
- conversationDepth >= 6 (at least 6 meaningful exchanges) AND
- User shows signs of ending conversation (thanks/goodbye) OR all above gathered

NEVER qualify if budget hasn't been discussed yet!`;

/**
 * Main conversation node using AI SDK
 */
export async function conversationNode(
  state: MasterOrchestratorState
): Promise<Partial<MasterOrchestratorState>> {
  const startTime = new Date();
  
  try {
    // Check if this is first interaction
    const hasAIMessages = state.messages.some(msg => msg._getType() === 'ai');
    
    // Initial greeting
    if (!hasAIMessages && state.messages.length === 0) {
      return {
        messages: [new AIMessage(
          "Hey! I'm here to help you explore AI and automation solutions. What brings you here today?"
        )],
        currentPhase: 'greeting',
        agentExecutions: [{
          agentId: 'conversation',
          startTime,
          endTime: new Date(),
          status: 'completed',
          result: { type: 'greeting' },
          retryCount: 0,
        }],
      };
    }
    
    // Check for user message
    const lastMessage = state.messages[state.messages.length - 1];
    if (!lastMessage || lastMessage._getType() !== 'human') {
      return {
        currentPhase: 'discovery',
        agentExecutions: [{
          agentId: 'conversation',
          startTime,
          endTime: new Date(),
          status: 'skipped',
          result: { reason: 'No new user message' },
          retryCount: 0,
        }],
      };
    }
    
    // Prepare conversation history
    const conversationHistory = state.messages.map(msg => ({
      role: msg._getType() === 'human' ? 'user' as const : 'assistant' as const,
      content: msg.content.toString(),
    }));
    
    // Get model instance
    const model = getStructuredModel();
    
    // Generate structured response using AI SDK
    const { object: structuredResponse } = await generateObject({
      model,
      schema: ConversationResponseSchema,
      system: STRUCTURED_CONVERSATION_PROMPT,
      messages: conversationHistory,
      ...CONVERSATION_MODEL_SETTINGS,
    });
    
    console.log('📊 Structured Response:', JSON.stringify(structuredResponse, null, 2));
    
    // Update customer info with extracted data and intent/opportunity
    const updatedCustomerInfo: CustomerInfo = {
      ...state.customerInfo,
      ...structuredResponse.extracted,
      currentChallenges: structuredResponse.extracted.challenges || state.customerInfo.currentChallenges,
      intentType: structuredResponse.intentType || state.customerInfo.intentType,
      opportunitySummary: structuredResponse.opportunitySummary || state.customerInfo.opportunitySummary,
    };
    
    // Determine conversation status - only complete if truly ready
    let conversationStatus = state.conversationStatus;
    
    // Check for meaningful qualification criteria
    const hasSpecificChallenges = structuredResponse.extracted.challenges && 
                                  structuredResponse.extracted.challenges.length > 0 &&
                                  !structuredResponse.extracted.challenges.every(c => 
                                    c.toLowerCase().includes('automation') && c.split(' ').length < 4
                                  );
    
    const hasBusinessContext = !!(structuredResponse.extracted.company || structuredResponse.extracted.industry);
    const hasContact = !!(structuredResponse.extracted.email || structuredResponse.extracted.phone);
    const hasTimeline = !!structuredResponse.extracted.timeline;
    const hasBudget = !!structuredResponse.extracted.budget;
    const conversationDepth = structuredResponse.conversationDepth || state.messages.filter(m => m._getType() === 'human').length;
    
    // Check if user is ending conversation
    const lastUserMessage = state.messages.filter(m => m._getType() === 'human').pop()?.content.toString().toLowerCase() || '';
    const userEndingConversation = lastUserMessage.includes('thanks') || 
                                   lastUserMessage.includes('thank you') || 
                                   lastUserMessage.includes('goodbye') ||
                                   lastUserMessage.includes('bye');
    
    // Only mark as ready to qualify if we have ALL critical information
    if (structuredResponse.status === 'ready_to_qualify' || structuredResponse.status === 'qualified') {
      const hasAllCriticalInfo = hasContact && 
                                 hasSpecificChallenges && 
                                 hasBusinessContext && 
                                 hasTimeline && 
                                 hasBudget &&
                                 conversationDepth >= 6;
      
      if (hasAllCriticalInfo || (conversationDepth >= 8 && userEndingConversation)) {
        conversationStatus = 'completed';
      } else {
        // Override - not ready yet, keep gathering
        structuredResponse.status = 'gathering';
        structuredResponse.nextAction = 'continue';
        console.log(`📋 Not ready to qualify - Missing: ${!hasContact ? 'contact' : ''} ${!hasSpecificChallenges ? 'challenges' : ''} ${!hasBusinessContext ? 'context' : ''} ${!hasTimeline ? 'timeline' : ''} ${!hasBudget ? 'budget' : ''} Depth:${conversationDepth}/6`);
      }
    }
    
    // Build BANT qualification if ready
    let qualification = state.qualification;
    
    // Only qualify if we have meaningful context AND proper conversation depth AND budget discussed
    const shouldActuallyQualify = structuredResponse.qualification?.shouldQualify && 
                                  !state.qualification &&
                                  hasContact && 
                                  hasSpecificChallenges && 
                                  hasBusinessContext &&
                                  hasTimeline &&
                                  hasBudget &&
                                  conversationDepth >= 6;
    
    if (shouldActuallyQualify) {
      // Build full qualification scoring
      const contactScore = hasContact ? 15 : 0;
      const companyScore = (structuredResponse.extracted.company || structuredResponse.extracted.industry) ? 10 : 0;
      const challengeScore = structuredResponse.extracted.challenges?.length ? 10 : 0;
      const nameScore = structuredResponse.extracted.name ? 5 : 0;
      
      const budgetScore = structuredResponse.extracted.budget ? 
        (structuredResponse.extracted.budget.toLowerCase().includes('250k') ? 15 :
         structuredResponse.extracted.budget.includes('100') ? 10 :
         structuredResponse.extracted.budget.includes('50k') ? 6 : 3) : 0;
      
      const timelineScore = structuredResponse.extracted.timeline ?
        (structuredResponse.extracted.timeline.toLowerCase().includes('immediate') || 
         structuredResponse.extracted.timeline.toLowerCase().includes('asap') ? 15 :
         structuredResponse.extracted.timeline.toLowerCase().includes('month') ? 10 :
         structuredResponse.extracted.timeline.toLowerCase().includes('quarter') ? 7 : 3) : 0;
      
      const authorityScore = structuredResponse.extracted.role ? 5 : 0;
      
      const totalScore = contactScore + companyScore + challengeScore + nameScore + 
                        budgetScore + timelineScore + authorityScore;
      
      // Determine tier
      let tier: 'hot' | 'warm' | 'qualified' | 'viable' | 'nurture';
      if (totalScore >= 80) tier = 'hot';
      else if (totalScore >= 60) tier = 'warm';
      else if (totalScore >= 45) tier = 'qualified';
      else if (totalScore >= 30) tier = 'viable';
      else tier = 'nurture';
      
      qualification = {
        budget: { score: budgetScore, status: hasBudget ? 'identified' : 'unknown' },
        authority: { 
          level: structuredResponse.extracted.role ? 'identified' : 'unknown', 
          canSign: false, 
          needsApproval: true, 
          score: authorityScore 
        },
        need: { 
          painLevel: hasSpecificChallenges ? 'high' : 'medium', 
          urgency: hasTimeline ? 'high' : 'medium', 
          impact: structuredResponse.extracted.challenges?.[0] || '', 
          score: challengeScore 
        },
        timeline: { 
          timeframe: hasTimeline ? 'near_term' : 'exploring', 
          score: timelineScore 
        },
        totalScore,
        isQualified: totalScore >= 30,
        tier: tier as any,
        qualificationReasons: [`Score: ${totalScore}`, `Tier: ${tier}`],
      };
    }
    
    // Track execution
    const execution: AgentExecution = {
      agentId: 'conversation',
      startTime,
      endTime: new Date(),
      status: 'completed',
      result: {
        phase: 'discovery',
        extracted: structuredResponse.extracted,
        objectives: structuredResponse.objectives,
        status: structuredResponse.status,
      },
      retryCount: 0,
    };
    
    // Return comprehensive update
    return {
      messages: [new AIMessage(structuredResponse.message)],
      customerInfo: updatedCustomerInfo,
      qualification,
      conversationStatus,
      currentPhase: structuredResponse.status === 'ready_to_qualify' ? 'qualification' : 'discovery',
      nextNode: structuredResponse.nextAction === 'notify_sales' ? 'notification' : undefined,
      agentExecutions: [execution],
      analytics: {
        ...state.analytics,
        messageCount: state.analytics.messageCount + 1,
        conversationDuration: (new Date().getTime() - new Date(state.startTime).getTime()) / 1000,
        conversionProbability: qualification ? qualification.totalScore / 100 : 0,
      },
    };
    
  } catch (error) {
    console.error('Conversation agent error:', error);
    
    return {
      messages: [new AIMessage(
        "I'm here to help with your AI and automation needs. What specific challenge are you looking to solve?"
      )],
      errors: [{
        timestamp: new Date(),
        agent: 'conversation',
        error: error instanceof Error ? error.message : 'Unknown error',
        recovered: true,
      }],
      agentExecutions: [{
        agentId: 'conversation',
        startTime,
        endTime: new Date(),
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        retryCount: 0,
      }],
    };
  }
}