'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, FileText, Download, Send, Edit3, CheckCircle,
  AlertTriangle, Camera, Mic, Brain, TrendingUp, DollarSign,
  Calendar, MapPin, User, Building2, Home, Eye, Star,
  Lightbulb, History, Target, Sparkles, Zap, Check
} from 'lucide-react'
import Link from 'next/link'

// Area Card Component
function AreaCard({
  area,
  enrichmentComplete,
  inspectionData,
  setInspectionData,
  getStatusIcon
}: {
  area: any
  enrichmentComplete: boolean
  inspectionData: any
  setInspectionData: any
  getStatusIcon: (status: string) => JSX.Element
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedArea, setEditedArea] = useState(area)

  return (
    <div className="bg-gray-50 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg">
      {/* Clickable Header */}
      <div
        className="p-6 cursor-pointer transition-colors hover:bg-gray-100"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-900">{area.name}</h3>
              {getStatusIcon(area.status)}
              {enrichmentComplete && (
                <span className="px-2 py-1 bg-stellar-orange/10 text-stellar-orange text-xs rounded-full flex items-center gap-1">
                  <Sparkles size={12} />
                  Enhanced
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">{area.category} • {area.status}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Camera size={16} />
                {area.photoCount}
              </span>
              <span className="flex items-center gap-1">
                <Mic size={16} />
                {area.audioCount}
              </span>
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: isExpanded ? 'auto' : 0,
          opacity: isExpanded ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
        className="border-t border-gray-200"
      >
        <div className="p-6 bg-white">
          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsEditing(false)
              }}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                !isEditing
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Eye size={16} />
              View Details
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsEditing(true)
              }}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                isEditing
                  ? 'bg-stellar-orange text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Edit3 size={16} />
              Edit Information
            </button>
            {isEditing && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  // Save edited data
                  const updatedData = { ...inspectionData }
                  const areaIndex = updatedData.areas.findIndex((a: any) => a.id === area.id)
                  if (areaIndex !== -1) {
                    updatedData.areas[areaIndex] = editedArea
                    setInspectionData(updatedData)
                  }
                  setIsEditing(false)
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
              >
                <CheckCircle size={16} />
                Save Changes
              </button>
            )}
          </div>

          {/* Detailed Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Findings Section */}
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FileText size={16} className="text-gray-500" />
                  Inspection Findings
                </h4>
                {isEditing ? (
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stellar-orange"
                    rows={3}
                    value={editedArea.findings}
                    onChange={(e) => setEditedArea({ ...editedArea, findings: e.target.value })}
                  />
                ) : (
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{area.findings}</p>
                )}
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-gray-500" />
                  Damage Assessment
                </h4>
                {isEditing ? (
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stellar-orange"
                    rows={3}
                    value={editedArea.damageDescription}
                    onChange={(e) => setEditedArea({ ...editedArea, damageDescription: e.target.value })}
                  />
                ) : (
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{area.damageDescription}</p>
                )}
              </div>
            </div>

            {/* Key Insights and Media */}
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Lightbulb size={16} className="text-gray-500" />
                  Key Insights
                </h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  {isEditing ? (
                    <div className="space-y-2">
                      {editedArea.keyInsights.map((insight: string, idx: number) => (
                        <input
                          key={idx}
                          className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-stellar-orange"
                          value={insight}
                          onChange={(e) => {
                            const newInsights = [...editedArea.keyInsights]
                            newInsights[idx] = e.target.value
                            setEditedArea({ ...editedArea, keyInsights: newInsights })
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <ul className="text-sm text-gray-700 space-y-1">
                      {area.keyInsights.map((insight: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-stellar-orange mt-0.5">•</span>
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Camera size={16} className="text-gray-500" />
                  Media Documentation
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                    <Camera className="mx-auto text-blue-600 mb-1" size={24} />
                    <p className="text-2xl font-bold text-blue-900">{area.photoCount}</p>
                    <p className="text-xs text-blue-700">Photos</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                    <Mic className="mx-auto text-green-600 mb-1" size={24} />
                    <p className="text-2xl font-bold text-green-900">{area.audioCount}</p>
                    <p className="text-xs text-green-700">Voice Notes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Report Preview Section */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
              <FileText size={16} />
              Final Report Preview
            </h4>
            <p className="text-sm text-amber-800">
              This information will be included in the final inspection report. Review carefully before approving.
            </p>
            <div className="mt-3 p-3 bg-white rounded border border-amber-300">
              <p className="text-xs font-mono text-gray-700">
                <span className="font-semibold">Area:</span> {area.name} ({area.category})<br/>
                <span className="font-semibold">Status:</span> {area.status}<br/>
                <span className="font-semibold">Documentation:</span> {area.photoCount} photos, {area.audioCount} audio recordings<br/>
                <span className="font-semibold">Findings:</span> {area.findings.substring(0, 100)}...
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

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
    estimatedRepairCost: number
    repairEstimate: number
    similarReportsAverage: number
    similarReportsRange: { min: number, max: number }
    similarReportsCount: number
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
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [inspectionData, setInspectionData] = useState<InspectionSummary | null>(null)

  // Load inspection data from localStorage and set up auto-save
  useEffect(() => {
    // Load saved data from localStorage
    const savedData = localStorage.getItem(`inspection-${inspectionId}-review`)
    if (savedData) {
      setInspectionData(JSON.parse(savedData))
    } else {
      // Use default data if no saved data exists
      setInspectionData(defaultInspectionSummary)
    }
  }, [inspectionId])

  // Auto-save functionality
  useEffect(() => {
    if (inspectionData) {
      const saveTimer = setTimeout(() => {
        setAutoSaveStatus('saving')
        localStorage.setItem(`inspection-${inspectionId}-review`, JSON.stringify(inspectionData))
        setTimeout(() => {
          setAutoSaveStatus('saved')
          setTimeout(() => setAutoSaveStatus('idle'), 2000)
        }, 500)
      }, 1000) // Save after 1 second of no changes

      return () => clearTimeout(saveTimer)
    }
  }, [inspectionData, inspectionId])

  // Default data - in production, this would be loaded from the inspection session
  const defaultInspectionSummary: InspectionSummary = {
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
      estimatedRepairCost: 285000,
      repairEstimate: 15170,
      similarReportsAverage: 278500,
      similarReportsRange: { min: 245000, max: 315000 },
      similarReportsCount: 27
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

    // Generate structured report data
    const reportData = {
      reportId: `RPT-${inspectionId}`,
      generatedDate: new Date().toISOString(),
      property: inspectionSummary.propertyDetails,
      inspection: {
        id: inspectionId,
        completedAreas: inspectionSummary.overallInsights.completedAreas,
        totalPhotos: inspectionSummary.overallInsights.totalPhotos,
        totalAudioNotes: inspectionSummary.overallInsights.totalAudioNotes,
        criticalIssues: inspectionSummary.overallInsights.criticalIssues
      },
      areas: inspectionSummary.areas.map(area => ({
        ...area,
        enrichedFindings: enrichmentComplete ? `Enhanced: ${area.findings} Additional AI analysis reveals potential hidden damage and code compliance issues.` : area.findings
      })),
      financialSummary: {
        estimatedValue: inspectionSummary.overallInsights.estimatedRepairCost,
        repairEstimate: inspectionSummary.overallInsights.repairEstimate,
        potentialSupplemental: 52000,
        totalRecoveryOpportunity: inspectionSummary.overallInsights.estimatedRepairCost + 52000
      },
      aiRecommendations: inspectionSummary.aiRecommendations,
      historicalFindings: inspectionSummary.historicalFindings,
      enrichmentStatus: enrichmentComplete
    }

    // Save report data to localStorage (in production, this would be saved to database)
    localStorage.setItem(`inspection-report-${inspectionId}`, JSON.stringify(reportData))

    // Mock processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsGeneratingReport(false)

    // Navigate to report page
    router.push(`/dashboard/inspection/${inspectionId}/report`)
  }

  const handleApproveReport = async () => {
    setIsGeneratingReport(true)

    // Generate structured report data with approved status
    const reportData = {
      reportId: `RPT-${inspectionId}`,
      generatedDate: new Date().toISOString(),
      status: 'approved',
      property: inspectionSummary.propertyDetails,
      inspection: {
        id: inspectionId,
        completedAreas: inspectionSummary.overallInsights.completedAreas,
        totalPhotos: inspectionSummary.overallInsights.totalPhotos,
        totalAudioNotes: inspectionSummary.overallInsights.totalAudioNotes,
        criticalIssues: inspectionSummary.overallInsights.criticalIssues
      },
      areas: inspectionSummary.areas.map(area => ({
        ...area,
        enrichedFindings: enrichmentComplete ? `Enhanced: ${area.findings} Additional AI analysis reveals potential hidden damage and code compliance issues.` : area.findings
      })),
      financialSummary: {
        estimatedValue: inspectionSummary.overallInsights.estimatedRepairCost,
        repairEstimate: inspectionSummary.overallInsights.repairEstimate,
        potentialSupplemental: 52000,
        totalRecoveryOpportunity: inspectionSummary.overallInsights.estimatedRepairCost + 52000
      },
      aiRecommendations: inspectionSummary.aiRecommendations,
      historicalFindings: inspectionSummary.historicalFindings,
      enrichmentStatus: enrichmentComplete
    }

    // Update report status to approved
    const existingReports = JSON.parse(sessionStorage.getItem('inspection_reports') || '[]')
    const reportIndex = existingReports.findIndex((r: any) => r.inspectionId === inspectionId)
    if (reportIndex !== -1) {
      existingReports[reportIndex].status = 'approved'
      existingReports[reportIndex].settlement.approved = inspectionSummary.overallInsights.estimatedRepairCost
    }
    sessionStorage.setItem('inspection_reports', JSON.stringify(existingReports))

    // Save report data to localStorage
    localStorage.setItem(`inspection-report-${inspectionId}`, JSON.stringify(reportData))

    // Mock processing delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsGeneratingReport(false)

    // Navigate to approved report page
    router.push(`/dashboard/inspection/${inspectionId}/report`)
  }

  const handleDownloadReport = async () => {
    // Generate PDF or structured JSON report
    const reportData = {
      reportId: `RPT-${inspectionId}`,
      generatedDate: new Date().toISOString(),
      property: inspectionSummary.propertyDetails,
      areas: inspectionSummary.areas,
      financials: {
        estimatedValue: inspectionSummary.overallInsights.estimatedRepairCost,
        repairEstimate: inspectionSummary.overallInsights.repairEstimate
      },
      enriched: enrichmentComplete
    }
    
    // Create and download JSON file
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inspection-report-${inspectionId}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleEnrichInspection = async () => {
    setIsEnriching(true)
    setEnrichmentProgress(0)
    
    // Simulate AI enrichment process with multiple steps
    const enrichmentSteps = [
      { label: 'Analyzing historical claims data', duration: 1500 },
      { label: 'Cross-referencing building codes', duration: 1200 },
      { label: 'Checking insurance policy updates', duration: 1000 },
      { label: 'Reviewing government regulations', duration: 800 },
      { label: 'Identifying missing damages', duration: 1500 },
      { label: 'Enhancing area descriptions', duration: 1000 },
      { label: 'Calculating supplemental opportunities', duration: 1000 },
      { label: 'Finalizing AI recommendations', duration: 1000 }
    ]
    
    for (let i = 0; i < enrichmentSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, enrichmentSteps[i].duration))
      setEnrichmentProgress(((i + 1) / enrichmentSteps.length) * 100)
    }
    
    // Enhance the area findings with AI
    if (inspectionData) {
      const enhancedData = { ...inspectionData }
      enhancedData.areas.forEach(area => {
        area.findings = `${area.findings} [AI Enhanced: Additional structural concerns identified. Potential code violations detected. Historical claim patterns suggest higher recovery potential.]`
      })
      setInspectionData(enhancedData)
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

  // Use inspectionData if available, otherwise use default
  const inspectionSummary = inspectionData || defaultInspectionSummary

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex flex-col gap-2">
            {/* Back Navigation */}
            <Link 
              href={`/dashboard/inspection`}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 cursor-pointer w-fit"
            >
              <ArrowLeft size={20} />
              Back to Inspections
            </Link>
            
            {/* Title Section */}
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-semibold text-gray-900">
                    Inspection Review
                  </h1>
                  <p className="text-sm text-gray-600">
                    {inspectionSummary.propertyDetails.address}
                  </p>
                </div>
                {autoSaveStatus !== 'idle' && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    {autoSaveStatus === 'saving' ? (
                      <>
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={12} className="text-green-500" />
                        Saved
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons Row - Below Title */}
              <div className="hidden md:flex items-center gap-3">
                <Link
                  href={`/dashboard/inspection/${inspectionId}/areas`}
                  className="flex items-center gap-2 text-gray-700 hover:text-gray-900 cursor-pointer"
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
                      AI Enhanced
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Enrich
                    </>
                  )}
                </button>


                {/* Approve Button - Primary Action */}
                <button
                  onClick={handleApproveReport}
                  disabled={isGeneratingReport}
                  className="bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700 hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none font-medium"
                >
                  {isGeneratingReport ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      Approve
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards - Improved Design */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          {/* Total Photos Card */}
          <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 p-4 md:p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-bl-full opacity-50" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <Camera className="text-blue-600" size={16} />
                </div>
                <span className="text-xs font-medium text-gray-600">Total Photos</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {inspectionSummary.overallInsights.totalPhotos}
              </p>
            </div>
          </div>

          {/* Areas Complete Card */}
          <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 p-4 md:p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-50 rounded-bl-full opacity-50" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-green-100 rounded-lg">
                  <CheckCircle className="text-green-600" size={16} />
                </div>
                <span className="text-xs font-medium text-gray-600">Areas Complete</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {inspectionSummary.overallInsights.completedAreas}
              </p>
            </div>
          </div>

          {/* Critical Issues Card */}
          <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 p-4 md:p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-red-50 rounded-bl-full opacity-50" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-red-100 rounded-lg">
                  <AlertTriangle className="text-red-600" size={16} />
                </div>
                <span className="text-xs font-medium text-gray-600">Critical Issues</span>
              </div>
              <p className="text-3xl font-bold text-red-600">
                {inspectionSummary.overallInsights.criticalIssues}
              </p>
            </div>
          </div>

          {/* Est. Repair Cost Card - Compact */}
          <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 p-4 md:p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-50 rounded-bl-full opacity-50" />
            <div className="flex flex-col h-full">
              {/* Header with icon */}
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-emerald-100 rounded-lg">
                  <DollarSign className="text-emerald-600" size={16} />
                </div>
                <span className="text-xs font-medium text-gray-600">Est. Repair Cost</span>
              </div>

              {/* Main Value */}
              <p className="text-2xl md:text-3xl font-bold text-emerald-600">
                ${(inspectionData?.overallInsights.estimatedRepairCost || 0).toLocaleString()}
              </p>

              {/* Based on reports - Single line */}
              <div className="text-xs text-gray-400 mt-2">
                Based on historical similar events
              </div>
            </div>
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

          {/* Action Buttons - Mobile Only */}
          <div className="block md:hidden border-b border-gray-200 px-3 py-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Link
                href={`/dashboard/inspection/${inspectionId}/areas`}
                className="flex items-center justify-center gap-2 py-2 px-2 bg-gray-100 text-gray-700 hover:text-gray-900 rounded-lg cursor-pointer text-sm"
              >
                <Edit3 size={16} />
                Edit Areas
              </Link>
              
              {/* AI Enrichment Button - Mobile */}
              <button
                onClick={handleEnrichInspection}
                disabled={isEnriching || enrichmentComplete}
                className={`py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm ${
                  enrichmentComplete 
                    ? 'bg-green-600 text-white' 
                    : 'bg-stellar-orange text-white hover:bg-orange-600'
                }`}
              >
                {isEnriching ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                    <span className="hidden">Enriching</span>
                  </>
                ) : enrichmentComplete ? (
                  <>
                    <CheckCircle size={16} />
                    <span>Enhanced</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Enrich</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              {/* Approve Button - Mobile */}
              <button
                onClick={handleApproveReport}
                disabled={isGeneratingReport}
                className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm font-medium"
              >
                {isGeneratingReport ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                    <span>Approving</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    <span>Approve</span>
                  </>
                )}
              </button>
            </div>
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

                {/* Repair Estimate Breakdown - Added as requested */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Intelligent Cost Estimation</h3>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="text-stellar-orange" size={14} />
                      <span className="text-xs text-gray-600">Market-based pricing</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Based on recent market prices for repair costs on similar cases in your area.
                  </p>
                  
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Repair Estimate Breakdown</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <div>
                          <div className="font-medium text-gray-900">Roof Repair</div>
                          <div className="text-xs text-gray-500">RFG 240 • 25 SQ</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">$285/SQ</div>
                          <div className="font-semibold text-gray-900">$7,125</div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <div>
                          <div className="font-medium text-gray-900">Gutter Replacement</div>
                          <div className="text-xs text-gray-500">GTR 110 • 120 LF</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">$12/LF</div>
                          <div className="font-semibold text-gray-900">$1,440</div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <div>
                          <div className="font-medium text-gray-900">Interior Water Damage</div>
                          <div className="text-xs text-gray-500">WTR 320 • 200 SF</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">$8/SF</div>
                          <div className="font-semibold text-gray-900">$1,600</div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <div>
                          <div className="font-medium text-gray-900">Painting & Finishing</div>
                          <div className="text-xs text-gray-500">PNT 450 • 300 SF</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">$4/SF</div>
                          <div className="font-semibold text-gray-900">$1,200</div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <div>
                          <div className="font-medium text-gray-900">Debris Removal</div>
                          <div className="text-xs text-gray-500">DBR 100 • 1 Load</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">$450</div>
                          <div className="font-semibold text-gray-900">$450</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium text-gray-900">$11,815</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Overhead & Profit (20%)</span>
                        <span className="font-medium text-gray-900">$2,363</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax (7%)</span>
                        <span className="font-medium text-gray-900">$992</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                        <span className="text-lg font-semibold text-gray-900">Total Estimate</span>
                        <span className="text-2xl font-bold text-stellar-orange">${inspectionSummary.overallInsights.repairEstimate.toLocaleString()}</span>
                      </div>
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
                  <AreaCard
                    key={area.id}
                    area={area}
                    enrichmentComplete={enrichmentComplete}
                    inspectionData={inspectionData}
                    setInspectionData={setInspectionData}
                    getStatusIcon={getStatusIcon}
                  />
                ))}

                {/* AI Enrichment Results Section */}
                {enrichmentComplete && (
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Brain className="text-stellar-orange" size={20} />
                      AI Enrichment Summary
                    </h4>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="bg-white rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 mb-2">Historical Patterns</h5>
                        <p className="text-sm text-gray-600">
                          3 similar cases found with average 28% higher settlements
                        </p>
                        <div className="mt-2 text-lg font-semibold text-green-600">
                          +$45,000 potential
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 mb-2">Code Violations</h5>
                        <p className="text-sm text-gray-600">
                          5 building code updates require compliance
                        </p>
                        <div className="mt-2 text-lg font-semibold text-stellar-orange">
                          Must address
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 mb-2">Coverage Gaps</h5>
                        <p className="text-sm text-gray-600">
                          2 unclaimed coverage types identified
                        </p>
                        <div className="mt-2 text-lg font-semibold text-blue-600">
                          +$12,500 available
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
                    transition={{ delay: idx * 0.1 }}
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
                      ${(inspectionSummary.overallInsights.estimatedRepairCost + 
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