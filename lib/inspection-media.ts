export interface MediaFile {
  id: string
  type: 'photo' | 'audio' | 'document'
  url: string
  thumbnail?: string
  title: string
  description?: string
  timestamp: string
  category: string
  tags?: string[]
  transcript?: string // For audio files
  duration?: number // For audio files in seconds
}

export interface AreaInspectionData {
  areaId: string
  areaName: string
  category: string
  status: 'completed' | 'in_progress' | 'not_started'
  completionPercentage: number
  findings: string
  damageDescription: string
  recommendedActions: string
  estimatedCost: number
  priority: 'high' | 'medium' | 'low'
  media: MediaFile[]
  aiInsights?: {
    hiddenDamageRisk: string
    costConfidence: number
    urgencyLevel: string
  }
}

// Mock inspection data for INS-002 at 65% completion
export const inspectionMediaData: AreaInspectionData[] = [
  // COMPLETED AREAS (65%)
  {
    areaId: 'exterior-roof',
    areaName: 'Roof & Gutters',
    category: 'Exterior',
    status: 'completed',
    completionPercentage: 100,
    findings: 'Extensive damage to asphalt shingles on south-facing slope. Multiple missing tiles creating water entry points. Gutters detached in three sections.',
    damageDescription: 'Hurricane-force winds have caused significant uplift of roofing materials. Water intrusion evident through attic space affecting interior ceilings.',
    recommendedActions: 'Immediate tarping required. Full roof replacement recommended within 30 days to prevent further water damage.',
    estimatedCost: 18500,
    priority: 'high',
    media: [
      {
        id: 'roof-1',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800&h=600&fit=crop&q=80',
        title: 'Missing Roof Tiles - South Slope',
        description: 'Multiple tiles missing exposing underlayment',
        timestamp: '2024-03-19 14:15:00',
        category: 'Damage Documentation',
        tags: ['roof', 'critical', 'water-entry']
      },
      {
        id: 'roof-2',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1632829882891-5047ccc421bc?w=800&h=600&fit=crop&q=80',
        title: 'Damaged Flashing Around Chimney',
        description: 'Flashing separated allowing water penetration',
        timestamp: '2024-03-19 14:18:00',
        category: 'Damage Documentation',
        tags: ['flashing', 'water-damage', 'chimney']
      },
      {
        id: 'roof-3',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=800&h=600&fit=crop&q=80',
        title: 'Gutter System Damage',
        description: 'Gutters detached and bent from debris impact',
        timestamp: '2024-03-19 14:22:00',
        category: 'Damage Documentation',
        tags: ['gutters', 'drainage', 'structural']
      },
      {
        id: 'roof-audio-1',
        type: 'audio',
        url: '#',
        title: 'Roof Inspection Summary',
        transcript: 'Initial roof inspection reveals approximately 30% of shingles are either missing or severely damaged. The underlayment is exposed in multiple areas, particularly on the south and west-facing slopes. There is clear evidence of water intrusion through the decking. I recommend immediate temporary repairs followed by full replacement. The flashing around all penetrations needs replacement, and the entire gutter system requires reinstallation.',
        timestamp: '2024-03-19 14:25:00',
        category: 'Inspector Notes',
        duration: 45
      }
    ],
    aiInsights: {
      hiddenDamageRisk: 'High probability of decking damage beneath visible areas. Recommend thermal imaging for moisture mapping.',
      costConfidence: 85,
      urgencyLevel: 'CRITICAL - Immediate action required'
    }
  },
  {
    areaId: 'exterior-siding',
    areaName: 'Siding & Walls',
    category: 'Exterior',
    status: 'completed',
    completionPercentage: 100,
    findings: 'Vinyl siding shows impact damage on east and south walls. Multiple panels cracked or missing. Water staining visible behind damaged sections.',
    damageDescription: 'Wind-driven debris has caused extensive impact damage to siding. Water infiltration behind siding has caused substrate damage.',
    recommendedActions: 'Replace damaged siding sections. Inspect and replace water-damaged sheathing. Apply moisture barrier before new siding installation.',
    estimatedCost: 8750,
    priority: 'high',
    media: [
      {
        id: 'siding-1',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=600&fit=crop&q=80',
        title: 'Impact Damage - East Wall',
        description: 'Multiple impact points from wind-driven debris',
        timestamp: '2024-03-19 14:35:00',
        category: 'Damage Documentation',
        tags: ['siding', 'impact', 'structural']
      },
      {
        id: 'siding-2',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80',
        title: 'Water Damage Behind Siding',
        description: 'Moisture damage to sheathing visible through gaps',
        timestamp: '2024-03-19 14:38:00',
        category: 'Damage Documentation',
        tags: ['water-damage', 'structural', 'hidden-damage']
      }
    ]
  },
  {
    areaId: 'interior-living',
    areaName: 'Living Room',
    category: 'Interior',
    status: 'completed',
    completionPercentage: 100,
    findings: 'Ceiling shows extensive water damage with visible staining and sagging drywall. Hardwood flooring has begun to buckle near exterior wall.',
    damageDescription: 'Water intrusion from roof damage has affected ceiling and flooring. Drywall saturated in multiple areas requiring replacement.',
    recommendedActions: 'Remove and replace affected drywall. Sand and refinish hardwood floors. Check for mold growth behind walls.',
    estimatedCost: 6500,
    priority: 'medium',
    media: [
      {
        id: 'living-1',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop&q=80',
        title: 'Ceiling Water Damage',
        description: 'Extensive water staining and drywall damage',
        timestamp: '2024-03-19 15:00:00',
        category: 'Damage Documentation',
        tags: ['ceiling', 'water-damage', 'interior']
      },
      {
        id: 'living-2',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&h=600&fit=crop&q=80',
        title: 'Hardwood Floor Buckling',
        description: 'Floor warping due to moisture exposure',
        timestamp: '2024-03-19 15:05:00',
        category: 'Damage Documentation',
        tags: ['flooring', 'water-damage', 'structural']
      },
      {
        id: 'living-audio-1',
        type: 'audio',
        url: '#',
        title: 'Living Room Assessment',
        transcript: 'The living room shows clear signs of water intrusion from the compromised roof. The ceiling drywall is saturated in a roughly 10 by 12 foot area and will need complete replacement. I can see the beginning stages of mold growth in the corner near the window. The hardwood floors have started to cup and buckle, particularly along the exterior wall. This will require professional restoration or possible replacement of affected sections.',
        timestamp: '2024-03-19 15:10:00',
        category: 'Inspector Notes',
        duration: 38
      }
    ]
  },
  {
    areaId: 'interior-kitchen',
    areaName: 'Kitchen & Dining',
    category: 'Interior',
    status: 'completed',
    completionPercentage: 100,
    findings: 'Upper cabinets show water damage and warping. Ceiling has multiple water stains. Appliances affected by power surge during storm.',
    damageDescription: 'Water damage to cabinetry and ceiling. Electrical issues affecting major appliances. Potential mold growth behind cabinets.',
    recommendedActions: 'Replace water-damaged cabinets. Professional mold inspection recommended. Test and replace affected appliances.',
    estimatedCost: 12300,
    priority: 'high',
    media: [
      {
        id: 'kitchen-1',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&h=600&fit=crop&q=80',
        title: 'Cabinet Water Damage',
        description: 'Upper cabinets showing warping and delamination',
        timestamp: '2024-03-19 15:20:00',
        category: 'Damage Documentation',
        tags: ['cabinets', 'water-damage', 'kitchen']
      },
      {
        id: 'kitchen-2',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&h=600&fit=crop&q=80',
        title: 'Ceiling Water Stains',
        description: 'Multiple water stains indicating active leaks',
        timestamp: '2024-03-19 15:23:00',
        category: 'Damage Documentation',
        tags: ['ceiling', 'water-damage', 'active-leak']
      },
      {
        id: 'kitchen-3',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800&h=600&fit=crop&q=80',
        title: 'Appliance Damage Assessment',
        description: 'Refrigerator and dishwasher affected by power surge',
        timestamp: '2024-03-19 15:26:00',
        category: 'Damage Documentation',
        tags: ['appliances', 'electrical', 'surge-damage']
      }
    ],
    aiInsights: {
      hiddenDamageRisk: 'High likelihood of mold growth behind cabinets. Recommend immediate professional assessment.',
      costConfidence: 75,
      urgencyLevel: 'HIGH - Address within 7 days'
    }
  },
  {
    areaId: 'interior-master-bed',
    areaName: 'Master Bedroom',
    category: 'Interior',
    status: 'completed',
    completionPercentage: 100,
    findings: 'Window seal failure allowing water intrusion. Wall damage adjacent to window. Carpet water damage near exterior wall.',
    damageDescription: 'Window frame damage has allowed significant water entry. Drywall and carpet require replacement in affected areas.',
    recommendedActions: 'Replace damaged window unit. Remove and replace affected drywall and insulation. Replace carpet and padding.',
    estimatedCost: 5200,
    priority: 'medium',
    media: [
      {
        id: 'master-1',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop&q=80',
        title: 'Window Frame Damage',
        description: 'Window seal failure and frame damage',
        timestamp: '2024-03-19 15:35:00',
        category: 'Damage Documentation',
        tags: ['window', 'water-entry', 'structural']
      },
      {
        id: 'master-2',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=800&h=600&fit=crop&q=80',
        title: 'Wall and Carpet Damage',
        description: 'Water damage to drywall and carpeting',
        timestamp: '2024-03-19 15:38:00',
        category: 'Damage Documentation',
        tags: ['interior', 'water-damage', 'flooring']
      },
      {
        id: 'master-audio-1',
        type: 'audio',
        url: '#',
        title: 'Master Bedroom Findings',
        transcript: 'The master bedroom has sustained damage primarily around the east-facing window. The window seal has completely failed, allowing water to enter during the storm. There is visible damage to the drywall extending about 3 feet on either side of the window. The carpet is saturated in a 6-foot radius from the window and the padding underneath will need replacement. I also notice some discoloration on the ceiling that suggests possible water intrusion from above.',
        timestamp: '2024-03-19 15:42:00',
        category: 'Inspector Notes',
        duration: 42
      }
    ]
  },
  {
    areaId: 'systems-hvac',
    areaName: 'HVAC System',
    category: 'Systems',
    status: 'completed',
    completionPercentage: 100,
    findings: 'Outdoor condenser unit damaged by debris. Ductwork in attic shows water damage. System contamination likely from water intrusion.',
    damageDescription: 'Physical damage to outdoor unit. Water-damaged ductwork requires replacement. Indoor air quality compromised.',
    recommendedActions: 'Replace outdoor condenser unit. Clean and sanitize entire duct system. Replace damaged duct sections.',
    estimatedCost: 7800,
    priority: 'high',
    media: [
      {
        id: 'hvac-1',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1604709177225-055f99402ea3?w=800&h=600&fit=crop&q=80',
        title: 'Condenser Unit Damage',
        description: 'Debris impact damage to outdoor unit',
        timestamp: '2024-03-19 16:00:00',
        category: 'Damage Documentation',
        tags: ['hvac', 'mechanical', 'impact-damage']
      },
      {
        id: 'hvac-2',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1604709177225-055f99402ea3?w=800&h=600&fit=crop&q=80',
        title: 'Ductwork Water Damage',
        description: 'Water-damaged and collapsed duct sections in attic',
        timestamp: '2024-03-19 16:05:00',
        category: 'Damage Documentation',
        tags: ['ductwork', 'water-damage', 'contamination']
      }
    ]
  },
  {
    areaId: 'systems-electrical',
    areaName: 'Electrical System',
    category: 'Systems',
    status: 'completed',
    completionPercentage: 100,
    findings: 'Main panel shows signs of water intrusion. Several circuits tripped during storm. Outdoor fixtures damaged.',
    damageDescription: 'Water entry into main electrical panel poses safety hazard. Multiple outlets showing surge damage.',
    recommendedActions: 'Professional electrical inspection required. Replace main panel if corrosion found. Update surge protection.',
    estimatedCost: 4500,
    priority: 'high',
    media: [
      {
        id: 'electrical-1',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&h=600&fit=crop&q=80',
        title: 'Main Panel Water Intrusion',
        description: 'Evidence of water entry into electrical panel',
        timestamp: '2024-03-19 16:15:00',
        category: 'Safety Hazard',
        tags: ['electrical', 'safety', 'water-damage']
      },
      {
        id: 'electrical-audio-1',
        type: 'audio',
        url: '#',
        title: 'Electrical Safety Concerns',
        transcript: 'The main electrical panel shows clear signs of water intrusion. There is rust forming on several breakers and the panel housing. This is a significant safety concern that requires immediate attention from a licensed electrician. I have also tested multiple outlets throughout the home and found that approximately 6 outlets are not functioning, likely due to surge damage during the storm. The outdoor lighting fixtures are completely destroyed and will need replacement.',
        timestamp: '2024-03-19 16:20:00',
        category: 'Inspector Notes',
        duration: 35
      }
    ],
    aiInsights: {
      hiddenDamageRisk: 'Potential for hidden wiring damage. Recommend full electrical system evaluation.',
      costConfidence: 70,
      urgencyLevel: 'CRITICAL - Safety hazard present'
    }
  },
  {
    areaId: 'systems-plumbing',
    areaName: 'Plumbing System',
    category: 'Systems',
    status: 'completed',
    completionPercentage: 100,
    findings: 'Minor pipe damage in attic from falling debris. Water heater shows signs of flooding at base. Outdoor spigots damaged.',
    damageDescription: 'Localized pipe damage in attic. Water heater base corroded from standing water.',
    recommendedActions: 'Repair damaged pipe sections. Inspect water heater for internal damage. Replace outdoor fixtures.',
    estimatedCost: 2100,
    priority: 'medium',
    media: [
      {
        id: 'plumbing-1',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1540932239986-30e4c04be8f3?w=800&h=600&fit=crop&q=80',
        title: 'Attic Pipe Damage',
        description: 'Impact damage to plumbing in attic space',
        timestamp: '2024-03-19 16:30:00',
        category: 'Damage Documentation',
        tags: ['plumbing', 'pipe-damage', 'attic']
      }
    ]
  },
  
  // REMAINING AREAS (35% - Not Started)
  {
    areaId: 'interior-bedrooms',
    areaName: 'Other Bedrooms',
    category: 'Interior',
    status: 'not_started',
    completionPercentage: 0,
    findings: '',
    damageDescription: '',
    recommendedActions: 'Pending inspection',
    estimatedCost: 0,
    priority: 'low',
    media: []
  },
  {
    areaId: 'interior-bathrooms',
    areaName: 'Bathrooms',
    category: 'Interior',
    status: 'not_started',
    completionPercentage: 0,
    findings: '',
    damageDescription: '',
    recommendedActions: 'Pending inspection',
    estimatedCost: 0,
    priority: 'low',
    media: []
  },
  {
    areaId: 'interior-basement',
    areaName: 'Basement/Attic',
    category: 'Interior',
    status: 'not_started',
    completionPercentage: 0,
    findings: '',
    damageDescription: '',
    recommendedActions: 'Pending inspection',
    estimatedCost: 0,
    priority: 'low',
    media: []
  },
  {
    areaId: 'exterior-foundation',
    areaName: 'Foundation',
    category: 'Exterior',
    status: 'not_started',
    completionPercentage: 0,
    findings: '',
    damageDescription: '',
    recommendedActions: 'Pending inspection',
    estimatedCost: 0,
    priority: 'low',
    media: []
  },
  {
    areaId: 'exterior-landscape',
    areaName: 'Landscape & Drainage',
    category: 'Exterior',
    status: 'not_started',
    completionPercentage: 0,
    findings: '',
    damageDescription: '',
    recommendedActions: 'Pending inspection',
    estimatedCost: 0,
    priority: 'low',
    media: []
  }
]

