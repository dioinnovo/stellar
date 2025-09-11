'use client'

import { useState } from 'react'
import { HandshakeIcon, ChevronRight, Plus } from 'lucide-react'
import Link from 'next/link'

export default function ClaimsAnalysisPage() {
  const [selectedClaim, setSelectedClaim] = useState<any>(null)
  const [showNewClaimForm, setShowNewClaimForm] = useState(false)

  const recentClaims = [
    {
      id: 'CP-2024-94782',
      client: 'Johnson Properties LLC',
      property: '1234 Ocean Drive, Miami Beach, FL',
      type: 'Hurricane Damage',
      status: 'Under Review',
      value: 285000,
      date: '2024-03-15',
      phase: 'documentation'
    },
    {
      id: 'RP-2024-94783',
      client: 'Sarah Mitchell',
      property: '567 Palm Ave, Orlando, FL',
      type: 'Water Damage',
      status: 'Negotiating',
      value: 125000,
      date: '2024-03-14',
      phase: 'negotiation'
    },
    {
      id: 'CP-2024-94784',
      client: 'Coastal Retail Group',
      property: '890 Beach Blvd, Tampa, FL',
      type: 'Wind Damage',
      status: 'Inspecting',
      value: 195000,
      date: '2024-03-13',
      phase: 'inspection'
    }
  ]


  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stellar-dark">Claim Analysis Center</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Complete end-to-end claim processing workflow</p>
          </div>
          <button 
            onClick={() => setShowNewClaimForm(true)}
            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-stellar-orange text-white rounded-lg hover:bg-orange-600 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
          >
            <Plus size={20} />
            <span>New Claim</span>
          </button>
        </div>
      </div>

      {/* Recent Claims */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-stellar-dark mb-4">Active Claims</h2>
        <div className="space-y-3">
          {recentClaims.map((claim) => (
            <Link
              key={claim.id}
              href={`/dashboard/claims/${claim.id}`}
              className="block border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-stellar-orange transition cursor-pointer"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-bold text-sm sm:text-base text-stellar-dark">{claim.id}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      claim.status === 'Negotiating' ? 'bg-amber-100 text-amber-700' :
                      claim.status === 'Under Review' ? 'bg-gray-100 text-gray-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {claim.status}
                    </span>
                  </div>
                  <p className="font-medium text-sm sm:text-base truncate">{claim.client}</p>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">{claim.property}</p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
                    <span className="text-xs sm:text-sm text-gray-500">{claim.type}</span>
                    <span className="text-xs sm:text-sm font-semibold text-green-600">${claim.value.toLocaleString()}</span>
                  </div>
                </div>
                <ChevronRight className="text-gray-400 flex-shrink-0" size={20} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Settlement Negotiations Dashboard */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <HandshakeIcon className="text-stellar-orange" size={24} />
          <h2 className="text-xl font-bold text-stellar-dark">Active Settlement Negotiations</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Johnson Properties Negotiation */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-stellar-dark">CP-2024-94782</h3>
                <p className="text-sm text-gray-600">Johnson Properties LLC</p>
              </div>
              <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">Active</span>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Initial Demand:</span>
                <span className="font-semibold text-gray-900">$385,450</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Current Offer:</span>
                <span className="font-semibold text-yellow-600">$275,000</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Target Settlement:</span>
                <span className="font-semibold text-green-600">$310,000</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">03/22 - Reviewing counter-offer</span>
              </div>
              <div className="text-xs text-gray-500 ml-4">
                AI recommends counter at $310K with settlement floor of $285K
              </div>
            </div>
          </div>

          {/* Sarah Mitchell Negotiation */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-stellar-dark">RP-2024-94783</h3>
                <p className="text-sm text-gray-600">Sarah Mitchell</p>
              </div>
              <span className="px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded-full">Negotiating</span>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Initial Demand:</span>
                <span className="font-semibold text-gray-900">$165,000</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Current Offer:</span>
                <span className="font-semibold text-yellow-600">$105,000</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Target Settlement:</span>
                <span className="font-semibold text-green-600">$145,000</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-600">03/21 - Awaiting insurer response</span>
              </div>
              <div className="text-xs text-gray-500 ml-4">
                Strong leverage with hidden water damage documentation
              </div>
            </div>
          </div>
        </div>

        {/* Negotiation Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-stellar-orange">$1.2M</p>
            <p className="text-xs text-gray-600">Total in Negotiation</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">89%</p>
            <p className="text-xs text-gray-600">Success Rate</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">18</p>
            <p className="text-xs text-gray-600">Days Avg. Duration</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">34%</p>
            <p className="text-xs text-gray-600">Avg. Increase</p>
          </div>
        </div>
      </div>

    </div>
  )
}