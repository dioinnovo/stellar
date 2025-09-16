'use client'

import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, ArrowRight, Camera, Mic, MicOff, Upload, X, 
  Play, Pause, Brain, Lightbulb, CheckCircle, AlertTriangle,
  FileText, Home, Building2, Droplets, Wind, Zap, Eye,
  Save, SkipForward, RotateCcw
} from 'lucide-react'
import Link from 'next/link'
import { InspectionAreaCarousel } from '@/components/ui/inspection-area-carousel'

interface MediaFile {
  id: string
  file: File
  type: 'photo' | 'audio'
  url: string
  timestamp: Date
  category?: string
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
  completionStatus: 'not_started' | 'in_progress' | 'completed'
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

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // State
  const [propertyType] = useState<'residential' | 'commercial'>('residential')
  const [currentArea, setCurrentArea] = useState(() => {
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
  
  // Navigation states
  const [navigationMode, setNavigationMode] = useState<'cards' | 'form'>('cards')
  const [expandedAreaId, setExpandedAreaId] = useState<string | null>(null)
  
  // Track completion status for all areas
  const [areasStatus, setAreasStatus] = useState<Record<string, any>>({})
  
  // Load saved areas status on mount
  React.useEffect(() => {
    const savedStatus = localStorage.getItem(`inspection-${inspectionId}-areas`)
    if (savedStatus) {
      setAreasStatus(JSON.parse(savedStatus))
    }
  }, [inspectionId])

  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedPhotoCategory, setSelectedPhotoCategory] = useState('Overview')

  // Get current area position and navigation
  const allAreas = INSPECTION_AREAS[propertyType]
  const currentIndex = allAreas.findIndex(area => area.id === areaId)
  const isFirstArea = currentIndex === 0
  const isLastArea = currentIndex === allAreas.length - 1
  const nextArea = !isLastArea ? allAreas[currentIndex + 1] : null
  const prevArea = !isFirstArea ? allAreas[currentIndex - 1] : null

  // Enhance areas with their status
  const enhancedAreas = React.useMemo(() => {
    return allAreas.map(area => ({
      ...area,
      ...(areasStatus[area.id] || {}),
      status: areasStatus[area.id]?.status || 'not_started',
      photoCount: area.id === areaId ? areaData.mediaFiles.filter(f => f.type === 'photo').length : (areasStatus[area.id]?.photoCount || 0),
      notesCount: area.id === areaId ? (areaData.findings ? 1 : 0) : (areasStatus[area.id]?.notesCount || 0),
      findings: area.id === areaId ? areaData.findings : (areasStatus[area.id]?.findings || ''),
      previewImage: area.id === areaId ? areaData.mediaFiles.find(f => f.type === 'photo')?.url : areasStatus[area.id]?.previewImage
    }))
  }, [allAreas, areasStatus, areaId, areaData])

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
    const updatedStatus = {
      status: 'completed',
      photoCount: areaData.mediaFiles.filter(f => f.type === 'photo').length,
      notesCount: areaData.mediaFiles.filter(f => f.type === 'audio').length,
      findings: areaData.findings,
      completionPercentage: 100,
      previewImage: areaData.mediaFiles.find(f => f.type === 'photo')?.url
    }
    
    setAreasStatus(prev => ({
      ...prev,
      [areaId]: updatedStatus
    }))
    
    // Save to localStorage
    localStorage.setItem(`inspection-${inspectionId}-areas`, JSON.stringify({
      ...areasStatus,
      [areaId]: updatedStatus
    }))
    
    if (nextArea) {
      router.push(`/dashboard/inspection/${inspectionId}/area/${nextArea.id}`)
    } else {
      router.push(`/dashboard/inspection/${inspectionId}/review`)
    }
  }

  const handleSkip = () => {
    // Update current area status as skipped
    const updatedStatus = {
      status: 'skipped',
      photoCount: areaData.mediaFiles.filter(f => f.type === 'photo').length,
      notesCount: areaData.mediaFiles.filter(f => f.type === 'audio').length,
      findings: areaData.findings,
      completionPercentage: 0
    }
    
    setAreasStatus(prev => ({
      ...prev,
      [areaId]: updatedStatus
    }))
    
    // Save to localStorage
    localStorage.setItem(`inspection-${inspectionId}-areas`, JSON.stringify({
      ...areasStatus,
      [areaId]: updatedStatus
    }))
    
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
    setNavigationMode('form')
    setExpandedAreaId(area.id)
    if (area.id !== areaId) {
      router.push(`/dashboard/inspection/${inspectionId}/area/${area.id}`)
    }
  }

  // Handle navigate back to cards
  const handleNavigateBack = () => {
    setNavigationMode('cards')
    setExpandedAreaId(null)
  }

  return (
    <div className="h-[calc(100vh-120px)] md:h-[calc(100vh-64px)] bg-gray-50 overflow-auto">
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
      >
        {/* Form Content - This is rendered inside the enhanced component when expanded */}
        <div className="px-4 py-4 pb-24">
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
              {areaData.mediaFiles.filter(f => f.type === 'photo').length > 0 && (
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
                      <Mic size={18} />
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
                    <div key={file.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="text-sm font-medium">Voice Note</div>
                        <div className="text-xs text-gray-600">
                          {file.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
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
                    value={areaData.findings}
                    onChange={(e) => setAreaData(prev => ({ ...prev, findings: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
                    rows={3}
                    placeholder="Document visible damage, conditions, and observations..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Damage Description
                  </label>
                  <textarea
                    value={areaData.damageDescription}
                    onChange={(e) => setAreaData(prev => ({ ...prev, damageDescription: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
                    rows={3}
                    placeholder="Describe the extent and nature of damage..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Recommended Actions
                  </label>
                  <textarea
                    value={areaData.recommendedActions}
                    onChange={(e) => setAreaData(prev => ({ ...prev, recommendedActions: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
                    rows={2}
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

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleSkip}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                <SkipForward size={16} />
                <span>Skip Area</span>
              </button>
              <button
                onClick={handleComplete}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#E74C3C] text-white rounded-lg text-sm font-medium hover:bg-[#D73929] transition-colors"
              >
                <CheckCircle size={16} />
                <span>{isLastArea ? 'Complete' : 'Next Area'}</span>
              </button>
            </div>
          </div>
        </div>
      </InspectionAreaCarousel>
    </div>
  )
}