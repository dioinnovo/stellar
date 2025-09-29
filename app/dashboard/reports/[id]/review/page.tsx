'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft, CheckCircle, XCircle, Edit3, Download, Send,
  FileText, Calendar, MapPin, User, Building2, Home,
  Star, Eye, MessageSquare, Clock, DollarSign, AlertTriangle
} from 'lucide-react'

interface ReportReviewData {
  id: string
  claimNumber: string
  property: {
    address: string
    type: 'residential' | 'commercial'
    owner: string
  }
  completedDate: string
  damageType: string
  adjuster?: {
    name: string
    rating: number
  }
  status: string
  settlement: {
    estimated: number
    approved: number
    increase: number
  }
  confidenceScore: number
  timeToComplete: string
}

export default function ReportReviewPage() {
  const params = useParams()
  const router = useRouter()
  const reportId = params.id as string
  const [report, setReport] = useState<ReportReviewData | null>(null)
  const [comments, setComments] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load report data from sessionStorage
    const reportsData = sessionStorage.getItem('inspection_reports')
    if (reportsData) {
      const reports = JSON.parse(reportsData)
      const foundReport = reports.find((r: any) => r.id === reportId)
      if (foundReport) {
        setReport(foundReport)
      }
    }
    setIsLoading(false)
  }, [reportId])

  const handleApproval = async (approved: boolean) => {
    if (!report) return

    // Update the report status
    const newStatus = approved ? 'approved' : 'requires_revision'
    const updatedReport = {
      ...report,
      status: newStatus,
      settlement: approved ? {
        ...report.settlement,
        approved: report.settlement.estimated * 1.15, // Apply 15% increase for approved
        increase: 15
      } : report.settlement
    }

    // Update in sessionStorage
    const reportsData = sessionStorage.getItem('inspection_reports')
    if (reportsData) {
      const reports = JSON.parse(reportsData)
      const updatedReports = reports.map((r: any) =>
        r.id === reportId ? updatedReport : r
      )
      sessionStorage.setItem('inspection_reports', JSON.stringify(updatedReports))
    }

    // Navigate back to reports page
    router.push('/dashboard/reports')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stellar-orange"></div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Report Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">The requested report could not be found.</p>
        <button
          onClick={() => router.push('/dashboard/reports')}
          className="px-4 py-2 bg-stellar-orange text-white rounded-lg hover:bg-red-600 transition"
        >
          Back to Reports
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/dashboard/reports')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Report Review</h1>
          <p className="text-gray-600 dark:text-gray-400">Review and approve inspection report</p>
        </div>
      </div>

      {/* Report Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Property Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Property Information</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{report.property.address}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{report.property.owner}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {report.property.type === 'residential' ?
                  <Home className="w-5 h-5 text-gray-400" /> :
                  <Building2 className="w-5 h-5 text-gray-400" />
                }
                <span className="text-gray-900 dark:text-gray-100 capitalize">{report.property.type} Property</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900 dark:text-gray-100">
                  Completed: {new Date(report.completedDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Report Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Report Details</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Claim Number:</span>
                <span className="font-medium">{report.claimNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Damage Type:</span>
                <span className="font-medium">{report.damageType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">AI Confidence:</span>
                <span className="font-medium">{report.confidenceScore}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Time to Complete:</span>
                <span className="font-medium">{report.timeToComplete}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Inspector:</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{report.adjuster?.name || 'John Smith'}</span>
                  {report.adjuster && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">{report.adjuster.rating}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settlement Information */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Settlement Estimate</h3>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Estimated Damage Value:</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                ${report.settlement.estimated.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Review Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Review & Approval</h3>

        {/* Comments Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Review Comments (Optional)
          </label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Add any comments or notes about this report..."
            className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-stellar-orange/20 focus:border-stellar-orange resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => handleApproval(false)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            <XCircle className="w-5 h-5" />
            Request Revision
          </button>

          <button
            onClick={() => router.push(`/dashboard/inspection/${report.id}/report`)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            <Eye className="w-5 h-5" />
            View Full Report
          </button>

          <button
            onClick={() => handleApproval(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <CheckCircle className="w-5 h-5" />
            Approve Report
          </button>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 rounded-lg hover:bg-gray-200 transition">
            <Download className="w-4 h-4" />
            Download PDF
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 rounded-lg hover:bg-gray-200 transition">
            <Send className="w-4 h-4" />
            Send to Client
          </button>
        </div>
      </motion.div>
    </div>
  )
}