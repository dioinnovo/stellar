'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, FileText, DollarSign, Calendar, User, Mail, Phone, MapPin,
  AlertTriangle, CheckCircle, Clock, XCircle, Download, Send, Eye,
  FileImage, Activity, MessageSquare, Lightbulb, Shield, TrendingUp,
  Building2, Home, Hash, Edit, Save, X, ChevronDown, ChevronUp
} from 'lucide-react'

interface ClaimDetails {
  id: string
  claimNumber: string
  type: string
  status: string
  priority: string
  submittedAt: string
  updatedAt: string
  propertyAddress: string
  propertyType: string
  policyNumber: string
  damageType: string
  damageDescription: string
  severity: string
  estimatedAmount: number
  approvedAmount: number | null
  deductible: number | null
  insuredName: string
  insuredEmail: string
  insuredPhone: string
  aiConfidence: number
  fraudScore: number
  settlementScore: number
  documents: Array<{
    id: string
    filename: string
    url: string
    uploadedAt: string
  }>
  workflows: Array<{
    id: string
    name: string
    status: string
    triggeredAt: string
    completedAt: string | null
  }>
  activities: Array<{
    id: string
    action: string
    description: string
    createdAt: string
  }>
  enrichments: Array<{
    id: string
    type: string
    content: string
    confidence: number
  }>
  lead: {
    id: string
    leadNumber: string
    status: string
    qualification: string
  } | null
}

