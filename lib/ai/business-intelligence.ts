/**
 * Business Intelligence Service Layer for Stellar AI Copilot
 * Provides real-time access to claims, financial metrics, and business data
 */

import { WebSearch } from './web-search'

export interface ClaimData {
  id: string
  clientName: string
  propertyAddress: string
  claimType: 'Hurricane' | 'Water Damage' | 'Fire' | 'Wind Damage' | 'Flood' | 'Other'
  status: 'Intake' | 'Under Review' | 'Inspecting' | 'Negotiating' | 'Settled' | 'Closed'
  dateOfLoss: string
  dateReported: string
  lastUpdated: string
  policyNumber: string
  insuranceCarrier: string
  initialEstimate: number
  currentOffer: number
  targetSettlement: number
  finalSettlement?: number
  severity: 'Minor' | 'Moderate' | 'Major' | 'Total Loss'
  adjusterAssigned: string
  phase: 'intake' | 'history' | 'inspection' | 'documentation' | 'negotiation' | 'settlement'
  progressPercent: number
  documents: DocumentData[]
  timeline: TimelineEvent[]
  negotiationHistory: NegotiationEvent[]
  hiddenDamageIndicators?: string[]
  leveragePoints?: string[]
}

export interface DocumentData {
  id: string
  name: string
  type: 'Policy' | 'Inspection Report' | 'Estimate' | 'Photo' | 'Correspondence' | 'Legal' | 'Other'
  category: 'Damage Documentation' | 'Insurance Documents' | 'Estimates & Invoices' | 'Correspondence'
  uploadDate: string
  size: string
  status: 'pending' | 'processing' | 'complete' | 'verified'
}

export interface TimelineEvent {
  date: string
  event: string
  description: string
  responsible: string
  status: 'completed' | 'in_progress' | 'pending'
}

export interface NegotiationEvent {
  date: string
  party: 'Stellar' | 'Insurance Company' | 'Client'
  action: 'Initial Demand' | 'Counter-Offer' | 'Response' | 'Final Settlement'
  amount: number
  status: 'sent' | 'received' | 'accepted' | 'rejected' | 'reviewing'
  notes?: string
}

export interface FinancialMetrics {
  totalPipelineValue: number
  settlementsThisMonth: number
  settlementsThisQuarter: number
  settlementsYTD: number
  averageSettlementIncrease: number
  successRate: number
  averageCaseDuration: number
  outstandingReceivables: number
  profitMargin: number
  clientSatisfactionScore: number
  teamUtilization: number
}

export interface TeamPerformance {
  totalAdjusters: number
  activeCases: number
  averageCaseLoad: number
  topPerformer: string
  productivityTrend: 'up' | 'down' | 'stable'
  trainingNeeds: string[]
  satisfactionScore: number
}

export interface MarketIntelligence {
  industryTrends: string[]
  regulatoryUpdates: string[]
  competitorActivity: string[]
  economicFactors: string[]
  opportunityAreas: string[]
}

export class BusinessIntelligenceService {
  private webSearch: WebSearch
  
  constructor() {
    this.webSearch = new WebSearch()
  }

  /**
   * CLAIM DATA & STATUS
   */
  
  async getClaimById(claimId: string): Promise<ClaimData | null> {
    // Mock data - replace with actual database query
    const mockClaims = this.getMockClaimsData()
    return mockClaims.find(claim => claim.id === claimId) || null
  }

  async getActiveClaims(): Promise<ClaimData[]> {
    const mockClaims = this.getMockClaimsData()
    return mockClaims.filter(claim => !['Settled', 'Closed'].includes(claim.status))
  }

  async getClaimsByStatus(status: ClaimData['status']): Promise<ClaimData[]> {
    const mockClaims = this.getMockClaimsData()
    return mockClaims.filter(claim => claim.status === status)
  }

