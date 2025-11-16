// Mock ChromaDB types for demo environment
interface Collection {
  add: (data: any) => Promise<void>
  query: (params: any) => Promise<any>
  count: () => Promise<number>
}

interface ChromaClient {
  getCollection: (params: any) => Promise<Collection>
  createCollection: (params: any) => Promise<Collection>
}

// Mock imports for demo environment
import { prisma } from './db'

// Mock Claim type for demo environment
interface Claim {
  id: string
  claimNumber: string
  type: string
  propertyAddress: string
  damageType?: string | null
  severity?: string | null
  damageDescription?: string | null
  estimatedAmount?: number | null
  submittedAt: Date
  fraudScore?: number | null
}

// GraphRAG system for context enrichment and knowledge graph
export class GraphRAG {
  private client: ChromaClient
  private collection: Collection | null = null
  private embeddingFunction: any | null = null

  constructor() {
    // Mock ChromaDB client for demo environment
    this.client = {
      getCollection: async (params: any) => this.createMockCollection(),
      createCollection: async (params: any) => this.createMockCollection()
    } as ChromaClient

    // Initialize embedding function if OpenAI key is available
    if (process.env.OPENAI_API_KEY) {
      // Use default embedding function or create a custom one
      this.embeddingFunction = null // Will be set during collection creation
    }
  }

  private createMockCollection(): Collection {
    return {
      add: async (data: any) => {
        console.log('Mock ChromaDB: Adding data to collection')
      },
      query: async (params: any) => {
        console.log('Mock ChromaDB: Querying collection')
        return {
          documents: [[]],
          metadatas: [[]],
          distances: [[]]
        }
      },
      count: async () => {
        console.log('Mock ChromaDB: Counting documents')
        return 0
      }
    }
  }

  // Initialize or get the collection
  async getCollection(): Promise<Collection> {
    if (!this.collection) {
      try {
        // Try to get existing collection
        this.collection = await this.client.getCollection({
          name: 'stellar-claims',
          embeddingFunction: this.embeddingFunction
        })
      } catch {
        // Create new collection if it doesn't exist
        this.collection = await this.client.createCollection({
          name: 'stellar-claims',
          embeddingFunction: this.embeddingFunction
        })
      }
    }
    return this.collection
  }

  // Embed a claim into the vector database
  async embedClaim(claim: Claim): Promise<void> {
    const collection = await this.getCollection()
    
    // Create text representation of the claim
    const claimText = `
      Type: ${claim.type}
      Property: ${claim.propertyAddress}
      Damage: ${claim.damageType}
      Severity: ${claim.severity}
      Description: ${claim.damageDescription || ''}
      Estimate: $${claim.estimatedAmount || 0}
    `.trim()

    // Add to collection
    await collection.add({
      ids: [claim.id],
      documents: [claimText],
      metadatas: [{
        claimNumber: claim.claimNumber,
        type: claim.type,
        damageType: claim.damageType || '',
        severity: claim.severity || '',
        estimatedAmount: claim.estimatedAmount || 0,
        propertyAddress: claim.propertyAddress,
        submittedAt: claim.submittedAt.toISOString()
      }]
    })
  }

  // Find similar claims based on a query
  async findSimilarClaims(
    query: string,
    filters?: Record<string, any>,
    limit: number = 5
  ): Promise<any[]> {
    const collection = await this.getCollection()
    
    const results = await collection.query({
      queryTexts: [query],
      nResults: limit,
      where: filters
    })

    return results.metadatas[0] || []
  }

  // Generate context-aware suggestions
  async generateSuggestions(claim: Partial<Claim>): Promise<string[]> {
    const suggestions: string[] = []

    // Base suggestions based on damage type
    const damageTypeSuggestions: Record<string, string[]> = {
      'Hurricane': [
        'Document wind speed at time of damage',
        'Check for hidden water damage',
        'Inspect roof anchoring systems',
        'Verify building code compliance',
        'Document debris impact points'
      ],
      'Wind': [
        'Photograph all missing shingles',
        'Check gutters and downspouts',
        'Inspect siding and trim',
        'Document interior water stains',
        'Verify window seal integrity'
      ],
      'Water': [
        'Measure moisture levels in walls',
        'Check for mold growth',
        'Document source of water intrusion',
        'Inspect electrical systems',
        'Test HVAC functionality'
      ],
      'Fire': [
        'Document smoke damage extent',
        'List damaged personal property',
        'Check structural integrity',
        'Test electrical systems',
        'Assess HVAC contamination'
      ],
      'Flood': [
        'Mark high water lines',
        'Document contamination type',
        'Check foundation damage',
        'Inspect electrical panels',
        'Assess soil erosion'
      ]
    }

    // Add damage-specific suggestions
    if (claim.damageType) {
      for (const [key, value] of Object.entries(damageTypeSuggestions)) {
        if (claim.damageType.toLowerCase().includes(key.toLowerCase())) {
          suggestions.push(...value.slice(0, 3))
        }
      }
    }

    // Severity-based suggestions
    if (claim.severity === 'Major' || claim.severity === 'Total Loss') {
      suggestions.push(
        'Consider temporary housing arrangements',
        'Document all safety hazards',
        'Request structural engineering report',
        'Compile full inventory of damages'
      )
    }

    // Property type suggestions
    if (claim.type === 'commercial') {
      suggestions.push(
        'Calculate business interruption losses',
        'Document equipment damage',
        'Review lease obligations',
        'Check compliance with commercial codes'
      )
    } else if (claim.type === 'residential') {
      suggestions.push(
        'List damaged personal belongings',
        'Check homeowner association requirements',
        'Document landscaping damage',
        'Review additional living expenses'
      )
    }

    // Find similar claims for pattern-based suggestions
    if (claim.damageType && claim.type) {
      const query = `${claim.type} ${claim.damageType} damage`
      const similarClaims = await this.findSimilarClaims(query, { type: claim.type }, 3)
      
      if (similarClaims.length > 0) {
        const avgEstimate = similarClaims.reduce((sum, c) => sum + (c.estimatedAmount || 0), 0) / similarClaims.length
        suggestions.push(`Similar claims averaged $${avgEstimate.toLocaleString()} in estimates`)
      }
    }

    return [...new Set(suggestions)].slice(0, 6) // Remove duplicates and limit to 6
  }

