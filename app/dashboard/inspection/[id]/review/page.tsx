'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, FileText, Download, Send, Edit3, CheckCircle,
  AlertTriangle, Camera, Mic, Brain, TrendingUp, DollarSign,
  Calendar, MapPin, User, Building2, Home, Eye, Star,
  Lightbulb, History, Target, Sparkles, Zap
} from 'lucide-react'
import Link from 'next/link'

interface InspectionSummary {
  propertyDetails: {
    address: string
    type: 'residential' | 'commercial'
    yearBuilt: string
    ownerName: string
    policyNumber: string
    damageTypes: string[]
  }
  areas: Array<{
    id: string
    name: string
    category: string
    status: 'completed' | 'skipped' | 'incomplete'
    photoCount: number
    audioCount: number
    findings: string
    damageDescription: string
    keyInsights: string[]
  }>
  overallInsights: {
    totalPhotos: number
    totalAudioNotes: number
    completedAreas: number
    skippedAreas: number
    criticalIssues: number
    opportunities: number
    estimatedValue: number
  }
  aiRecommendations: Array<{
    type: 'critical' | 'opportunity' | 'enhancement'
    title: string
    description: string
    potentialValue?: number
    confidence: number
  }>
  historicalFindings: Array<{
    title: string
    description: string
    potentialRecovery: number
    timeframe: string
  }>
}

