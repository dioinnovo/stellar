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
  status: 'completed' | 'in_progress' | 'not_started' | 'skipped'
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

// Complete inspection data for INS-002 - 8 completed areas with 51 photos and 12 audio notes
export const inspectionMediaData: AreaInspectionData[] = [
  // 1. ROOF & GUTTERS
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
      // Photos (8 total)
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
        id: 'roof-4',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1609767500458-d2a133f61cab?w=800&h=600&fit=crop&q=80',
        title: 'Ridge Cap Damage',
        description: 'Ridge cap tiles displaced exposing roof peak',
        timestamp: '2024-03-19 14:24:00',
        category: 'Damage Documentation',
        tags: ['ridge', 'critical', 'water-entry']
      },
      {
        id: 'roof-5',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1621873495884-845a939892c5?w=800&h=600&fit=crop&q=80',
        title: 'Soffit and Fascia Damage',
        description: 'Wind damage to soffit panels and fascia boards',
        timestamp: '2024-03-19 14:26:00',
        category: 'Damage Documentation',
        tags: ['soffit', 'fascia', 'wind-damage']
      },
      {
        id: 'roof-6',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800&h=600&fit=crop&q=80',
        title: 'Valley Flashing Failure',
        description: 'Valley flashing torn and lifted',
        timestamp: '2024-03-19 14:28:00',
        category: 'Damage Documentation',
        tags: ['valley', 'flashing', 'critical']
      },
      {
        id: 'roof-7',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1604079628040-94301bb21b91?w=800&h=600&fit=crop&q=80',
        title: 'Roof Deck Exposure',
        description: 'Large section of roof deck exposed after shingle loss',
        timestamp: '2024-03-19 14:30:00',
        category: 'Damage Documentation',
        tags: ['deck', 'exposure', 'urgent']
      },
      {
        id: 'roof-8',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=800&h=600&fit=crop&q=80',
        title: 'Downspout Separation',
        description: 'Multiple downspouts disconnected from gutter system',
        timestamp: '2024-03-19 14:32:00',
        category: 'Damage Documentation',
        tags: ['downspout', 'drainage', 'repair']
      },
      // Audio Notes (2 total)
      {
        id: 'roof-audio-1',
        type: 'audio',
        url: '#',
        title: 'Initial Roof Assessment',
        transcript: 'Initial roof inspection reveals approximately 30% of shingles are either missing or severely damaged. The underlayment is exposed in multiple areas, particularly on the south and west-facing slopes. There is clear evidence of water intrusion through the decking. I recommend immediate temporary repairs followed by full replacement. The flashing around all penetrations needs replacement, and the entire gutter system requires reinstallation.',
        timestamp: '2024-03-19 14:25:00',
        category: 'Inspector Notes',
        duration: 45
      },
      {
        id: 'roof-audio-2',
        type: 'audio',
        url: '#',
        title: 'Structural Concerns',
        transcript: 'Upon closer inspection of the roof structure, I\'ve identified several areas of concern beyond the visible shingle damage. The roof decking shows signs of water saturation in at least three locations. The ridge beam appears to have shifted slightly, likely due to the extreme wind forces. Additionally, several rafters may need sistering or replacement. The attic inspection reveals daylight visible through multiple points, confirming the extent of the damage. Priority should be given to waterproofing immediately.',
        timestamp: '2024-03-19 14:35:00',
        category: 'Inspector Notes',
        duration: 52
      }
    ],
    aiInsights: {
      hiddenDamageRisk: 'High probability of decking damage beneath visible areas. Recommend thermal imaging for moisture mapping.',
      costConfidence: 85,
      urgencyLevel: 'CRITICAL - Immediate action required'
    }
  },

  // 2. SIDING & WALLS
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
      // Photos (6 total)
      {
        id: 'siding-1',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=600&fit=crop&q=80',
        title: 'Impact Damage - East Wall',
        description: 'Multiple impact points from wind-driven debris',
        timestamp: '2024-03-19 14:50:00',
        category: 'Damage Documentation',
        tags: ['siding', 'impact', 'structural']
      },
      {
        id: 'siding-2',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80',
        title: 'Water Damage Behind Siding',
        description: 'Moisture damage to sheathing visible through gaps',
        timestamp: '2024-03-19 14:52:00',
        category: 'Damage Documentation',
        tags: ['water-damage', 'structural', 'hidden-damage']
      },
      {
        id: 'siding-3',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800&h=600&fit=crop&q=80',
        title: 'Cracked Vinyl Panels',
        description: 'Multiple cracked and broken vinyl siding panels',
        timestamp: '2024-03-19 14:54:00',
        category: 'Damage Documentation',
        tags: ['vinyl', 'cracks', 'replacement']
      },
      {
        id: 'siding-4',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=800&h=600&fit=crop&q=80',
        title: 'Corner Trim Separation',
        description: 'Corner trim pieces pulled away from structure',
        timestamp: '2024-03-19 14:56:00',
        category: 'Damage Documentation',
        tags: ['trim', 'separation', 'wind-damage']
      },
      {
        id: 'siding-5',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?w=800&h=600&fit=crop&q=80',
        title: 'South Wall Missing Panels',
        description: 'Large section of siding missing on south wall',
        timestamp: '2024-03-19 14:58:00',
        category: 'Damage Documentation',
        tags: ['missing', 'exposed', 'urgent']
      },
      {
        id: 'siding-6',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1597047084897-b1e8b5d89f55?w=800&h=600&fit=crop&q=80',
        title: 'Window Frame Damage',
        description: 'Siding damage around window frames with gaps',
        timestamp: '2024-03-19 15:00:00',
        category: 'Damage Documentation',
        tags: ['window', 'frame', 'sealing']
      },
      // Audio Note (1 total)
      {
        id: 'siding-audio-1',
        type: 'audio',
        url: '#',
        title: 'Exterior Wall Assessment',
        transcript: 'The exterior siding has sustained significant damage from the storm. Approximately 40% of the vinyl siding panels show either impact damage, cracks, or complete failure. The east and south walls bore the brunt of the wind damage. I can see exposed sheathing in several areas where panels have been completely torn off. There\'s evidence of water infiltration behind the remaining siding, particularly around windows and doors. The home wrap is torn in multiple locations. All damaged sections will need removal and replacement, including proper moisture barrier installation.',
        timestamp: '2024-03-19 15:02:00',
        category: 'Inspector Notes',
        duration: 38
      }
    ]
  },

  // 3. LIVING ROOM
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
      // Photos (12 total)
      {
        id: 'living-1',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop&q=80',
        title: 'Ceiling Water Damage',
        description: 'Extensive water staining and drywall damage',
        timestamp: '2024-03-19 15:10:00',
        category: 'Damage Documentation',
        tags: ['ceiling', 'water-damage', 'drywall']
      },
      {
        id: 'living-2',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&h=600&fit=crop&q=80',
        title: 'Buckled Hardwood Flooring',
        description: 'Floor warping due to water exposure',
        timestamp: '2024-03-19 15:12:00',
        category: 'Damage Documentation',
        tags: ['flooring', 'water-damage', 'hardwood']
      },
      {
        id: 'living-3',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=800&h=600&fit=crop&q=80',
        title: 'Window Frame Water Intrusion',
        description: 'Water damage around window frames',
        timestamp: '2024-03-19 15:14:00',
        category: 'Damage Documentation',
        tags: ['window', 'water-damage', 'seal']
      },
      {
        id: 'living-4',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1565183928294-7d21b36e9c7b?w=800&h=600&fit=crop&q=80',
        title: 'Wall Moisture Damage',
        description: 'Paint bubbling and peeling from moisture',
        timestamp: '2024-03-19 15:16:00',
        category: 'Damage Documentation',
        tags: ['wall', 'moisture', 'paint']
      },
      {
        id: 'living-5',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop&q=80',
        title: 'Damaged Furniture',
        description: 'Water-damaged sofa and furnishings',
        timestamp: '2024-03-19 15:18:00',
        category: 'Content Documentation',
        tags: ['furniture', 'contents', 'water-damage']
      },
      {
        id: 'living-6',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80',
        title: 'Ceiling Fan Damage',
        description: 'Ceiling fan affected by water from above',
        timestamp: '2024-03-19 15:20:00',
        category: 'Damage Documentation',
        tags: ['electrical', 'ceiling-fan', 'water']
      },
      {
        id: 'living-7',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800&h=600&fit=crop&q=80',
        title: 'Crown Molding Separation',
        description: 'Crown molding pulling away due to moisture',
        timestamp: '2024-03-19 15:22:00',
        category: 'Damage Documentation',
        tags: ['molding', 'separation', 'moisture']
      },
      {
        id: 'living-8',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&h=600&fit=crop&q=80',
        title: 'Fireplace Water Staining',
        description: 'Water staining around fireplace chimney',
        timestamp: '2024-03-19 15:24:00',
        category: 'Damage Documentation',
        tags: ['fireplace', 'chimney', 'water-stain']
      },
      {
        id: 'living-9',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1538688525999-5f0f74a62f2c?w=800&h=600&fit=crop&q=80',
        title: 'Baseboard Damage',
        description: 'Baseboards swollen from water exposure',
        timestamp: '2024-03-19 15:26:00',
        category: 'Damage Documentation',
        tags: ['baseboard', 'swelling', 'water']
      },
      {
        id: 'living-10',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=800&h=600&fit=crop&q=80',
        title: 'Electrical Outlet Concern',
        description: 'Water near electrical outlets - safety hazard',
        timestamp: '2024-03-19 15:28:00',
        category: 'Safety Documentation',
        tags: ['electrical', 'safety', 'urgent']
      },
      {
        id: 'living-11',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1558211583-d26f610c1eb1?w=800&h=600&fit=crop&q=80',
        title: 'Entertainment Center Damage',
        description: 'Built-in entertainment center water damage',
        timestamp: '2024-03-19 15:30:00',
        category: 'Damage Documentation',
        tags: ['built-in', 'cabinetry', 'water']
      },
      {
        id: 'living-12',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1565182999561-18d7dc61c393?w=800&h=600&fit=crop&q=80',
        title: 'Overall Room View',
        description: 'Wide view showing extent of damage',
        timestamp: '2024-03-19 15:32:00',
        category: 'Overview Documentation',
        tags: ['overview', 'living-room', 'general']
      },
      // Audio Notes (3 total)
      {
        id: 'living-audio-1',
        type: 'audio',
        url: '#',
        title: 'Initial Living Room Assessment',
        transcript: 'The living room has sustained significant water damage from the compromised roof. The ceiling shows extensive staining across approximately 60% of its surface, with active sagging in two locations. The drywall is saturated and will require complete replacement in affected areas. The hardwood flooring near the exterior wall is already showing signs of buckling and will need professional attention.',
        timestamp: '2024-03-19 15:34:00',
        category: 'Inspector Notes',
        duration: 42
      },
      {
        id: 'living-audio-2',
        type: 'audio',
        url: '#',
        title: 'Electrical and Safety Concerns',
        transcript: 'I have serious concerns about the electrical systems in this room. There\'s visible water damage near several outlets and the ceiling fan fixture. I strongly recommend having an electrician inspect all electrical components before restoration begins. The outlets on the north wall should be considered unsafe until properly inspected. Additionally, the moisture levels suggest potential for mold growth if not addressed immediately.',
        timestamp: '2024-03-19 15:36:00',
        category: 'Safety Notes',
        duration: 35
      },
      {
        id: 'living-audio-3',
        type: 'audio',
        url: '#',
        title: 'Contents and Restoration Notes',
        transcript: 'Several pieces of furniture show water damage including the sofa, area rug, and wooden coffee table. The built-in entertainment center has water damage on the upper shelves. Electronics should be professionally inspected before use. The fireplace appears structurally sound but shows water staining from chimney leaks. Overall, this room will require extensive restoration including drywall replacement, flooring refinishing, repainting, and electrical inspection.',
        timestamp: '2024-03-19 15:38:00',
        category: 'Restoration Notes',
        duration: 48
      }
    ]
  },

  // 4. KITCHEN
  {
    areaId: 'interior-kitchen',
    areaName: 'Kitchen',
    category: 'Interior',
    status: 'completed',
    completionPercentage: 100,
    findings: 'Water damage to ceiling and upper cabinets. Several appliances affected by water exposure. Flooring shows signs of water damage near sink area.',
    damageDescription: 'Roof leaks have caused water damage to kitchen ceiling and upper cabinetry. Standing water affected flooring and lower cabinets.',
    recommendedActions: 'Replace water-damaged cabinets. Test all appliances for water damage. Replace affected flooring sections. Check for mold in cabinet interiors.',
    estimatedCost: 12300,
    priority: 'high',
    media: [
      // Photos (10 total)
      {
        id: 'kitchen-1',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=800&h=600&fit=crop&q=80',
        title: 'Ceiling Water Damage',
        description: 'Kitchen ceiling showing water stains and damage',
        timestamp: '2024-03-19 15:45:00',
        category: 'Damage Documentation',
        tags: ['ceiling', 'water-damage', 'kitchen']
      },
      {
        id: 'kitchen-2',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800&h=600&fit=crop&q=80',
        title: 'Upper Cabinet Damage',
        description: 'Water damage to upper kitchen cabinets',
        timestamp: '2024-03-19 15:47:00',
        category: 'Damage Documentation',
        tags: ['cabinets', 'water-damage', 'upper']
      },
      {
        id: 'kitchen-3',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&h=600&fit=crop&q=80',
        title: 'Appliance Water Exposure',
        description: 'Refrigerator and dishwasher affected by water',
        timestamp: '2024-03-19 15:49:00',
        category: 'Damage Documentation',
        tags: ['appliances', 'water-exposure', 'electrical']
      },
      {
        id: 'kitchen-4',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1556912167-f556f1f39faa?w=800&h=600&fit=crop&q=80',
        title: 'Countertop Water Damage',
        description: 'Water pooling and damage on countertops',
        timestamp: '2024-03-19 15:51:00',
        category: 'Damage Documentation',
        tags: ['countertop', 'water-pooling', 'damage']
      },
      {
        id: 'kitchen-5',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1574739782594-db4ead022697?w=800&h=600&fit=crop&q=80',
        title: 'Floor Water Damage',
        description: 'Kitchen floor tiles lifting due to water',
        timestamp: '2024-03-19 15:53:00',
        category: 'Damage Documentation',
        tags: ['flooring', 'tiles', 'water-damage']
      },
      {
        id: 'kitchen-6',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1556911073-52527ac43761?w=800&h=600&fit=crop&q=80',
        title: 'Backsplash Damage',
        description: 'Backsplash tiles loose from moisture',
        timestamp: '2024-03-19 15:55:00',
        category: 'Damage Documentation',
        tags: ['backsplash', 'tiles', 'moisture']
      },
      {
        id: 'kitchen-7',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1564540586988-aa4e53c3d799?w=800&h=600&fit=crop&q=80',
        title: 'Pantry Water Damage',
        description: 'Water damage in pantry area',
        timestamp: '2024-03-19 15:57:00',
        category: 'Damage Documentation',
        tags: ['pantry', 'storage', 'water']
      },
      {
        id: 'kitchen-8',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1556911899-5df0cb05aae0?w=800&h=600&fit=crop&q=80',
        title: 'Island Damage',
        description: 'Kitchen island showing water damage',
        timestamp: '2024-03-19 15:59:00',
        category: 'Damage Documentation',
        tags: ['island', 'cabinetry', 'water']
      },
      {
        id: 'kitchen-9',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&h=600&fit=crop&q=80',
        title: 'Light Fixture Concern',
        description: 'Pendant lights affected by ceiling water',
        timestamp: '2024-03-19 16:01:00',
        category: 'Safety Documentation',
        tags: ['lighting', 'electrical', 'safety']
      },
      {
        id: 'kitchen-10',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=800&h=600&fit=crop&q=80',
        title: 'Overall Kitchen View',
        description: 'Wide angle view of kitchen damage',
        timestamp: '2024-03-19 16:03:00',
        category: 'Overview Documentation',
        tags: ['overview', 'kitchen', 'general']
      },
      // Audio Notes (2 total)
      {
        id: 'kitchen-audio-1',
        type: 'audio',
        url: '#',
        title: 'Kitchen Damage Assessment',
        transcript: 'The kitchen has sustained significant water damage primarily from roof leaks above. The ceiling drywall is compromised in multiple areas and will need replacement. Upper cabinets show water damage and swelling - I recommend complete replacement of affected units. The countertops have standing water damage, and several appliances have been exposed to water. The refrigerator, dishwasher, and microwave all need professional inspection before use.',
        timestamp: '2024-03-19 16:05:00',
        category: 'Inspector Notes',
        duration: 40
      },
      {
        id: 'kitchen-audio-2',
        type: 'audio',
        url: '#',
        title: 'Kitchen Restoration Priorities',
        transcript: 'Priority items for kitchen restoration include immediate water extraction and drying to prevent mold growth. The electrical systems need inspection, particularly for the pendant lights and under-cabinet lighting. All appliances should be professionally evaluated. The tile flooring near the sink shows signs of lifting and will need re-securing or replacement. Cabinet interiors need mold inspection and treatment. Total kitchen restoration will be substantial but necessary for safe use.',
        timestamp: '2024-03-19 16:07:00',
        category: 'Restoration Notes',
        duration: 45
      }
    ]
  },

  // 5. HVAC SYSTEM
  {
    areaId: 'systems-hvac',
    areaName: 'HVAC System',
    category: 'Systems',
    status: 'completed',
    completionPercentage: 100,
    findings: 'HVAC unit shows impact damage. Ductwork compromised in attic space. System contaminated with water and debris.',
    damageDescription: 'Outdoor condensing unit damaged by flying debris. Indoor air handler exposed to water. Ductwork torn and contaminated.',
    recommendedActions: 'Replace outdoor condensing unit. Clean and sanitize entire duct system. Replace air handler if water damage confirmed.',
    estimatedCost: 7200,
    priority: 'high',
    media: [
      // Photos (5 total)
      {
        id: 'hvac-1',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1599667442166-c0fc7fdb0439?w=800&h=600&fit=crop&q=80',
        title: 'Outdoor Unit Damage',
        description: 'Condensing unit damaged by debris impact',
        timestamp: '2024-03-19 16:15:00',
        category: 'Damage Documentation',
        tags: ['hvac', 'outdoor', 'impact']
      },
      {
        id: 'hvac-2',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80',
        title: 'Air Handler Water Damage',
        description: 'Indoor air handler showing water exposure',
        timestamp: '2024-03-19 16:17:00',
        category: 'Damage Documentation',
        tags: ['air-handler', 'water', 'indoor']
      },
      {
        id: 'hvac-3',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1607400201515-76f69495c323?w=800&h=600&fit=crop&q=80',
        title: 'Ductwork Damage',
        description: 'Torn and damaged ductwork in attic',
        timestamp: '2024-03-19 16:19:00',
        category: 'Damage Documentation',
        tags: ['ductwork', 'attic', 'torn']
      },
      {
        id: 'hvac-4',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1585338447937-f6f1b166bd6f?w=800&h=600&fit=crop&q=80',
        title: 'Thermostat and Controls',
        description: 'Control systems affected by power surge',
        timestamp: '2024-03-19 16:21:00',
        category: 'Damage Documentation',
        tags: ['thermostat', 'controls', 'electrical']
      },
      {
        id: 'hvac-5',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1595055345003-b60563b421e5?w=800&h=600&fit=crop&q=80',
        title: 'Refrigerant Line Damage',
        description: 'Bent and damaged refrigerant lines',
        timestamp: '2024-03-19 16:23:00',
        category: 'Damage Documentation',
        tags: ['refrigerant', 'lines', 'damage']
      },
      // Audio Note (1 total)
      {
        id: 'hvac-audio-1',
        type: 'audio',
        url: '#',
        title: 'HVAC System Assessment',
        transcript: 'The HVAC system has sustained significant damage and is currently non-operational. The outdoor condensing unit took a direct hit from debris, bending the fins and damaging the fan motor. The refrigerant lines are compromised. Inside, the air handler has been exposed to water, which is a serious concern for electrical components and potential mold growth. The ductwork in the attic is torn in multiple locations and contaminated with insulation and debris. This system will require comprehensive replacement of the outdoor unit and extensive cleaning and repair of the indoor components.',
        timestamp: '2024-03-19 16:25:00',
        category: 'Inspector Notes',
        duration: 55
      }
    ],
    aiInsights: {
      hiddenDamageRisk: 'High risk of mold growth in ductwork. Recommend complete duct cleaning and sanitization.',
      costConfidence: 75,
      urgencyLevel: 'HIGH - System non-operational'
    }
  },

  // 6. BATHROOMS (NEW - COMPLETED)
  {
    areaId: 'interior-bathrooms',
    areaName: 'Bathrooms',
    category: 'Interior',
    status: 'completed',
    completionPercentage: 100,
    findings: 'Water damage to vanities and fixtures. Ceiling damage in master bath. Floor tiles loose due to water seepage.',
    damageDescription: 'Bathroom fixtures and vanities damaged by water. Mold growth visible behind toilet tanks. Exhaust fans non-functional.',
    recommendedActions: 'Replace damaged vanities. Repair plumbing leaks. Install new exhaust fans. Treat mold growth areas.',
    estimatedCost: 5800,
    priority: 'medium',
    media: [
      // Photos (4 total)
      {
        id: 'bath-1',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&h=600&fit=crop&q=80',
        title: 'Master Bath Ceiling Damage',
        description: 'Water damage and mold on bathroom ceiling',
        timestamp: '2024-03-19 16:30:00',
        category: 'Damage Documentation',
        tags: ['bathroom', 'ceiling', 'mold']
      },
      {
        id: 'bath-2',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&h=600&fit=crop&q=80',
        title: 'Vanity Water Damage',
        description: 'Water damage to bathroom vanity and cabinet',
        timestamp: '2024-03-19 16:32:00',
        category: 'Damage Documentation',
        tags: ['vanity', 'cabinet', 'water']
      },
      {
        id: 'bath-3',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&q=80',
        title: 'Floor Tile Damage',
        description: 'Bathroom floor tiles lifting from water seepage',
        timestamp: '2024-03-19 16:34:00',
        category: 'Damage Documentation',
        tags: ['flooring', 'tiles', 'seepage']
      },
      {
        id: 'bath-4',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop&q=80',
        title: 'Fixture Damage',
        description: 'Damaged fixtures and plumbing connections',
        timestamp: '2024-03-19 16:36:00',
        category: 'Damage Documentation',
        tags: ['fixtures', 'plumbing', 'damage']
      },
      // Audio Note (1 total)
      {
        id: 'bath-audio-1',
        type: 'audio',
        url: '#',
        title: 'Bathroom Inspection Summary',
        transcript: 'Both bathrooms show significant water damage. The master bath has ceiling damage with visible mold growth that needs immediate attention. All vanities show water damage and swelling - replacement recommended. The exhaust fans are non-functional, likely from water damage to electrical components. Floor tiles are lifting in several areas due to water seepage. There\'s evidence of slow plumbing leaks that may have been exacerbated by the storm. Mold remediation is essential before any restoration work begins.',
        timestamp: '2024-03-19 16:38:00',
        category: 'Inspector Notes',
        duration: 42
      }
    ]
  },

  // 7. MASTER BEDROOM (NEW - COMPLETED)
  {
    areaId: 'interior-bedrooms',
    areaName: 'Master Bedroom',
    category: 'Interior',
    status: 'completed',
    completionPercentage: 100,
    findings: 'Ceiling water stains from roof leaks. Carpet damaged by water. Window seals compromised.',
    damageDescription: 'Water intrusion through roof affecting ceiling and carpeting. Windows show seal failure allowing moisture entry.',
    recommendedActions: 'Replace water-damaged carpet and padding. Repair ceiling drywall. Reseal all windows.',
    estimatedCost: 4200,
    priority: 'medium',
    media: [
      // Photos (3 total)
      {
        id: 'bedroom-1',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1505691723518-36a5ac3965ae?w=800&h=600&fit=crop&q=80',
        title: 'Ceiling Water Stains',
        description: 'Water stains and damage on bedroom ceiling',
        timestamp: '2024-03-19 16:40:00',
        category: 'Damage Documentation',
        tags: ['bedroom', 'ceiling', 'water-stains']
      },
      {
        id: 'bedroom-2',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop&q=80',
        title: 'Carpet Water Damage',
        description: 'Water-damaged carpet and padding',
        timestamp: '2024-03-19 16:42:00',
        category: 'Damage Documentation',
        tags: ['carpet', 'flooring', 'water']
      },
      {
        id: 'bedroom-3',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&q=80',
        title: 'Window Seal Failure',
        description: 'Compromised window seals allowing moisture',
        timestamp: '2024-03-19 16:44:00',
        category: 'Damage Documentation',
        tags: ['windows', 'seals', 'moisture']
      },
      // Audio Note (1 total)
      {
        id: 'bedroom-audio-1',
        type: 'audio',
        url: '#',
        title: 'Master Bedroom Assessment',
        transcript: 'The master bedroom has sustained water damage primarily from roof leaks. The ceiling shows multiple water stains and the drywall is soft in two areas, indicating saturation. The carpet is completely saturated along the north wall and has begun to develop a musty odor - full replacement with padding is necessary. All windows show signs of seal failure with condensation between panes. The closet also shows water damage on the ceiling. Overall, this room needs significant restoration but is structurally sound.',
        timestamp: '2024-03-19 16:46:00',
        category: 'Inspector Notes',
        duration: 38
      }
    ]
  },

  // 8. WINDOWS & DOORS (NEW - COMPLETED)
  {
    areaId: 'exterior-windows',
    areaName: 'Windows & Doors',
    category: 'Exterior',
    status: 'completed',
    completionPercentage: 100,
    findings: 'Multiple windows cracked or broken. Entry door frame damaged. Sliding door track bent.',
    damageDescription: 'Wind pressure and debris impact caused window failures. Door frames shifted due to structural movement.',
    recommendedActions: 'Replace all damaged windows. Realign and secure door frames. Replace sliding door track system.',
    estimatedCost: 6400,
    priority: 'high',
    media: [
      // Photos (3 total)
      {
        id: 'windows-1',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop&q=80',
        title: 'Broken Window Glass',
        description: 'Multiple windows with cracked or broken glass',
        timestamp: '2024-03-19 16:48:00',
        category: 'Damage Documentation',
        tags: ['windows', 'glass', 'broken']
      },
      {
        id: 'windows-2',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?w=800&h=600&fit=crop&q=80',
        title: 'Entry Door Frame Damage',
        description: 'Main entry door frame shifted and damaged',
        timestamp: '2024-03-19 16:50:00',
        category: 'Damage Documentation',
        tags: ['door', 'frame', 'structural']
      },
      {
        id: 'windows-3',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1524863479829-916d8e77f114?w=800&h=600&fit=crop&q=80',
        title: 'Sliding Door Track Damage',
        description: 'Bent sliding door track preventing operation',
        timestamp: '2024-03-19 16:52:00',
        category: 'Damage Documentation',
        tags: ['sliding-door', 'track', 'bent']
      },
      // Audio Note (1 total)
      {
        id: 'windows-audio-1',
        type: 'audio',
        url: '#',
        title: 'Windows and Doors Assessment',
        transcript: 'The property has sustained significant damage to windows and doors. I count at least six windows with either cracked or completely broken glass - these pose immediate safety and security concerns. The main entry door frame has shifted approximately two inches, making the door difficult to close properly. The rear sliding door track is severely bent, rendering it inoperable. All damaged windows need immediate boarding and replacement. The door frames will require professional realignment. This is a high priority for both security and weather protection.',
        timestamp: '2024-03-19 16:54:00',
        category: 'Inspector Notes',
        duration: 45
      }
    ]
  },

  // REMAINING AREAS - SKIPPED OR NOT STARTED
  {
    areaId: 'interior-other',
    areaName: 'Other Bedrooms',
    category: 'Interior',
    status: 'skipped',
    completionPercentage: 0,
    findings: '',
    damageDescription: '',
    recommendedActions: '',
    estimatedCost: 0,
    priority: 'low',
    media: []
  },
  {
    areaId: 'interior-basement',
    areaName: 'Basement/Attic',
    category: 'Interior',
    status: 'skipped',
    completionPercentage: 0,
    findings: '',
    damageDescription: '',
    recommendedActions: '',
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
    recommendedActions: '',
    estimatedCost: 0,
    priority: 'low',
    media: []
  },
  {
    areaId: 'exterior-landscaping',
    areaName: 'Landscaping',
    category: 'Exterior',
    status: 'not_started',
    completionPercentage: 0,
    findings: '',
    damageDescription: '',
    recommendedActions: '',
    estimatedCost: 0,
    priority: 'low',
    media: []
  },
  {
    areaId: 'systems-electrical',
    areaName: 'Electrical',
    category: 'Systems',
    status: 'not_started',
    completionPercentage: 0,
    findings: '',
    damageDescription: '',
    recommendedActions: '',
    estimatedCost: 0,
    priority: 'low',
    media: []
  },
  {
    areaId: 'systems-plumbing',
    areaName: 'Plumbing',
    category: 'Systems',
    status: 'not_started',
    completionPercentage: 0,
    findings: '',
    damageDescription: '',
    recommendedActions: '',
    estimatedCost: 0,
    priority: 'low',
    media: []
  }
]

