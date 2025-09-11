'use client'

import * as React from "react"
import { motion, AnimatePresence, PanInfo } from "framer-motion"
import { 
  Home, Building2, Droplets, Wind, Zap, Eye, AlertTriangle,
  Camera, FileText, CheckCircle, SkipForward, ArrowRight,
  ChevronDown, ChevronUp, X, Check
} from 'lucide-react'

interface InspectionArea {
  id: string
  name: string
  category: string
  icon: any
  status?: 'not_started' | 'in_progress' | 'completed' | 'skipped'
  photoCount?: number
  notesCount?: number
  completionPercentage?: number
  previewImage?: string
  findings?: string
}

interface PropertyAreaSwipeEnhancedProps {
  areas: InspectionArea[]
  currentAreaIndex: number
  onSwipeRight: (area: InspectionArea) => void
  onSwipeLeft: (area: InspectionArea) => void
  onAreaSelect: (area: InspectionArea, index: number) => void
  onNavigateBack: () => void
  expandedAreaId?: string | null
  className?: string
  children?: React.ReactNode // For rendering the expanded form content
}

export function PropertyAreaSwipeEnhanced({
  areas,
  currentAreaIndex,
  onSwipeRight,
  onSwipeLeft,
  onAreaSelect,
  onNavigateBack,
  expandedAreaId,
  className = "",
  children
}: PropertyAreaSwipeEnhancedProps) {
  const [cards, setCards] = React.useState<InspectionArea[]>([])
  const [dragDirection, setDragDirection] = React.useState<'left' | 'right' | null>(null)
  const [draggedCardIndex, setDraggedCardIndex] = React.useState<number | null>(null)
  const [isExpanded, setIsExpanded] = React.useState(false)
  const swipeThreshold = 100
  const rotationMultiplier = 0.15

  React.useEffect(() => {
    // Show current area and next 2 areas as cards
    const visibleCards = areas.slice(currentAreaIndex, Math.min(currentAreaIndex + 3, areas.length))
    setCards(visibleCards)
  }, [areas, currentAreaIndex])

  React.useEffect(() => {
    setIsExpanded(!!expandedAreaId)
  }, [expandedAreaId])

  const handleDrag = (_event: any, info: PanInfo, index: number) => {
    if (isExpanded) return // Disable drag when expanded
    setDragDirection(info.offset.x > 0 ? "right" : "left")
    setDraggedCardIndex(index)
  }

  const handleDragEnd = (_event: any, info: PanInfo, index: number) => {
    if (isExpanded) return // Disable drag when expanded
    const card = cards[index]
    
    if (Math.abs(info.offset.x) > swipeThreshold) {
      // Swipe detected
      const direction = info.offset.x > 0 ? "right" : "left"
      setDragDirection(direction)
      
      // Trigger callback after animation
      setTimeout(() => {
        if (direction === "right") {
          onSwipeRight(card)
        } else {
          onSwipeLeft(card)
        }
        setDragDirection(null)
        setDraggedCardIndex(null)
      }, 300)
    } else {
      // Reset if not swiped far enough
      setDragDirection(null)
      setDraggedCardIndex(null)
    }
  }

  const handleCardTap = (area: InspectionArea, index: number) => {
    if (!isExpanded) {
      onAreaSelect(area, currentAreaIndex + index)
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'skipped':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'in_progress':
        return 'In Progress'
      case 'skipped':
        return 'Skipped'
      default:
        return 'Not Started'
    }
  }

  const getCategoryIcon = (area: InspectionArea) => {
    const Icon = area.icon || Home
    return <Icon className="w-6 h-6" />
  }

  // Render expanded view
  if (isExpanded && expandedAreaId) {
    const expandedArea = areas.find(a => a.id === expandedAreaId)
    if (!expandedArea) return null

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className={`relative w-full ${className}`}
      >
        {/* Expanded Header with Navigation */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`
                  p-2 rounded-lg
                  ${expandedArea.category === 'Exterior' ? 'bg-blue-100 text-blue-600' : 
                    expandedArea.category === 'Interior' ? 'bg-green-100 text-green-600' : 
                    'bg-purple-100 text-purple-600'}
                `}>
                  {getCategoryIcon(expandedArea)}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{expandedArea.name}</h2>
                  <p className="text-sm text-gray-500">{expandedArea.category}</p>
                </div>
              </div>
              
              {/* Status Badge with Check */}
              <div className="flex items-center gap-2">
                {expandedArea.status === 'completed' && (
                  <div className="p-1 bg-green-500 rounded-full">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={`
                  px-3 py-1 rounded-full text-xs font-medium border
                  ${getStatusColor(expandedArea.status)}
                `}>
                  {getStatusText(expandedArea.status)}
                </div>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center gap-1 mb-3">
              {areas.map((area, idx) => (
                <div
                  key={area.id}
                  className={`
                    h-1.5 flex-1 rounded-full transition-all
                    ${area.status === 'completed' ? 'bg-green-500' : 
                      area.status === 'in_progress' ? 'bg-blue-500' :
                      area.status === 'skipped' ? 'bg-yellow-500' :
                      'bg-gray-300'}
                    ${area.id === expandedAreaId ? 'h-2' : ''}
                  `}
                />
              ))}
            </div>

            {/* Navigate Button */}
            <button
              onClick={onNavigateBack}
              className="w-full bg-stellar-orange text-white px-4 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors"
            >
              <ChevronUp size={18} />
              Navigate to Areas
            </button>
          </div>
        </div>

        {/* Expanded Content */}
        <div className="flex-1">
          {children}
        </div>
      </motion.div>
    )
  }

  // Render collapsed card view
  return (
    <div className={`relative w-full ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Select Area to Inspect</h2>
        <p className="text-sm text-gray-600">Tap a card to start documenting or swipe to navigate</p>
      </div>

      {/* Card Stack */}
      <div className="relative h-[400px] sm:h-[450px] flex items-center justify-center px-4">
        <AnimatePresence mode="popLayout">
          {cards.map((area, index) => {
            const isTopCard = index === 0
            const isDragging = draggedCardIndex === index
            const zIndex = cards.length - index
            const hasContent = (area.photoCount || 0) > 0 || (area.notesCount || 0) > 0
            
            return (
              <motion.div
                key={`${area.id}-${index}`}
                drag={isTopCard ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.7}
                onDrag={(e, i) => handleDrag(e, i, index)}
                onDragEnd={(e, i) => handleDragEnd(e, i, index)}
                onClick={() => handleCardTap(area, index)}
                initial={{ scale: 0.95, y: 20, opacity: 0 }}
                animate={{ 
                  scale: 1 - (index * 0.05),
                  y: index * -30,
                  opacity: 1,
                  x: 0,
                  rotate: 0,
                  transition: { 
                    duration: 0.3, 
                    ease: "easeOut",
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }
                }}
                exit={{
                  x: dragDirection === "right" ? 300 : -300,
                  rotate: dragDirection === "right" ? 20 : -20,
                  opacity: 0,
                  transition: { duration: 0.3, ease: "easeIn" }
                }}
                whileDrag={{
                  rotate: isDragging ? dragDirection === "right" ? 10 : -10 : 0,
                  scale: 1.05
                }}
                style={{
                  position: "absolute",
                  width: "100%",
                  maxWidth: "380px",
                  zIndex,
                  cursor: isTopCard ? "grab" : "default",
                }}
                className="touch-none"
              >
                <div className={`
                  bg-white rounded-2xl shadow-xl border-2
                  overflow-hidden transform transition-all
                  ${area.status === 'completed' ? 'border-green-400' : 'border-gray-200'}
                  ${isTopCard ? 'hover:shadow-2xl' : ''}
                `}>
                  {/* Completion Badge */}
                  {area.status === 'completed' && (
                    <div className="absolute top-4 right-4 z-10 bg-green-500 rounded-full p-2 shadow-lg">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  )}

                  {/* Card Header with Category */}
                  <div className={`
                    px-6 py-4 border-b border-gray-100
                    ${area.category === 'Exterior' ? 'bg-blue-50' : 
                      area.category === 'Interior' ? 'bg-green-50' : 
                      'bg-purple-50'}
                  `}>
                    <div className="flex items-center gap-3">
                      <div className={`
                        p-2 rounded-lg
                        ${area.category === 'Exterior' ? 'bg-blue-100 text-blue-600' : 
                          area.category === 'Interior' ? 'bg-green-100 text-green-600' : 
                          'bg-purple-100 text-purple-600'}
                      `}>
                        {getCategoryIcon(area)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{area.name}</h3>
                        <p className="text-sm text-gray-500">{area.category}</p>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    {/* Preview Image or Placeholder */}
                    <div className="w-full h-48 bg-gray-100 rounded-lg mb-4 overflow-hidden">
                      {area.previewImage ? (
                        <img 
                          src={area.previewImage} 
                          alt={area.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                          <Camera className="w-12 h-12 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">Tap to start inspection</p>
                        </div>
                      )}
                    </div>

                    {/* Content Stats */}
                    {hasContent && (
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-blue-100 rounded">
                            <Camera className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {area.photoCount || 0} Photos
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-purple-100 rounded">
                            <FileText className="w-4 h-4 text-purple-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {area.notesCount || 0} Notes
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Findings Preview */}
                    {area.findings && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 line-clamp-2">{area.findings}</p>
                      </div>
                    )}

                    {/* Progress Bar */}
                    {area.completionPercentage !== undefined && area.completionPercentage > 0 && (
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{area.completionPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-stellar-orange h-2 rounded-full transition-all"
                            style={{ width: `${area.completionPercentage}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Swipe Hints (only for top card) */}
                    {isTopCard && (
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <SkipForward className="w-3 h-3" />
                          <span>Swipe left to skip</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>Swipe right to complete</span>
                          <CheckCircle className="w-3 h-3" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Swipe Overlay Effects */}
                  {isTopCard && isDragging && (
                    <>
                      {/* Green overlay for right swipe */}
                      <div 
                        className={`
                          absolute inset-0 bg-green-500 rounded-2xl pointer-events-none
                          transition-opacity duration-200
                        `}
                        style={{
                          opacity: dragDirection === 'right' ? 0.2 : 0
                        }}
                      />
                      {/* Yellow overlay for left swipe */}
                      <div 
                        className={`
                          absolute inset-0 bg-yellow-500 rounded-2xl pointer-events-none
                          transition-opacity duration-200
                        `}
                        style={{
                          opacity: dragDirection === 'left' ? 0.2 : 0
                        }}
                      />
                      
                      {/* Action Icons */}
                      {dragDirection && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className={`
                            p-4 rounded-full
                            ${dragDirection === 'right' ? 'bg-green-500' : 'bg-yellow-500'}
                            text-white shadow-lg
                            transform transition-all duration-200
                            ${isDragging ? 'scale-110' : 'scale-100'}
                          `}>
                            {dragDirection === 'right' ? (
                              <CheckCircle className="w-8 h-8" />
                            ) : (
                              <SkipForward className="w-8 h-8" />
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Area Progress Indicator */}
      {cards.length > 0 && (
        <div className="px-4 mt-6">
          <div className="text-center mb-3">
            <p className="text-sm text-gray-600">
              Area {currentAreaIndex + 1} of {areas.length}
            </p>
          </div>
          <div className="flex justify-center gap-1">
            {areas.map((area, idx) => (
              <div
                key={idx}
                className={`
                  h-1.5 rounded-full transition-all
                  ${area.status === 'completed' ? 'w-1.5 bg-green-500' : 
                    area.status === 'skipped' ? 'w-1.5 bg-yellow-500' :
                    idx === currentAreaIndex ? 'w-8 bg-stellar-orange' : 
                    'w-1.5 bg-gray-300'}
                `}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quick Action Buttons */}
      <div className="px-4 mt-6">
        <div className="flex gap-3">
          <button
            onClick={() => cards[0] && onSwipeLeft(cards[0])}
            className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <SkipForward size={16} />
            Skip Area
          </button>
          <button
            onClick={() => cards[0] && handleCardTap(cards[0], 0)}
            className="flex-1 bg-stellar-orange text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
          >
            <Camera size={16} />
            Start Inspection
          </button>
        </div>
      </div>
    </div>
  )
}