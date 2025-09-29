'use client'

import * as React from "react"
import { motion, AnimatePresence, PanInfo } from "framer-motion"
import { 
  Home, Building2, Droplets, Wind, Zap, Eye, AlertTriangle,
  Camera, FileText, CheckCircle, SkipForward, ArrowRight
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
}

interface PropertyAreaSwipeProps {
  areas: InspectionArea[]
  currentAreaIndex: number
  onSwipeRight: (area: InspectionArea) => void
  onSwipeLeft: (area: InspectionArea) => void
  onCardTap?: (area: InspectionArea) => void
  className?: string
}

export function PropertyAreaSwipe({
  areas,
  currentAreaIndex,
  onSwipeRight,
  onSwipeLeft,
  onCardTap,
  className = ""
}: PropertyAreaSwipeProps) {
  const [cards, setCards] = React.useState<InspectionArea[]>([])
  const [dragDirection, setDragDirection] = React.useState<'left' | 'right' | null>(null)
  const [draggedCardIndex, setDraggedCardIndex] = React.useState<number | null>(null)
  const swipeThreshold = 100
  const rotationMultiplier = 0.15

  React.useEffect(() => {
    // Show current area and next 2 areas as cards
    const visibleCards = areas.slice(currentAreaIndex, Math.min(currentAreaIndex + 3, areas.length))
    setCards(visibleCards)
  }, [areas, currentAreaIndex])

  const handleDrag = (_event: any, info: PanInfo, index: number) => {
    setDragDirection(info.offset.x > 0 ? "right" : "left")
    setDraggedCardIndex(index)
  }

  const handleDragEnd = (_event: any, info: PanInfo, index: number) => {
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

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Card Stack */}
      <div className="relative h-[400px] sm:h-[450px] flex items-center justify-center">
        <AnimatePresence mode="popLayout">
          {cards.map((area, index) => {
            const isTopCard = index === 0
            const isDragging = draggedCardIndex === index
            const zIndex = cards.length - index
            
            return (
              <motion.div
                key={`${area.id}-${index}`}
                drag={isTopCard ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.7}
                onDrag={(e, i) => handleDrag(e, i, index)}
                onDragEnd={(e, i) => handleDragEnd(e, i, index)}
                onClick={() => isTopCard && onCardTap && onCardTap(area)}
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
                  maxWidth: "400px",
                  zIndex,
                  cursor: isTopCard ? "grab" : "default",
                }}
                className="touch-none"
              >
                <div className={`
                  bg-white rounded-2xl shadow-xl border-2 border-gray-200
                  overflow-hidden transform transition-all
                  ${isTopCard ? 'hover:shadow-2xl' : ''}
                `}>
                  {/* Card Header with Category */}
                  <div className={`
                    px-6 py-4 border-b border-gray-100
                    ${area.category === 'Exterior' ? 'bg-blue-50' : 
                      area.category === 'Interior' ? 'bg-green-50' : 
                      'bg-purple-50'}
                  `}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`
                          p-2 rounded-lg
                          ${area.category === 'Exterior' ? 'bg-blue-100 text-blue-600' : 
                            area.category === 'Interior' ? 'bg-green-100 text-green-600' : 
                            'bg-purple-100 text-purple-600'}
                        `}>
                          {getCategoryIcon(area)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{area.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{area.category}</p>
                        </div>
                      </div>
                      <div className={`
                        px-3 py-1 rounded-full text-xs font-medium border
                        ${getStatusColor(area.status)}
                      `}>
                        {getStatusText(area.status)}
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    {/* Preview Image Placeholder */}
                    <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4 flex items-center justify-center">
                      <div className="text-center">
                        <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Area Preview</p>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {area.photoCount || 0} Photos
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {area.notesCount || 0} Notes
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {area.completionPercentage !== undefined && (
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                          <span>Progress</span>
                          <span>{area.completionPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-stellar-orange h-2 rounded-full transition-all"
                            style={{ width: `${area.completionPercentage}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Swipe Hints (only for top card) */}
                    {isTopCard && (
                      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <SkipForward className="w-3 h-3" />
                          <span>Swipe left to skip</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>Swipe right to continue</span>
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
                      {/* Red overlay for left swipe */}
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

      {/* Remaining Areas Indicator */}
      {cards.length > 0 && (
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {currentAreaIndex + 1} of {areas.length} areas
          </p>
          <div className="flex justify-center gap-1 mt-2">
            {areas.map((_, idx) => (
              <div
                key={idx}
                className={`
                  h-1.5 rounded-full transition-all
                  ${idx < currentAreaIndex ? 'w-1.5 bg-green-500' : 
                    idx === currentAreaIndex ? 'w-8 bg-stellar-orange' : 
                    'w-1.5 bg-gray-300'}
                `}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}