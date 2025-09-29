"use client"

import React, { useState, useEffect } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"

import "swiper/css"
import "swiper/css/effect-coverflow"
import "swiper/css/pagination"
import "swiper/css/navigation"

import {
  EffectCoverflow,
  Navigation,
  Pagination,
} from "swiper/modules"

import { Badge } from "@/components/ui/badge"
import {
  Camera,
  FileText,
  CheckCircle,
  SkipForward,
  ArrowRight,
  ArrowLeft,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  CircleIcon,
  ChevronUp
} from 'lucide-react'
import { cn } from "@/lib/utils"
import { 
  getAreaIcon, 
  getCategoryColor, 
  getStatusInfo,
  RESIDENTIAL_AREA_ICONS,
  COMMERCIAL_AREA_ICONS
} from "@/lib/inspection-icons"

export interface InspectionArea {
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
  lastModified?: Date
}

interface InspectionAreaCarouselProps {
  areas: InspectionArea[]
  currentAreaIndex: number
  onAreaSelect: (area: InspectionArea, index: number) => void
  onAreaComplete: (area: InspectionArea) => void
  onAreaSkip: (area: InspectionArea) => void
  onNavigateBack?: () => void
  expandedAreaId?: string | null
  propertyType: 'residential' | 'commercial'
  className?: string
  children?: React.ReactNode
  inspectionId?: string
}

