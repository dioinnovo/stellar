/**
 * Conversation Agent - Restructured with Structured Output
 *
 * This agent handles natural conversations AND extracts structured data
 * directly using the LLM's understanding of the conversation context.
 */

import { AIMessage } from '@langchain/core/messages';
import { MasterOrchestratorState, AgentExecution, CustomerInfo } from '../orchestrator/state';

// Azure OpenAI configuration
const AZURE_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_API_KEY = process.env.AZURE_OPENAI_KEY;

/**
 * Structured response format for conversation
 */
interface ConversationResponse {
  // Natural language response to user
  message: string;
  
  // Extracted customer information
  extracted: {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    industry?: string;
    challenges?: string[];
    budget?: string;
    timeline?: string;
    companySize?: string;
    role?: string;
  };
  
  // Track what objectives are complete
  objectives: {
    hasName: boolean;
    hasContact: boolean;  // email or phone
    hasCompany: boolean;
    hasChallenges: boolean;
    hasBudget: boolean;
    hasTimeline: boolean;
  };
  
  // Qualification assessment
  qualification?: {
    shouldQualify: boolean;
    estimatedScore: number;
    reasoning: string;
  };
  
  // Intent classification
  intentType?: 'automation_inquiry' | 'demo_request' | 'pricing_inquiry' | 'support' | 'partnership' | 'general_inquiry';
  
  // Opportunity summary for executives
  opportunitySummary?: string;
  
  // Conversation control
  status: 'gathering' | 'ready_to_qualify' | 'qualified' | 'human_requested' | 'abandoned';
  nextAction: 'continue' | 'notify_sales' | 'send_nurture' | 'archive';
  missingInfo: string[];
  conversationDepth: number; // Track number of meaningful exchanges
}

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

OUTPUT FORMAT:
Return a JSON object with these exact fields:
{
  "message": "Your conversational response here",
  "extracted": {
    "name": "What you know so far",
    "email": "Extracted email",
    "phone": "Extracted phone",
    "company": "Company name",
    "industry": "Industry type",
    "challenges": ["List", "of", "SPECIFIC", "challenges"],
    "budget": "Budget mentioned",
    "timeline": "Timeline mentioned",
    "companySize": "Size if mentioned",
    "role": "Their role/title"
  },
  "objectives": {
    "hasName": true/false,
    "hasContact": true/false,
    "hasCompany": true/false,
    "hasChallenges": true/false,
    "hasBudget": true/false,
    "hasTimeline": true/false
  },
  "qualification": {
    "shouldQualify": true/false,
    "estimatedScore": 0-100,
    "reasoning": "Why this score"
  },
  "intentType": "automation_inquiry|demo_request|pricing_inquiry|support|partnership|general_inquiry",
  "opportunitySummary": "2-3 sentence executive summary when qualifying",
  "status": "gathering|ready_to_qualify|qualified|human_requested|abandoned",
  "nextAction": "continue|notify_sales|send_nurture|archive",
  "missingInfo": ["What you still need"],
  "conversationDepth": 0
}

QUALIFICATION TRIGGERS:
Mark as ready_to_qualify ONLY when ALL these are true:
- Has email/phone AND
- Has SPECIFIC challenges (not generic "automation") AND
- Has company OR industry context AND
- Has timeline information AND
- Has budget range OR user declined to share AND
- conversationDepth >= 6 (at least 6 meaningful exchanges) AND
- User shows signs of ending conversation (thanks/goodbye) OR all above gathered

NEVER qualify if budget hasn't been discussed yet!

Scoring remains the same:
  - Email/Phone: 15 points
  - Company/Industry: 10 points
  - Challenges identified: 10 points (only for SPECIFIC challenges)
  - Name: 5 points
  - Timeline: 10 points
  - Budget: 10 points
  - Role/Authority: 5 points

