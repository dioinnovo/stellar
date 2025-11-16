import { 
  Home, 
  Building2, 
  Droplets, 
  Wind, 
  Zap, 
  Eye, 
  AlertTriangle,
  Camera, 
  FileText, 
  CheckCircle, 
  SkipForward, 
  ArrowRight,
  ChevronDown, 
  ChevronUp, 
  X, 
  Check,
  Building,
  PaintBucket,
  DoorOpen,
  Box,
  TreePine,
  Sofa,
  UtensilsCrossed,
  Bed,
  Bath,
  Home as Stairs, // Using Home as fallback for Stairs
  Fan,
  FlameKindling,
  ShowerHead,
  ParkingCircle,
  Store,
  Archive,
  Wrench,
  Shield,
  LucideIcon
} from 'lucide-react'

export interface InspectionAreaIcon {
  id: string
  name: string
  category: string
  icon: LucideIcon
  color: string
  bgColor: string
}

// Residential Property Areas (14 areas)
export const RESIDENTIAL_AREA_ICONS: InspectionAreaIcon[] = [
  // Exterior (5 areas)
  { 
    id: 'exterior-roof', 
    name: 'Roof & Gutters', 
    category: 'Exterior', 
    icon: Home,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  { 
    id: 'exterior-siding', 
    name: 'Siding & Walls', 
    category: 'Exterior', 
    icon: PaintBucket,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  { 
    id: 'exterior-windows', 
    name: 'Windows & Doors', 
    category: 'Exterior', 
    icon: DoorOpen,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  { 
    id: 'exterior-foundation', 
    name: 'Foundation', 
    category: 'Exterior', 
    icon: Box,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  { 
    id: 'exterior-landscape', 
    name: 'Landscape & Drainage', 
    category: 'Exterior', 
    icon: TreePine,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  
  // Interior Rooms (6 areas)
  { 
    id: 'interior-living', 
    name: 'Living Room', 
    category: 'Interior', 
    icon: Sofa,
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  { 
    id: 'interior-kitchen', 
    name: 'Kitchen', 
    category: 'Interior', 
    icon: UtensilsCrossed,
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  { 
    id: 'interior-master-bed', 
    name: 'Master Bedroom', 
    category: 'Interior', 
    icon: Bed,
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  { 
    id: 'interior-bedrooms', 
    name: 'Other Bedrooms', 
    category: 'Interior', 
    icon: Bed,
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  { 
    id: 'interior-bathrooms', 
    name: 'Bathrooms', 
    category: 'Interior', 
    icon: Bath,
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  { 
    id: 'interior-basement', 
    name: 'Basement/Attic', 
    category: 'Interior', 
    icon: Stairs,
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  
  // Systems (3 areas)
  { 
    id: 'systems-hvac', 
    name: 'HVAC System', 
    category: 'Systems', 
    icon: Wind,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
  { 
    id: 'systems-electrical', 
    name: 'Electrical', 
    category: 'Systems', 
    icon: Zap,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
  { 
    id: 'systems-plumbing', 
    name: 'Plumbing', 
    category: 'Systems', 
    icon: Droplets,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
]

// Commercial Property Areas (11 areas)
export const COMMERCIAL_AREA_ICONS: InspectionAreaIcon[] = [
  // Exterior (4 areas)
  { 
    id: 'exterior-building', 
    name: 'Building Envelope', 
    category: 'Exterior', 
    icon: Building2,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  { 
    id: 'exterior-roof-commercial', 
    name: 'Roof Systems', 
    category: 'Exterior', 
    icon: Building,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  { 
    id: 'exterior-hvac-units', 
    name: 'Exterior HVAC', 
    category: 'Exterior', 
    icon: Fan,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  { 
    id: 'exterior-parking', 
    name: 'Parking & Access', 
    category: 'Exterior', 
    icon: ParkingCircle,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  
  // Interior Spaces (4 areas)
  { 
    id: 'interior-retail', 
    name: 'Retail/Office Areas', 
    category: 'Interior', 
    icon: Store,
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  { 
    id: 'interior-storage', 
    name: 'Storage Areas', 
    category: 'Interior', 
    icon: Archive,
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  { 
    id: 'interior-restrooms', 
    name: 'Restrooms', 
    category: 'Interior', 
    icon: ShowerHead,
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  { 
    id: 'interior-mechanical', 
    name: 'Mechanical Rooms', 
    category: 'Interior', 
    icon: Wrench,
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  
  // Systems (3 areas)
  { 
    id: 'systems-fire', 
    name: 'Fire Suppression', 
    category: 'Systems', 
    icon: FlameKindling,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
  { 
    id: 'systems-security', 
    name: 'Security Systems', 
    category: 'Systems', 
    icon: Shield,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
  { 
    id: 'systems-commercial-hvac', 
    name: 'Commercial HVAC', 
    category: 'Systems', 
    icon: Wind,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
]

// Helper function to get icon by area ID
export function getAreaIcon(areaId: string, propertyType: 'residential' | 'commercial'): InspectionAreaIcon | undefined {
  const icons = propertyType === 'residential' ? RESIDENTIAL_AREA_ICONS : COMMERCIAL_AREA_ICONS
  return icons.find(icon => icon.id === areaId)
}

// Helper function to get category color
export function getCategoryColor(category: string): { color: string; bgColor: string; borderColor: string } {
  switch (category) {
    case 'Exterior':
      return {
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        borderColor: 'border-blue-300'
      }
    case 'Interior':
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-300'
      }
    case 'Systems':
      return {
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        borderColor: 'border-purple-300'
      }
    default:
      return {
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-300'
      }
  }
}

// Helper function to get status color and icon
export function getStatusInfo(status?: 'not_started' | 'in_progress' | 'completed' | 'skipped') {
  switch (status) {
    case 'completed':
      return {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-400',
        badgeVariant: 'success' as const
      }
    case 'in_progress':
      return {
        icon: ArrowRight,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        borderColor: 'border-blue-400',
        badgeVariant: 'info' as const
      }
    case 'skipped':
      return {
        icon: SkipForward,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        borderColor: 'border-yellow-400',
        badgeVariant: 'warning' as const
      }
    default:
      return {
        icon: Camera,
        color: 'text-gray-500',
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-300',
        badgeVariant: 'outline' as const
      }
  }
}