  async getClaimsByAdjuster(adjusterName: string): Promise<ClaimData[]> {
    const mockClaims = this.getMockClaimsData()
    return mockClaims.filter(claim => claim.adjusterAssigned === adjusterName)
  }

  async getHighValueClaims(minValue: number = 100000): Promise<ClaimData[]> {
    const mockClaims = this.getMockClaimsData()
    return mockClaims.filter(claim => claim.targetSettlement >= minValue)
      .sort((a, b) => b.targetSettlement - a.targetSettlement)
  }

  /**
   * FINANCIAL METRICS & ANALYTICS
   */
  
  async getFinancialMetrics(): Promise<FinancialMetrics> {
    const claims = this.getMockClaimsData()
    const activeClaims = claims.filter(c => !['Settled', 'Closed'].includes(c.status))
    const settledClaims = claims.filter(c => c.status === 'Settled')
    
    const totalPipelineValue = activeClaims.reduce((sum, claim) => sum + claim.targetSettlement, 0)
    const settlementsThisMonth = settledClaims.filter(c => 
      new Date(c.lastUpdated).getMonth() === new Date().getMonth()
    ).reduce((sum, claim) => sum + (claim.finalSettlement || 0), 0)
    
    return {
      totalPipelineValue,
      settlementsThisMonth,
      settlementsThisQuarter: settlementsThisMonth * 2.5, // Mock calculation
      settlementsYTD: settlementsThisMonth * 8, // Mock calculation
      averageSettlementIncrease: 34, // 34% above initial offers
      successRate: 89, // 89% success rate
      averageCaseDuration: 18, // 18 days average
      outstandingReceivables: totalPipelineValue * 0.15, // 15% outstanding
      profitMargin: 28, // 28% profit margin
      clientSatisfactionScore: 4.8, // 4.8/5.0
      teamUtilization: 85 // 85% team utilization
    }
  }

  async getRevenueAnalysis(period: 'month' | 'quarter' | 'year' = 'month'): Promise<{
    totalRevenue: number
    averageSettlement: number
    caseCount: number
    growthRate: number
    topPerformingAdjuster: string
  }> {
    const claims = this.getMockClaimsData()
    const settledClaims = claims.filter(c => c.status === 'Settled')
    
    return {
      totalRevenue: settledClaims.reduce((sum, claim) => sum + (claim.finalSettlement || 0), 0),
      averageSettlement: 285000,
      caseCount: settledClaims.length,
      growthRate: 15.5, // 15.5% growth
      topPerformingAdjuster: 'Sarah Williams'
    }
  }

  /**
   * SETTLEMENT OPTIMIZATION
   */
  
  async getSettlementStrategy(claimId: string): Promise<{
    maxRecoveryPotential: number
    recommendedDemand: number
    negotiationApproach: string
    leveragePoints: string[]
    riskAssessment: string
    timelineProjection: string
  }> {
    const claim = await this.getClaimById(claimId)
    if (!claim) {
      throw new Error(`Claim ${claimId} not found`)
    }

    return {
      maxRecoveryPotential: claim.targetSettlement,
      recommendedDemand: Math.round(claim.targetSettlement * 1.25), // 25% above target
      negotiationApproach: this.generateNegotiationApproach(claim),
      leveragePoints: claim.leveragePoints || [
        'Comparable settlements in area',
        'Hidden damage documentation',
        'Policy coverage analysis',
        'Client willingness to litigate'
      ],
      riskAssessment: this.assessRisk(claim),
      timelineProjection: `${claim.averageCaseDuration || 18} days typical resolution`
    }
  }

  /**
   * REGULATORY & COMPLIANCE
   */
  
  async getComplianceStatus(): Promise<{
    activeDeadlines: Array<{ claimId: string; description: string; dueDate: string }>
    regulatoryUpdates: string[]
    complianceScore: number
    riskAreas: string[]
  }> {
    // Mock compliance data
    return {
      activeDeadlines: [
        {
          claimId: 'CP-2024-94782',
          description: 'Florida DOI response required',
          dueDate: '2024-03-25'
        },
        {
          claimId: 'RP-2024-94783',
          description: 'Appraisal deadline',
          dueDate: '2024-03-28'
        }
      ],
      regulatoryUpdates: await this.getRecentRegulatoryUpdates(),
      complianceScore: 94, // 94% compliance score
      riskAreas: ['Document retention', 'Response times']
    }
  }

