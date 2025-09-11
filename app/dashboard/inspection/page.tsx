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
}

export default function InspectionListPage() {
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Mock data for inspections with Unsplash images
  const inspections: Inspection[] = [
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
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop&q=80' // Modern office building
    },
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
      imageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop&q=80' // Beautiful house
    },
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
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop&q=80' // Modern retail storefront
    },
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
      imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop&q=80' // Luxury home
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
      imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop&q=80' // Hotel resort
    },
    {
      id: 'INS-006',
      claimId: 'CLM-2024-006',
      propertyAddress: '2345 Coral Way, Coral Gables, FL',
      propertyType: 'Residential',
      status: 'in_progress',
      scheduledDate: '2024-03-19',
      scheduledTime: '4:00 PM',
      inspector: 'Maria Garcia',
      clientName: 'David Martinez',
      damageType: 'Storm Damage',
      estimatedDuration: '3.5 hours',
      completionRate: 45,
      imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=600&fit=crop&q=80' // Modern house
    }
  ]

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'scheduled': return 'bg-blue-500 text-white'
      case 'in_progress': return 'bg-amber-500 text-white'
      case 'completed': return 'bg-emerald-500 text-white'
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

  const filteredInspections = inspections.filter(inspection => {
    const matchesStatus = filterStatus === 'all' || inspection.status === filterStatus
    const matchesSearch = inspection.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inspection.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inspection.claimId.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  }).sort((a, b) => {
    // Sort by date and time (soonest first)
    const dateA = new Date(`${a.scheduledDate} ${a.scheduledTime}`)
    const dateB = new Date(`${b.scheduledDate} ${b.scheduledTime}`)
    return dateA.getTime() - dateB.getTime()
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Property Inspections</h1>
            <p className="text-gray-600 mt-2 text-base sm:text-lg">AI-powered comprehensive property assessments</p>
          </div>
          <Link
            href="/dashboard/inspection/new"
            className="inline-flex items-center justify-center px-5 sm:px-7 py-3 sm:py-3.5 bg-[#E74C3C] text-white rounded-full hover:bg-[#D73929] transition-all duration-200 gap-2 shadow-md hover:shadow-lg font-semibold text-base sm:text-lg transform hover:scale-105"
          >
            <Plus size={20} />
            <span>New Inspection</span>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 sm:p-6 border border-blue-200/60 hover:border-blue-300/60 transition-all duration-200">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <span className="text-xs sm:text-sm font-medium text-blue-700 uppercase tracking-wide">Scheduled</span>
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-blue-900">
              {inspections.filter(i => i.status === 'scheduled').length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl p-4 sm:p-6 border border-amber-200/60 hover:border-amber-300/60 transition-all duration-200">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <span className="text-xs sm:text-sm font-medium text-amber-700 uppercase tracking-wide">In Progress</span>
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-amber-900">
              {inspections.filter(i => i.status === 'in_progress').length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-4 sm:p-6 border border-emerald-200/60 hover:border-emerald-300/60 transition-all duration-200">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <span className="text-xs sm:text-sm font-medium text-emerald-700 uppercase tracking-wide">Completed</span>
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-emerald-900">
              {inspections.filter(i => i.status === 'completed' || i.status === 'report_ready').length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 sm:p-6 border border-purple-200/60 hover:border-purple-300/60 transition-all duration-200">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <span className="text-xs sm:text-sm font-medium text-purple-700 uppercase tracking-wide">Reports</span>
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-purple-900">
              {inspections.filter(i => i.reportReady).length}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200/50 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search address, client, or claim ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition-all text-sm md:text-base"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-gray-50/50 border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition-all cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="report_ready">Report Ready</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inspection List - Mobile Optimized Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInspections.map((inspection) => (
          <motion.div
            key={inspection.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
          >
            {/* Image Section with Gradient Overlay */}
            <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
              {/* Property image from Unsplash */}
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
              
              {/* Gradient overlay for text visibility - Navy blue Sotheby's style */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0A1628] via-[#0A1628]/60 to-transparent" />
              
              {/* Property Address on Image */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-bold text-white text-lg leading-tight drop-shadow-lg">
                  {inspection.propertyAddress}
                </h3>
              </div>
              
              {/* Status Badge */}
              <div className="absolute top-3 right-3">
                <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg ${getStatusColor(inspection.status)}`}>
                  {getStatusLabel(inspection.status)}
                </span>
              </div>
              
              {/* Property Type Badge */}
              <div className="absolute top-3 left-3">
                <span className="inline-block px-3 py-1.5 rounded-full text-xs font-semibold bg-white/90 text-gray-800 shadow-lg">
                  {inspection.propertyType}
                </span>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-4 space-y-3">
              {/* Progress Bar for In Progress */}
              {inspection.status === 'in_progress' && (
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-600">Progress</span>
                    <span className="text-xs font-bold text-gray-900">{inspection.completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${inspection.completionRate}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Info Grid - 2 columns */}
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

              {/* Date and Time Row */}
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
                {inspection.estimatedValue && (
                  <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                    <TrendingUp size={12} />
                    <span>${(inspection.estimatedValue / 1000).toFixed(0)}k</span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-3">
                {inspection.status === 'scheduled' && (
                  <Link
                    href={`/dashboard/inspection/${inspection.id}/start`}
                    className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium shadow-sm"
                  >
                    <Camera size={16} />
                    <span>Start Inspection</span>
                  </Link>
                )}
                {inspection.status === 'in_progress' && (
                  <Link
                    href={`/dashboard/inspection/${inspection.id}/continue`}
                    className="w-full px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium shadow-sm"
                  >
                    <ChevronRight size={16} />
                    <span>Continue</span>
                  </Link>
                )}
                {inspection.status === 'completed' && (
                  <Link
                    href={`/dashboard/inspection/${inspection.id}/review`}
                    className="w-full px-4 py-2.5 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium shadow-sm"
                  >
                    <CheckCircle size={16} />
                    <span>Review</span>
                  </Link>
                )}
                {inspection.status === 'report_ready' && (
                  <Link
                    href={`/dashboard/inspection/${inspection.id}/report`}
                    className="w-full px-4 py-2.5 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium shadow-sm"
                  >
                    <FileText size={16} />
                    <span>View Report</span>
                  </Link>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex items-center justify-center pt-2">
                <Link
                  href={`/dashboard/inspection/${inspection.id}`}
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1 group"
                >
                  <span>View Details</span>
                  <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredInspections.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200/50 p-12 text-center">
            <AlertCircle className="text-gray-400 mx-auto mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No inspections found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}