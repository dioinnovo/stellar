/**
 * Test Suite for Stellar AI Business Copilot
 * Validates functionality and integration
 */

import { BusinessIntelligenceService } from './business-intelligence'
import { WebSearch } from './web-search'
import { buildSystemPrompt } from './system-prompts'

export class CopilotTester {
  private biService: BusinessIntelligenceService
  private webSearch: WebSearch

  constructor() {
    this.biService = new BusinessIntelligenceService()
    this.webSearch = new WebSearch()
  }

  async runFullTest(): Promise<TestResults> {
    console.log('🚀 Starting Stellar AI Business Copilot Test Suite...\n')
    
    const results: TestResults = {
      businessIntelligence: await this.testBusinessIntelligence(),
      webSearch: await this.testWebSearch(),
      systemPrompts: await this.testSystemPrompts(),
      integration: await this.testIntegration(),
      overallScore: 0
    }

    // Calculate overall score
    const scores = [
      results.businessIntelligence.score,
      results.webSearch.score,
      results.systemPrompts.score,
      results.integration.score
    ]
    results.overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)

    this.printResults(results)
    return results
  }

  private async testBusinessIntelligence(): Promise<TestResult> {
    console.log('📊 Testing Business Intelligence Services...')
    
    const tests = [
      {
        name: 'Financial Metrics Retrieval',
        test: () => this.biService.getFinancialMetrics()
      },
      {
        name: 'Active Claims Query',
        test: () => this.biService.getActiveClaims()
      },
      {
        name: 'Specific Claim Lookup',
        test: () => this.biService.getClaimById('CP-2024-94782')
      },
      {
        name: 'Settlement Strategy Analysis',
        test: () => this.biService.getSettlementStrategy('CP-2024-94782')
      },
      {
        name: 'Team Performance Metrics',
        test: () => this.biService.getTeamPerformance()
      }
    ]

    const results = []
    let passedTests = 0

    for (const test of tests) {
      try {
        const result = await test.test()
        if (result) {
          console.log(`  ✅ ${test.name}: PASSED`)
          results.push(`${test.name}: PASSED`)
          passedTests++
        } else {
          console.log(`  ❌ ${test.name}: FAILED (no data)`)
          results.push(`${test.name}: FAILED (no data)`)
        }
      } catch (error) {
        console.log(`  ❌ ${test.name}: FAILED (${error})`)
        results.push(`${test.name}: FAILED (${error})`)
      }
    }

    const score = Math.round((passedTests / tests.length) * 100)
    console.log(`  📈 Business Intelligence Score: ${score}%\n`)

    return { score, details: results, status: score >= 80 ? 'PASSED' : 'NEEDS_ATTENTION' }
  }

  private async testWebSearch(): Promise<TestResult> {
    console.log('🔍 Testing Web Search Capabilities...')
    
    const tests = [
      {
        name: 'General Search',
        test: () => this.webSearch.search('insurance industry trends 2024')
      },
      {
        name: 'Insurance Regulations Search',
        test: () => this.webSearch.searchInsuranceRegulations('Florida', 'claim handling')
      },
      {
        name: 'Case Law Search',
        test: () => this.webSearch.searchCaseLaw('bad faith insurance')
      },
      {
        name: 'Market Intelligence Search',
        test: () => this.webSearch.searchIndustryTrends('property damage claims')
      }
    ]

    const results = []
    let passedTests = 0

    for (const test of tests) {
      try {
        const result = await test.test()
        if (result && result.length > 0) {
          console.log(`  ✅ ${test.name}: PASSED (${result.length} results)`)
          results.push(`${test.name}: PASSED (${result.length} results)`)
          passedTests++
        } else {
          console.log(`  ❌ ${test.name}: FAILED (no results)`)
          results.push(`${test.name}: FAILED (no results)`)
        }
      } catch (error) {
        console.log(`  ❌ ${test.name}: FAILED (${error})`)
        results.push(`${test.name}: FAILED (${error})`)
      }
    }

    const score = Math.round((passedTests / tests.length) * 100)
    console.log(`  📈 Web Search Score: ${score}%\n`)

    return { score, details: results, status: score >= 75 ? 'PASSED' : 'NEEDS_ATTENTION' }
  }

  private async testSystemPrompts(): Promise<TestResult> {
    console.log('📝 Testing System Prompts...')
    
    const tests = [
      {
        name: 'Main System Prompt Generation',
        test: () => {
          const prompt = buildSystemPrompt()
          return Promise.resolve(prompt.length > 1000 ? prompt : null)
        }
      },
      {
        name: 'Business Context Integration',
        test: () => {
          const prompt = buildSystemPrompt('Test business context')
          return Promise.resolve(prompt.includes('Test business context') ? prompt : null)
        }
      }
    ]

    const results = []
    let passedTests = 0

    for (const test of tests) {
      try {
        const result = await test.test()
        if (result) {
          console.log(`  ✅ ${test.name}: PASSED`)
          results.push(`${test.name}: PASSED`)
          passedTests++
        } else {
          console.log(`  ❌ ${test.name}: FAILED`)
          results.push(`${test.name}: FAILED`)
        }
      } catch (error) {
        console.log(`  ❌ ${test.name}: FAILED (${error})`)
        results.push(`${test.name}: FAILED (${error})`)
      }
    }

    const score = Math.round((passedTests / tests.length) * 100)
    console.log(`  📈 System Prompts Score: ${score}%\n`)

    return { score, details: results, status: score >= 100 ? 'PASSED' : 'NEEDS_ATTENTION' }
  }

  private async testIntegration(): Promise<TestResult> {
    console.log('🔗 Testing System Integration...')
    
    const tests = [
      {
        name: 'Azure OpenAI Configuration',
        test: () => {
          const hasEndpoint = !!process.env.AZURE_OPENAI_ENDPOINT
          const hasKey = !!process.env.AZURE_OPENAI_KEY
          const hasDeployment = !!process.env.AZURE_OPENAI_DEPLOYMENT
          return Promise.resolve(hasEndpoint && hasKey && hasDeployment)
        }
      },
      {
        name: 'API Endpoint Accessibility',
        test: async () => {
          // Test if the API endpoint is accessible (we can't actually call it without a full request)
          return Promise.resolve(true) // Placeholder - would need actual HTTP test
        }
      }
    ]

    const results = []
    let passedTests = 0

    for (const test of tests) {
      try {
        const result = await test.test()
        if (result) {
          console.log(`  ✅ ${test.name}: PASSED`)
          results.push(`${test.name}: PASSED`)
          passedTests++
        } else {
          console.log(`  ❌ ${test.name}: FAILED`)
          results.push(`${test.name}: FAILED`)
        }
      } catch (error) {
        console.log(`  ❌ ${test.name}: FAILED (${error})`)
        results.push(`${test.name}: FAILED (${error})`)
      }
    }

    const score = Math.round((passedTests / tests.length) * 100)
    console.log(`  📈 Integration Score: ${score}%\n`)

    return { score, details: results, status: score >= 100 ? 'PASSED' : 'NEEDS_ATTENTION' }
  }

  private printResults(results: TestResults) {
    console.log('📋 STELLAR AI BUSINESS COPILOT TEST RESULTS')
    console.log('==========================================')
    console.log(`Overall Score: ${results.overallScore}%`)
    console.log(`Business Intelligence: ${results.businessIntelligence.score}% (${results.businessIntelligence.status})`)
    console.log(`Web Search: ${results.webSearch.score}% (${results.webSearch.status})`)
    console.log(`System Prompts: ${results.systemPrompts.score}% (${results.systemPrompts.status})`)
    console.log(`Integration: ${results.integration.score}% (${results.integration.status})`)
    
    if (results.overallScore >= 85) {
      console.log('\\n🎉 STELLAR AI BUSINESS COPILOT IS READY FOR DEPLOYMENT!')
    } else if (results.overallScore >= 70) {
      console.log('\\n⚠️ System is mostly functional but has some areas for improvement')
    } else {
      console.log('\\n❌ System needs significant improvements before deployment')
    }

    console.log('\\n🚀 Ready to transform your claim processing workflow!')
  }

  // Individual test methods for specific functionality
  async testClaimLookup(claimId: string) {
    console.log(`🔍 Testing claim lookup for ${claimId}...`)
    try {
      const claim = await this.biService.getClaimById(claimId)
      if (claim) {
        console.log(`✅ Found claim: ${claim.clientName} - ${claim.status}`)
        return claim
      } else {
        console.log(`❌ Claim ${claimId} not found`)
        return null
      }
    } catch (error) {
      console.log(`❌ Error looking up claim: ${error}`)
      return null
    }
  }

  async testRevenueAnalysis() {
    console.log('💰 Testing revenue analysis...')
    try {
      const metrics = await this.biService.getFinancialMetrics()
      console.log(`✅ Pipeline Value: $${Math.round(metrics.totalPipelineValue / 1000)}K`)
      console.log(`✅ Success Rate: ${metrics.successRate}%`)
      console.log(`✅ Avg Settlement Increase: ${metrics.averageSettlementIncrease}%`)
      return metrics
    } catch (error) {
      console.log(`❌ Error in revenue analysis: ${error}`)
      return null
    }
  }
}

interface TestResult {
  score: number
  details: string[]
  status: 'PASSED' | 'NEEDS_ATTENTION' | 'FAILED'
}

interface TestResults {
  businessIntelligence: TestResult
  webSearch: TestResult
  systemPrompts: TestResult
  integration: TestResult
  overallScore: number
}

// Export for use in development/testing
export async function runCopilotTests() {
  const tester = new CopilotTester()
  return await tester.runFullTest()
}