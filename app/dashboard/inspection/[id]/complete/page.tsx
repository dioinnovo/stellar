'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AIProcessingOverlay } from '@/components/ui/ai-processing-overlay'
import {
  inspectionMediaData,
  inspectionSummary,
  getTotalEstimatedDamage
} from '@/lib/inspection-media'

export default function CompleteInspectionPage() {
  const params = useParams()
  const router = useRouter()
  const inspectionId = params.id as string
  const [isProcessing, setIsProcessing] = useState(true)

  const handleProcessingComplete = () => {
    // Generate a unique report ID
    const reportId = `RPT-${Date.now()}`

    // Store inspection data in sessionStorage for the report page
    const reportData = {
      inspectionId,
      reportId,
      status: 'pending_approval',
      generatedAt: new Date().toISOString(),
      inspectionData: inspectionMediaData,
      summary: inspectionSummary,
      totalDamage: getTotalEstimatedDamage(),
      property: {
        address: '1456 Ocean View Drive, Miami Beach, FL 33139',
        type: 'residential' as const,
        owner: 'Johnson Properties LLC',
        yearBuilt: '2010',
        policyNumber: 'POL-2024-789456'
      },
      metadata: {
        inspector: 'John Smith',
        completedDate: new Date().toISOString(),
        timeSpent: '3h 15m',
        photosCount: inspectionMediaData.reduce((acc, area) =>
          acc + area.media.filter(m => m.type === 'photo').length, 0
        ),
        voiceNotesCount: inspectionMediaData.reduce((acc, area) =>
          acc + area.media.filter(m => m.type === 'audio').length, 0
        )
      }
    }

    // Store in sessionStorage
    sessionStorage.setItem(`report_${reportId}`, JSON.stringify(reportData))

    // Also add to reports list
    const existingReports = JSON.parse(sessionStorage.getItem('inspection_reports') || '[]')
    existingReports.unshift({
      id: reportId,
      inspectionId,
      claimNumber: `CLM-2024-${Math.floor(Math.random() * 1000)}`,
      property: reportData.property,
      completedDate: new Date().toISOString(),
      damageType: 'Hurricane',
      status: 'in_review',  // Use consistent status value
      adjuster: {
        name: 'John Smith',
        rating: 4.8
      },
      settlement: {
        estimated: reportData.totalDamage,
        approved: 0,  // Not approved yet
        increase: 0
      },
      confidenceScore: 94,
      timeToComplete: reportData.metadata.timeSpent
    })
    sessionStorage.setItem('inspection_reports', JSON.stringify(existingReports))

    // Navigate to the review page for approval workflow
    router.push(`/dashboard/inspection/${inspectionId}/review`)
  }

  useEffect(() => {
    // Start processing immediately when page loads
    setIsProcessing(true)
  }, [])

  return (
    <AIProcessingOverlay
      isVisible={isProcessing}
      onComplete={handleProcessingComplete}
    />
  )
}