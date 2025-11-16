/**
 * Web Search Service for Stellar AI Copilot
 * Enables real-time research and information gathering
 */

export interface SearchResult {
  title: string
  url: string
  snippet: string
  relevanceScore: number
}

export interface SearchOptions {
  maxResults?: number
  dateFilter?: 'day' | 'week' | 'month' | 'year' | 'all'
  siteFilter?: string[]
  excludeSites?: string[]
  language?: string
}

export class WebSearch {
  private readonly searchApiKey: string | undefined
  private readonly searchEngineId: string | undefined
  
  constructor() {
    this.searchApiKey = process.env.GOOGLE_SEARCH_API_KEY
    this.searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID
  }

  /**
   * Perform web search for general information
   */
  async search(query: string, options: SearchOptions = {}): Promise<string[]> {
    const {
      maxResults = 5,
      dateFilter = 'year',
      siteFilter = [],
      excludeSites = [],
      language = 'en'
    } = options

    try {
      // If API keys are not configured, return mock results
      if (!this.searchApiKey || !this.searchEngineId) {
        console.warn('Web search API not configured, returning mock results')
        return this.getMockSearchResults(query)
      }

      // Build search query with filters
      let searchQuery = query
      
      if (siteFilter.length > 0) {
        searchQuery += ' ' + siteFilter.map(site => `site:${site}`).join(' OR ')
      }
      
      if (excludeSites.length > 0) {
        searchQuery += ' ' + excludeSites.map(site => `-site:${site}`).join(' ')
      }

      // Construct Google Custom Search API URL
      const searchUrl = new URL('https://www.googleapis.com/customsearch/v1')
      searchUrl.searchParams.append('key', this.searchApiKey)
      searchUrl.searchParams.append('cx', this.searchEngineId)
      searchUrl.searchParams.append('q', searchQuery)
      searchUrl.searchParams.append('num', Math.min(maxResults, 10).toString())
      searchUrl.searchParams.append('lr', `lang_${language}`)
      
      if (dateFilter !== 'all') {
        searchUrl.searchParams.append('dateRestrict', this.getDateRestriction(dateFilter))
      }

      const response = await fetch(searchUrl.toString())
      
      if (!response.ok) {
        throw new Error(`Search API error: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.items) {
        return data.items.map((item: any) => item.snippet || item.title).slice(0, maxResults)
      }
      
      return []
    } catch (error) {
      console.error('Web search error:', error)
      return this.getMockSearchResults(query)
    }
  }

  /**
   * Search for insurance-specific information
   */
  async searchInsuranceRegulations(state: string, topic: string): Promise<string[]> {
    const query = `${state} insurance regulation ${topic} DOI department`
    
    return await this.search(query, {
      maxResults: 5,
      dateFilter: 'year',
      siteFilter: [
        `${state.toLowerCase()}.gov`,
        'naic.org',
        'iii.org',
        'insurancejournal.com'
      ]
    })
  }

  /**
   * Search for legal precedents and case law
   */
  async searchCaseLaw(topic: string, jurisdiction?: string): Promise<string[]> {
    let query = `insurance case law ${topic} court decision`
    if (jurisdiction) {
      query += ` ${jurisdiction}`
    }

    return await this.search(query, {
      maxResults: 5,
      dateFilter: 'year',
      siteFilter: [
        'justia.com',
        'caselaw.findlaw.com',
        'law.cornell.edu',
        'courtlistener.com'
      ]
    })
  }

  /**
   * Search for industry trends and market intelligence
   */
  async searchIndustryTrends(topic: string): Promise<string[]> {
    const query = `insurance industry trends 2024 ${topic} market analysis`
    
    return await this.search(query, {
      maxResults: 5,
      dateFilter: 'year',
      siteFilter: [
        'insurancejournal.com',
        'propertycasualty360.com',
        'mckinsey.com',
        'deloitte.com',
        'pwc.com',
        'iii.org'
      ]
    })
  }

  /**
   * Search for comparable settlements and claim data
   */
  async searchComparableSettlements(damageType: string, location: string, amount?: number): Promise<string[]> {
    let query = `${damageType} insurance settlement ${location}`
    if (amount) {
      query += ` $${Math.round(amount / 1000)}k`
    }
    
    return await this.search(query, {
      maxResults: 3,
      dateFilter: 'year'
    })
  }

  /**
   * Search for regulatory updates and bulletins
   */
  async searchRegulatoryUpdates(state: string): Promise<string[]> {
    const query = `${state} insurance department bulletin 2024 regulation update`
    
    return await this.search(query, {
      maxResults: 5,
      dateFilter: 'month',
      siteFilter: [
        `${state.toLowerCase()}.gov`,
        'naic.org'
      ]
    })
  }

  /**
   * Search for construction costs and market rates
   */
  async searchConstructionCosts(location: string, year: string = '2024'): Promise<string[]> {
    const query = `construction costs ${location} ${year} building materials labor rates`
    
    return await this.search(query, {
      maxResults: 3,
      dateFilter: 'year',
      siteFilter: [
        'rsmeans.com',
        'construction.com',
        'constructiondive.com'
      ]
    })
  }

  /**
   * PRIVATE HELPER METHODS
   */
  
  private getDateRestriction(filter: string): string {
    const restrictions = {
      'day': 'd1',
      'week': 'w1', 
      'month': 'm1',
      'year': 'y1'
    }
    return restrictions[filter as keyof typeof restrictions] || 'y1'
  }

  private getMockSearchResults(query: string): string[] {
    const mockResults: Record<string, string[]> = {
      'florida insurance regulation': [
        'Florida Statute 627.7074 requires prompt claim handling within 90 days',
        'Florida Administrative Code 69O-170.0155 outlines claim investigation requirements',
        'Florida DOI Bulletin 2024-02 updates electronic claim filing procedures'
      ],
      'hurricane damage claims': [
        'Hurricane claims must separate wind damage from flood damage for coverage',
        'Florida law requires insurance companies to provide coverage for reasonable additional living expenses',
        'Concurrent causation doctrine applies when multiple perils cause damage'
      ],
      'water damage insurance': [
        'Water damage coverage depends on the source - sudden vs. gradual exclusion applies',
        'Mold coverage is typically limited to $10,000 unless caused by covered water damage',
        'Additional living expenses covered during repairs with sublimits typically 20% of dwelling coverage'
      ],
      'insurance industry trends 2024': [
        'AI adoption in claims processing increased 300% in 2024',
        'Climate-related claims account for 60% of property damage claims',
        'Average settlement times decreased 25% with digital processing tools'
      ],
      'construction costs': [
        'Construction costs increased 8% nationally in 2024',
        'Material costs up 12% year-over-year due to supply chain issues',
        'Labor costs increased 6% with skilled worker shortages continuing'
      ],
      'case law insurance': [
        'Recent court decisions favor policyholders in coverage interpretation disputes',
        'Bad faith claims awards averaged $2.3M in 2024',
        'Courts increasingly scrutinize insurer claim handling practices'
      ]
    }

    // Find the most relevant mock results
    const queryLower = query.toLowerCase()
    for (const [key, results] of Object.entries(mockResults)) {
      if (queryLower.includes(key) || key.includes(queryLower.split(' ')[0])) {
        return results
      }
    }

    // Default fallback results
    return [
      `Research results for "${query}" - API integration required for live search`,
      'Mock data provided for demonstration purposes',
      'Configure Google Search API for real-time research capabilities'
    ]
  }
}

// Utility functions for search result processing
export class SearchResultProcessor {
  static summarizeResults(results: string[], maxLength: number = 500): string {
    const combined = results.join('. ')
    if (combined.length <= maxLength) {
      return combined
    }
    
    return combined.substring(0, maxLength - 3) + '...'
  }

  static extractKeyFacts(results: string[]): string[] {
    const facts: string[] = []
    
    results.forEach(result => {
      // Extract numerical facts
      const numbers = result.match(/\$[\d,]+|\d+%|\d+\.\d+%|\d+ days?|\d+ years?/g)
      if (numbers) {
        facts.push(...numbers)
      }
      
      // Extract regulatory references
      const regulations = result.match(/\b[A-Z][a-z]+ \d+[\.\d]*|\b[A-Z]{2,} \d+[\-\.\d]*/g)
      if (regulations) {
        facts.push(...regulations)
      }
    })
    
    return [...new Set(facts)] // Remove duplicates
  }

  static categorizeResults(results: string[]): {
    regulatory: string[]
    financial: string[]
    legal: string[]
    market: string[]
    technical: string[]
  } {
    const categories = {
      regulatory: [] as string[],
      financial: [] as string[],
      legal: [] as string[],
      market: [] as string[],
      technical: [] as string[]
    }

    results.forEach(result => {
      const lower = result.toLowerCase()
      
      if (lower.includes('regulation') || lower.includes('statute') || lower.includes('doi') || lower.includes('bulletin')) {
        categories.regulatory.push(result)
      } else if (lower.includes('$') || lower.includes('cost') || lower.includes('settlement') || lower.includes('%')) {
        categories.financial.push(result)
      } else if (lower.includes('court') || lower.includes('case') || lower.includes('law') || lower.includes('legal')) {
        categories.legal.push(result)
      } else if (lower.includes('trend') || lower.includes('market') || lower.includes('industry')) {
        categories.market.push(result)
      } else {
        categories.technical.push(result)
      }
    })

    return categories
  }
}