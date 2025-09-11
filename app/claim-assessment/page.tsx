'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, Building2, Camera, Upload, FileText, CheckCircle, 
  ArrowRight, ArrowLeft, AlertTriangle, Droplets, Flame, 
  Shield, CloudRain, Palette, Briefcase, MapPin, Phone,
  Mail, User, FileImage, X, Loader2, Check, ChevronRight,
  Info, Download, Calendar, Clock, ChevronDown
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useLoadScript, Autocomplete } from '@react-google-maps/api'

type PropertyType = 'residential' | 'commercial' | null
type DamageType = {
  id: string
  name: string
  icon: any
  color: string
}

type PhotoArea = {
  id: string
  name: string
  required: boolean
  photos: File[]
  completed: boolean
}

// Move libraries outside component to prevent re-creation
const GOOGLE_MAPS_LIBRARIES: ("places")[] = ["places"]

// Move damage types outside component to prevent re-creation
const DAMAGE_TYPES = [
  { id: 'hurricane', name: 'Hurricane Damage', icon: AlertTriangle, color: 'text-orange-500' },
  { id: 'water', name: 'Water Damage', icon: Droplets, color: 'text-blue-500' },
  { id: 'fire', name: 'Fire Damage', icon: Flame, color: 'text-red-500' },
  { id: 'vandalism', name: 'Vandalism', icon: Shield, color: 'text-purple-500' },
  { id: 'roof', name: 'Roof Damage', icon: Home, color: 'text-gray-600' },
  { id: 'flood', name: 'Flood Damage', icon: CloudRain, color: 'text-cyan-500' },
  { id: 'mold', name: 'Mold Damage', icon: Palette, color: 'text-green-600' },
  { id: 'business', name: 'Loss of Business Income', icon: Briefcase, color: 'text-indigo-500' }
]

// Move area constants outside component
const RESIDENTIAL_AREAS = [
  { id: 'exterior', name: 'Exterior', required: true },
  { id: 'roof', name: 'Roof/Attic', required: true },
  { id: 'living', name: 'Living Room', required: false },
  { id: 'kitchen', name: 'Kitchen', required: false },
  { id: 'bedrooms', name: 'Bedrooms', required: false },
  { id: 'bathrooms', name: 'Bathrooms', required: false },
  { id: 'garage', name: 'Garage', required: false },
  { id: 'basement', name: 'Basement', required: false }
]

const COMMERCIAL_AREAS = [
  { id: 'exterior', name: 'Building Exterior', required: true },
  { id: 'roof', name: 'Roof/HVAC', required: true },
  { id: 'storefront', name: 'Storefront', required: false },
  { id: 'interior', name: 'Interior Spaces', required: false },
  { id: 'inventory', name: 'Inventory/Equipment', required: false },
  { id: 'office', name: 'Office Areas', required: false },
  { id: 'warehouse', name: 'Warehouse/Storage', required: false },
  { id: 'parking', name: 'Parking Area', required: false }
]

