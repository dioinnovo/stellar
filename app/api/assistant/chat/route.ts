/**
 * Specialized API endpoint for Stellar AI Business Copilot
 * Provides intelligent responses with business context and real-time data access
 */

import { NextRequest, NextResponse } from 'next/server'
import { BusinessIntelligenceService } from '@/lib/ai/business-intelligence'
import { buildSystemPrompt, getQuickActionPrompt } from '@/lib/ai/system-prompts'
import { WebSearch, SearchResultProcessor } from '@/lib/ai/web-search'

// Azure OpenAI configuration
const AZURE_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT
const AZURE_API_KEY = process.env.AZURE_OPENAI_KEY
const AZURE_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o-mini'
const API_VERSION = process.env.AZURE_OPENAI_VERSION || '2024-12-01-preview'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface BusinessContext {
  claimData?: any
  financialMetrics?: any
  teamPerformance?: any
  marketIntelligence?: any
  complianceStatus?: any
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, quickAction } = body

    if (!AZURE_ENDPOINT || !AZURE_API_KEY) {
      return NextResponse.json(
        { error: 'AI service not configured properly' },
        { status: 500 }
      )
    }

    // Initialize business intelligence services
    const biService = new BusinessIntelligenceService()
    const webSearch = new WebSearch()

    // Determine user intent and gather relevant context
    const userMessage = messages[messages.length - 1]?.content || ''
    const context = await gatherBusinessContext(userMessage, biService, webSearch)

    // Build enhanced system prompt with current business context
    const systemPrompt = buildSystemPrompt(await buildBusinessContextString(context))

    // Process quick actions if specified
    let enhancedUserMessage = userMessage
    if (quickAction) {
      enhancedUserMessage = getQuickActionPrompt(quickAction, extractClaimId(userMessage))
    }

    // Prepare messages for Azure OpenAI
    const chatMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-10).map((msg: any) => ({ // Keep last 10 messages for context
        role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content
      }))
    ]

    // If this is a new conversation, replace the last user message with enhanced version
    if (enhancedUserMessage !== userMessage) {
      chatMessages[chatMessages.length - 1] = {
        role: 'user',
        content: enhancedUserMessage
      }
    }

    // Call Azure OpenAI API
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

    // Generate context-aware suggestions for follow-up
    const suggestions = generateSmartSuggestions(userMessage, aiResponse, context)

    return NextResponse.json({
      response: aiResponse,
      suggestions,
      context: {
        hasClaimData: !!context.claimData,
        hasFinancialData: !!context.financialMetrics,
        researchConducted: context.researchResults ? true : false
      }
    })

  } catch (error) {
    console.error('Copilot API error:', error)
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
      max_tokens: 1500,
      temperature: 0.7,
      top_p: 0.95,
      frequency_penalty: 0,
      presence_penalty: 0,
      stop: null
    })
  })
}

async function gatherBusinessContext(
  userMessage: string, 
  biService: BusinessIntelligenceService,
  webSearch: WebSearch
): Promise<BusinessContext & { researchResults?: string[] }> {
  const context: BusinessContext & { researchResults?: string[] } = {}
  const messageLower = userMessage.toLowerCase()

  try {
    // Always get financial metrics for business overview
    context.financialMetrics = await biService.getFinancialMetrics()

    // Claim-specific queries
    const claimId = extractClaimId(userMessage)
    if (claimId || messageLower.includes('claim') || messageLower.includes('case')) {
      if (claimId) {
        context.claimData = await biService.getClaimById(claimId)
      } else {
        // Get overview of active claims
        const activeClaims = await biService.getActiveClaims()
        context.claimData = { activeClaims: activeClaims.slice(0, 5) }
      }
    }

    // Performance and team queries
    if (messageLower.includes('team') || messageLower.includes('performance') || messageLower.includes('adjuster')) {
      context.teamPerformance = await biService.getTeamPerformance()
    }

    // Compliance and regulatory queries
    if (messageLower.includes('compliance') || messageLower.includes('regulation') || messageLower.includes('deadline')) {
      context.complianceStatus = await biService.getComplianceStatus()
    }

    // Market intelligence queries
    if (messageLower.includes('market') || messageLower.includes('trend') || messageLower.includes('industry') || messageLower.includes('competitor')) {
      context.marketIntelligence = await biService.getMarketIntelligence()
    }

    // Research queries - when user asks about current events, regulations, or needs web research
    if (shouldConductWebResearch(messageLower)) {
      const researchQuery = buildResearchQuery(userMessage)
      context.researchResults = await webSearch.search(researchQuery, { maxResults: 3 })
    }

  } catch (error) {
    console.error('Error gathering business context:', error)
    // Continue with whatever context we managed to gather
  }

  return context
}

function shouldConductWebResearch(messageLower: string): boolean {
  const researchKeywords = [
    'latest', 'recent', 'current', 'new', 'update', 'trend', 'news',
    'regulation', 'law', 'court', 'ruling', 'decision', 'bulletin',
    'market', 'industry', 'competitor', 'economic', 'inflation'
  ]

  return researchKeywords.some(keyword => messageLower.includes(keyword))
}

