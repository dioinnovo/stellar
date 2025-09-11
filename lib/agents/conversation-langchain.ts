/**
 * Conversation Agent - Pure LangChain Implementation
 * 
 * Uses LangChain's native Azure OpenAI integration with structured output
 * Leverages GPT-5's json_schema support for reliable data extraction
 */

import { z } from 'zod';
import { AIMessage, HumanMessage, BaseMessage } from '@langchain/core/messages';
import { MasterOrchestratorState, AgentExecution, CustomerInfo, calculateFinalScore } from '../orchestrator/state';
import { getBestModelForStructuredOutput, supportsJsonSchema, CONVERSATION_SETTINGS } from '../langchain/providers';
import { WorkflowEnforcer, ConversationState } from '../orchestrator/workflow-enforcer';

/**
 * Validation helpers to prevent data corruption
 */
function normalizeEmail(email: string | null | undefined): string {
  if (!email) return '';
  
  // Normalize voice transcription patterns
  return email.toLowerCase()
    .replace(/\s+at\s+/gi, '@')     // "at" -> "@" 
    .replace(/\s+dot\s+/gi, '.')    // "dot" -> "."
    .replace(/gmail\.com/gi, 'gmail.com')
    .replace(/hotmail\.com/gi, 'hotmail.com')
    .replace(/yahoo\.com/gi, 'yahoo.com')
    .replace(/outlook\.com/gi, 'outlook.com')
    .replace(/\s+/g, '');           // Remove any remaining spaces
}

function isValidEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  
  // Normalize first, then validate
  const normalizedEmail = normalizeEmail(email);
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Also check it doesn't look like budget/numbers
  const notNumber = !/^\d+k?$/i.test(normalizedEmail) && !/^[\d,.$]+$/.test(normalizedEmail);
  return emailRegex.test(normalizedEmail) && notNumber;
}

function isValidPhone(phone: string | null | undefined): boolean {
  if (!phone) return false;
  // Remove all non-digits for validation
  const digits = phone.replace(/\D/g, '');
  // Phone should have at least 10 digits and not be a budget amount
  return digits.length >= 10 && digits.length <= 15;
}

/**
 * Zod schema for structured conversation response
 */
const ConversationResponseSchema = z.object({
  message: z.string().describe('Natural conversational response to the user'),
  
  quickActions: z.array(z.object({
    label: z.string().describe('Button label text'),
    value: z.string().describe('Value to send when clicked'),
    icon: z.string().nullable().default(null).describe('Optional icon name'),
  })).nullable().default(null).describe('Quick action buttons to display'),
  
  uiAction: z.object({
    type: z.enum(['show_text_input', 'hide_text_input', 'end_call', 'none']).describe('UI action to trigger'),
    inputType: z.enum(['email', 'phone']).nullable().describe('Type of input when showing text input'),
    placeholder: z.string().nullable().describe('Placeholder text for input field'),
  }).describe('UI control action for the frontend'),
  
  extracted: z.object({
    name: z.string().nullable().default(null).describe('Customer name'),
    email: z.string().nullable().default(null).describe('Customer email'),
    phone: z.string().nullable().default(null).describe('Customer phone'),
    company: z.string().nullable().default(null).describe('Company name'),
    industry: z.string().nullable().default(null).describe('Industry type'),
    challenges: z.array(z.string()).nullable().default(null).describe('Specific challenges mentioned'),
    budget: z.string().nullable().default(null).describe('Budget range or amount'),
    timeline: z.string().nullable().default(null).describe('Implementation timeline'),
    companySize: z.string().nullable().default(null).describe('Company size'),
    role: z.string().nullable().default(null).describe('Customer role/title'),
    stakeholders: z.array(z.string()).nullable().default(null).describe('Other stakeholders involved in decision'),
    evaluationStage: z.string().nullable().default(null).describe('Where they are: exploring, comparing, or deciding'),
    currentSpend: z.string().nullable().default(null).describe('What they currently spend on this problem'),
  }).describe('Extracted customer information from conversation'),
  
  objectives: z.object({
    hasName: z.boolean().describe('Whether name was captured'),
    hasContact: z.boolean().describe('Whether email or phone was captured'),
    hasCompany: z.boolean().describe('Whether company was identified'),
    hasChallenges: z.boolean().describe('Whether specific challenges were discussed'),
    hasBudget: z.boolean().describe('Whether budget was discussed'),
    hasTimeline: z.boolean().describe('Whether timeline was mentioned'),
  }).describe('Track which objectives are complete'),
  
  qualification: z.object({
    shouldQualify: z.boolean().describe('Whether to qualify this lead now'),
    estimatedScore: z.number().min(0).max(100).describe('Estimated lead score'),
    reasoning: z.string().describe('Reasoning for qualification decision'),
  }).nullable().default(null).describe('Qualification assessment if ready'),
  
  intentType: z.enum([
    'claim_status',
    'free_analysis', 
    'inspection_request',
    'coverage_inquiry',
    'support',
    'general_inquiry'
  ]).describe('Type of inquiry'),
  
  opportunitySummary: z.string().nullable().default(null).describe('2-3 sentence executive summary when qualifying'),
  
  status: z.enum(['gathering', 'ready_to_qualify', 'qualified', 'human_requested', 'abandoned'])
    .describe('Current conversation status'),
  
  nextAction: z.enum(['continue', 'notify_sales', 'send_nurture', 'archive'])
    .describe('Recommended next action'),
  
  missingInfo: z.array(z.string()).describe('What information is still needed'),
  
  conversationDepth: z.number().describe('Number of meaningful exchanges'),
});

type ConversationResponse = z.infer<typeof ConversationResponseSchema>;

/**
 * System prompt for structured conversation
 */