  // Enrich claim with context from knowledge graph
  async enrichClaim(claimId: string): Promise<void> {
    const claim = await prisma.claim.findUnique({
      where: { id: claimId }
    })

    if (!claim) return

    // Generate enrichments
    const suggestions = await this.generateSuggestions(claim)
    const similarClaims = await this.findSimilarClaims(
      `${claim.type} ${claim.damageType}`,
      { type: claim.type },
      5
    )

    // Save enrichments to database
    for (const suggestion of suggestions) {
      await prisma.enrichment.create({
        data: {
          claimId,
          type: 'suggestion',
          source: 'GraphRAG',
          content: JSON.stringify({ text: suggestion }),
          confidence: 0.85
        }
      })
    }

    // Save similar claims as enrichments
    if (similarClaims.length > 0) {
      await prisma.enrichment.create({
        data: {
          claimId,
          type: 'similar_claims',
          source: 'GraphRAG',
          content: JSON.stringify(similarClaims),
          confidence: 0.9
        }
      })
    }

    // Risk assessment based on patterns
    const riskFactors = this.assessRisk(claim, similarClaims)
    if (riskFactors.length > 0) {
      await prisma.enrichment.create({
        data: {
          claimId,
          type: 'risk_assessment',
          source: 'GraphRAG',
          content: JSON.stringify(riskFactors),
          confidence: 0.8
        }
      })
    }
  }

  // Assess risk factors based on claim patterns
  private assessRisk(claim: Claim, similarClaims: any[]): string[] {
    const risks: string[] = []

    // High-value claim risk
    if (claim.estimatedAmount && claim.estimatedAmount > 100000) {
      risks.push('High-value claim requires additional documentation')
    }

    // Multiple damage types risk
    if (claim.damageType && claim.damageType.includes(',')) {
      risks.push('Multiple damage types may indicate catastrophic event')
    }

    // Fraud indicators based on patterns
    if (claim.fraudScore && claim.fraudScore > 0.3) {
      risks.push('Elevated fraud score requires manual review')
    }

    // Geographic risk patterns
    if (claim.propertyAddress.toLowerCase().includes('flood zone')) {
      risks.push('Property in flood-prone area')
    }

    // Timing patterns
    const submittedDate = new Date(claim.submittedAt)
    const dayOfWeek = submittedDate.getDay()
    if (dayOfWeek === 1) { // Monday
      risks.push('Claims submitted on Mondays have 15% higher fraud rate')
    }

    return risks
  }

  // Build knowledge graph relationships
  async buildKnowledgeGraph(): Promise<void> {
    // Get all claims
    const claims = await prisma.claim.findMany({
      take: 1000,
      orderBy: { submittedAt: 'desc' }
    })

    // Embed all claims
    for (const claim of claims) {
      await this.embedClaim(claim)
    }

    console.log(`Knowledge graph built with ${claims.length} claims`)
  }

  // Get enrichment suggestions for inspection form
  async getInspectionSuggestions(
    propertyType: string,
    damageTypes: string[],
    severity: string
  ): Promise<string[]> {
    const mockClaim: Partial<Claim> = {
      type: propertyType as any,
      damageType: damageTypes.join(', '),
      severity: severity
    }

    return this.generateSuggestions(mockClaim)
  }

  // Query the knowledge graph
  async queryKnowledgeGraph(query: string): Promise<any> {
    const collection = await this.getCollection()
    
    const results = await collection.query({
      queryTexts: [query],
      nResults: 10
    })

    return {
      documents: results.documents[0],
      metadatas: results.metadatas[0],
      distances: results.distances?.[0]
    }
  }
}

// Export singleton instance
export const graphRAG = new GraphRAG()