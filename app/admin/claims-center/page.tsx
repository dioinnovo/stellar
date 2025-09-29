'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  TrendingUp, AlertCircle, Clock, DollarSign, CheckCircle, 
  Filter, Search, ChevronRight, Building2, Home, Calendar,
  FileText, Users, Activity, Zap, Target, Shield, AlertTriangle,
  BarChart3, PieChart, TrendingDown, ArrowUp, ArrowDown,
  Eye, Phone, Mail, Hash, MapPin, User, Download, RefreshCw
} from 'lucide-react'

interface ExecutiveInsight {
  id: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  action: string
  impact: string
  claimIds: string[]
}

interface ClaimCard {
  id: string
  claimNumber: string
  insuredName: string
  propertyAddress: string
  insuranceCompany: string
  status: string
  priority: string
  damageType: string
  estimatedAmount: number
  daysOpen: number
  lastAction: string
  nextStep: string
  riskScore: number
  opportunityScore: number
}

interface DashboardMetrics {
  newClaimsToday: number
  activeClaimsTotal: number
  pendingSettlement: number
  requiresAction: number
  totalEstimatedValue: number
  averageRecoveryRate: number
  averageTimeToSettle: number
  criticalAlerts: number
}

export default function ClaimsAnalysisCenter() {
  const [activeTab, setActiveTab] = useState<'new' | 'active' | 'pending' | 'settled' | 'action'>('action')
  const [loading, setLoading] = useState(true)
  const [insights, setInsights] = useState<ExecutiveInsight[]>([])
  const [claims, setClaims] = useState<ClaimCard[]>([])
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    insuranceCompany: '',
    damageType: '',
    priority: '',
    dateRange: '30'
  })

  useEffect(() => {
    fetchDashboardData()
  }, [activeTab, filters])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch executive insights
      const insightsData: ExecutiveInsight[] = [
        {
          id: '1',
          priority: 'critical',
          title: '3 Claims Approaching Filing Deadline',
          description: 'Claims #CL-2024-0045, #CL-2024-0046, #CL-2024-0047 have filing deadlines within 48 hours',
          action: 'Review and file immediately',
          impact: 'Risk of losing $450,000 in potential recovery',
          claimIds: ['CL-2024-0045', 'CL-2024-0046', 'CL-2024-0047']
        },
        {
          id: '2',
          priority: 'high',
          title: 'Settlement Opportunity Detected',
          description: 'AI analysis shows 5 claims have 85% probability of 30% higher settlement with supplemental documentation',
          action: 'Request additional documentation',
          impact: 'Potential additional recovery of $125,000',
          claimIds: ['CL-2024-0032', 'CL-2024-0033', 'CL-2024-0034', 'CL-2024-0035', 'CL-2024-0036']
        },
        {
          id: '3',
          priority: 'medium',
          title: 'Pattern Detected: State Farm Underpaying Wind Damage',
          description: 'Analysis shows State Farm settlements averaging 22% below market for wind damage claims',
          action: 'Review all State Farm wind damage claims',
          impact: 'Average additional recovery of $35,000 per claim',
          claimIds: []
        }
      ]
      setInsights(insightsData)

      // Fetch metrics
      const metricsData: DashboardMetrics = {
        newClaimsToday: 12,
        activeClaimsTotal: 186,
        pendingSettlement: 23,
        requiresAction: 8,
        totalEstimatedValue: 8750000,
        averageRecoveryRate: 0.87,
        averageTimeToSettle: 42,
        criticalAlerts: 3
      }
      setMetrics(metricsData)

      // Fetch claims based on active tab
      const claimsData: ClaimCard[] = [
        {
          id: 'CL-2024-0045',
          claimNumber: 'CL-2024-0045',
          insuredName: 'John Smith',
          propertyAddress: '123 Main St, Miami, FL',
          insuranceCompany: 'State Farm',
          status: 'UNDER_REVIEW',
          priority: 'URGENT',
          damageType: 'Hurricane',
          estimatedAmount: 150000,
          daysOpen: 5,
          lastAction: 'Inspection completed',
          nextStep: 'Submit supplemental documentation',
          riskScore: 0.15,
          opportunityScore: 0.85
        },
        {
          id: 'CL-2024-0046',
          claimNumber: 'CL-2024-0046',
          insuredName: 'Sarah Johnson',
          propertyAddress: '456 Oak Ave, Tampa, FL',
          insuranceCompany: 'Allstate',
          status: 'ESTIMATING',
          priority: 'HIGH',
          damageType: 'Water Damage',
          estimatedAmount: 85000,
          daysOpen: 3,
          lastAction: 'Photos uploaded',
          nextStep: 'Complete estimate',
          riskScore: 0.10,
          opportunityScore: 0.72
        }
      ]
      setClaims(claimsData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300'
      case 'URGENT': return 'bg-red-100 text-red-800'
      case 'high':
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'medium':
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'SETTLED': return 'bg-green-100 text-green-800'
      case 'DENIED': return 'bg-red-100 text-red-800'
      case 'UNDER_REVIEW':
      case 'ESTIMATING': return 'bg-blue-100 text-blue-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  const tabCounts = {
    new: 12,
    active: 186,
    pending: 23,
    settled: 45,
    action: 8
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Claims Analysis Center</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Comprehensive claims intelligence and management
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={fetchDashboardData}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-stellar-orange transition"
              >
                <RefreshCw size={20} />
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-stellar-orange text-white rounded-lg hover:bg-red-600 transition">
                <Download size={18} />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Executive Summary Card */}
        <div className="bg-gradient-to-r from-stellar-dark to-gray-800 rounded-xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Zap className="text-yellow-400" size={28} />
              <h2 className="text-xl font-bold">Today's Executive Insights</h2>
            </div>
            <span className="text-sm bg-white dark:bg-gray-900/20 px-3 py-1 rounded-full">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {insights.map((insight) => (
              <div key={insight.id} className="bg-white dark:bg-gray-900/10 backdrop-blur rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <AlertCircle className={
                    insight.priority === 'critical' ? 'text-red-400' :
                    insight.priority === 'high' ? 'text-orange-400' :
                    'text-yellow-400'
                  } size={20} />
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    insight.priority === 'critical' ? 'bg-red-500/20 text-red-200' :
                    insight.priority === 'high' ? 'bg-orange-500/20 text-orange-200' :
                    'bg-yellow-500/20 text-yellow-200'
                  }`}>
                    {insight.priority.toUpperCase()}
                  </span>
                </div>
                <h3 className="font-semibold mb-1">{insight.title}</h3>
                <p className="text-sm text-gray-300 mb-2">{insight.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{insight.impact}</span>
                  <button className="text-xs bg-white dark:bg-gray-900/20 px-2 py-1 rounded hover:bg-white dark:bg-gray-900/30 transition">
                    {insight.action}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-300 text-sm">New Today</p>
              <p className="text-2xl font-bold">{metrics?.newClaimsToday}</p>
            </div>
            <div>
              <p className="text-gray-300 text-sm">Requires Action</p>
              <p className="text-2xl font-bold text-yellow-400">{metrics?.requiresAction}</p>
            </div>
            <div>
              <p className="text-gray-300 text-sm">Total Value</p>
              <p className="text-2xl font-bold">${(metrics?.totalEstimatedValue || 0) / 1000000}M</p>
            </div>
            <div>
              <p className="text-gray-300 text-sm">Recovery Rate</p>
              <p className="text-2xl font-bold text-green-400">
                {((metrics?.averageRecoveryRate || 0) * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </div>

        {/* Claims Tabs */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex overflow-x-auto">
              {Object.entries({
                action: { label: 'Requires Action', icon: AlertTriangle, color: 'text-red-600' },
                new: { label: 'New Claims', icon: FileText, color: 'text-blue-600' },
                active: { label: 'Active Claims', icon: Activity, color: 'text-green-600' },
                pending: { label: 'Pending Settlement', icon: Clock, color: 'text-yellow-600' },
                settled: { label: 'Recently Settled', icon: CheckCircle, color: 'text-gray-600' }
              }).map(([key, config]) => {
                const Icon = config.icon
                const isActive = activeTab === key
                const count = tabCounts[key as keyof typeof tabCounts]
                
                return (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as any)}
                    className={`flex items-center gap-2 px-6 py-4 font-medium transition whitespace-nowrap ${
                      isActive 
                        ? 'border-b-2 border-stellar-orange text-stellar-orange bg-orange-50' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-stellar-orange' : config.color} />
                    {config.label}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      isActive ? 'bg-stellar-orange text-white' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 border-b border-gray-200 bg-gray-50 dark:bg-gray-900">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex-1 min-w-[300px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search by claim number, name, or address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-stellar-orange"
                  />
                </div>
              </div>
              
              <select
                value={filters.insuranceCompany}
                onChange={(e) => setFilters({ ...filters, insuranceCompany: e.target.value })}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-stellar-orange"
              >
                <option value="">All Insurers</option>
                <option value="state-farm">State Farm</option>
                <option value="allstate">Allstate</option>
                <option value="citizens">Citizens</option>
              </select>

              <select
                value={filters.damageType}
                onChange={(e) => setFilters({ ...filters, damageType: e.target.value })}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-stellar-orange"
              >
                <option value="">All Damage Types</option>
                <option value="hurricane">Hurricane</option>
                <option value="water">Water Damage</option>
                <option value="fire">Fire</option>
                <option value="wind">Wind</option>
              </select>

              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-stellar-orange"
              >
                <option value="">All Priorities</option>
                <option value="URGENT">Urgent</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>

              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-stellar-orange transition">
                <Filter size={18} />
                More Filters
              </button>
            </div>
          </div>

          {/* Claims Cards */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stellar-orange" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {claims.map((claim) => (
                  <Link 
                    key={claim.id} 
                    href={`/admin/claims/${claim.id}`}
                    className="block bg-white dark:bg-gray-900 border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-stellar-orange transition-all group"
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Hash size={14} className="text-gray-400" />
                          <span className="font-semibold text-gray-900 dark:text-gray-100">{claim.claimNumber}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(claim.priority)}`}>
                            {claim.priority}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(claim.status)}`}>
                            {claim.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="text-gray-400 group-hover:text-stellar-orange transition" size={20} />
                    </div>

                    {/* Insured Info */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <User size={14} className="text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-gray-100">{claim.insuredName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin size={14} className="text-gray-400" />
                        <span className="truncate">{claim.propertyAddress}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Building2 size={14} className="text-gray-400" />
                        <span>{claim.insuranceCompany}</span>
                      </div>
                    </div>

                    {/* Damage & Value */}
                    <div className="border-t pt-3 mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{claim.damageType}</span>
                        <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
                          ${claim.estimatedAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{claim.daysOpen} days open</span>
                        <span>Last: {claim.lastAction}</span>
                      </div>
                    </div>

                    {/* Risk & Opportunity Scores */}
                    <div className="flex gap-2">
                      <div className="flex-1 bg-red-50 rounded px-2 py-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Risk</span>
                          <span className="text-xs font-bold text-red-600">
                            {(claim.riskScore * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 bg-green-50 rounded px-2 py-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Opportunity</span>
                          <span className="text-xs font-bold text-green-600">
                            {(claim.opportunityScore * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Next Step */}
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Next:</span> {claim.nextStep}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Analytics Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settlement Velocity */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Settlement Velocity</h3>
              <TrendingUp className="text-green-500" size={20} />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">This Week</span>
                <span className="font-bold text-green-600">+23%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Avg Days to Settle</span>
                <span className="font-bold">{metrics?.averageTimeToSettle || 42}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Settlements This Month</span>
                <span className="font-bold">45</span>
              </div>
            </div>
          </div>

          {/* Insurance Company Performance */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Insurer Performance</h3>
              <BarChart3 className="text-blue-500" size={20} />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">State Farm</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">78%</span>
                  <ArrowDown className="text-red-500" size={14} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Allstate</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">85%</span>
                  <ArrowUp className="text-green-500" size={14} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Citizens</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">92%</span>
                  <ArrowUp className="text-green-500" size={14} />
                </div>
              </div>
            </div>
          </div>

          {/* Loss Type Analysis */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Loss Type Trends</h3>
              <PieChart className="text-purple-500" size={20} />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Hurricane</span>
                </div>
                <span className="text-sm font-medium">42%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Water</span>
                </div>
                <span className="text-sm font-medium">28%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Wind</span>
                </div>
                <span className="text-sm font-medium">18%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}