'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, ArrowRight, Camera, Play, Pause, Download, FileText,
  CheckCircle, AlertTriangle, Clock, MapPin, User, Home, Mic,
  Image as ImageIcon, ChevronRight, Eye, Brain, TrendingUp,
  BarChart3, AlertCircle, Save, Send, MoreVertical, X
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  inspectionMediaData, 
  inspectionSummary, 
  getInspectionProgress,
  getAllPhotos,
  getAllVoiceNotes,
  getTotalEstimatedDamage,
  AreaInspectionData,
  MediaFile
} from '@/lib/inspection-media'

// Helper function for consistent date formatting
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const year = date.getFullYear()
  const hours = date.getHours()
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12

  return `${month}/${day}/${year}, ${displayHours}:${minutes} ${ampm}`
}

export default function ContinueInspectionPage() {
  const params = useParams()
  const router = useRouter()
  const inspectionId = params.id as string

  const [selectedArea, setSelectedArea] = useState<AreaInspectionData | null>(null)
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null)
  const [showMediaModal, setShowMediaModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'areas' | 'media' | 'insights'>('overview')
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  
  const progress = getInspectionProgress()
  const photos = getAllPhotos()
  const voiceNotes = getAllVoiceNotes()
  const totalDamage = getTotalEstimatedDamage()
  
  // Group areas by category
  const areasByCategory = inspectionMediaData.reduce((acc, area) => {
    if (!acc[area.category]) {
      acc[area.category] = []
    }
    acc[area.category].push(area)
    return acc
  }, {} as Record<string, AreaInspectionData[]>)
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200'
      case 'in_progress': return 'text-amber-600 bg-amber-50 border-amber-200'
      case 'not_started': return 'text-gray-500 bg-gray-50 border-gray-200'
      default: return 'text-gray-500 bg-gray-50 border-gray-200'
    }
  }
  
  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const handleResumeInspection = () => {
    // Find the first incomplete area
    const nextArea = inspectionMediaData.find(area => area.status === 'not_started')
    if (nextArea) {
      router.push(`/dashboard/inspection/${inspectionId}/area/${nextArea.areaId}`)
    }
  }

  const handleGeneratePreliminaryReport = () => {
    router.push(`/dashboard/inspection/${inspectionId}/report?preliminary=true`)
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto py-4 px-4">
          <div>
            <Link
              href="/dashboard/inspection"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-3"
            >
              <ArrowLeft size={20} />
              <span>Back to Inspections</span>
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Continue Inspection
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {inspectionSummary.propertyAddress}
                </p>
              </div>
              <div className="flex items-center gap-2">
              <button
                onClick={() => {}}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <Save size={20} />
              </button>
              <button
                onClick={() => {}}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <MoreVertical size={20} />
              </button>
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="max-w-7xl mx-auto py-6">
        {/* Main Progress Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Camera className="text-emerald-600" size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Inspection in Progress</h2>
                  <p className="text-sm text-gray-600">Started {inspectionSummary.elapsedTime} ago</p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                  <span className="text-2xl font-bold text-emerald-600">{progress.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div 
                    className="bg-green-600 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress.percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">{progress.completed} areas completed</span>
                  <span className="text-xs text-gray-500">{progress.remaining} areas remaining</span>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <ImageIcon size={16} className="text-blue-600" />
                    <span className="text-xs text-gray-600">Photos</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{photos.length}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Mic size={16} className="text-purple-600" />
                    <span className="text-xs text-gray-600">Voice Notes</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{voiceNotes.length}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock size={16} className="text-amber-600" />
                    <span className="text-xs text-gray-600">Time Spent</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">3h 15m</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp size={16} className="text-red-600" />
                    <span className="text-xs text-gray-600">Est. Damage</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">${(totalDamage / 1000).toFixed(0)}k</p>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleResumeInspection}
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all flex items-center justify-center gap-2 font-semibold shadow-lg"
              >
                <Camera size={20} />
                Resume Inspection
                <ArrowRight size={20} />
              </button>
              <button
                onClick={handleGeneratePreliminaryReport}
                className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 font-semibold"
              >
                <FileText size={20} />
                Preliminary Report
              </button>
            </div>
          </div>
        </div>

        {/* Critical Findings Alert */}
        {inspectionSummary.criticalFindings > 0 && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-red-600 mt-1" size={20} />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-1">
                  {inspectionSummary.criticalFindings} Critical Findings Identified
                </h3>
                <ul className="text-sm text-red-800 space-y-1">
                  {inspectionSummary.safetyHazardsIdentified.map((hazard, idx) => (
                    <li key={idx}>• {hazard}</li>
                  ))}
                </ul>
                <div className="mt-3">
                  <h4 className="font-semibold text-red-900 text-sm mb-1">Immediate Actions Required:</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {inspectionSummary.immediateActions.map((action, idx) => (
                      <li key={idx}>✓ {action}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-t-xl border border-gray-200 border-b-0">
          <div className="flex gap-1 p-1">
            {(['overview', 'areas', 'media', 'insights'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  activeTab === tab
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-xl border border-gray-200 border-t-0 p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Client and Property Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Property Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Home size={16} className="text-gray-400" />
                      <span className="text-gray-600">Address:</span>
                      <span className="font-medium">{inspectionSummary.propertyAddress}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <span className="text-gray-600">Client:</span>
                      <span className="font-medium">{inspectionSummary.clientName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <span className="text-gray-600">Inspector:</span>
                      <span className="font-medium">{inspectionSummary.inspector}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Inspection Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-gray-400" />
                      <span className="text-gray-600">Start Time:</span>
                      <span className="font-medium">{formatDate(inspectionSummary.startTime)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 size={16} className="text-gray-400" />
                      <span className="text-gray-600">Progress:</span>
                      <span className="font-medium">{progress.completed} of {progress.total} areas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-gray-400" />
                      <span className="text-gray-600">Weather:</span>
                      <span className="font-medium">{inspectionSummary.weatherConditions}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-blue-50 rounded-xl p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Next Steps</h3>
                <p className="text-sm text-blue-800 mb-3">
                  Continue with inspection of remaining {progress.remaining} areas to complete the assessment.
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-blue-700">Next Area:</span>
                  <span className="font-semibold text-blue-900">{inspectionSummary.nextArea}</span>
                </div>
              </div>
            </div>
          )}

          {/* Areas Tab */}
          {activeTab === 'areas' && (
            <div className="space-y-6">
              {Object.entries(areasByCategory).map(([category, areas]) => (
                <div key={category}>
                  <h3 className="font-semibold text-gray-900 mb-3">{category}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {areas.map((area) => (
                      <div
                        key={area.areaId}
                        className={`border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${
                          area.status === 'completed' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                        }`}
                        onClick={() => setSelectedArea(area)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{area.areaName}</h4>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(area.status)}`}>
                              {area.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          {area.status === 'completed' && (
                            <CheckCircle className="text-emerald-600" size={20} />
                          )}
                        </div>
                        
                        {area.status === 'completed' && (
                          <>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {area.findings}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 text-xs">
                                <span className="text-gray-500">
                                  {area.media.filter(m => m.type === 'photo').length} photos
                                </span>
                                <span className="text-gray-500">
                                  {area.media.filter(m => m.type === 'audio').length} notes
                                </span>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(area.priority)}`}>
                                {area.priority.toUpperCase()}
                              </span>
                            </div>
                            {area.estimatedCost > 0 && (
                              <div className="mt-2 pt-2 border-t border-gray-200">
                                <span className="text-sm font-semibold text-gray-900">
                                  Est. Cost: ${area.estimatedCost.toLocaleString()}
                                </span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Media Tab */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              {/* Photos Section */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Photos ({photos.length})</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="relative group cursor-pointer"
                      onClick={() => {
                        setSelectedMedia(photo)
                        setShowMediaModal(true)
                      }}
                    >
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={photo.url}
                          alt={photo.title}
                          width={300}
                          height={300}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="text-white text-sm font-medium line-clamp-2">{photo.title}</p>
                          <p className="text-white/80 text-xs">{photo.category}</p>
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="text-white drop-shadow-lg" size={20} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Voice Notes Section */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Voice Notes ({voiceNotes.length})</h3>
                <div className="space-y-3">
                  {voiceNotes.map((note) => (
                    <div
                      key={note.id}
                      className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => setPlayingAudio(playingAudio === note.id ? null : note.id)}
                          className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          {playingAudio === note.id ? (
                            <Pause size={20} />
                          ) : (
                            <Play size={20} />
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">{note.title}</h4>
                              <p className="text-xs text-gray-500">
                                {note.timestamp} • {note.duration}s
                              </p>
                            </div>
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                              {note.category}
                            </span>
                          </div>
                          {note.transcript && (
                            <div className="bg-white rounded-lg p-3 text-sm text-gray-700">
                              <p className="italic">"{note.transcript}"</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Insights Tab */}
          {activeTab === 'insights' && (
            <div className="space-y-6">
              {/* AI Analysis */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Brain className="text-purple-600" size={24} />
                  <h3 className="font-semibold text-gray-900">AI Analysis</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-medium text-gray-700 mb-2">Hidden Damage Risk</h4>
                    <p className="text-2xl font-bold text-red-600 mb-1">HIGH</p>
                    <p className="text-sm text-gray-600">
                      Multiple indicators suggest water damage extends beyond visible areas
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-medium text-gray-700 mb-2">Cost Confidence</h4>
                    <p className="text-2xl font-bold text-amber-600 mb-1">75%</p>
                    <p className="text-sm text-gray-600">
                      Based on {progress.completed} completed areas
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-medium text-gray-700 mb-2">Estimated Total Damage</h4>
                    <p className="text-2xl font-bold text-emerald-600 mb-1">
                      ${Math.round(totalDamage / 0.65).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Projected based on current findings
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-medium text-gray-700 mb-2">Urgency Level</h4>
                    <p className="text-2xl font-bold text-red-600 mb-1">CRITICAL</p>
                    <p className="text-sm text-gray-600">
                      Immediate action required for safety
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Findings */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Key Findings So Far</h3>
                <div className="space-y-3">
                  {inspectionMediaData
                    .filter(area => area.status === 'completed' && area.priority === 'high')
                    .map((area) => (
                      <div key={area.areaId} className="bg-red-50 rounded-lg p-4 border border-red-200">
                        <h4 className="font-semibold text-red-900 mb-1">{area.areaName}</h4>
                        <p className="text-sm text-red-800 mb-2">{area.findings}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-red-700">
                            Estimated Cost: ${area.estimatedCost.toLocaleString()}
                          </span>
                          <button
                            onClick={() => setSelectedArea(area)}
                            className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
                          >
                            View Details
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Area Detail Modal */}
      <AnimatePresence>
        {selectedArea && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedArea(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">{selectedArea.areaName}</h2>
                <button
                  onClick={() => setSelectedArea(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Status and Priority */}
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedArea.status)}`}>
                    {selectedArea.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedArea.priority)}`}>
                    {selectedArea.priority.toUpperCase()} PRIORITY
                  </span>
                  {selectedArea.estimatedCost > 0 && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                      ${selectedArea.estimatedCost.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Findings */}
                {selectedArea.findings && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Findings</h3>
                    <p className="text-gray-700">{selectedArea.findings}</p>
                  </div>
                )}

                {/* Damage Description */}
                {selectedArea.damageDescription && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Damage Description</h3>
                    <p className="text-gray-700">{selectedArea.damageDescription}</p>
                  </div>
                )}

                {/* Recommended Actions */}
                {selectedArea.recommendedActions && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Recommended Actions</h3>
                    <p className="text-gray-700">{selectedArea.recommendedActions}</p>
                  </div>
                )}

                {/* AI Insights */}
                {selectedArea.aiInsights && (
                  <div className="bg-purple-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="text-purple-600" size={20} />
                      <h3 className="font-semibold text-gray-900">AI Insights</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-700">
                        <span className="font-medium">Hidden Damage Risk:</span> {selectedArea.aiInsights.hiddenDamageRisk}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">Confidence:</span> {selectedArea.aiInsights.costConfidence}%
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">Urgency:</span> {selectedArea.aiInsights.urgencyLevel}
                      </p>
                    </div>
                  </div>
                )}

                {/* Media */}
                {selectedArea.media.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Documentation</h3>
                    
                    {/* Photos */}
                    {selectedArea.media.filter(m => m.type === 'photo').length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Photos</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {selectedArea.media
                            .filter(m => m.type === 'photo')
                            .map((photo) => (
                              <div key={photo.id} className="relative group cursor-pointer">
                                <div className="aspect-square rounded-lg overflow-hidden">
                                  <Image
                                    src={photo.url}
                                    alt={photo.title}
                                    width={200}
                                    height={200}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <p className="text-xs text-gray-600 mt-1">{photo.title}</p>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Voice Notes */}
                    {selectedArea.media.filter(m => m.type === 'audio').length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Voice Notes</h4>
                        <div className="space-y-2">
                          {selectedArea.media
                            .filter(m => m.type === 'audio')
                            .map((note) => (
                              <div key={note.id} className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-start gap-3">
                                  <button className="p-1.5 bg-purple-600 text-white rounded">
                                    <Play size={16} />
                                  </button>
                                  <div className="flex-1">
                                    <p className="font-medium text-sm text-gray-900">{note.title}</p>
                                    {note.transcript && (
                                      <p className="text-xs text-gray-600 mt-1 italic">"{note.transcript}"</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Media Modal */}
      <AnimatePresence>
        {showMediaModal && selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
            onClick={() => setShowMediaModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-t-xl p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedMedia.title}</h3>
                  <p className="text-sm text-gray-600">{selectedMedia.category} • {selectedMedia.timestamp}</p>
                </div>
                <button
                  onClick={() => setShowMediaModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
              {selectedMedia.type === 'photo' && (
                <div className="relative">
                  <Image
                    src={selectedMedia.url}
                    alt={selectedMedia.title}
                    width={1200}
                    height={800}
                    className="w-full h-auto"
                  />
                  {selectedMedia.description && (
                    <div className="bg-white p-4 rounded-b-xl">
                      <p className="text-gray-700">{selectedMedia.description}</p>
                      {selectedMedia.tags && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedMedia.tags.map((tag) => (
                            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}