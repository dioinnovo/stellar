'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, ArrowRight, Home, Building2, MapPin, User, 
  Calendar, FileText, Camera, Save, Phone, Mail, Shield,
  DollarSign, AlertCircle, Check
} from 'lucide-react'
import Link from 'next/link'

interface NewInspectionData {
  property: {
    address: string
    city: string
    state: string
    zipCode: string
    type: 'residential' | 'commercial' | ''
    yearBuilt: string
    squareFootage: string
    numberOfStories: string
  }
  owner: {
    name: string
    phone: string
    email: string
    company?: string
  }
  insurance: {
    company: string
    policyNumber: string
    adjusterName?: string
    adjusterPhone?: string
  }
  incident: {
    dateOfLoss: string
    damageTypes: string[]
    initialDescription: string
    estimatedValue?: string
  }
}

const DAMAGE_TYPES = [
  'Hurricane', 'Wind', 'Water', 'Fire', 'Flood', 
  'Hail', 'Lightning', 'Tree Fall', 'Vandalism', 'Theft'
]

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
]

export default function NewInspectionPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const [formData, setFormData] = useState<NewInspectionData>({
    property: {
      address: '',
      city: '',
      state: 'FL',
      zipCode: '',
      type: '',
      yearBuilt: '',
      squareFootage: '',
      numberOfStories: ''
    },
    owner: {
      name: '',
      phone: '',
      email: '',
      company: ''
    },
    insurance: {
      company: '',
      policyNumber: '',
      adjusterName: '',
      adjusterPhone: ''
    },
    incident: {
      dateOfLoss: '',
      damageTypes: [],
      initialDescription: '',
      estimatedValue: ''
    }
  })

  const updateField = (section: keyof NewInspectionData, field: string, value: any) => {
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

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}
    
    switch(step) {
      case 1: // Property & Owner
        if (!formData.property.address) newErrors['property.address'] = 'Address is required'
        if (!formData.property.city) newErrors['property.city'] = 'City is required'
        if (!formData.property.zipCode) newErrors['property.zipCode'] = 'ZIP code is required'
        if (!formData.property.type) newErrors['property.type'] = 'Property type is required'
        if (!formData.owner.name) newErrors['owner.name'] = 'Owner name is required'
        if (!formData.owner.phone) newErrors['owner.phone'] = 'Phone number is required'
        if (!formData.owner.email) newErrors['owner.email'] = 'Email is required'
        break
      case 2: // Insurance
        if (!formData.insurance.company) newErrors['insurance.company'] = 'Insurance company is required'
        if (!formData.insurance.policyNumber) newErrors['insurance.policyNumber'] = 'Policy number is required'
        break
      case 3: // Incident
        if (!formData.incident.dateOfLoss) newErrors['incident.dateOfLoss'] = 'Date of loss is required'
        if (formData.incident.damageTypes.length === 0) newErrors['incident.damageTypes'] = 'Select at least one damage type'
        if (!formData.incident.initialDescription) newErrors['incident.initialDescription'] = 'Description is required'
        break
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3))
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return
    
    setIsSaving(true)
    
    // Generate a new inspection ID
    const inspectionId = `INS-${Date.now()}`
    
    // Save to localStorage (in production, this would be an API call)
    localStorage.setItem(`inspection-${inspectionId}`, JSON.stringify({
      ...formData,
      inspectionId,
      createdAt: new Date().toISOString(),
      status: 'draft'
    }))
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Navigate to the inspection start page with the new data
    router.push(`/dashboard/inspection/${inspectionId}/start?new=true`)
  }

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard/inspection"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="hidden sm:inline">Back to Inspections</span>
              </Link>
              <div className="w-px h-6 bg-gray-300 hidden sm:block" />
              <h1 className="text-xl sm:text-3xl font-semibold text-gray-900">
                New Inspection
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Step {currentStep} of 3</span>
            <span className="text-sm font-medium text-gray-900">
              {currentStep === 1 && 'Property & Owner'}
              {currentStep === 2 && 'Insurance Information'}
              {currentStep === 3 && 'Incident Details'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div 
              className="bg-[#E74C3C] h-2 rounded-full transition-all duration-300"
              initial={{ width: '0%' }}
              animate={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-8">
          {/* Step 1: Property & Owner */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="space-y-6">
                {/* Property Information */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-[#E74C3C]/10 rounded-lg">
                      <Home className="text-[#E74C3C]" size={20} />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Property Information</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Property Type *
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => updateField('property', 'type', 'residential')}
                          className={`p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                            formData.property.type === 'residential'
                              ? 'border-[#E74C3C] bg-[#E74C3C]/10 text-[#E74C3C] font-medium'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Home size={18} />
                          Residential
                        </button>
                        <button
                          type="button"
                          onClick={() => updateField('property', 'type', 'commercial')}
                          className={`p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                            formData.property.type === 'commercial'
                              ? 'border-[#E74C3C] bg-[#E74C3C]/10 text-[#E74C3C] font-medium'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Building2 size={18} />
                          Commercial
                        </button>
                      </div>
                      {errors['property.type'] && (
                        <p className="text-red-500 text-xs mt-1">{errors['property.type']}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        value={formData.property.address}
                        onChange={(e) => updateField('property', 'address', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E74C3C]/20 ${
                          errors['property.address'] ? 'border-red-300' : 'border-gray-200'
                        }`}
                        placeholder="123 Main Street"
                      />
                      {errors['property.address'] && (
                        <p className="text-red-500 text-xs mt-1">{errors['property.address']}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        value={formData.property.city}
                        onChange={(e) => updateField('property', 'city', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E74C3C]/20 ${
                          errors['property.city'] ? 'border-red-300' : 'border-gray-200'
                        }`}
                        placeholder="Miami"
                      />
                      {errors['property.city'] && (
                        <p className="text-red-500 text-xs mt-1">{errors['property.city']}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State *
                        </label>
                        <select
                          value={formData.property.state}
                          onChange={(e) => updateField('property', 'state', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E74C3C]/20"
                        >
                          {US_STATES.map(state => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ZIP Code *
                        </label>
                        <input
                          type="text"
                          value={formData.property.zipCode}
                          onChange={(e) => updateField('property', 'zipCode', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E74C3C]/20 ${
                            errors['property.zipCode'] ? 'border-red-300' : 'border-gray-200'
                          }`}
                          placeholder="33101"
                          maxLength={5}
                        />
                        {errors['property.zipCode'] && (
                          <p className="text-red-500 text-xs mt-1">{errors['property.zipCode']}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Year Built
                      </label>
                      <input
                        type="text"
                        value={formData.property.yearBuilt}
                        onChange={(e) => updateField('property', 'yearBuilt', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E74C3C]/20"
                        placeholder="2005"
                        maxLength={4}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Square Footage
                      </label>
                      <input
                        type="text"
                        value={formData.property.squareFootage}
                        onChange={(e) => updateField('property', 'squareFootage', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E74C3C]/20"
                        placeholder="2,400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Number of Stories
                      </label>
                      <input
                        type="text"
                        value={formData.property.numberOfStories}
                        onChange={(e) => updateField('property', 'numberOfStories', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E74C3C]/20"
                        placeholder="2"
                        maxLength={2}
                      />
                    </div>
                  </div>
                </div>

                {/* Owner Information */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-[#E74C3C]/10 rounded-lg">
                      <User className="text-[#E74C3C]" size={20} />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Property Owner</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Owner Name *
                      </label>
                      <input
                        type="text"
                        value={formData.owner.name}
                        onChange={(e) => updateField('owner', 'name', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E74C3C]/20 ${
                          errors['owner.name'] ? 'border-red-300' : 'border-gray-200'
                        }`}
                        placeholder="John Smith"
                      />
                      {errors['owner.name'] && (
                        <p className="text-red-500 text-xs mt-1">{errors['owner.name']}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company (if applicable)
                      </label>
                      <input
                        type="text"
                        value={formData.owner.company}
                        onChange={(e) => updateField('owner', 'company', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E74C3C]/20"
                        placeholder="ABC Properties LLC"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={formData.owner.phone}
                        onChange={(e) => updateField('owner', 'phone', formatPhoneNumber(e.target.value))}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E74C3C]/20 ${
                          errors['owner.phone'] ? 'border-red-300' : 'border-gray-200'
                        }`}
                        placeholder="(305) 123-4567"
                      />
                      {errors['owner.phone'] && (
                        <p className="text-red-500 text-xs mt-1">{errors['owner.phone']}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={formData.owner.email}
                        onChange={(e) => updateField('owner', 'email', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E74C3C]/20 ${
                          errors['owner.email'] ? 'border-red-300' : 'border-gray-200'
                        }`}
                        placeholder="john.smith@example.com"
                      />
                      {errors['owner.email'] && (
                        <p className="text-red-500 text-xs mt-1">{errors['owner.email']}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Insurance Information */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-[#E74C3C]/10 rounded-lg">
                      <Shield className="text-[#E74C3C]" size={20} />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Insurance Information</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Insurance Company *
                      </label>
                      <input
                        type="text"
                        value={formData.insurance.company}
                        onChange={(e) => updateField('insurance', 'company', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E74C3C]/20 ${
                          errors['insurance.company'] ? 'border-red-300' : 'border-gray-200'
                        }`}
                        placeholder="State Farm, Allstate, etc."
                      />
                      {errors['insurance.company'] && (
                        <p className="text-red-500 text-xs mt-1">{errors['insurance.company']}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Policy Number *
                      </label>
                      <input
                        type="text"
                        value={formData.insurance.policyNumber}
                        onChange={(e) => updateField('insurance', 'policyNumber', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E74C3C]/20 ${
                          errors['insurance.policyNumber'] ? 'border-red-300' : 'border-gray-200'
                        }`}
                        placeholder="POL-123456789"
                      />
                      {errors['insurance.policyNumber'] && (
                        <p className="text-red-500 text-xs mt-1">{errors['insurance.policyNumber']}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Adjuster Name (if assigned)
                      </label>
                      <input
                        type="text"
                        value={formData.insurance.adjusterName}
                        onChange={(e) => updateField('insurance', 'adjusterName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E74C3C]/20"
                        placeholder="Jane Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Adjuster Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.insurance.adjusterPhone}
                        onChange={(e) => updateField('insurance', 'adjusterPhone', formatPhoneNumber(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E74C3C]/20"
                        placeholder="(305) 987-6543"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Incident Details */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-[#E74C3C]/10 rounded-lg">
                      <AlertCircle className="text-[#E74C3C]" size={20} />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Incident Details</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date of Loss *
                        </label>
                        <input
                          type="date"
                          value={formData.incident.dateOfLoss}
                          onChange={(e) => updateField('incident', 'dateOfLoss', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E74C3C]/20 ${
                            errors['incident.dateOfLoss'] ? 'border-red-300' : 'border-gray-200'
                          }`}
                        />
                        {errors['incident.dateOfLoss'] && (
                          <p className="text-red-500 text-xs mt-1">{errors['incident.dateOfLoss']}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Estimated Value
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Damage Types * (Select all that apply)
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {DAMAGE_TYPES.map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => toggleDamageType(type)}
                            className={`p-3 rounded-lg border-2 transition-all text-sm ${
                              formData.incident.damageTypes.includes(type)
                                ? 'border-[#E74C3C] bg-[#E74C3C]/10 text-[#E74C3C] font-medium'
                                : 'border-gray-200 hover:border-gray-300'
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Damage Description *
                      </label>
                      <textarea
                        value={formData.incident.initialDescription}
                        onChange={(e) => updateField('incident', 'initialDescription', e.target.value)}
                        rows={4}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E74C3C]/20 ${
                          errors['incident.initialDescription'] ? 'border-red-300' : 'border-gray-200'
                        }`}
                        placeholder="Describe the damage to the property, including affected areas and severity..."
                      />
                      {errors['incident.initialDescription'] && (
                        <p className="text-red-500 text-xs mt-1">{errors['incident.initialDescription']}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={currentStep === 1 ? () => router.push('/dashboard/inspection') : handleBack}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="hidden sm:inline">
                {currentStep === 1 ? 'Cancel' : 'Back'}
              </span>
            </button>

            <div className="flex items-center gap-3">
              {currentStep < 3 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#E74C3C] text-white rounded-lg hover:bg-[#D73929] transition-all font-medium"
                >
                  <span>Next</span>
                  <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#E74C3C] text-white rounded-lg hover:bg-[#D73929] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      <span>Create Inspection</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>* Required fields</p>
        </div>
      </div>
    </div>
  )
}