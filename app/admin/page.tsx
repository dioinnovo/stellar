'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  LayoutDashboard, Users, FileText, TrendingUp, Filter, Search, 
  Download, Eye, CheckCircle, XCircle, Clock, AlertTriangle,
  Building2, Home, DollarSign, Calendar, ChevronLeft, ChevronRight,
  RefreshCw, Mail, Phone, MapPin, Hash
} from 'lucide-react'

interface Claim {
  id: string
  claimNumber: string
  type: string
  status: string
  priority: string
  insuredName: string
  insuredEmail: string
  propertyAddress: string
  estimatedAmount: number | null
  submittedAt: string
  updatedAt: string
}

interface Statistics {
  statusCounts: Record<string, number>
  totalEstimatedAmount: number
  averageProcessingTime: string
}

export default function AdminDashboard() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    priority: '',
    search: ''
  })
  const [selectedClaims, setSelectedClaims] = useState<string[]>([])

  useEffect(() => {
    fetchClaims()
  }, [page, filters])

  const fetchClaims = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(filters.status && { status: filters.status }),
        ...(filters.type && { type: filters.type }),
        ...(filters.priority && { priority: filters.priority }),
        ...(filters.search && { search: filters.search })
      })

      const response = await fetch(`/api/admin/claims?${params}`)
      const data = await response.json()

      if (data.success) {
        setClaims(data.data.claims)
        setTotalPages(data.data.pagination.totalPages)
        setStatistics(data.data.statistics)
      }
    } catch (error) {
      console.error('Error fetching claims:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'SETTLED':
        return <CheckCircle className="text-green-500" size={16} />
      case 'DENIED':
        return <XCircle className="text-red-500" size={16} />
      case 'UNDER_REVIEW':
      case 'ESTIMATING':
        return <Clock className="text-blue-500" size={16} />
      default:
        return <AlertTriangle className="text-yellow-500" size={16} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'SETTLED':
        return 'bg-green-100 text-green-800'
      case 'DENIED':
        return 'bg-red-100 text-red-800'
      case 'UNDER_REVIEW':
      case 'ESTIMATING':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center">
                <Image 
                  src="/images/stellar_logo.png" 
                  alt="Stellar" 
                  width={120} 
                  height={32}
                  className="h-8 w-auto object-contain"
                />
              </Link>
              <span className="text-gray-400">/</span>
              <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/demo"
                className="text-gray-600 hover:text-stellar-orange transition"
              >
                Demo
              </Link>
              <Link 
                href="/inspection"
                className="text-gray-600 hover:text-stellar-orange transition"
              >
                Inspection
              </Link>
              <button
                onClick={fetchClaims}
                className="p-2 text-gray-600 hover:text-stellar-orange transition"
              >
                <RefreshCw size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <FileText className="text-stellar-orange" size={24} />
              <span className="text-2xl font-bold text-gray-900">
                {claims.length}
              </span>
            </div>
            <p className="text-gray-600">Total Claims</p>
            <p className="text-sm text-gray-500 mt-1">This month</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="text-green-500" size={24} />
              <span className="text-2xl font-bold text-gray-900">
                ${statistics?.totalEstimatedAmount.toLocaleString() || 0}
              </span>
            </div>
            <p className="text-gray-600">Total Estimates</p>
            <p className="text-sm text-gray-500 mt-1">Approved claims</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="text-blue-500" size={24} />
              <span className="text-2xl font-bold text-gray-900">
                {statistics?.averageProcessingTime || '2.5h'}
              </span>
            </div>
            <p className="text-gray-600">Avg Processing</p>
            <p className="text-sm text-gray-500 mt-1">Time to estimate</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="text-purple-500" size={24} />
              <span className="text-2xl font-bold text-gray-900">94%</span>
            </div>
            <p className="text-gray-600">Approval Rate</p>
            <p className="text-sm text-gray-500 mt-1">Last 30 days</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search claims..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stellar-orange"
                />
              </div>
            </div>

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stellar-orange"
            >
              <option value="">All Status</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="TRIAGING">Triaging</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="ESTIMATING">Estimating</option>
              <option value="APPROVED">Approved</option>
              <option value="DENIED">Denied</option>
              <option value="SETTLED">Settled</option>
            </select>

            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stellar-orange"
            >
              <option value="">All Types</option>
              <option value="commercial">Commercial</option>
              <option value="residential">Residential</option>
            </select>

            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stellar-orange"
            >
              <option value="">All Priority</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            <button className="px-4 py-2 bg-stellar-orange text-white rounded-lg hover:bg-red-600 transition">
              <Download size={20} />
            </button>
          </div>
        </div>

        {/* Claims Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedClaims(claims.map(c => c.id))
                        } else {
                          setSelectedClaims([])
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Claim #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Insured
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estimate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex justify-center items-center gap-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-stellar-orange" />
                        Loading claims...
                      </div>
                    </td>
                  </tr>
                ) : claims.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                      No claims found
                    </td>
                  </tr>
                ) : (
                  claims.map((claim) => (
                    <tr key={claim.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedClaims.includes(claim.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedClaims([...selectedClaims, claim.id])
                            } else {
                              setSelectedClaims(selectedClaims.filter(id => id !== claim.id))
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Hash size={14} className="text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {claim.claimNumber}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {claim.type === 'commercial' ? (
                            <Building2 size={16} className="text-gray-500" />
                          ) : (
                            <Home size={16} className="text-gray-500" />
                          )}
                          <span className="text-sm text-gray-700 capitalize">
                            {claim.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{claim.insuredName}</p>
                          <p className="text-xs text-gray-500">{claim.insuredEmail}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <MapPin size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-700 truncate max-w-[200px]">
                            {claim.propertyAddress}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(claim.status)}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(claim.status)}`}>
                            {claim.status.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded border ${getPriorityColor(claim.priority)}`}>
                          {claim.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          {claim.estimatedAmount ? `$${claim.estimatedAmount.toLocaleString()}` : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">
                          {new Date(claim.submittedAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/claims/${claim.id}`}
                          className="text-stellar-orange hover:text-red-600 transition"
                        >
                          <Eye size={18} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}