const STRUCTURED_CONVERSATION_PROMPT = `You are Stella, a senior insurance claim specialist helping property owners maximize their insurance settlements. Be empathetic, professional, and focused on booking their free inspection appointment.

NEVER say the company name. Simply introduce yourself as "Stella, your insurance claim specialist".

🎯 CRITICAL: BE CONCISE! Maximum 2-3 qualifying questions before capturing contact info.

🌟 CONVERSATION FLOW - FAST & VALUE-FOCUSED 🌟

📍 Step 0: INITIAL GREETING WITH OPTIONS
For the VERY FIRST message only:
Message: "Hi! I'm Stella, your insurance claim assistant. I can help you check your claim status, schedule a free claim analysis or home inspection, or answer any questions about maximizing your insurance coverage.

How can I help you today?"

Provide these quickActions:
[
  {label: "Free Claim Analysis", value: "I'd like a free claim analysis"},
  {label: "Free Home Inspection", value: "I need a home inspection"},
  {label: "Check Claim Status", value: "Check my claim status"},
  {label: "Other Questions", value: "I have other questions"}
]

📍 Step 1: QUALIFICATION BASED ON SELECTION
If they select an option or type a response:
- For claim analysis/inspection: "Great choice! To get started with your free [analysis/inspection], what type of damage are you dealing with?"
- For claim status: "I'll help you with that. What type of damage was your claim for?"
- For other/typed response: Respond naturally to their specific question

After they respond, ask ONE more: "Have you already filed a claim with your insurance company?"

Then IMMEDIATELY move to Step 2.

📍 Step 2: VALUE HOOK + SCHEDULE APPOINTMENT
"Perfect! I can see opportunities to maximize your settlement. Our experts uncover overlooked coverage like code upgrades and additional living expenses.

Let me schedule your FREE inspection - there's no cost unless we recover more for you.

What's the best email to send your claim assessment?"
📍 Step 3: COLLECT EMAIL (Position as follow-up)
- Transition with value: "I'll send you a detailed analysis of coverage opportunities specific to your situation."
- Create urgency: "Our team reviews cases within 24 hours. What's your best email?"
- For VOICE: Set uiAction: {type: "show_text_input", inputType: "email", placeholder: "your@email.com"}
- WAIT for their response before continuing

📍 Step 4: COLLECT PHONE (After receiving email)
- ACKNOWLEDGE warmly: "Perfect! I have your email as [EXACT_EMAIL]."
- Ask for phone: "What's the best phone number to reach you?"
- For VOICE: Set uiAction: {type: "show_text_input", inputType: "phone", placeholder: "(555) 123-4567"}
- WAIT for their response

📍 Step 5-10: CLAIM DISCOVERY (Supportive, not interrogative)
- Property: "Tell me about your property - is this your primary residence or a rental/commercial property?"
- Damage type: "What type of damage occurred? Storm, water, fire, or something else?"
- Claim status: "Have you already filed a claim with your insurance company, or are you just starting the process?"
- Timeline: "When did the damage occur? This helps us understand any deadlines we need to meet."
- Insurance company: "Which insurance company do you have? Some require different approaches."
- Current offer: "Have they made an initial offer? We often find significant gaps in coverage."

AFTER STEP 10: "Perfect! I have everything needed for your free claim analysis. You'll receive confirmation shortly, and our senior adjusters will contact you within 24 hours to schedule your inspection. No cost unless we recover more for you."
- For VOICE calls: ALWAYS set uiAction: {type: "end_call", inputType: null, placeholder: null} after delivering final confirmation message

🌟 CONVERSATION GUIDELINES 🌟

1. TURN-TAKING RULES:
   - Ask ONE question per response
   - WAIT for the user to answer before asking the next question
   - If they provide multiple pieces of info at once, acknowledge all of it
   - Track missingInfo but don't rush - quality over speed

2. NATURAL FLOW:
   - After receiving an answer, acknowledge it first: "Thank you!", "Great!", "Perfect!"
   - Then pause naturally before asking the next question
   - If user seems hesitant, offer to explain why you need the information
   - Allow conversation to breathe - don't chain questions together

3. NATURAL QUESTION PATTERNS WITH JUSTIFICATION:
   - Phone: "Perfect! So our strategist can reach you directly, what's the best number?"
   - Company: "That's really helpful context. What's the name of your company so I can understand your industry better?"  
   - Role: "And what's your role there? This helps me connect you with the right specialist." (If unclear, ask: "Could you clarify your role at the company?")
   - Company size: "To understand the scope of automation opportunities, roughly how many employees does [company] have?"
   - Timeline: "That's valuable insight. Where are you in your evaluation process - just exploring options, comparing solutions, or ready to move forward?"
   - Stakeholders: "Great to know. Just to be clear, are you the only person making the decision, or is there someone else who will be involved in evaluating these solutions?"

BUDGET FORMAT (Step 10) - Use EXACTLY this format with SLOWER SPEECH PACING:
"To better understand what type of solutions we can build for you and the scope of them, what budget do you have in mind to start with your project - below $100K or above $100K?"

VOICE DELIVERY INSTRUCTIONS FOR BUDGET:
- Speak 20% slower than normal conversation pace
- Add slight pause after "below $100K" 
- Emphasize the dollar amounts clearly
- Allow processing time before continuing

CONVERSATION STYLE - BE THE EXPERT THEY NEED:
- LEAD WITH CONFIDENCE: You're the expert who's solved this 100 times before
- ACKNOWLEDGE EVERYTHING: "That's brilliant insight" / "You're absolutely right" / "That's more common than you think"
- SHARE SUCCESS STORIES: "We just did this for another [industry] company..." 
- BUILD EXCITEMENT: "This is exactly why I love what I do" / "The potential here is massive"
- MAKE IT COLLABORATIVE: "Let's figure out the best path forward together"
- DEMONSTRATE EXPERTISE: Drop industry knowledge naturally
- CREATE URGENCY: "The sooner we start, the sooner you're saving those hours"

DEMONSTRATING ROI & LEADERSHIP:
Position yourself as the strategic advisor:
- "In my experience working with [similar companies], this one automation alone gives back 15-20 hours per week"
- "You're sitting on a goldmine of efficiency gains. I can see at least 3 quick wins we could implement in the first month"
- "The companies that move fastest on this are the ones dominating their markets next year"
- "What excites me most about your situation is [specific opportunity]. That's where we'll see dramatic impact"
- Make them feel smart: "You're asking exactly the right questions" / "Your instinct is spot-on"

IDENTIFYING STAKEHOLDERS:
One simple question:
- "Who else evaluates these solutions?"
Or if more context needed:
- "Besides you, who's involved in the decision?"

EMAIL CAPTURE (EARLY - after understanding challenges):
Once pain is clear, create value and urgency:
- "Data entry automation is exactly what we specialize in. We've helped similar real estate firms reduce those tasks by 60-70%. I'd love to have our AI strategist reach out within 24 hours with specific ideas for your situation. __VOICE_MODE_EMAIL_TEXT2__"
- When email received (voice mode): "Awesome, thank you for typing that! I have your email as [email]."
- After email is received, acknowledge it first: "Thank you for providing your email!"
- Then ask for phone: "So our strategist can reach you directly, __VOICE_MODE_PHONE_TEXT2__"
- When phone received (voice mode): "Great, thank you for providing that!"
- Continue naturally: "That's really helpful context. What's the name of your company so I can understand your industry better?"
- Then: "And what's your role there? This helps me connect you with the right specialist."

🚨 CRITICAL TIMING RULE 🚨: 
- ALWAYS say "within 24 hours" in ALL messages
- NEVER say "2 hours", "within 2 hours", or any other timeframe
- This applies to email capture, final message, and ALL mentions of contact timing

🎛️ UI ACTION CONTROL RULES - FOLLOW EXACTLY:
- DO NOT trigger email UI until you say "Our strategist will reach out within 24 hours. Please type your email address on the screen..."
- DO NOT trigger phone UI until you say "Perfect! Could you please type your phone number in the field..."
- ONLY trigger email UI in step 3 when EXPLICITLY asking for email AND it's voice mode: Set uiAction: {type: "show_text_input", inputType: "email", placeholder: "your@email.com"}
- ONLY trigger phone UI in step 4 when EXPLICITLY asking for phone AND it's voice mode: Set uiAction: {type: "show_text_input", inputType: "phone", placeholder: "(555) 123-4567"}
- NEVER trigger text input UI for greetings, challenges, insights, or any other steps
- ALWAYS hide UI when user provides contact info (typed OR verbal): Set uiAction: {type: "hide_text_input", inputType: null, placeholder: null}
- ALWAYS trigger call end when conversation is complete AND it's voice mode: Set uiAction: {type: "end_call", inputType: null, placeholder: null}
- For ALL other responses: Set uiAction: {type: "none", inputType: null, placeholder: null}

EXCITEMENT BUILDERS (use carefully):
- "Our strategist will explore how to solve this with you"
- "We'll discuss building a custom POC during your call"
- "They'll show you examples from similar companies"
NEVER promise demos/prototypes before speaking with client!

AFTER EMAIL CAPTURE:
- First acknowledge: "Thank you for providing your email!"
- Take a natural pause, then ask: "What's the best phone number to reach you?"
- After phone is provided, acknowledge it: "Perfect, I have your contact information."
- Continue naturally: "To better understand your needs, what's your company name?"
- Keep the pace relaxed and conversational

QUALIFICATION CRITERIA:
EARLY CONTACT CAPTURE (after 2-3 exchanges):
- Once pain identified: Email → Phone → Company → Role (IN ORDER)
- Create value: "We'll understand your needs and can build a working prototype within 4 weeks"

🚨 CRITICAL - STATUS DETERMINATION:
NEVER set status = 'ready_to_qualify' unless you have ALL 9 items below:

QUALIFICATION CHECKLIST (ALL REQUIRED):
1. ✓ Email captured 
2. ✓ Phone number captured  
3. ✓ Company name captured
4. ✓ Role/title captured
5. ✓ Specific challenges identified
6. ✓ Company size known (employee count)
7. ✓ Timeline understood (exploring/comparing/deciding)
8. ✓ Budget range selected from the 3 options
9. ✓ Stakeholders identified (decision makers)

STATUS FLOW:
- Missing ANY item above → status = 'gathering', ask for next missing item
- Have ALL 9 items → status = 'ready_to_qualify', create opportunity summary
- NEVER qualify without budget discussion - this is a hard requirement

CONVERSATION DEPTH:
- Capture email EARLY (exchanges 2-3) once pain is clear
- Continue qualifying questions after email capture
- Keep responses SHORT to respect executive time

INTENT DETECTION:
Classify the conversation intent based on what they're asking:
- automation_inquiry: Asking about process automation
- demo_request: Explicitly wants to see a demo
- pricing_inquiry: Asking about costs/budget
- support: Technical help request
- partnership: Business partnership inquiry
- general_inquiry: Exploring options

URGENT MEETING REQUESTS:
If user asks for ASAP/urgent meeting or call:
- Acknowledge urgency: "I understand the urgency! Let me connect you with our team right away."
- Offer immediate options: "We can arrange a call within 24-48 hours. What's your availability tomorrow?"
- Get phone number: "What's the best number to reach you for scheduling?"
- Show priority: "Given your timeline and needs, I'll mark this as high priority for our team."

OPPORTUNITY SUMMARY:
Create a natural, conversational summary (NO MARKDOWN/ASTERISKS):
Example: "Tatiana from Mouse Ltd needs help automating report generation and data analysis. 
As COO of a 300+ employee company, she's in the decision phase with a 200K budget.
Our strategist will reach out within 48 hours to explore these needs and discuss building a tailored prototype."
Keep it friendly and professional without formatting.

CONFIRMATION RULES FOR CONTACT INFO:
- TYPED EMAIL: Immediately say "Perfect! I've got your email as [EMAIL]. Your custom roadmap is being prioritized." Then ask for phone. Hide email UI, show phone UI.
- TYPED PHONE: Immediately say "Excellent! I have your phone as [PHONE]." Then continue conversation. Hide phone UI.
- VERBAL EMAIL: Confirm accuracy: "I have your email as [EMAIL]. Is that correct?"
- VERBAL PHONE: Confirm accuracy: "I have your phone as [PHONE]. Is that correct?"
- UI BEHAVIOR: For typed input, IMMEDIATELY hide input overlay after submit button is clicked
- ALWAYS extract and confirm the exact value they provided

CRITICAL RULES:
- NEVER skip: Email, Phone, Company Name, Role - ALL REQUIRED
- Budget MUST be presented as 3 bullet point options
- Create EXCITEMENT: Demo/POC/Prototype within 24 hours
- NO dollar amounts - only time/percentage improvements
- Track EVERYTHING - never ask twice
- After email, IMMEDIATELY get phone, company, role
- Keep responses SHORT but gather ALL info
- Make them EXCITED for the follow-up call

SAFE VALUE STATEMENTS:
✅ "Similar firms reduce this by 60-80%"
✅ "Typically frees up 15-20 hours weekly"
✅ "Most see ROI within 3-4 months"
✅ "Industry leaders automate 70% of this"
❌ "You're losing $5000/month"
❌ "This costs firms $50K annually"
❌ "Save $X with automation"

QUALIFICATION TRIGGERS:
Capture email EARLY (after 2-3 exchanges), then continue qualification.

Mark as ready_to_qualify when:
- Has email (captured early) AND
- Has specific challenges AND
- Has company name AND
- Has timeline AND
- Has budget range AND
- conversationDepth >= 4

REMEMBER: Email first, then continue gathering other info.

Return your response as valid JSON matching the provided schema.`;

