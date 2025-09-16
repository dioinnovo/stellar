// Mock Prisma implementation for demo environment
interface MockPrismaModel {
  create: (data: any) => Promise<any>
  findUnique: (data: any) => Promise<any>
  findFirst: (data: any) => Promise<any>
  findMany: (data: any) => Promise<any[]>
  update: (data: any) => Promise<any>
  updateMany: (data: any) => Promise<any>
  delete: (data: any) => Promise<any>
  createMany: (data: any) => Promise<any>
  count: (data: any) => Promise<number>
  groupBy: (data: any) => Promise<any[]>
  aggregate: (data: any) => Promise<any>
}

const createMockModel = (name: string): MockPrismaModel => ({
  create: async (data: any) => {
    console.log(`Mock Prisma: Creating ${name}`, data)
    return { id: `mock_${name}_${Date.now()}`, ...data.data }
  },
  findUnique: async (data: any) => {
    console.log(`Mock Prisma: Finding unique ${name}`, data)
    return null
  },
  findFirst: async (data: any) => {
    console.log(`Mock Prisma: Finding first ${name}`, data)
    return null
  },
  findMany: async (data: any) => {
    console.log(`Mock Prisma: Finding many ${name}`, data)
    return []
  },
  update: async (data: any) => {
    console.log(`Mock Prisma: Updating ${name}`, data)
    return { id: data.where.id, ...data.data }
  },
  delete: async (data: any) => {
    console.log(`Mock Prisma: Deleting ${name}`, data)
    return { id: data.where.id }
  },
  createMany: async (data: any) => {
    console.log(`Mock Prisma: Creating many ${name}`, data)
    return { count: data.data.length }
  },
  updateMany: async (data: any) => {
    console.log(`Mock Prisma: Updating many ${name}`, data)
    return { count: 1 }
  },
  count: async (data: any) => {
    console.log(`Mock Prisma: Counting ${name}`, data)
    return 0
  },
  groupBy: async (data: any) => {
    console.log(`Mock Prisma: Grouping ${name}`, data)
    return []
  },
  aggregate: async (data: any) => {
    console.log(`Mock Prisma: Aggregating ${name}`, data)
    return { _sum: { estimatedAmount: 0 } }
  }
})

export const prisma = {
  claim: createMockModel('claim'),
  document: createMockModel('document'),
  activity: createMockModel('activity'),
  workflow: createMockModel('workflow'),
  notification: createMockModel('notification'),
  enrichment: createMockModel('enrichment'),
  lead: createMockModel('lead'),
  $disconnect: async () => {
    console.log('Mock Prisma: Disconnecting')
  }
}

// Helper function to generate claim numbers
export function generateClaimNumber(type: 'commercial' | 'residential'): string {
  const prefix = type === 'commercial' ? 'CP' : 'RP'
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0')
  return `${prefix}-${year}-${random}`
}

// Helper function to generate lead numbers
export function generateLeadNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `LEAD-${timestamp}-${random}`
}