CLOSING MESSAGES:
For complete info: "Thanks [Name]! I have all the details I need. Our AI specialist will reach out to you within 24 hours with specific solutions for [company]'s [challenge]."
For minimum viable: "Great! I have your contact information and understand your needs. Our AI strategist will reach out shortly with tailored recommendations."
For human request: "I'll connect you with our team right away. What's the best email for them to reach you?"`;

/**
 * Call Azure OpenAI API with structured output
 */
async function callAzureOpenAIStructured(
  messages: Array<{ role: string; content: string }>
): Promise<ConversationResponse> {
  // Default response if API fails
  const defaultResponse: ConversationResponse = {
    message: "I'm here to help you explore AI and automation solutions. What brings you here today?",
    extracted: {},
    objectives: {
      hasName: false,
      hasContact: false,
      hasCompany: false,
      hasChallenges: false,
      hasBudget: false,
      hasTimeline: false,
    },
    status: 'gathering',
    nextAction: 'continue',
    missingInfo: ['name', 'company', 'challenges', 'contact'],
    conversationDepth: 0,
    intentType: 'general_inquiry',
  };

  if (!AZURE_ENDPOINT || !AZURE_API_KEY) {
    console.error('Azure OpenAI credentials not configured');
    return defaultResponse;
  }

  try {
    // Use the endpoint directly since it already includes the full URL with API version
    const apiUrl = AZURE_ENDPOINT;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': AZURE_API_KEY,
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: STRUCTURED_CONVERSATION_PROMPT },
          ...messages
        ],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: "json_object" },  // Force JSON output
      }),
    });

    if (!response.ok) {
      throw new Error(`Azure OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse JSON response
    try {
      const parsed = JSON.parse(content) as ConversationResponse;
      return parsed;
    } catch (parseError) {
      console.error('Failed to parse structured response:', parseError);
      // Try to extract just the message if JSON parsing fails
      return {
        ...defaultResponse,
        message: content || defaultResponse.message,
      };
    }
  } catch (error) {
    console.error('Azure OpenAI API error:', error);
    return defaultResponse;
  }
}

