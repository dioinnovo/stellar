'use client'

import { useState, useEffect, useCallback } from 'react'
import { inspectionMediaData } from '@/lib/inspection-media'

export interface MediaFile {
  id: string
  type: 'photo' | 'audio' | 'document'
  url: string
  thumbnail?: string
  title: string
  description?: string
  timestamp: string
  category: string
  tags?: string[]
  transcript?: string
  duration?: number
}

export interface InspectionArea {
  id: string
  name: string
  category: string
  status: 'completed' | 'skipped' | 'in_progress' | 'not_started'
  photoCount: number
  notesCount: number
  findings: string
  damageDescription: string
  recommendedActions: string
  estimatedCost: number
  priority: 'high' | 'medium' | 'low'
  previewImage?: string
  media: MediaFile[]
}

export interface InspectionData {
  id: string
  property: {
    address: string
    type: 'residential' | 'commercial'
    owner: string
    yearBuilt?: string
    policyNumber?: string
  }
  areas: InspectionArea[]
  createdAt: string
  updatedAt: string
  completionPercentage: number
}

// Default areas for a new residential inspection
const DEFAULT_RESIDENTIAL_AREAS: Omit<InspectionArea, 'media'>[] = [
  // Exterior
  { id: 'exterior-roof', name: 'Roof & Gutters', category: 'Exterior', status: 'not_started', photoCount: 0, notesCount: 0, findings: '', damageDescription: '', recommendedActions: '', estimatedCost: 0, priority: 'low' },
  { id: 'exterior-siding', name: 'Siding & Walls', category: 'Exterior', status: 'not_started', photoCount: 0, notesCount: 0, findings: '', damageDescription: '', recommendedActions: '', estimatedCost: 0, priority: 'low' },
  { id: 'exterior-windows', name: 'Windows & Doors', category: 'Exterior', status: 'not_started', photoCount: 0, notesCount: 0, findings: '', damageDescription: '', recommendedActions: '', estimatedCost: 0, priority: 'low' },
  { id: 'exterior-foundation', name: 'Foundation', category: 'Exterior', status: 'not_started', photoCount: 0, notesCount: 0, findings: '', damageDescription: '', recommendedActions: '', estimatedCost: 0, priority: 'low' },
  { id: 'exterior-landscape', name: 'Landscape & Drainage', category: 'Exterior', status: 'not_started', photoCount: 0, notesCount: 0, findings: '', damageDescription: '', recommendedActions: '', estimatedCost: 0, priority: 'low' },

  // Interior
  { id: 'interior-living', name: 'Living Room', category: 'Interior', status: 'not_started', photoCount: 0, notesCount: 0, findings: '', damageDescription: '', recommendedActions: '', estimatedCost: 0, priority: 'low' },
  { id: 'interior-kitchen', name: 'Kitchen', category: 'Interior', status: 'not_started', photoCount: 0, notesCount: 0, findings: '', damageDescription: '', recommendedActions: '', estimatedCost: 0, priority: 'low' },
  { id: 'interior-master-bed', name: 'Master Bedroom', category: 'Interior', status: 'not_started', photoCount: 0, notesCount: 0, findings: '', damageDescription: '', recommendedActions: '', estimatedCost: 0, priority: 'low' },
  { id: 'interior-bedrooms', name: 'Other Bedrooms', category: 'Interior', status: 'not_started', photoCount: 0, notesCount: 0, findings: '', damageDescription: '', recommendedActions: '', estimatedCost: 0, priority: 'low' },
  { id: 'interior-bathrooms', name: 'Bathrooms', category: 'Interior', status: 'not_started', photoCount: 0, notesCount: 0, findings: '', damageDescription: '', recommendedActions: '', estimatedCost: 0, priority: 'low' },
  { id: 'interior-basement', name: 'Basement/Attic', category: 'Interior', status: 'not_started', photoCount: 0, notesCount: 0, findings: '', damageDescription: '', recommendedActions: '', estimatedCost: 0, priority: 'low' },

  // Systems
  { id: 'systems-electrical', name: 'Electrical System', category: 'Systems', status: 'not_started', photoCount: 0, notesCount: 0, findings: '', damageDescription: '', recommendedActions: '', estimatedCost: 0, priority: 'low' },
  { id: 'systems-plumbing', name: 'Plumbing System', category: 'Systems', status: 'not_started', photoCount: 0, notesCount: 0, findings: '', damageDescription: '', recommendedActions: '', estimatedCost: 0, priority: 'low' },
  { id: 'systems-hvac', name: 'HVAC System', category: 'Systems', status: 'not_started', photoCount: 0, notesCount: 0, findings: '', damageDescription: '', recommendedActions: '', estimatedCost: 0, priority: 'low' }
]