export default function ClaimDetailPage() {
  const params = useParams()
  const claimId = params.id as string
  
  const [claim, setClaim] = useState<ClaimDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedClaim, setEditedClaim] = useState<Partial<ClaimDetails>>({})
  const [activeTab, setActiveTab] = useState('overview')
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    details: true,
    ai: true,
    documents: false,
    timeline: false
  })

  useEffect(() => {
    fetchClaimDetails()
  }, [claimId])

  const fetchClaimDetails = async () => {
    try {
      const response = await fetch(`/api/claims/${claimId}`)
      const data = await response.json()
      
      if (data.success) {
        setClaim(data.data)
        setEditedClaim(data.data)
      }
    } catch (error) {
      console.error('Error fetching claim:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/claims/${claimId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editedClaim.status,
          priority: editedClaim.priority,
          approvedAmount: editedClaim.approvedAmount
        })
      })
      
      if (response.ok) {
        await fetchClaimDetails()
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error updating claim:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'SETTLED':
        return <CheckCircle className="text-green-500" size={20} />
      case 'DENIED':
        return <XCircle className="text-red-500" size={20} />
      case 'UNDER_REVIEW':
      case 'ESTIMATING':
        return <Clock className="text-blue-500" size={20} />
      default:
        return <AlertTriangle className="text-yellow-500" size={20} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'SETTLED':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'DENIED':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'UNDER_REVIEW':
      case 'ESTIMATING':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800'
      case 'HIGH':
        return 'bg-orange-100 text-orange-800'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stellar-orange mx-auto mb-4" />
          <p className="text-gray-600">Loading claim details...</p>
        </div>
      </div>
    )
  }

  if (!claim) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="text-red-500 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Claim not found</p>
          <Link href="/admin" className="text-stellar-orange hover:underline mt-2 inline-block">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/admin"
                className="flex items-center gap-2 text-gray-600 hover:text-stellar-orange transition"
              >
                <ArrowLeft size={20} />
                Back to Dashboard
              </Link>
              <span className="text-gray-400">|</span>
              <div className="flex items-center gap-2">
                <Hash size={16} className="text-gray-400" />
                <h1 className="text-3xl font-bold text-gray-800">{claim.claimNumber}</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <Save size={18} />
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setEditedClaim(claim)
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-stellar-orange text-white rounded-lg hover:bg-red-600 transition"
                  >
                    <Edit size={18} />
                    Edit Claim
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                    <Download size={18} />
                    Export
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Claim Status</h2>
                <div className="flex items-center gap-3">
                  {isEditing ? (
                    <>
                      <select
                        value={editedClaim.status}
                        onChange={(e) => setEditedClaim({ ...editedClaim, status: e.target.value })}
                        className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stellar-orange"
                      >
                        <option value="SUBMITTED">Submitted</option>
                        <option value="TRIAGING">Triaging</option>
                        <option value="UNDER_REVIEW">Under Review</option>
                        <option value="ESTIMATING">Estimating</option>
                        <option value="APPROVED">Approved</option>
                        <option value="DENIED">Denied</option>
                        <option value="SETTLED">Settled</option>
                      </select>
                      <select
                        value={editedClaim.priority}
                        onChange={(e) => setEditedClaim({ ...editedClaim, priority: e.target.value })}
                        className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stellar-orange"
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                      </select>
                    </>
                  ) : (
                    <>
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(claim.status)}`}>
                        {getStatusIcon(claim.status)}
                        <span className="font-medium">{claim.status.replace('_', ' ')}</span>
                      </div>
                      <div className={`px-3 py-1 rounded-full font-medium ${getPriorityColor(claim.priority)}`}>
                        {claim.priority} Priority
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Submitted</p>
                  <p className="font-medium text-gray-900">
                    {new Date(claim.submittedAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-medium text-gray-900">
                    {new Date(claim.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Processing Time</p>
                  <p className="font-medium text-gray-900">
                    {Math.round((new Date(claim.updatedAt).getTime() - new Date(claim.submittedAt).getTime()) / (1000 * 60 * 60))} hours
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Lead Status</p>
                  <p className="font-medium text-gray-900">
                    {claim.lead?.qualification || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Property & Damage Details */}
            <div className="bg-white rounded-lg shadow-sm">
              <button
                onClick={() => toggleSection('details')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
              >
                <h2 className="text-lg font-semibold text-gray-800">Property & Damage Details</h2>
                {expandedSections.details ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              
              {expandedSections.details && (
                <div className="px-6 pb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                        {claim.type === 'commercial' ? <Building2 size={18} /> : <Home size={18} />}
                        Property Information
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Type:</span>
                          <span className="font-medium capitalize">{claim.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Address:</span>
                          <span className="font-medium text-right">{claim.propertyAddress}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Policy #:</span>
                          <span className="font-medium">{claim.policyNumber || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <AlertTriangle size={18} />
                        Damage Information
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Type:</span>
                          <span className="font-medium">{claim.damageType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Severity:</span>
                          <span className="font-medium">{claim.severity || 'N/A'}</span>
                        </div>
                        <div className="mt-3">
                          <span className="text-gray-500">Description:</span>
                          <p className="mt-1 text-sm text-gray-700">{claim.damageDescription || 'No description provided'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* AI Analysis */}
            <div className="bg-white rounded-lg shadow-sm">
              <button
                onClick={() => toggleSection('ai')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
              >
                <h2 className="text-lg font-semibold text-gray-800">AI Analysis & Estimates</h2>
                {expandedSections.ai ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              
              {expandedSections.ai && (
                <div className="px-6 pb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center">
                      <div className="mb-2">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                          <Shield className="text-green-600" size={28} />
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">AI Confidence</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {(claim.aiConfidence * 100).toFixed(1)}%
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="mb-2">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full">
                          <AlertTriangle className="text-yellow-600" size={28} />
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">Fraud Score</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {(claim.fraudScore * 100).toFixed(1)}%
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="mb-2">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
                          <TrendingUp className="text-blue-600" size={28} />
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">Settlement Score</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {(claim.settlementScore * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h3 className="font-medium text-gray-700 mb-3">Financial Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Estimated Amount:</span>
                        <span className="text-xl font-bold text-gray-900">
                          ${claim.estimatedAmount?.toLocaleString() || '0'}
                        </span>
                      </div>
                      {isEditing ? (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Approved Amount:</span>
                          <input
                            type="number"
                            value={editedClaim.approvedAmount || ''}
                            onChange={(e) => setEditedClaim({ ...editedClaim, approvedAmount: parseFloat(e.target.value) })}
                            className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stellar-orange"
                            placeholder="Enter amount"
                          />
                        </div>
                      ) : (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Approved Amount:</span>
                          <span className="text-xl font-bold text-green-600">
                            ${claim.approvedAmount?.toLocaleString() || 'Pending'}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Deductible:</span>
                        <span className="text-lg text-gray-700">
                          ${claim.deductible?.toLocaleString() || '0'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Documents */}
            <div className="bg-white rounded-lg shadow-sm">
              <button
                onClick={() => toggleSection('documents')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
              >
                <h2 className="text-lg font-semibold text-gray-800">
                  Documents ({claim.documents.length})
                </h2>
                {expandedSections.documents ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              
              {expandedSections.documents && (
                <div className="px-6 pb-6">
                  {claim.documents.length > 0 ? (
                    <div className="space-y-3">
                      {claim.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileImage className="text-gray-500" size={20} />
                            <div>
                              <p className="font-medium text-gray-900">{doc.filename}</p>
                              <p className="text-sm text-gray-500">
                                Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="p-2 text-gray-600 hover:text-stellar-orange transition">
                              <Eye size={18} />
                            </button>
                            <button className="p-2 text-gray-600 hover:text-stellar-orange transition">
                              <Download size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No documents uploaded</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Contact & Activity */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Insured Name</p>
                    <p className="font-medium text-gray-900">{claim.insuredName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <a href={`mailto:${claim.insuredEmail}`} className="font-medium text-stellar-orange hover:underline">
                      {claim.insuredEmail}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <a href={`tel:${claim.insuredPhone}`} className="font-medium text-stellar-orange hover:underline">
                      {claim.insuredPhone}
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-stellar-orange text-white rounded-lg hover:bg-red-600 transition">
                  <Send size={18} />
                  Send Email
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                  <MessageSquare size={18} />
                  Add Note
                </button>
              </div>
            </div>

            {/* GraphRAG Enrichments */}
            {claim.enrichments.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Lightbulb className="text-yellow-500" size={20} />
                  AI Suggestions
                </h2>
                <div className="space-y-3">
                  {claim.enrichments
                    .filter(e => e.type === 'suggestion')
                    .slice(0, 4)
                    .map((enrichment, index) => {
                      const content = JSON.parse(enrichment.content)
                      return (
                        <div key={enrichment.id} className="flex items-start gap-2">
                          <div className="w-6 h-6 bg-stellar-orange text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                            {index + 1}
                          </div>
                          <p className="text-sm text-gray-700 flex-1">{content.text}</p>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}

            {/* Activity Timeline */}
            <div className="bg-white rounded-lg shadow-sm">
              <button
                onClick={() => toggleSection('timeline')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
              >
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Activity size={20} />
                  Activity Timeline
                </h2>
                {expandedSections.timeline ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              
              {expandedSections.timeline && (
                <div className="px-6 pb-6 max-h-96 overflow-y-auto">
                  <div className="space-y-4">
                    {claim.activities.map((activity, index) => (
                      <div key={activity.id} className="flex gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <Activity className="text-gray-500" size={16} />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(activity.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}