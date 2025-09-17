'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Download, Send, Share2, FileText,
  CheckCircle, AlertTriangle, TrendingUp, DollarSign,
  Calendar, MapPin, User, Building2, Home, Camera,
  Brain, Lightbulb, History, Target, Star, Award,
  Globe, Shield, AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { generateInspectionPDF, downloadHTMLReport, InspectionReportData } from '@/lib/pdf/simple-report-generator'

interface ReportData {
  metadata: {
    reportId: string
    generatedDate: string
    inspector: string
    property: {
      address: string
      type: 'residential' | 'commercial'
      yearBuilt: string
      owner: string
      policyNumber: string
    }
    claimInfo: {
      dateOfLoss: string
      damageTypes: string[]
      initialEstimate: number
    }
  }
  executiveSummary: {
    totalDamageValue: number
    criticalIssues: number
    repairRecommendations: string[]
    timelineEstimate: string
    confidenceScore: number
  }
  areaFindings: Array<{
    area: string
    category: string
    status: 'damaged' | 'minor' | 'none'
    photoCount: number
    description: string
    estimatedCost: number
    priority: 'high' | 'medium' | 'low'
    recommendations: string[]
    technicalFindings?: Record<string, string>
    materialSpecs?: Record<string, string>
    environmentalConcerns?: Record<string, string>
    appliancesAffected?: string[]
    energyEfficiency?: Record<string, string | number>
    safetyHazards?: string[]
    waterQualityIssues?: Record<string, string>
  }>
  aiInsights: {
    hiddenDamageEstimate: number
    codeUpgradeOpportunities: number
    historicalRecovery: number
    marketComparison: string
    confidenceMetrics: {
      damagePrediction: number
      costAccuracy: number
      timelineReliability: number
      riskAssessment: number
    }
    historicalData: {
      similarClaims: number
      averageSettlement: number
      timeToResolution: string
      litigationRate: string
      carrierBehavior: string
    }
    predictiveAnalysis: {
      additionalDamageRisk: string
      costInflationFactor: string
      materialAvailability: string
      contractorCapacity: string
    }
    riskAssessment: string[]
    environmentalFactors: {
      hurricaneHistory: string
      floodZone: string
      soilConditions: string
      seismicRisk: string
      windZone: string
    }
    claimsIntelligence: {
      carrierProfile: {
        name: string
        claimsReputation: string
        negotiationHistory: string
        preferredExperts: string
        timelineBehavior: string
      }
      strategicConsiderations: string[]
    }
  }
  financialSummary: {
    currentClaimValue: number
    historicalRecovery: number
    potentialSupplemental: number
    totalRecoveryOpportunity: number
    breakdown: Array<{
      category: string
      amount: number
      description: string
    }>
    detailedCostAnalysis: {
      laborCosts: {
        skilled: { rate: number, hours: number, total: number }
        general: { rate: number, hours: number, total: number }
        specialized: { rate: number, hours: number, total: number }
      }
      materialCosts: {
        roofing: { sqft: number, rate: number, total: number }
        flooring: { sqft: number, rate: number, total: number }
        electrical: { circuits: number, rate: number, total: number }
        plumbing: { fixtures: number, average: number, total: number }
      }
      permitsCosts: {
        building: number
        electrical: number
        plumbing: number
        environmental: number
      }
      contingencyReserve: {
        percentage: number
        amount: number
        justification: string
      }
    }
    marketComparatives: {
      regionalAverages: {
        sqftCost: number
        timelineWeeks: number
        qualityGrade: string
      }
      competitiveBids: Array<{
        name: string
        bid: number
        timeline: string
      }>
    }
  }
}

