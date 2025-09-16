'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { 
  ArrowLeft, ArrowRight, Home, Building2, MapPin, User, 
  Calendar, FileText, Camera, Brain, ChevronRight, Save,
  Edit2, Check, X
} from 'lucide-react'
import Link from 'next/link'

interface ClaimData {
  claimId: string
  claimNumber: string
  property: {
    address: string
    city: string
    state: string
    zipCode: string
    type: 'residential' | 'commercial'
    yearBuilt: string
    squareFootage: string
    numberOfStories: string
  }
  owner: {
    name: string
    phone: string
    email: string
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
    estimatedValue?: number
  }
}

interface InspectionSetup {
  inspector: string
  scheduledDate: string
  scheduledTime: string
  inspectionFocus: string[]
  specialInstructions: string
  priorityAreas: string[]
}

const DAMAGE_TYPES = [
  'Hurricane', 'Wind', 'Water', 'Fire', 'Flood', 'Hail', 'Lightning', 'Tree Fall', 'Vandalism', 'Theft'
]

export default function InspectionStartPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const inspectionId = params.id as string
  const isNewInspection = searchParams.get('new') === 'true'

  const [claimData, setClaimData] = useState<ClaimData | null>(null)
  const [inspectionSetup, setInspectionSetup] = useState<InspectionSetup>({
    inspector: 'James Rodriguez',
    scheduledDate: '',
    scheduledTime: '',
    inspectionFocus: [],
    specialInstructions: '',
    priorityAreas: []
  })

  const [historicalData, setHistoricalData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editedClaimData, setEditedClaimData] = useState<ClaimData | null>(null)

  // Load claim data on component mount
  useEffect(() => {
    loadClaimData()
  }, [inspectionId])

  const loadClaimData = async () => {
    setIsLoading(true)
    
    // Check if this is a new inspection from the form
    if (isNewInspection) {
      // Load data from localStorage (saved by the new inspection form)
      const savedData = localStorage.getItem(`inspection-${inspectionId}`)
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        const claimData: ClaimData = {
          claimId: `CLM-${Date.now()}`,
          claimNumber: `CLM-${Date.now()}`,
          property: parsedData.property,
          owner: parsedData.owner,
          insurance: parsedData.insurance,
          incident: {
            ...parsedData.incident,
            estimatedValue: parsedData.incident.estimatedValue 
              ? parseInt(parsedData.incident.estimatedValue.replace(/,/g, '')) 
              : undefined
          }
        }
        setClaimData(claimData)
        setEditedClaimData(claimData)
        setIsLoading(false)
        fetchHistoricalData(claimData.property.address)
        return
      }
    }
    
    // Otherwise, load existing claim data
    setTimeout(() => {
      const mockClaimData: ClaimData = {
        claimId: 'CLM-2024-001',
        claimNumber: 'CLM-2024-001',
        property: {
          address: '1234 Ocean Drive',
          city: 'Miami Beach',
          state: 'FL',
          zipCode: '33101',
          type: 'residential',
          yearBuilt: '2005',
          squareFootage: '2,400',
          numberOfStories: '2'
        },
        owner: {
          name: 'Johnson Properties LLC',
          phone: '(305) 123-4567',
          email: 'contact@johnsonproperties.com'
        },
        insurance: {
          company: 'State Farm',
          policyNumber: 'POL-123456789',
          adjusterName: 'Michael Thompson',
          adjusterPhone: '(305) 987-6543'
        },
        incident: {
          dateOfLoss: '2024-03-15',
          damageTypes: ['Hurricane', 'Water', 'Wind'],
          initialDescription: 'Hurricane damage with significant water intrusion and wind damage to roof and exterior.',
          estimatedValue: 165000
        }
      }
      setClaimData(mockClaimData)
      setEditedClaimData(mockClaimData)
      setIsLoading(false)
      fetchHistoricalData(mockClaimData.property.address)
    }, 1000)
  }

  const updateInspectionField = (field: keyof InspectionSetup, value: any) => {
    setInspectionSetup(prev => ({ ...prev, [field]: value }))
  }

  const toggleInspectionFocus = (focus: string) => {
    const newFocus = inspectionSetup.inspectionFocus.includes(focus)
      ? inspectionSetup.inspectionFocus.filter(f => f !== focus)
      : [...inspectionSetup.inspectionFocus, focus]
    updateInspectionField('inspectionFocus', newFocus)
  }

  const togglePriorityArea = (area: string) => {
    const newAreas = inspectionSetup.priorityAreas.includes(area)
      ? inspectionSetup.priorityAreas.filter(a => a !== area)
      : [...inspectionSetup.priorityAreas, area]
    updateInspectionField('priorityAreas', newAreas)
  }

  const fetchHistoricalData = async (address: string) => {
    if (!address) return
    
    setIsLoading(true)
    // Mock API call - in production, this would fetch historical claims data
    setTimeout(() => {
      setHistoricalData({
        previousClaims: [
          {
            date: '2022-09-28',
            type: 'Hurricane Ian',
            settlement: '$45,000',
            status: 'Potentially underpaid by $18,000'
          },
          {
            date: '2021-07-15', 
            type: 'Water Damage',
            settlement: '$8,500',
            status: 'Reopening opportunity available'
          }
        ],
        neighborhoodPatterns: [
          'Similar properties in area received 35% higher settlements',
          'Common missed damages: HVAC contamination, hidden mold',
          'Average wind damage claims: $65,000-$85,000'
        ]
      })
      setIsLoading(false)
    }, 1500)
  }

  const handleSave = async () => {
    setIsSaving(true)
    if (isEditMode && editedClaimData) {
      setClaimData(editedClaimData)
      setIsEditMode(false)
    }
    // Save inspection data
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  const handleEdit = () => {
    setIsEditMode(true)
    setEditedClaimData(claimData)
  }

  const handleCancelEdit = () => {
    setIsEditMode(false)
    setEditedClaimData(claimData)
  }

  const updateEditedField = (section: keyof ClaimData, field: string, value: any) => {
    if (!editedClaimData) return
    setEditedClaimData(prev => ({
      ...prev!,
      [section]: {
        ...(typeof prev![section] === 'object' && prev![section] !== null ? prev![section] : {}),
        [field]: value
      } as any
    }))
  }

  const handleStartInspection = () => {
    // Navigate to first area based on property type
    const firstArea = claimData?.property.type === 'residential' 
      ? 'exterior-roof' 
      : 'exterior-building'
    router.push(`/dashboard/inspection/${inspectionId}/area/${firstArea}`)
  }

  const isFormValid = claimData && inspectionSetup.scheduledDate && inspectionSetup.scheduledTime

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Mobile Optimized */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div>
            <Link
              href="/dashboard/inspection"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-3"
            >
              <ArrowLeft className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
              <span>Back to Inspections</span>
            </Link>
            <div className="flex items-center justify-between">
              <h1 className="text-lg sm:text-xl lg:text-3xl font-semibold text-gray-900">
                Inspection Setup - {inspectionId}
              </h1>
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {!isEditMode ? (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-gray-700 hover:text-gray-900 cursor-pointer"
                >
                  <Edit2 className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-1 px-2 sm:px-3 py-2 text-gray-600 hover:text-gray-900 cursor-pointer"
                  >
                    <X className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                    <span className="hidden sm:inline">Cancel</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-[#E74C3C] text-white rounded-lg hover:bg-[#D73929] cursor-pointer text-sm sm:text-base"
                  >
                    <Check className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </>
              )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-First Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Content - Mobile Optimized */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Loading State */}
            {isLoading && !claimData && (
              <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-6 sm:p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
                <p className="text-gray-600 text-sm sm:text-base">Loading claim information...</p>
              </div>
            )}

            {/* Claim Overview */}
            {claimData && (
              <>
                <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6" data-testid="claim-information">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-stellar-orange/10 rounded-lg">
                      <FileText className="text-stellar-orange" size={20} />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Claim Information</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <h3 className="font-medium text-gray-700 mb-3">Property Details</h3>
                      {!isEditMode ? (
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            {claimData.property.type === 'residential' ? (
                              <Home size={16} className="text-gray-400" />
                            ) : (
                              <Building2 size={16} className="text-gray-400" />
                            )}
                            <span className="capitalize">{claimData.property.type}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-gray-400" />
                            <span>
                              {claimData.property.address}, {claimData.property.city}, {claimData.property.state} {claimData.property.zipCode}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Built:</span> {claimData.property.yearBuilt} • 
                            <span className="text-gray-600"> Size:</span> {claimData.property.squareFootage} sq ft • 
                            <span className="text-gray-600"> Stories:</span> {claimData.property.numberOfStories}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => updateEditedField('property', 'type', 'residential')}
                              className={`px-2 py-1 rounded text-xs border ${editedClaimData?.property.type === 'residential' ? 'border-[#E74C3C] bg-[#E74C3C]/10' : 'border-gray-300'}`}
                            >
                              Residential
                            </button>
                            <button
                              onClick={() => updateEditedField('property', 'type', 'commercial')}
                              className={`px-2 py-1 rounded text-xs border ${editedClaimData?.property.type === 'commercial' ? 'border-[#E74C3C] bg-[#E74C3C]/10' : 'border-gray-300'}`}
                            >
                              Commercial
                            </button>
                          </div>
                          <input
                            type="text"
                            value={editedClaimData?.property.address || ''}
                            onChange={(e) => updateEditedField('property', 'address', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                            placeholder="Address"
                          />
                          <div className="grid grid-cols-3 gap-2">
                            <input
                              type="text"
                              value={editedClaimData?.property.city || ''}
                              onChange={(e) => updateEditedField('property', 'city', e.target.value)}
                              className="px-2 py-1 text-sm border border-gray-300 rounded"
                              placeholder="City"
                            />
                            <input
                              type="text"
                              value={editedClaimData?.property.state || ''}
                              onChange={(e) => updateEditedField('property', 'state', e.target.value)}
                              className="px-2 py-1 text-sm border border-gray-300 rounded"
                              placeholder="State"
                              maxLength={2}
                            />
                            <input
                              type="text"
                              value={editedClaimData?.property.zipCode || ''}
                              onChange={(e) => updateEditedField('property', 'zipCode', e.target.value)}
                              className="px-2 py-1 text-sm border border-gray-300 rounded"
                              placeholder="ZIP"
                              maxLength={5}
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <input
                              type="text"
                              value={editedClaimData?.property.yearBuilt || ''}
                              onChange={(e) => updateEditedField('property', 'yearBuilt', e.target.value)}
                              className="px-2 py-1 text-sm border border-gray-300 rounded"
                              placeholder="Year"
                              maxLength={4}
                            />
                            <input
                              type="text"
                              value={editedClaimData?.property.squareFootage || ''}
                              onChange={(e) => updateEditedField('property', 'squareFootage', e.target.value)}
                              className="px-2 py-1 text-sm border border-gray-300 rounded"
                              placeholder="Sq ft"
                            />
                            <input
                              type="text"
                              value={editedClaimData?.property.numberOfStories || ''}
                              onChange={(e) => updateEditedField('property', 'numberOfStories', e.target.value)}
                              className="px-2 py-1 text-sm border border-gray-300 rounded"
                              placeholder="Stories"
                              maxLength={2}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-700 mb-3">Claim Details</h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Claim #:</span> <span className="font-medium text-stellar-orange">{claimData.claimNumber}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Date of Loss:</span> {claimData.incident.dateOfLoss}
                        </div>
                        <div>
                          <span className="text-gray-600">Damage Types:</span> 
                          <div className="flex flex-wrap gap-1 mt-1">
                            {claimData.incident.damageTypes.map((type) => (
                              <span key={type} className="px-2 py-1 bg-stellar-orange/10 text-stellar-orange text-xs rounded-full">
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Est. Value:</span> <span className="font-semibold text-green-600">${claimData.incident.estimatedValue?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-700 mb-3">Property Owner</h3>
                      {!isEditMode ? (
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <User size={16} className="text-gray-400" />
                            <span>{claimData.owner.name}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Phone:</span> {claimData.owner.phone}
                          </div>
                          <div>
                            <span className="text-gray-600">Email:</span> {claimData.owner.email}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={editedClaimData?.owner.name || ''}
                            onChange={(e) => updateEditedField('owner', 'name', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                            placeholder="Owner name"
                          />
                          <input
                            type="tel"
                            value={editedClaimData?.owner.phone || ''}
                            onChange={(e) => updateEditedField('owner', 'phone', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                            placeholder="Phone"
                          />
                          <input
                            type="email"
                            value={editedClaimData?.owner.email || ''}
                            onChange={(e) => updateEditedField('owner', 'email', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                            placeholder="Email"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-700 mb-3">Insurance Information</h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Company:</span> {claimData.insurance.company}
                        </div>
                        <div>
                          <span className="text-gray-600">Policy:</span> {claimData.insurance.policyNumber}
                        </div>
                        {claimData.insurance.adjusterName && (
                          <>
                            <div>
                              <span className="text-gray-600">Adjuster:</span> {claimData.insurance.adjusterName}
                            </div>
                            <div>
                              <span className="text-gray-600">Adjuster Phone:</span> {claimData.insurance.adjusterPhone}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="font-medium text-gray-700 mb-2">Initial Damage Description</h3>
                    <p className="text-sm text-gray-600">{claimData.incident.initialDescription}</p>
                  </div>
                </div>

                {/* Inspection Setup */}
                <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-stellar-orange/10 rounded-lg">
                      <Camera className="text-stellar-orange" size={20} />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Inspection Setup</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Inspector *</label>
                      <select
                        value={inspectionSetup.inspector}
                        onChange={(e) => updateInspectionField('inspector', e.target.value)}
                        className="w-full px-4 py-2 pr-10 text-base md:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white appearance-none cursor-pointer min-h-[44px]"
                        style={{ fontSize: '16px' }}
                      >
                        <option value="James Rodriguez">James Rodriguez</option>
                        <option value="Maria Garcia">Maria Garcia</option>
                        <option value="Michael Thompson">Michael Thompson</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none" style={{ paddingTop: '28px' }}>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date *</label>
                      <input
                        type="date"
                        value={inspectionSetup.scheduledDate}
                        onChange={(e) => updateInspectionField('scheduledDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Time *</label>
                      <input
                        type="time"
                        value={inspectionSetup.scheduledTime}
                        onChange={(e) => updateInspectionField('scheduledTime', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Inspection Focus Areas</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {claimData.incident.damageTypes.map((type) => (
                        <button
                          key={type}
                          onClick={() => toggleInspectionFocus(type)}
                          className={`p-3 rounded-lg border text-sm transition-all ${
                            inspectionSetup.inspectionFocus.includes(type)
                              ? 'border-stellar-orange bg-stellar-orange/10 text-stellar-orange font-medium'
                              : 'border-gray-200 hover:border-stellar-orange/30'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions</label>
                    <textarea
                      value={inspectionSetup.specialInstructions}
                      onChange={(e) => updateInspectionField('specialInstructions', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                      placeholder="Any specific areas of concern or special inspection requirements..."
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Sidebar - AI Insights */}
          <div className="space-y-4 sm:space-y-6">
            {/* Historical Data */}
            {isLoading ? (
              <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="text-stellar-orange animate-pulse" size={20} />
                  <h3 className="font-semibold text-sm sm:text-base">Analyzing History...</h3>
                </div>
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ) : historicalData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="text-stellar-orange" size={20} />
                  <h3 className="font-semibold">AI Historical Analysis</h3>
                </div>
                
                {historicalData.previousClaims.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Previous Claims</h4>
                    {historicalData.previousClaims.map((claim: any, idx: number) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-lg mb-2 border-l-4 border-stellar-orange">
                        <div className="text-sm font-medium">{claim.type} - {claim.date}</div>
                        <div className="text-sm text-gray-600">{claim.settlement}</div>
                        <div className="text-sm text-stellar-orange font-medium">{claim.status}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Market Insights</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {historicalData.neighborhoodPatterns.map((pattern: string, idx: number) => (
                      <li key={idx}>• {pattern}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}

            {/* Start Inspection Button - Mobile Optimized */}
            <button
              onClick={handleStartInspection}
              disabled={!isFormValid}
              className={`w-full p-3 sm:p-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${
                isFormValid
                  ? 'bg-stellar-orange text-white hover:bg-orange-600 cursor-pointer shadow-lg shadow-stellar-orange/25'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Camera className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
              Start Property Inspection
              <ArrowRight className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}