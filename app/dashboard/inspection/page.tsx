'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Camera, Plus, Calendar, Clock, MapPin, User, CheckCircle,
  AlertCircle, FileText, TrendingUp, Search, Filter, Download,
  Building2, Home, ChevronRight, Eye
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { PageHeader } from '@/components/ui/page-header'
import { useSidebar } from '@/contexts/SidebarContext'

interface Inspection {
  id: string
  claimId: string
  propertyAddress: string
  propertyType: string
  status: string
  scheduledDate: string
  scheduledTime: string
  inspector: string
  clientName: string
  damageType: string
  estimatedDuration: string
  completionRate: number
  reportReady?: boolean
  estimatedValue?: number
  imageUrl?: string
  photosCount?: number
  areasInspected?: string[]
  currentArea?: string
  damageAssessment?: {
    severity: string
    description: string
    recommendation: string
  }
  reportDetails?: {
    totalPhotos: number
    areasCompleted: number
    totalAreas: number
    findings: string[]
    estimatedRepairCost: number
  }
}

export default function InspectionListPage() {
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDamageType, setFilterDamageType] = useState('all')
  const { isCollapsed } = useSidebar()

  // Mock data for inspections with Unsplash images
  const inspections: Inspection[] = [
    // ONE Green - Active inspection
    {
      id: 'INS-002',
      claimId: 'CLM-2024-002',
      propertyAddress: '5678 Palm Avenue, Coral Gables, FL',
      propertyType: 'Residential',
      status: 'in_progress',
      scheduledDate: '2024-03-19',
      scheduledTime: '2:00 PM',
      inspector: 'Maria Garcia',
      clientName: 'Sarah Thompson',
      damageType: 'Water Damage',
      estimatedDuration: '3 hours',
      completionRate: 65,
      imageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop&q=80',
      photosCount: 16,
      currentArea: 'Kitchen & Dining',
      areasInspected: ['Exterior Roof', 'Exterior Siding', 'Living Room', 'Kitchen & Dining'],
      damageAssessment: {
        severity: 'Moderate',
        description: 'Water intrusion through roof causing ceiling damage and potential mold growth in kitchen area',
        recommendation: 'Immediate roof repair and professional water remediation required'
      }
    },
    // TWO Orange - Scheduled inspections
    {
      id: 'INS-001',
      claimId: 'CLM-2024-001',
      propertyAddress: '1234 Ocean Drive, Miami Beach, FL',
      propertyType: 'Commercial',
      status: 'scheduled',
      scheduledDate: '2024-03-20',
      scheduledTime: '10:00 AM',
      inspector: 'James Rodriguez',
      clientName: 'Johnson Properties LLC',
      damageType: 'Hurricane',
      estimatedDuration: '4 hours',
      completionRate: 0,
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop&q=80',
      damageAssessment: {
        severity: 'Severe',
        description: 'Category 3 hurricane damage to high-rise office building with extensive facade and structural concerns',
        recommendation: 'Comprehensive structural assessment required before occupancy'
      }
    },
    {
      id: 'INS-005',
      claimId: 'CLM-2024-005',
      propertyAddress: '7890 Collins Avenue, Miami Beach, FL',
      propertyType: 'Commercial',
      status: 'scheduled',
      scheduledDate: '2024-03-21',
      scheduledTime: '9:30 AM',
      inspector: 'James Rodriguez',
      clientName: 'Beach Resort Holdings',
      damageType: 'Flood Damage',
      estimatedDuration: '6 hours',
      completionRate: 0,
      imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop&q=80',
      damageAssessment: {
        severity: 'Moderate',
        description: 'Ground floor flooding affecting lobby, restaurant, and mechanical areas of beachfront resort',
        recommendation: 'Immediate water extraction and comprehensive mold prevention protocol'
      }
    },
    // ONE Yellow - Needs attention/review
    {
      id: 'INS-003',
      claimId: 'CLM-2024-003',
      propertyAddress: '9012 Sunset Blvd, Miami, FL',
      propertyType: 'Commercial',
      status: 'completed',
      scheduledDate: '2024-03-18',
      scheduledTime: '9:00 AM',
      inspector: 'James Rodriguez',
      clientName: 'Miami Retail Group',
      damageType: 'Wind Damage',
      estimatedDuration: '5 hours',
      completionRate: 100,
      reportReady: true,
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop&q=80',
      reportDetails: {
        totalPhotos: 89,
        areasCompleted: 8,
        totalAreas: 8,
        findings: [
          'Significant facade damage on south wall',
          'Multiple broken windows requiring replacement',
          'HVAC system damage - commercial unit compromised',
          'Interior water damage in main retail space',
          'Electrical panel requires inspection and potential replacement'
        ],
        estimatedRepairCost: 275000
      }
    },
    // Black - Report ready (completed)
    {
      id: 'INS-004',
      claimId: 'CLM-2024-004',
      propertyAddress: '3456 Bay Road, Key Biscayne, FL',
      propertyType: 'Residential',
      status: 'report_ready',
      scheduledDate: '2024-03-17',
      scheduledTime: '11:00 AM',
      inspector: 'Maria Garcia',
      clientName: 'Robert Williams',
      damageType: 'Roof Damage',
      estimatedDuration: '2.5 hours',
      completionRate: 100,
      reportReady: true,
      estimatedValue: 145000,
      imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop&q=80',
      reportDetails: {
        totalPhotos: 63,
        areasCompleted: 6,
        totalAreas: 6,
        findings: [
          'Extensive roof tile damage on east and south-facing slopes',
          'Multiple missing or displaced tiles creating potential water entry points',
          'Gutter system compromised with several detached sections',
          'Attic insulation shows signs of water intrusion',
          'Minor interior ceiling staining in master bedroom'
        ],
        estimatedRepairCost: 145000
      }
    },
    {
      id: 'INS-006',
      claimId: 'CLM-2024-006',
      propertyAddress: '2345 Coral Way, Coral Gables, FL',
      propertyType: 'Residential',
      status: 'report_ready',
      scheduledDate: '2024-03-16',
      scheduledTime: '4:00 PM',
      inspector: 'Maria Garcia',
      clientName: 'David Martinez',
      damageType: 'Storm Damage',
      estimatedDuration: '3.5 hours',
      completionRate: 100,
      reportReady: true,
      imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=600&fit=crop&q=80',
      reportDetails: {
        totalPhotos: 71,
        areasCompleted: 7,
        totalAreas: 7,
        findings: [
          'Fallen tree caused significant damage to west-facing exterior wall',
          'Window frames damaged requiring full replacement of 3 units',
          'Landscaping and outdoor structures severely impacted',
          'Minor roof damage with several loose shingles',
          'Electrical outdoor fixtures damaged and need replacement',
          'Fence and gate system requires complete reconstruction'
        ],
        estimatedRepairCost: 98500
      }
    }
  ]

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'scheduled': return 'bg-blue-500 text-white'
      case 'in_progress': return 'bg-amber-500 text-white'
      case 'completed': return 'bg-green-500 text-white'
      case 'report_ready': return 'bg-purple-500 text-white'
      case 'cancelled': return 'bg-gray-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'scheduled': return 'Scheduled'
      case 'in_progress': return 'In Progress'
      case 'completed': return 'Completed'
      case 'report_ready': return 'Report Ready'
      case 'cancelled': return 'Cancelled'
      default: return status
    }
  }

  // Filter only Active/Scheduled inspections
  const activeScheduledInspections = inspections.filter(inspection =>
    inspection.status === 'scheduled' || inspection.status === 'in_progress'
  ).filter(inspection => {
    const matchesSearch = inspection.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inspection.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inspection.claimId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || inspection.status === filterStatus
    const matchesDamageType = filterDamageType === 'all' || inspection.damageType === filterDamageType
    return matchesSearch && matchesStatus && matchesDamageType
  }).sort((a, b) => {
    // Sort by date and time (soonest first)
    const dateA = new Date(`${a.scheduledDate} ${a.scheduledTime}`)
    const dateB = new Date(`${b.scheduledDate} ${b.scheduledTime}`)
    return dateA.getTime() - dateB.getTime()
  })

  // Get inspections that need action
  const scheduledInspections = inspections.filter(i => i.status === 'scheduled')
  const inProgressInspections = inspections.filter(i => i.status === 'in_progress')

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Schedule Inspections"
        description="AI-powered comprehensive property assessments"
        className="border border-slate-200"
        action={
          <Link
            href="/dashboard/inspection/new"
            className="h-12 px-6 bg-stellar-orange text-white rounded-full hover:bg-orange-600 flex items-center justify-center gap-2 w-full sm:w-auto transition-colors font-medium"
          >
            <Plus size={20} />
            <span>New Inspection</span>
          </Link>
        }
      />

      {/* Search and Filters Section - Always Visible */}
      <div className="bg-white rounded-2xl border border-gray-200/50 p-4">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by address, client, or claim ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-stellar-orange/30 focus:bg-white transition-all text-sm md:text-base"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stellar-orange/30 focus:border-stellar-orange/50"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="report_ready">Report Ready</option>
            </select>

            {/* Damage Type Filter */}
            <select
              value={filterDamageType}
              onChange={(e) => setFilterDamageType(e.target.value)}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stellar-orange/30 focus:border-stellar-orange/50"
            >
              <option value="all">All Damage Types</option>
              <option value="Hurricane">Hurricane</option>
              <option value="Water Damage">Water Damage</option>
              <option value="Wind Damage">Wind Damage</option>
              <option value="Flood Damage">Flood Damage</option>
              <option value="Roof Damage">Roof Damage</option>
              <option value="Storm Damage">Storm Damage</option>
            </select>
          </div>

          {/* Active Filters Display */}
          {(filterStatus !== 'all' || filterDamageType !== 'all') && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              {filterStatus !== 'all' && (
                <button
                  onClick={() => setFilterStatus('all')}
                  className="px-3 py-1 bg-stellar-orange/10 text-stellar-orange rounded-full text-sm flex items-center gap-1 hover:bg-stellar-orange/20 transition-colors"
                >
                  {getStatusLabel(filterStatus)}
                  <span className="text-stellar-orange/60">×</span>
                </button>
              )}
              {filterDamageType !== 'all' && (
                <button
                  onClick={() => setFilterDamageType('all')}
                  className="px-3 py-1 bg-stellar-orange/10 text-stellar-orange rounded-full text-sm flex items-center gap-1 hover:bg-stellar-orange/20 transition-colors"
                >
                  {filterDamageType}
                  <span className="text-stellar-orange/60">×</span>
                </button>
              )}
              <button
                onClick={() => {
                  setFilterStatus('all')
                  setFilterDamageType('all')
                }}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Scheduled Inspections Section */}
      {activeScheduledInspections.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200/50 p-4">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Scheduled Inspections</h2>
            <div className="flex items-center gap-3">
              {activeScheduledInspections.filter(i => i.status === 'in_progress').length > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>
                  {activeScheduledInspections.filter(i => i.status === 'in_progress').length} Active
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                <Calendar size={14} />
                {activeScheduledInspections.filter(i => i.status === 'scheduled').length} Scheduled
              </span>
            </div>
          </div>

          {/* Scheduled Grid - 1 column on mobile and md screens */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {activeScheduledInspections.map((inspection) => (
              <motion.div
                key={inspection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group border border-gray-200"
              >
                {/* Image Section */}
                <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                  {inspection.imageUrl ? (
                    <Image 
                      src={inspection.imageUrl} 
                      alt={inspection.propertyAddress}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={false}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gray-300">
                      <div className="w-full h-full flex items-center justify-center">
                        {inspection.propertyType === 'Commercial' ? (
                          <Building2 className="text-gray-400" size={64} />
                        ) : (
                          <Home className="text-gray-400" size={64} />
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0A1628] via-[#0A1628]/60 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-bold text-white text-lg leading-tight drop-shadow-lg">
                      {inspection.propertyAddress}
                    </h3>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    {inspection.status === 'in_progress' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-[10px] font-semibold shadow-lg backdrop-blur-sm">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"/>
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-[10px] font-semibold shadow-lg backdrop-blur-sm">
                        <Clock size={10} />
                        Scheduled
                      </span>
                    )}
                  </div>
                  
                  <div className="absolute top-2 left-2">
                    <span className="inline-block px-2 py-1 rounded-full text-[10px] font-semibold bg-white/90 text-gray-800 shadow-lg">
                      {inspection.propertyType}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {/* Progress Bar for In Progress */}
                  {inspection.status === 'in_progress' && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-600">Progress</span>
                        <span className="text-xs font-bold text-green-600">{inspection.completionRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${inspection.completionRate}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Progress Details for In-Progress */}
                  {inspection.status === 'in_progress' && inspection.currentArea && inspection.areasInspected && (
                    <div className="bg-green-50 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs">
                          <div className="flex items-center gap-1">
                            <Camera size={12} className="text-blue-600" />
                            <span className="font-medium text-gray-700">{inspection.photosCount} photos</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin size={12} className="text-green-600" />
                            <span className="font-medium text-gray-700">{inspection.areasInspected.length} areas done</span>
                          </div>
                        </div>
                        <div className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                          Active
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-1">Currently inspecting:</p>
                        <p className="text-xs text-green-600 font-medium">{inspection.currentArea}</p>
                      </div>
                      
                      {inspection.damageAssessment && (
                        <div>
                          <p className="text-xs font-semibold text-gray-700 mb-1">Initial Assessment:</p>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            {inspection.damageAssessment.description}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Claim ID</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{inspection.claimId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Client</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{inspection.clientName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Inspector</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{inspection.inspector}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Damage</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{inspection.damageType}</p>
                    </div>
                  </div>

                  {/* Preliminary Assessment for Scheduled */}
                  {inspection.status === 'scheduled' && inspection.damageAssessment && (
                    <div className="bg-orange-50 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-orange-700">Preliminary Report:</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          inspection.damageAssessment.severity === 'Severe' 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {inspection.damageAssessment.severity}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {inspection.damageAssessment.description}
                      </p>
                    </div>
                  )}

                  {/* Date and Time */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span>{inspection.scheduledDate}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>{inspection.scheduledTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-3">
                    {inspection.status === 'scheduled' && (
                      <Link
                        href={`/dashboard/inspection/${inspection.id}/start`}
                        className="w-full px-4 py-2.5 bg-[#E74C3C] text-white rounded-xl hover:bg-[#D73929] transition-all duration-200 flex items-center justify-center gap-2 text-sm font-semibold shadow-sm"
                      >
                        <Camera size={16} />
                        <span>Start Inspection</span>
                      </Link>
                    )}
                    {inspection.status === 'in_progress' && (
                      <Link
                        href={`/dashboard/inspection/${inspection.id}/continue`}
                        className="w-full px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-semibold shadow-sm"
                      >
                        <ChevronRight size={16} />
                        <span>Continue Inspection</span>
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {activeScheduledInspections.length === 0 && searchTerm && (
            <div className="text-center py-8">
              <AlertCircle className="text-gray-400 mx-auto mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No active inspections found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      )}
      
      {/* Empty State - No inspections at all */}
      {activeScheduledInspections.length === 0 && !searchTerm && (
        <div className="bg-white rounded-2xl border border-gray-200/50 p-12 text-center">
          <AlertCircle className="text-gray-400 mx-auto mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No inspections found</h3>
          <p className="text-gray-600">Get started by creating your first inspection</p>
        </div>
      )}
    </div>
  )
}