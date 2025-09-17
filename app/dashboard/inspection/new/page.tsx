'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Home, Building2, MapPin, 
  Calendar, Camera, AlertCircle, Check, Clock, 
  DollarSign, Zap, AlertTriangle, Shield
} from 'lucide-react'

interface QuickInspectionData {
  property: {
    address: string
    type: 'residential' | 'commercial' | ''
  }
  incident: {
    dateOfLoss: string
    damageTypes: string[]
    severity: 'minor' | 'moderate' | 'major' | 'total_loss' | ''
    initialDescription: string
    estimatedValue?: string
  }
  inspection: {
    urgency: 'routine' | 'urgent' | 'emergency' | ''
  }
}

const DAMAGE_TYPES = [
  'Hurricane', 'Wind', 'Water', 'Fire', 'Flood', 
  'Hail', 'Lightning', 'Tree Fall', 'Vandalism', 'Theft'
]

const SEVERITY_LEVELS = [
  { value: 'minor', label: 'Minor', shortLabel: 'Minor', color: 'border-blue-500 bg-blue-50 text-blue-700', icon: '🟢' },
  { value: 'moderate', label: 'Moderate', shortLabel: 'Moderate', color: 'border-yellow-500 bg-yellow-50 text-yellow-700', icon: '🟡' },
  { value: 'major', label: 'Major', shortLabel: 'Major', color: 'border-orange-500 bg-orange-50 text-orange-700', icon: '🟠' },
  { value: 'total_loss', label: 'Total Loss', shortLabel: 'Total', color: 'border-red-500 bg-red-50 text-red-700', icon: '🔴' }
]

const URGENCY_LEVELS = [
  {
    value: 'routine',
    label: 'Routine',
    description: 'Within 48-72 hours',
    color: 'border-gray-300 bg-gray-50',
    icon: <Clock className="w-6 h-6 text-gray-600" />
  },
  {
    value: 'urgent',
    label: 'Urgent',
    description: 'Within 24 hours',
    color: 'border-yellow-500 bg-yellow-50',
    icon: <Zap className="w-6 h-6 text-yellow-600" />
  },
  {
    value: 'emergency',
    label: 'Emergency',
    description: 'Immediate response',
    color: 'border-red-500 bg-red-50',
    icon: <AlertTriangle className="w-6 h-6 text-red-600" />
  }
]