// Inspection Summary Data
export const inspectionSummary = {
  inspectionId: 'INS-002',
  claimNumber: 'CLM-2024-002',
  propertyAddress: '5678 Palm Avenue, Coral Gables, FL',
  clientName: 'Sarah Thompson',
  inspector: 'Maria Garcia',
  startTime: '2024-03-19T14:00:00',
  elapsedTime: '3h 15m',
  weatherConditions: 'Partly Cloudy, 78°F',
  nextArea: 'Foundation',
  criticalFindings: 3,
  safetyHazardsIdentified: [
    'Exposed electrical wiring in living room',
    'Broken glass from windows poses injury risk',
    'Structural instability in roof decking'
  ],
  immediateActions: [
    'Tarp roof to prevent further water intrusion',
    'Board broken windows for security',
    'Disconnect power to affected electrical circuits'
  ]
}

// Helper Functions
export function getInspectionProgress() {
  const total = inspectionMediaData.length
  const completed = inspectionMediaData.filter(area => area.status === 'completed').length
  const inProgress = inspectionMediaData.filter(area => area.status === 'in_progress').length
  const percentage = Math.round((completed / total) * 100)

  return {
    total,
    completed,
    inProgress,
    remaining: total - completed - inProgress,
    percentage,
    estimatedTimeRemaining: `${(total - completed) * 30} mins`
  }
}

export function getAllPhotos() {
  const allPhotos: MediaFile[] = []
  inspectionMediaData.forEach(area => {
    area.media
      .filter(media => media.type === 'photo')
      .forEach(photo => allPhotos.push(photo))
  })
  return allPhotos // Returns 51 photos
}

export function getAllVoiceNotes() {
  const allNotes: MediaFile[] = []
  inspectionMediaData.forEach(area => {
    area.media
      .filter(media => media.type === 'audio')
      .forEach(note => allNotes.push(note))
  })
  return allNotes // Returns 12 audio notes
}

export function getTotalEstimatedDamage() {
  return inspectionMediaData.reduce((total, area) => total + area.estimatedCost, 0)
}

// Function to get area by ID
export function getAreaById(areaId: string): AreaInspectionData | undefined {
  return inspectionMediaData.find(area => area.areaId === areaId)
}