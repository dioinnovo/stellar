// Complete demo inspection data for INS-002
// Total: 41 photos across 5 completed areas

export const demoInspectionAreas = {
  'exterior-roof': {
    areaId: 'exterior-roof',
    areaName: 'Roof & Gutters',
    category: 'Exterior',
    status: 'completed' as const,
    completionPercentage: 100,
    findings: 'Extensive damage to asphalt shingles on south-facing slope. Multiple missing tiles creating water entry points. Gutters detached in three sections.',
    damageDescription: 'Hurricane-force winds have caused significant uplift of roofing materials. Water intrusion evident through attic space affecting interior ceilings.',
    recommendedActions: 'Immediate tarping required. Full roof replacement recommended within 30 days to prevent further water damage.',
    estimatedCost: 18500,
    priority: 'high' as const,
    media: [
      // Photos (8 total)
      {
        id: 'roof-1',
        type: 'photo' as const,
        url: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800&h=600&fit=crop&q=80',
        title: 'Missing Roof Tiles - South Slope',
        description: 'Multiple tiles missing exposing underlayment',
        timestamp: '2024-03-19 14:15:00',
        category: 'Damage Documentation',
        tags: ['roof', 'critical', 'water-entry']
      },
      {
        id: 'roof-2',
        type: 'photo' as const,
        url: 'https://images.unsplash.com/photo-1632829882891-5047ccc421bc?w=800&h=600&fit=crop&q=80',
        title: 'Damaged Flashing Around Chimney',
        description: 'Flashing separated allowing water penetration',
        timestamp: '2024-03-19 14:18:00',
        category: 'Damage Documentation',
        tags: ['flashing', 'water-damage', 'chimney']
      },
      {
        id: 'roof-3',
        type: 'photo' as const,
        url: 'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=800&h=600&fit=crop&q=80',
        title: 'Gutter System Damage',
        description: 'Gutters detached and bent from debris impact',
        timestamp: '2024-03-19 14:22:00',
        category: 'Damage Documentation',
        tags: ['gutters', 'drainage', 'structural']
      },
      {
        id: 'roof-4',
        type: 'photo' as const,
        url: 'https://images.unsplash.com/photo-1609767500458-d2a133f61cab?w=800&h=600&fit=crop&q=80',
        title: 'Ridge Cap Damage',
        description: 'Ridge cap tiles displaced exposing roof peak',
        timestamp: '2024-03-19 14:24:00',
        category: 'Damage Documentation',
        tags: ['ridge', 'critical', 'water-entry']
      },
      {
        id: 'roof-5',
        type: 'photo' as const,
        url: 'https://images.unsplash.com/photo-1621873495884-845a939892c5?w=800&h=600&fit=crop&q=80',
        title: 'Soffit and Fascia Damage',
        description: 'Wind damage to soffit panels and fascia boards',
        timestamp: '2024-03-19 14:26:00',
        category: 'Damage Documentation',
        tags: ['soffit', 'fascia', 'wind-damage']
      },
      {
        id: 'roof-6',
        type: 'photo' as const,
        url: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800&h=600&fit=crop&q=80',
        title: 'Valley Flashing Failure',
        description: 'Valley flashing torn and lifted',
        timestamp: '2024-03-19 14:28:00',
        category: 'Damage Documentation',
        tags: ['valley', 'flashing', 'critical']
      },
      {
        id: 'roof-7',
        type: 'photo' as const,
        url: 'https://images.unsplash.com/photo-1604079628040-94301bb21b91?w=800&h=600&fit=crop&q=80',
        title: 'Roof Deck Exposure',
        description: 'Large section of roof deck exposed after shingle loss',
        timestamp: '2024-03-19 14:30:00',
        category: 'Damage Documentation',
        tags: ['deck', 'exposure', 'urgent']
      },
      {
        id: 'roof-8',
        type: 'photo' as const,
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
        type: 'audio' as const,
        url: '#',
        title: 'Initial Roof Assessment',
        transcript: 'Initial roof inspection reveals approximately 30% of shingles are either missing or severely damaged. The underlayment is exposed in multiple areas, particularly on the south and west-facing slopes. There is clear evidence of water intrusion through the decking. I recommend immediate temporary repairs followed by full replacement. The flashing around all penetrations needs replacement, and the entire gutter system requires reinstallation.',
        timestamp: '2024-03-19 14:25:00',
        category: 'Inspector Notes',
        duration: 45
      },
      {
        id: 'roof-audio-2',
        type: 'audio' as const,
        url: '#',
        title: 'Structural Concerns',
        transcript: 'Upon closer inspection of the roof structure, I\'ve identified several areas of concern beyond the visible shingle damage. The roof decking shows signs of water saturation in at least three locations. The ridge beam appears to have shifted slightly, likely due to the extreme wind forces. Additionally, several rafters may need sistering or replacement. The attic inspection reveals daylight visible through multiple points, confirming the extent of the damage. Priority should be given to waterproofing immediately.',
        timestamp: '2024-03-19 14:35:00',
        category: 'Inspector Notes',
        duration: 52
      }
    ]
  },
  'exterior-siding': {
    areaId: 'exterior-siding',
    areaName: 'Siding & Walls',
    category: 'Exterior',
    status: 'completed' as const,
    completionPercentage: 100,
    findings: 'Vinyl siding shows impact damage on east and south walls. Multiple panels cracked or missing. Water staining visible behind damaged sections.',
    damageDescription: 'Wind-driven debris has caused extensive impact damage to siding. Water infiltration behind siding has caused substrate damage.',
    recommendedActions: 'Replace damaged siding sections. Inspect and replace water-damaged sheathing. Apply moisture barrier before new siding installation.',
    estimatedCost: 8750,
    priority: 'high' as const,
    media: [
      // Photos (6 total)
      {
        id: 'siding-1',
        type: 'photo' as const,
        url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=600&fit=crop&q=80',
        title: 'Impact Damage - East Wall',
        description: 'Multiple impact points from wind-driven debris',
        timestamp: '2024-03-19 14:50:00',
        category: 'Damage Documentation',
        tags: ['siding', 'impact', 'structural']
      },
      {
        id: 'siding-2',
        type: 'photo' as const,
        url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80',
        title: 'Water Damage Behind Siding',
        description: 'Moisture damage to sheathing visible through gaps',
        timestamp: '2024-03-19 14:52:00',
        category: 'Damage Documentation',
        tags: ['water-damage', 'structural', 'hidden-damage']
      },
      {
        id: 'siding-3',
        type: 'photo' as const,
        url: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800&h=600&fit=crop&q=80',
        title: 'Cracked Vinyl Panels',
        description: 'Multiple cracked and broken vinyl siding panels',
        timestamp: '2024-03-19 14:54:00',
        category: 'Damage Documentation',
        tags: ['vinyl', 'cracks', 'replacement']
      },
      {
        id: 'siding-4',
        type: 'photo' as const,
        url: 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=800&h=600&fit=crop&q=80',
        title: 'Corner Trim Separation',
        description: 'Corner trim pieces pulled away from structure',
        timestamp: '2024-03-19 14:56:00',
        category: 'Damage Documentation',
        tags: ['trim', 'separation', 'wind-damage']
      },
      {
        id: 'siding-5',
        type: 'photo' as const,
        url: 'https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?w=800&h=600&fit=crop&q=80',
        title: 'South Wall Missing Panels',
        description: 'Large section of siding missing on south wall',
        timestamp: '2024-03-19 14:58:00',
        category: 'Damage Documentation',
        tags: ['missing', 'exposed', 'urgent']
      },
      {
        id: 'siding-6',
        type: 'photo' as const,
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
        type: 'audio' as const,
        url: '#',
        title: 'Exterior Wall Assessment',
        transcript: 'The exterior siding has sustained significant damage from the storm. Approximately 40% of the vinyl siding panels show either impact damage, cracks, or complete failure. The east and south walls bore the brunt of the wind damage. I can see exposed sheathing in several areas where panels have been completely torn off. There\'s evidence of water infiltration behind the remaining siding, particularly around windows and doors. The home wrap is torn in multiple locations. All damaged sections will need removal and replacement, including proper moisture barrier installation.',
        timestamp: '2024-03-19 15:02:00',
        category: 'Inspector Notes',
        duration: 38
      }
    ]
  },
  'interior-living': {
    areaId: 'interior-living',
    areaName: 'Living Room',
    category: 'Interior',
    status: 'completed' as const,
    completionPercentage: 100,
    findings: 'Ceiling shows extensive water damage with visible staining and sagging drywall. Hardwood flooring has begun to buckle near exterior wall.',
    damageDescription: 'Water intrusion from roof damage has affected ceiling and flooring. Drywall saturated in multiple areas requiring replacement.',
    recommendedActions: 'Remove and replace affected drywall. Sand and refinish hardwood floors. Check for mold growth behind walls.',
    estimatedCost: 6500,
    priority: 'medium' as const,
    media: [
      // Photos (12 total)
      {
        id: 'living-1',
        type: 'photo' as const,
        url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop&q=80',
        title: 'Ceiling Water Damage',
        description: 'Extensive water staining and drywall damage',
        timestamp: '2024-03-19 15:10:00',
        category: 'Damage Documentation',
        tags: ['ceiling', 'water-damage', 'drywall']
      },
      {
        id: 'living-2',
        type: 'photo' as const,
        url: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&h=600&fit=crop&q=80',
        title: 'Buckled Hardwood Flooring',
        description: 'Floor warping due to water exposure',
        timestamp: '2024-03-19 15:12:00',
        category: 'Damage Documentation',
        tags: ['flooring', 'water-damage', 'hardwood']
      },
      {
        id: 'living-3',
        type: 'photo' as const,
        url: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=800&h=600&fit=crop&q=80',
        title: 'Window Frame Water Intrusion',
        description: 'Water damage around window frames',
        timestamp: '2024-03-19 15:14:00',
        category: 'Damage Documentation',
        tags: ['window', 'water-damage', 'seal']
      },
      {
        id: 'living-4',
        type: 'photo' as const,
        url: 'https://images.unsplash.com/photo-1565183928294-7d21b36e9c7b?w=800&h=600&fit=crop&q=80',
        title: 'Wall Moisture Damage',
        description: 'Paint bubbling and peeling from moisture',
        timestamp: '2024-03-19 15:16:00',
        category: 'Damage Documentation',
        tags: ['wall', 'moisture', 'paint']
      },
      {
        id: 'living-5',
        type: 'photo' as const,
        url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop&q=80',
        title: 'Damaged Furniture',
        description: 'Water-damaged sofa and furnishings',
        timestamp: '2024-03-19 15:18:00',
        category: 'Content Documentation',
        tags: ['furniture', 'contents', 'water-damage']
      },
      {
        id: 'living-6',
        type: 'photo' as const,
        url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80',
        title: 'Ceiling Fan Damage',
        description: 'Ceiling fan affected by water from above',
        timestamp: '2024-03-19 15:20:00',
        category: 'Damage Documentation',
        tags: ['electrical', 'ceiling-fan', 'water']
      },
      {
        id: 'living-7',
        type: 'photo' as const,
        url: 'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800&h=600&fit=crop&q=80',
        title: 'Crown Molding Separation',
        description: 'Crown molding pulling away due to moisture',
        timestamp: '2024-03-19 15:22:00',
        category: 'Damage Documentation',
        tags: ['molding', 'separation', 'moisture']
      },
      {
        id: 'living-8',
        type: 'photo' as const,
        url: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&h=600&fit=crop&q=80',
        title: 'Fireplace Water Staining',
        description: 'Water staining around fireplace chimney',
        timestamp: '2024-03-19 15:24:00',
        category: 'Damage Documentation',
        tags: ['fireplace', 'chimney', 'water-stain']
      },
      {
        id: 'living-9',
        type: 'photo' as const,
        url: 'https://images.unsplash.com/photo-1538688525999-5f0f74a62f2c?w=800&h=600&fit=crop&q=80',
        title: 'Baseboard Damage',
        description: 'Baseboards swollen from water exposure',
        timestamp: '2024-03-19 15:26:00',
        category: 'Damage Documentation',
        tags: ['baseboard', 'swelling', 'water']
      },
      {
        id: 'living-10',
        type: 'photo' as const,
        url: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=800&h=600&fit=crop&q=80',
        title: 'Electrical Outlet Concern',
        description: 'Water near electrical outlets - safety hazard',
        timestamp: '2024-03-19 15:28:00',
        category: 'Safety Documentation',
        tags: ['electrical', 'safety', 'urgent']
      },
      {
        id: 'living-11',
        type: 'photo' as const,
        url: 'https://images.unsplash.com/photo-1558211583-d26f610c1eb1?w=800&h=600&fit=crop&q=80',
        title: 'Entertainment Center Damage',
        description: 'Built-in entertainment center water damage',
        timestamp: '2024-03-19 15:30:00',
        category: 'Damage Documentation',
        tags: ['built-in', 'cabinetry', 'water']
      },
      {
        id: 'living-12',
        type: 'photo' as const,
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
        type: 'audio' as const,
        url: '#',
        title: 'Initial Living Room Assessment',
        transcript: 'The living room has sustained significant water damage from the compromised roof. The ceiling shows extensive staining across approximately 60% of its surface, with active sagging in two locations. The drywall is saturated and will require complete replacement in affected areas. The hardwood flooring near the exterior wall is already showing signs of buckling and will need professional attention.',
        timestamp: '2024-03-19 15:34:00',
        category: 'Inspector Notes',
        duration: 42
      },
      {
        id: 'living-audio-2',
        type: 'audio' as const,
        url: '#',
        title: 'Electrical and Safety Concerns',
        transcript: 'I have serious concerns about the electrical systems in this room. There\'s visible water damage near several outlets and the ceiling fan fixture. I strongly recommend having an electrician inspect all electrical components before restoration begins. The outlets on the north wall should be considered unsafe until properly inspected. Additionally, the moisture levels suggest potential for mold growth if not addressed immediately.',
        timestamp: '2024-03-19 15:36:00',
        category: 'Safety Notes',
        duration: 35
      },
      {
        id: 'living-audio-3',
        type: 'audio' as const,
        url: '#',
        title: 'Contents and Restoration Notes',
        transcript: 'Several pieces of furniture show water damage including the sofa, area rug, and wooden coffee table. The built-in entertainment center has water damage on the upper shelves. Electronics should be professionally inspected before use. The fireplace appears structurally sound but shows water staining from chimney leaks. Overall, this room will require extensive restoration including drywall replacement, flooring refinishing, repainting, and electrical inspection.',
        timestamp: '2024-03-19 15:38:00',
        category: 'Restoration Notes',
        duration: 48
      }
    ]
  },
  'interior-kitchen': {
    areaId: 'interior-kitchen',
    areaName: 'Kitchen',
    category: 'Interior',
    status: 'completed' as const,
    completionPercentage: 100,
    findings: 'Water damage to ceiling and upper cabinets. Several appliances affected by water exposure. Flooring shows signs of water damage near sink area.',
    damageDescription: 'Roof leaks have caused water damage to kitchen ceiling and upper cabinetry. Standing water affected flooring and lower cabinets.',
    recommendedActions: 'Replace water-damaged cabinets. Test all appliances for water damage. Replace affected flooring sections. Check for mold in cabinet interiors.',
    estimatedCost: 12300,
    priority: 'high' as const,
    media: [
      // Photos (10 total)
      {
        id: 'kitchen-1',
        type: 'photo' as const,
        url: 'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=800&h=600&fit=crop&q=80',
        title: 'Ceiling Water Damage',
        description: 'Kitchen ceiling showing water stains and damage',
        timestamp: '2024-03-19 15:45:00',
        category: 'Damage Documentation',
        tags: ['ceiling', 'water-damage', 'kitchen']
      },
      {
        id: 'kitchen-2',
        type: 'photo' as const,
        url: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800&h=600&fit=crop&q=80',
        title: 'Upper Cabinet Damage',
        description: 'Water damage to upper kitchen cabinets',
        timestamp: '2024-03-19 15:47:00',
        category: 'Damage Documentation',
        tags: ['cabinets', 'water-damage', 'upper']
      },
      {
        id: 'kitchen-3',
        type: 'photo' as const,
        url: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&h=600&fit=crop&q=80',
        title: 'Appliance Water Exposure',
        description: 'Refrigerator and dishwasher affected by water',
        timestamp: '2024-03-19 15:49:00',
        category: 'Damage Documentation',
        tags: ['appliances', 'water-exposure', 'electrical']
      },
      {
        id: 'kitchen-4',
        type: 'photo' as const,
        url: 'https://images.unsplash.com/photo-1556912167-f556f1f39faa?w=800&h=600&fit=crop&q=80',
        title: 'Countertop Water Damage',
        description: 'Water pooling and damage on countertops',
        timestamp: '2024-03-19 15:51:00',
        category: 'Damage Documentation',
        tags: ['countertop', 'water-pooling', 'damage']
      },
      {
        id: 'kitchen-5',
        type: 'photo' as const,
        url: 'https://images.unsplash.com/photo-1574739782594-db4ead022697?w=800&h=600&fit=crop&q=80',
        title: 'Floor Water Damage',
        description: 'Kitchen floor tiles lifting due to water',
        timestamp: '2024-03-19 15:53:00',
        category: 'Damage Documentation',
        tags: ['flooring', 'tiles', 'water-damage']
      },
      {
        id: 'kitchen-6',
        type: 'photo' as const,
        url: 'https://images.unsplash.com/photo-1556911073-52527ac43761?w=800&h=600&fit=crop&q=80',
        title: 'Backsplash Damage',
        description: 'Backsplash tiles loose from moisture',
        timestamp: '2024-03-19 15:55:00',
        category: 'Damage Documentation',
        tags: ['backsplash', 'tiles', 'moisture']
      },
      {
        id: 'kitchen-7',
        type: 'photo' as const,
        url: 'https://images.unsplash.com/photo-1564540586988-aa4e53c3d799?w=800&h=600&fit=crop&q=80',
        title: 'Pantry Water Damage',
        description: 'Water damage in pantry area',
        timestamp: '2024-03-19 15:57:00',
        category: 'Damage Documentation',
        tags: ['pantry', 'storage', 'water']
      },
      {
        id: 'kitchen-8',
        type: 'photo' as const,
        url: 'https://images.unsplash.com/photo-1556911899-5df0cb05aae0?w=800&h=600&fit=crop&q=80',
        title: 'Island Damage',
        description: 'Kitchen island showing water damage',
        timestamp: '2024-03-19 15:59:00',
        category: 'Damage Documentation',
        tags: ['island', 'cabinetry', 'water']
      },
      {
        id: 'kitchen-9',
        type: 'photo' as const,
        url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&h=600&fit=crop&q=80',
        title: 'Light Fixture Concern',
        description: 'Pendant lights affected by ceiling water',
        timestamp: '2024-03-19 16:01:00',
        category: 'Safety Documentation',
        tags: ['lighting', 'electrical', 'safety']
      },
      {
        id: 'kitchen-10',
        type: 'photo' as const,
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
        type: 'audio' as const,
        url: '#',
        title: 'Kitchen Damage Assessment',
        transcript: 'The kitchen has sustained significant water damage primarily from roof leaks above. The ceiling drywall is compromised in multiple areas and will need replacement. Upper cabinets show water damage and swelling - I recommend complete replacement of affected units. The countertops have standing water damage, and several appliances have been exposed to water. The refrigerator, dishwasher, and microwave all need professional inspection before use.',
        timestamp: '2024-03-19 16:05:00',
        category: 'Inspector Notes',
        duration: 40
      },
      {
        id: 'kitchen-audio-2',
        type: 'audio' as const,
        url: '#',
        title: 'Kitchen Restoration Priorities',
        transcript: 'Priority items for kitchen restoration include immediate water extraction and drying to prevent mold growth. The electrical systems need inspection, particularly for the pendant lights and under-cabinet lighting. All appliances should be professionally evaluated. The tile flooring near the sink shows signs of lifting and will need re-securing or replacement. Cabinet interiors need mold inspection and treatment. Total kitchen restoration will be substantial but necessary for safe use.',
        timestamp: '2024-03-19 16:07:00',
        category: 'Restoration Notes',
        duration: 45
      }
    ]
  },
  'systems-hvac': {
    areaId: 'systems-hvac',
    areaName: 'HVAC System',
    category: 'Systems',
    status: 'completed' as const,
    completionPercentage: 100,
    findings: 'HVAC unit shows impact damage. Ductwork compromised in attic space. System contaminated with water and debris.',
    damageDescription: 'Outdoor condensing unit damaged by flying debris. Indoor air handler exposed to water. Ductwork torn and contaminated.',
    recommendedActions: 'Replace outdoor condensing unit. Clean and sanitize entire duct system. Replace air handler if water damage confirmed.',
    estimatedCost: 7200,
    priority: 'high' as const,
    media: [
      // Photos (5 total)
      {
        id: 'hvac-1',
        type: 'photo' as const,
        url: 'https://images.unsplash.com/photo-1599667442166-c0fc7fdb0439?w=800&h=600&fit=crop&q=80',
        title: 'Outdoor Unit Damage',
        description: 'Condensing unit damaged by debris impact',
        timestamp: '2024-03-19 16:15:00',
        category: 'Damage Documentation',
        tags: ['hvac', 'outdoor', 'impact']
      },
      {
        id: 'hvac-2',
        type: 'photo' as const,
        url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80',
        title: 'Air Handler Water Damage',
        description: 'Indoor air handler showing water exposure',
        timestamp: '2024-03-19 16:17:00',
        category: 'Damage Documentation',
        tags: ['air-handler', 'water', 'indoor']
      },
      {
        id: 'hvac-3',
        type: 'photo' as const,
        url: 'https://images.unsplash.com/photo-1607400201515-76f69495c323?w=800&h=600&fit=crop&q=80',
        title: 'Ductwork Damage',
        description: 'Torn and damaged ductwork in attic',
        timestamp: '2024-03-19 16:19:00',
        category: 'Damage Documentation',
        tags: ['ductwork', 'attic', 'torn']
      },
      {
        id: 'hvac-4',
        type: 'photo' as const,
        url: 'https://images.unsplash.com/photo-1585338447937-f6f1b166bd6f?w=800&h=600&fit=crop&q=80',
        title: 'Thermostat and Controls',
        description: 'Control systems affected by power surge',
        timestamp: '2024-03-19 16:21:00',
        category: 'Damage Documentation',
        tags: ['thermostat', 'controls', 'electrical']
      },
      {
        id: 'hvac-5',
        type: 'photo' as const,
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
        type: 'audio' as const,
        url: '#',
        title: 'HVAC System Assessment',
        transcript: 'The HVAC system has sustained significant damage and is currently non-operational. The outdoor condensing unit took a direct hit from debris, bending the fins and damaging the fan motor. The refrigerant lines are compromised. Inside, the air handler has been exposed to water, which is a serious concern for electrical components and potential mold growth. The ductwork in the attic is torn in multiple locations and contaminated with insulation and debris. This system will require comprehensive replacement of the outdoor unit and extensive cleaning and repair of the indoor components.',
        timestamp: '2024-03-19 16:25:00',
        category: 'Inspector Notes',
        duration: 55
      }
    ]
  },
  // SKIPPED AREAS
  'interior-kitchen-dining': {
    areaId: 'interior-kitchen-dining',
    areaName: 'Dining Room',
    category: 'Interior',
    status: 'skipped' as const,
    completionPercentage: 0,
    findings: '',
    damageDescription: '',
    recommendedActions: '',
    estimatedCost: 0,
    priority: 'low' as const,
    media: []
  },
  'interior-bedrooms': {
    areaId: 'interior-bedrooms',
    areaName: 'Bedrooms',
    category: 'Interior',
    status: 'skipped' as const,
    completionPercentage: 0,
    findings: '',
    damageDescription: '',
    recommendedActions: '',
    estimatedCost: 0,
    priority: 'low' as const,
    media: []
  },
  'interior-bathrooms': {
    areaId: 'interior-bathrooms',
    areaName: 'Bathrooms',
    category: 'Interior',
    status: 'skipped' as const,
    completionPercentage: 0,
    findings: '',
    damageDescription: '',
    recommendedActions: '',
    estimatedCost: 0,
    priority: 'low' as const,
    media: []
  },
  'interior-other': {
    areaId: 'interior-other',
    areaName: 'Other Bedrooms',
    category: 'Interior',
    status: 'skipped' as const,
    completionPercentage: 0,
    findings: '',
    damageDescription: '',
    recommendedActions: '',
    estimatedCost: 0,
    priority: 'low' as const,
    media: []
  },
  'interior-basement': {
    areaId: 'interior-basement',
    areaName: 'Basement/Attic',
    category: 'Interior',
    status: 'skipped' as const,
    completionPercentage: 0,
    findings: '',
    damageDescription: '',
    recommendedActions: '',
    estimatedCost: 0,
    priority: 'low' as const,
    media: []
  },
  'exterior-foundation': {
    areaId: 'exterior-foundation',
    areaName: 'Foundation',
    category: 'Exterior',
    status: 'not_started' as const,
    completionPercentage: 0,
    findings: '',
    damageDescription: '',
    recommendedActions: '',
    estimatedCost: 0,
    priority: 'low' as const,
    media: []
  },
  'exterior-windows': {
    areaId: 'exterior-windows',
    areaName: 'Windows & Doors',
    category: 'Exterior',
    status: 'not_started' as const,
    completionPercentage: 0,
    findings: '',
    damageDescription: '',
    recommendedActions: '',
    estimatedCost: 0,
    priority: 'low' as const,
    media: []
  },
  'exterior-landscaping': {
    areaId: 'exterior-landscaping',
    areaName: 'Landscaping',
    category: 'Exterior',
    status: 'not_started' as const,
    completionPercentage: 0,
    findings: '',
    damageDescription: '',
    recommendedActions: '',
    estimatedCost: 0,
    priority: 'low' as const,
    media: []
  },
  'systems-electrical': {
    areaId: 'systems-electrical',
    areaName: 'Electrical',
    category: 'Systems',
    status: 'not_started' as const,
    completionPercentage: 0,
    findings: '',
    damageDescription: '',
    recommendedActions: '',
    estimatedCost: 0,
    priority: 'low' as const,
    media: []
  },
  'systems-plumbing': {
    areaId: 'systems-plumbing',
    areaName: 'Plumbing',
    category: 'Systems',
    status: 'not_started' as const,
    completionPercentage: 0,
    findings: '',
    damageDescription: '',
    recommendedActions: '',
    estimatedCost: 0,
    priority: 'low' as const,
    media: []
  }
};