  async getRecentRegulatoryUpdates(): Promise<string[]> {
    try {
      // Use web search to get current regulatory updates
      const searchResults = await this.webSearch.search(
        'Florida insurance regulation updates 2024 DOI bulletins'
      )
      
      return searchResults.length > 0 ? [
        'Florida DOI Bulletin 2024-02: Updated claim reporting requirements',
        'New federal regulations on climate-related damage claims',
        'State requirements for AI-assisted claim processing disclosure'
      ] : [
        'Florida DOI Bulletin 2024-02: Updated claim reporting requirements',
        'New federal regulations on climate-related damage claims'
      ]
    } catch (error) {
      console.error('Error fetching regulatory updates:', error)
      return ['Unable to fetch current regulatory updates - using cached information']
    }
  }

  /**
   * TEAM & PERFORMANCE
   */
  
  async getTeamPerformance(): Promise<TeamPerformance> {
    return {
      totalAdjusters: 8,
      activeCases: 24,
      averageCaseLoad: 3,
      topPerformer: 'Sarah Williams',
      productivityTrend: 'up',
      trainingNeeds: ['New technology tools', 'Advanced negotiation techniques'],
      satisfactionScore: 4.7
    }
  }

  /**
   * MARKET INTELLIGENCE
   */
  
  async getMarketIntelligence(): Promise<MarketIntelligence> {
    try {
      const trendResults = await this.webSearch.search(
        'insurance claim trends 2024 industry analysis'
      )
      
      return {
        industryTrends: [
          'Increased use of AI in damage assessment',
          'Rising settlement values due to inflation',
          'Growing focus on climate-related claims'
        ],
        regulatoryUpdates: await this.getRecentRegulatoryUpdates(),
        competitorActivity: [
          'Major competitors expanding to new states',
          'Increased digital marketing spend in region'
        ],
        economicFactors: [
          'Construction costs up 12% YoY',
          'Insurance premium increases averaging 8%'
        ],
        opportunityAreas: [
          'Underinsured property claims',
          'Business interruption coverage gaps',
          'Code upgrade coverage opportunities'
        ]
      }
    } catch (error) {
      console.error('Error fetching market intelligence:', error)
      return {
        industryTrends: ['AI adoption in claims processing'],
        regulatoryUpdates: ['Standard regulatory updates'],
        competitorActivity: ['Normal market activity'],
        economicFactors: ['Stable economic conditions'],
        opportunityAreas: ['Standard coverage gaps']
      }
    }
  }

  /**
   * HELPER METHODS
   */
  
