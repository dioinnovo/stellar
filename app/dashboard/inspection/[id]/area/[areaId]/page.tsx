'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, ArrowRight, Camera, MicOff, Upload, X,
  Play, Pause, Brain, Lightbulb, CheckCircle, AlertTriangle,
  FileText, Home, Building2, Droplets, Wind, Zap, Eye,
  Save, SkipForward, RotateCcw
} from 'lucide-react'
import Link from 'next/link'
import { InspectionAreaCarousel } from '@/components/ui/inspection-area-carousel'
import { useInspectionData } from '@/lib/hooks/useInspectionData'

// Custom Microphone SVG Component
const MicrophoneIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fillRule="evenodd" clipRule="evenodd" d="M16.7673 6.54284C16.7673 3.91128 14.634 1.77799 12.0024 1.77799C9.37089 1.77799 7.2376 3.91129 7.2376 6.54284L7.2376 13.5647C7.2376 16.1963 9.37089 18.3296 12.0024 18.3296C14.634 18.3296 16.7673 16.1963 16.7673 13.5647L16.7673 6.54284ZM12.0024 3.28268C13.803 3.28268 15.2626 4.7423 15.2626 6.54284L15.2626 13.5647C15.2626 15.3652 13.803 16.8249 12.0024 16.8249C10.2019 16.8249 8.74229 15.3652 8.74229 13.5647L8.74229 6.54284C8.74229 4.7423 10.2019 3.28268 12.0024 3.28268Z"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M20.0274 8.79987C19.6119 8.79987 19.2751 9.1367 19.2751 9.55221V13.5647C19.2751 17.5813 16.019 20.8374 12.0024 20.8374C7.98587 20.8374 4.72979 17.5813 4.72979 13.5647L4.72979 9.55221C4.72979 9.1367 4.39295 8.79987 3.97744 8.79987C3.56193 8.79987 3.2251 9.1367 3.2251 9.55221L3.2251 13.5647C3.2251 18.4123 7.15485 22.3421 12.0024 22.3421C16.85 22.3421 20.7798 18.4123 20.7798 13.5647V9.55221C20.7798 9.1367 20.443 8.79987 20.0274 8.79987Z"/>
  </svg>
)

interface MediaFile {
  id: string
  file: File
  type: 'photo' | 'audio'
  url: string
  timestamp: Date
  category?: string
  transcript?: string
  duration?: number
}

interface AIInsight {
  type: 'suggestion' | 'warning' | 'opportunity'
  title: string
  description: string
  confidence: number
}

interface AreaData {
  findings: string
  damageDescription: string
  recommendedActions: string
  mediaFiles: MediaFile[]
  aiInsights: AIInsight[]
  completionStatus: 'not_started' | 'in_progress' | 'completed' | 'skipped'
}

interface InspectionArea {
  id: string
  name: string
  category: string
  icon?: any
  status?: 'not_started' | 'in_progress' | 'completed' | 'skipped'
  photoCount?: number
  notesCount?: number
  completionPercentage?: number
  previewImage?: string
  findings?: string
}

// Define all inspection areas for both property types
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
    { id: 'systems-hvac', name: 'HVAC System', category: 'Systems', icon: Wind },
    { id: 'systems-electrical', name: 'Electrical', category: 'Systems', icon: Zap },
    { id: 'systems-plumbing', name: 'Plumbing', category: 'Systems', icon: Droplets },
  ],
  commercial: [
    // Exterior
    { id: 'exterior-building', name: 'Building Envelope', category: 'Exterior', icon: Building2 },
    { id: 'exterior-roof-commercial', name: 'Roof Systems', category: 'Exterior', icon: Building2 },
    { id: 'exterior-hvac-units', name: 'Exterior HVAC', category: 'Exterior', icon: Building2 },
    { id: 'exterior-parking', name: 'Parking & Access', category: 'Exterior', icon: Building2 },
    
    // Interior Spaces
    { id: 'interior-retail', name: 'Retail/Office Areas', category: 'Interior', icon: Building2 },
    { id: 'interior-storage', name: 'Storage Areas', category: 'Interior', icon: Building2 },
    { id: 'interior-restrooms', name: 'Restrooms', category: 'Interior', icon: Building2 },
    { id: 'interior-mechanical', name: 'Mechanical Rooms', category: 'Interior', icon: Building2 },
    
    // Systems
    { id: 'systems-fire', name: 'Fire Suppression', category: 'Systems', icon: AlertTriangle },
    { id: 'systems-security', name: 'Security Systems', category: 'Systems', icon: Eye },
    { id: 'systems-commercial-hvac', name: 'Commercial HVAC', category: 'Systems', icon: Wind },
  ]
}