export default function InspectionReportPage() {
  const params = useParams()
  const router = useRouter()
  const inspectionId = params.id as string

  const [isSending, setIsSending] = useState(false)
  const [reportSent, setReportSent] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isApproved, setIsApproved] = useState<boolean | null>(null)
  const [storedReportData, setStoredReportData] = useState<any>(null)

  // Check if report is approved on mount
  useEffect(() => {
    // First check if there's a specific report for this inspection
    const reportKey = `report_RPT-${Date.now()}` // We need to find the actual key
    const reports = JSON.parse(sessionStorage.getItem('inspection_reports') || '[]')

    // Find the report for this inspection
    const report = reports.find((r: any) => r.inspectionId === inspectionId)

    if (report) {
      // Check if status is approved
      if (report.status === 'approved') {
        setIsApproved(true)
        // Try to get the full report data
        const fullReportKey = Object.keys(sessionStorage).find(key =>
          key.startsWith('report_') && sessionStorage.getItem(key)?.includes(inspectionId)
        )
        if (fullReportKey) {
          const fullReport = JSON.parse(sessionStorage.getItem(fullReportKey) || '{}')
          if (fullReport.status === 'approved') {
            setStoredReportData(fullReport)
          }
        }
      } else {
        setIsApproved(false)
      }
    } else {
      // Check if this is a demo report ID from the reports page (these are always approved)
      // Demo report IDs are: '1', '2', '4', '6' (the approved ones from mockCompletedReports)
      const demoApprovedIds = ['1', '2', '4', '6', 'INS-002']
      if (demoApprovedIds.includes(inspectionId)) {
        setIsApproved(true)
      } else {
        // No report found - not approved
        setIsApproved(false)
      }
    }
  }, [inspectionId])

  // Comprehensive AI-Enhanced Report Data - Generated by Stellar Intelligence Platform
  const reportData: ReportData = storedReportData || {
    metadata: {
      reportId: `RPT-${inspectionId}`,
      generatedDate: '2025-09-11',
      inspector: 'James Rodriguez',
      property: {
        address: '1234 Ocean Drive, Miami Beach, FL 33101',
        type: 'residential',
        yearBuilt: '2005',
        owner: 'Johnson Properties LLC',
        policyNumber: 'POL-123456789'
      },
      claimInfo: {
        dateOfLoss: '2024-03-15',
        damageTypes: ['Hurricane', 'Water', 'Wind'],
        initialEstimate: 165000
      }
    },
    executiveSummary: {
      totalDamageValue: 285000,
      criticalIssues: 3,
      repairRecommendations: [
        'Immediate mold remediation required',
        'Emergency roof tarping and structural assessment',
        'HVAC system complete replacement',
        'Electrical safety inspection mandatory'
      ],
      timelineEstimate: '6-8 weeks for complete restoration',
      confidenceScore: 94
    },
    areaFindings: [
      {
        area: 'Roof System & Weather Protection',
        category: 'Exterior',
        status: 'damaged',
        photoCount: 18,
        description: 'Catastrophic wind uplift damage affecting 45% of roof surface. 47 asphalt shingles completely missing, exposing synthetic underlayment. Granule loss on remaining shingles indicates hail impact. Three sections of guttering detached with soffit damage. Flashing compromised at chimney and vent penetrations.',
        estimatedCost: 67500,
        priority: 'high',
        technicalFindings: {
          windSpeed: '95+ mph sustained',
          hailSize: '1.75 inch diameter',
          exposureLevel: 'Class 4 impact damage',
          structuralImpact: 'Decking inspection required',
          codeUpgrades: 'Hurricane strapping, impact-resistant materials'
        },
        materialSpecs: {
          shingles: 'GAF Timberline HD, Charcoal (30-year)',
          underlayment: 'Synthetic, self-adhering ice & water shield',
          decking: '7/16" OSB structural sheathing inspection required',
          flashing: 'Galvanized steel, step and apron replacement'
        },
        recommendations: [
          'Emergency tarping within 24 hours',
          'Structural engineering assessment',
          'Complete roof system replacement with code upgrades',
          'Hurricane strap installation per Florida Building Code'
        ]
      },
      {
        area: 'Primary Living Areas',
        category: 'Interior',
        status: 'damaged',
        photoCount: 24,
        description: 'Extensive water intrusion affecting 1,200 sq ft of interior space. Multiple ceiling penetrations with active water damage patterns. Hardwood flooring cupping and separation across 800 sq ft. Drywall moisture content exceeds 28% in affected areas. Visible mold growth detected behind baseboards and electrical outlets.',
        estimatedCost: 48000,
        priority: 'high',
        technicalFindings: {
          moistureContent: '28-35% (normal: <16%)',
          temperatureVariation: '15°F differential zones',
          airQualityIndex: 'Elevated spore count: 2,400/m³',
          structuralMoisture: 'Floor joists: 22% MC',
          insulationSaturation: '85% compromised R-value'
        },
        environmentalConcerns: {
          moldType: 'Stachybotrys chartarum detected',
          airborne: 'Spore levels 4x normal baseline',
          healthRisk: 'Class 2 - Moderate respiratory risk',
          containment: 'Required per IICRC S520 standards'
        },
        recommendations: [
          'Immediate containment barriers',
          'Professional mold remediation (IICRC certified)',
          'Complete flooring replacement',
          'Drywall replacement up to 4ft height',
          'HEPA air filtration during restoration'
        ]
      },
      {
        area: 'Kitchen & Food Preparation Zone',
        category: 'Interior',
        status: 'damaged',
        photoCount: 16,
        description: 'Significant water damage to cabinetry and electrical systems. Custom hardwood cabinets show 15% moisture expansion and veneer delamination. Granite countertop shows stress fractures near sink area. All major appliances show water contact damage. GFCI outlets tripped - electrical safety hazard present.',
        estimatedCost: 42000,
        priority: 'high',
        technicalFindings: {
          cabinetMoisture: '19-24% MC (exceeds 16% threshold)',
          electricalHazard: '3 GFCI circuits compromised',
          flooringDamage: 'Ceramic tile: 12% hairline cracks',
          applianceImpact: 'Water line contamination detected',
          ventilationIssue: 'Range hood ductwork compromised'
        },
        appliancesAffected: [
          'Refrigerator: Water filtration system contaminated',
          'Dishwasher: Control board water damage',
          'Range/Oven: Electrical connections compromised',
          'Microwave: Ventilation system affected'
        ],
        recommendations: [
          'Immediate electrical disconnect and inspection',
          'Complete cabinet replacement with water-resistant materials',
          'Appliance replacement due to water contamination',
          'Granite countertop professional assessment',
          'GFCI circuit rewiring per NEC standards'
        ]
      },
      {
        area: 'HVAC & Climate Control Systems',
        category: 'Systems',
        status: 'damaged',
        photoCount: 12,
        description: 'Complete system failure due to flood contamination. 4-ton central air unit submerged for 6+ hours. Ductwork shows standing water and organic growth. Return air system compromised with debris infiltration. Condensate drainage system backed up, contributing to interior flooding.',
        estimatedCost: 38000,
        priority: 'high',
        technicalFindings: {
          systemAge: '8 years (Trane XR14)',
          contaminationLevel: 'Category 3 water exposure',
          ductworkCompromise: '85% of system affected',
          insulationStatus: 'Complete replacement required',
          airQualityRisk: 'High - biological contaminants present'
        },
        energyEfficiency: {
          currentSEER: '14 (pre-damage rating)',
          recommendedSEER: '16+ for Florida climate zone',
          estimatedSavings: '$1,200 annually with upgrade',
          utilityRebates: 'Up to $1,500 available'
        },
        recommendations: [
          'Complete system replacement - not economically repairable',
          'Ductwork replacement with antimicrobial treatment',
          'High-efficiency system upgrade (16+ SEER rating)',
          'Smart thermostat installation',
          'Air quality monitoring system integration'
        ]
      },
      {
        area: 'Electrical Infrastructure',
        category: 'Systems',
        status: 'damaged',
        photoCount: 8,
        description: 'Critical electrical safety concerns throughout property. Main panel shows water intrusion with visible corrosion on bus bars. Multiple circuits tripped with arc fault indicators. Ground fault protection compromised in wet areas. Aluminum wiring detected in portions of the home built in 2005.',
        estimatedCost: 28500,
        priority: 'high',
        technicalFindings: {
          panelAge: '19 years (200A service)',
          corrosionLevel: 'Moderate on 8 of 24 circuits',
          groundingIssues: '3 GFCI outlets non-functional',
          aluminumWiring: '40% of branch circuits',
          codeCompliance: 'Does not meet current NEC 2020'
        },
        safetyHazards: [
          'Water in electrical panel - immediate disconnect required',
          'Aluminum wiring oxidation - fire hazard',
          'Missing GFCI protection in bathroom and kitchen',
          'Exposed wiring in damaged wall sections'
        ],
        recommendations: [
          'Emergency electrical inspection by licensed electrician',
          'Main panel replacement with arc fault breakers',
          'Aluminum wiring remediation with copper pigtailing',
          'GFCI outlet installation per current code',
          'Whole-house surge protection system'
        ]
      },
      {
        area: 'Plumbing & Water Systems',
        category: 'Systems',
        status: 'damaged',
        photoCount: 10,
        description: 'Multiple plumbing system failures contributing to water damage. Supply lines show pressure damage from storm surge. Water heater compromised with sediment contamination. Sewage backup evidence in lower-level areas. Fresh water contamination detected.',
        estimatedCost: 22000,
        priority: 'medium',
        technicalFindings: {
          waterHeaterAge: '6 years (50-gallon gas)',
          supplyLinesDamage: 'Pressure test failed - 3 locations',
          sewerBackup: 'Category 3 contamination present',
          waterQuality: 'Bacterial count elevated',
          fixtureDamage: '60% require replacement'
        },
        waterQualityIssues: {
          bacterialCount: '2,400 CFU/mL (normal: <100)',
          contaminants: 'Organic debris, sewage infiltration',
          treatmentRequired: 'Disinfection and filtration',
          testingSchedule: 'Weekly monitoring for 30 days'
        },
        recommendations: [
          'Complete water quality testing and treatment',
          'Water heater replacement due to contamination',
          'Supply line repairs with pressure testing',
          'Sewage system inspection and cleaning',
          'Whole-house water filtration system installation'
        ]
      }
    ],
    aiInsights: {
      hiddenDamageEstimate: 78000,
      codeUpgradeOpportunities: 34000,
      historicalRecovery: 52000,
      marketComparison: 'Comparative analysis of 247 similar claims in Miami-Dade County shows average settlement 42% higher than initial estimates',
      confidenceMetrics: {
        damagePrediction: 94.3,
        costAccuracy: 91.7,
        timelineReliability: 88.9,
        riskAssessment: 96.2
      },
      historicalData: {
        similarClaims: 247,
        averageSettlement: 465000,
        timeToResolution: '4.2 months average',
        litigationRate: '18% of cases',
        carrierBehavior: 'Historically underpays structural claims by 28%'
      },
      predictiveAnalysis: {
        additionalDamageRisk: 'HIGH - 87% probability of discovering concealed damage',
        costInflationFactor: '12% anticipated increase over 6-month timeline',
        materialAvailability: 'Moderate delays expected for roofing materials',
        contractorCapacity: 'Limited availability in storm-affected region'
      },
      riskAssessment: [
        'CRITICAL: Mold proliferation risk - 96% probability without immediate remediation',
        'HIGH: Structural degradation - moisture compromising load-bearing elements',
        'HIGH: Electrical fire hazard - water-damaged panel poses immediate danger',
        'MODERATE: Foundation settlement - monitor for movement over 30 days',
        'HIGH: Air quality degradation - spore levels 4x safe threshold',
        'MODERATE: Security vulnerability - damaged entry points compromise safety'
      ],
      environmentalFactors: {
        hurricaneHistory: '3 major hurricanes in 15 years',
        floodZone: 'AE - Special Flood Hazard Area',
        soilConditions: 'Sandy loam, moderate drainage',
        seismicRisk: 'Minimal - Zone 0',
        windZone: '146-155 mph design requirement'
      },
      claimsIntelligence: {
        carrierProfile: {
          name: 'Regional Property Insurance',
          claimsReputation: 'Tends to undervalue structural claims by 25-35%',
          negotiationHistory: 'Typically settles at 78% of initial demand',
          preferredExperts: 'List of 12 approved contractors provided',
          timelineBehavior: 'Averages 90 days from claim to settlement'
        },
        strategicConsiderations: [
          'File supplemental immediately - carrier historically resistant',
          'Document all hidden damage with thermal imaging',
          'Engage structural engineer early for credibility',
          'Push for temporary housing allowance - strong precedent',
          'Consider public adjuster if settlement offered below $350K'
        ]
      }
    },
    financialSummary: {
      currentClaimValue: 425000,
      historicalRecovery: 52000,
      potentialSupplemental: 187000,
      totalRecoveryOpportunity: 664000,
      breakdown: [
        { category: 'Structural Systems Repair', amount: 165000, description: 'Complete roof replacement, hurricane strapping, structural reinforcement, foundation waterproofing' },
        { category: 'Interior Restoration & Finishes', amount: 128000, description: 'Premium flooring systems, drywall replacement, custom millwork, professional painting, window treatments' },
        { category: 'Mechanical Systems Replacement', amount: 89000, description: 'High-efficiency HVAC system, complete electrical panel upgrade, plumbing modernization, smart home integration' },
        { category: 'Environmental Remediation', amount: 67000, description: 'Professional mold abatement, air quality restoration, contaminated material disposal, HEPA filtration' },
        { category: 'Hidden & Concealed Damage', amount: 78000, description: 'AI-predicted structural damage, concealed moisture damage, thermal imaging discoveries' },
        { category: 'Historical Claim Recovery', amount: 52000, description: 'Underpayment recovery analysis, supplemental claim opportunities, carrier adjustment errors' },
        { category: 'Code Compliance & Upgrades', amount: 49000, description: 'Hurricane mitigation features, electrical code updates, accessibility improvements, energy efficiency upgrades' },
        { category: 'Emergency Services & Mitigation', amount: 36000, description: 'Emergency tarping, water extraction, dehumidification, temporary housing, storage costs' }
      ],
      detailedCostAnalysis: {
        laborCosts: {
          skilled: { rate: 85, hours: 2400, total: 204000 },
          general: { rate: 45, hours: 800, total: 36000 },
          specialized: { rate: 125, hours: 320, total: 40000 }
        },
        materialCosts: {
          roofing: { sqft: 3200, rate: 18.50, total: 59200 },
          flooring: { sqft: 2400, rate: 12.75, total: 30600 },
          electrical: { circuits: 24, rate: 450, total: 10800 },
          plumbing: { fixtures: 12, average: 1250, total: 15000 }
        },
        permitsCosts: {
          building: 2400,
          electrical: 800,
          plumbing: 600,
          environmental: 1200
        },
        contingencyReserve: {
          percentage: 15,
          amount: 99600,
          justification: 'High probability of additional discoveries during restoration'
        }
      },
      marketComparatives: {
        regionalAverages: {
          sqftCost: 245,
          timelineWeeks: 16,
          qualityGrade: 'Premium restoration standards'
        },
        competitiveBids: [
          { name: 'Elite Restoration', bid: 612000, timeline: '14 weeks' },
          { name: 'Precision Builders', bid: 638000, timeline: '16 weeks' },
          { name: 'Heritage Construction', bid: 596000, timeline: '18 weeks' }
        ]
      }
    }
  }

  const handleSendReport = async () => {
    setIsSending(true)
    // Mock sending process
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsSending(false)
    setReportSent(true)
  }

  const handleDownloadPDF = async () => {
    setIsDownloading(true)
    
    try {
      // Prepare data for PDF generation
      const pdfData: InspectionReportData = {
        metadata: {
          reportId: reportData.metadata.reportId,
          claimNumber: `CLM-${inspectionId}`,
          generatedDate: reportData.metadata.generatedDate,
          inspector: reportData.metadata.inspector,
          property: {
            address: reportData.metadata.property.address,
            city: 'Miami',
            state: 'FL',
            zipCode: '33101',
            type: reportData.metadata.property.type,
            yearBuilt: reportData.metadata.property.yearBuilt,
            owner: reportData.metadata.property.owner,
            policyNumber: reportData.metadata.property.policyNumber
          },
          claimInfo: reportData.metadata.claimInfo
        },
        executiveSummary: reportData.executiveSummary,
        areaFindings: reportData.areaFindings.map(area => ({
          ...area,
          findings: area.description,
          damageDescription: area.description,
          photos: [] // Would include base64 photos in production
        })),
        aiInsights: {
          hiddenDamageEstimate: reportData.aiInsights.hiddenDamageEstimate,
          codeUpgradeOpportunities: reportData.aiInsights.codeUpgradeOpportunities,
          historicalRecovery: reportData.aiInsights.historicalRecovery,
          marketComparison: reportData.aiInsights.marketComparison,
          riskAssessment: reportData.aiInsights.riskAssessment
        },
        financialSummary: {
          subtotal: reportData.financialSummary.currentClaimValue,
          hiddenDamage: reportData.aiInsights.hiddenDamageEstimate,
          codeUpgrades: reportData.aiInsights.codeUpgradeOpportunities,
          contingency: Math.round(reportData.financialSummary.currentClaimValue * 0.1),
          total: reportData.financialSummary.totalRecoveryOpportunity,
          insuranceEstimate: reportData.metadata.claimInfo.initialEstimate,
          gap: reportData.financialSummary.totalRecoveryOpportunity - reportData.metadata.claimInfo.initialEstimate
        }
      }
      
      // Generate and download PDF report
      // This will open a print dialog where users can save as PDF
      await generateInspectionPDF(pdfData)
      
      console.log('PDF report generated successfully')
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }


  const getStatusBadge = (status: string, priority: string) => {
    const baseClasses = 'px-3 py-1 rounded-full text-xs font-medium'
    
    if (status === 'damaged') {
      return priority === 'high' 
        ? `${baseClasses} bg-red-100 text-red-800`
        : `${baseClasses} bg-orange-100 text-orange-800`
    }
    return `${baseClasses} bg-green-100 text-green-800`
  }

  // Show loading state while checking approval status
  if (isApproved === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-stellar-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading report...</p>
        </div>
      </div>
    )
  }

  // Show loading state while checking approval status
  if (isApproved === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-stellar-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking report status...</p>
        </div>
      </div>
    )
  }

  // Show not approved message if report is not approved
  if (isApproved === false) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle size={64} className="text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Report Pending Approval</h2>
          <p className="text-gray-600 mb-6">
            This inspection report is currently under review and has not been approved yet.
            Please complete the approval process to view the final report.
          </p>
          <Link
            href={`/dashboard/inspection/${inspectionId}/review`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-stellar-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <ArrowLeft size={20} />
            Go to Review Page
          </Link>
        </div>
      </div>
    )
  }

  // Show the approved report
  return (
    <div className="min-h-screen">
      {/* Header - Non-printable */}
      <div className="bg-white border-b border-gray-200 print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
          <div>
            <Link
              href={`/dashboard/inspection/${inspectionId}/review`}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-3"
            >
              <ArrowLeft size={20} />
              <span>Back to Review</span>
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 break-words">
                <span className="block sm:inline">Inspection Report</span>
                <span className="block sm:inline sm:ml-1">- {reportData.metadata.reportId}</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                Generated {reportData.metadata.generatedDate}
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                <button
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg transform transition-all duration-200 text-sm sm:text-base w-full sm:w-auto ${
                    isDownloading
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-white border border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-50 hover:shadow-sm hover:scale-[1.02] cursor-pointer'
                  }`}
                >
                  <Download size={18} className={isDownloading ? 'animate-pulse' : ''} />
                  <span>{isDownloading ? 'Downloading...' : 'Download PDF'}</span>
                </button>
                <button
                  onClick={handleSendReport}
                  disabled={isSending || reportSent}
                  className={`px-4 sm:px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto ${
                    reportSent
                      ? 'bg-green-600 text-white'
                      : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer disabled:opacity-50'
                  }`}
                >
                  {isSending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      <span>Sending...</span>
                    </>
                  ) : reportSent ? (
                    <>
                      <CheckCircle size={18} />
                      <span>Sent</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Send to Client</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="max-w-7xl mx-auto py-3 sm:py-8 print:py-0">
        {/* Professional Cover Page - Print Only */}
        <div className="hidden print:block print:page-break-after">
          <div className="relative h-[400px] mb-8">
            {/* Property Image with Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-transparent">
              <img 
                src="https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200" 
                alt="Property" 
                className="w-full h-full object-cover"
              />
            </div>
            {/* Property Address Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <h1 className="text-4xl font-bold mb-2">{reportData.metadata.property.address}</h1>
              <p className="text-xl opacity-90">Miami, FL 33101</p>
            </div>
          </div>
          
          {/* Report Title and Details */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">COMPREHENSIVE HOME INSPECTION REPORT</h2>
            <div className="w-24 h-1 bg-stellar-orange mx-auto mb-8"></div>
            
            {/* Report Metadata Grid */}
            <div className="grid grid-cols-2 gap-8 max-w-3xl mx-auto mb-12">
              <div className="text-left">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">PROPERTY DETAILS</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Report Number:</span>
                    <span className="font-medium">{reportData.metadata.reportId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Inspection Date:</span>
                    <span className="font-medium">{reportData.metadata.generatedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Property Type:</span>
                    <span className="font-medium capitalize">{reportData.metadata.property.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Year Built:</span>
                    <span className="font-medium">{reportData.metadata.property.yearBuilt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Square Footage:</span>
                    <span className="font-medium">3,200 sq ft</span>
                  </div>
                </div>
              </div>
              
              <div className="text-left">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">INSPECTION INFORMATION</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Inspector:</span>
                    <span className="font-medium">{reportData.metadata.inspector}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">License #:</span>
                    <span className="font-medium">FL-HI-2024-0847</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Company:</span>
                    <span className="font-medium">Stellar Intelligence</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">(305) 555-0100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">inspect@stellarintel.com</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Client Information */}
            <div className="border-t border-gray-300 pt-8 mb-12">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">CLIENT INFORMATION</h3>
              <div className="max-w-2xl mx-auto">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Property Owner:</span>
                    <span className="font-medium">{reportData.metadata.property.owner}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Policy Number:</span>
                    <span className="font-medium">{reportData.metadata.property.policyNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date of Loss:</span>
                    <span className="font-medium">{reportData.metadata.claimInfo.dateOfLoss}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Claim Type:</span>
                    <span className="font-medium">{reportData.metadata.claimInfo.damageTypes.join(', ')}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Systems Inspected */}
            <div className="border-t border-gray-300 pt-8">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">SYSTEMS INSPECTED</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-medium text-gray-900 mb-1">Structural Systems</div>
                  <div className="text-gray-600">Foundation, Roof, Walls</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-900 mb-1">Interior Systems</div>
                  <div className="text-gray-600">Floors, Ceilings, Kitchen</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-900 mb-1">Mechanical Systems</div>
                  <div className="text-gray-600">HVAC, Electrical, Plumbing</div>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="absolute bottom-8 left-0 right-0 text-center text-xs text-gray-500">
              <p>This report is prepared for the exclusive use of {reportData.metadata.property.owner}</p>
              <p className="mt-1">© 2024 Stellar Intelligence - AI-Enhanced Property Inspection Services</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 print:border-0 print:rounded-none print:shadow-none print:page-break-before">
          {/* Report Header */}
          <div className="p-3 sm:p-6 lg:p-8 print:p-4 border-b border-gray-200 print:border-gray-400 print:break-inside-avoid">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 mb-3 sm:mb-6 print:mb-3">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-1 sm:mb-2 print:mb-1 print:text-center print:uppercase">
                  Property Inspection Report
                </h1>
                <p className="text-sm sm:text-base print:hidden text-gray-600">
                  Comprehensive damage assessment with AI-enhanced analysis
                </p>
              </div>
              <div className="text-left sm:text-right flex-shrink-0 print:text-center">
                <div className="flex items-center gap-2 justify-start sm:justify-end mb-2 print:hidden">
                  <span className="px-3 py-1 bg-stellar-orange/10 text-stellar-orange text-xs rounded-full flex items-center gap-1">
                    <Brain size={12} />
                    AI Enhanced
                  </span>
                </div>
                <div className="text-xl sm:text-2xl print:text-lg font-bold text-gray-900 print:mb-1">
                  Report #{reportData.metadata.reportId}
                </div>
                <div className="text-sm print:text-xs text-gray-600">
                  Date: {reportData.metadata.generatedDate}
                </div>
              </div>
            </div>

            {/* Property Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-4 sm:gap-6 print:gap-3 print:break-inside-avoid">
              <div className="print:border print:border-gray-300 print:p-2 print:rounded">
                <h3 className="font-semibold text-gray-900 mb-3 print:mb-2 print:text-xs print:uppercase">Property Information</h3>
                <div className="space-y-2 print:space-y-1 text-sm print:text-[11px]">
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="break-words">{reportData.metadata.property.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Home size={16} className="text-gray-400 flex-shrink-0" />
                    <span>
                      {reportData.metadata.property.type} • Built {reportData.metadata.property.yearBuilt}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-400 flex-shrink-0" />
                    <span className="break-words">{reportData.metadata.property.owner}</span>
                  </div>
                </div>
              </div>

              <div className="print:border print:border-gray-300 print:p-2 print:rounded">
                <h3 className="font-semibold text-gray-900 mb-3 print:mb-2 print:text-xs print:uppercase">Claim Information</h3>
                <div className="space-y-2 print:space-y-1 text-sm print:text-[11px]">
                  <div>
                    <span className="text-gray-600">Policy:</span> {reportData.metadata.property.policyNumber}
                  </div>
                  <div>
                    <span className="text-gray-600">Date of Loss:</span> {reportData.metadata.claimInfo.dateOfLoss}
                  </div>
                  <div>
                    <span className="text-gray-600">Damage Types:</span> {reportData.metadata.claimInfo.damageTypes.join(', ')}
                  </div>
                  <div>
                    <span className="text-gray-600">Inspector:</span> {reportData.metadata.inspector}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Executive Summary - Optimized for Print */}
          <div className="p-3 sm:p-6 lg:p-8 print:p-4 border-b border-gray-200 print:border-gray-400 print:break-inside-avoid print:page-break-inside-avoid">
            <h2 className="text-lg sm:text-2xl print:text-xl font-bold text-gray-900 mb-3 sm:mb-6 print:mb-3 print:text-center">EXECUTIVE SUMMARY</h2>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 print:grid-cols-4 gap-2 sm:gap-4 lg:gap-6 print:gap-2 mb-3 sm:mb-6 print:mb-3">
              <div className="bg-gray-50 rounded-lg sm:rounded-xl print:rounded p-2 sm:p-4 print:p-2 print:bg-white print:border print:border-gray-400">
                <div className="text-lg sm:text-2xl lg:text-3xl print:text-base font-bold text-gray-900 print:text-center">
                  ${reportData.executiveSummary.totalDamageValue.toLocaleString()}
                </div>
                <div className="text-[10px] sm:text-sm print:text-[10px] text-gray-600 print:text-center print:uppercase print:font-medium">Total Damage Value</div>
              </div>
              <div className="bg-gray-50 rounded-lg sm:rounded-xl print:rounded p-2 sm:p-4 print:p-2 print:bg-white print:border print:border-gray-400">
                <div className="text-lg sm:text-2xl lg:text-3xl print:text-base font-bold text-red-600 print:text-gray-900 print:text-center">
                  {reportData.executiveSummary.criticalIssues}
                </div>
                <div className="text-[10px] sm:text-sm print:text-[10px] text-gray-600 print:text-center print:uppercase print:font-medium">Critical Issues</div>
              </div>
              <div className="bg-gray-50 rounded-lg sm:rounded-xl print:rounded p-2 sm:p-4 print:p-2 print:bg-white print:border print:border-gray-400">
                <div className="text-lg sm:text-2xl lg:text-3xl print:text-base font-bold text-green-600 print:text-gray-900 print:text-center">
                  {reportData.executiveSummary.confidenceScore}%
                </div>
                <div className="text-[10px] sm:text-sm print:text-[10px] text-gray-600 print:text-center print:uppercase print:font-medium">Confidence Score</div>
              </div>
              <div className="bg-gray-50 rounded-lg sm:rounded-xl print:rounded p-2 sm:p-4 print:p-2 print:bg-white print:border print:border-gray-400">
                <div className="text-sm sm:text-lg print:text-xs font-bold text-gray-900 print:text-center">
                  {reportData.executiveSummary.timelineEstimate}
                </div>
                <div className="text-[10px] sm:text-sm print:text-[10px] text-gray-600 print:text-center print:uppercase print:font-medium">Repair Timeline</div>
              </div>
            </div>

            {/* Estimated Repair Costs Banner - Formal Style */}
            <div className="bg-gray-50 border border-gray-300 rounded-xl p-4 sm:p-6 mb-6 print:mb-4 print:border-2 print:border-gray-400 print:bg-white">
              <h3 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base print:text-sm print:uppercase print:text-center">
                ESTIMATED REPAIR COSTS
              </h3>
              <div className="grid grid-cols-3 gap-4 sm:gap-6">
                <div className="text-center">
                  <div className="text-xs sm:text-sm text-gray-600 font-medium mb-1 print:text-[10px] print:uppercase print:font-bold">
                    IMMEDIATE
                  </div>
                  <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-red-600 print:text-gray-900 print:text-base">
                    ${(reportData.executiveSummary.totalDamageValue * 0.25).toLocaleString()}
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-500 mt-1 print:hidden">
                    0-30 days
                  </div>
                </div>
                <div className="text-center border-x border-gray-300 print:border-gray-400">
                  <div className="text-xs sm:text-sm text-gray-600 font-medium mb-1 print:text-[10px] print:uppercase print:font-bold">
                    SHORT-TERM
                  </div>
                  <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-orange-600 print:text-gray-900 print:text-base">
                    ${(reportData.executiveSummary.totalDamageValue * 0.45).toLocaleString()}
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-500 mt-1 print:hidden">
                    1-3 months
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs sm:text-sm text-gray-600 font-medium mb-1 print:text-[10px] print:uppercase print:font-bold">
                    LONG-TERM
                  </div>
                  <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 print:text-base">
                    ${(reportData.executiveSummary.totalDamageValue * 0.30).toLocaleString()}
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-500 mt-1 print:hidden">
                    3+ months
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-300 print:border-gray-400">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600 font-medium print:text-[10px] print:uppercase print:font-bold">
                    TOTAL ESTIMATED COST
                  </span>
                  <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 print:text-base">
                    ${reportData.executiveSummary.totalDamageValue.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="print:break-inside-avoid">
              <h3 className="font-semibold text-gray-900 mb-3 print:mb-2 print:text-sm print:uppercase">Priority Recommendations</h3>
              <ul className="space-y-2 print:space-y-1">
                {reportData.executiveSummary.repairRecommendations.slice(0, 4).map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 print:text-xs">
                    <span className="text-gray-700 mt-0.5 flex-shrink-0 print:font-medium">•</span>
                    <AlertTriangle className="text-amber-500 mt-0.5 flex-shrink-0 hidden print:hidden" size={16} />
                    <span className="text-gray-700 print:text-xs print:leading-tight">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Area Findings */}
          <div className="p-3 sm:p-6 lg:p-8 border-b border-gray-200 print:border-black">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-6">Detailed Area Findings</h2>
            
            <div className="space-y-3 sm:space-y-6">
              {reportData.areaFindings.map((area, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-6 print:bg-transparent print:border">
                  {/* Mobile-optimized header with prominent repair cost */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3 sm:mb-4">
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">{area.area}</h3>
                      <p className="text-xs sm:text-sm text-gray-600">{area.category}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                      {/* Status Badge */}
                      <span className={`${getStatusBadge(area.status, area.priority)} text-xs sm:text-sm inline-block`}>
                        {area.status} - {area.priority}
                      </span>
                      {/* Repair Estimate - Prominently displayed */}
                      <div className="bg-stellar-orange text-white px-3 py-1.5 rounded-lg w-full sm:w-auto">
                        <span className="text-xs font-medium">Repair Estimate:</span>
                        <span className="text-base sm:text-lg font-bold ml-1 block sm:inline">
                          ${area.estimatedCost.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xs sm:text-base text-gray-700 mb-3 sm:mb-4">{area.description}</p>
                  
                  {/* Technical Findings */}
                  {area.technicalFindings && (
                    <div className="bg-blue-50 rounded-lg p-2 sm:p-4 mb-3 sm:mb-4">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
                        <Brain size={16} className="text-blue-600" />
                        Technical Analysis
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                        {Object.entries(area.technicalFindings).map(([key, value]) => (
                          <div key={key} className="flex flex-col sm:flex-row sm:justify-between gap-1">
                            <span className="text-gray-600 capitalize font-medium sm:font-normal">{key.replace(/([A-Z])/g, ' $1')}:</span>
                            <span className="font-medium text-gray-900 break-words">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Material Specifications */}
                  {area.materialSpecs && (
                    <div className="bg-green-50 rounded-lg p-2 sm:p-4 mb-3 sm:mb-4">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
                        <Building2 size={16} className="text-green-600" />
                        Material Specifications
                      </h4>
                      <div className="grid grid-cols-1 gap-2 text-xs sm:text-sm">
                        {Object.entries(area.materialSpecs).map(([key, value]) => (
                          <div key={key} className="flex flex-col sm:block">
                            <span className="text-gray-600 capitalize font-medium">{key}:</span>
                            <span className="text-gray-900 sm:ml-2 break-words">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Environmental Concerns */}
                  {area.environmentalConcerns && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 sm:p-4 mb-3 sm:mb-4">
                      <h4 className="font-medium text-amber-800 mb-3 flex items-center gap-2">
                        <AlertTriangle size={16} className="text-amber-600" />
                        Environmental Assessment
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        {Object.entries(area.environmentalConcerns).map(([key, value]) => (
                          <div key={key}>
                            <span className="text-amber-700 capitalize font-medium">{key.replace(/([A-Z])/g, ' $1')}:</span>
                            <div className="text-amber-800">{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Safety Hazards */}
                  {area.safetyHazards && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-4 mb-3 sm:mb-4">
                      <h4 className="font-medium text-red-800 mb-3 flex items-center gap-2">
                        <AlertTriangle size={16} className="text-red-600" />
                        Critical Safety Hazards
                      </h4>
                      <ul className="space-y-2 text-sm">
                        {area.safetyHazards.map((hazard, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-red-700">{hazard}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Appliances Affected */}
                  {area.appliancesAffected && (
                    <div className="bg-gray-50 rounded-lg p-2 sm:p-4 mb-3 sm:mb-4">
                      <h4 className="font-medium text-gray-900 mb-3">Affected Equipment & Appliances</h4>
                      <ul className="space-y-1 text-sm">
                        {area.appliancesAffected.map((appliance, idx) => (
                          <li key={idx} className="text-gray-700">• {appliance}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Documentation</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Camera size={16} />
                        <span>{area.photoCount} photos captured</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Priority Recommendations</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {area.recommendations.map((rec, recIdx) => (
                          <li key={recIdx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-stellar-orange rounded-full mt-2 flex-shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div className="p-3 sm:p-6 lg:p-8 border-b border-gray-200 print:border-black">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-6">AI-Enhanced Analysis</h2>
            
            <div className="space-y-3 sm:space-y-6">
              <div className="bg-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-6 print:bg-transparent print:border">
                <div className="flex items-center gap-3 mb-4">
                  <Brain className="text-blue-600" size={24} />
                  <h3 className="text-lg font-semibold text-gray-900">Hidden Damage Assessment</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-700 mb-3">
                      AI analysis of damage patterns and building characteristics suggests additional hidden damage.
                    </p>
                    <p className="text-gray-700">
                      <strong>Market Comparison:</strong> {reportData.aiInsights.marketComparison}
                    </p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      ${reportData.aiInsights.hiddenDamageEstimate.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Estimated Hidden Damage</div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 rounded-lg sm:rounded-xl p-3 sm:p-6 print:bg-transparent print:border">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="text-amber-600" size={24} />
                  <h3 className="text-lg font-semibold text-gray-900">Risk Assessment</h3>
                </div>
                <ul className="space-y-2">
                  {reportData.aiInsights.riskAssessment.map((risk, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* AI Intelligence & Predictive Analytics */}
          <div className="p-3 sm:p-6 lg:p-8 border-b border-gray-200 print:border-black">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-3">
              <Brain className="text-stellar-orange" size={28} />
              AI Intelligence & Predictive Analytics
            </h2>
            
            {/* Confidence Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {reportData.aiInsights.confidenceMetrics.damagePrediction}%
                </div>
                <div className="text-sm text-blue-700">Damage Prediction</div>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {reportData.aiInsights.confidenceMetrics.costAccuracy}%
                </div>
                <div className="text-sm text-green-700">Cost Accuracy</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {reportData.aiInsights.confidenceMetrics.timelineReliability}%
                </div>
                <div className="text-sm text-purple-700">Timeline Reliability</div>
              </div>
              <div className="bg-orange-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {reportData.aiInsights.confidenceMetrics.riskAssessment}%
                </div>
                <div className="text-sm text-orange-700">Risk Assessment</div>
              </div>
            </div>

            {/* Historical Data Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <History size={20} className="text-gray-600" />
                  Historical Claims Data
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Similar Claims Analyzed:</span>
                    <span className="font-semibold">{reportData.aiInsights.historicalData.similarClaims}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Settlement:</span>
                    <span className="font-semibold text-green-600">
                      ${reportData.aiInsights.historicalData.averageSettlement.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Resolution Time:</span>
                    <span className="font-semibold">{reportData.aiInsights.historicalData.timeToResolution}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Litigation Rate:</span>
                    <span className="font-semibold text-red-600">{reportData.aiInsights.historicalData.litigationRate}</span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp size={20} className="text-amber-600" />
                  Predictive Analysis
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Additional Damage Risk:</span>
                    <div className="text-amber-700">{reportData.aiInsights.predictiveAnalysis.additionalDamageRisk}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Cost Inflation Factor:</span>
                    <div className="text-amber-700">{reportData.aiInsights.predictiveAnalysis.costInflationFactor}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Material Availability:</span>
                    <div className="text-amber-700">{reportData.aiInsights.predictiveAnalysis.materialAvailability}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Contractor Capacity:</span>
                    <div className="text-amber-700">{reportData.aiInsights.predictiveAnalysis.contractorCapacity}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Environmental & Risk Assessment */}
          <div className="p-3 sm:p-6 lg:p-8 border-b border-gray-200 print:border-black">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-3">
              <Globe size={28} className="text-green-600" />
              Environmental & Risk Assessment
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Environmental Factors */}
              <div className="bg-green-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Environmental Conditions</h3>
                <div className="space-y-3 text-sm">
                  {Object.entries(reportData.aiInsights.environmentalFactors).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                      <span className="font-medium text-green-700">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comprehensive Risk Matrix */}
              <div className="bg-red-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Comprehensive Risk Matrix</h3>
                <div className="space-y-3">
                  {reportData.aiInsights.riskAssessment.map((risk, idx) => {
                    const riskLevel = risk.includes('CRITICAL') ? 'critical' : risk.includes('HIGH') ? 'high' : 'moderate'
                    const colorClass = riskLevel === 'critical' ? 'text-red-800' : riskLevel === 'high' ? 'text-orange-700' : 'text-yellow-700'
                    const bgClass = riskLevel === 'critical' ? 'bg-red-100' : riskLevel === 'high' ? 'bg-orange-100' : 'bg-yellow-100'
                    
                    return (
                      <div key={idx} className={`${bgClass} rounded-lg p-3`}>
                        <div className={`text-xs font-bold ${colorClass} mb-1`}>
                          {risk.split(':')[0]}
                        </div>
                        <div className={`text-sm ${colorClass}`}>
                          {risk.split(':')[1]}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Claims Intelligence & Strategy */}
          <div className="p-3 sm:p-6 lg:p-8 border-b border-gray-200 print:border-black">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-3">
              <Target size={28} className="text-purple-600" />
              Claims Intelligence & Strategy
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Carrier Intelligence */}
              <div className="bg-purple-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield size={20} className="text-purple-600" />
                  Carrier Intelligence Profile
                </h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-purple-700 font-medium">Carrier:</span>
                    <div className="font-semibold text-gray-900">{reportData.aiInsights.claimsIntelligence.carrierProfile.name}</div>
                  </div>
                  <div>
                    <span className="text-purple-700 font-medium">Claims Reputation:</span>
                    <div className="text-sm text-gray-700">{reportData.aiInsights.claimsIntelligence.carrierProfile.claimsReputation}</div>
                  </div>
                  <div>
                    <span className="text-purple-700 font-medium">Negotiation Pattern:</span>
                    <div className="text-sm text-gray-700">{reportData.aiInsights.claimsIntelligence.carrierProfile.negotiationHistory}</div>
                  </div>
                  <div>
                    <span className="text-purple-700 font-medium">Timeline Behavior:</span>
                    <div className="text-sm text-gray-700">{reportData.aiInsights.claimsIntelligence.carrierProfile.timelineBehavior}</div>
                  </div>
                </div>
              </div>

              {/* Strategic Recommendations */}
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Lightbulb size={20} className="text-blue-600" />
                  Strategic Considerations
                </h3>
                <div className="space-y-3">
                  {reportData.aiInsights.claimsIntelligence.strategicConsiderations.map((strategy, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                        {idx + 1}
                      </div>
                      <div className="text-sm text-blue-800">{strategy}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quality Assurance Metrics */}
          <div className="p-3 sm:p-6 lg:p-8 border-b border-gray-200 print:border-black">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-3">
              <Award size={28} className="text-green-600" />
              Quality Assurance & Compliance Metrics
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
                <div className="text-sm font-medium text-green-700">Code Compliance Review</div>
                <div className="text-xs text-green-600">Florida Building Code 2020</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">IICRC</div>
                <div className="text-sm font-medium text-blue-700">Certified Standards</div>
                <div className="text-xs text-blue-600">S500/S520 Compliance</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">A+</div>
                <div className="text-sm font-medium text-purple-700">Quality Grade</div>
                <div className="text-xs text-purple-600">Professional Restoration Standards</div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Inspection Methodology</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Technology Utilized</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Thermal imaging cameras (FLIR E8-XT)</li>
                    <li>• Moisture detection meters (Tramex CME5)</li>
                    <li>• Air quality monitoring (Fluke 975)</li>
                    <li>• Structural analysis software (AutoCAD)</li>
                    <li>• 4K documentation cameras</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Standards Compliance</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• ASTM E2876 - Building Enclosure Commissioning</li>
                    <li>• IICRC S500 - Water Damage Restoration</li>
                    <li>• Florida Building Code 2020 Edition</li>
                    <li>• NFPA 921 - Fire Investigation Guidelines</li>
                    <li>• EPA Mold Remediation Guidelines</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Comprehensive Financial Analysis */}
          <div className="p-3 sm:p-6 lg:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-3">
              <DollarSign className="text-green-600" size={28} />
              Comprehensive Financial Analysis
            </h2>
            
            {/* Executive Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  ${reportData.financialSummary.currentClaimValue.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Current Claim Value</div>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  +${reportData.financialSummary.historicalRecovery.toLocaleString()}
                </div>
                <div className="text-sm text-green-700">Historical Recovery</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  +${reportData.financialSummary.potentialSupplemental.toLocaleString()}
                </div>
                <div className="text-sm text-blue-700">Supplemental Potential</div>
              </div>
              <div className="bg-stellar-orange text-white rounded-xl p-4">
                <div className="text-2xl font-bold mb-1">
                  ${reportData.financialSummary.totalRecoveryOpportunity.toLocaleString()}
                </div>
                <div className="text-sm opacity-90">Total Recovery</div>
              </div>
            </div>

            {/* Detailed Cost Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Labor Cost Analysis */}
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="text-blue-600" size={20} />
                  Labor Cost Analysis
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900">Skilled Labor</div>
                      <div className="text-sm text-gray-600">
                        {reportData.financialSummary.detailedCostAnalysis.laborCosts.skilled.hours} hrs @ ${reportData.financialSummary.detailedCostAnalysis.laborCosts.skilled.rate}/hr
                      </div>
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      ${reportData.financialSummary.detailedCostAnalysis.laborCosts.skilled.total.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900">General Labor</div>
                      <div className="text-sm text-gray-600">
                        {reportData.financialSummary.detailedCostAnalysis.laborCosts.general.hours} hrs @ ${reportData.financialSummary.detailedCostAnalysis.laborCosts.general.rate}/hr
                      </div>
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      ${reportData.financialSummary.detailedCostAnalysis.laborCosts.general.total.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900">Specialized</div>
                      <div className="text-sm text-gray-600">
                        {reportData.financialSummary.detailedCostAnalysis.laborCosts.specialized.hours} hrs @ ${reportData.financialSummary.detailedCostAnalysis.laborCosts.specialized.rate}/hr
                      </div>
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      ${reportData.financialSummary.detailedCostAnalysis.laborCosts.specialized.total.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Material Cost Analysis */}
              <div className="bg-green-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Building2 className="text-green-600" size={20} />
                  Material Cost Analysis
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900">Roofing Materials</div>
                      <div className="text-sm text-gray-600">
                        {reportData.financialSummary.detailedCostAnalysis.materialCosts.roofing.sqft} sq ft @ ${reportData.financialSummary.detailedCostAnalysis.materialCosts.roofing.rate}/sq ft
                      </div>
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      ${reportData.financialSummary.detailedCostAnalysis.materialCosts.roofing.total.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900">Flooring Systems</div>
                      <div className="text-sm text-gray-600">
                        {reportData.financialSummary.detailedCostAnalysis.materialCosts.flooring.sqft} sq ft @ ${reportData.financialSummary.detailedCostAnalysis.materialCosts.flooring.rate}/sq ft
                      </div>
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      ${reportData.financialSummary.detailedCostAnalysis.materialCosts.flooring.total.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900">Electrical Components</div>
                      <div className="text-sm text-gray-600">
                        {reportData.financialSummary.detailedCostAnalysis.materialCosts.electrical.circuits} circuits @ ${reportData.financialSummary.detailedCostAnalysis.materialCosts.electrical.rate}/circuit
                      </div>
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      ${reportData.financialSummary.detailedCostAnalysis.materialCosts.electrical.total.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Permits & Contingency */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-purple-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Permits & Regulatory Costs</h3>
                <div className="space-y-2">
                  {Object.entries(reportData.financialSummary.detailedCostAnalysis.permitsCosts).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-700 capitalize">{key} Permit:</span>
                      <span className="font-semibold text-purple-600">${value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contingency Reserve</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Reserve Percentage:</span>
                    <span className="font-semibold text-amber-600">{reportData.financialSummary.detailedCostAnalysis.contingencyReserve.percentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Reserve Amount:</span>
                    <span className="font-semibold text-amber-600">${reportData.financialSummary.detailedCostAnalysis.contingencyReserve.amount.toLocaleString()}</span>
                  </div>
                  <div className="mt-3 text-sm text-amber-700">
                    <strong>Justification:</strong> {reportData.financialSummary.detailedCostAnalysis.contingencyReserve.justification}
                  </div>
                </div>
              </div>
            </div>

            {/* Market Analysis & Competitive Bids */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="text-gray-600" size={20} />
                  Regional Market Analysis
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Cost per Sq Ft:</span>
                    <span className="font-semibold text-gray-900">${reportData.financialSummary.marketComparatives.regionalAverages.sqftCost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Timeline Average:</span>
                    <span className="font-semibold text-gray-900">{reportData.financialSummary.marketComparatives.regionalAverages.timelineWeeks} weeks</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Quality Standard:</span>
                    <span className="font-semibold text-gray-900">{reportData.financialSummary.marketComparatives.regionalAverages.qualityGrade}</span>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Competitive Bid Analysis</h3>
                <div className="space-y-3">
                  {(reportData.financialSummary.marketComparatives.competitiveBids || []).map((bid, idx) => (
                    <div key={idx} className="border border-indigo-200 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900">{bid.name}</div>
                          <div className="text-sm text-gray-600">Timeline: {bid.timeline}</div>
                        </div>
                        <div className="text-lg font-bold text-indigo-600">
                          ${bid.bid.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Comprehensive Cost Breakdown by Category</h3>
              <div className="space-y-4">
                {reportData.financialSummary.breakdown.map((item, idx) => (
                  <div key={idx} className="border-l-4 border-stellar-orange pl-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 text-base">{item.category}</div>
                        <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                      </div>
                      <div className="text-xl font-bold text-stellar-orange flex-shrink-0">
                        ${item.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Total Summary */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center bg-stellar-orange text-white rounded-lg p-4">
                  <span className="text-lg font-semibold">Total Recovery Opportunity</span>
                  <span className="text-2xl font-bold">
                    ${reportData.financialSummary.totalRecoveryOpportunity.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Hidden Damage Intelligence */}
          <div className="p-3 sm:p-6 lg:p-8 border-b border-gray-200 print:border-black">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Hidden Damage Analysis & Discovery</h2>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-amber-600 mt-1" size={20} />
                  <div>
                    <h3 className="font-semibold text-amber-800 mb-2">Critical Discovery: $45,000 in Concealed Damage</h3>
                    <p className="text-amber-700 text-sm">AI analysis and advanced testing revealed significant hidden damage not visible during standard inspection. This represents 16% additional recovery opportunity.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Hidden Damage Breakdown</h3>
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">Behind Kitchen Cabinets</h4>
                        <span className="text-lg font-bold text-red-600">$8,500</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Water intrusion damage</p>
                      <p className="text-xs text-gray-500"><strong>Evidence:</strong> Moisture readings 45% above normal, visible staining patterns</p>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">Attic Insulation</h4>
                        <span className="text-lg font-bold text-red-600">$12,000</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Complete saturation requiring replacement</p>
                      <p className="text-xs text-gray-500"><strong>Evidence:</strong> Thermal imaging shows 80% compromised insulation</p>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">Interior Wall Cavities</h4>
                        <span className="text-lg font-bold text-red-600">$15,000</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Suspected mold growth</p>
                      <p className="text-xs text-gray-500"><strong>Evidence:</strong> Air quality testing indicates elevated spore counts</p>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">Subflooring Damage</h4>
                        <span className="text-lg font-bold text-red-600">$9,500</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Structural deterioration</p>
                      <p className="text-xs text-gray-500"><strong>Evidence:</strong> Moisture meter readings consistently above 20%</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Detection Methods & Technology</h3>
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">Thermal Imaging Analysis</h4>
                      <p className="text-sm text-blue-800">FLIR thermal cameras revealed temperature differentials indicating moisture intrusion in 4 separate wall sections.</p>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-medium text-green-900 mb-2">Moisture Content Testing</h4>
                      <p className="text-sm text-green-800">Professional grade moisture meters detected readings 35-60% above acceptable levels in concealed areas.</p>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h4 className="font-medium text-purple-900 mb-2">Air Quality Sampling</h4>
                      <p className="text-sm text-purple-800">Laboratory analysis confirms elevated mold spore counts requiring professional remediation.</p>
                    </div>

                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h4 className="font-medium text-orange-900 mb-2">AI Pattern Recognition</h4>
                      <p className="text-sm text-orange-800">Machine learning algorithms identified damage patterns consistent with 127 similar properties, predicting concealed issues with 94% accuracy.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Market Intelligence & Comparable Analysis */}
            <div className="p-3 sm:p-6 lg:p-8 border-b border-gray-200 print:border-black">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Market Intelligence & Settlement Analysis</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-green-50 rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">$315,000</div>
                  <div className="text-sm text-green-700">Average Settlement</div>
                  <div className="text-xs text-green-600 mt-1">Based on 127 similar claims</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">$385,000</div>
                  <div className="text-sm text-blue-700">Top Quartile Settlement</div>
                  <div className="text-xs text-blue-600 mt-1">Achievable with proper strategy</div>
                </div>
                <div className="bg-stellar-orange/10 rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-stellar-orange mb-2">89%</div>
                  <div className="text-sm text-stellar-orange">Success Rate</div>
                  <div className="text-xs text-orange-600 mt-1">Appeals result in additional payment</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Comparable Properties Analysis</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">1245 Ocean Ave (Hurricane Ian)</div>
                        <div className="text-sm text-gray-600">Similar damage profile, 2006 construction</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">$342,000</div>
                        <div className="text-xs text-gray-500">Settled 2023</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">890 Collins Street (Water Damage)</div>
                        <div className="text-sm text-gray-600">Water intrusion + mold, 2004 construction</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">$298,000</div>
                        <div className="text-xs text-gray-500">Settled 2023</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">567 Bay Road (Hurricane + Flood)</div>
                        <div className="text-sm text-gray-600">Combined perils, 2007 construction</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">$425,000</div>
                        <div className="text-xs text-gray-500">Settled 2024</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Key Market Insights</h4>
                    <ul className="space-y-1 text-sm text-blue-800">
                      <li>• Properties with documented mold issues average 23% higher settlements</li>
                      <li>• Code upgrade requirements increase settlements by avg. $35K</li>
                      <li>• Thermal imaging evidence improves settlement success by 34%</li>
                      <li>• Historical claims on property add avg. 15% to current settlement</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Negotiation Leverage Points</h3>
                  <div className="space-y-4">
                    <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-green-900">Code Violation Requirements</h4>
                        <span className="text-lg font-bold text-green-600">$15,000</span>
                      </div>
                      <p className="text-sm text-green-800">New building codes require updated electrical and HVAC systems</p>
                    </div>
                    
                    <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-red-900">Health Safety Mandate</h4>
                        <span className="text-lg font-bold text-red-600">$25,000</span>
                      </div>
                      <p className="text-sm text-red-800">State requires professional mold remediation for detected levels</p>
                    </div>

                    <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-blue-900">Ordinance & Law Coverage</h4>
                        <span className="text-lg font-bold text-blue-600">$18,000</span>
                      </div>
                      <p className="text-sm text-blue-800">Policy includes coverage for code compliance upgrades</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-stellar-orange/10 border border-stellar-orange/30 rounded-lg">
                    <h4 className="font-medium text-stellar-orange mb-2">Strategic Recommendation</h4>
                    <p className="text-sm text-orange-800 mb-2">Open negotiations at <strong>$465,000</strong> with documentation supporting all leverage points.</p>
                    <p className="text-xs text-orange-700">Settlement floor: $385,000 | Optimal range: $415,000-$445,000</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Historical Claims Recovery */}
            <div className="p-3 sm:p-6 lg:p-8 border-b border-gray-200 print:border-black">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Historical Claims Recovery Analysis</h2>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <History className="text-yellow-600 mt-1" size={20} />
                  <div>
                    <h3 className="font-semibold text-yellow-800 mb-2">Opportunity: $39,500 in Historical Underpayments</h3>
                    <p className="text-yellow-700 text-sm">Analysis of previous claims reveals systematic underpayments. Florida allows reopening of claims up to 3 years post-settlement for additional review.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Previous Claims Analysis</h3>
                  
                  {/* Mobile-optimized card view for small screens */}
                  <div className="block sm:hidden space-y-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-sm font-medium text-gray-900">2022-09-28</div>
                          <div className="text-sm text-gray-600">Hurricane Ian</div>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Reopenable</span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Original:</span>
                          <span className="font-medium">$45,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Current:</span>
                          <span className="font-medium text-blue-600">$68,000</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-100">
                          <span className="text-gray-600">Underpayment:</span>
                          <span className="font-bold text-red-600">$23,000</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-sm font-medium text-gray-900">2021-07-15</div>
                          <div className="text-sm text-gray-600">Water Damage</div>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Reopenable</span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Original:</span>
                          <span className="font-medium">$8,500</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Current:</span>
                          <span className="font-medium text-blue-600">$15,000</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-100">
                          <span className="text-gray-600">Underpayment:</span>
                          <span className="font-bold text-red-600">$6,500</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-sm font-medium text-gray-900">2020-03-10</div>
                          <div className="text-sm text-gray-600">Wind Damage</div>
                        </div>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Time Sensitive</span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Original:</span>
                          <span className="font-medium">$12,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Current:</span>
                          <span className="font-medium text-blue-600">$22,000</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-100">
                          <span className="text-gray-600">Underpayment:</span>
                          <span className="font-bold text-red-600">$10,000</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Desktop table view - hidden on mobile */}
                  <div className="hidden sm:block overflow-x-auto -mx-4 sm:mx-0">
                    <div className="inline-block min-w-full align-middle">
                      <table className="min-w-full border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">Date</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">Type</th>
                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 whitespace-nowrap">Original Payout</th>
                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 whitespace-nowrap">Current Value</th>
                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 whitespace-nowrap">Underpayment</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 whitespace-nowrap">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          <tr>
                            <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">2022-09-28</td>
                            <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">Hurricane Ian</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900 whitespace-nowrap">$45,000</td>
                            <td className="px-4 py-3 text-sm text-right font-medium text-blue-600 whitespace-nowrap">$68,000</td>
                            <td className="px-4 py-3 text-sm text-right font-bold text-red-600 whitespace-nowrap">$23,000</td>
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Reopenable</span>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">2021-07-15</td>
                            <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">Water Damage</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900 whitespace-nowrap">$8,500</td>
                            <td className="px-4 py-3 text-sm text-right font-medium text-blue-600 whitespace-nowrap">$15,000</td>
                            <td className="px-4 py-3 text-sm text-right font-bold text-red-600 whitespace-nowrap">$6,500</td>
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Reopenable</span>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">2020-03-10</td>
                            <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">Wind Damage</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900 whitespace-nowrap">$12,000</td>
                            <td className="px-4 py-3 text-sm text-right font-medium text-blue-600 whitespace-nowrap">$22,000</td>
                            <td className="px-4 py-3 text-sm text-right font-bold text-red-600 whitespace-nowrap">$10,000</td>
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Time Sensitive</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-green-900 mb-3">Recovery Strategy</h4>
                    <ul className="space-y-2 text-sm text-green-800">
                      <li className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span>File supplemental claims for Hurricane Ian and Water Damage within statutory timeframe</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Present comparative market analysis showing systematic underpayment patterns</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Leverage new damage discovery to justify reopening previous claims</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Coordinate timing with current claim for maximum negotiation leverage</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-blue-900 mb-3">Timeline & Actions</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <div className="font-medium text-blue-900">Week 1-2: Documentation Gathering</div>
                          <div className="text-sm text-blue-700">Collect all previous claim files, photos, and settlements</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <div className="font-medium text-blue-900">Week 3-4: Market Analysis</div>
                          <div className="text-sm text-blue-700">Complete comparative analysis and valuation reports</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <div className="font-medium text-blue-900">Week 5-6: Filing & Negotiation</div>
                          <div className="text-sm text-blue-700">Submit supplemental claims and begin negotiations</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-8 sm:mt-12 pt-4 sm:pt-6 border-t border-gray-200 print:border-black">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm text-gray-600">
                <div>
                  Report generated by Stellar Intelligence Platform
                </div>
                <div>
                  Confidence Score: {reportData.executiveSummary.confidenceScore}% • Page 1 of 1
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}