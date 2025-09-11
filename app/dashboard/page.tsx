'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, DollarSign, Users, FileText, Clock, AlertTriangle,
  Calendar, BarChart3, Activity, Zap, Target, Shield,
  ArrowUp, ArrowDown, Building2, Home, Droplets, Flame,
  CloudRain, Palette, Briefcase
} from 'lucide-react'
import Link from 'next/link'

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

  const upcomingTasks = [
    { id: 1, task: 'On-site inspection - Coral Gables', time: 'Today 2:00 PM', priority: 'high' },
    { id: 2, task: 'Settlement negotiation call - State Farm', time: 'Today 3:30 PM', priority: 'urgent' },
    { id: 3, task: 'Document review - Water damage claim', time: 'Tomorrow 10:00 AM', priority: 'medium' },
    { id: 4, task: 'Client meeting - Hurricane damage assessment', time: 'Tomorrow 2:00 PM', priority: 'high' }
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
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <h1 className="text-3xl font-bold text-stellar-dark">Dashboard Overview</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">Welcome back! Here's your claims processing summary.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {kpiCards.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-lg transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600">{kpi.title}</p>
                <p className="text-2xl sm:text-3xl font-bold text-stellar-dark mt-2">{kpi.value}</p>
                <div className="flex items-center gap-2 mt-3">
                  {kpi.trend === 'up' ? (
                    <ArrowUp className="text-green-500" size={16} />
                  ) : (
                    <ArrowDown className="text-red-500" size={16} />
                  )}
                  <span className={`text-sm font-medium ${kpi.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {kpi.change}
                  </span>
                  <span className="text-xs text-gray-500">vs last month</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${kpi.lightColor}`}>
                <kpi.icon className={kpi.textColor} size={24} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Activity - 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-stellar-dark">Recent Activity</h2>
            <Link href="/dashboard/activity" className="text-stellar-orange text-sm hover:underline">
              View All
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className={`p-2 rounded-lg ${
                  activity.status === 'new' ? 'bg-blue-100' :
                  activity.status === 'success' ? 'bg-green-100' :
                  activity.status === 'warning' ? 'bg-yellow-100' :
                  'bg-gray-100'
                }`}>
                  {activity.type === 'claim_submitted' && <FileText className="text-blue-600" size={20} />}
                  {activity.type === 'settlement_reached' && <DollarSign className="text-green-600" size={20} />}
                  {activity.type === 'inspection_complete' && <Shield className="text-gray-600" size={20} />}
                  {activity.type === 'negotiation_update' && <Activity className="text-yellow-600" size={20} />}
                  {activity.type === 'document_uploaded' && <FileText className="text-gray-600" size={20} />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-stellar-dark">{activity.title}</p>
                  <p className="text-sm text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks - 1 column */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-stellar-dark">Upcoming Tasks</h2>
            <Link href="/dashboard/tasks" className="text-stellar-orange text-sm hover:underline">
              View All
            </Link>
          </div>
          
          <div className="space-y-3">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="p-3 border border-gray-200 rounded-lg hover:border-stellar-orange transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-stellar-dark">{task.task}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Calendar size={14} className="text-gray-400" />
                      <span className="text-xs text-gray-600">{task.time}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    task.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                    task.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Claims by Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-stellar-dark mb-4">Claims by Type</h2>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-1 sm:gap-2">
                <AlertTriangle className="text-orange-500 w-4 h-4 sm:w-5 sm:h-5" />
                <div>
                  <span className="font-medium text-xs sm:text-sm block">Hurricane</span>
                  <span className="text-[10px] sm:text-xs text-gray-500">Damage</span>
                </div>
              </div>
              <span className="text-lg sm:text-xl font-bold">18</span>
            </div>
            <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-1 sm:gap-2">
                <Droplets className="text-blue-500 w-4 h-4 sm:w-5 sm:h-5" />
                <div>
                  <span className="font-medium text-xs sm:text-sm block">Water</span>
                  <span className="text-[10px] sm:text-xs text-gray-500">Damage</span>
                </div>
              </div>
              <span className="text-lg sm:text-xl font-bold">12</span>
            </div>
            <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-1 sm:gap-2">
                <Flame className="text-red-500 w-4 h-4 sm:w-5 sm:h-5" />
                <div>
                  <span className="font-medium text-xs sm:text-sm block">Fire</span>
                  <span className="text-[10px] sm:text-xs text-gray-500">Damage</span>
                </div>
              </div>
              <span className="text-lg sm:text-xl font-bold">8</span>
            </div>
            <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-1 sm:gap-2">
                <Shield className="text-purple-500 w-4 h-4 sm:w-5 sm:h-5" />
                <div>
                  <span className="font-medium text-xs sm:text-sm block">Vandalism</span>
                  <span className="text-[10px] sm:text-xs text-gray-500">Damage</span>
                </div>
              </div>
              <span className="text-lg sm:text-xl font-bold">5</span>
            </div>
            <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-1 sm:gap-2">
                <Home className="text-gray-600 w-4 h-4 sm:w-5 sm:h-5" />
                <div>
                  <span className="font-medium text-xs sm:text-sm block">Roof</span>
                  <span className="text-[10px] sm:text-xs text-gray-500">Damage</span>
                </div>
              </div>
              <span className="text-lg sm:text-xl font-bold">9</span>
            </div>
            <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-1 sm:gap-2">
                <CloudRain className="text-cyan-500 w-4 h-4 sm:w-5 sm:h-5" />
                <div>
                  <span className="font-medium text-xs sm:text-sm block">Flood</span>
                  <span className="text-[10px] sm:text-xs text-gray-500">Damage</span>
                </div>
              </div>
              <span className="text-lg sm:text-xl font-bold">7</span>
            </div>
            <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-1 sm:gap-2">
                <Palette className="text-green-600 w-4 h-4 sm:w-5 sm:h-5" />
                <div>
                  <span className="font-medium text-xs sm:text-sm block">Mold</span>
                  <span className="text-[10px] sm:text-xs text-gray-500">Damage</span>
                </div>
              </div>
              <span className="text-lg sm:text-xl font-bold">4</span>
            </div>
            <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-1 sm:gap-2">
                <Briefcase className="text-indigo-500 w-4 h-4 sm:w-5 sm:h-5" />
                <div>
                  <span className="font-medium text-xs sm:text-sm block">Loss of</span>
                  <span className="text-[10px] sm:text-xs text-gray-500">Business Income</span>
                </div>
              </div>
              <span className="text-lg sm:text-xl font-bold">6</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-stellar-dark mb-4">Property Types</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Building2 className="text-blue-500 w-5 h-5" />
                  <span className="font-medium text-sm sm:text-base">Commercial</span>
                </div>
                <span className="text-xs sm:text-sm text-gray-600">60%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Home className="text-green-500 w-5 h-5" />
                  <span className="font-medium text-sm sm:text-base">Residential</span>
                </div>
                <span className="text-xs sm:text-sm text-gray-600">40%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}