export function InspectionAreaCarousel({
  areas,
  currentAreaIndex,
  onAreaSelect,
  onAreaComplete,
  onAreaSkip,
  onNavigateBack,
  expandedAreaId,
  propertyType,
  className = "",
  children,
  inspectionId
}: InspectionAreaCarouselProps) {
  const router = useRouter()
  const [activeIndex, setActiveIndex] = useState(currentAreaIndex)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showBottomNav, setShowBottomNav] = useState(true)
  const swiperRef = React.useRef<any>(null)

  const areaIcons = propertyType === 'residential' ? RESIDENTIAL_AREA_ICONS : COMMERCIAL_AREA_ICONS

  useEffect(() => {
    setIsExpanded(!!expandedAreaId)
  }, [expandedAreaId])

  useEffect(() => {
    if (swiperRef.current && !isExpanded) {
      swiperRef.current.slideTo(currentAreaIndex)
    }
  }, [currentAreaIndex, isExpanded])

  // Calculate overall progress (excluding skipped areas)
  const calculateProgress = () => {
    const completedAreas = areas.filter(a => a.status === 'completed').length
    const totalAreas = areas.filter(a => a.status !== 'skipped').length
    return totalAreas > 0 ? Math.round((completedAreas / totalAreas) * 100) : 0
  }

  const progress = calculateProgress()

  // Get area with icon info
  const getAreaWithIcon = (area: InspectionArea) => {
    const iconInfo = getAreaIcon(area.id, propertyType)
    return {
      ...area,
      iconInfo
    }
  }

  // Handle quick navigation from bottom icons - scrolls carousel only
  const handleQuickNavigation = (index: number) => {
    setActiveIndex(index)
    if (swiperRef.current) {
      swiperRef.current.slideTo(index)
    }
    // Don't trigger area selection - let the user click the active card
  }

  // Render expanded view
  if (isExpanded && expandedAreaId) {
    const expandedArea = areas.find(a => a.id === expandedAreaId)
    if (!expandedArea) return null

    const areaWithIcon = getAreaWithIcon(expandedArea)
    const statusInfo = getStatusInfo(expandedArea.status)
    const categoryColors = getCategoryColor(expandedArea.category)

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className={`space-y-4 ${className}`}
      >
        {/* Expanded Header */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 sm:p-6">
          {/* Back button and Status on same line */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onNavigateBack}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-100 transition"
            >
              <ArrowLeft size={20} />
              <span className="text-sm">Back to Area Selection</span>
            </button>
            <Badge variant={statusInfo.badgeVariant} className="flex items-center gap-1">
              <statusInfo.icon className="w-3 h-3" />
              {getStatusText(expandedArea.status)}
            </Badge>
          </div>

          {/* Area Info */}
          <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${categoryColors.bgColor}`}>
                {areaWithIcon.iconInfo ? (
                  <areaWithIcon.iconInfo.icon className={`w-6 h-6 ${categoryColors.color}`} />
                ) : (
                  <Camera className={`w-6 h-6 ${categoryColors.color}`} />
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{expandedArea.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{expandedArea.category}</p>
              </div>
            </div>

          {/* Area Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
              <span>{expandedArea.name} Inspection Progress</span>
              <span>
                {expandedArea.status === 'completed' ? '100%' :
                 expandedArea.status === 'skipped' ? 'Skipped' :
                 `${expandedArea.completionPercentage || 0}%`}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={cn(
                  "h-2 rounded-full transition-all",
                  expandedArea.status === 'completed' && "bg-green-500",
                  expandedArea.status === 'skipped' && "bg-yellow-500",
                  expandedArea.status === 'in_progress' && "bg-blue-500",
                  (!expandedArea.status || expandedArea.status === 'not_started') && "bg-stellar-orange"
                )}
                style={{
                  width: expandedArea.status === 'completed' ? '100%' :
                         expandedArea.status === 'skipped' ? '100%' :
                         `${expandedArea.completionPercentage || 0}%`
                }}
              />
            </div>
          </div>

          {/* Action Buttons - Skip and Complete */}
          <div className="flex gap-2">
            <button
              onClick={() => onAreaSkip(expandedArea)}
              className="flex-1 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg font-medium hover:bg-yellow-200 transition-colors flex items-center justify-center gap-2"
            >
              <SkipForward size={16} />
              Skip Area
            </button>
            <button
              onClick={() => onAreaComplete(expandedArea)}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle size={16} />
              Complete Area
            </button>
          </div>
        </div>

        {/* Expanded Content */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 sm:p-6">
          {children}
        </div>
      </motion.div>
    )
  }

  // Render carousel view
  return (
    <div className={cn("relative flex flex-col h-full", className)}>
      {/* Header */}
      <div className="p-4 bg-white dark:bg-gray-900 border-b border-gray-200 flex-shrink-0">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-stellar-dark mb-1">Property Inspection Areas</h2>

          {/* Instructions */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Swipe through areas and tap to document damage
          </p>

          {/* Area Status Indicators */}
          <div className="flex items-center gap-1 mb-3">
            {areas.map((area, idx) => (
              <div
                key={`status-indicator-${area.id}-${idx}`}
                className={cn(
                  "h-2 flex-1 rounded-full transition-all",
                  area.status === 'completed' && 'bg-green-500',
                  area.status === 'in_progress' && 'bg-blue-500',
                  area.status === 'skipped' && 'bg-yellow-500',
                  (!area.status || area.status === 'not_started') && 'bg-white border border-gray-300'
                )}
                title={`${area.name}: ${area.status || 'not started'}`}
              />
            ))}
          </div>

          {/* Complete Inspection Button */}
          <button
            onClick={() => {
              // Navigate to complete inspection page which triggers animation and report generation
              if (inspectionId) {
                router.push(`/dashboard/inspection/${inspectionId}/complete`)
              } else {
                console.warn('No inspection ID provided for completion')
              }
            }}
            className="w-full py-2.5 px-4 rounded-full font-medium transition-all duration-200 bg-green-600 text-white hover:bg-green-700 shadow-md cursor-pointer"
          >
            <span className="flex items-center justify-center gap-2">
              <CheckCircle size={18} />
              Confirm Inspection
            </span>
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div className="h-[520px] px-1 py-4" style={{ overflow: 'visible' }}>
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper
          }}
          spaceBetween={10}
          effect={"coverflow"}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={"auto"}
          initialSlide={currentAreaIndex}
          coverflowEffect={{
            rotate: 35,
            stretch: 20,
            depth: 150,
            modifier: 1,
            slideShadows: false,
          }}
          navigation={{
            nextEl: ".swiper-button-next-custom",
            prevEl: ".swiper-button-prev-custom",
          }}
          onSlideChange={(swiper) => {
            setActiveIndex(swiper.activeIndex)
          }}
          modules={[EffectCoverflow, Navigation]}
          className="inspection-carousel"
        >
          {areas.map((area, index) => {
            const areaWithIcon = getAreaWithIcon(area)
            const statusInfo = getStatusInfo(area.status)
            const categoryColors = getCategoryColor(area.category)
            const hasContent = (area.photoCount || 0) > 0 || (area.notesCount || 0) > 0

            return (
              <SwiperSlide key={area.id} className="!w-[250px] !h-[420px]">
                <div
                  className={cn(
                    "h-full transition-all duration-200",
                    index === activeIndex ? "cursor-pointer" : "cursor-grab"
                  )}
                  onClick={() => {
                    // Only trigger onAreaSelect if this is the active card
                    if (index === activeIndex) {
                      onAreaSelect(area, index)
                    } else {
                      // Otherwise, scroll the carousel to this card
                      if (swiperRef.current) {
                        swiperRef.current.slideTo(index)
                      }
                    }
                  }}
                >
                  <div className={cn(
                    "bg-white rounded-xl border-2 overflow-hidden relative h-[420px] max-h-[420px] flex flex-col transition-all duration-200",
                    area.status === 'completed' && 'border-green-400',
                    area.status === 'in_progress' && 'border-blue-400',
                    area.status === 'skipped' && 'border-yellow-400',
                    !area.status && 'border-gray-200'
                  )}>
                    {/* Status Badge - Top Right Corner */}
                    {area.status && (
                      <div className="absolute top-2 right-2 z-10">
                        {area.status === 'completed' && (
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                            <Check className="w-5 h-5 text-white" />
                          </div>
                        )}
                        {area.status === 'skipped' && (
                          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-md">
                            <SkipForward className="w-4 h-4 text-white" />
                          </div>
                        )}
                        {area.status === 'in_progress' && (
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                            <ArrowRight className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Card Header */}
                    <div className={cn("px-3 py-2 border-b", categoryColors.bgColor)}>
                      <div className="flex items-center gap-2">
                        <div className={cn("p-1 rounded-lg bg-white/80")}>
                          {areaWithIcon.iconInfo ? (
                            <areaWithIcon.iconInfo.icon className={cn("w-4 h-4", categoryColors.color)} />
                          ) : (
                            <Camera className={cn("w-4 h-4", categoryColors.color)} />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{area.name}</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{area.category}</p>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 flex-1 flex flex-col">
                      {/* Preview Image or Placeholder */}
                      <div className="w-full h-[180px] bg-gray-100 dark:bg-gray-800 rounded-lg mb-2 overflow-hidden">
                        {area.previewImage && !area.previewImage.startsWith('blob:') ? (
                          <img
                            src={area.previewImage}
                            alt={area.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Hide the image if it fails to load
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            <Camera className="w-10 h-10 text-gray-400 mb-1" />
                            <p className="text-xs text-gray-500 dark:text-gray-400">Tap to start inspection</p>
                          </div>
                        )}
                      </div>

                      {/* Content Stats */}
                      {hasContent && (
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="flex items-center gap-2">
                            <Camera className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {area.photoCount || 0} Photos
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {area.notesCount || 0} Notes
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Progress Bar */}
                      {area.completionPercentage !== undefined && area.completionPercentage > 0 && (
                        <div className="mb-2">
                          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-0.5">
                            <span>Area Progress</span>
                            <span>{area.completionPercentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div 
                              className="bg-stellar-orange h-1.5 rounded-full transition-all"
                              style={{ width: `${area.completionPercentage}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Last Modified */}
                      {area.lastModified && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>Last updated {formatTimeAgo(area.lastModified)}</span>
                        </div>
                      )}

                      {/* Quick Actions - Only show on active card */}
                      {index === activeIndex && !area.status && (
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onAreaSkip(area)
                            }}
                            className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
                          >
                            <SkipForward size={14} />
                            Skip
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onAreaSelect(area, index)
                            }}
                            className="flex-1 bg-stellar-orange text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-1"
                          >
                            <Camera size={14} />
                            Start
                          </button>
                        </div>
                      )}

                      {/* Instruction for non-active cards */}
                      {index !== activeIndex && !area.status && (
                        <div className="mt-4 text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Click to select</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            )
          })}
        </Swiper>

        {/* Custom Navigation Buttons - Aligned to middle of cards */}
        <button className="swiper-button-prev-custom absolute left-4 top-[50%] -translate-y-1/2 z-10 p-2 bg-white dark:bg-gray-900 rounded-full shadow-lg hover:shadow-xl transition-shadow">
          <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        <button className="swiper-button-next-custom absolute right-4 top-[50%] -translate-y-1/2 z-10 p-2 bg-white dark:bg-gray-900 rounded-full shadow-lg hover:shadow-xl transition-shadow">
          <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
      </div>

      {/* Progress Dots and Current Position */}
      <div className="px-4 py-2 bg-white dark:bg-gray-900 border-t border-gray-200 flex-shrink-0">
        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-0.5 mb-1">
          {areas.map((area, idx) => (
            <button
              key={`progress-dot-${area.id}-${idx}`}
              onClick={() => handleQuickNavigation(idx)}
              className={cn(
                "transition-all rounded-full border",
                idx === activeIndex ? "w-2 h-2" : "w-1.5 h-1.5",
                area.status === 'completed' && "bg-green-500 border-green-600",
                area.status === 'in_progress' && "bg-blue-500 border-blue-600",
                area.status === 'skipped' && "bg-yellow-500 border-yellow-600",
                !area.status && "bg-gray-400 border-gray-500",
                idx === activeIndex && area.status !== 'completed' && "bg-stellar-orange border-orange-700 ring-1 ring-stellar-orange/30",
                idx === activeIndex && area.status === 'completed' && "ring-1 ring-green-500/30"
              )}
              title={area.name}
            />
          ))}
        </div>

        {/* Current Position Text */}
        <p className="text-[10px] text-gray-600 dark:text-gray-400 text-center">
          Area {activeIndex + 1} of {areas.length}
        </p>
      </div>

      {/* Bottom Navigation Bar with Icons */}
      <AnimatePresence>
        {showBottomNav && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="bg-white dark:bg-gray-900 border-t border-gray-200 px-4 pb-2 pt-0 flex-shrink-0"
          >
            {/* Category Groups */}
            <div className="space-y-0.5">
              {['Exterior', 'Interior', 'Systems'].map(category => {
                const categoryAreas = areas.filter(a => a.category === category)
                if (categoryAreas.length === 0) return null
                
                const categoryColors = getCategoryColor(category)
                
                return (
                  <div key={category}>
                    <div className="text-[9px] font-medium text-gray-500 dark:text-gray-400 mb-0.5">{category}</div>
                    <div className="flex items-center gap-2 overflow-x-auto p-0.5">
                      {categoryAreas.map((area, areaIndex) => {
                        const globalIndex = areas.findIndex(a => a.id === area.id)
                        const areaWithIcon = getAreaWithIcon(area)
                        const statusInfo = getStatusInfo(area.status)
                        const isActive = globalIndex === activeIndex

                        return (
                          <button
                            key={`bottom-nav-${area.id}-${areaIndex}`}
                            onClick={() => handleQuickNavigation(globalIndex)}
                            className={cn(
                              "relative p-2.5 rounded-md transition-all flex-shrink-0",
                              area.status === 'completed' && "bg-green-50",
                              area.status === 'skipped' && "bg-yellow-50",
                              area.status === 'in_progress' && "bg-blue-50",
                              !area.status && "bg-gray-50 hover:bg-gray-100",
                              isActive && area.status !== 'completed' && area.status !== 'skipped' && "bg-stellar-orange ring-2 ring-stellar-orange/40",
                              isActive && area.status === 'completed' && "bg-green-50 ring-2 ring-green-500/40",
                              isActive && area.status === 'skipped' && "bg-yellow-50 ring-2 ring-yellow-500/40"
                            )}
                            title={area.name}
                          >
                            {areaWithIcon.iconInfo ? (
                              <areaWithIcon.iconInfo.icon
                                className={cn(
                                  "w-5 h-5",
                                  area.status === 'completed' && "text-green-600",
                                  area.status === 'skipped' && "text-yellow-600",
                                  area.status === 'in_progress' && "text-blue-600",
                                  !area.status && (isActive ? "text-white" : "text-gray-500")
                                )}
                              />
                            ) : area.icon ? (
                              <area.icon
                                className={cn(
                                  "w-5 h-5",
                                  area.status === 'completed' && "text-green-600",
                                  area.status === 'skipped' && "text-yellow-600",
                                  area.status === 'in_progress' && "text-blue-600",
                                  !area.status && (isActive ? "text-white" : "text-gray-500")
                                )}
                              />
                            ) : (
                              <Camera className={cn("w-5 h-5", isActive ? "text-white" : "text-gray-500")} />
                            )}

                            {/* Status Indicator */}
                            {area.status === 'completed' && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center border border-white">
                                <Check className="w-2 h-2 text-white" />
                              </div>
                            )}
                            {area.status === 'skipped' && (
                              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-yellow-500 rounded-full" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .inspection-carousel {
          width: 100%;
        }

        .inspection-carousel .swiper-slide {
          background-position: center;
          background-size: cover;
        }

        /* Remove any dark overlays from swiper-wrapper */
        .inspection-carousel .swiper-wrapper {
          background: transparent !important;
        }

        .inspection-carousel .swiper-wrapper::before,
        .inspection-carousel .swiper-wrapper::after {
          display: none !important;
        }


        .inspection-carousel .swiper-slide {
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  )
}

// Helper function to get status text
function getStatusText(status?: string): string {
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

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}