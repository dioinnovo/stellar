'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileText, Download, Eye, Search, Filter, Calendar, CheckCircle,
  AlertCircle, Clock, MapPin, User, Building2, DollarSign,
  TrendingUp, Star, Home, Shield, Award, Send
} from 'lucide-react'

interface CompletedReport {
  id: string
  claimNumber: string
  property: {
    address: string
    type: 'residential' | 'commercial'
    owner: string
    imageUrl: string
  }
  completedDate: Date
  damageType: string
  adjuster: {
    name: string
    rating: number
  }
  status: 'approved' | 'pending_review' | 'requires_revision'
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
    status: 'approved',
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
    status: 'approved',
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
    status: 'pending_review',
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
    status: 'approved',
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
    status: 'requires_revision',
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
    status: 'approved',
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
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'approved' | 'pending' | 'revision'>('all')
  const [reports] = useState<CompletedReport[]>(mockCompletedReports)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending_review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'requires_revision':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />
      case 'pending_review':
        return <Clock className="w-4 h-4" />
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
      report.adjuster.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter =
      selectedFilter === 'all' ||
      (selectedFilter === 'approved' && report.status === 'approved') ||
      (selectedFilter === 'pending' && report.status === 'pending_review') ||
      (selectedFilter === 'revision' && report.status === 'requires_revision')

    return matchesSearch && matchesFilter
  })

  const stats = {
    total: reports.length,
    approved: reports.filter(r => r.status === 'approved').length,
    pending: reports.filter(r => r.status === 'pending_review').length,
    revision: reports.filter(r => r.status === 'requires_revision').length,
    totalSettlement: reports.filter(r => r.status === 'approved').reduce((acc, r) => acc + r.settlement.approved, 0),
    averageIncrease: reports.filter(r => r.status === 'approved' && r.settlement.increase > 0)
      .reduce((acc, r, _, arr) => acc + r.settlement.increase / arr.length, 0)
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stellar-dark">
              Completed Reports
            </h1>
            <p className="text-gray-600 mt-1">
              AI-generated inspection reports with settlement optimization
            </p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-8 h-8 text-gray-400" />
            <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded">Total</span>
          </div>
          <p className="text-2xl font-bold text-stellar-dark">{stats.total}</p>
          <p className="text-sm text-gray-500 mt-1">Reports Generated</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded">Approved</span>
          </div>
          <p className="text-2xl font-bold text-stellar-dark">{stats.approved}</p>
          <p className="text-sm text-gray-500 mt-1">Ready to Submit</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-green-600" />
            <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded">Value</span>
          </div>
          <p className="text-xl font-bold text-stellar-dark">{formatCurrency(stats.totalSettlement)}</p>
          <p className="text-sm text-gray-500 mt-1">Total Settlements</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-stellar-orange" />
            <span className="text-xs font-medium px-2 py-1 bg-orange-100 text-stellar-orange rounded">Avg</span>
          </div>
          <p className="text-2xl font-bold text-stellar-dark">+{stats.averageIncrease.toFixed(1)}%</p>
          <p className="text-sm text-gray-500 mt-1">Settlement Increase</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by property, claim number, or adjuster..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stellar-orange/20 focus:border-stellar-orange"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'approved', 'pending', 'revision'].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter as any)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedFilter === filter
                    ? 'bg-stellar-orange text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter === 'all' ? `All (${stats.total})` :
                 filter === 'approved' ? `Approved (${stats.approved})` :
                 filter === 'pending' ? `Pending (${stats.pending})` :
                 `Revision (${stats.revision})`}
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
            <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow group">
              {/* Property Image with Overlay */}
              <div className="relative h-48">
                <img
                  src={report.property.imageUrl}
                  alt={report.property.address}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                {/* Property Type Badge */}
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/90 text-gray-800 shadow-lg">
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
                     report.status === 'pending_review' ? 'Pending' : 'Revision'}
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
                    <p className="text-xs text-gray-500">Claim Number</p>
                    <p className="font-semibold text-stellar-dark">{report.claimNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Completed</p>
                    <p className="font-medium text-gray-700">
                      {report.completedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Settlement Info */}
                {report.status === 'approved' && (
                  <div className="bg-green-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Settlement Value</span>
                      <span className="text-xs font-medium px-2 py-0.5 bg-green-100 text-green-700 rounded">
                        +{report.settlement.increase}%
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-bold text-green-600">
                        {formatCurrency(report.settlement.approved)}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
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
                    <p className="text-xs text-gray-500">Damage</p>
                    <p className="text-sm font-medium text-gray-900">{report.damageType}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Award className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500">AI Score</p>
                    <p className="text-sm font-medium text-gray-900">{report.confidenceScore}%</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500">Time</p>
                    <p className="text-sm font-medium text-gray-900">{report.timeToComplete}</p>
                  </div>
                </div>

                {/* Adjuster Info */}
                <div className="flex items-center gap-2 py-3 border-t border-gray-100">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{report.adjuster.name}</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-xs text-gray-500">{report.adjuster.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-3">
                  <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                    <Download className="w-4 h-4" />
                    <span className="text-sm font-medium">PDF</span>
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-2 bg-stellar-orange text-white rounded-lg hover:bg-red-600 transition">
                    <Send className="w-4 h-4" />
                    <span className="text-sm font-medium">Send</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredReports.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12">
          <div className="text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reports Found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search or filters' : 'No completed reports available'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}