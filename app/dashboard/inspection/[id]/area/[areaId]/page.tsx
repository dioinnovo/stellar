'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, ArrowRight, Camera, Mic, MicOff, Upload, X, 
  Play, Pause, Brain, Lightbulb, CheckCircle, AlertTriangle,
  FileText, Home, Building2, Droplets, Wind, Zap, Eye,
  Save, SkipForward, RotateCcw
} from 'lucide-react'
import Link from 'next/link'

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
  const [propertyType] = useState<'residential' | 'commercial'>('residential') // Would be loaded from inspection data
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
    
    // Mock AI analysis - in production, this would call Claude Vision API
    setTimeout(() => {
      const mockInsights: AIInsight[] = [
        {
          type: 'suggestion',
          title: 'Document Water Staining',
          description: 'Visible water stains detected. Capture close-up photos of stain patterns for moisture mapping.',
          confidence: 92
        },
        {
          type: 'warning', 
          title: 'Potential Mold Risk',
          description: 'Moisture conditions suggest possible mold growth. Check adjacent areas and document ventilation.',
          confidence: 78
        },
        {
          type: 'opportunity',
          title: 'Historical Pattern Match',
          description: 'Similar damage in 2021 was undercompensated by $8,500. Consider supplemental claim.',
          confidence: 85
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
    // Mock transcription and processing
    setTimeout(() => {
      setAreaData(prev => ({
        ...prev,
        findings: prev.findings + ' [Audio transcription: Noted water damage in northeast corner with visible staining and soft flooring.]'
      }))
    }, 1500)
  }

  // Form handlers
  const updateField = (field: keyof AreaData, value: string) => {
    setAreaData(prev => ({
      ...prev,
      [field]: value,
      completionStatus: 'in_progress'
    }))
  }

  const removeMediaFile = (fileId: string) => {
    setAreaData(prev => ({
      ...prev,
      mediaFiles: prev.mediaFiles.filter(f => f.id !== fileId)
    }))
  }

  const handleSave = async () => {
    // Save current area data
    console.log('Saving area data:', { areaId, areaData })
  }

  const handleComplete = () => {
    setAreaData(prev => ({ ...prev, completionStatus: 'completed' }))
    if (nextArea) {
      router.push(`/dashboard/inspection/${inspectionId}/area/${nextArea.id}`)
    } else {
      router.push(`/dashboard/inspection/${inspectionId}/review`)
    }
  }

  const handleSkip = () => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href={`/dashboard/inspection/${inspectionId}/start`}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 cursor-pointer"
              >
                <ArrowLeft size={20} />
                Back to Setup
              </Link>
              <div className="w-px h-6 bg-gray-300" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {currentArea.name}
                </h1>
                <p className="text-sm text-gray-600">
                  Area {currentIndex + 1} of {allAreas.length} • {currentArea.category}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600">
                Progress: {Math.round(((currentIndex + 1) / allAreas.length) * 100)}%
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-stellar-orange h-2 rounded-full transition-all"
                  style={{ width: `${((currentIndex + 1) / allAreas.length) * 100}%` }}
                />
              </div>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 cursor-pointer"
              >
                <Save size={18} />
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo Upload Section */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Photo Documentation</h2>
                <select
                  value={selectedPhotoCategory}
                  onChange={(e) => setSelectedPhotoCategory(e.target.value)}
                  className="px-3 py-1 border border-gray-200 rounded-lg text-sm"
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
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Upload Photos - {selectedPhotoCategory}
                </p>
                <p className="text-gray-600 mb-4">
                  Drag and drop photos here or click to browse
                </p>
                <p className="text-sm text-gray-500">
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
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Voice Notes</h2>
              
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                    isRecording 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <MicOff size={20} />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic size={20} />
                      Start Recording
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
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Written Documentation</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Key Findings
                  </label>
                  <textarea
                    value={areaData.findings}
                    onChange={(e) => updateField('findings', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                    placeholder="Document key observations, measurements, and initial findings..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Damage Description
                  </label>
                  <textarea
                    value={areaData.damageDescription}
                    onChange={(e) => updateField('damageDescription', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                    placeholder="Detailed description of any damage, severity, and extent..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recommended Actions
                  </label>
                  <textarea
                    value={areaData.recommendedActions}
                    onChange={(e) => updateField('recommendedActions', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                    placeholder="Recommended repairs, further investigation needed, safety concerns..."
                  />
                </div>
              </div>
            </div>

            {/* AI Analysis & Suggestions - Moved from sidebar */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Brain className={`text-stellar-orange ${isAnalyzing ? 'animate-pulse' : ''}`} size={24} />
                <h2 className="text-lg font-semibold text-gray-900">AI Analysis & Suggestions</h2>
              </div>

              {isAnalyzing && (
                <div className="animate-pulse space-y-3 mb-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              )}

              <AnimatePresence>
                {areaData.aiInsights.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {areaData.aiInsights.map((insight, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-xl ${
                          insight.type === 'suggestion' ? 'bg-blue-50 border border-blue-200' :
                          insight.type === 'warning' ? 'bg-amber-50 border border-amber-200' :
                          'bg-green-50 border border-green-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {insight.type === 'suggestion' ? (
                            <Lightbulb className="text-blue-600 mt-0.5" size={18} />
                          ) : insight.type === 'warning' ? (
                            <AlertTriangle className="text-amber-600 mt-0.5" size={18} />
                          ) : (
                            <CheckCircle className="text-green-600 mt-0.5" size={18} />
                          )}
                          <div className="flex-1">
                            <h4 className="font-medium text-sm mb-2">{insight.title}</h4>
                            <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                            <div className="text-xs text-gray-500">
                              Confidence: {insight.confidence}%
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>

              {areaData.aiInsights.length === 0 && !isAnalyzing && (
                <div className="text-center py-8">
                  <Brain className="mx-auto mb-3 text-gray-300" size={48} />
                  <p className="text-gray-500 mb-2">AI Analysis Ready</p>
                  <p className="text-sm text-gray-400">
                    Upload photos or add descriptions to get intelligent insights and suggestions
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Navigation Only */}
          <div className="space-y-6">

            {/* Area Navigation */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-semibold mb-4">Area Navigation</h3>
              
              <div className="space-y-2 mb-6">
                {allAreas.map((area, idx) => (
                  <Link
                    key={area.id}
                    href={`/dashboard/inspection/${inspectionId}/area/${area.id}`}
                    className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                      area.id === areaId 
                        ? 'bg-gray-900 text-white' 
                        : idx < currentIndex 
                        ? 'bg-green-50 text-green-800 hover:bg-green-100'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`p-1 rounded ${
                      area.id === areaId 
                        ? 'bg-white/20' 
                        : idx < currentIndex
                        ? 'bg-green-100'
                        : 'bg-gray-100'
                    }`}>
                      <area.icon size={16} />
                    </div>
                    <span className="text-sm font-medium">{area.name}</span>
                    {idx < currentIndex && (
                      <CheckCircle size={16} className="ml-auto text-green-600" />
                    )}
                  </Link>
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleComplete}
                  className="w-full bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  {isLastArea ? (
                    <>
                      <FileText size={18} />
                      Complete Inspection
                    </>
                  ) : (
                    <>
                      <ArrowRight size={18} />
                      Next: {nextArea?.name}
                    </>
                  )}
                </button>

                <button
                  onClick={handleSkip}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <SkipForward size={18} />
                  Skip Area
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}