'use client'

import { useState } from 'react'
import SourcesSection from '@/components/ui/sources-section'

// Mock sources with enhanced structure to test the UI
const mockSources = [
  {
    id: 'source-1',
    documentTitle: 'State Farm Insurance Policy (PDF)',
    text: `SECTION 1 - PROPERTY COVERAGES

Coverage A - Dwelling Protection
We cover the dwelling on the residence premises shown in the Declarations, including structures attached to the dwelling, and materials and supplies located on or adjacent to the residence premises for use in the construction, alteration or repair of the dwelling.

Coverage B - Other Structures Protection
We cover other structures on the residence premises, separated from the dwelling by clear space. Structures connected to the dwelling by only a fence, utility line, or similar connection are considered other structures.

LIMITS OF LIABILITY:
The limit of liability for Coverage A is shown in the Declarations. This is the most we will pay for any one loss. The limit of liability for Coverage B is 10% of the Coverage A limit.`,
    metadata: {
      documentId: 'doc-12345',
      documentName: 'State_Farm_Insurance_Policy.pdf',
      documentType: 'PDF Document',
      page: 15,
      section: 'Property Coverages',
      confidence: 0.92,
      matchType: 'semantic',
      knowledgebaseId: 'kb-insurance',
      lastModified: '2024-01-15'
    }
  },
  {
    id: 'source-2',
    documentTitle: 'Hurricane Deductible Endorsement (PDF)',
    text: `HURRICANE DEDUCTIBLE

This endorsement modifies insurance provided under the following:
HOMEOWNERS POLICY

A separate hurricane deductible applies to loss caused by windstorm during a hurricane. The hurricane deductible is 2% of the Coverage A limit shown in the Declarations.

The hurricane deductible applies to any loss caused directly or indirectly by windstorm if:
1. The National Weather Service issues a hurricane watch or warning for any part of the state where the residence premises is located
2. The loss occurs within 72 hours after the watch or warning is issued`,
    metadata: {
      documentId: 'doc-67890',
      documentName: 'Hurricane_Deductible_Endorsement.pdf',
      documentType: 'PDF Document',
      page: 3,
      section: 'Deductibles',
      confidence: 0.88,
      matchType: 'semantic',
      knowledgebaseId: 'kb-insurance'
    }
  },
  {
    id: 'source-3',
    documentTitle: 'Water Damage Coverage Guidelines',
    text: `WATER DAMAGE EXCLUSIONS AND COVERAGE

We do not cover loss caused by:
1. Flood, surface water, waves, tidal water, overflow of a body of water
2. Water which backs up through sewers or drains
3. Water below the surface of the ground

However, we do cover sudden and accidental water damage from:
- Plumbing, heating, air conditioning or automatic fire protective sprinkler systems
- Household appliances
- Accidental discharge or overflow of water from within a plumbing system`,
    metadata: {
      documentId: 'doc-11111',
      documentName: 'Water_Damage_Guidelines.docx',
      documentType: 'Word Document',
      page: 8,
      section: 'Exclusions and Limitations',
      paragraph: 4,
      confidence: 0.95,
      matchType: 'semantic'
    }
  }
]

export default function TestSourcesPage() {
  const [messages, setMessages] = useState([
    {
      role: 'user' as const,
      content: 'What coverage do I have for hurricane damage?'
    },
    {
      role: 'assistant' as const,
      content: `Based on your State Farm Insurance Policy, you have comprehensive hurricane coverage with the following key points:

**Hurricane Coverage:**
- Your dwelling (Coverage A) is protected against windstorm damage during hurricanes
- Other structures on your property (Coverage B) are also covered at 10% of your dwelling limit
- A separate 2% hurricane deductible applies to windstorm losses during a hurricane

**Important Details:**
- The hurricane deductible activates when the National Weather Service issues a hurricane watch or warning for your area
- Coverage applies to losses occurring within 72 hours after the watch/warning is issued
- Both direct and indirect windstorm damage are covered

**Water Damage Considerations:**
- Storm surge and flood damage require separate flood insurance
- Wind-driven rain damage to the interior is covered if the wind first creates an opening
- Backup of sewers/drains due to hurricane conditions is excluded unless you have additional coverage

I recommend reviewing your policy declarations page to confirm your specific Coverage A limit and calculate your hurricane deductible amount (2% of that limit).`,
      sources: mockSources
    }
  ])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Test Sources Display
        </h1>

        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`${
                message.role === 'user'
                  ? 'bg-blue-100 dark:bg-blue-900/30'
                  : 'bg-white dark:bg-gray-800'
              } rounded-lg p-4`}
            >
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                {message.role === 'user' ? 'User' : 'Assistant'}
              </div>
              <div className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                {message.content}
              </div>

              {/* Display sources if available */}
              {message.role === 'assistant' && message.sources && (
                <SourcesSection sources={message.sources} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}