function buildResearchQuery(userMessage: string): string {
  const messageLower = userMessage.toLowerCase()
  
  if (messageLower.includes('regulation') || messageLower.includes('law')) {
    return `insurance regulation updates 2024 Florida DOI`
  }
  
  if (messageLower.includes('market') || messageLower.includes('trend')) {
    return `insurance industry trends 2024 market analysis`
  }
  
  if (messageLower.includes('court') || messageLower.includes('ruling')) {
    return `insurance case law 2024 court decisions`
  }
  
  // Default research query
  return `insurance industry ${messageLower.split(' ').slice(-3).join(' ')} 2024`
}

async function buildBusinessContextString(context: BusinessContext): Promise<string> {
  let contextString = '\n## CURRENT BUSINESS STATUS\n'

  if (context.financialMetrics) {
    const metrics = context.financialMetrics
    contextString += `
**Financial Performance**:
- Total Pipeline Value: $${Math.round(metrics.totalPipelineValue / 1000)}K
- Success Rate: ${metrics.successRate}%
- Average Case Duration: ${metrics.averageCaseDuration} days
- Client Satisfaction: ${metrics.clientSatisfactionScore}/5.0
- Settlement Increase Average: ${metrics.averageSettlementIncrease}%
`
  }

  if (context.claimData) {
    if (context.claimData.id) {
      // Specific claim data
      const claim = context.claimData
      contextString += `
**Active Claim Context**:
- Claim ID: ${claim.id}
- Client: ${claim.clientName}
- Status: ${claim.status}
- Target Settlement: $${claim.targetSettlement?.toLocaleString()}
- Current Phase: ${claim.phase}
- Progress: ${claim.progressPercent}%
`
    } else if (context.claimData.activeClaims) {
      // Overview of active claims
      const count = context.claimData.activeClaims.length
      contextString += `
**Active Claims Overview**:
- Total Active Claims: ${count}
- High-value claims in pipeline
- Multiple claims in negotiation phase
`
    }
  }

  if (context.teamPerformance) {
    const team = context.teamPerformance
    contextString += `
**Team Performance**:
- Active Adjusters: ${team.totalAdjusters}
- Average Caseload: ${team.averageCaseLoad} cases
- Top Performer: ${team.topPerformer}
- Productivity Trend: ${team.productivityTrend}
`
  }

  if (context.complianceStatus) {
    const compliance = context.complianceStatus
    contextString += `
**Compliance Status**:
- Compliance Score: ${compliance.complianceScore}%
- Active Deadlines: ${compliance.activeDeadlines.length}
- Risk Areas: ${compliance.riskAreas.join(', ')}
`
  }

  return contextString
}

function extractClaimId(message: string): string | null {
  // Look for claim ID patterns like CP-2024-94782, RP-2024-94783
  const claimIdMatch = message.match(/[CR]P-\d{4}-\d{5}/i)
  return claimIdMatch ? claimIdMatch[0] : null
}

function generateSmartSuggestions(
  userMessage: string, 
  aiResponse: string, 
  context: BusinessContext
): string[] {
  const suggestions: string[] = []
  const messageLower = userMessage.toLowerCase()
  const responseLower = aiResponse.toLowerCase()

  // Claim-specific suggestions
  if (context.claimData?.id) {
    suggestions.push(
      `Show negotiation timeline for ${context.claimData.id}`,
      `What documents are needed for ${context.claimData.id}?`,
      `Calculate max settlement for ${context.claimData.id}`
    )
  }

  // Financial analysis suggestions
  if (messageLower.includes('revenue') || responseLower.includes('settlement')) {
    suggestions.push(
      'Show quarterly performance comparison',
      'Which claims have highest ROI potential?',
      'Analyze profit margins by claim type'
    )
  }

  // Team performance suggestions
  if (messageLower.includes('team') || messageLower.includes('adjuster')) {
    suggestions.push(
      'Show adjuster productivity rankings',
      'What training needs does the team have?',
      'How can we optimize case assignments?'
    )
  }

  // Market research suggestions
  if (messageLower.includes('market') || messageLower.includes('trend')) {
    suggestions.push(
      'Research competitor strategies',
      'Find recent regulatory changes',
      'Analyze industry benchmarks'
    )
  }

  // Compliance suggestions  
  if (messageLower.includes('compliance') || messageLower.includes('regulation')) {
    suggestions.push(
      'Check upcoming deadlines',
      'Review regulatory updates',
      'Audit claim documentation'
    )
  }

  // Default suggestions if none of the above apply
  if (suggestions.length === 0) {
    suggestions.push(
      'Show current claim pipeline',
      'Analyze team performance',
      'Research market trends',
      'Check compliance status'
    )
  }

  return suggestions.slice(0, 4) // Return max 4 suggestions
}