export default function ClaimAssessmentPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [propertyType, setPropertyType] = useState<PropertyType>(null)
  const [selectedDamages, setSelectedDamages] = useState<string[]>([])
  const [propertyAddress, setPropertyAddress] = useState('')
  const [damageDescription, setDamageDescription] = useState('')
  const [policyFile, setPolicyFile] = useState<File | null>(null)
  const [photoAreas, setPhotoAreas] = useState<PhotoArea[]>([])
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: '',
    preferredContact: 'email',
    insuranceCompany: ''
  })
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [claimId, setClaimId] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const policyInputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  // Load Google Maps Script only if API key is available
  const hasGoogleMapsKey = !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'dummy-key',
    libraries: GOOGLE_MAPS_LIBRARIES,
    ...(hasGoogleMapsKey ? {} : { preventGoogleFontsLoading: true })
  })

  // Handle place selection
  const onLoad = useCallback((autocompleteInstance: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocompleteInstance
  }, [])

  const onPlaceChanged = useCallback(() => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace()
      if (place.formatted_address) {
        setPropertyAddress(place.formatted_address)
      }
    }
  }, [])

  // Auto-start analysis when reaching step 5
  useEffect(() => {
    const startAnalysis = async () => {
      if (currentStep === 5 && !analysisComplete && !isProcessing) {
        setIsProcessing(true)
        // Simulate AI analysis
        await new Promise(resolve => setTimeout(resolve, 3000))
        setAnalysisComplete(true)
        
        // Generate structured claim ID with date, property type, and preliminary estimate
        const today = new Date()
        const dateStr = today.toISOString().split('T')[0].replace(/-/g, '') // YYYYMMDD
        const propertyCode = propertyType === 'residential' ? 'RES' : 'COM'
        const estimateAmount = selectedDamages.length * 15000 + Math.floor(Math.random() * 20000) + 25000
        const randomId = Date.now().toString(36).toUpperCase().slice(-4)
        
        setClaimId(`CL-${dateStr}-${propertyCode}-${estimateAmount}-${randomId}`)
        setIsProcessing(false)
      }
    }
    
    startAnalysis()
  }, [currentStep, analysisComplete, isProcessing, propertyType, selectedDamages])

  const initializePhotoAreas = (type: PropertyType) => {
    const areas = type === 'residential' ? RESIDENTIAL_AREAS : COMMERCIAL_AREAS
    setPhotoAreas(areas.map(area => ({
      ...area,
      photos: [],
      completed: false
    })))
  }

  const handlePropertyTypeSelect = (type: PropertyType) => {
    setPropertyType(type)
    if (type) {
      initializePhotoAreas(type)
    }
  }

  const toggleDamageType = (damageId: string) => {
    setSelectedDamages(prev => 
      prev.includes(damageId) 
        ? prev.filter(id => id !== damageId)
        : [...prev, damageId]
    )
  }

  const handlePhotoUpload = (areaId: string, files: FileList | null, inputElement?: HTMLInputElement) => {
    if (!files) return
    
    const filesArray = Array.from(files)
    console.log(`Uploading ${filesArray.length} files to area ${areaId}`)
    
    setPhotoAreas(prev => prev.map(area => {
      if (area.id === areaId) {
        const newPhotos = [...area.photos, ...filesArray]
        console.log(`Area ${areaId} now has ${newPhotos.length} photos`)
        return {
          ...area,
          photos: newPhotos,
          completed: newPhotos.length > 0
        }
      }
      return area
    }))
    
    // Clear the input so the same files can be selected again if needed
    if (inputElement) {
      inputElement.value = ''
    }
  }

  const removePhoto = (areaId: string, photoIndex: number) => {
    setPhotoAreas(prev => prev.map(area => {
      if (area.id === areaId) {
        const newPhotos = area.photos.filter((_, index) => index !== photoIndex)
        return {
          ...area,
          photos: newPhotos,
          completed: newPhotos.length > 0
        }
      }
      return area
    }))
  }

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return contactInfo.name && contactInfo.email && contactInfo.phone && contactInfo.insuranceCompany
      case 2:
        return propertyType && selectedDamages.length > 0 && propertyAddress
      case 3:
        return photoAreas.filter(area => area.required).every(area => area.completed)
      case 4:
        return policyFile !== null
      case 5:
        return true
      default:
        return false
    }
  }

  const handleNextStep = async () => {
    if (!canProceedToNextStep()) return
    
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      // Reset analysis if going back from step 5
      if (currentStep === 5) {
        setAnalysisComplete(false)
        setIsProcessing(false)
        setClaimId('')
      }
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmitClaim = async () => {
    setIsProcessing(true)
    // Simulate API submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsProcessing(false)
    setCurrentStep(6) // Success page
  }

  // Drag and drop handlers for policy upload
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      // Check file type
      const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png']
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
      if (allowedTypes.includes(fileExtension)) {
        setPolicyFile(file)
      }
    }
  }

  const progressPercentage = (currentStep / 5) * 100

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <nav className="fixed top-0 w-full bg-white backdrop-blur-md z-50 border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <Image 
                src="/images/stellar_logo.png" 
                alt="Stellar Adjusting" 
                width={120} 
                height={34}
                priority
                className="object-contain"
              />
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Need help?</span>
              <a href="tel:(888) 311-5312" className="text-stellar-orange font-medium">
                (888) 311-5312
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-28 px-6 pb-8">
        <div className="container mx-auto max-w-4xl">
          {/* Progress Bar */}
          {currentStep <= 5 && (
            <div className="mb-8 mt-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-gray-600">
                  Step {currentStep} of 5
                </h2>
                <span className="text-sm text-gray-600">
                  {progressPercentage.toFixed(0)}% Complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div 
                  className="bg-stellar-orange h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step 1: Contact Information - Lead Capture */}
              {currentStep === 1 && (
                <div className="bg-white rounded-3xl shadow-xl p-8">
                  <h1 className="text-3xl font-bold text-stellar-dark mb-4">
                    Get Your Preliminary Assessment
                  </h1>
                  <p className="text-gray-600 mb-2">
                    Upload photos for instant AI-powered classification, detailed damage assessment, and settlement recommendations - all in one seamless workflow.
                  </p>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-8">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 rounded-full p-2">
                        <CheckCircle className="text-green-600" size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-green-800">Find out exactly how much you're owed in under 5 minutes!</p>
                        <p className="text-green-600 text-sm">Our breakthrough AI technology uncovers hidden coverage worth thousands that others miss</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                          type="text"
                          value={contactInfo.name}
                          onChange={(e) => setContactInfo({...contactInfo, name: e.target.value})}
                          placeholder="John Smith"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stellar-orange focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Email and Phone - Side by side on desktop, stacked on mobile */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                          <input
                            type="email"
                            value={contactInfo.email}
                            onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                            placeholder="john@example.com"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stellar-orange focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
                          <input
                            type="tel"
                            value={contactInfo.phone}
                            onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                            placeholder="(555) 123-4567"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stellar-orange focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Insurance Company Dropdown */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Insurance Company
                      </label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-3 text-gray-400" size={20} />
                        <select
                          value={contactInfo.insuranceCompany}
                          onChange={(e) => setContactInfo({...contactInfo, insuranceCompany: e.target.value})}
                          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stellar-orange focus:border-transparent appearance-none bg-white"
                        >
                          <option value="">Select your insurance company</option>
                          <option value="All State Insurance Company">All State Insurance Company</option>
                          <option value="American Security Group">American Security Group</option>
                          <option value="American Strategic Insurance (ASI)">American Strategic Insurance (ASI)</option>
                          <option value="Argus Fire & Casualty">Argus Fire & Casualty</option>
                          <option value="Century Insurance">Century Insurance</option>
                          <option value="Chubb Insurance">Chubb Insurance</option>
                          <option value="Citizens Property Insurance">Citizens Property Insurance</option>
                          <option value="Cypress Property & Casualty">Cypress Property & Casualty</option>
                          <option value="Federated National Insurance">Federated National Insurance</option>
                          <option value="Florida Peninsula">Florida Peninsula</option>
                          <option value="Florida Family Insurance">Florida Family Insurance</option>
                          <option value="Florida Peninsula Insurance">Florida Peninsula Insurance</option>
                          <option value="Florida Select Insurance">Florida Select Insurance</option>
                          <option value="Geek Insurance">Geek Insurance</option>
                          <option value="Geovera Specialty Insurance">Geovera Specialty Insurance</option>
                          <option value="Great American Insurance">Great American Insurance</option>
                          <option value="Gulfstream Property & Casualty Insurance">Gulfstream Property & Casualty Insurance</option>
                          <option value="Homeowners Choice">Homeowners Choice</option>
                          <option value="Lloyd's of London">Lloyd's of London</option>
                          <option value="Nationwide Insurance">Nationwide Insurance</option>
                          <option value="Scottsdale Insurance Company">Scottsdale Insurance Company</option>
                          <option value="Security First Insurance">Security First Insurance</option>
                          <option value="Southern Fidelity Insurance">Southern Fidelity Insurance</option>
                          <option value="Southern Oak Insurance">Southern Oak Insurance</option>
                          <option value="Southern Fidelity Insurance">Southern Fidelity Insurance</option>
                          <option value="St. Johns Insurance">St. Johns Insurance</option>
                          <option value="State Farm Insurance">State Farm Insurance</option>
                          <option value="Sunshine State Insurance Company">Sunshine State Insurance Company</option>
                          <option value="Tower Hill">Tower Hill</option>
                          <option value="United Property Insurance">United Property Insurance</option>
                          <option value="Universal Property & Casual Insurance">Universal Property & Casual Insurance</option>
                          <option value="Other">Other</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={20} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Preferred Contact Method
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {['email', 'phone', 'text'].map((method) => (
                          <button
                            key={method}
                            onClick={() => setContactInfo({...contactInfo, preferredContact: method})}
                            className={`py-2 px-4 rounded-lg border-2 capitalize transition ${
                              contactInfo.preferredContact === method
                                ? 'border-stellar-orange bg-stellar-orange/5 text-stellar-orange'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {method}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Property Type & Damage Selection */}
              {currentStep === 2 && (
                <div className="bg-white rounded-3xl shadow-xl p-8">
                  <h1 className="text-3xl font-bold text-stellar-dark mb-4">
                    Tell Us About Your Property
                  </h1>
                  <p className="text-gray-600 mb-8">
                    Let's start by understanding your property type and the damages you've experienced.
                  </p>

                  {/* Property Type Selection */}
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Property Type
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => handlePropertyTypeSelect('residential')}
                        className={`p-6 rounded-xl border-2 transition ${
                          propertyType === 'residential'
                            ? 'border-stellar-orange bg-stellar-orange/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Home className={`mx-auto mb-3 ${
                          propertyType === 'residential' ? 'text-stellar-orange' : 'text-gray-400'
                        }`} size={40} />
                        <h3 className="font-semibold text-gray-900">Residential</h3>
                        <p className="text-sm text-gray-600 mt-1">Single family home, condo, or apartment</p>
                      </button>
                      <button
                        onClick={() => handlePropertyTypeSelect('commercial')}
                        className={`p-6 rounded-xl border-2 transition ${
                          propertyType === 'commercial'
                            ? 'border-stellar-orange bg-stellar-orange/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Building2 className={`mx-auto mb-3 ${
                          propertyType === 'commercial' ? 'text-stellar-orange' : 'text-gray-400'
                        }`} size={40} />
                        <h3 className="font-semibold text-gray-900">Commercial</h3>
                        <p className="text-sm text-gray-600 mt-1">Office, retail, warehouse, or industrial</p>
                      </button>
                    </div>
                  </div>

                  {/* Property Address */}
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 text-gray-400 z-10" size={20} />
                      {isLoaded && hasGoogleMapsKey ? (
                        <Autocomplete
                          onLoad={onLoad}
                          onPlaceChanged={onPlaceChanged}
                          options={{
                            types: ['address'],
                            componentRestrictions: { country: 'us' }
                          }}
                        >
                          <input
                            type="text"
                            value={propertyAddress}
                            onChange={(e) => setPropertyAddress(e.target.value)}
                            placeholder="Start typing your property address..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stellar-orange focus:border-transparent"
                          />
                        </Autocomplete>
                      ) : (
                        <input
                          type="text"
                          value={propertyAddress}
                          onChange={(e) => setPropertyAddress(e.target.value)}
                          placeholder="Enter your property address"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stellar-orange focus:border-transparent"
                        />
                      )}
                    </div>
                    {loadError && (
                      <p className="text-xs text-red-500 mt-1">
                        Address autocomplete is temporarily unavailable
                      </p>
                    )}
                  </div>

                  {/* Damage Type Selection */}
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Type of Damage (Select all that apply)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {DAMAGE_TYPES.map((damage) => (
                        <button
                          key={damage.id}
                          onClick={() => toggleDamageType(damage.id)}
                          className={`p-4 rounded-lg border-2 transition ${
                            selectedDamages.includes(damage.id)
                              ? 'border-stellar-orange bg-stellar-orange/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <damage.icon className={`mx-auto mb-2 ${
                            selectedDamages.includes(damage.id) ? damage.color : 'text-gray-400'
                          }`} size={24} />
                          <p className="text-sm font-medium text-gray-900">{damage.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Damage Description */}
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brief Description (Optional)
                    </label>
                    <textarea
                      value={damageDescription}
                      onChange={(e) => setDamageDescription(e.target.value)}
                      placeholder="Describe the damage and when it occurred..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stellar-orange focus:border-transparent"
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Photo Capture */}
              {currentStep === 3 && (
                <div className="bg-white rounded-3xl shadow-xl p-8">
                  <h1 className="text-3xl font-bold text-stellar-dark mb-4">
                    Capture Damage Photos
                  </h1>
                  <p className="text-gray-600 mb-8">
                    Take or upload photos of the damaged areas. This helps us assess the extent of damage accurately.
                  </p>

                  <div className="space-y-4">
                    {photoAreas.map((area) => (
                      <div key={area.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-900">{area.name}</h3>
                            {area.required && (
                              <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                                Required
                              </span>
                            )}
                            {area.completed && (
                              <CheckCircle className="text-green-500" size={20} />
                            )}
                          </div>
                          <span className="text-sm text-gray-500">
                            {area.photos.length} photo{area.photos.length !== 1 ? 's' : ''}
                          </span>
                        </div>

                        {/* Photo Grid */}
                        {area.photos.length > 0 && (
                          <div className="grid grid-cols-3 gap-2 mb-3">
                            {area.photos.map((photo, index) => (
                              <div key={index} className="relative group">
                                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                  <img
                                    src={URL.createObjectURL(photo)}
                                    alt={`${area.name} photo ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <button
                                  onClick={() => removePhoto(area.id, index)}
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Upload Button */}
                        <input
                          type="file"
                          id={`file-${area.id}`}
                          multiple
                          accept="image/*"
                          onChange={(e) => {
                            handlePhotoUpload(area.id, e.target.files, e.target)
                          }}
                          className="hidden"
                        />
                        <label
                          htmlFor={`file-${area.id}`}
                          className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg cursor-pointer transition"
                        >
                          <Camera size={20} className="text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">
                            {area.photos.length === 0 ? 'Add Photos' : 'Add More Photos'}
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Photo Tips:</p>
                        <ul className="space-y-1">
                          <li>• Upload multiple photos per area (select multiple files at once)</li>
                          <li>• Take photos in good lighting</li>
                          <li>• Capture multiple angles of damage</li>
                          <li>• Include close-ups and wide shots</li>
                          <li>• Show the full extent of affected areas</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Policy Upload */}
              {currentStep === 4 && (
                <div className="bg-white rounded-3xl shadow-xl p-8">
                  <h1 className="text-3xl font-bold text-stellar-dark mb-4">
                    Upload Your Insurance Policy
                  </h1>
                  <p className="text-gray-600 mb-8">
                    Upload your policy document so we can match your coverage and maximize your claim.
                  </p>

                  <div className="mb-8">
                    {!policyFile ? (
                      <>
                        <input
                          ref={policyInputRef}
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => setPolicyFile(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                        <div
                          onDragEnter={handleDragEnter}
                          onDragLeave={handleDragLeave}
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                          className={`w-full border-2 border-dashed rounded-xl p-12 transition-all duration-200 ${
                            isDragOver 
                              ? 'border-stellar-orange bg-stellar-orange/5 ring-2 ring-stellar-orange/20' 
                              : 'border-gray-300 hover:border-stellar-orange hover:bg-gray-50'
                          }`}
                        >
                          <button
                            onClick={() => policyInputRef.current?.click()}
                            className="w-full flex flex-col items-center gap-4 cursor-pointer"
                          >
                            <Upload className={`transition-colors ${
                              isDragOver ? 'text-stellar-orange' : 'text-gray-400 hover:text-stellar-orange'
                            }`} size={48} />
                            <div className="text-center">
                              <p className={`text-lg font-medium transition-colors ${
                                isDragOver ? 'text-stellar-orange' : 'text-gray-700'
                              }`}>
                                {isDragOver ? 'Drop your file here' : 'Upload Policy Document'}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                {isDragOver ? 'Release to upload' : 'Click to browse or drag and drop • PDF, JPG, or PNG (Max 10MB)'}
                              </p>
                            </div>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="text-green-600" size={32} />
                            <div>
                              <p className="font-medium text-gray-900">{policyFile.name}</p>
                              <p className="text-sm text-gray-600">
                                {(policyFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setPolicyFile(null)}
                            className="text-red-500 hover:text-red-600 transition"
                          >
                            <X size={24} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Shield className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Your Privacy is Protected</p>
                        <p>Your policy information is encrypted and only used to analyze your coverage. We never share your data with third parties without your consent.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: AI Analysis */}
              {currentStep === 5 && (
                <div className="bg-white rounded-3xl shadow-xl p-8">
                  {!analysisComplete ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-stellar-orange mx-auto mb-6" />
                      <h2 className="text-2xl font-bold text-stellar-dark mb-4">
                        Analyzing Your Claim...
                      </h2>
                      <div className="max-w-md mx-auto space-y-3">
                        <div className="flex items-center gap-3">
                          <Loader2 className="animate-spin text-stellar-orange" size={20} />
                          <span className="text-gray-600">Detecting damage patterns...</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Loader2 className="animate-spin text-stellar-orange" size={20} />
                          <span className="text-gray-600">Matching policy coverage...</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Loader2 className="animate-spin text-stellar-orange" size={20} />
                          <span className="text-gray-600">Calculating repair estimates...</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-3">
                          Your Preliminary Insurance Assessment
                        </h1>
                        <p className="text-xl text-gray-600 mb-4">
                          Our breakthrough AI has uncovered significant hidden opportunities in your claim
                        </p>
                        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                          <CheckCircle size={16} />
                          Analysis Complete - Review Your Findings Below
                        </div>
                      </div>

                      {/* Claim ID */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 opacity-0 animate-fadeInSlide" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-blue-600">Claim Reference Number</p>
                            <p className="text-xl font-bold text-blue-900">{claimId}</p>
                          </div>
                          <CheckCircle className="text-blue-600" size={32} />
                        </div>
                      </div>

                      {/* Detected Damages */}
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Detected Damages</h3>
                        <div className="space-y-3">
                          {selectedDamages.map((damageId, index) => {
                            const damage = DAMAGE_TYPES.find(d => d.id === damageId)
                            if (!damage) return null
                            
                            // Generate realistic damage details
                            const severityLevels = ['Minor', 'Moderate', 'Significant', 'Severe']
                            const severity = severityLevels[Math.min(index + 1, severityLevels.length - 1)]
                            
                            // Generate damage-specific details
                            const damageDetails = {
                              'water': ['Multiple rooms affected', '2-3 areas with standing water', 'Potential structural impact'],
                              'fire': ['Smoke damage detected', 'Heat damage to materials', 'Electrical systems affected'],
                              'hurricane': ['Wind damage to exterior', 'Missing roof materials', 'Window/door damage'],
                              'roof': ['Multiple leak points', 'Missing shingles detected', 'Gutter damage'],
                              'flood': ['Foundation water damage', 'Flooring replacement needed', 'Wall moisture detected'],
                              'mold': ['Multiple growth areas', 'Air quality concerns', 'Remediation required'],
                              'vandalism': ['Property damage assessed', 'Security concerns noted', 'Repair estimates prepared'],
                              'business': ['Income loss calculated', 'Operating expenses affected', 'Recovery timeline estimated']
                            }
                            
                            const details = damageDetails[damageId] || ['Damage assessment complete', 'Impact evaluation done', 'Repair planning initiated']
                            
                            return (
                              <div 
                                key={damageId} 
                                className="border border-gray-200 rounded-lg p-4 bg-white opacity-0 animate-fadeInSlide"
                                style={{ 
                                  animationDelay: `${index * 200}ms`,
                                  animationFillMode: 'forwards'
                                }}
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <damage.icon className="text-gray-600" size={20} />
                                    <span className="font-semibold text-lg">{damage.name}</span>
                                  </div>
                                  <span className="text-sm text-gray-500">
                                    {severity}
                                  </span>
                                </div>
                                <div className="space-y-1">
                                  {details.map((detail, detailIndex) => (
                                    <div 
                                      key={detailIndex} 
                                      className="flex items-center gap-2 text-sm text-gray-600 opacity-0 animate-fadeInSlide"
                                      style={{ 
                                        animationDelay: `${(index * 200) + (detailIndex * 100) + 300}ms`,
                                        animationFillMode: 'forwards'
                                      }}
                                    >
                                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                                      {detail}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Preliminary Estimate */}
                      <div className="mb-8 opacity-0 animate-fadeInSlide" style={{ animationDelay: `${(selectedDamages.length * 200) + 500}ms`, animationFillMode: 'forwards' }}>
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Preliminary Settlement Estimate</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="text-center">
                              <p className="text-sm font-medium text-gray-600 mb-2">AI Estimated Repairs</p>
                              <p className="text-4xl font-bold text-gray-900 mb-1">
                                ${(selectedDamages.length * 15000 + Math.floor(Math.random() * 20000) + 25000).toLocaleString()}
                              </p>
                              <p className="text-sm text-gray-500">Based on damage analysis</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium text-gray-600 mb-2">Potential Insurance Payout</p>
                              <p className="text-4xl font-bold text-stellar-orange mb-1">
                                ${(selectedDamages.length * 15000 + Math.floor(Math.random() * 20000) + 25000 - 2500).toLocaleString()}
                              </p>
                              <p className="text-sm text-gray-500">After deductible</p>
                            </div>
                          </div>
                          <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
                            <p className="text-sm text-gray-600 text-center">
                              <strong>Important:</strong> This is a preliminary estimate. Our experts typically uncover 
                              <span className="font-bold text-stellar-orange"> 15-35% more in additional coverage </span> 
                               during professional assessment.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Additional Settlement Opportunities */}
                      <div className="mb-8 opacity-0 animate-fadeInSlide" style={{ animationDelay: `${(selectedDamages.length * 200) + 1000}ms`, animationFillMode: 'forwards' }}>
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                          <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                              Additional Settlement Opportunities Identified
                            </h3>
                            <p className="text-lg text-gray-700 mb-4">
                              Our analysis has uncovered potential coverage areas that may increase your settlement value
                            </p>
                            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-6 py-3 rounded-full font-semibold text-lg">
                              <Info size={20} />
                              Potential Additional Recovery: <span className="text-xl text-stellar-orange">$12,000 - $35,000</span>
                            </div>
                          </div>

                          <div className="grid gap-4 mb-6">
                            <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500 opacity-0 animate-fadeInSlide" style={{ animationDelay: `${(selectedDamages.length * 200) + 1200}ms`, animationFillMode: 'forwards' }}>
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                  <Home className="text-blue-600" size={20} />
                                  <h4 className="font-bold text-gray-900">Additional Living Expenses</h4>
                                </div>
                                <span className="text-lg font-bold text-stellar-orange">$15,000-$18,000</span>
                              </div>
                              <p className="text-sm text-gray-600">
                                Temporary housing, meals, and storage costs during repairs. This coverage is often overlooked in initial assessments.
                              </p>
                            </div>
                            
                            <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500 opacity-0 animate-fadeInSlide" style={{ animationDelay: `${(selectedDamages.length * 200) + 1400}ms`, animationFillMode: 'forwards' }}>
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                  <Shield className="text-blue-600" size={20} />
                                  <h4 className="font-bold text-gray-900">Code Upgrade Coverage</h4>
                                </div>
                                <span className="text-lg font-bold text-stellar-orange">$8,000-$22,000</span>
                              </div>
                              <p className="text-sm text-gray-600">
                                Required building code upgrades during repairs. These improvements are typically covered under your policy.
                              </p>
                            </div>
                            
                            <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500 opacity-0 animate-fadeInSlide" style={{ animationDelay: `${(selectedDamages.length * 200) + 1600}ms`, animationFillMode: 'forwards' }}>
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                  <ArrowRight className="text-blue-600" size={20} />
                                  <h4 className="font-bold text-gray-900">Depreciation Recovery</h4>
                                </div>
                                <span className="text-lg font-bold text-stellar-orange">$5,000-$15,000</span>
                              </div>
                              <p className="text-sm text-gray-600">
                                Recovery of depreciation withholds upon completion of repairs. Ensures full replacement cost coverage.
                              </p>
                            </div>
                          </div>

                          <div className="bg-gray-900 rounded-xl p-6 text-center opacity-0 animate-fadeInSlide" style={{ animationDelay: `${(selectedDamages.length * 200) + 1800}ms`, animationFillMode: 'forwards' }}>
                            <div className="flex items-center justify-center gap-2 mb-3">
                              <Clock className="text-white" size={24} />
                              <h4 className="text-xl font-bold text-white">
                                Professional Assessment Required
                              </h4>
                            </div>
                            <p className="text-gray-300 mb-4">
                              These opportunities require expert documentation and proper claim filing procedures. Time-sensitive coverage provisions apply.
                            </p>
                            <button
                              onClick={handleSubmitClaim}
                              disabled={isProcessing}
                              className="bg-stellar-orange text-white font-bold text-xl py-4 px-6 rounded-lg mb-4 hover:bg-red-600 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isProcessing ? 'Submitting...' : 'Schedule Your Expert Consultation'}
                            </button>
                            <p className="text-gray-300 font-medium">
                              Our certified public adjusters will ensure you receive the maximum settlement allowable under your policy.
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}


              {/* Step 6: Success */}
              {currentStep === 6 && (
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="text-green-600" size={40} />
                  </div>
                  <h1 className="text-3xl font-bold text-stellar-dark mb-4">
                    Claim Submitted Successfully!
                  </h1>
                  <p className="text-gray-600 mb-2">
                    Your claim reference number is:
                  </p>
                  <p className="text-2xl font-bold text-stellar-orange mb-6">{claimId}</p>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    We've received your claim and our team is already reviewing it. You'll receive a confirmation email shortly with next steps.
                  </p>

                  <div className="bg-gray-50 rounded-lg p-6 mb-8 max-w-md mx-auto">
                    <h3 className="font-semibold text-gray-900 mb-3">What to Expect:</h3>
                    <div className="space-y-3 text-left">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-stellar-orange/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-stellar-orange">1</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Within 1 Hour</p>
                          <p className="text-sm text-gray-600">Confirmation email with claim details</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-stellar-orange/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-stellar-orange">2</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Within 24 Hours</p>
                          <p className="text-sm text-gray-600">Personal call from your adjuster</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-stellar-orange/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-stellar-orange">3</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Within 48 Hours</p>
                          <p className="text-sm text-gray-600">Scheduled inspection (if needed)</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                      href="/dashboard"
                      className="px-6 py-3 bg-stellar-orange text-white rounded-lg font-semibold hover:bg-red-600 transition cursor-pointer inline-block"
                    >
                      Track Claim
                    </Link>
                    <Link
                      href="/"
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition"
                    >
                      Return to Home
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          {currentStep <= 5 && (
            <div className="flex justify-between mt-8">
              <button
                onClick={handlePreviousStep}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
                  currentStep === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <ArrowLeft size={20} />
                Previous
              </button>

              {currentStep < 5 ? (
                <button
                  onClick={handleNextStep}
                  disabled={!canProceedToNextStep() || isProcessing}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
                    canProceedToNextStep() && !isProcessing
                      ? 'bg-stellar-orange text-white hover:bg-red-600 cursor-pointer'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Next
                  <ArrowRight size={20} />
                </button>
              ) : (
                <button
                  onClick={handleSubmitClaim}
                  disabled={!canProceedToNextStep() || isProcessing}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
                    canProceedToNextStep() && !isProcessing
                      ? 'bg-stellar-orange text-white hover:bg-red-600 cursor-pointer'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Claim
                      <Check size={20} />
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}