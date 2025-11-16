'use client'

import { useState } from 'react'
import { HandshakeIcon, ChevronRight, Plus, Search, Filter } from 'lucide-react'
import Link from 'next/link'
import { PageHeader } from '@/components/ui/page-header'

export default function ClaimsAnalysisPage() {
  const [selectedClaim, setSelectedClaim] = useState<any>(null)
  const [showNewClaimForm, setShowNewClaimForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState({
    status: 'all',
    type: 'all',
    valueRange: 'all'
  })

  const recentClaims = [
    {
      id: 'CP-2024-94782',
      client: 'Johnson Properties LLC',
      property: '1234 Ocean Drive, Miami Beach, FL',
      type: 'Hurricane Damage',
      status: 'Under Review',
      value: 285000,
      date: '2024-03-15',
      phase: 'documentation',
      imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop&q=80'
    },
    {
      id: 'RP-2024-94783',
      client: 'Sarah Mitchell',
      property: '567 Palm Ave, Orlando, FL',
      type: 'Water Damage',
      status: 'Negotiating',
      value: 125000,
      date: '2024-03-14',
      phase: 'negotiation',
      imageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop&q=80'
    },
    {
      id: 'CP-2024-94784',
      client: 'Coastal Retail Group',
      property: '890 Beach Blvd, Tampa, FL',
      type: 'Wind Damage',
      status: 'Inspecting',
      value: 195000,
      date: '2024-03-13',
      phase: 'inspection',
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop&q=80'
    }
  ]

  const filteredClaims = recentClaims.filter(claim => {
    const matchesSearch = searchQuery === '' ||
      claim.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.type.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = activeFilters.status === 'all' || claim.status === activeFilters.status
    const matchesType = activeFilters.type === 'all' || claim.type === activeFilters.type

    let matchesValue = true
    if (activeFilters.valueRange !== 'all') {
      switch (activeFilters.valueRange) {
        case 'under100k':
          matchesValue = claim.value < 100000
          break
        case '100k-250k':
          matchesValue = claim.value >= 100000 && claim.value <= 250000
          break
        case 'over250k':
          matchesValue = claim.value > 250000
          break
      }
    }

    return matchesSearch && matchesStatus && matchesType && matchesValue
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <PageHeader 
        title="Claim Analysis Center"
        description="Complete end-to-end claim processing workflow"
        action={
          <button 
            onClick={() => setShowNewClaimForm(true)}
            className="h-12 px-6 bg-stellar-orange text-white rounded-full hover:bg-orange-600 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto transition-colors"
          >
            <Plus size={20} />
            <span className="font-medium">New Claim</span>
          </button>
        }
      />

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 sm:p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search by claim ID, client, property, or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-stellar-orange/20 focus:border-stellar-orange"
            />
          </div>

          {/* Filter Options */}
          <div className="flex flex-wrap gap-3">
            {/* Status Filter */}
            <select
              value={activeFilters.status}
              onChange={(e) => setActiveFilters({...activeFilters, status: e.target.value})}
              className="px-4 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-stellar-orange/20 focus:border-stellar-orange text-sm"
            >
              <option value="all">All Status</option>
              <option value="Under Review">Under Review</option>
              <option value="Negotiating">Negotiating</option>
              <option value="Inspecting">Inspecting</option>
            </select>

            {/* Type Filter */}
            <select
              value={activeFilters.type}
              onChange={(e) => setActiveFilters({...activeFilters, type: e.target.value})}
              className="px-4 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-stellar-orange/20 focus:border-stellar-orange text-sm"
            >
              <option value="all">All Types</option>
              <option value="Hurricane Damage">Hurricane Damage</option>
              <option value="Water Damage">Water Damage</option>
              <option value="Wind Damage">Wind Damage</option>
            </select>

            {/* Value Range Filter */}
            <select
              value={activeFilters.valueRange}
              onChange={(e) => setActiveFilters({...activeFilters, valueRange: e.target.value})}
              className="px-4 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-stellar-orange/20 focus:border-stellar-orange text-sm"
            >
              <option value="all">All Values</option>
              <option value="under100k">Under $100k</option>
              <option value="100k-250k">$100k - $250k</option>
              <option value="over250k">Over $250k</option>
            </select>

            {/* Clear Filters Button */}
            {(searchQuery || activeFilters.status !== 'all' || activeFilters.type !== 'all' || activeFilters.valueRange !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setActiveFilters({ status: 'all', type: 'all', valueRange: 'all' })
                }}
                className="px-4 py-2 text-sm text-stellar-orange hover:bg-stellar-orange/10 rounded-lg transition-colors flex items-center gap-2"
              >
                <Filter size={16} />
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Recent Claims */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Active Claims</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">{filteredClaims.length} results</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filteredClaims.map((claim) => (
            <Link
              key={claim.id}
              href={`/dashboard/claims/${claim.id}`}
              className="block border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:border-stellar-orange transition cursor-pointer"
            >
              {/* Property Image with Address Overlay */}
              <div className="relative h-48 sm:h-56 bg-gray-100 dark:bg-gray-700">
                <img 
                  src={claim.imageUrl} 
                  alt={claim.property}
                  className="w-full h-full object-cover"
                />
                
                {/* Dark gradient from bottom */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0A1628] via-[#0A1628]/60 to-transparent" />
                
                {/* Property Address */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-bold text-white text-lg leading-tight drop-shadow-lg">
                    {claim.property}
                  </h3>
                </div>
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg ${
                    claim.status === 'Negotiating' ? 'bg-amber-500 text-white' :
                    claim.status === 'Under Review' ? 'bg-gray-600 text-white' :
                    'bg-blue-600 text-white'
                  }`}>
                    {claim.status}
                  </span>
                </div>
              </div>
              
              {/* Claim Details */}
              <div className="p-3 sm:p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-bold text-sm sm:text-base text-gray-900 dark:text-gray-100">{claim.id}</span>
                    </div>
                    <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100 truncate">{claim.client}</p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{claim.type}</span>
                      <span className="text-xs sm:text-sm font-semibold text-green-600">${claim.value.toLocaleString()}</span>
                    </div>
                  </div>
                  <ChevronRight className="text-gray-400 dark:text-gray-500 flex-shrink-0" size={20} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Settlement Negotiations Dashboard */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <HandshakeIcon className="text-stellar-orange" size={24} />
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Active Settlement Negotiations</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Johnson Properties Negotiation */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">CP-2024-94782</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Johnson Properties LLC</p>
              </div>
              <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full">Active</span>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Initial Demand:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">$385,450</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Current Offer:</span>
                <span className="font-semibold text-yellow-600">$275,000</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Target Settlement:</span>
                <span className="font-semibold text-green-600">$310,000</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">03/22 - Reviewing counter-offer</span>
              </div>
              <div className="text-xs text-gray-500 ml-4">
                AI recommends counter at $310K with settlement floor of $285K
              </div>
            </div>
          </div>

          {/* Sarah Mitchell Negotiation */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">RP-2024-94783</h3>
                <p className="text-sm text-gray-600">Sarah Mitchell</p>
              </div>
              <span className="px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded-full">Negotiating</span>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Initial Demand:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">$165,000</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Current Offer:</span>
                <span className="font-semibold text-yellow-600">$105,000</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Target Settlement:</span>
                <span className="font-semibold text-green-600">$145,000</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">03/21 - Awaiting insurer response</span>
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