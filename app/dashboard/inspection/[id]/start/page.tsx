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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="space-y-4">
            <Link
              href="/dashboard/inspection"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm sm:text-base">Back to Inspections</span>
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900">
                Inspection Setup
              </h1>
              <div className="flex items-center gap-2 flex-shrink-0">
              {!isEditMode ? (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit Details</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-[#E74C3C] text-white rounded-lg hover:bg-[#D73929] transition-colors"
                  >
                    <Check className="w-4 h-4" />
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 xl:gap-8">
          {/* Main Content - Mobile Optimized */}
          <div className="xl:col-span-3 space-y-6">
            {/* Loading State */}
            {isLoading && !claimData && (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stellar-orange mx-auto mb-4" />
                <p className="text-gray-600">Loading claim information...</p>
              </div>
            )}

            {/* Claim Overview */}
            {claimData && (
              <>
                <div className="bg-white rounded-xl border border-gray-200 p-6" data-testid="claim-information">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-stellar-orange/10 rounded-lg">
                      <FileText className="text-stellar-orange" size={24} />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Claim Information</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Property Details</h3>
                      {!isEditMode ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            {claimData.property.type === 'residential' ? (
                              <Home size={20} className="text-gray-400" />
                            ) : (
                              <Building2 size={20} className="text-gray-400" />
                            )}
                            <span className="capitalize font-medium">{claimData.property.type}</span>
                          </div>
                          <div className="flex items-start gap-3">
                            <MapPin size={20} className="text-gray-400 mt-0.5 flex-shrink-0" />
                            <span className="leading-relaxed">
                              {claimData.property.address}<br/>
                              {claimData.property.city}, {claimData.property.state} {claimData.property.zipCode}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 gap-2 pt-2">
                            <div><span className="text-gray-600 font-medium">Built:</span> {claimData.property.yearBuilt}</div>
                            <div><span className="text-gray-600 font-medium">Size:</span> {claimData.property.squareFootage} sq ft</div>
                            <div><span className="text-gray-600 font-medium">Stories:</span> {claimData.property.numberOfStories}</div>
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
                      <h3 className="font-semibold text-gray-900 mb-4">Claim Details</h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-gray-600 font-medium">Claim #:</span><br/>
                          <span className="font-semibold text-stellar-orange">{claimData.claimNumber}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 font-medium">Date of Loss:</span><br/>
                          <span>{claimData.incident.dateOfLoss}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 font-medium">Damage Types:</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {claimData.incident.damageTypes.map((type) => (
                              <span key={type} className="px-3 py-1 bg-stellar-orange/10 text-stellar-orange text-sm rounded-full font-medium">
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600 font-medium">Est. Value:</span><br/>
                          <span className="font-semibold text-green-600 text-lg">${claimData.incident.estimatedValue?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Property Owner</h3>
                      {!isEditMode ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <User size={20} className="text-gray-400" />
                            <span className="font-medium">{claimData.owner.name}</span>
                          </div>
                          <div>
                            <span className="text-gray-600 font-medium">Phone:</span><br/>
                            <span>{claimData.owner.phone}</span>
                          </div>
                          <div>
                            <span className="text-gray-600 font-medium">Email:</span><br/>
                            <span className="break-all">{claimData.owner.email}</span>
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
                      <h3 className="font-semibold text-gray-900 mb-4">Insurance Information</h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-gray-600 font-medium">Company:</span><br/>
                          <span className="font-medium">{claimData.insurance.company}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 font-medium">Policy:</span><br/>
                          <span className="font-mono text-sm">{claimData.insurance.policyNumber}</span>
                        </div>
                        {claimData.insurance.adjusterName && (
                          <>
                            <div>
                              <span className="text-gray-600 font-medium">Adjuster:</span><br/>
                              <span>{claimData.insurance.adjusterName}</span>
                            </div>
                            <div>
                              <span className="text-gray-600 font-medium">Adjuster Phone:</span><br/>
                              <span>{claimData.insurance.adjusterPhone}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-200 sm:col-span-2 xl:col-span-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Initial Damage Description</h3>
                    <p className="text-gray-700 leading-relaxed">{claimData.incident.initialDescription}</p>
                  </div>
                </div>

                {/* Inspection Setup */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-stellar-orange/10 rounded-lg">
                      <Camera className="text-stellar-orange" size={24} />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Inspection Setup</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                    <div className="relative">
                      <label className="block font-medium text-gray-900 mb-2">Inspector *</label>
                      <select
                        value={inspectionSetup.inspector}
                        onChange={(e) => updateInspectionField('inspector', e.target.value)}
                        className="w-full px-4 py-3 pr-10 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stellar-orange focus:border-stellar-orange bg-white appearance-none cursor-pointer"
                      >
                        <option value="James Rodriguez">James Rodriguez</option>
                        <option value="Maria Garcia">Maria Garcia</option>
                        <option value="Michael Thompson">Michael Thompson</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none pt-8">
                        <ChevronRight className="w-5 h-5 text-gray-400 rotate-90" />
                      </div>
                    </div>
                    <div>
                      <label className="block font-medium text-gray-900 mb-2">Scheduled Date *</label>
                      <input
                        type="date"
                        value={inspectionSetup.scheduledDate}
                        onChange={(e) => updateInspectionField('scheduledDate', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stellar-orange focus:border-stellar-orange"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-gray-900 mb-2">Scheduled Time *</label>
                      <input
                        type="time"
                        value={inspectionSetup.scheduledTime}
                        onChange={(e) => updateInspectionField('scheduledTime', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stellar-orange focus:border-stellar-orange"
                      />
                    </div>
                  </div>

                  <div className="mb-8 sm:col-span-2 xl:col-span-3">
                    <label className="block font-medium text-gray-900 mb-4">Inspection Focus Areas</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                      {claimData.incident.damageTypes.map((type) => (
                        <button
                          key={type}
                          onClick={() => toggleInspectionFocus(type)}
                          className={`p-4 rounded-lg border transition-all ${
                            inspectionSetup.inspectionFocus.includes(type)
                              ? 'border-stellar-orange bg-stellar-orange/10 text-stellar-orange font-semibold'
                              : 'border-gray-300 hover:border-stellar-orange/50 hover:bg-gray-50'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="sm:col-span-2 xl:col-span-3">
                    <label className="block font-medium text-gray-900 mb-2">Special Instructions</label>
                    <textarea
                      value={inspectionSetup.specialInstructions}
                      onChange={(e) => updateInspectionField('specialInstructions', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stellar-orange focus:border-stellar-orange"
                      placeholder="Any specific areas of concern or special inspection requirements..."
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Sidebar - AI Insights */}
          <div className="space-y-6">
            {/* Historical Data */}
            {isLoading ? (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Brain className="text-stellar-orange animate-pulse" size={24} />
                  <h3 className="font-semibold text-lg">Analyzing History...</h3>
                </div>
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ) : historicalData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-gray-200 p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Brain className="text-stellar-orange" size={24} />
                  <h3 className="font-semibold text-lg">AI Historical Analysis</h3>
                </div>
                
                {historicalData.previousClaims.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Previous Claims</h4>
                    {historicalData.previousClaims.map((claim: any, idx: number) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-lg mb-3 border-l-4 border-stellar-orange">
                        <div className="font-semibold">{claim.type} - {claim.date}</div>
                        <div className="text-gray-600 mt-1">{claim.settlement}</div>
                        <div className="text-stellar-orange font-semibold mt-1">{claim.status}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Market Insights</h4>
                  <ul className="space-y-2 text-gray-700">
                    {historicalData.neighborhoodPatterns.map((pattern: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-stellar-orange font-bold mt-1">•</span>
                        <span>{pattern}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}

            {/* Start Inspection Button - Mobile Optimized */}
            <button
              onClick={handleStartInspection}
              disabled={!isFormValid}
              className={`w-full p-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-3 text-lg ${
                isFormValid
                  ? 'bg-stellar-orange text-white hover:bg-orange-600 cursor-pointer shadow-lg shadow-stellar-orange/25 transform hover:scale-105'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Camera className="w-6 h-6" />
              Start Property Inspection
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}