const PHOTO_CATEGORIES = [
  'Overview', 'Damage Close-up', 'Before/After', 'Comparative', 'Documentation'
]

export default function AreaInspectionPage() {
  const params = useParams()
  const router = useRouter()
  const inspectionId = params.id as string
  const areaId = params.areaId as string

  // Use the centralized inspection data hook
  const { inspectionData, updateArea, markAreaCompleted, markAreaSkipped } = useInspectionData(inspectionId)

  // Debug: Log inspection data loading
  React.useEffect(() => {
    console.log('🔄 useInspectionData hook state:')
    console.log('  - inspectionId:', inspectionId)
    console.log('  - hasInspectionData:', !!inspectionData)
    console.log('  - areasCount:', inspectionData?.areas?.length || 0)
    console.log('  - loadingComplete:', !!inspectionData)
    if (inspectionData?.areas) {
      console.log('  - areaIds:', inspectionData.areas.map(a => a.id))
    }
  }, [inspectionData, inspectionId])

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // State
  const [propertyType] = useState<'residential' | 'commercial'>('residential')
  const [currentArea, setCurrentArea] = useState(() => {
    // Get area from inspection data if available
    if (inspectionData) {
      const area = inspectionData.areas.find(a => a.id === areaId)
      if (area) return area
    }
    const areas = INSPECTION_AREAS[propertyType]
    return areas.find(area => area.id === areaId) || areas[0]
  })

  const [areaData, setAreaData] = useState<AreaData>({
    findings: '',
    damageDescription: '',
    recommendedActions: '',
    mediaFiles: [],
    aiInsights: [],
    completionStatus: 'not_started'
  })

  // Debug: Log areaData changes
  React.useEffect(() => {
    console.log('📊 AreaData updated:')
    console.log('  - areaId:', areaId)
    console.log('  - mediaFilesCount:', areaData.mediaFiles.length)
    console.log('  - photos:', areaData.mediaFiles.filter(f => f.type === 'photo').length)
    console.log('  - audio:', areaData.mediaFiles.filter(f => f.type === 'audio').length)
    console.log('  - findings length:', areaData.findings.length)
    console.log('  - completionStatus:', areaData.completionStatus)
    console.log('  - firstPhotoUrl:', areaData.mediaFiles.find(f => f.type === 'photo')?.url || 'NO PHOTOS')
  }, [areaData, areaId])
  
  // Navigation states - Start in form mode to show the inspection form
  const [navigationMode, setNavigationMode] = useState<'cards' | 'form'>('form')
  const [expandedAreaId, setExpandedAreaId] = useState<string | null>(areaId)
  
  // Track completion status for all areas
  const [areasStatus, setAreasStatus] = useState<Record<string, any>>({})
  
  // Load saved areas status on mount
  React.useEffect(() => {
    const savedStatus = localStorage.getItem(`inspection-${inspectionId}-areas`)
    if (savedStatus) {
      setAreasStatus(JSON.parse(savedStatus))
    }
  }, [inspectionId])

  // Update current area when URL parameter changes
  React.useEffect(() => {
    const areas = INSPECTION_AREAS[propertyType]
    const newArea = areas.find(area => area.id === areaId)
    if (newArea && newArea.id !== currentArea.id) {
      setCurrentArea(newArea)
      // Automatically expand the form view when navigating to a new area
      setNavigationMode('form')
      setExpandedAreaId(areaId)

      // For demo inspection INS-002, the demo data loading is handled by a separate useEffect
      // Here we only handle non-demo inspections
      if (inspectionId !== 'INS-002') {
        // Not demo inspection, use localStorage data
        const savedStatus = areasStatus[areaId]
        if (savedStatus) {
          setAreaData({
            findings: savedStatus.findings || '',
            damageDescription: savedStatus.damageDescription || '',
            recommendedActions: savedStatus.recommendedActions || '',
            mediaFiles: savedStatus.mediaFiles || [],
            aiInsights: savedStatus.aiInsights || [],
            completionStatus: savedStatus.status || 'not_started'
          })
        } else {
          // Reset to empty state for new area
          setAreaData({
            findings: '',
            damageDescription: '',
            recommendedActions: '',
            mediaFiles: [],
            aiInsights: [],
            completionStatus: 'not_started'
          })
        }
      }
    }
  }, [areaId, propertyType, areasStatus, currentArea.id, inspectionId, inspectionData])

  // Separate effect to handle demo data loading when inspectionData becomes available
  React.useEffect(() => {
    console.log('💫 Demo data availability check:', {
      inspectionId,
      areaId,
      hasInspectionData: !!inspectionData,
      isDemo: inspectionId === 'INS-002'
    })

    if (inspectionId === 'INS-002' && inspectionData && areaId) {
      console.log('🔥 Loading demo data for area:', areaId)
      const demoArea = inspectionData.areas.find(area => area.id === areaId)

      if (demoArea) {
        console.log('✅ Found demo area with status:', demoArea.status)

        // Load data for both completed and skipped areas
        if (demoArea.status === 'completed' || demoArea.status === 'skipped') {
          console.log('🔍 Demo area media:', demoArea.media)
          console.log('🔍 Total media items:', demoArea.media?.length || 0)
          console.log('🔍 Photo items:', demoArea.media?.filter(m => m.type === 'photo')?.length || 0)
          console.log('🔍 Audio items:', demoArea.media?.filter(m => m.type === 'audio')?.length || 0)

          // Convert demo data to component format
          const mediaFiles: MediaFile[] = [
            // Convert photos
            ...demoArea.media.filter(m => m.type === 'photo').map(photo => ({
              id: photo.id,
              file: new File([], photo.title || 'photo.jpg'),
              type: 'photo' as const,
              url: photo.url,
              timestamp: new Date(photo.timestamp),
              category: photo.category || 'Documentation'
            })),
            // Convert audio notes
            ...demoArea.media.filter(m => m.type === 'audio').map(audio => ({
              id: audio.id,
              file: new File([], 'audio.wav'),
              type: 'audio' as const,
              url: '#',
              timestamp: new Date(audio.timestamp),
              category: 'Voice Notes',
              transcript: audio.transcript,
              duration: audio.duration
            }))
          ]

          console.log('📊 Setting demo area data:')
          console.log('  - mediaFilesCount:', mediaFiles.length)
          console.log('  - photos:', mediaFiles.filter(m => m.type === 'photo').length)
          console.log('  - audio:', mediaFiles.filter(m => m.type === 'audio').length)
          console.log('  - findingsLength:', demoArea.findings?.length || 0)
          console.log('  - firstPhotoUrl:', mediaFiles.find(m => m.type === 'photo')?.url || 'NO PHOTOS')

          setAreaData({
            findings: demoArea.findings || '',
            damageDescription: demoArea.damageDescription || '',
            recommendedActions: demoArea.recommendedActions || '',
            mediaFiles: mediaFiles,
            aiInsights: [],
            completionStatus: demoArea.status as any // Use the actual status from demo data
          })

          console.log('🚀 setAreaData called with status:', demoArea.status)
        } else if (demoArea.status === 'not_started' || demoArea.status === 'in_progress') {
          // For not started or in progress areas, set empty data
          setAreaData({
            findings: '',
            damageDescription: '',
            recommendedActions: '',
            mediaFiles: [],
            aiInsights: [],
            completionStatus: demoArea.status as any
          })
        }
      } else {
        console.log('❌ Demo area not found:', { areaId })
      }
    }
  }, [inspectionData, inspectionId, areaId])

  // Auto-resize textareas when content changes or component mounts
  React.useEffect(() => {
    const autoResizeTextarea = (textarea: HTMLTextAreaElement | null) => {
      if (textarea) {
        textarea.style.height = 'auto'
        textarea.style.height = textarea.scrollHeight + 'px'
      }
    }

    // Resize all textareas
    autoResizeTextarea(findingsRef.current)
    autoResizeTextarea(damageRef.current)
    autoResizeTextarea(actionsRef.current)
  }, [areaData.findings, areaData.damageDescription, areaData.recommendedActions])

  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedPhotoCategory, setSelectedPhotoCategory] = useState('Overview')
  const [selectedVoiceNote, setSelectedVoiceNote] = useState<MediaFile | null>(null)
  const [showTranscriptModal, setShowTranscriptModal] = useState(false)

  // Refs for textareas
  const findingsRef = useRef<HTMLTextAreaElement>(null)
  const damageRef = useRef<HTMLTextAreaElement>(null)
  const actionsRef = useRef<HTMLTextAreaElement>(null)

  // Get current area position and navigation
  // For demo inspection, use data from inspectionData; otherwise use static areas
  const allAreas = (inspectionId === 'INS-002' && inspectionData?.areas)
    ? inspectionData.areas
    : INSPECTION_AREAS[propertyType]

  const currentIndex = allAreas.findIndex(area => area.id === areaId)
  const isFirstArea = currentIndex === 0
  const isLastArea = currentIndex === allAreas.length - 1
  const nextArea = !isLastArea ? allAreas[currentIndex + 1] : null
  const prevArea = !isFirstArea ? allAreas[currentIndex - 1] : null

  // Enhance areas with their status
  const enhancedAreas = React.useMemo(() => {
    // For demo inspection, use the data directly from inspectionData
    if (inspectionId === 'INS-002' && inspectionData?.areas) {
      return inspectionData.areas.map(area => ({
        ...area,
        photoCount: area.id === areaId ? areaData.mediaFiles.filter(f => f.type === 'photo').length : (area.photoCount || 0),
        notesCount: area.id === areaId ? areaData.mediaFiles.filter(f => f.type === 'audio').length : (area.notesCount || 0),
        findings: area.id === areaId ? areaData.findings : (area.findings || ''),
        previewImage: area.id === areaId ? areaData.mediaFiles.find(f => f.type === 'photo')?.url : area.previewImage
      }))
    }

    // For non-demo inspections, use localStorage approach
    return allAreas.map(area => ({
      ...area,
      ...(areasStatus[area.id] || {}),
      status: areasStatus[area.id]?.status || 'not_started',
      photoCount: area.id === areaId ? areaData.mediaFiles.filter(f => f.type === 'photo').length : (areasStatus[area.id]?.photoCount || 0),
      notesCount: area.id === areaId ? (areaData.findings ? 1 : 0) : (areasStatus[area.id]?.notesCount || 0),
      findings: area.id === areaId ? areaData.findings : (areasStatus[area.id]?.findings || ''),
      previewImage: area.id === areaId ? areaData.mediaFiles.find(f => f.type === 'photo')?.url : areasStatus[area.id]?.previewImage
    }))
  }, [allAreas, areasStatus, areaId, areaData, inspectionData, inspectionId])

  // File upload handler
  const handleFileUpload = useCallback((files: FileList) => {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const mediaFile: MediaFile = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          file,
          type: 'photo',
          url: URL.createObjectURL(file),
          timestamp: new Date(),
          category: selectedPhotoCategory
        }
        
        setAreaData(prev => ({
          ...prev,
          mediaFiles: [...prev.mediaFiles, mediaFile],
          completionStatus: 'in_progress'
        }))

        // Trigger AI analysis
        analyzeMedia(mediaFile)
      }
    })
  }, [selectedPhotoCategory])

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    handleFileUpload(files)
  }

  // Audio recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        const audioFile = new File([audioBlob], `audio-${Date.now()}.wav`, { type: 'audio/wav' })
        
        const mediaFile: MediaFile = {
          id: Date.now().toString(),
          file: audioFile,
          type: 'audio',
          url: URL.createObjectURL(audioBlob),
          timestamp: new Date()
        }

        setAreaData(prev => ({
          ...prev,
          mediaFiles: [...prev.mediaFiles, mediaFile],
          completionStatus: 'in_progress'
        }))

        // Process audio (transcription would happen here)
        processAudioRecording(mediaFile)
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      
      // Start duration timer
      const timer = setInterval(() => {
        setRecordingDuration(prev => prev + 1)
      }, 1000)

      setTimeout(() => clearInterval(timer), 60000) // Max 1 minute
    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setRecordingDuration(0)
      
      // Stop all tracks
      mediaRecorderRef.current.stream?.getTracks().forEach(track => track.stop())
    }
  }

  // AI Analysis functions
  const analyzeMedia = async (mediaFile: MediaFile) => {
    setIsAnalyzing(true)
    
    // Mock AI analysis
    setTimeout(() => {
      const mockInsights: AIInsight[] = [
        {
          type: 'suggestion',
          title: 'Document Water Staining',
          description: 'Visible water stains detected. Capture close-up photos of stain patterns for moisture mapping.',
          confidence: 92
        }
      ]
      
      setAreaData(prev => ({
        ...prev,
        aiInsights: [...prev.aiInsights, ...mockInsights]
      }))
      
      setIsAnalyzing(false)
    }, 2000)
  }

  const processAudioRecording = async (mediaFile: MediaFile) => {
    // Mock transcription
    setTimeout(() => {
      const transcription = "Inspector notes: Significant water damage observed on the ceiling..."
      setAreaData(prev => ({
        ...prev,
        findings: prev.findings + '\n\n' + transcription
      }))
    }, 1500)
  }

  const removeMediaFile = (fileId: string) => {
    setAreaData(prev => ({
      ...prev,
      mediaFiles: prev.mediaFiles.filter(f => f.id !== fileId)
    }))
  }

  const handleComplete = () => {
    // Update current area status
    setAreaData(prev => ({ ...prev, completionStatus: 'completed' }))

    // Update using the centralized hook
    if (updateArea) {
      updateArea(areaId, {
        status: 'completed',
        photoCount: areaData.mediaFiles.filter(f => f.type === 'photo').length,
        notesCount: areaData.mediaFiles.filter(f => f.type === 'audio').length,
        findings: areaData.findings,
        damageDescription: areaData.damageDescription,
        recommendedActions: areaData.recommendedActions,
        media: areaData.mediaFiles.map(f => ({
          id: f.id,
          type: f.type,
          url: f.url,
          title: `${f.type === 'photo' ? 'Photo' : 'Audio'} captured`,
          timestamp: f.timestamp.toISOString(),
          category: f.category || 'Documentation'
        }))
      })
    }

    if (nextArea) {
      router.push(`/dashboard/inspection/${inspectionId}/area/${nextArea.id}`)
    } else {
      router.push(`/dashboard/inspection/${inspectionId}/review`)
    }
  }

  const handleSkip = () => {
    // Update current area status as skipped
    setAreaData(prev => ({ ...prev, completionStatus: 'skipped' }))

    // Update using the centralized hook
    if (updateArea) {
      updateArea(areaId, {
        status: 'skipped',
        photoCount: areaData.mediaFiles.filter(f => f.type === 'photo').length,
        notesCount: areaData.mediaFiles.filter(f => f.type === 'audio').length,
        findings: areaData.findings
      })
    }
    
    if (nextArea) {
      router.push(`/dashboard/inspection/${inspectionId}/area/${nextArea.id}`)
    } else {
      router.push(`/dashboard/inspection/${inspectionId}/review`)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Handle area selection from cards
  const handleAreaSelect = (area: InspectionArea, index: number) => {
    // If clicking on the same area that's already in the URL, expand it
    if (area.id === areaId) {
      setNavigationMode('form')
      setExpandedAreaId(area.id)
    } else {
      // Navigate to the specific area inspection page when a different card is clicked
      router.push(`/dashboard/inspection/${inspectionId}/area/${area.id}`)
      // The navigation will be handled by the useEffect when the URL changes
    }
  }

  // Handle navigate back to cards
  const handleNavigateBack = () => {
    // Navigate to the areas overview page with current area as query parameter
    router.push(`/dashboard/inspection/${inspectionId}/areas?area=${areaId}`)
  }

  return (
    <>
      <InspectionAreaCarousel
      areas={enhancedAreas}
      currentAreaIndex={currentIndex}
      onAreaComplete={handleComplete}
      onAreaSkip={handleSkip}
      onAreaSelect={handleAreaSelect}
      onNavigateBack={handleNavigateBack}
      expandedAreaId={navigationMode === 'form' ? expandedAreaId : null}
      propertyType={propertyType}
      className=""
      inspectionId={inspectionId}
    >
      {/* Form Content - This is rendered inside the enhanced component when expanded */}
      <div className="space-y-4">
            {/* Photo Upload Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-gray-900">Photo Documentation</h2>
                <select
                  value={selectedPhotoCategory}
                  onChange={(e) => setSelectedPhotoCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-base"
                >
                  {PHOTO_CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Upload Area */}
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="mx-auto mb-3 text-gray-400" size={40} />
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Upload Photos - {selectedPhotoCategory}
                </p>
                <p className="text-xs text-gray-600 mb-2">
                  Drag and drop photos here or click to browse
                </p>
                <p className="text-xs text-gray-500">
                  Recommended: 4-8 photos per area • JPG, PNG up to 10MB each
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                className="hidden"
              />

              {/* Photo Grid */}
              {(() => {
                const photoCount = areaData.mediaFiles.filter(f => f.type === 'photo').length;
                console.log('🖼️ RENDER CHECK - Photo count:', photoCount, 'Total files:', areaData.mediaFiles.length);
                return photoCount > 0;
              })() && (
                <div className="mt-6">
                  <h3 className="font-medium text-gray-900 mb-3">
                    Uploaded Photos ({areaData.mediaFiles.filter(f => f.type === 'photo').length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {areaData.mediaFiles.filter(f => f.type === 'photo').map((file) => (
                      <div key={file.id} className="relative group">
                        <img
                          src={file.url}
                          alt="Inspection"
                          className="w-full aspect-square object-cover rounded-lg border border-gray-200"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <button
                            onClick={() => removeMediaFile(file.id)}
                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <div className="absolute bottom-2 left-2 right-2">
                          <div className="bg-black/75 text-white text-xs px-2 py-1 rounded">
                            {file.category}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Audio Recording Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h2 className="text-base font-semibold text-gray-900 mb-3">Voice Notes</h2>
              
              <div className="flex items-center gap-3 mb-3">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all text-sm ${
                    isRecording 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <MicOff size={18} />
                      <span>Stop Recording</span>
                    </>
                  ) : (
                    <>
                      <MicrophoneIcon className="w-6 h-6" />
                      <span>Start Recording</span>
                    </>
                  )}
                </button>
                
                {isRecording && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm font-mono">{formatDuration(recordingDuration)}</span>
                  </div>
                )}
              </div>

              {/* Audio Files */}
              {areaData.mediaFiles.filter(f => f.type === 'audio').length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900">Recorded Notes</h3>
                  {areaData.mediaFiles.filter(f => f.type === 'audio').map((file) => (
                    <div key={file.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <button
                        onClick={() => {
                          setSelectedVoiceNote(file)
                          setShowTranscriptModal(true)
                        }}
                        className="flex-1 flex items-center gap-3 text-left"
                      >
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <MicrophoneIcon className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">Voice Note</div>
                          <div className="text-xs text-gray-600">
                            {file.timestamp.toLocaleTimeString()} {file.duration ? `• ${file.duration}s` : ''}
                          </div>
                          {file.transcript && (
                            <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                              "{file.transcript}"
                            </div>
                          )}
                        </div>
                      </button>
                      <button
                        onClick={() => removeMediaFile(file.id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Text Documentation */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h2 className="text-base font-semibold text-gray-900 mb-3">Written Documentation</h2>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Key Findings
                  </label>
                  <textarea
                    ref={findingsRef}
                    value={areaData.findings}
                    onChange={(e) => {
                      setAreaData(prev => ({ ...prev, findings: e.target.value }))
                      // Auto-resize textarea
                      e.target.style.height = 'auto'
                      e.target.style.height = e.target.scrollHeight + 'px'
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
                    style={{ minHeight: '72px', overflow: 'hidden' }}
                    placeholder="Document visible damage, conditions, and observations..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Damage Description
                  </label>
                  <textarea
                    ref={damageRef}
                    value={areaData.damageDescription}
                    onChange={(e) => {
                      setAreaData(prev => ({ ...prev, damageDescription: e.target.value }))
                      // Auto-resize textarea
                      e.target.style.height = 'auto'
                      e.target.style.height = e.target.scrollHeight + 'px'
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
                    style={{ minHeight: '72px', overflow: 'hidden' }}
                    placeholder="Describe the extent and nature of damage..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Recommended Actions
                  </label>
                  <textarea
                    ref={actionsRef}
                    value={areaData.recommendedActions}
                    onChange={(e) => {
                      setAreaData(prev => ({ ...prev, recommendedActions: e.target.value }))
                      // Auto-resize textarea
                      e.target.style.height = 'auto'
                      e.target.style.height = e.target.scrollHeight + 'px'
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
                    style={{ minHeight: '48px', overflow: 'hidden' }}
                    placeholder="Immediate repairs needed, safety concerns..."
                  />
                </div>
              </div>
            </div>

            {/* AI Insights */}
            {areaData.aiInsights.length > 0 && (
              <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
                <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Brain size={18} className="text-blue-600" />
                  AI Insights
                </h2>
                <div className="space-y-2">
                  {areaData.aiInsights.map((insight, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        {insight.type === 'suggestion' && <Lightbulb size={16} className="text-yellow-500 mt-0.5" />}
                        {insight.type === 'warning' && <AlertTriangle size={16} className="text-red-500 mt-0.5" />}
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{insight.title}</h4>
                          <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
                          <div className="text-xs text-gray-500 mt-2">
                            Confidence: {insight.confidence}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
      </InspectionAreaCarousel>

      {/* Voice Note Transcript Modal */}
      <AnimatePresence key="transcript-modal">
        {showTranscriptModal && selectedVoiceNote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowTranscriptModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <MicrophoneIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Voice Note Transcript</h2>
                    <p className="text-sm text-gray-600">
                      {selectedVoiceNote.timestamp.toLocaleTimeString()}
                      {selectedVoiceNote.duration && ` • ${selectedVoiceNote.duration} seconds`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTranscriptModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                {selectedVoiceNote.transcript ? (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-medium text-gray-700 mb-2">Transcript</h3>
                      <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                        {selectedVoiceNote.transcript}
                      </p>
                    </div>

                    {/* Audio Player (if URL is available) */}
                    {selectedVoiceNote.url && selectedVoiceNote.url !== '#' && (
                      <div className="bg-purple-50 rounded-xl p-4">
                        <h3 className="font-medium text-gray-700 mb-2">Audio Recording</h3>
                        <audio controls className="w-full">
                          <source src={selectedVoiceNote.url} type="audio/wav" />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          // Copy transcript to clipboard
                          if (selectedVoiceNote.transcript) {
                            navigator.clipboard.writeText(selectedVoiceNote.transcript)
                          }
                        }}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                      >
                        Copy Transcript
                      </button>
                      <button
                        onClick={() => setShowTranscriptModal(false)}
                        className="flex-1 px-4 py-2 bg-stellar-orange text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MicrophoneIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No transcript available for this voice note</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}