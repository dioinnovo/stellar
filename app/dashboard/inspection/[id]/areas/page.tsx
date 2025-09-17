'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { InspectionAreaCarousel } from '@/components/ui/inspection-area-carousel'
import { useInspectionData } from '@/lib/hooks/useInspectionData'
import { Home, Building2, Wrench } from 'lucide-react'

// Icon mapping for areas
const AREA_ICONS: Record<string, any> = {
  'exterior-roof': Home,
  'exterior-siding': Home,
  'exterior-windows': Home,
  'exterior-foundation': Home,
  'exterior-landscape': Home,
  'interior-living': Home,
  'interior-kitchen': Home,
  'interior-master-bed': Home,
  'interior-bedrooms': Home,
  'interior-bathrooms': Home,
  'interior-basement': Home,
  'systems-electrical': Wrench,
  'systems-plumbing': Wrench,
  'systems-hvac': Wrench
}

export default function PropertyInspectionAreasPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const inspectionId = params.id as string
  const [currentIndex, setCurrentIndex] = useState(0)

  // Use the centralized inspection data hook
  const {
    inspectionData,
    loading,
    error,
    markAreaCompleted,
    markAreaSkipped,
    markAreaInProgress
  } = useInspectionData(inspectionId)

  // Set initial index based on area query parameter
  useEffect(() => {
    const areaParam = searchParams.get('area')
    if (areaParam && inspectionData?.areas) {
      const areaIndex = inspectionData.areas.findIndex(area => area.id === areaParam)
      if (areaIndex !== -1) {
        setCurrentIndex(areaIndex)
      }
    }
  }, [searchParams, inspectionData])

  const handleAreaSelect = (area: any, index: number) => {
    if (area && area.id) {
      // Only mark as in progress if it's not already completed or skipped
      if (area.status === 'not_started') {
        markAreaInProgress(area.id)
      }
      router.push(`/dashboard/inspection/${inspectionId}/area/${area.id}`)
    }
  }

  const handleComplete = () => {
    if (!inspectionData) return

    const currentArea = inspectionData.areas[currentIndex]
    markAreaCompleted(currentArea.id)

    // Navigate to next area if available
    const nextIndex = currentIndex + 1
    if (nextIndex < inspectionData.areas.length) {
      setCurrentIndex(nextIndex)
      const nextArea = inspectionData.areas[nextIndex]
      router.push(`/dashboard/inspection/${inspectionId}/area/${nextArea.id}`)
    } else {
      // All areas done, go to review
      router.push(`/dashboard/inspection/${inspectionId}/review`)
    }
  }

  const handleSkip = () => {
    if (!inspectionData) return

    const currentArea = inspectionData.areas[currentIndex]
    markAreaSkipped(currentArea.id)

    // Navigate to next area if available
    const nextIndex = currentIndex + 1
    if (nextIndex < inspectionData.areas.length) {
      setCurrentIndex(nextIndex)
      const nextArea = inspectionData.areas[nextIndex]
      router.push(`/dashboard/inspection/${inspectionId}/area/${nextArea.id}`)
    } else {
      // All areas done, go to review
      router.push(`/dashboard/inspection/${inspectionId}/review`)
    }
  }

  const handleConfirmInspection = () => {
    router.push(`/dashboard/inspection/${inspectionId}/review`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stellar-orange mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inspection areas...</p>
        </div>
      </div>
    )
  }

  if (error || !inspectionData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Failed to load inspection data'}</p>
          <button
            onClick={() => router.push('/dashboard/inspection')}
            className="px-4 py-2 bg-stellar-orange text-white rounded-lg hover:bg-orange-600"
          >
            Back to Inspections
          </button>
        </div>
      </div>
    )
  }

  // Add icon info to each area
  const enhancedAreas = inspectionData.areas.map(area => ({
    ...area,
    icon: AREA_ICONS[area.id] || Home
  }))

  return (
    <InspectionAreaCarousel
      areas={enhancedAreas}
      currentAreaIndex={currentIndex}
      onAreaComplete={handleComplete}
      onAreaSkip={handleSkip}
      onAreaSelect={handleAreaSelect}
      inspectionId={inspectionId}
      propertyType="residential"
    />
  )
}