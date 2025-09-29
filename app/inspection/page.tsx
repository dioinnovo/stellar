'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Home, Building2, MapPin, User, Phone, Mail, FileText, 
  Camera, AlertTriangle, DollarSign, Calendar, ChevronRight, 
  ChevronLeft, Check, Save, Send, Lightbulb, Info, Plus, X,
  Wind, Droplets, Flame, TreePine, CloudRain, Zap
} from 'lucide-react'

interface FormData {
  // Step 1: Property Information
  propertyType: string
  propertyAddress: string
  propertyCity: string
  propertyState: string
  propertyZip: string
  yearBuilt: string
  squareFootage: string
  numberOfStories: string
  
  // Step 2: Owner Information
  ownerName: string
  ownerEmail: string
  ownerPhone: string
  policyNumber: string
  insuranceCompany: string
  
  // Step 3: Damage Assessment
  damageType: string[]
  damageDate: string
  damageDescription: string
  severityLevel: string
  emergencyRepairs: boolean
  waterDamage: boolean
  structuralDamage: boolean
  
  // Step 4: Documentation
  photos: File[]
  documents: File[]
  additionalNotes: string
}

const DAMAGE_TYPES = [
  { id: 'wind', label: 'Wind Damage', icon: Wind },
  { id: 'water', label: 'Water Damage', icon: Droplets },
  { id: 'fire', label: 'Fire Damage', icon: Flame },
  { id: 'tree', label: 'Tree Damage', icon: TreePine },
  { id: 'flood', label: 'Flood Damage', icon: CloudRain },
  { id: 'lightning', label: 'Lightning Strike', icon: Zap },
]

