/**
 * Stella Claims API - Policy Intelligence & Claims Analysis
 * Internal endpoint for public adjusters to analyze policies comprehensively
 */

import { NextRequest, NextResponse } from 'next/server'
import { BusinessIntelligenceService } from '@/lib/ai/business-intelligence'
import { buildStellaClaimsPrompt, getStellaClaimsQuickAction } from '@/lib/ai/prompts/stella-claims-prompt'
import { WebSearch, SearchResultProcessor } from '@/lib/ai/web-search'

// Azure OpenAI configuration - Using more capable model for policy analysis
const AZURE_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT
const AZURE_API_KEY = process.env.AZURE_OPENAI_KEY
const AZURE_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT_GPT4O || process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o-mini' // Use advanced model for analysis
const API_VERSION = process.env.AZURE_OPENAI_VERSION || '2024-12-01-preview'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface PolicyContext {
  policyData?: any
  claimData?: any
  coverageAnalysis?: any
  complianceStatus?: any
  settlementOpportunities?: any
  researchResults?: string[]
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, quickAction, generateTitle, policyDocument } = body

    if (!AZURE_ENDPOINT || !AZURE_API_KEY) {
      return NextResponse.json(
        { error: 'AI service not configured properly' },
        { status: 500 }
      )
    }

    // Initialize services
    const biService = new BusinessIntelligenceService()
    const webSearch = new WebSearch()

    // Determine user intent and gather relevant context
    const userMessage = messages[messages.length - 1]?.content || ''
    const context = await gatherPolicyContext(userMessage, biService, webSearch, policyDocument)

    // Check if this is the first message and no policy is uploaded
    const isFirstMessage = messages.length === 1
    const hasNoPolicyDocument = !policyDocument && !context.policyData?.documentProvided

    // Build enhanced system prompt with policy analysis focus
    const systemPrompt = buildStellaClaimsPrompt(await buildPolicyContextString(context))

    // Process quick actions if specified
    let enhancedUserMessage = userMessage
    if (quickAction) {
      const claimId = extractClaimId(userMessage)
      const policyNumber = extractPolicyNumber(userMessage)
      const contextParams = {
        ...(claimId && { claimId }),
        ...(policyNumber && { policyNumber })
      }
      enhancedUserMessage = getStellaClaimsQuickAction(quickAction, contextParams)
    }

    // Prepare messages for Azure OpenAI
    const chatMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-10).map((msg: any) => ({
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

    // Call Azure OpenAI API with enhanced parameters for policy analysis
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

    // Generate context-aware suggestions for policy analysis
    const suggestions = generatePolicyAnalysisSuggestions(userMessage, aiResponse, context)

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
              content: 'Generate a brief title (max 30 chars) summarizing the policy analysis topic. Output only the title.'
            },
            ...messages.slice(-3)
          ],
          max_tokens: 20,
          temperature: 0.5
        })
      })

      if (titleResponse.ok) {
        const titleData = await titleResponse.json()
        title = titleData.choices[0]?.message?.content?.trim().substring(0, 30)
      }
    }

    return NextResponse.json({
      response: aiResponse,
      suggestions,
      title,
      context: {
        hasPolicyData: !!context.policyData,
        hasClaimData: !!context.claimData,
        hasCoverageAnalysis: !!context.coverageAnalysis,
        researchConducted: !!context.researchResults,
        settlementOpportunities: context.settlementOpportunities ? Object.keys(context.settlementOpportunities).length : 0
      }
    })

  } catch (error) {
    console.error('Stella Claims API error:', error)
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
      max_tokens: 3000, // Increased for comprehensive policy analysis
      temperature: 0.5, // Lower temperature for more precise analysis
      top_p: 0.95,
      frequency_penalty: 0,
      presence_penalty: 0,
      stop: null
    })
  })
}

