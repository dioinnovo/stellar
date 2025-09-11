import { NextRequest, NextResponse } from 'next/server'

// Azure OpenAI Configuration from environment
const AZURE_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT!
const AZURE_KEY = process.env.AZURE_OPENAI_KEY!

// Session storage (in production, use Redis or a database)
const sessions = new Map<string, any[]>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, sessionId } = body

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Message is required',
          response: 'Please provide a message to continue our conversation.'
        },
        { status: 400 }
      )
    }

    // Get or create session
    const currentSessionId = sessionId || `session_${Date.now()}`
    const conversationHistory = sessions.get(currentSessionId) || []

    // Add system prompt for first message
    const messages = [
      {
        role: "system",
        content: `You're a friendly AI assistant for Innovoco, helping visitors explore AI and automation solutions. Chat naturally, like a helpful colleague - not a robot.

CONVERSATION RULES:
1. Keep it SHORT - Max 1-2 sentences per response
2. One thing at a time - Never ask multiple questions  
3. Sound HUMAN - Write like you're texting a colleague
4. NO FORMATTING - Never use asterisks, bold, or markdown
5. Mirror their vibe - Formal if they're formal, casual if casual
6. Help first - Focus on being helpful, not interrogating

CONVERSATION FLOW:

Opening: Start friendly but immediately get their name: "Hey! I'm here to help with AI solutions. Who am I speaking with today?"

Stage 1 (First 2-3 messages): Understand their need WHILE getting their name if not given. "Interesting, [Name]! Tell me more about..."

Stage 2 (Next 2-3 messages): Get company specifics. Never accept vague answers. "Which firm specifically?" "What's your role there?"

Stage 3 (If engaged): Timeline, budget, and start collecting contact info. "Let me grab your email to send some info while we chat"

Stage 4 (If qualified): Suggest next steps and get contact info naturally. Reference our AI & Automation Strategist or Senior AI Transformation Advisor when connecting them.

TEAM REFERENCES:
When mentioning team members, use these powerful titles:
- AI & Automation Strategist (default)
- Senior AI Transformation Advisor (for complex needs)
- Enterprise Innovation Architect (for technical discussions)
- Chief Automation Strategist (for C-suite visitors)

Example: "I'll connect you with our AI & Automation Strategist who specializes in your industry"

CRITICAL DATA COLLECTION (Must gather before ending):
1. NAME - "What's your name, by the way?" 
2. EMAIL - "What's the best email to reach you?"
3. PHONE - "And your phone number for the follow-up?" (ALWAYS ASK - even if they hesitate)
4. COMPANY NAME - "Which law firm/company specifically?"
5. YOUR ROLE - "Are you the managing partner?" or "What's your role there?"
6. BUDGET - "Have you set aside budget for this?" or "What investment level makes sense?"

BE STRATEGIC:
- If they give email but not phone: "I'll need your phone too - our strategist prefers a quick call first"
- If vague about company: "Just so I connect you with the right specialist, which firm is this for?"
- If no budget mentioned: "So our team prepares properly, are we talking 50K, 100K, or more?"
- Always get their name early: "I'm pulling up some options - who am I helping today?"

GATHER INFO NATURALLY BUT PERSISTENTLY:
- Don't give up after one attempt
- Use different angles if needed
- Make it about helping them better

SOUND HUMAN BUT BE THOROUGH:
- Start with: "Hey! I'm here to help with AI solutions. Who am I speaking with today?"
- For phone: "What's the best number to reach you?" then if resistant: "Our team needs it for the follow-up call"
- For company: "Which [industry] specifically?" Never accept "a law firm" - get the actual name
- For role: "Are you the [likely title]?" or "What's your role there?"
- For budget: "To make sure we propose the right scale - are we talking 50K, 100K, or more?"

HIDDEN SCORING (Never mention to user):
- 500+ employees = high priority
- 50K+ budget = qualified  
- Urgent timeline = hot lead
- Decision maker = move fast
- Just browsing = be helpful, nurture politely

QUALIFICATION CHECKLIST (Track internally):
☐ Name collected
☐ Email collected  
☐ Phone collected (MANDATORY)
☐ Company name (specific)
☐ Role/Title
☐ Company size
☐ Budget range
☐ Timeline
☐ Key challenge

NEVER END without at minimum: Name, Email, Phone, Company

Remember: People buy from people they like. Be likeable but thorough. You're gathering intelligence while being helpful.`
      },
      ...conversationHistory,
      { role: "user", content: message }
    ]

    // Call Azure OpenAI
    const azureResponse = await fetch(AZURE_ENDPOINT, {
      method: 'POST',
      headers: {
        'api-key': AZURE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
        top_p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0
      })
    })

    if (!azureResponse.ok) {
      const error = await azureResponse.text()
      console.error('Azure OpenAI error:', error)
      throw new Error(`Azure API error: ${azureResponse.status}`)
    }

    const data = await azureResponse.json()
    const assistantMessage = data.choices[0]?.message?.content || "I'm here to help!"

    // Update conversation history
    conversationHistory.push(
      { role: "user", content: message },
      { role: "assistant", content: assistantMessage }
    )
    sessions.set(currentSessionId, conversationHistory)

    // Call qualification agent to analyze the conversation
    let qualificationData = {
      qualified: false,
      qualificationScore: 0,
      qualificationStatus: 'pending',
      qualificationReasons: [],
      extractedInfo: {},
      shouldSendNotification: false
    }

    try {
      const qualifyResponse = await fetch(`${request.nextUrl.origin}/api/qualify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSessionId,
          conversationHistory
        })
      })

      if (qualifyResponse.ok) {
        qualificationData = await qualifyResponse.json()
      }
    } catch (error) {
      console.error('Failed to call qualification agent:', error)
    }
    // Send email notification if qualified by the qualification agent
    if (qualificationData.shouldSendNotification) {
    
      try {
        const RESEND_API_KEY = process.env.RESEND_API_KEY
        const RESEND_NOTIFICATION_EMAIL = process.env.RESEND_NOTIFICATION_EMAIL || 'dio.delahoz@innovoco.com'
        
        if (RESEND_API_KEY) {
          // Get conversation summary
          const recentMessages = conversationHistory.slice(-6) // Last 3 exchanges
          const conversationSummary = recentMessages.map(msg => 
            `<p><strong>${msg.role === 'user' ? 'Visitor' : 'AI'}:</strong> ${msg.content}</p>`
          ).join('')
          
          // Extract key information from conversation
          const extractedInfo = {
            name: '',
            email: '',
            phone: '',
            company: '',
            industry: '',
            employees: '',
            role: '',
            budget: '',
            timeline: '',
            challenges: '',
            decisionMaker: false
          }
          
          // Use extracted info from qualification agent
          Object.assign(extractedInfo, qualificationData.extractedInfo)
          
          // Create full conversation text for extraction
          const fullConversation = conversationHistory.map(msg => msg.content).join(' ')
          
          // Extract phone
          const phoneMatch = fullConversation.match(/(\+?\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9})/i)
          if (phoneMatch) extractedInfo.phone = phoneMatch[1]
          
          // Extract employee count
          const empMatch = fullConversation.match(/(\d+)\s*(employee|people|person|staff)/i)
          if (empMatch) extractedInfo.employees = empMatch[1]
          
          // Extract budget
          const budgetMatch = fullConversation.match(/\$?(\d+)k|\$(\d{4,})/i)
          if (budgetMatch) {
            const amount = budgetMatch[1] ? parseInt(budgetMatch[1]) * 1000 : parseInt(budgetMatch[2])
            extractedInfo.budget = `$${amount.toLocaleString()}`
          }
          
          // Check for decision maker
          if (fullConversation.match(/\b(ceo|cto|director|vp|vice president|manager|head of)\b/i)) {
            extractedInfo.decisionMaker = true
          }
          
          const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Innovoco AI <onboarding@resend.dev>',
              to: [RESEND_NOTIFICATION_EMAIL],
              subject: `🎯 Qualified Lead Alert - Score: ${qualificationData.qualificationScore}/100 ${extractedInfo.company ? `- ${extractedInfo.company}` : ''}`,
              html: `
                <h2>🎯 New Qualified Lead from AI Chat</h2>
                
                <div style="background: #f0f8ff; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #0066cc;">
                  <h3>📊 Lead Score: ${qualificationData.qualificationScore}/100</h3>
                  <p><strong>Priority Level:</strong> ${qualificationData.qualificationScore >= 80 ? '🔥 HIGH PRIORITY' : qualificationData.qualificationScore >= 60 ? '✅ QUALIFIED' : '📋 NEEDS NURTURING'}</p>
                  <p><strong>Status:</strong> ${qualificationData.qualificationStatus}</p>
                </div>
                
                <div style="background: #ffffff; padding: 20px; border-radius: 10px; margin: 20px 0; border: 1px solid #ddd;">
                  <h3>👤 Contact Information</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 5px; font-weight: bold;">Name:</td><td>${extractedInfo.name || '<span style="color: #ff6600;">Not provided yet</span>'}</td></tr>
                    <tr><td style="padding: 5px; font-weight: bold;">Email:</td><td>${extractedInfo.email || '<span style="color: #ff6600;">Not provided yet</span>'}</td></tr>
                    <tr><td style="padding: 5px; font-weight: bold;">Phone:</td><td>${extractedInfo.phone || '<span style="color: #ff6600;">Not provided yet</span>'}</td></tr>
                    <tr><td style="padding: 5px; font-weight: bold;">Role:</td><td>${extractedInfo.role || 'Not specified'} ${extractedInfo.decisionMaker ? '✅ Decision Maker' : ''}</td></tr>
                  </table>
                </div>
                
                <div style="background: #ffffff; padding: 20px; border-radius: 10px; margin: 20px 0; border: 1px solid #ddd;">
                  <h3>🏢 Company Details</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 5px; font-weight: bold;">Company:</td><td>${extractedInfo.company || 'Not specified'}</td></tr>
                    <tr><td style="padding: 5px; font-weight: bold;">Industry:</td><td>${extractedInfo.industry || 'Not specified'}</td></tr>
                    <tr><td style="padding: 5px; font-weight: bold;">Size:</td><td>${extractedInfo.employees ? extractedInfo.employees + ' employees' : 'Not specified'}</td></tr>
                    <tr><td style="padding: 5px; font-weight: bold;">Budget:</td><td>${extractedInfo.budget || 'Not specified'}</td></tr>
                    <tr><td style="padding: 5px; font-weight: bold;">Timeline:</td><td>${extractedInfo.timeline || 'Not specified'}</td></tr>
                  </table>
                </div>
                
                <div style="background: #ffffff; padding: 20px; border-radius: 10px; margin: 20px 0; border: 1px solid #ddd;">
                  <h3>✅ Qualification Factors</h3>
                  <ul style="list-style: none; padding: 0;">
                    ${qualificationData.qualificationReasons.map(reason => `<li style="padding: 5px;">✓ ${reason}</li>`).join('')}
                  </ul>
                </div>
                
                <div style="background: #fffacd; padding: 20px; border-radius: 10px; margin: 20px 0; border: 1px solid #ffd700;">
                  <h3>💬 Conversation Highlights</h3>
                  ${conversationSummary}
                </div>
                
                <div style="background: #ff6b6b; color: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                  <h3>⚡ ACTION REQUIRED</h3>
                  <p style="font-size: 16px; margin: 10px 0;">This is a qualified lead. Please follow up within 2 hours!</p>
                  <p><strong>Recommended Actions:</strong></p>
                  <ol>
                    <li>Review the full conversation transcript</li>
                    <li>Prepare a personalized proposal based on their needs</li>
                    <li>Schedule a discovery call or demo</li>
                    <li>Add to CRM with "Hot Lead" tag</li>
                  </ol>
                </div>
                
                <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 12px; color: #666;">
                  <p><strong>Session ID:</strong> ${currentSessionId}</p>
                  <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
                  <p><strong>Source:</strong> AI Chat Widget - Innovoco Website</p>
                </div>
              `
            })
          })
          
          if (emailResponse.ok) {
            console.log('✅ Qualified lead notification sent to:', RESEND_NOTIFICATION_EMAIL)
          } else {
            console.error('Failed to send notification:', await emailResponse.text())
          }
        }
      } catch (emailError) {
        console.error('Error sending notification:', emailError)
        // Don't fail the chat response if email fails
      }
    }

    // Return response in expected format
    return NextResponse.json({
      response: assistantMessage,
      sessionId: currentSessionId,
      metadata: {
        qualified: qualificationData.qualified,
        qualificationScore: qualificationData.qualificationScore,
        qualificationReasons: qualificationData.qualificationReasons,
        qualificationStatus: qualificationData.qualificationStatus,
        intent: 'general_inquiry',
        model: 'gpt-5-chat-01',
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Chat API Error:', error)
    return NextResponse.json(
      { 
        error: 'An error occurred processing your request',
        response: "I apologize, but I'm experiencing technical difficulties. Please try again or contact support@innovoco.com."
      },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  try {
    // Test Azure connectivity
    const testResponse = await fetch(AZURE_ENDPOINT, {
      method: 'POST',
      headers: {
        'api-key': AZURE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are a health check bot" },
          { role: "user", content: "Reply with OK" }
        ],
        max_tokens: 10,
        temperature: 0
      })
    })

    const azureStatus = testResponse.ok ? 'healthy' : 'unhealthy'

    return NextResponse.json({
      status: 'operational',
      azure: azureStatus,
      endpoint: 'azure-direct',
      model: 'gpt-5-chat-01',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      azure: 'unreachable',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}