/**
 * Main conversation node - now with integrated extraction and qualification
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
          status: 'completed',
          result: { reason: 'No new user message' },
          retryCount: 0,
        }],
      };
    }
    
    // Prepare conversation history for API
    const conversationHistory = state.messages.map(msg => ({
      role: msg._getType() === 'human' ? 'user' : 'assistant',
      content: msg.content.toString(),
    }));
    
    // Get structured response from LLM
    const structuredResponse = await callAzureOpenAIStructured(conversationHistory);
    
    console.log('📊 Structured Response:', JSON.stringify(structuredResponse, null, 2));
    
    // Update customer info with extracted data and intent/opportunity
    const updatedCustomerInfo: CustomerInfo = {
      ...state.customerInfo,
      name: structuredResponse.extracted.name || state.customerInfo.name,
      email: structuredResponse.extracted.email || state.customerInfo.email,
      phone: structuredResponse.extracted.phone || state.customerInfo.phone,
      company: structuredResponse.extracted.company || state.customerInfo.company,
      industry: structuredResponse.extracted.industry || state.customerInfo.industry,
      companySize: (structuredResponse.extracted.companySize as CustomerInfo['companySize']) || state.customerInfo.companySize,
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
    
    // Relax requirements for voice conversations (removed voice-specific logic)
    const shouldActuallyQualify = structuredResponse.qualification?.shouldQualify &&
                                  !state.qualification &&
                                  hasContact &&
                                  hasSpecificChallenges &&
                                  (false ?
                                    // Voice: More relaxed requirements (disabled)
                                    (hasBusinessContext || hasTimeline) && conversationDepth >= 4 :
                                    // Text: Original stricter requirements  
                                    hasBusinessContext && hasTimeline && hasBudget && conversationDepth >= 6);
    
    if (shouldActuallyQualify) {
      // Dual scoring system: Minimum Viable + Full Qualification
      
      // Check for minimum viable lead criteria
      const hasContact = !!(structuredResponse.extracted.email || structuredResponse.extracted.phone);
      const hasContext = !!(
        structuredResponse.extracted.company || 
        structuredResponse.extracted.industry || 
        (structuredResponse.extracted.challenges && structuredResponse.extracted.challenges.length > 0)
      );
      
      // Minimum viable scoring (30+ points to qualify)
      const contactScore = hasContact ? 15 : 0;
      const companyScore = (structuredResponse.extracted.company || structuredResponse.extracted.industry) ? 10 : 0;
      const challengeScore = structuredResponse.extracted.challenges?.length ? 10 : 0;
      const nameScore = structuredResponse.extracted.name ? 5 : 0;
      
      // Additional scoring for full qualification
      const budgetScore = structuredResponse.extracted.budget ? 
        (structuredResponse.extracted.budget.toLowerCase().includes('1m') || 
         structuredResponse.extracted.budget.toLowerCase().includes('million') ? 15 :
         structuredResponse.extracted.budget.includes('500k') ? 12 :
         structuredResponse.extracted.budget.includes('250k') ? 10 :
         structuredResponse.extracted.budget.includes('100k') ? 8 :
         structuredResponse.extracted.budget.includes('50k') ? 6 : 3) : 0;
      
      const timelineScore = structuredResponse.extracted.timeline ?
        (structuredResponse.extracted.timeline.toLowerCase().includes('immediate') || 
         structuredResponse.extracted.timeline.toLowerCase().includes('asap') || 
         structuredResponse.extracted.timeline.toLowerCase().includes('urgent') ? 15 :
         structuredResponse.extracted.timeline.toLowerCase().includes('month') ? 10 :
         structuredResponse.extracted.timeline.toLowerCase().includes('quarter') ? 7 :
         structuredResponse.extracted.timeline.toLowerCase().includes('year') ? 5 : 3) : 0;
      
      const authorityScore = structuredResponse.extracted.role ? 5 : 0;
      
      // Calculate total score
      const totalScore = contactScore + companyScore + challengeScore + nameScore + 
                        budgetScore + timelineScore + authorityScore;
      
      // Lower threshold for voice conversations (25 instead of 30) - disabled
      const minimumScoreRequired = false ? 25 : 30;
      
      // Determine if minimum viable
      const isMinimumViable = hasContact && hasContext && totalScore >= minimumScoreRequired;
      
      // Determine tier based on score (adjusted for voice)
      let tier: 'hot' | 'warm' | 'qualified' | 'viable' | 'nurture' | 'disqualified';
      if (totalScore >= 80) tier = 'hot';
      else if (totalScore >= 60) tier = 'warm';
      else if (totalScore >= 45) tier = 'qualified';
      else if (totalScore >= minimumScoreRequired && isMinimumViable) tier = 'viable';
      else if (totalScore >= 20) tier = 'nurture';
      else tier = 'disqualified';
      
      // Build qualification reasons
      const reasons = [];
      if (hasContact) reasons.push('✓ Contact information captured');
      if (structuredResponse.extracted.company) reasons.push(`✓ Company: ${structuredResponse.extracted.company}`);
      if (structuredResponse.extracted.industry) reasons.push(`✓ Industry: ${structuredResponse.extracted.industry}`);
      if (challengeScore > 0) reasons.push(`✓ ${structuredResponse.extracted.challenges?.length || 0} challenges identified`);
      if (budgetScore > 0) reasons.push(`✓ Budget: ${structuredResponse.extracted.budget}`);
      if (timelineScore > 0) reasons.push(`✓ Timeline: ${structuredResponse.extracted.timeline}`);
      if (!hasContact) reasons.push('✗ Missing contact information');
      if (!hasContext) reasons.push('✗ Missing business context');
      
      qualification = {
        budget: { score: budgetScore, status: budgetScore > 0 ? 'planned' : 'unknown' },
        authority: {
          level: authorityScore > 0 ? 'decision_maker' : 'unknown', 
          canSign: false, 
          needsApproval: true, 
          score: authorityScore 
        },
        need: { 
          painLevel: challengeScore >= 10 ? 'high' : challengeScore > 0 ? 'medium' : 'low',
          urgency: timelineScore >= 10 ? 'high' : timelineScore > 0 ? 'medium' : 'low',
          impact: structuredResponse.extracted.challenges?.[0] || '',
          score: challengeScore 
        },
        timeline: { 
          timeframe: timelineScore >= 10 ? 'immediate' : timelineScore > 0 ? 'this_quarter' : 'exploring',
          score: timelineScore 
        },
        totalScore,
        isQualified: isMinimumViable,
        tier: tier as any,
        qualificationReasons: reasons,
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