async function gatherPolicyContext(
  userMessage: string,
  biService: BusinessIntelligenceService,
  webSearch: WebSearch,
  policyDocument?: any
): Promise<PolicyContext> {
  const context: PolicyContext = {}
  const messageLower = userMessage.toLowerCase()

  try {
    // Policy document analysis if provided
    if (policyDocument) {
      context.policyData = {
        documentProvided: true,
        type: policyDocument.type || 'homeowners',
        carrier: policyDocument.carrier,
        policyNumber: policyDocument.number,
        effectiveDates: policyDocument.dates,
        limits: policyDocument.limits
      }
    }

    // Coverage analysis queries
    if (messageLower.includes('coverage') || messageLower.includes('policy') || messageLower.includes('limit')) {
      context.coverageAnalysis = {
        requestedAnalysis: true,
        focusAreas: extractCoverageFocusAreas(messageLower)
      }
    }

    // Settlement opportunity analysis
    if (messageLower.includes('opportunity') || messageLower.includes('maximize') || messageLower.includes('settlement')) {
      context.settlementOpportunities = await identifySettlementOpportunities(messageLower, biService)
    }

    // Claim-specific queries
    const claimId = extractClaimId(userMessage)
    if (claimId || messageLower.includes('claim')) {
      if (claimId) {
        context.claimData = await biService.getClaimById(claimId)
      } else {
        const activeClaims = await biService.getActiveClaims()
        context.claimData = { activeClaims: activeClaims.slice(0, 5) }
      }
    }

    // Compliance and regulatory queries
    if (messageLower.includes('compliance') || messageLower.includes('regulation') || messageLower.includes('adjuster')) {
      context.complianceStatus = await biService.getComplianceStatus()
      // Add state-specific PA requirements
      context.complianceStatus.publicAdjusterRequirements = {
        licensing: 'verified',
        feeStructure: 'compliant',
        disclosures: 'complete'
      }
    }

    // Research queries for policy interpretation and case law
    if (shouldConductPolicyResearch(messageLower)) {
      const researchQuery = buildPolicyResearchQuery(userMessage)
      context.researchResults = await webSearch.search(researchQuery, { maxResults: 5 })
    }

  } catch (error) {
    console.error('Error gathering policy context:', error)
  }

  return context
}

function shouldConductPolicyResearch(messageLower: string): boolean {
  const researchKeywords = [
    'case law', 'precedent', 'court', 'ruling', 'decision',
    'regulation', 'statute', 'code', 'ordinance', 'law',
    'interpretation', 'coverage dispute', 'bad faith',
    'appraisal', 'public adjuster', 'state requirement'
  ]

  return researchKeywords.some(keyword => messageLower.includes(keyword))
}

function buildPolicyResearchQuery(userMessage: string): string {
  const messageLower = userMessage.toLowerCase()

  if (messageLower.includes('bad faith')) {
    return 'insurance bad faith claim indicators case law 2024'
  }

  if (messageLower.includes('appraisal')) {
    return 'insurance appraisal process invoke strategy 2024'
  }

  if (messageLower.includes('public adjuster')) {
    return 'public adjuster state requirements licensing 2024'
  }

  if (messageLower.includes('coverage dispute')) {
    return 'insurance coverage dispute resolution precedent 2024'
  }

  // Default policy research query
  return `insurance policy interpretation ${messageLower.split(' ').slice(-3).join(' ')} 2024`
}

function extractCoverageFocusAreas(messageLower: string): string[] {
  const areas = []

  if (messageLower.includes('water') || messageLower.includes('flood')) areas.push('water_damage')
  if (messageLower.includes('wind') || messageLower.includes('hurricane')) areas.push('wind_damage')
  if (messageLower.includes('mold')) areas.push('mold_remediation')
  if (messageLower.includes('ale') || messageLower.includes('living')) areas.push('additional_living_expenses')
  if (messageLower.includes('code') || messageLower.includes('ordinance')) areas.push('code_upgrades')
  if (messageLower.includes('business')) areas.push('business_interruption')
  if (messageLower.includes('deductible')) areas.push('deductible_analysis')

  return areas.length > 0 ? areas : ['comprehensive']
}

async function identifySettlementOpportunities(
  messageLower: string,
  biService: BusinessIntelligenceService
): Promise<any> {
  const opportunities: Record<string, string[]> = {}

  // Hidden coverages
  opportunities['hidden_coverages'] = [
    'Ordinance and Law Coverage',
    'Debris Removal',
    'Trees/Shrubs/Plants',
    'Fire Department Service Charges',
    'Loss Assessment Coverage'
  ]

  // Code upgrades
  if (messageLower.includes('code') || messageLower.includes('upgrade')) {
    opportunities['code_upgrades'] = [
      'Building Code Compliance',
      'ADA Requirements',
      'Energy Efficiency Upgrades',
      'Hurricane Mitigation Requirements'
    ]
  }

  // ALE maximization
  opportunities['ale_maximization'] = [
    'Temporary Housing',
    'Increased Food Costs',
    'Storage Fees',
    'Pet Boarding',
    'Transportation Increases'
  ]

  return opportunities
}