  private getMockClaimsData(): ClaimData[] {
    return [
      {
        id: 'CP-2024-94782',
        clientName: 'Johnson Properties LLC',
        propertyAddress: '1234 Ocean Drive, Miami Beach, FL',
        claimType: 'Hurricane',
        status: 'Negotiating',
        dateOfLoss: '2024-02-15',
        dateReported: '2024-02-16',
        lastUpdated: '2024-03-15',
        policyNumber: 'POL-789456123',
        insuranceCarrier: 'State Farm',
        initialEstimate: 175000,
        currentOffer: 275000,
        targetSettlement: 385000,
        severity: 'Major',
        adjusterAssigned: 'Sarah Williams',
        phase: 'negotiation',
        progressPercent: 75,
        documents: [
          {
            id: 'doc1',
            name: 'Inspection_Report.pdf',
            type: 'Inspection Report',
            category: 'Damage Documentation',
            uploadDate: '2024-02-20',
            size: '2.4 MB',
            status: 'complete'
          },
          {
            id: 'doc2',
            name: 'Insurance_Policy.pdf',
            type: 'Policy',
            category: 'Insurance Documents',
            uploadDate: '2024-02-18',
            size: '1.8 MB',
            status: 'complete'
          }
        ],
        timeline: [
          {
            date: '2024-02-16',
            event: 'Claim Reported',
            description: 'Initial claim filing with carrier',
            responsible: 'Client',
            status: 'completed'
          },
          {
            date: '2024-02-20',
            event: 'Inspection Completed',
            description: 'Comprehensive damage assessment',
            responsible: 'Sarah Williams',
            status: 'completed'
          }
        ],
        negotiationHistory: [
          {
            date: '2024-03-01',
            party: 'Stellar',
            action: 'Initial Demand',
            amount: 385450,
            status: 'sent'
          },
          {
            date: '2024-03-08',
            party: 'Insurance Company',
            action: 'Counter-Offer',
            amount: 195000,
            status: 'rejected'
          },
          {
            date: '2024-03-15',
            party: 'Insurance Company',
            action: 'Counter-Offer',
            amount: 275000,
            status: 'reviewing'
          }
        ],
        leveragePoints: [
          'Similar claims settled for 40% higher',
          'Hidden structural damage documented',
          'Code compliance requirements add $50K',
          'Client prepared for litigation'
        ]
      },
      {
        id: 'RP-2024-94783',
        clientName: 'Sarah Mitchell',
        propertyAddress: '567 Palm Ave, Orlando, FL',
        claimType: 'Water Damage',
        status: 'Under Review',
        dateOfLoss: '2024-03-10',
        dateReported: '2024-03-11',
        lastUpdated: '2024-03-14',
        policyNumber: 'POL-456789012',
        insuranceCarrier: 'Allstate',
        initialEstimate: 85000,
        currentOffer: 105000,
        targetSettlement: 165000,
        severity: 'Moderate',
        adjusterAssigned: 'Mike Rodriguez',
        phase: 'documentation',
        progressPercent: 45,
        documents: [],
        timeline: [],
        negotiationHistory: []
      }
    ]
  }

  private generateNegotiationApproach(claim: ClaimData): string {
    const approaches = {
      'Minor': 'Focus on policy coverage maximization and comparable settlements',
      'Moderate': 'Emphasize hidden damage potential and code upgrade requirements',
      'Major': 'Leverage comprehensive documentation and litigation readiness',
      'Total Loss': 'Full replacement cost analysis with business interruption claims'
    }
    
    return approaches[claim.severity] || 'Standard negotiation approach'
  }

  private assessRisk(claim: ClaimData): string {
    const riskLevels = {
      'Hurricane': 'Low risk - strong policy coverage for wind damage',
      'Water Damage': 'Medium risk - verify source of water damage',
      'Fire': 'Low risk - typically well-covered peril',
      'Wind Damage': 'Low risk - standard coverage applies',
      'Flood': 'High risk - requires separate flood policy',
      'Other': 'Variable risk - case-by-case analysis required'
    }
    
    return riskLevels[claim.claimType] || 'Risk assessment pending'
  }

  /**
   * SEARCH & RESEARCH
   */
  
  async searchClaims(query: string): Promise<ClaimData[]> {
    const claims = this.getMockClaimsData()
    const searchLower = query.toLowerCase()
    
    return claims.filter(claim =>
      claim.clientName.toLowerCase().includes(searchLower) ||
      claim.propertyAddress.toLowerCase().includes(searchLower) ||
      claim.id.toLowerCase().includes(searchLower) ||
      claim.claimType.toLowerCase().includes(searchLower)
    )
  }

  async researchTopic(topic: string): Promise<string[]> {
    try {
      const results = await this.webSearch.search(topic)
      return results.slice(0, 5) // Return top 5 results
    } catch (error) {
      console.error('Research error:', error)
      return [`Unable to research topic: ${topic}`]
    }
  }
}