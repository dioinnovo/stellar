import { NextRequest, NextResponse } from 'next/server'
import { graphRAG } from '@/lib/graphrag'
import { z } from 'zod'

const suggestionSchema = z.object({
  propertyType: z.string().optional(),
  damageTypes: z.array(z.string()).optional(),
  severity: z.string().optional(),
  query: z.string().optional(),
  claimId: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = suggestionSchema.parse(body)

    let suggestions: string[] = []
    let similarClaims: any[] = []
    let knowledgeGraph: any = null

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

    return NextResponse.json({
      success: true,
      data: {
        suggestions,
        similarClaims,
        knowledgeGraph,
        enrichmentCount: suggestions.length
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
  try {
    // Check if ChromaDB is accessible
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