async function buildPolicyContextString(context: PolicyContext): Promise<string> {
  let contextString = '\n## CURRENT ANALYSIS CONTEXT\n'

  // CRITICAL: Check if no policy document is provided
  if (!context.policyData || !context.policyData.documentProvided) {
    contextString += `
**IMPORTANT**: No policy document has been uploaded.
- You MUST request the user to upload their policy document
- DO NOT ask them to manually provide policy details
- DO NOT list out the 13-point checklist for them to fill
- Simply ask them to upload the policy so you can analyze it
`
    return contextString
  }

  if (context.policyData) {
    contextString += `
**Policy Information**:
- Type: ${context.policyData.type}
- Carrier: ${context.policyData.carrier || 'Not specified'}
- Policy Number: ${context.policyData.policyNumber || 'Not provided'}
- Effective Dates: ${context.policyData.effectiveDates || 'Review needed'}
`
  }

  if (context.coverageAnalysis) {
    contextString += `
**Coverage Analysis Focus**:
- Requested Areas: ${context.coverageAnalysis.focusAreas.join(', ')}
- Comprehensive Review: ${context.coverageAnalysis.requestedAnalysis ? 'Yes' : 'No'}
`
  }

  if (context.settlementOpportunities) {
    const oppCount = Object.values(context.settlementOpportunities).flat().length
    contextString += `
**Settlement Opportunities Identified**:
- Total Opportunities: ${oppCount}
- Categories: ${Object.keys(context.settlementOpportunities).join(', ')}
`
  }

  if (context.claimData) {
    if (context.claimData.id) {
      const claim = context.claimData
      contextString += `
**Active Claim Data**:
- Claim ID: ${claim.id}
- Client: ${claim.clientName}
- Status: ${claim.status}
- Target Settlement: $${claim.targetSettlement?.toLocaleString()}
- Current Phase: ${claim.phase}
`
    }
  }

  if (context.complianceStatus) {
    contextString += `
**Compliance & Regulatory Status**:
- Public Adjuster Authorization: ${context.complianceStatus.publicAdjusterRequirements?.licensing || 'Verify'}
- Fee Structure: ${context.complianceStatus.publicAdjusterRequirements?.feeStructure || 'Review needed'}
- Required Disclosures: ${context.complianceStatus.publicAdjusterRequirements?.disclosures || 'Check state requirements'}
`
  }

  if (context.researchResults && context.researchResults.length > 0) {
    contextString += `
**Research Findings**:
- Sources Reviewed: ${context.researchResults.length}
- Topics: Policy interpretation, case law, regulatory updates
`
  }

  return contextString
}

function extractClaimId(message: string): string | null {
  const claimIdMatch = message.match(/[CR]P-\d{4}-\d{5}/i)
  return claimIdMatch ? claimIdMatch[0] : null
}

function extractPolicyNumber(message: string): string | null {
  const policyMatch = message.match(/POL-\d{6,}/i)
  return policyMatch ? policyMatch[0] : null
}

function generatePolicyAnalysisSuggestions(
  userMessage: string,
  aiResponse: string,
  context: PolicyContext
): string[] {
  const suggestions: string[] = []
  const messageLower = userMessage.toLowerCase()
  const responseLower = aiResponse.toLowerCase()

  // If no policy document is provided, suggest upload-related actions
  if (!context.policyData || !context.policyData.documentProvided) {
    return [
      'Upload my insurance policy',
      'Share a link to my policy',
      'Take a photo of my policy',
      'Help me find my policy'
    ]
  }

  // Policy analysis suggestions
  if (messageLower.includes('policy') || responseLower.includes('coverage')) {
    suggestions.push(
      'Perform comprehensive 13-point policy review',
      'Identify all hidden coverage opportunities',
      'Review exclusions and endorsements',
      'Calculate maximum settlement potential'
    )
  }

  // Coverage specific suggestions
  if (messageLower.includes('water') || messageLower.includes('mold')) {
    suggestions.push(
      'Analyze water damage coverage limits',
      'Review mold remediation sublimits',
      'Check for gradual leak exclusions',
      'Identify EMS/dry-out coverage'
    )
  }

  // Settlement maximization suggestions
  if (messageLower.includes('maximize') || messageLower.includes('settlement')) {
    suggestions.push(
      'Generate settlement maximization strategy',
      'Identify bad faith indicators',
      'Review appraisal provisions',
      'Calculate code upgrade benefits'
    )
  }

  // Compliance suggestions
  if (messageLower.includes('compliance') || messageLower.includes('adjuster')) {
    suggestions.push(
      'Verify PA authorization for this state',
      'Check fee structure compliance',
      'Review required disclosures',
      'Confirm statute of limitations'
    )
  }

  // Documentation suggestions
  if (messageLower.includes('document') || responseLower.includes('proof')) {
    suggestions.push(
      'Generate documentation checklist',
      'List expert reports needed',
      'Identify missing evidence',
      'Create proof of loss timeline'
    )
  }

  // Default suggestions if none of the above apply
  if (suggestions.length === 0) {
    suggestions.push(
      'Perform full policy review',
      'Find coverage opportunities',
      'Review deductibles and limits',
      'Check compliance requirements'
    )
  }

  return suggestions.slice(0, 4)
}