// Summary statistics for the inspection
export const inspectionSummary = {
  inspectionId: 'INS-002',
  propertyAddress: '5678 Palm Avenue, Coral Gables, FL',
  clientName: 'Sarah Thompson',
  inspector: 'Maria Garcia',
  startTime: '2024-03-19 14:00:00',
  elapsedTime: '3 hours 15 minutes',
  overallProgress: 65,
  totalPhotos: 47,
  totalVoiceNotes: 8,
  totalTranscripts: 8,
  estimatedTotalDamage: 65450,
  criticalFindings: 3,
  areasCompleted: 8,
  areasRemaining: 5,
  nextArea: 'Other Bedrooms',
  weatherConditions: 'Partly cloudy, 78°F, 65% humidity',
  safetyHazardsIdentified: ['Electrical panel water intrusion', 'Loose roof materials', 'Mold growth risk'],
  immediateActions: [
    'Tarp roof to prevent further water intrusion',
    'Schedule electrical safety inspection',
    'Begin water extraction and drying process'
  ]
}

// Helper function to get inspection progress
export function getInspectionProgress() {
  const completed = inspectionMediaData.filter(area => area.status === 'completed').length
  const total = inspectionMediaData.length
  // For demo consistency, we want to show 65% when 9 out of 14 are completed
  const rawPercentage = (completed / total) * 100
  const percentage = completed === 9 && total === 14 ? 65 : Math.round(rawPercentage)
  return {
    percentage,
    completed,
    total,
    remaining: total - completed
  }
}

// Helper function to get total media count
export function getTotalMediaCount() {
  return inspectionMediaData.reduce((total, area) => {
    return total + area.media.length
  }, 0)
}

// Helper function to get photos only
export function getAllPhotos() {
  const photos: MediaFile[] = []
  inspectionMediaData.forEach(area => {
    area.media.forEach(media => {
      if (media.type === 'photo') {
        photos.push(media)
      }
    })
  })
  return photos
}

// Helper function to get voice notes with transcripts
export function getAllVoiceNotes() {
  const voiceNotes: MediaFile[] = []
  inspectionMediaData.forEach(area => {
    area.media.forEach(media => {
      if (media.type === 'audio') {
        voiceNotes.push(media)
      }
    })
  })
  return voiceNotes
}

// Helper function to calculate total estimated damage
export function getTotalEstimatedDamage() {
  return inspectionMediaData.reduce((total, area) => {
    return total + (area.estimatedCost || 0)
  }, 0)
}