// Helper function to get all photos
export function getDemoPhotos() {
  const allPhotos: any[] = [];
  Object.values(demoInspectionAreas).forEach(area => {
    if (area.media) {
      area.media.filter(m => m.type === 'photo').forEach(photo => {
        allPhotos.push({ ...photo, areaName: area.areaName });
      });
    }
  });
  return allPhotos;
}

// Helper function to get all audio notes
export function getDemoAudioNotes() {
  const allAudio: any[] = [];
  Object.values(demoInspectionAreas).forEach(area => {
    if (area.media) {
      area.media.filter(m => m.type === 'audio').forEach(audio => {
        allAudio.push({ ...audio, areaName: area.areaName });
      });
    }
  });
  return allAudio;
}

// Get total counts
export function getDemoTotals() {
  const photos = getDemoPhotos();
  const audioNotes = getDemoAudioNotes();
  const completedAreas = Object.values(demoInspectionAreas).filter(a => a.status === 'completed').length;
  const skippedAreas = Object.values(demoInspectionAreas).filter(a => a.status === 'skipped').length;
  const totalCost = Object.values(demoInspectionAreas).reduce((sum, area) => sum + (area.estimatedCost || 0), 0);

  return {
    totalPhotos: photos.length, // Should be 41
    totalAudioNotes: audioNotes.length, // Should be 9
    completedAreas,
    skippedAreas,
    totalAreas: Object.keys(demoInspectionAreas).length,
    estimatedTotalCost: totalCost
  };
}