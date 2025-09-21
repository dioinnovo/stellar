/**
 * Stella Leads API - Lead Generation & Qualification
 * Public-facing endpoint for converting website visitors into qualified leads
 */

import { NextRequest, NextResponse } from 'next/server'
import { buildStellaLeadsPrompt, getStellaLeadsQuickAction } from '@/lib/ai/prompts/stella-leads-prompt'

// Azure OpenAI configuration - Optimized for conversational lead generation
const AZURE_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT
const AZURE_API_KEY = process.env.AZURE_OPENAI_KEY
const AZURE_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o-mini' // Fast, efficient model
const API_VERSION = process.env.AZURE_OPENAI_VERSION || '2024-12-01-preview'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface LeadContext {
  propertyType?: string
  damageType?: string
  claimValue?: number
  insuranceCompany?: string
  currentOffer?: number
  frustrationLevel?: string
  timelinePressure?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, quickAction, generateTitle } = body

    if (!AZURE_ENDPOINT || !AZURE_API_KEY) {
      return NextResponse.json(
        { error: 'AI service not configured properly' },
        { status: 500 }
      )
    }

    // Determine user intent and gather lead context
    const userMessage = messages[messages.length - 1]?.content || ''
    const context = await gatherLeadContext(userMessage)

    // Build lead generation focused system prompt
    const systemPrompt = buildStellaLeadsPrompt(buildLeadContextString(context))

    // Process quick actions if specified
    let enhancedUserMessage = userMessage
    if (quickAction) {
      enhancedUserMessage = getStellaLeadsQuickAction(quickAction, context as any)
    }

    // Prepare messages for Azure OpenAI
    const chatMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-5).map((msg: any) => ({ // Keep last 5 messages for context
        role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content
      }))
    ]

    // Replace last user message with enhanced version if needed
    if (enhancedUserMessage !== userMessage) {
      chatMessages[chatMessages.length - 1] = {
        role: 'user',
        content: enhancedUserMessage
      }
    }

    // Call Azure OpenAI API with lead generation optimized parameters
    const response = await callAzureOpenAI(chatMessages)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Azure OpenAI error:', errorText)
      return NextResponse.json(
        { error: 'Failed to get AI response' },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Extract the AI response
    const aiResponse = data.choices?.[0]?.message?.content

    if (!aiResponse) {
      return NextResponse.json(
        { error: 'Invalid response from AI service' },
        { status: 500 }
      )
    }

    // Generate context-aware lead qualification suggestions
    const suggestions = generateLeadSuggestions(userMessage, aiResponse, context)

    // Generate title if requested
    let title = undefined
    if (generateTitle) {
      const titleResponse = await fetch(`${AZURE_ENDPOINT}/openai/deployments/${AZURE_DEPLOYMENT}/chat/completions?api-version=${API_VERSION}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': AZURE_API_KEY!,
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'Generate a brief title (max 30 chars) for this lead conversation. Output only the title.'
            },
            ...messages.slice(-3)
          ],
          max_tokens: 20,
          temperature: 0.7
        })
      })

      if (titleResponse.ok) {
        const titleData = await titleResponse.json()
        title = titleData.choices[0]?.message?.content?.trim().substring(0, 30)
      }
    }

    // Assess lead quality
    const leadQuality = assessLeadQuality(context)

    return NextResponse.json({
      response: aiResponse,
      suggestions,
      title,
      leadQuality,
      context: {
        qualified: leadQuality.qualified,
        score: leadQuality.score,
        urgency: context.timelinePressure || false,
        claimValue: context.claimValue
      }
    })

  } catch (error) {
    console.error('Stella Leads API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function callAzureOpenAI(messages: ChatMessage[]) {
  const url = `${AZURE_ENDPOINT}/openai/deployments/${AZURE_DEPLOYMENT}/chat/completions?api-version=${API_VERSION}`

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': AZURE_API_KEY!,
    },
    body: JSON.stringify({
      messages,
      max_tokens: 1500, // Shorter responses for engagement
      temperature: 0.7, // More conversational
      top_p: 0.95,
      frequency_penalty: 0,
      presence_penalty: 0,
      stop: null
    })
  })
}

async function gatherLeadContext(userMessage: string): Promise<LeadContext> {
  const context: LeadContext = {}
  const messageLower = userMessage.toLowerCase()

  // Property type identification
  if (messageLower.includes('home') || messageLower.includes('house')) {
    context.propertyType = 'residential'
  } else if (messageLower.includes('business') || messageLower.includes('commercial')) {
    context.propertyType = 'commercial'
  } else if (messageLower.includes('condo')) {
    context.propertyType = 'condominium'
  }

  // Damage type identification
  if (messageLower.includes('hurricane') || messageLower.includes('storm')) {
    context.damageType = 'hurricane'
  } else if (messageLower.includes('water') || messageLower.includes('flood')) {
    context.damageType = 'water'
  } else if (messageLower.includes('fire') || messageLower.includes('smoke')) {
    context.damageType = 'fire'
  } else if (messageLower.includes('wind') || messageLower.includes('tornado')) {
    context.damageType = 'wind'
  } else if (messageLower.includes('theft') || messageLower.includes('vandal')) {
    context.damageType = 'theft_vandalism'
  }

  // Extract potential claim value
  const valueMatch = messageLower.match(/\$?(\d{1,3},?\d{3,}|\d{4,})/g)
  if (valueMatch) {
    const value = parseInt(valueMatch[0].replace(/[$,]/g, ''))
    context.claimValue = value
  }

  // Identify insurance company if mentioned
  const insurers = ['state farm', 'allstate', 'geico', 'progressive', 'farmers', 'liberty', 'nationwide', 'travelers', 'usaa', 'american family']
  for (const insurer of insurers) {
    if (messageLower.includes(insurer)) {
      context.insuranceCompany = insurer
      break
    }
  }

  // Assess frustration level (key indicator for conversion)
  if (messageLower.includes('frustrated') || messageLower.includes('angry') || messageLower.includes('upset')) {
    context.frustrationLevel = 'high'
  } else if (messageLower.includes('confused') || messageLower.includes('unsure') || messageLower.includes('worried')) {
    context.frustrationLevel = 'medium'
  } else if (messageLower.includes('lowball') || messageLower.includes('denied') || messageLower.includes('delayed')) {
    context.frustrationLevel = 'high'
    context.timelinePressure = true
  }

  // Timeline pressure indicators
  if (messageLower.includes('deadline') || messageLower.includes('running out') || messageLower.includes('expires')) {
    context.timelinePressure = true
  }

  // Current offer detection
  if (messageLower.includes('offered') || messageLower.includes('settlement')) {
    const offerMatch = messageLower.match(/offered?\s+\$?(\d{1,3},?\d{3,}|\d{4,})/g)
    if (offerMatch) {
      const offer = parseInt(offerMatch[0].replace(/[^\d]/g, ''))
      context.currentOffer = offer
    }
  }

  return context
}

function buildLeadContextString(context: LeadContext): string {
  let contextString = '\n## LEAD QUALIFICATION CONTEXT\n'

  if (context.propertyType) {
    contextString += `- Property Type: ${context.propertyType}\n`
  }

  if (context.damageType) {
    contextString += `- Damage Type: ${context.damageType}\n`
  }

  if (context.claimValue) {
    contextString += `- Potential Claim Value: $${context.claimValue.toLocaleString()}\n`
  }

  if (context.insuranceCompany) {
    contextString += `- Insurance Company: ${context.insuranceCompany}\n`
  }

  if (context.currentOffer) {
    contextString += `- Current Offer: $${context.currentOffer.toLocaleString()} (LIKELY LOWBALL)\n`
  }

  if (context.frustrationLevel) {
    contextString += `- Frustration Level: ${context.frustrationLevel} (CONVERSION OPPORTUNITY)\n`
  }

  if (context.timelinePressure) {
    contextString += `- Timeline Pressure: YES (CREATE URGENCY)\n`
  }

  return contextString
}

function assessLeadQuality(context: LeadContext): {
  qualified: boolean
  score: number
  reasons: string[]
} {
  let score = 0
  const reasons: string[] = []

  // Claim value assessment (most important)
  if (context.claimValue) {
    if (context.claimValue >= 50000) {
      score += 40
      reasons.push('High-value claim')
    } else if (context.claimValue >= 25000) {
      score += 30
      reasons.push('Moderate-value claim')
    } else if (context.claimValue >= 10000) {
      score += 20
      reasons.push('Qualifying claim value')
    } else {
      score += 5
      reasons.push('Below minimum threshold')
    }
  }

  // Current offer indicates lowball
  if (context.currentOffer && context.claimValue) {
    const offerRatio = context.currentOffer / context.claimValue
    if (offerRatio < 0.5) {
      score += 25
      reasons.push('Significant lowball offer')
    } else if (offerRatio < 0.7) {
      score += 15
      reasons.push('Below fair offer')
    }
  }

  // Frustration level (conversion indicator)
  if (context.frustrationLevel === 'high') {
    score += 20
    reasons.push('High frustration with insurer')
  } else if (context.frustrationLevel === 'medium') {
    score += 10
    reasons.push('Moderate frustration')
  }

  // Timeline pressure
  if (context.timelinePressure) {
    score += 10
    reasons.push('Time-sensitive situation')
  }

  // Damage type (complexity indicator)
  if (context.damageType === 'hurricane' || context.damageType === 'fire') {
    score += 5
    reasons.push('Complex damage type')
  }

  const qualified = score >= 50 || (!!context.claimValue && context.claimValue >= 10000)

  return {
    qualified,
    score,
    reasons
  }
}

function generateLeadSuggestions(
  userMessage: string,
  aiResponse: string,
  context: LeadContext
): string[] {
  const suggestions: string[] = []
  const messageLower = userMessage.toLowerCase()

  // Qualification-based suggestions
  if (!context.claimValue) {
    suggestions.push("What's the estimated value of your property damage?")
  }

  if (!context.currentOffer) {
    suggestions.push("What has your insurance company offered so far?")
  }

  if (!context.damageType) {
    suggestions.push("What type of damage occurred to your property?")
  }

  // Conversion-focused suggestions
  if (context.frustrationLevel === 'high') {
    suggestions.push("Schedule a free claim review today")
    suggestions.push("See examples of similar cases we've won")
  }

  // Urgency-based suggestions
  if (context.timelinePressure) {
    suggestions.push("Understand your claim deadlines")
    suggestions.push("Get emergency assistance now")
  }

  // Value-based suggestions
  if (context.claimValue && context.claimValue >= 25000) {
    suggestions.push("Calculate your true claim value")
    suggestions.push("Learn about hidden coverage benefits")
  }

  // Default conversion suggestions
  if (suggestions.length < 2) {
    suggestions.push(
      "Get your free claim review",
      "Learn how we can help",
      "See our success stories",
      "Understand your rights"
    )
  }

  return suggestions.slice(0, 4)
}