export default function InspectionPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    propertyType: 'residential',
    propertyAddress: '',
    propertyCity: '',
    propertyState: '',
    propertyZip: '',
    yearBuilt: '',
    squareFootage: '',
    numberOfStories: '1',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    policyNumber: '',
    insuranceCompany: '',
    damageType: [],
    damageDate: '',
    damageDescription: '',
    severityLevel: 'moderate',
    emergencyRepairs: false,
    waterDamage: false,
    structuralDamage: false,
    photos: [],
    documents: [],
    additionalNotes: ''
  })
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const steps = [
    { number: 1, title: 'Property Information', icon: Home },
    { number: 2, title: 'Owner Information', icon: User },
    { number: 3, title: 'Damage Assessment', icon: AlertTriangle },
    { number: 4, title: 'Documentation', icon: FileText },
  ]

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Trigger GraphRAG suggestions (mock for now)
    if (field === 'damageType' || field === 'severityLevel') {
      generateSuggestions(field, value)
    }
  }

  const generateSuggestions = (field: string, value: any) => {
    // Mock GraphRAG suggestions - in production, this would call the API
    const mockSuggestions = {
      damageType: {
        wind: [
          'Document all missing shingles',
          'Check for interior water stains',
          'Photograph damaged gutters',
          'Note any broken windows'
        ],
        water: [
          'Measure water line marks',
          'Document mold presence',
          'Check electrical systems',
          'Photo damaged flooring'
        ],
        fire: [
          'Document smoke damage extent',
          'List damaged personal property',
          'Check structural integrity',
          'Photo all affected areas'
        ]
      },
      severityLevel: {
        minor: [
          'Focus on cosmetic damage',
          'Document surface repairs needed',
          'Estimate 1-2 weeks repair time'
        ],
        moderate: [
          'Include structural assessment',
          'Document safety hazards',
          'Consider temporary housing needs',
          'Estimate 2-4 weeks repair time'
        ],
        major: [
          'Priority: Safety documentation',
          'Full structural engineering report',
          'Document total loss items',
          'Consider full replacement costs'
        ]
      }
    }

    if (field === 'damageType' && Array.isArray(value)) {
      const newSuggestions: string[] = []
      value.forEach((type: string) => {
        if (mockSuggestions.damageType[type as keyof typeof mockSuggestions.damageType]) {
          newSuggestions.push(...mockSuggestions.damageType[type as keyof typeof mockSuggestions.damageType])
        }
      })
      setSuggestions(newSuggestions.slice(0, 4))
    } else if (field === 'severityLevel') {
      setSuggestions(mockSuggestions.severityLevel[value as keyof typeof mockSuggestions.severityLevel] || [])
    }
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Save to localStorage for now
    localStorage.setItem('inspectionFormData', JSON.stringify(formData))
    setTimeout(() => {
      setIsSaving(false)
    }, 1000)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      // Submit to API
      const response = await fetch('/api/claims/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: formData.propertyType,
          propertyAddress: `${formData.propertyAddress}, ${formData.propertyCity}, ${formData.propertyState} ${formData.propertyZip}`,
          propertyType: formData.propertyType === 'commercial' ? 'Commercial Building' : 'Single Family Home',
          policyNumber: formData.policyNumber,
          damageType: formData.damageType.join(', '),
          damageDescription: formData.damageDescription,
          severity: formData.severityLevel === 'minor' ? 'Minor' : formData.severityLevel === 'moderate' ? 'Moderate' : 'Major',
          insuredName: formData.ownerName,
          insuredEmail: formData.ownerEmail,
          insuredPhone: formData.ownerPhone,
        })
      })
      
      const result = await response.json()
      if (result.success) {
        alert(`Inspection submitted successfully! Claim Number: ${result.data.claimNumber}`)
        // Reset form or redirect
      }
    } catch (error) {
      console.error('Error submitting inspection:', error)
      alert('Error submitting inspection. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleDamageType = (type: string) => {
    const newTypes = formData.damageType.includes(type)
      ? formData.damageType.filter(t => t !== type)
      : [...formData.damageType, type]
    updateFormData('damageType', newTypes)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white dark:bg-gray-900/80 backdrop-blur-md z-50 border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Image 
                src="/images/stellar_logo.png" 
                alt="Stellar" 
                width={150} 
                height={40}
                className="h-10 w-auto object-contain"
              />
              <span className="text-xl font-bold text-stellar-dark">Home Inspection</span>
            </Link>
            <div className="flex items-center gap-4">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-stellar-orange transition"
              >
                <Save size={18} />
                {isSaving ? 'Saving...' : 'Save Draft'}
              </button>
              <Link href="/admin" className="text-gray-700 dark:text-gray-300 hover:text-stellar-orange transition">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-20 px-6">
        <div className="container mx-auto max-w-5xl">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center gap-2 ${currentStep >= step.number ? 'text-stellar-orange' : 'text-gray-400'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      currentStep > step.number 
                        ? 'bg-stellar-orange border-stellar-orange text-white'
                        : currentStep === step.number
                        ? 'border-stellar-orange text-stellar-orange'
                        : 'border-gray-300 text-gray-400'
                    }`}>
                      {currentStep > step.number ? <Check size={20} /> : step.number}
                    </div>
                    <span className="hidden md:block font-medium">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 md:w-24 h-1 mx-2 ${
                      currentStep > step.number ? 'bg-stellar-orange' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-stellar-orange h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Step 1: Property Information */}
                {currentStep === 1 && (
                  <div>
                    <h2 className="text-2xl font-bold text-stellar-dark mb-6">Property Information</h2>
                    
                    <div className="mb-6">
                      <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Property Type</label>
                      <div className="flex gap-4">
                        <button
                          onClick={() => updateFormData('propertyType', 'residential')}
                          className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition ${
                            formData.propertyType === 'residential'
                              ? 'border-stellar-orange bg-orange-50 text-stellar-orange'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <Home size={20} />
                          Residential
                        </button>
                        <button
                          onClick={() => updateFormData('propertyType', 'commercial')}
                          className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition ${
                            formData.propertyType === 'commercial'
                              ? 'border-stellar-orange bg-orange-50 text-stellar-orange'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <Building2 size={20} />
                          Commercial
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Street Address</label>
                        <input
                          type="text"
                          value={formData.propertyAddress}
                          onChange={(e) => updateFormData('propertyAddress', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-stellar-orange"
                          placeholder="123 Main Street"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">City</label>
                        <input
                          type="text"
                          value={formData.propertyCity}
                          onChange={(e) => updateFormData('propertyCity', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-stellar-orange"
                          placeholder="Dallas"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">State</label>
                        <input
                          type="text"
                          value={formData.propertyState}
                          onChange={(e) => updateFormData('propertyState', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-stellar-orange"
                          placeholder="TX"
                          maxLength={2}
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">ZIP Code</label>
                        <input
                          type="text"
                          value={formData.propertyZip}
                          onChange={(e) => updateFormData('propertyZip', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-stellar-orange"
                          placeholder="75201"
                          maxLength={5}
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Year Built</label>
                        <input
                          type="text"
                          value={formData.yearBuilt}
                          onChange={(e) => updateFormData('yearBuilt', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-stellar-orange"
                          placeholder="2010"
                          maxLength={4}
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Square Footage</label>
                        <input
                          type="text"
                          value={formData.squareFootage}
                          onChange={(e) => updateFormData('squareFootage', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-stellar-orange"
                          placeholder="2500"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Number of Stories</label>
                        <select
                          value={formData.numberOfStories}
                          onChange={(e) => updateFormData('numberOfStories', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-stellar-orange"
                        >
                          <option value="1">1 Story</option>
                          <option value="2">2 Stories</option>
                          <option value="3">3 Stories</option>
                          <option value="4+">4+ Stories</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Owner Information */}
                {currentStep === 2 && (
                  <div>
                    <h2 className="text-2xl font-bold text-stellar-dark mb-6">Owner Information</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Full Name</label>
                        <input
                          type="text"
                          value={formData.ownerName}
                          onChange={(e) => updateFormData('ownerName', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-stellar-orange"
                          placeholder="John Doe"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Email Address</label>
                        <input
                          type="email"
                          value={formData.ownerEmail}
                          onChange={(e) => updateFormData('ownerEmail', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-stellar-orange"
                          placeholder="john@example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Phone Number</label>
                        <input
                          type="tel"
                          value={formData.ownerPhone}
                          onChange={(e) => updateFormData('ownerPhone', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-stellar-orange"
                          placeholder="(555) 123-4567"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Policy Number</label>
                        <input
                          type="text"
                          value={formData.policyNumber}
                          onChange={(e) => updateFormData('policyNumber', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-stellar-orange"
                          placeholder="HO-2024-12345"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Insurance Company</label>
                        <input
                          type="text"
                          value={formData.insuranceCompany}
                          onChange={(e) => updateFormData('insuranceCompany', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-stellar-orange"
                          placeholder="State Farm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Damage Assessment */}
                {currentStep === 3 && (
                  <div>
                    <h2 className="text-2xl font-bold text-stellar-dark mb-6">Damage Assessment</h2>
                    
                    <div className="mb-6">
                      <label className="block text-gray-700 dark:text-gray-300 font-medium mb-3">Type of Damage (Select all that apply)</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {DAMAGE_TYPES.map((type) => (
                          <button
                            key={type.id}
                            onClick={() => toggleDamageType(type.id)}
                            className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition ${
                              formData.damageType.includes(type.id)
                                ? 'border-stellar-orange bg-orange-50 text-stellar-orange'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            <type.icon size={20} />
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Date of Damage</label>
                        <input
                          type="date"
                          value={formData.damageDate}
                          onChange={(e) => updateFormData('damageDate', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-stellar-orange"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Severity Level</label>
                        <select
                          value={formData.severityLevel}
                          onChange={(e) => updateFormData('severityLevel', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-stellar-orange"
                        >
                          <option value="minor">Minor - Cosmetic damage only</option>
                          <option value="moderate">Moderate - Some functionality impaired</option>
                          <option value="major">Major - Significant repairs needed</option>
                          <option value="total">Total Loss - Complete replacement needed</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Damage Description</label>
                        <textarea
                          value={formData.damageDescription}
                          onChange={(e) => updateFormData('damageDescription', e.target.value)}
                          rows={4}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-stellar-orange"
                          placeholder="Describe the damage in detail..."
                        />
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={formData.emergencyRepairs}
                          onChange={(e) => updateFormData('emergencyRepairs', e.target.checked)}
                          className="w-5 h-5 text-stellar-orange rounded focus:ring-stellar-orange"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Emergency repairs completed</span>
                      </label>

                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={formData.waterDamage}
                          onChange={(e) => updateFormData('waterDamage', e.target.checked)}
                          className="w-5 h-5 text-stellar-orange rounded focus:ring-stellar-orange"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Water damage present</span>
                      </label>

                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={formData.structuralDamage}
                          onChange={(e) => updateFormData('structuralDamage', e.target.checked)}
                          className="w-5 h-5 text-stellar-orange rounded focus:ring-stellar-orange"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Structural damage suspected</span>
                      </label>
                    </div>

                    {/* GraphRAG Suggestions */}
                    {suggestions.length > 0 && (
                      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Lightbulb className="text-blue-600" size={20} />
                          <h4 className="font-semibold text-blue-900">AI Suggestions</h4>
                        </div>
                        <ul className="space-y-2">
                          {suggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <Check className="text-blue-600 mt-0.5" size={16} />
                              <span className="text-sm text-blue-800">{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 4: Documentation */}
                {currentStep === 4 && (
                  <div>
                    <h2 className="text-2xl font-bold text-stellar-dark mb-6">Documentation</h2>
                    
                    <div className="mb-6">
                      <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Upload Photos</label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-stellar-orange transition">
                        <Camera className="mx-auto text-gray-400 mb-3" size={48} />
                        <p className="text-gray-700 dark:text-gray-300 font-medium">Click to upload photos</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">or drag and drop</p>
                        <p className="text-xs text-gray-400 mt-2">PNG, JPG up to 10MB each</p>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files) {
                              updateFormData('photos', Array.from(e.target.files))
                            }
                          }}
                        />
                      </div>
                      {formData.photos.length > 0 && (
                        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                          {formData.photos.length} photo(s) selected
                        </div>
                      )}
                    </div>

                    <div className="mb-6">
                      <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Upload Documents</label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-stellar-orange transition">
                        <FileText className="mx-auto text-gray-400 mb-3" size={48} />
                        <p className="text-gray-700 dark:text-gray-300 font-medium">Click to upload documents</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">PDF, DOC, DOCX up to 25MB each</p>
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files) {
                              updateFormData('documents', Array.from(e.target.files))
                            }
                          }}
                        />
                      </div>
                      {formData.documents.length > 0 && (
                        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                          {formData.documents.length} document(s) selected
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Additional Notes</label>
                      <textarea
                        value={formData.additionalNotes}
                        onChange={(e) => updateFormData('additionalNotes', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-stellar-orange"
                        placeholder="Any additional information that might be helpful..."
                      />
                    </div>

                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Info className="text-yellow-600 mt-0.5" size={20} />
                        <div>
                          <h4 className="font-semibold text-yellow-900">Review Before Submitting</h4>
                          <p className="text-sm text-yellow-800 mt-1">
                            Please ensure all information is accurate. Once submitted, this inspection will be processed
                            by our AI system and a preliminary estimate will be generated within 24 hours.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
                  currentStep === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <ChevronLeft size={20} />
                Previous
              </button>

              <div className="flex gap-3">
                {currentStep < 4 ? (
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-3 bg-stellar-orange text-white rounded-lg font-medium hover:bg-red-600 transition"
                  >
                    Next
                    <ChevronRight size={20} />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-8 py-3 bg-stellar-orange text-white rounded-lg font-medium hover:bg-red-600 transition disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        Submit Inspection
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}