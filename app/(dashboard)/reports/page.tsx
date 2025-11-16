'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  FileText, Download, Eye, Search, Filter, Calendar, CheckCircle,
  AlertCircle, Clock, MapPin, User, Building2, DollarSign,
  TrendingUp, Star, Home, Shield, Award, Send, Edit
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'

interface CompletedReport {
  id: string
  claimNumber: string
  inspectionId?: string // Link to inspection for review
  property: {
    address: string
    type: 'residential' | 'commercial'
    owner: string
    imageUrl?: string
  }
  completedDate: Date | string
  damageType: string
  adjuster?: {
    name: string
    rating: number
  }
  status: 'approved' | 'pending_approval' | 'in_review' | 'sent'
  settlement: {
    estimated: number
    approved: number
    increase: number
  }
  reportUrl?: string
  confidenceScore: number
  timeToComplete: string
}

const mockCompletedReports: CompletedReport[] = [
  {
    id: '1',
    claimNumber: 'CLM-2024-987',
    property: {
      address: '4522 Sunset Boulevard, Miami Beach, FL 33139',
      type: 'residential',
      owner: 'Thompson Family Trust',
      imageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop'
    },
    completedDate: new Date(2024, 0, 15),
    damageType: 'Hurricane',
    adjuster: {
      name: 'Michael Chen',
      rating: 4.9
    },
    status: 'approved' as const,
    settlement: {
      estimated: 125000,
      approved: 142000,
      increase: 13.6
    },
    confidenceScore: 96,
    timeToComplete: '12 mins',
    reportUrl: '/reports/thompson-report.pdf'
  },
  {
    id: '2',
    claimNumber: 'CLM-2024-986',
    property: {
      address: '890 Commerce Way, Fort Lauderdale, FL 33301',
      type: 'commercial',
      owner: 'Martinez Holdings LLC',
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop'
    },
    completedDate: new Date(2024, 0, 14),
    damageType: 'Fire',
    adjuster: {
      name: 'Sarah Johnson',
      rating: 4.8
    },
    status: 'approved' as const,
    settlement: {
      estimated: 450000,
      approved: 485000,
      increase: 7.8
    },
    confidenceScore: 94,
    timeToComplete: '18 mins',
    reportUrl: '/reports/martinez-report.pdf'
  },
  {
    id: '3',
    claimNumber: 'CLM-2024-985',
    property: {
      address: '1234 Pine Street, Coral Gables, FL 33134',
      type: 'residential',
      owner: 'Wilson Family',
      imageUrl: 'https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=800&h=600&fit=crop'
    },
    completedDate: new Date(2024, 0, 13),
    damageType: 'Water',
    adjuster: {
      name: 'David Rodriguez',
      rating: 4.7
    },
    status: 'pending_approval' as const,
    settlement: {
      estimated: 85000,
      approved: 0,
      increase: 0
    },
    confidenceScore: 91,
    timeToComplete: '15 mins',
    reportUrl: '/reports/wilson-report.pdf'
  },
  {
    id: '4',
    claimNumber: 'CLM-2024-984',
    property: {
      address: '7800 Corporate Drive, Miami, FL 33156',
      type: 'commercial',
      owner: 'Davis Enterprises',
      imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop'
    },
    completedDate: new Date(2024, 0, 12),
    damageType: 'Wind',
    adjuster: {
      name: 'Michael Chen',
      rating: 4.9
    },
    status: 'approved' as const,
    settlement: {
      estimated: 325000,
      approved: 368000,
      increase: 13.2
    },
    confidenceScore: 93,
    timeToComplete: '14 mins',
    reportUrl: '/reports/davis-report.pdf'
  },
  {
    id: '5',
    claimNumber: 'CLM-2024-983',
    inspectionId: 'INS-005', // Inspection ID for review page
    property: {
      address: '456 Retail Plaza, Aventura, FL 33180',
      type: 'commercial',
      owner: 'Brown Retail Group',
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop'
    },
    completedDate: new Date(2024, 0, 11),
    damageType: 'Vandalism',
    adjuster: {
      name: 'Emily Watson',
      rating: 4.6
    },
    status: 'in_review' as const,
    settlement: {
      estimated: 45000,
      approved: 0,
      increase: 0
    },
    confidenceScore: 87,
    timeToComplete: '10 mins',
    reportUrl: '/reports/brown-report.pdf'
  },
  {
    id: '6',
    claimNumber: 'CLM-2024-982',
    property: {
      address: '2100 Ocean Drive, Miami Beach, FL 33139',
      type: 'residential',
      owner: 'Taylor Estate',
      imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop'
    },
    completedDate: new Date(2024, 0, 10),
    damageType: 'Roof',
    adjuster: {
      name: 'Sarah Johnson',
      rating: 4.8
    },
    status: 'approved' as const,
    settlement: {
      estimated: 65000,
      approved: 78000,
      increase: 20
    },
    confidenceScore: 95,
    timeToComplete: '11 mins',
    reportUrl: '/reports/taylor-report.pdf'
  }
]

