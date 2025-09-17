'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { InspectionAreaCarousel } from '@/components/ui/inspection-area-carousel'
import { inspectionMediaData, AreaInspectionData } from '@/lib/inspection-media'
import { Home } from 'lucide-react'

// Define all inspection areas
const INSPECTION_AREAS = {
  residential: [
    // Exterior
    { id: 'exterior-roof', name: 'Roof & Gutters', category: 'Exterior', icon: Home },
    { id: 'exterior-siding', name: 'Siding & Walls', category: 'Exterior', icon: Home },
    { id: 'exterior-windows', name: 'Windows & Doors', category: 'Exterior', icon: Home },
    { id: 'exterior-foundation', name: 'Foundation', category: 'Exterior', icon: Home },
    { id: 'exterior-landscape', name: 'Landscape & Drainage', category: 'Exterior', icon: Home },

    // Interior Rooms
    { id: 'interior-living', name: 'Living Room', category: 'Interior', icon: Home },
    { id: 'interior-kitchen', name: 'Kitchen', category: 'Interior', icon: Home },
    { id: 'interior-master-bed', name: 'Master Bedroom', category: 'Interior', icon: Home },
    { id: 'interior-bedrooms', name: 'Other Bedrooms', category: 'Interior', icon: Home },
    { id: 'interior-bathrooms', name: 'Bathrooms', category: 'Interior', icon: Home },
    { id: 'interior-basement', name: 'Basement/Attic', category: 'Interior', icon: Home },

    // Systems
    { id: 'systems-electrical', name: 'Electrical System', category: 'Systems', icon: Home },
    { id: 'systems-plumbing', name: 'Plumbing System', category: 'Systems', icon: Home },
    { id: 'systems-hvac', name: 'HVAC System', category: 'Systems', icon: Home }
  ]
}

export default function PropertyInspectionAreasPage() {
  const params = useParams()
  const router = useRouter()
  const inspectionId = params.id as string
  const [propertyType] = useState<'residential' | 'commercial'>('residential')
  const [areasStatus, setAreasStatus] = useState<Record<string, any>>({})
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    // Load saved areas status from sessionStorage
    const savedStatus = sessionStorage.getItem(`inspection-${inspectionId}-areas`)
    if (savedStatus) {
      setAreasStatus(JSON.parse(savedStatus))
    }

    // Load inspection media data to get status
    inspectionMediaData.forEach(area => {
      setAreasStatus(prev => ({
        ...prev,
        [area.areaId]: {
          status: area.status,
          photoCount: area.photos?.length || 0,
          voiceNotes: area.voiceNotes?.length || 0,
          findings: area.findings,
          damageDescription: area.damageDescription
        }
      }))
    })
  }, [inspectionId])

  const allAreas = INSPECTION_AREAS[propertyType]

  // Enhance areas with their status from inspection data
  const enhancedAreas = allAreas.map(area => {
    const areaData = inspectionMediaData.find(d => d.areaId === area.id)
    return {
      ...area,
      status: areaData?.status || 'not_started',
      photoCount: areaData?.photos?.length || 0,
      notesCount: areaData?.voiceNotes?.length || 0,
      findings: areaData?.findings || '',
      damageDescription: areaData?.damageDescription || '',
      recommendedActions: areaData?.recommendedActions || '',
      priority: areaData?.priority || 'low'
    }
  })

  const handleAreaSelect = (index: number) => {
    const area = enhancedAreas[index]
    router.push(`/dashboard/inspection/${inspectionId}/area/${area.id}`)
  }

  const handleComplete = () => {
    // Mark current area as completed and navigate to next
    const currentArea = enhancedAreas[currentIndex]
    const nextIndex = currentIndex + 1 < enhancedAreas.length ? currentIndex + 1 : currentIndex

    // Save status
    const newStatus = {
      ...areasStatus,
      [currentArea.id]: {
        ...areasStatus[currentArea.id],
        status: 'completed'
      }
    }
    setAreasStatus(newStatus)
    sessionStorage.setItem(`inspection-${inspectionId}-areas`, JSON.stringify(newStatus))

    // Navigate to next area
    if (nextIndex !== currentIndex) {
      setCurrentIndex(nextIndex)
      const nextArea = enhancedAreas[nextIndex]
      router.push(`/dashboard/inspection/${inspectionId}/area/${nextArea.id}`)
    }
  }

  const handleSkip = () => {
    // Skip to next area
    const nextIndex = currentIndex + 1 < enhancedAreas.length ? currentIndex + 1 : currentIndex
    if (nextIndex !== currentIndex) {
      setCurrentIndex(nextIndex)
      const nextArea = enhancedAreas[nextIndex]
      router.push(`/dashboard/inspection/${inspectionId}/area/${nextArea.id}`)
    }
  }

  const handleConfirmInspection = () => {
    router.push(`/dashboard/inspection/${inspectionId}/review`)
  }

  return (
    <InspectionAreaCarousel
      areas={enhancedAreas}
      currentAreaIndex={currentIndex}
      onAreaComplete={handleComplete}
      onAreaSkip={handleSkip}
      onAreaSelect={handleAreaSelect}
      onConfirmInspection={handleConfirmInspection}
    />
  )
}