export default function InspectionReviewPage() {
  const params = useParams()
  const router = useRouter()
  const inspectionId = params.id as string

  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [isEnriching, setIsEnriching] = useState(false)
  const [enrichmentComplete, setEnrichmentComplete] = useState(false)
  const [enrichmentProgress, setEnrichmentProgress] = useState(0)
  const [selectedTab, setSelectedTab] = useState('overview')

  // Mock data - in production, this would be loaded from the inspection session
  const inspectionSummary: InspectionSummary = {
    propertyDetails: {
      address: '1234 Ocean Drive, Miami Beach, FL 33101',
      type: 'residential',
      yearBuilt: '2005',
      ownerName: 'Johnson Properties LLC',
      policyNumber: 'POL-123456789',
      damageTypes: ['Hurricane', 'Water', 'Wind']
    },
    areas: [
      {
        id: 'exterior-roof',
        name: 'Roof & Gutters',
        category: 'Exterior',
        status: 'completed',
        photoCount: 8,
        audioCount: 2,
        findings: 'Multiple missing shingles, damaged gutters, visible water intrusion points.',
        damageDescription: 'Significant wind damage with 15+ missing/damaged shingles. Gutters detached on west side.',
        keyInsights: ['Roof decking likely compromised', 'Interior water damage probable', 'Emergency tarping recommended']
      },
      {
        id: 'exterior-siding',
        name: 'Siding & Walls',
        category: 'Exterior',
        status: 'completed',
        photoCount: 6,
        audioCount: 1,
        findings: 'Siding damage on north and west faces, window seal failures.',
        damageDescription: 'Impact damage from debris, several sections need replacement.',
        keyInsights: ['Moisture intrusion points identified', 'Insulation likely wet', 'Structural integrity intact']
      },
      {
        id: 'interior-living',
        name: 'Living Room',
        category: 'Interior',
        status: 'completed',
        photoCount: 12,
        audioCount: 3,
        findings: 'Water staining on ceiling, damaged flooring, mold growth visible.',
        damageDescription: 'Ceiling has water stains covering 40% of surface. Hardwood flooring warped and buckled.',
        keyInsights: ['Mold remediation required', 'Ceiling replacement needed', 'HVAC contamination possible']
      },
      {
        id: 'interior-kitchen',
        name: 'Kitchen',
        category: 'Interior',
        status: 'completed',
        photoCount: 10,
        audioCount: 2,
        findings: 'Cabinet water damage, appliance impacts, electrical concerns.',
        damageDescription: 'Lower cabinets saturated with water. Dishwasher and refrigerator damaged.',
        keyInsights: ['Electrical inspection needed', 'Complete cabinet replacement', 'Appliance replacement required']
      },
      {
        id: 'systems-hvac',
        name: 'HVAC System',
        category: 'Systems',
        status: 'completed',
        photoCount: 5,
        audioCount: 1,
        findings: 'Ductwork damaged, unit contaminated, air quality concerns.',
        damageDescription: 'Main unit flooded, ductwork shows mold growth, system inoperable.',
        keyInsights: ['Complete system replacement', 'Duct cleaning/replacement', 'Air quality testing needed']
      }
    ],
    overallInsights: {
      totalPhotos: 41,
      totalAudioNotes: 9,
      completedAreas: 5,
      skippedAreas: 0,
      criticalIssues: 3,
      opportunities: 2,
      estimatedValue: 285000
    },
    aiRecommendations: [
      {
        type: 'critical',
        title: 'Immediate Mold Remediation Required',
        description: 'Visible mold growth in multiple areas requires immediate professional remediation before further work.',
        confidence: 95
      },
      {
        type: 'opportunity',
        title: 'Hidden Damage Investigation',
        description: 'Based on visible damage patterns, additional hidden damage likely exists behind walls and in ceiling cavities.',
        potentialValue: 45000,
        confidence: 87
      },
      {
        type: 'enhancement',
        title: 'Code Upgrade Opportunities',
        description: 'Repairs provide opportunity to upgrade electrical and plumbing to current codes.',
        potentialValue: 15000,
        confidence: 78
      }
    ],
    historicalFindings: [
      {
        title: '2021 Water Damage Claim Underpayment',
        description: 'Previous water damage claim was settled for $8,500. Similar current damage suggests potential underpayment.',
        potentialRecovery: 12000,
        timeframe: 'Can be reopened within 3 years'
      },
      {
        title: '2022 Hurricane Ian Supplemental Opportunity',
        description: 'Original Hurricane Ian settlement missed HVAC contamination and hidden structural damage.',
        potentialRecovery: 28000,
        timeframe: 'Supplemental claim recommended'
      }
    ]
  }

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true)
    // Mock report generation
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsGeneratingReport(false)
    router.push(`/dashboard/inspection/${inspectionId}/report`)
  }

  const handleEnrichInspection = async () => {
    setIsEnriching(true)
    setEnrichmentProgress(0)
    
    // Simulate AI enrichment process with multiple steps
    const enrichmentSteps = [
      { label: 'Analyzing historical claims data', duration: 2000 },
      { label: 'Cross-referencing building codes', duration: 1500 },
      { label: 'Checking insurance policy updates', duration: 1800 },
      { label: 'Reviewing government regulations', duration: 1200 },
      { label: 'Identifying missing damages', duration: 2200 },
      { label: 'Enhancing documentation', duration: 1300 }
    ]
    
    for (let i = 0; i < enrichmentSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, enrichmentSteps[i].duration))
      setEnrichmentProgress(((i + 1) / enrichmentSteps.length) * 100)
    }
    
    setIsEnriching(false)
    setEnrichmentComplete(true)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={16} />
      case 'skipped':
        return <div className="w-4 h-4 rounded-full bg-gray-300" />
      default:
        return <AlertTriangle className="text-amber-500" size={16} />
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'areas', label: 'Area Details', icon: Building2 },
    { id: 'insights', label: 'AI Insights', icon: Brain },
    { id: 'opportunities', label: 'Opportunities', icon: TrendingUp }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href={`/dashboard/inspection`}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 cursor-pointer"
              >
                <ArrowLeft size={20} />
                Back to Inspections
              </Link>
              <div className="w-px h-6 bg-gray-300" />
              <div>
                <h1 className="text-3xl font-semibold text-gray-900">
                  Inspection Review
                </h1>
                <p className="text-sm text-gray-600">
                  {inspectionSummary.propertyDetails.address}
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <Link
                href={`/dashboard/inspection/${inspectionId}/area/exterior-roof`}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 cursor-pointer"
              >
                <Edit3 size={18} />
                Edit Areas
              </Link>
              
              {/* AI Enrichment Button */}
              <button
                onClick={handleEnrichInspection}
                disabled={isEnriching || enrichmentComplete}
                className={`px-6 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
                  enrichmentComplete 
                    ? 'bg-green-600 text-white' 
                    : 'bg-stellar-orange text-white hover:bg-orange-600'
                }`}
              >
                {isEnriching ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Enriching...
                  </>
                ) : enrichmentComplete ? (
                  <>
                    <CheckCircle size={18} />
                    Enriched
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Enrich with AI
                  </>
                )}
              </button>

              <button
                onClick={handleGenerateReport}
                disabled={isGeneratingReport}
                className="bg-gray-900 text-white px-6 py-2 rounded-xl hover:bg-gray-800 hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
              >
                {isGeneratingReport ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText size={18} />
                    Generate Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 p-4 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Photos</span>
              <Camera className="text-gray-400" size={20} />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {inspectionSummary.overallInsights.totalPhotos}
            </p>
          </div>

          <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 p-4 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Areas Complete</span>
              <CheckCircle className="text-gray-400" size={20} />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {inspectionSummary.overallInsights.completedAreas}
            </p>
          </div>

          <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 p-4 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Critical Issues</span>
              <AlertTriangle className="text-gray-400" size={20} />
            </div>
            <p className="text-3xl font-bold text-red-600">
              {inspectionSummary.overallInsights.criticalIssues}
            </p>
          </div>

          <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 p-4 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Est. Value</span>
              <DollarSign className="text-gray-400" size={20} />
            </div>
            <p className="text-3xl font-bold text-green-600">
              ${inspectionSummary.overallInsights.estimatedValue.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200">
          {/* Tab Headers */}
          <div className="border-b border-gray-200 px-3 md:px-6 py-3 md:py-4">
            <nav className="flex space-x-4 md:space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center gap-1 md:gap-2 py-2 px-1 border-b-2 font-medium text-xs md:text-sm transition-colors cursor-pointer relative whitespace-nowrap ${
                    selectedTab === tab.id
                      ? 'border-stellar-orange text-stellar-orange'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Edit Button - Mobile Only */}
          <div className="block md:hidden border-b border-gray-200 px-3 py-3">
            <Link
              href={`/dashboard/inspection/${inspectionId}/area/exterior-roof`}
              className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-gray-100 text-gray-700 hover:text-gray-900 rounded-lg cursor-pointer"
            >
              <Edit3 size={16} />
              Edit Areas
            </Link>
          </div>

          {/* Tab Content */}
          <div className="p-3 md:p-6">
            {selectedTab === 'overview' && (
              <div className="space-y-4 md:space-y-6">
                {/* Property Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <MapPin className="text-gray-400" size={18} />
                        <span className="text-gray-900">{inspectionSummary.propertyDetails.address}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {inspectionSummary.propertyDetails.type === 'residential' ? (
                          <Home className="text-gray-400" size={18} />
                        ) : (
                          <Building2 className="text-gray-400" size={18} />
                        )}
                        <span className="text-gray-900 capitalize">
                          {inspectionSummary.propertyDetails.type} • Built {inspectionSummary.propertyDetails.yearBuilt}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <User className="text-gray-400" size={18} />
                        <span className="text-gray-900">{inspectionSummary.propertyDetails.ownerName}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Damage Types</h3>
                    <div className="flex flex-wrap gap-2">
                      {inspectionSummary.propertyDetails.damageTypes.map((type) => (
                        <span
                          key={type}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Area Status Grid */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Area Completion Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {inspectionSummary.areas.map((area) => (
                      <div key={area.id} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{area.name}</h4>
                          {getStatusIcon(area.status)}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">{area.category}</div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Camera size={14} />
                            {area.photoCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mic size={14} />
                            {area.audioCount}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'areas' && (
              <div className="space-y-6">
                {inspectionSummary.areas.map((area) => (
                  <div key={area.id} className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-900">{area.name}</h3>
                          {enrichmentComplete && (
                            <span className="px-2 py-1 bg-stellar-orange/10 text-stellar-orange text-xs rounded-full flex items-center gap-1">
                              <Sparkles size={12} />
                              Enhanced
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{area.category} • {area.status}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Camera size={16} />
                          {area.photoCount} photos
                        </span>
                        <span className="flex items-center gap-1">
                          <Mic size={16} />
                          {area.audioCount} audio
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Findings</h4>
                        <p className="text-sm text-gray-600">{area.findings}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Damage Description</h4>
                        <p className="text-sm text-gray-600">{area.damageDescription}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Key Insights</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {area.keyInsights.map((insight, idx) => (
                            <li key={idx}>• {insight}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* AI Enrichment Results */}
                    {enrichmentComplete && (
                      <div className="border-t border-gray-200 pt-4">
                        <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <Brain className="text-stellar-orange" size={16} />
                          AI Enrichment Results
                        </h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h5 className="font-medium text-blue-900 mb-2">Historical Data Match</h5>
                            <p className="text-sm text-blue-800">
                              Similar damage patterns in 2021 Hurricane Ida resulted in 23% higher settlements when roof decking replacement was included.
                            </p>
                            <div className="mt-2 text-xs text-blue-600 font-medium">
                              +$12,000 potential increase
                            </div>
                          </div>
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <h5 className="font-medium text-amber-900 mb-2">Code Compliance Gap</h5>
                            <p className="text-sm text-amber-800">
                              2023 Florida Building Code requires impact-resistant materials for roof replacement in this wind zone.
                            </p>
                            <div className="mt-2 text-xs text-amber-600 font-medium">
                              Code upgrade opportunity
                            </div>
                          </div>
                          {area.name === 'Living Room' && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                              <h5 className="font-medium text-red-900 mb-2">Missing Coverage Detected</h5>
                              <p className="text-sm text-red-800">
                                Policy analysis reveals coverage for temporary housing costs during mold remediation not claimed.
                              </p>
                              <div className="mt-2 text-xs text-red-600 font-medium">
                                +$8,500 potential recovery
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {selectedTab === 'insights' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">AI-Generated Insights & Recommendations</h3>
                
                {inspectionSummary.aiRecommendations.map((rec, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    delay={idx * 0.1}
                    className={`p-6 rounded-xl ${
                      rec.type === 'critical' ? 'bg-red-50 border border-red-200' :
                      rec.type === 'opportunity' ? 'bg-green-50 border border-green-200' :
                      'bg-blue-50 border border-blue-200'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${
                        rec.type === 'critical' ? 'bg-red-100' :
                        rec.type === 'opportunity' ? 'bg-green-100' :
                        'bg-blue-100'
                      }`}>
                        {rec.type === 'critical' ? (
                          <AlertTriangle className="text-red-600" size={20} />
                        ) : rec.type === 'opportunity' ? (
                          <TrendingUp className="text-green-600" size={20} />
                        ) : (
                          <Lightbulb className="text-blue-600" size={20} />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                          <div className="flex items-center gap-2">
                            {rec.potentialValue && (
                              <span className="text-green-600 font-semibold">
                                +${rec.potentialValue.toLocaleString()}
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              {rec.confidence}% confidence
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-700">{rec.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {selectedTab === 'opportunities' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Historical Recovery Opportunities</h3>
                
                {inspectionSummary.historicalFindings.map((finding, idx) => (
                  <div key={idx} className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <History className="text-amber-600" size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{finding.title}</h4>
                          <span className="text-green-600 font-bold text-lg">
                            +${finding.potentialRecovery.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-2">{finding.description}</p>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar size={14} className="text-gray-400" />
                          <span className="text-gray-600">{finding.timeframe}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Target className="text-green-600" size={24} />
                    <h4 className="font-semibold text-gray-900">Total Recovery Opportunity</h4>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-700">
                      Combined current claim and historical recovery potential
                    </p>
                    <span className="text-green-600 font-bold text-2xl">
                      ${(inspectionSummary.overallInsights.estimatedValue + 
                        inspectionSummary.historicalFindings.reduce((sum, f) => sum + f.potentialRecovery, 0)
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Enrichment Modal */}
      {isEnriching && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mb-6">
                <Brain className="mx-auto text-stellar-orange animate-pulse" size={48} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Enhancement in Progress</h3>
              <p className="text-gray-600 mb-6">
                Analyzing your inspection with historical data, building codes, and insurance policies to ensure nothing is missed.
              </p>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div 
                  className="bg-stellar-orange h-3 rounded-full transition-all duration-500"
                  style={{ width: `${enrichmentProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500">
                {Math.round(enrichmentProgress)}% complete
              </p>
              
              {/* Current Step */}
              <div className="mt-4 p-3 bg-stellar-orange/10 rounded-lg">
                <p className="text-sm text-stellar-orange font-medium">
                  {enrichmentProgress < 17 ? 'Analyzing historical claims data' :
                   enrichmentProgress < 33 ? 'Cross-referencing building codes' :
                   enrichmentProgress < 50 ? 'Checking insurance policy updates' :
                   enrichmentProgress < 67 ? 'Reviewing government regulations' :
                   enrichmentProgress < 83 ? 'Identifying missing damages' :
                   'Enhancing documentation'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enrichment Success Banner */}
      {enrichmentComplete && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white p-4 rounded-xl shadow-lg z-40 max-w-sm">
          <div className="flex items-center gap-3">
            <CheckCircle size={24} />
            <div>
              <h4 className="font-semibold">Inspection Enriched!</h4>
              <p className="text-sm text-green-100">
                Found 3 additional findings and enhanced documentation with historical data.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}