export default function NewInspectionPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const [formData, setFormData] = useState<QuickInspectionData>({
    property: {
      address: '',
      type: ''
    },
    incident: {
      dateOfLoss: new Date().toISOString().split('T')[0], // Default to today
      damageTypes: [],
      severity: '',
      initialDescription: '',
      estimatedValue: ''
    },
    inspection: {
      urgency: ''
    }
  })

  const updateField = (section: keyof QuickInspectionData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
    // Clear error when user starts typing
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[`${section}.${field}`]
      return newErrors
    })
  }

  const toggleDamageType = (type: string) => {
    const newTypes = formData.incident.damageTypes.includes(type)
      ? formData.incident.damageTypes.filter(t => t !== type)
      : [...formData.incident.damageTypes, type]
    updateField('incident', 'damageTypes', newTypes)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    // Essential validations only
    if (!formData.property.address) newErrors['property.address'] = 'Property address is required'
    if (!formData.property.type) newErrors['property.type'] = 'Select property type'
    if (formData.incident.damageTypes.length === 0) newErrors['incident.damageTypes'] = 'Select at least one damage type'
    if (!formData.incident.severity) newErrors['incident.severity'] = 'Select damage severity'
    if (!formData.inspection.urgency) newErrors['inspection.urgency'] = 'Select inspection urgency'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    
    setIsSaving(true)
    
    // Generate a new inspection ID
    const inspectionId = `INS-${Date.now()}`
    
    // Create minimal claim data for quick start
    const quickClaimData = {
      property: {
        address: formData.property.address,
        city: 'Miami', // Will be collected later
        state: 'FL',
        zipCode: '33101', // Will be collected later
        type: formData.property.type,
        yearBuilt: '',
        squareFootage: '',
        numberOfStories: ''
      },
      owner: {
        name: 'To be collected',
        phone: 'To be collected',
        email: 'To be collected'
      },
      insurance: {
        company: 'To be collected',
        policyNumber: 'TBD',
        adjusterName: '',
        adjusterPhone: ''
      },
      incident: {
        ...formData.incident,
        estimatedValue: formData.incident.estimatedValue 
          ? formData.incident.estimatedValue.replace(/,/g, '')
          : ''
      },
      inspection: formData.inspection,
      inspectionId,
      createdAt: new Date().toISOString(),
      status: 'draft'
    }
    
    // Save basic inspection info
    localStorage.setItem(`inspection-${inspectionId}`, JSON.stringify(quickClaimData))

    // Initialize full inspection data structure with all areas
    const DEFAULT_RESIDENTIAL_AREAS = [
      // Exterior
      { id: 'exterior-roof', name: 'Roof & Gutters', category: 'Exterior', status: 'not_started', photoCount: 0, notesCount: 0, findings: '', damageDescription: '', recommendedActions: '', estimatedCost: 0, priority: 'low', media: [] },
      { id: 'exterior-siding', name: 'Siding & Walls', category: 'Exterior', status: 'not_started', photoCount: 0, notesCount: 0, findings: '', damageDescription: '', recommendedActions: '', estimatedCost: 0, priority: 'low', media: [] },
      { id: 'exterior-windows', name: 'Windows & Doors', category: 'Exterior', status: 'not_started', photoCount: 0, notesCount: 0, findings: '', damageDescription: '', recommendedActions: '', estimatedCost: 0, priority: 'low', media: [] },
      { id: 'exterior-foundation', name: 'Foundation', category: 'Exterior', status: 'not_started', photoCount: 0, notesCount: 0, findings: '', damageDescription: '', recommendedActions: '', estimatedCost: 0, priority: 'low', media: [] },
      { id: 'exterior-landscape', name: 'Landscape & Drainage', category: 'Exterior', status: 'not_started', photoCount: 0, notesCount: 0, findings: '', damageDescription: '', recommendedActions: '', estimatedCost: 0, priority: 'low', media: [] },
      // Interior
      { id: 'interior-living', name: 'Living Room', category: 'Interior', status: 'not_started', photoCount: 0, notesCount: 0, findings: '', damageDescription: '', recommendedActions: '', estimatedCost: 0, priority: 'low', media: [] },
      { id: 'interior-kitchen', name: 'Kitchen', category: 'Interior', status: 'not_started', photoCount: 0, notesCount: 0, findings: '', damageDescription: '', recommendedActions: '', estimatedCost: 0, priority: 'low', media: [] },
      { id: 'interior-master-bed', name: 'Master Bedroom', category: 'Interior', status: 'not_started', photoCount: 0, notesCount: 0, findings: '', damageDescription: '', recommendedActions: '', estimatedCost: 0, priority: 'low', media: [] },
      { id: 'interior-bedrooms', name: 'Other Bedrooms', category: 'Interior', status: 'not_started', photoCount: 0, notesCount: 0, findings: '', damageDescription: '', recommendedActions: '', estimatedCost: 0, priority: 'low', media: [] },
      { id: 'interior-bathrooms', name: 'Bathrooms', category: 'Interior', status: 'not_started', photoCount: 0, notesCount: 0, findings: '', damageDescription: '', recommendedActions: '', estimatedCost: 0, priority: 'low', media: [] },
      { id: 'interior-basement', name: 'Basement/Attic', category: 'Interior', status: 'not_started', photoCount: 0, notesCount: 0, findings: '', damageDescription: '', recommendedActions: '', estimatedCost: 0, priority: 'low', media: [] },
      // Systems
      { id: 'systems-electrical', name: 'Electrical System', category: 'Systems', status: 'not_started', photoCount: 0, notesCount: 0, findings: '', damageDescription: '', recommendedActions: '', estimatedCost: 0, priority: 'low', media: [] },
      { id: 'systems-plumbing', name: 'Plumbing System', category: 'Systems', status: 'not_started', photoCount: 0, notesCount: 0, findings: '', damageDescription: '', recommendedActions: '', estimatedCost: 0, priority: 'low', media: [] },
      { id: 'systems-hvac', name: 'HVAC System', category: 'Systems', status: 'not_started', photoCount: 0, notesCount: 0, findings: '', damageDescription: '', recommendedActions: '', estimatedCost: 0, priority: 'low', media: [] }
    ]

    const inspectionData = {
      id: inspectionId,
      property: {
        address: formData.property.address,
        type: formData.property.type || 'residential',
        owner: '',
        yearBuilt: new Date().getFullYear(),
        policyNumber: ''
      },
      areas: DEFAULT_RESIDENTIAL_AREAS,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completionPercentage: 0
    }

    // Save the full inspection data structure
    localStorage.setItem(`inspection-${inspectionId}-data`, JSON.stringify(inspectionData))

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Navigate to the inspection start page with the new data
    router.push(`/dashboard/inspection/${inspectionId}/start?new=true`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div>
            <Link
              href="/dashboard/inspection"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-3"
            >
              <ArrowLeft size={20} />
              <span>Cancel</span>
            </Link>
            <div>
              <h1 className="text-xl sm:text-3xl font-semibold text-gray-900">
                Quick Inspection Setup
              </h1>
              <p className="text-sm text-gray-600 mt-1">Start inspection immediately - details can be added later</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto sm:px-6 py-4 sm:py-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Damage Information - Primary Focus */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-50 rounded-lg">
                  <AlertCircle className="text-red-600" size={20} />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">What Happened?</h2>
              </div>
              
              <div className="space-y-4">
                {/* Date of Loss */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Loss *
                    </label>
                    <input
                      type="date"
                      value={formData.incident.dateOfLoss}
                      onChange={(e) => updateField('incident', 'dateOfLoss', e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E74C3C]/20"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Value (Optional)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        value={formData.incident.estimatedValue}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '')
                          const formatted = value ? parseInt(value).toLocaleString() : ''
                          updateField('incident', 'estimatedValue', formatted)
                        }}
                        className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E74C3C]/20"
                        placeholder="50,000"
                      />
                    </div>
                  </div>
                </div>

                {/* Damage Types */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Damage Types * (Select all that apply)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {DAMAGE_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleDamageType(type)}
                        className={`px-2 py-2 rounded-lg border-2 transition-all text-xs sm:text-sm font-medium ${
                          formData.incident.damageTypes.includes(type)
                            ? 'border-[#E74C3C] bg-[#E74C3C]/10 text-[#E74C3C]'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  {errors['incident.damageTypes'] && (
                    <p className="text-red-500 text-xs mt-1">{errors['incident.damageTypes']}</p>
                  )}
                </div>

                {/* Severity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Damage Severity *
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {SEVERITY_LEVELS.map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => updateField('incident', 'severity', level.value)}
                        className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                          formData.incident.severity === level.value
                            ? level.color + ' border-2'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <span className="text-2xl mb-1">{level.icon}</span>
                        <span className="text-xs font-medium">
                          {level.value === 'total_loss' ? (
                            <>
                              <span className="block sm:hidden">Total</span>
                              <span className="hidden sm:block">Total Loss</span>
                            </>
                          ) : (
                            level.label
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                  {errors['incident.severity'] && (
                    <p className="text-red-500 text-xs mt-1">{errors['incident.severity']}</p>
                  )}
                </div>

                {/* Brief Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brief Description (Optional)
                  </label>
                  <textarea
                    value={formData.incident.initialDescription}
                    onChange={(e) => updateField('incident', 'initialDescription', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E74C3C]/20"
                    placeholder="Quick notes about the damage (can be added later)..."
                  />
                </div>
              </div>
            </div>

            {/* Property Location */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <MapPin className="text-blue-600" size={20} />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Property Location</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Address *
                  </label>
                  <input
                    type="text"
                    value={formData.property.address}
                    onChange={(e) => updateField('property', 'address', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E74C3C]/20 ${
                      errors['property.address'] ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="123 Main Street, Miami, FL"
                  />
                  {errors['property.address'] && (
                    <p className="text-red-500 text-xs mt-1">{errors['property.address']}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => updateField('property', 'type', 'residential')}
                      className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                        formData.property.type === 'residential'
                          ? 'border-[#E74C3C] bg-[#E74C3C]/10 text-[#E74C3C]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Home size={24} />
                      <span className="font-medium">Residential</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField('property', 'type', 'commercial')}
                      className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                        formData.property.type === 'commercial'
                          ? 'border-[#E74C3C] bg-[#E74C3C]/10 text-[#E74C3C]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Building2 size={24} />
                      <span className="font-medium">Commercial</span>
                    </button>
                  </div>
                  {errors['property.type'] && (
                    <p className="text-red-500 text-xs mt-1">{errors['property.type']}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Inspection Urgency */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <Clock className="text-amber-600" size={20} />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Inspection Urgency</h2>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {URGENCY_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => updateField('inspection', 'urgency', level.value)}
                    className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center justify-center ${
                      formData.inspection.urgency === level.value
                        ? level.color + ' border-2'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="mb-2">
                      {level.icon}
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-sm">
                        {level.label}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{level.description}</div>
                    </div>
                  </button>
                ))}
              </div>
              {errors['inspection.urgency'] && (
                <p className="text-red-500 text-xs mt-1">{errors['inspection.urgency']}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <Link
                href="/dashboard/inspection"
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={18} />
                <span>Cancel</span>
              </Link>

              <button
                onClick={handleSubmit}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#E74C3C] text-white rounded-lg hover:bg-[#D73929] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>Starting...</span>
                  </>
                ) : (
                  <>
                    <Camera size={18} />
                    <span>Start Inspection</span>
                  </>
                )}
              </button>
            </div>

            {/* Help Text */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <Shield className="text-blue-600 flex-shrink-0" size={20} />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">Quick Start Mode</p>
                  <p>You can begin the inspection immediately with just this basic information. Additional details like owner contact, insurance information, and property specifications can be collected during or after the inspection.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}