export function useInspectionData(inspectionId: string) {
  const [inspectionData, setInspectionData] = useState<InspectionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load inspection data
  useEffect(() => {
    if (!inspectionId) {
      setError('No inspection ID provided')
      setLoading(false)
      return
    }

    try {
      // Special handling for demo inspection INS-002
      if (inspectionId === 'INS-002') {
        // Define correct order based on DEFAULT_RESIDENTIAL_AREAS
        const correctOrder = [
          'exterior-roof',
          'exterior-siding',
          'exterior-windows',
          'exterior-foundation',
          'exterior-landscaping', // Note: different ID in demo data
          'interior-living',
          'interior-kitchen',
          'interior-bedrooms', // Master bedroom
          'interior-other', // Other bedrooms
          'interior-bathrooms',
          'interior-basement',
          'systems-electrical',
          'systems-plumbing',
          'systems-hvac'
        ]

        // Map demo data from inspection-media.ts
        const mappedAreas = inspectionMediaData.map(area => ({
          id: area.areaId,
          name: area.areaName,
          category: area.category,
          status: area.status,
          photoCount: area.media?.filter(m => m.type === 'photo').length || 0,
          notesCount: area.media?.filter(m => m.type === 'audio').length || 0,
          findings: area.findings || '',
          damageDescription: area.damageDescription || '',
          recommendedActions: area.recommendedActions || '',
          estimatedCost: area.estimatedCost || 0,
          priority: area.priority || 'low',
          previewImage: area.media?.find(m => m.type === 'photo')?.url, // Add preview image from first photo
          media: area.media || []
        }))

        // Sort areas according to correct order
        const demoAreas: InspectionArea[] = correctOrder
          .map(areaId => mappedAreas.find(area => area.id === areaId))
          .filter(area => area !== undefined) as InspectionArea[]

        const completedCount = demoAreas.filter(a => a.status === 'completed' || a.status === 'skipped').length
        const completionPercentage = Math.round((completedCount / demoAreas.length) * 100)

        const demoData: InspectionData = {
          id: inspectionId,
          property: {
            address: '4827 Oakwood Drive',
            type: 'residential',
            owner: 'Michael Chen',
            yearBuilt: '1998',
            policyNumber: 'HO-2024-78234'
          },
          areas: demoAreas,
          createdAt: '2024-03-15T10:30:00Z',
          updatedAt: new Date().toISOString(),
          completionPercentage
        }

        setInspectionData(demoData)
        // Don't save demo data to localStorage to keep it fresh
      } else {
        // Try to load from localStorage for non-demo inspections
        const stored = localStorage.getItem(`inspection-${inspectionId}-data`)
        if (stored) {
          const data = JSON.parse(stored)
          setInspectionData(data)
        } else {
        // Check if there's basic inspection info
        const basicInfo = localStorage.getItem(`inspection-${inspectionId}`)
        if (basicInfo) {
          // Initialize with default areas
          const basic = JSON.parse(basicInfo)
          const newData: InspectionData = {
            id: inspectionId,
            property: {
              address: basic.address || '',
              type: basic.propertyType || 'residential',
              owner: basic.ownerName || '',
              yearBuilt: basic.yearBuilt,
              policyNumber: basic.policyNumber
            },
            areas: DEFAULT_RESIDENTIAL_AREAS.map(area => ({ ...area, media: [] })),
            createdAt: basic.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            completionPercentage: 0
          }
          setInspectionData(newData)
          // Save the initialized data
          localStorage.setItem(`inspection-${inspectionId}-data`, JSON.stringify(newData))
        } else {
          setError(`No inspection found with ID: ${inspectionId}`)
        }
      }
      }
    } catch (err) {
      console.error('Error loading inspection data:', err)
      setError('Failed to load inspection data')
    } finally {
      setLoading(false)
    }
  }, [inspectionId])

  // Save inspection data
  const saveInspectionData = useCallback((data: InspectionData) => {
    try {
      // Calculate completion percentage
      const totalAreas = data.areas.length
      const completedAreas = data.areas.filter(a => a.status === 'completed' || a.status === 'skipped').length
      data.completionPercentage = Math.round((completedAreas / totalAreas) * 100)
      data.updatedAt = new Date().toISOString()

      localStorage.setItem(`inspection-${inspectionId}-data`, JSON.stringify(data))
      setInspectionData(data)
      return true
    } catch (err) {
      console.error('Error saving inspection data:', err)
      setError('Failed to save inspection data')
      return false
    }
  }, [inspectionId])

  // Update a specific area
  const updateArea = useCallback((areaId: string, updates: Partial<InspectionArea>) => {
    if (!inspectionData) return false

    const updatedData = {
      ...inspectionData,
      areas: inspectionData.areas.map(area =>
        area.id === areaId ? { ...area, ...updates } : area
      )
    }

    return saveInspectionData(updatedData)
  }, [inspectionData, saveInspectionData])

  // Mark area as completed
  const markAreaCompleted = useCallback((areaId: string) => {
    return updateArea(areaId, { status: 'completed' })
  }, [updateArea])

  // Mark area as skipped
  const markAreaSkipped = useCallback((areaId: string) => {
    return updateArea(areaId, { status: 'skipped' })
  }, [updateArea])

  // Mark area as in progress
  const markAreaInProgress = useCallback((areaId: string) => {
    return updateArea(areaId, { status: 'in_progress' })
  }, [updateArea])

  // Add media to an area
  const addMediaToArea = useCallback((areaId: string, media: MediaFile) => {
    if (!inspectionData) return false

    const area = inspectionData.areas.find(a => a.id === areaId)
    if (!area) return false

    const updatedMedia = [...(area.media || []), media]
    const photoCount = updatedMedia.filter(m => m.type === 'photo').length
    const notesCount = updatedMedia.filter(m => m.type === 'audio').length

    return updateArea(areaId, {
      media: updatedMedia,
      photoCount,
      notesCount
    })
  }, [inspectionData, updateArea])

  // Get inspection progress
  const getProgress = useCallback(() => {
    if (!inspectionData) return { percentage: 0, completed: 0, total: 0 }

    const total = inspectionData.areas.length
    const completed = inspectionData.areas.filter(a =>
      a.status === 'completed' || a.status === 'skipped'
    ).length

    return {
      percentage: inspectionData.completionPercentage,
      completed,
      total
    }
  }, [inspectionData])

  return {
    inspectionData,
    loading,
    error,
    saveInspectionData,
    updateArea,
    markAreaCompleted,
    markAreaSkipped,
    markAreaInProgress,
    addMediaToArea,
    getProgress
  }
}