export default function ReportsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'approved' | 'pending_approval' | 'in_review' | 'sent'>('all')
  const [reports, setReports] = useState<CompletedReport[]>(mockCompletedReports)

  useEffect(() => {
    // Load reports from sessionStorage
    const storedReports = sessionStorage.getItem('inspection_reports')
    if (storedReports) {
      const parsed = JSON.parse(storedReports)
      // Ensure all reports have assigned inspectors
      const reportsWithInspectors = parsed.map((report: any) => ({
        ...report,
        adjuster: report.adjuster || {
          name: 'John Smith',
          rating: 4.8
        }
      }))
      // Merge with mock data, new reports first
      setReports([...reportsWithInspectors, ...mockCompletedReports])
    }
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800'
      case 'pending_approval':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800'
      case 'in_review':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
      case 'sent':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800'
      case 'requires_revision':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />
      case 'pending_approval':
        return <Clock className="w-4 h-4" />
      case 'in_review':
        return <Edit className="w-4 h-4" />
      case 'sent':
        return <Send className="w-4 h-4" />
      case 'requires_revision':
        return <AlertCircle className="w-4 h-4" />
      default:
        return null
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const filteredReports = reports.filter(report => {
    const matchesSearch =
      report.property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.property.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (report.adjuster?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false)

    const matchesFilter =
      selectedFilter === 'all' ||
      (selectedFilter === 'approved' && report.status === 'approved') ||
      (selectedFilter === 'pending_approval' && report.status === 'pending_approval') ||
      (selectedFilter === 'in_review' && report.status === 'in_review') ||
      (selectedFilter === 'sent' && report.status === 'sent')

    return matchesSearch && matchesFilter
  })

  const stats = {
    total: reports.length,
    approved: reports.filter(r => r.status === 'approved').length,
    pending: reports.filter(r => r.status === 'pending_approval').length,
    inReview: reports.filter(r => r.status === 'in_review').length,
    sent: reports.filter(r => r.status === 'sent').length,
    totalSettlement: reports.filter(r => r.status === 'approved').reduce((acc, r) => acc + r.settlement.approved, 0),
    averageIncrease: reports.filter(r => r.status === 'approved' && r.settlement.increase > 0)
      .reduce((acc, r, _, arr) => acc + r.settlement.increase / arr.length, 0)
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <PageHeader
        title="Completed Reports"
        description="AI-generated inspection reports with settlement optimization"
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-8 h-8 text-gray-400" />
            <span className="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 rounded">Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Reports Generated</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <span className="text-xs font-medium px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded">Approved</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.approved}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ready to Submit</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-green-600" />
            <span className="text-xs font-medium px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded">Value</span>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(stats.totalSettlement)}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total Settlements</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-stellar-orange" />
            <span className="text-xs font-medium px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-stellar-orange dark:text-orange-400 rounded">Avg</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">+{stats.averageIncrease.toFixed(1)}%</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Settlement Increase</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by property, claim number, or adjuster..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-stellar-orange/20 focus:border-stellar-orange"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'approved', 'pending_approval', 'in_review', 'sent'].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter as any)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedFilter === filter
                    ? 'bg-stellar-orange text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {filter === 'all' ? `All (${stats.total})` :
                 filter === 'approved' ? `Approved (${stats.approved})` :
                 filter === 'pending_approval' ? `Pending (${stats.pending})` :
                 filter === 'in_review' ? `In Review (${stats.inReview})` :
                 filter === 'sent' ? `Sent (${stats.sent})` :
                 'Other'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredReports.map((report, index) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer"
                 onClick={() => {
                   if (report.status === 'approved' || report.status === 'sent') {
                     // For approved/sent reports, go to the comprehensive report view
                     const inspectionId = report.inspectionId || 'INS-002';
                     router.push(`/dashboard/inspection/${inspectionId}/report`);
                   } else if (report.status === 'in_review') {
                     // For in_review reports, use the inspection review page
                     const inspectionId = report.inspectionId || 'INS-002';
                     router.push(`/dashboard/inspection/${inspectionId}/review`);
                   } else {
                     // For pending_approval, go to a review page
                     router.push(`/dashboard/reports/${report.id}/review`);
                   }
                 }}>
              {/* Property Image with Overlay */}
              <div className="relative h-48">
                <img
                  src={report.property.imageUrl || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop'}
                  alt={report.property.address}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                {/* Property Type Badge */}
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-gray-800/90 text-gray-800 dark:text-gray-200 shadow-lg">
                    {report.property.type === 'residential' ?
                      <Home className="w-3.5 h-3.5" /> :
                      <Building2 className="w-3.5 h-3.5" />
                    }
                    {report.property.type}
                  </span>
                </div>

                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                    {getStatusIcon(report.status)}
                    {report.status === 'approved' ? 'Approved' :
                     report.status === 'pending_approval' ? 'Pending Approval' :
                     report.status === 'in_review' ? 'In Review' :
                     report.status === 'sent' ? 'Sent' :
                     report.status === 'requires_revision' ? 'Requires Revision' : 'Unknown'}
                  </span>
                </div>

                {/* Property Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-bold text-lg leading-tight drop-shadow-lg">
                    {report.property.address.split(',')[0]}
                  </h3>
                  <p className="text-white/90 text-sm mt-1">
                    {report.property.owner}
                  </p>
                </div>
              </div>

              {/* Report Details */}
              <div className="p-5">
                {/* Claim Info */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Claim Number</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{report.claimNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
                    <p className="font-medium text-gray-700 dark:text-gray-300">
                      {typeof report.completedDate === 'string'
                        ? new Date(report.completedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : report.completedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Settlement Info */}
                {report.status === 'approved' && (
                  <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Settlement Value</span>
                      <span className="text-xs font-medium px-2 py-0.5 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded">
                        +{report.settlement.increase}%
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-bold text-green-600">
                        {formatCurrency(report.settlement.approved)}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                        {formatCurrency(report.settlement.estimated)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Report Metrics */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Shield className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Damage</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{report.damageType}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Award className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">AI Score</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{report.confidenceScore}%</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Time</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{report.timeToComplete}</p>
                  </div>
                </div>

                {/* Inspector Info */}
                <div className="flex items-center gap-2 py-3 border-t border-gray-100 dark:border-gray-800">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {report.adjuster?.name || 'Inspector Assigned'}
                    </p>
                    {report.adjuster && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">{report.adjuster.rating}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-3">
                  {report.status === 'pending_approval' ? (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Use the inspection review page for pending approval reports
                          const inspectionId = report.inspectionId || 'INS-002';
                          router.push(`/dashboard/inspection/${inspectionId}/review`);
                        }}
                        className="col-span-2 flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                      >
                        <Edit className="w-4 h-4" />
                        <span className="text-sm font-medium">Review & Approve</span>
                      </button>
                    </>
                  ) : report.status === 'in_review' ? (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Use the inspection review page for in-review reports
                          const inspectionId = report.inspectionId || 'INS-005';
                          router.push(`/dashboard/inspection/${inspectionId}/review`);
                        }}
                        className="col-span-2 flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
                      >
                        <Edit className="w-4 h-4" />
                        <span className="text-sm font-medium">Continue Review</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // View the comprehensive report
                          const inspectionId = report.inspectionId || 'INS-002';
                          router.push(`/dashboard/inspection/${inspectionId}/report`);
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-sm font-medium">View</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          alert('PDF download would be triggered here');
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-stellar-orange text-white rounded-lg hover:bg-red-600 transition"
                      >
                        <Download className="w-4 h-4" />
                        <span className="text-sm font-medium">PDF</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredReports.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12">
          <div className="text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No Reports Found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? 'Try adjusting your search or filters' : 'No completed reports available'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}