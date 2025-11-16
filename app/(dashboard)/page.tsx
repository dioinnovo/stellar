'use client'

import { useState, useEffect } from 'react'
import {
  TrendingUp, DollarSign, Users, FileText, Clock, AlertTriangle,
  Calendar, BarChart3, Activity, Zap, Target, Shield,
  ArrowUp, ArrowDown, Building2, Home, Droplets, Flame,
  CloudRain, Palette, Briefcase, Presentation
} from 'lucide-react'
import Link from 'next/link'
import { PageHeader } from '@/components/ui/page-header'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    activeClaims: 47,
    totalRecovered: 3250000,
    avgSettlement: 125000,
    clientSatisfaction: 98,
    processingTime: 3.2,
    successRate: 94
  })

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, type: 'claim_submitted', title: 'New Hurricane Claim - Miami Beach', time: '5 minutes ago', status: 'new' },
    { id: 2, type: 'settlement_reached', title: 'Settlement Reached - $285,000', time: '1 hour ago', status: 'success' },
    { id: 3, type: 'inspection_complete', title: 'Property Inspection Complete - Orlando', time: '2 hours ago', status: 'info' },
    { id: 4, type: 'negotiation_update', title: 'Counter-offer Received - $195,000', time: '3 hours ago', status: 'warning' },
    { id: 5, type: 'document_uploaded', title: '15 New Documents Added - Claim #CP-2024-94782', time: '4 hours ago', status: 'info' }
  ])

  const scheduledInspections = [
    { id: 1, property: 'Johnson Residence - Coral Gables', time: 'Today 2:00 PM', type: 'Water Damage', status: 'confirmed' },
    { id: 2, property: 'Smith Commercial Building', time: 'Today 3:30 PM', type: 'Hurricane Damage', status: 'confirmed' },
    { id: 3, property: 'Garcia Residence - Miami Beach', time: 'Tomorrow 10:00 AM', type: 'Fire Damage', status: 'pending' },
    { id: 4, property: 'Anderson Property - Key Biscayne', time: 'Tomorrow 2:00 PM', type: 'Roof Damage', status: 'confirmed' }
  ]

  const kpiCards = [
    {
      title: 'Active Claims',
      value: stats.activeClaims,
      change: '+12%',
      trend: 'up',
      icon: FileText,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Total Recovered',
      value: `$${(stats.totalRecovered / 1000000).toFixed(1)}M`,
      change: '+47%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-green-500',
      lightColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Avg Settlement',
      value: `$${(stats.avgSettlement / 1000).toFixed(0)}K`,
      change: '+23%',
      trend: 'up',
      icon: TrendingUp,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'Success Rate',
      value: `${stats.successRate}%`,
      change: '+5%',
      trend: 'up',
      icon: Target,
      color: 'bg-orange-500',
      lightColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    }
  ]

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Header */}
      <PageHeader
        title="Dashboard Overview"
        description="Welcome back! Here's your claims processing summary."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6">
        {kpiCards.map((kpi, index) => (
          <div
            key={kpi.title}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 p-3 sm:p-6 hover:shadow-lg transition"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{kpi.title}</p>
                <p className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1 sm:mt-2">{kpi.value}</p>
                <div className="flex items-center gap-1 sm:gap-2 mt-2 sm:mt-3">
                  {kpi.trend === 'up' ? (
                    <ArrowUp className="text-green-500" size={14} />
                  ) : (
                    <ArrowDown className="text-red-500" size={14} />
                  )}
                  <span className={`text-xs sm:text-sm font-medium ${kpi.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {kpi.change}
                  </span>
                  <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">vs last month</span>
                </div>
              </div>
              <div className={`p-2 sm:p-3 rounded-lg ${kpi.lightColor} mt-2 sm:mt-0`}>
                <kpi.icon className={kpi.textColor} size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Scheduled Inspections */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">Scheduled Inspections</h2>
          <Link href="/dashboard/inspection" className="text-stellar-orange text-sm hover:underline">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          {scheduledInspections.map((inspection) => (
            <div key={inspection.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-stellar-orange transition bg-white dark:bg-gray-800 hover:shadow-md">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 leading-tight mb-1">{inspection.property}</h3>
                  <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                    inspection.status === 'confirmed' ? 'bg-green-100 text-green-600' :
                    'bg-yellow-100 text-yellow-600'
                  }`}>
                    {inspection.status}
                  </span>
                </div>
                <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">{inspection.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-orange-400 flex-shrink-0" />
                    <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">{inspection.type}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity - Full Width */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">Recent Activity</h2>
          <Link href="/dashboard/activity" className="text-stellar-orange text-sm hover:underline">
            View All
          </Link>
        </div>

        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
              <div className={`p-2 rounded-lg ${
                activity.status === 'new' ? 'bg-blue-100' :
                activity.status === 'success' ? 'bg-green-100' :
                activity.status === 'warning' ? 'bg-yellow-100' :
                'bg-gray-100'
              }`}>
                {activity.type === 'claim_submitted' && <FileText className="text-blue-600" size={20} />}
                {activity.type === 'settlement_reached' && <DollarSign className="text-green-600" size={20} />}
                {activity.type === 'inspection_complete' && <Shield className="text-gray-600 dark:text-gray-400" size={20} />}
                {activity.type === 'negotiation_update' && <Activity className="text-yellow-600" size={20} />}
                {activity.type === 'document_uploaded' && <FileText className="text-gray-600 dark:text-gray-400" size={20} />}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-gray-100">{activity.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Claims by Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Claims by Type</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              <AlertTriangle className="text-orange-500 w-8 h-8 mb-2" />
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">18</span>
              <span className="text-xs text-gray-600 dark:text-gray-400 text-center mt-1">Hurricane</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              <Droplets className="text-blue-500 w-8 h-8 mb-2" />
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">12</span>
              <span className="text-xs text-gray-600 dark:text-gray-400 text-center mt-1">Water</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              <Flame className="text-red-500 w-8 h-8 mb-2" />
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">8</span>
              <span className="text-xs text-gray-600 dark:text-gray-400 text-center mt-1">Fire</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              <Shield className="text-purple-500 w-8 h-8 mb-2" />
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">5</span>
              <span className="text-xs text-gray-600 dark:text-gray-400 text-center mt-1">Vandalism</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              <Home className="text-gray-600 dark:text-gray-400 w-8 h-8 mb-2" />
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">9</span>
              <span className="text-xs text-gray-600 dark:text-gray-400 text-center mt-1">Roof</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              <CloudRain className="text-cyan-500 w-8 h-8 mb-2" />
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">7</span>
              <span className="text-xs text-gray-600 dark:text-gray-400 text-center mt-1">Flood</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              <Palette className="text-green-600 w-8 h-8 mb-2" />
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">4</span>
              <span className="text-xs text-gray-600 dark:text-gray-400 text-center mt-1">Mold</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              <Briefcase className="text-indigo-500 w-8 h-8 mb-2" />
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">6</span>
              <span className="text-xs text-gray-600 dark:text-gray-400 text-center mt-1">Business Loss</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Property Types</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Building2 className="text-blue-500 w-5 h-5" />
                  <span className="font-medium text-sm sm:text-base">Commercial</span>
                </div>
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">60%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Home className="text-green-500 w-5 h-5" />
                  <span className="font-medium text-sm sm:text-base">Residential</span>
                </div>
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">40%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
          </div>

          {/* Discreet Presentation Button */}
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Link
              href="/presentation"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-stellar-orange bg-gray-50 dark:bg-gray-700 hover:bg-orange-50 dark:hover:bg-gray-600 rounded-lg transition-all duration-200"
            >
              <Presentation size={16} />
              <span>View Presentation</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}