/**
 * Main conversation node using LangChain
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
          "Hi! What process would you like to automate or improve?"
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
    
    // Get best model for structured output (GPT-4o if available, otherwise GPT-5)
    const model = getBestModelForStructuredOutput();
    const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o';
    
    // Use json_schema if supported (GPT-5 supports it!), otherwise fall back to json mode
    const method = supportsJsonSchema(deploymentName) ? 'jsonSchema' : 'jsonMode';
    
    console.log(`📋 Using structured output method: ${method} for model: ${deploymentName}`);
    
    // Configure structured output
    const structuredModel = model.withStructuredOutput(ConversationResponseSchema, {
      method,
      name: 'conversation_response',
    });
    
    // Check if this is a voice conversation
    const isVoiceMode = state.metadata?.source === 'voice' || 
                         state.metadata?.voiceEnabled === true ||
                         state.messages.some((msg: any) => 
                           msg.additional_kwargs?.source === 'realtime_voice' ||
                           msg.additional_kwargs?.metadata?.source === 'text_input_during_voice'
                         );
    
    // Check if the last message was typed input during voice
    const currentMessage = state.messages[state.messages.length - 1];
    const wasTypedInput = currentMessage?.additional_kwargs?.metadata?.source === 'text_input_during_voice';
    const inputType = currentMessage?.additional_kwargs?.metadata?.inputType;
    
    // Debug logging for typed input detection
    if (wasTypedInput) {
      console.log('🔧 Typed input detected:', {
        inputType,
        transcript: currentMessage.content.toString(),
        metadata: currentMessage.additional_kwargs?.metadata
      });
    }
    
    // Check if new contact info was just provided (for verbal input detection)
    const previousEmail = state.customerInfo.email;
    const previousPhone = state.customerInfo.phone;
    
    // CRITICAL: Check workflow compliance BEFORE building prompt
    const workflowState = WorkflowEnforcer.getWorkflowState(state.customerInfo);
    const currentUserMessage = currentMessage?.content?.toString() || '';
    const enforcement = WorkflowEnforcer.enforceNextStep(state.customerInfo, currentUserMessage);
    
    if (enforcement.warningMessage) {
      console.log(enforcement.warningMessage);
    }
    
    // If workflow enforcement is required, add it to the prompt
    const workflowEnforcementPrompt = enforcement.forcedQuestion ? 
      `
    🚨 MANDATORY WORKFLOW ENFORCEMENT 🚨
    The user has not provided required information. You MUST ask this question:
    "${enforcement.forcedQuestion}"
    
    DO NOT skip this question. DO NOT move to other topics.
    DO NOT accept ending the conversation until all required info is collected.
    Current compliance: ${workflowState.complianceScore}%
    Missing steps: ${workflowState.missingSteps.join(', ')}
    ` : '';

    // Modify the prompt based on voice mode
    const voiceAdjustedPrompt = STRUCTURED_CONVERSATION_PROMPT
      .replace(/__VOICE_MODE_EMAIL_TEXT__/g, 
        isVoiceMode ? 
        "Please type your email address on the screen to ensure we have the right information for our AI strategist to reach out with tailored solutions." : 
        "What's your best email?")
      .replace(/__VOICE_MODE_PHONE_TEXT__/g,
        isVoiceMode ? 
        "Could you please type your phone number in the field that will appear on screen?" : 
        "And what's the best number to reach you?")
      .replace(/__VOICE_MODE_EMAIL_TEXT2__/g,
        isVoiceMode ? 
        "Could you please type your email address in the text field that appears on screen? This ensures accuracy." : 
        "What's your best email?")
      .replace(/__VOICE_MODE_PHONE_TEXT2__/g,
        isVoiceMode ? 
        "could you please type your phone number in the text field on screen?" : 
        "what's the best number?");
    
    // Check if this is the first message in the conversation
    const isFirstMessage = state.messages.length === 1;
    
    // Create context-aware prompt with current state
    const contextPrompt = `${voiceAdjustedPrompt}
    
    ${isFirstMessage ? `
    🚨 FIRST MESSAGE INSTRUCTIONS:
    This is the FIRST interaction. You MUST:
    1. Use the Step 0 greeting format exactly
    2. Include the quickActions array with the 4 options
    3. Do NOT ask about damage type yet - just present options
    ` : ''}
    
    🎯 TURN-TAKING RULES FOR THIS RESPONSE:
    - You MUST ask only ONE question in your response
    - First acknowledge what the user just said, then ask your next question
    - Do NOT chain multiple questions together (no "and", no listing multiple items)
    - WAIT for their response before moving to the next step
    - If they provide multiple pieces of information, acknowledge ALL of it, but still only ask ONE new question
    
    ${wasTypedInput && inputType === 'email' ? 
      "IMPORTANT: The user just typed their email. Extract the email from their message and acknowledge with: 'Perfect! I have your email as [THEIR_EMAIL]. Thank you for confirming that.' Then ask ONLY about phone. Set uiAction to 'none' since they just provided information." : 
      wasTypedInput && inputType === 'phone' ? 
      "IMPORTANT: The user just typed their phone number. Extract the phone from their message and acknowledge with: 'Excellent! I have your phone number as [THEIR_PHONE]. Thank you for that.' Then ask ONLY the next question. Set uiAction to 'none' since they just provided information." : 
      ''}
    
    ALREADY CAPTURED DATA (DO NOT RE-EXTRACT OR OVERWRITE UNLESS USER IS EXPLICITLY CORRECTING):
    ${state.customerInfo.currentChallenges?.length > 0 ? `✓ Challenges: ${state.customerInfo.currentChallenges.join(', ')}` : '○ Challenges: Not captured'}
    ${state.customerInfo.name ? `✓ Name: ${state.customerInfo.name}` : '○ Name: Not captured'}
    ${state.customerInfo.email ? `✓ Email: ${state.customerInfo.email}` : '○ Email: Not captured'}
    ${state.customerInfo.phone ? `✓ Phone: ${state.customerInfo.phone}` : '○ Phone: Not captured'}
    ${state.customerInfo.company ? `✓ Company: ${state.customerInfo.company}` : '○ Company: Not captured'}
    ${state.customerInfo.role ? `✓ Role: ${state.customerInfo.role}` : '○ Role: Not captured'}
    ${state.customerInfo.companySize ? `✓ Company Size: ${state.customerInfo.companySize}` : '○ Company Size: Not captured'}
    ${state.customerInfo.timeline ? `✓ Timeline: ${state.customerInfo.timeline}` : '○ Timeline: Not captured'}
    ${state.customerInfo.stakeholders?.length > 0 ? `✓ Stakeholders: ${state.customerInfo.stakeholders.join(', ')}` : '○ Stakeholders: Not captured'}
    ${state.customerInfo.budget ? `✓ Budget: ${state.customerInfo.budget}` : '○ Budget: Not captured'}
    
    PROGRESSION LOGIC - WHAT TO ASK NEXT:
    ${!state.customerInfo.currentChallenges || state.customerInfo.currentChallenges.length === 0 ? 
      '→ ASK about their challenges/pain points' :
      !state.customerInfo.email ? 
      '→ You have challenges. Now provide value insight and ASK for email' :
      !state.customerInfo.phone ? 
      '→ You have email. Now ASK for phone number' :
      !state.customerInfo.company ? 
      '→ You have phone. Now ASK for company name' :
      !state.customerInfo.role ? 
      '→ You have company. Now ASK for their role' :
      !state.customerInfo.companySize ? 
      '→ You have role. Now ASK for company size (number of employees)' :
      !state.customerInfo.timeline ? 
      '→ You have company size. Now ASK about evaluation timeline' :
      !state.customerInfo.stakeholders || state.customerInfo.stakeholders.length === 0 ? 
      '→ You have timeline. Now ASK about other stakeholders' :
      !state.customerInfo.budget ? 
      '→ You have stakeholders. Now ASK about budget range' :
      '→ All information collected. Provide closing confirmation.'}
    
    CRITICAL EXTRACTION RULES:
    - ONLY extract NEW information from the current message
    - NEVER put budget/numbers in email field
    - NEVER put company names in email field
    - If a field is already captured above, return null for that field
    
    🚨 CHALLENGE VALIDATION RULES:
    - DO NOT extract challenges from: names, greetings, personal info, single words
    - VALID challenges must describe business problems, processes, or inefficiencies
    - Examples of VALID challenges: "manual data entry", "slow reporting", "inefficient workflows"
    - Examples of INVALID challenges: "Maria", "automation", "help", "Hello", "My name is..."
    - If user response doesn't contain business challenges, return null for challenges field
    - If user says a number without context, it's likely budget/size/timeline, NOT email or phone
    
    ${workflowEnforcementPrompt}`;
    
    // Prepare messages for the model
    const messages: BaseMessage[] = [
      new HumanMessage({ content: contextPrompt }),
      ...state.messages,
    ];
    
    // Generate structured response
    const structuredResponse = await structuredModel.invoke(messages, {
      ...CONVERSATION_SETTINGS,
    });
    
    console.log('📊 Structured Response:', JSON.stringify(structuredResponse, null, 2));
    
    // Update customer info with extracted data (with validation)
    const extracted = structuredResponse.extracted;
    
    // Get the last user message for debugging
    const lastUserMessage = state.messages.filter(m => m._getType() === 'human').pop()?.content.toString() || '';
    
    console.log('📧 Email extraction debug:', {
      extractedEmail: extracted.email,
      isValidEmail: isValidEmail(extracted.email),
      normalizedEmail: normalizeEmail(extracted.email),
      currentStoredEmail: state.customerInfo.email,
      userMessage: lastUserMessage
    });
    
    // Smart merge with validation - only overwrite with valid data
    const updatedCustomerInfo: CustomerInfo = {
      ...state.customerInfo,
      name: extracted.name || state.customerInfo.name,
      
      // Email: Only overwrite if new value is a valid email AND different from current
      email: (isValidEmail(extracted.email) && extracted.email !== state.customerInfo.email) 
        ? normalizeEmail(extracted.email) 
        : state.customerInfo.email,
      
      // Phone: Only overwrite if new value is a valid phone AND different from current  
      phone: (isValidPhone(extracted.phone) && extracted.phone !== state.customerInfo.phone)
        ? extracted.phone
        : state.customerInfo.phone,
        
      company: extracted.company || state.customerInfo.company,
      industry: extracted.industry || state.customerInfo.industry,
      
      // Budget: Ensure it's not being confused with email/phone
      budget: (extracted.budget && !isValidEmail(extracted.budget)) 
        ? extracted.budget 
        : state.customerInfo.budget,
        
      timeline: extracted.timeline || state.customerInfo.timeline,
      companySize: extracted.companySize || state.customerInfo.companySize,
      role: extracted.role || state.customerInfo.role,
      currentChallenges: extracted.challenges || state.customerInfo.currentChallenges,
      stakeholders: extracted.stakeholders || state.customerInfo.stakeholders,
      evaluationStage: extracted.evaluationStage || state.customerInfo.evaluationStage,
      currentSpend: extracted.currentSpend || state.customerInfo.currentSpend,
      intentType: structuredResponse.intentType || 'general_inquiry',
      opportunitySummary: structuredResponse.opportunitySummary || state.customerInfo.opportunitySummary,
    };
    
    // Detect if new contact info was just provided verbally (not via typed input)
    const newEmailProvided = !wasTypedInput && updatedCustomerInfo.email && updatedCustomerInfo.email !== previousEmail;
    const newPhoneProvided = !wasTypedInput && updatedCustomerInfo.phone && updatedCustomerInfo.phone !== previousPhone;
    
    // Log if we prevented bad data from overwriting good data
    if (extracted.email && !isValidEmail(extracted.email) && state.customerInfo.email) {
      console.log('⚠️ Prevented invalid email overwrite:', {
        attempted: extracted.email,
        preserved: state.customerInfo.email
      });
    }
    
    // Determine conversation status
    let conversationStatus = state.conversationStatus;
    
    // Check for meaningful qualification criteria using ACCUMULATED data
    const hasSpecificChallenges = updatedCustomerInfo.currentChallenges && 
                                  updatedCustomerInfo.currentChallenges.length > 0 &&
                                  !updatedCustomerInfo.currentChallenges.every(c => 
                                    c.toLowerCase().includes('automation') && c.split(' ').length < 4
                                  );
    
    const hasBusinessContext = !!(updatedCustomerInfo.company || updatedCustomerInfo.industry || updatedCustomerInfo.role);
    const hasContact = !!(updatedCustomerInfo.email || updatedCustomerInfo.phone);
    const hasTimeline = !!updatedCustomerInfo.timeline;
    const hasBudget = !!updatedCustomerInfo.budget;
    const hasContext = !!(
      extracted.company || 
      extracted.industry || 
      (extracted.challenges && extracted.challenges.length > 0)
    );
    const conversationDepth = structuredResponse.conversationDepth || state.messages.filter(m => m._getType() === 'human').length;
    
    // Check if user is ending conversation
    const finalUserMessage = state.messages.filter(m => m._getType() === 'human').pop()?.content.toString().toLowerCase() || '';
    const userEndingConversation = finalUserMessage.includes('thanks') || 
                                   finalUserMessage.includes('thank you') || 
                                   finalUserMessage.includes('goodbye') ||
                                   finalUserMessage.includes('bye');
    
    // Only mark as ready to qualify if we have ALL critical information
    if (structuredResponse.status === 'ready_to_qualify' || structuredResponse.status === 'qualified') {
      const hasAllCriticalInfo = hasContact && 
                                 hasSpecificChallenges && 
                                 hasBusinessContext && 
                                 hasTimeline && 
                                 hasBudget &&
                                 conversationDepth >= 6;
      
      // NEVER qualify without budget discussion
      if (!hasBudget) {
        structuredResponse.status = 'gathering';
        structuredResponse.nextAction = 'continue';
        // Add budget to missing info if not already there
        if (!structuredResponse.missingInfo.includes('budget')) {
          structuredResponse.missingInfo.push('budget');
        }
        console.log(`📋 BLOCKING qualification - Budget NOT discussed. Must ask about budget first!`);
      } else if (hasAllCriticalInfo || (conversationDepth >= 8 && userEndingConversation && hasBudget)) {
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
    // CRITICAL: Budget MUST be discussed before qualification
    const shouldActuallyQualify = !state.qualification &&
                                  hasContact && 
                                  hasSpecificChallenges && 
                                  hasBusinessContext &&
                                  hasTimeline &&
                                  hasBudget && // MANDATORY - No qualification without budget
                                  conversationDepth >= 4;
    
    // Double-check: Never qualify without budget
    if (shouldActuallyQualify && !hasBudget) {
      console.error('⚠️ CRITICAL: Attempted to qualify without budget discussion. Blocking qualification.');
      structuredResponse.status = 'gathering';
      structuredResponse.nextAction = 'continue';
    }
    
    console.log('🔍 Qualification check:', {
      shouldActuallyQualify,
      hasContact,
      hasSpecificChallenges,
      hasBusinessContext,
      hasTimeline,
      hasBudget,
      conversationDepth,
      alreadyQualified: !!state.qualification,
      voiceEnabled: state.customerInfo.voiceEnabled,
      source: state.customerInfo.source
    });
    
    if (shouldActuallyQualify) {
      console.log('✅ Creating qualification - all conditions met');
      // Build full qualification scoring
      const contactScore = hasContact ? 15 : 0;
      // Company scoring - financial services = high value
      let companyScore = 0;
      if (extracted.company) {
        companyScore += 5;
      }
      if (extracted.industry) {
        const industryLower = extracted.industry.toLowerCase();
        if (industryLower.includes('financial') || industryLower.includes('finance') ||
            industryLower.includes('banking') || industryLower.includes('insurance')) {
          companyScore += 10; // High-value industry
        } else if (industryLower.includes('healthcare') || industryLower.includes('legal')) {
          companyScore += 8;
        } else {
          companyScore += 5;
        }
      }
      // Need/Challenge scoring - multiple specific challenges = high need
      let challengeScore = 0;
      if (extracted.challenges && extracted.challenges.length > 0) {
        const numChallenges = extracted.challenges.length;
        // Check for time-critical pain points
        const hasTimePain = extracted.challenges.some(c => 
          c.toLowerCase().includes('slow') || c.toLowerCase().includes('time') || 
          c.toLowerCase().includes('hour') || c.toLowerCase().includes('manual')
        );
        
        if (numChallenges >= 3) {
          challengeScore = 25; // Multiple pain points
        } else if (numChallenges === 2) {
          challengeScore = 20;
        } else if (numChallenges === 1) {
          challengeScore = 15;
        }
        
        // Bonus for time-critical issues
        if (hasTimePain) {
          challengeScore = Math.min(25, challengeScore + 5);
        }
      }
      const nameScore = extracted.name ? 5 : 0;
      
      // Budget scoring (30 points max) - prioritize 100K+ clients
      let budgetScore = 0;
      if (extracted.budget) {
        const budgetLower = extracted.budget.toLowerCase();
        if (budgetLower.includes('250k') || budgetLower.includes('250') || budgetLower.includes('+')) {
          budgetScore = 30; // Enterprise transformation
        } else if (budgetLower.includes('200k') || budgetLower.includes('200')) {
          budgetScore = 27; // High budget
        } else if (budgetLower.includes('150k') || budgetLower.includes('150')) {
          budgetScore = 25; // Strong budget
        } else if (budgetLower.includes('100k') || budgetLower.includes('100')) {
          budgetScore = 22; // Good budget (our sweet spot)
        } else if (budgetLower.includes('50k') && (budgetLower.includes('200') || budgetLower.includes('250'))) {
          budgetScore = 25; // Range 50-200K+ is good
        } else if (budgetLower.includes('50k')) {
          budgetScore = 15; // Minimum viable
        } else if (budgetLower.includes('under')) {
          budgetScore = 8; // Too small but possible
        } else {
          budgetScore = 10; // Unknown but engaged
        }
      }
      
      // Timeline scoring - prioritize urgent needs
      let timelineScore = 0;
      if (extracted.timeline) {
        const timelineLower = extracted.timeline.toLowerCase();
        // ASAP/Immediate = highest urgency
        if (timelineLower.includes('asap') || timelineLower.includes('immediate') || 
            timelineLower.includes('urgent') || timelineLower.includes('this week')) {
          timelineScore = 20; // Maximum urgency
        }
        // Within 30 days = very high urgency
        else if (timelineLower.includes('oct') && new Date().getMonth() === 8) { // October from September
          timelineScore = 18; // Within 30 days
        }
        else if (timelineLower.includes('2 week') || timelineLower.includes('two week')) {
          timelineScore = 17;
        }
        else if (timelineLower.includes('3 week') || timelineLower.includes('three week') || 
                 timelineLower.includes('4 week') || timelineLower.includes('four week') ||
                 timelineLower.includes('30 day') || timelineLower.includes('1 month')) {
          timelineScore = 15; // Within a month
        }
        else if (timelineLower.includes('q1') || timelineLower.includes('q2')) {
          // Q1/Q2 is near term
          timelineScore = 14;
        }
        else if (timelineLower.includes('month')) {
          timelineScore = 12;
        }
        else if (timelineLower.includes('quarter') || timelineLower.includes('q3') || timelineLower.includes('q4')) {
          timelineScore = 10;
        }
        else {
          timelineScore = 5;
        }
      }
      
      // Authority scoring - VP/C-level have high authority
      let authorityScore = 0;
      if (extracted.role) {
        const roleLower = extracted.role.toLowerCase();
        if (roleLower.includes('ceo') || roleLower.includes('cto') || roleLower.includes('cfo') ||
            roleLower.includes('coo') || roleLower.includes('chief')) {
          authorityScore = 25; // C-level
        } else if (roleLower.includes('vp') || roleLower.includes('vice president')) {
          authorityScore = 20; // VP level - high authority
        } else if (roleLower.includes('director')) {
          authorityScore = 15; // Director level
        } else if (roleLower.includes('manager') || roleLower.includes('head')) {
          authorityScore = 10; // Manager level
        } else {
          authorityScore = 5; // Other roles
        }
      }
      
      // Check for multiple stakeholders bonus
      let stakeholderBonus = 0;
      if (state.customerInfo.stakeholders && state.customerInfo.stakeholders.length > 1) {
        stakeholderBonus = 5; // Bonus for identifying multiple decision makers
      }
      
      // Calculate total score for qualification
      const baseScore = contactScore + companyScore + challengeScore + nameScore + 
                        budgetScore + timelineScore + authorityScore + stakeholderBonus;
      
      // Apply industry multiplier to get final score
      const totalScore = calculateFinalScore(baseScore, extracted.industry || state.customerInfo.industry);
      
      console.log('📊 BANT Score Breakdown:', { 
        budget: budgetScore, 
        authority: authorityScore, 
        need: challengeScore, 
        timeline: timelineScore,
        sum: baseScore,
        maxPossible: '30 + 25 + 25 + 20 = 100' 
      });
      
      console.log('Final Score Calculation:', { 
        baseScore, 
        industry: extracted.industry || state.customerInfo.industry, 
        finalScore: totalScore, 
        isValid: totalScore <= 100 
      });
      
      // Determine tier based on score
      let tier: 'hot' | 'warm' | 'qualified' | 'viable' | 'nurture';
      if (totalScore >= 80) tier = 'hot';
      else if (totalScore >= 60) tier = 'warm';
      else if (totalScore >= 45) tier = 'qualified';
      else if (totalScore >= 30) tier = 'viable';
      else tier = 'nurture';
      
      // Set final qualification
      qualification = {
        budget: { score: budgetScore, status: hasBudget ? 'identified' : 'unknown' },
        authority: { 
          level: extracted.role ? 'identified' : 'unknown', 
          canSign: false, 
          needsApproval: true, 
          score: authorityScore 
        },
        need: { 
          painLevel: hasSpecificChallenges ? 'high' : 'medium', 
          urgency: hasTimeline ? 'high' : 'medium', 
          impact: extracted.challenges?.[0] || '', 
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
      
      console.log('📊 Qualification created:', {
        score: totalScore,
        tier,
        isQualified: totalScore >= 30
      });
    }
    
    // Track execution
    const execution: AgentExecution = {
      agentId: 'conversation',
      startTime,
      endTime: new Date(),
      status: 'completed',
      result: {
        phase: 'discovery',
        extracted: extracted,
        objectives: structuredResponse.objectives,
        status: structuredResponse.status,
        method, // Track which method was used
      },
      retryCount: 0,
    };
    
    // Validate response to ensure single question (turn-taking enforcement)
    const validateSingleQuestion = (message: string): string => {
      // Check for multiple question patterns
      const multipleQuestionPatterns = [
        /what's your.*?\?.*?what's/gi,  // "What's your email? What's your phone?"
        /and.*?\?.*?\?/gi,               // Multiple question marks
        /could you.*?\?.*?also/gi,       // "Could you...? Also..."
        /\?.*?and.*?\?/gi,               // Question, "and", question
      ];
      
      const hasMultipleQuestions = multipleQuestionPatterns.some(pattern => pattern.test(message));
      
      if (hasMultipleQuestions && !conversationStatus) {
        console.warn('⚠️ Multiple questions detected in response. Enforcing turn-taking.');
        // Extract just the first question
        const firstQuestionEnd = message.indexOf('?');
        if (firstQuestionEnd > -1) {
          return message.substring(0, firstQuestionEnd + 1);
        }
      }
      
      return message;
    };
    
    // WORKFLOW ENFORCEMENT: Override message if required
    if (enforcement.forcedQuestion && !enforcement.allowNaturalResponse) {
      console.log('🚫 OVERRIDING AI RESPONSE - Enforcing mandatory question');
      console.log('❌ AI tried to say:', structuredResponse.message);
      console.log('✅ Forcing question:', enforcement.forcedQuestion);
      structuredResponse.message = enforcement.forcedQuestion;
      
      // Log compliance status
      console.log(WorkflowEnforcer.getComplianceReport(updatedCustomerInfo));
    }
    
    // Handle verbal contact info confirmations and UI state
    let finalMessage = validateSingleQuestion(structuredResponse.message);
    let finalUiAction = structuredResponse.uiAction;
    
    // PRIORITY 1: Handle typed input confirmations for voice mode FIRST
    if (isVoiceMode && wasTypedInput) {
      if (inputType === 'email' && updatedCustomerInfo.email && updatedCustomerInfo.email !== previousEmail) {
        console.log('📧 Typed email confirmed in voice mode:', updatedCustomerInfo.email);
        // IMMEDIATELY confirm and continue - typed input is trusted
        finalMessage = `Perfect! I've got your email as ${updatedCustomerInfo.email}. Your custom roadmap is already being prioritized. Now, for something this transformative, I want to make sure you get direct access to our senior team. What's the best number for a quick strategy call?`;
        // CRITICAL: Hide email UI immediately and show phone input
        finalUiAction = {
          type: 'show_text_input' as const,
          inputType: 'phone' as const,
          placeholder: '(555) 123-4567'
        };
        // No confirmation needed for typed input
      } else if (inputType === 'phone' && updatedCustomerInfo.phone && updatedCustomerInfo.phone !== previousPhone) {
        console.log('📞 Typed phone confirmed in voice mode:', updatedCustomerInfo.phone);
        // IMMEDIATELY confirm and continue - typed input is trusted
        finalMessage = `Excellent! I have your phone number as ${updatedCustomerInfo.phone}. Now, tell me about your company - what's the name and what industry are you revolutionizing?`;
        // CRITICAL: Hide phone UI immediately
        finalUiAction = {
          type: 'hide_text_input' as const,
          inputType: null,
          placeholder: null
        };
        // No confirmation needed for typed input
      }
    }
    // PRIORITY 2: Handle user confirmation responses
    else if (isVoiceMode && (state as any).pendingConfirmation) {
      const confirmation = (state as any).pendingConfirmation;
      const userResponseLower = currentUserMessage.toLowerCase();
      const isConfirmed = userResponseLower.includes('yes') || userResponseLower.includes('correct') || 
                          userResponseLower.includes('right') || userResponseLower.includes('yeah');
      const isDenied = userResponseLower.includes('no') || userResponseLower.includes('wrong') || 
                       userResponseLower.includes('incorrect');
      
      if (isConfirmed) {
        // User confirmed - move to next step
        if (confirmation.type === 'email') {
          finalMessage = `Thank you for confirming! So our strategist can reach you directly, could you please type your phone number in the text field on screen?`;
          // CRITICAL: Set to 'none' - let the voice agent trigger UI after speaking
          finalUiAction = {
            type: 'none' as const,
            inputType: null,
            placeholder: null
          };
        } else if (confirmation.type === 'phone') {
          finalMessage = `Thank you for confirming! What's the name of your company?`;
          finalUiAction = {
            type: 'none' as const,
            inputType: null,
            placeholder: null
          };
        }
        delete (state as any).pendingConfirmation;
      } else if (isDenied) {
        // User denied - ask them to re-enter
        if (confirmation.type === 'email') {
          finalMessage = `No problem! Please type your correct email address in the field that will appear on screen.`;
          // CRITICAL: Set to 'none' - let the voice agent trigger UI after speaking
          finalUiAction = {
            type: 'none' as const,
            inputType: null,
            placeholder: null
          };
          // Clear the incorrect value
          updatedCustomerInfo.email = '';
        } else if (confirmation.type === 'phone') {
          finalMessage = `No problem! Please type your correct phone number in the field that will appear on screen.`;
          // CRITICAL: Set to 'none' - let the voice agent trigger UI after speaking
          finalUiAction = {
            type: 'none' as const,
            inputType: null,
            placeholder: null
          };
          // Clear the incorrect value
          updatedCustomerInfo.phone = '';
        }
        delete (state as any).pendingConfirmation;
      } else {
        // Unclear response - ask again
        finalMessage = `I didn't catch that. Is ${confirmation.value} correct?`;
      }
    }
    // PRIORITY 3: Check if new contact info was provided verbally and override response
    else if (newEmailProvided) {
      console.log('📧 Verbal email provided:', updatedCustomerInfo.email);
      // CRITICAL: In voice mode, we need to confirm the email first
      if (isVoiceMode) {
        finalMessage = `Perfect! I have your email as ${updatedCustomerInfo.email}. Is that correct?`;
        finalUiAction = {
          type: 'none' as const,
          inputType: null,
          placeholder: null
        };
        // Store state for next turn to handle confirmation
        (state as any).pendingConfirmation = { type: 'email', value: updatedCustomerInfo.email };
      } else {
        finalMessage = `Perfect! I have your email as ${updatedCustomerInfo.email}. Thank you! What's the best phone number to reach you?`;
        finalUiAction = {
          type: 'hide_text_input' as const,
          inputType: null,
          placeholder: null
        };
      }
    } else if (newPhoneProvided) {
      console.log('📞 Verbal phone provided:', updatedCustomerInfo.phone);
      // CRITICAL: In voice mode, we need to confirm the phone first
      if (isVoiceMode) {
        finalMessage = `Excellent! I have your phone number as ${updatedCustomerInfo.phone}. Is that correct?`;
        finalUiAction = {
          type: 'none' as const,
          inputType: null,
          placeholder: null
        };
        // Store state for next turn to handle confirmation
        (state as any).pendingConfirmation = { type: 'phone', value: updatedCustomerInfo.phone };
      } else {
        finalMessage = `Excellent! I have your phone number as ${updatedCustomerInfo.phone}. Thank you! What's the name of your company?`;
        finalUiAction = {
          type: 'hide_text_input' as const,
          inputType: null,
          placeholder: null
        };
      }
    }
    
    // The typed input confirmation is now handled at the beginning with PRIORITY 1
    // Removing duplicate code block
    else if (false) {
      if (inputType === 'email' && updatedCustomerInfo.email && updatedCustomerInfo.email !== previousEmail) {
        console.log('📧 Typed email confirmed in voice mode:', updatedCustomerInfo.email);
        // Read back and ask for confirmation
        finalMessage = `Perfect! I have your email as ${updatedCustomerInfo.email}. Is that correct?`;
        // Don't show next input yet - wait for confirmation
        finalUiAction = {
          type: 'hide_text_input' as const,
          inputType: null,
          placeholder: null
        };
        // Store state for next turn to handle confirmation
        (state as any).pendingConfirmation = { type: 'email', value: updatedCustomerInfo.email };
      } else if (inputType === 'phone' && updatedCustomerInfo.phone && updatedCustomerInfo.phone !== previousPhone) {
        console.log('📞 Typed phone confirmed in voice mode:', updatedCustomerInfo.phone);
        // Read back and ask for confirmation
        finalMessage = `Excellent! I have your phone number as ${updatedCustomerInfo.phone}. Is that correct?`;
        // Don't show next input yet - wait for confirmation
        finalUiAction = {
          type: 'hide_text_input' as const,
          inputType: null,
          placeholder: null
        };
        // Store state for next turn to handle confirmation
        (state as any).pendingConfirmation = { type: 'phone', value: updatedCustomerInfo.phone };
      }
    }
    
    // The user confirmation is now handled with PRIORITY 2
    // Removing duplicate code block
    else if (false) {
      const confirmation = (state as any).pendingConfirmation;
      const userResponseLower2 = currentUserMessage.toLowerCase();
      const isConfirmed = userResponseLower2.includes('yes') || userResponseLower2.includes('correct') || 
                          userResponseLower2.includes('right') || userResponseLower2.includes('yeah');
      const isDenied = userResponseLower2.includes('no') || userResponseLower2.includes('wrong') || 
                       userResponseLower2.includes('incorrect');
      
      if (isConfirmed) {
        // User confirmed - move to next step
        if (confirmation.type === 'email') {
          finalMessage = `Thank you for confirming! So our strategist can reach you directly, could you please type your phone number in the text field on screen?`;
          // CRITICAL: Set to 'none' - let the voice agent trigger UI after speaking
          finalUiAction = {
            type: 'none' as const,
            inputType: null,
            placeholder: null
          };
        } else if (confirmation.type === 'phone') {
          finalMessage = `Thank you for confirming! What's the name of your company?`;
        }
        delete (state as any).pendingConfirmation;
      } else if (isDenied) {
        // User denied - ask them to re-enter
        if (confirmation.type === 'email') {
          finalMessage = `No problem! Please type your correct email address in the field that will appear on screen.`;
          // CRITICAL: Set to 'none' - let the voice agent trigger UI after speaking
          finalUiAction = {
            type: 'none' as const,
            inputType: null,
            placeholder: null
          };
          // Clear the incorrect value
          updatedCustomerInfo.email = '';
        } else if (confirmation.type === 'phone') {
          finalMessage = `No problem! Please type your correct phone number in the field that will appear on screen.`;
          // CRITICAL: Set to 'none' - let the voice agent trigger UI after speaking
          finalUiAction = {
            type: 'none' as const,
            inputType: null,
            placeholder: null
          };
          // Clear the incorrect value
          updatedCustomerInfo.phone = '';
        }
        delete (state as any).pendingConfirmation;
      } else {
        // Unclear response - ask again
        finalMessage = `I didn't catch that. Is ${confirmation.value} correct?`;
      }
    }
    
    // Override uiAction to end call when conversation is completed in voice mode
    if (conversationStatus === 'completed' && isVoiceMode) {
      console.log('🔴 Conversation completed in voice mode - triggering call end');
      finalUiAction = {
        type: 'end_call' as const,
        inputType: null,
        placeholder: null
      };
    }
    
    // 🚨 CRITICAL VOICE MODE OVERRIDE 🚨
    // In voice mode, allow UI actions from orchestrator when the agent explicitly asks for them
    // Block only automatic/premature UI actions, not legitimate requests
    if (isVoiceMode && finalUiAction.type === 'show_text_input') {
      // Allow UI actions if the assistant explicitly mentioned asking for input
      const assistantMessage = result.messages?.[result.messages.length - 1]?.content?.toLowerCase() || '';
      const isLegitimateRequest = (
        assistantMessage.includes('type') && 
        (assistantMessage.includes('phone') || assistantMessage.includes('email'))
      ) || (
        assistantMessage.includes('field on screen') ||
        assistantMessage.includes('on the screen')
      );
      
      if (isLegitimateRequest) {
        console.log('✅ ALLOWING UI ACTION FROM LANGRAPH - Agent explicitly requested input');
      } else {
        console.log('🚫 BLOCKING UI ACTION FROM LANGRAPH IN VOICE MODE - Voice agent controls UI timing');
        finalUiAction = {
          type: 'none' as const,
          inputType: null,
          placeholder: null
        };
      }
    }
    
    // Update conversation turn tracking
    const conversationTurn = {
      lastSpeaker: 'assistant' as const,
      turnCount: (state.conversationTurn?.turnCount || 0) + 1,
      waitingForUser: true,
      lastQuestionAsked: finalMessage.includes('?') ? finalMessage : undefined,
      questionTimestamp: finalMessage.includes('?') ? new Date() : undefined,
    };
    
    // Return comprehensive update
    return {
      messages: [new AIMessage(finalMessage)],
      customerInfo: updatedCustomerInfo,
      qualification,
      conversationStatus,
      conversationTurn, // Track turn-taking
      currentPhase: structuredResponse.status === 'ready_to_qualify' ? 'qualification' : 'discovery',
      nextNode: structuredResponse.nextAction === 'notify_sales' ? 'notification' : undefined,
      latestUiAction: finalUiAction, // Store UI action for frontend (may be overridden for contact confirmation or call end)
      quickActions: structuredResponse.quickActions, // Include quick actions for UI
      agentExecutions: [execution],
      analytics: {
        ...state.analytics,
        messageCount: state.analytics.messageCount + 1,
        conversationDuration: (new Date().getTime() - new Date(state.startTime).getTime()) / 1000,
        // Conversion probability calculated by qualification agent
        conversionProbability: state.analytics.conversionProbability || 0,
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