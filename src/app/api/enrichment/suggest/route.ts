import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const suggestionSchema = z.object({
  propertyType: z.string().optional(),
  damageTypes: z.array(z.string()).optional(),
  severity: z.string().optional(),
  query: z.string().optional(),
  claimId: z.string().optional()
})

// Fallback suggestions when GraphRAG is not available
const getFallbackSuggestions = (propertyType?: string, damageTypes?: string[], severity?: string): string[] => {
  const baseSuggestions = [
    'Document all visible damage with photos',
    'Check for hidden water damage',
    'Get contractor estimates for repairs',
    'Review your insurance policy coverage',
    'Keep receipts for emergency repairs',
    'Create inventory of damaged items'
  ]

  if (damageTypes?.some(d => d.toLowerCase().includes('water'))) {
    baseSuggestions.push('Test for mold and moisture', 'Check electrical systems safety')
  }

  if (damageTypes?.some(d => d.toLowerCase().includes('wind'))) {
    baseSuggestions.push('Inspect roof and gutters', 'Check for loose siding')
  }

  if (severity === 'Major' || severity === 'Total Loss') {
    baseSuggestions.push('Consider temporary housing', 'Document safety hazards')
  }

  return baseSuggestions.slice(0, 6)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = suggestionSchema.parse(body)

    let suggestions: string[] = []
    let similarClaims: any[] = []
    let knowledgeGraph: any = null
    let isUsingFallback = false

    // Always use fallback in Vercel serverless to avoid heavy imports
    if (process.env.VERCEL === '1') {
      console.log('Using fallback suggestions in Vercel serverless environment')
      isUsingFallback = true
      suggestions = getFallbackSuggestions(validated.propertyType, validated.damageTypes, validated.severity)

      return NextResponse.json({
        success: true,
        data: {
          suggestions,
          similarClaims: [],
          knowledgeGraph: null,
          enrichmentCount: suggestions.length,
          isUsingFallback,
          note: 'Serverless mode: Using enhanced fallback suggestions. GraphRAG processing handled asynchronously.'
        }
      })
    }

    // Try to use GraphRAG if available (not in Vercel serverless)
    if (process.env.VERCEL !== '1') {
      try {
        const { graphRAG } = await import('@/lib/graphrag')

        // Get inspection suggestions
        if (validated.propertyType && validated.damageTypes) {
          suggestions = await graphRAG.getInspectionSuggestions(
            validated.propertyType,
            validated.damageTypes,
            validated.severity || 'moderate'
          )
        }

        // Enrich existing claim
        if (validated.claimId) {
          await graphRAG.enrichClaim(validated.claimId)

          // Get enrichments from database
          const { prisma } = await import('@/lib/db')
          const enrichments = await prisma.enrichment.findMany({
            where: {
              claimId: validated.claimId,
              type: 'suggestion'
            },
            orderBy: { createdAt: 'desc' },
            take: 6
          })

          suggestions = enrichments.map(e => {
            const content = JSON.parse(e.content)
            return content.text
          })

          // Get similar claims
          const similarEnrichment = await prisma.enrichment.findFirst({
            where: {
              claimId: validated.claimId,
              type: 'similar_claims'
            }
          })

          if (similarEnrichment) {
            similarClaims = JSON.parse(similarEnrichment.content)
          }
        }

        // Query knowledge graph
        if (validated.query) {
          knowledgeGraph = await graphRAG.queryKnowledgeGraph(validated.query)
        }
      } catch (error) {
        console.log('GraphRAG not available, using fallback suggestions:', error)
        isUsingFallback = true
        suggestions = getFallbackSuggestions(validated.propertyType, validated.damageTypes, validated.severity)
      }
    } else {
      // Always use fallback in Vercel serverless
      console.log('Using fallback suggestions in Vercel serverless environment')
      isUsingFallback = true
      suggestions = getFallbackSuggestions(validated.propertyType, validated.damageTypes, validated.severity)
    }

    return NextResponse.json({
      success: true,
      data: {
        suggestions,
        similarClaims,
        knowledgeGraph,
        enrichmentCount: suggestions.length,
        isUsingFallback,
        note: isUsingFallback ? 'Using fallback suggestions (GraphRAG not available in serverless)' : undefined
      }
    })

  } catch (error) {
    console.error('Enrichment error:', error)
    
    // Return mock data if GraphRAG fails
    if (error instanceof Error && error.message.includes('ChromaDB')) {
      return NextResponse.json({
        success: true,
        data: {
          suggestions: [
            'Document all visible damage with photos',
            'Check for hidden water damage',
            'Get contractor estimates for repairs',
            'Review your insurance policy coverage',
            'Keep receipts for emergency repairs',
            'Create inventory of damaged items'
          ],
          similarClaims: [],
          knowledgeGraph: null,
          enrichmentCount: 6,
          note: 'Using fallback suggestions (ChromaDB not available)'
        }
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to generate suggestions'
    }, { status: 500 })
  }
}

// GET endpoint to check GraphRAG status
export async function GET() {
  // Always return degraded status in Vercel serverless
  if (process.env.VERCEL === '1') {
    return NextResponse.json({
      success: true,
      data: {
        status: 'fallback',
        claimsIndexed: 0,
        vectorDatabase: 'ChromaDB (not available in serverless)',
        embeddingModel: 'none',
        message: 'GraphRAG using fallback mode in Vercel serverless environment'
      }
    })
  }

  try {
    // Check if ChromaDB is accessible (only in non-serverless environments)
    const { graphRAG } = await import('@/lib/graphrag')
    const collection = await graphRAG.getCollection()
    const count = await collection.count()

    return NextResponse.json({
      success: true,
      data: {
        status: 'operational',
        claimsIndexed: count,
        vectorDatabase: 'ChromaDB',
        embeddingModel: process.env.OPENAI_API_KEY ? 'text-embedding-3-small' : 'none'
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: true,
      data: {
        status: 'degraded',
        claimsIndexed: 0,
        vectorDatabase: 'ChromaDB (offline)',
        embeddingModel: 'none',
        message: 'GraphRAG running in fallback mode'
      }
    })
  }
}