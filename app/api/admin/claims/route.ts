import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Mock Prisma enums for demo environment
enum ClaimStatus {
  SUBMITTED = 'SUBMITTED',
  TRIAGING = 'TRIAGING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  ESTIMATING = 'ESTIMATING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SETTLED = 'SETTLED'
}

enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit
    
    // Filters
    const status = searchParams.get('status') as ClaimStatus | null
    const priority = searchParams.get('priority') as Priority | null
    const type = searchParams.get('type')
    const search = searchParams.get('search')
    
    // Build where clause
    const where: any = {}
    if (status) where.status = status
    if (priority) where.priority = priority
    if (type) where.type = type
    if (search) {
      where.OR = [
        { claimNumber: { contains: search } },
        { insuredName: { contains: search } },
        { insuredEmail: { contains: search } }
      ]
    }
    
    // Get claims with pagination
    const [claims, total] = await Promise.all([
      prisma.claim.findMany({
        where,
        skip,
        take: limit,
        orderBy: { submittedAt: 'desc' },
        include: {
          documents: {
            select: {
              id: true,
              filename: true,
              url: true
            }
          },
          workflows: {
            select: {
              id: true,
              name: true,
              status: true
            },
            orderBy: { triggeredAt: 'desc' },
            take: 1
          },
          lead: {
            select: {
              id: true,
              leadNumber: true,
              status: true,
              qualification: true
            }
          },
          _count: {
            select: {
              activities: true,
              notifications: true
            }
          }
        }
      }),
      prisma.claim.count({ where })
    ])
    
    // Calculate statistics
    const stats = await prisma.claim.groupBy({
      by: ['status'],
      _count: true,
      where: {
        submittedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    })
    
    const totalEstimate = await prisma.claim.aggregate({
      _sum: {
        estimatedAmount: true
      },
      where: {
        status: {
          in: [ClaimStatus.APPROVED, ClaimStatus.SETTLED]
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      data: {
        claims,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        statistics: {
          statusCounts: stats.reduce((acc, curr) => {
            acc[curr.status] = curr._count
            return acc
          }, {} as Record<string, number>),
          totalEstimatedAmount: totalEstimate._sum.estimatedAmount || 0,
          averageProcessingTime: '2.5 hours' // Mock for demo
        }
      }
    })
    
  } catch (error) {
    console.error('Error fetching claims:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch claims'
    }, { status: 500 })
  }
}

// Bulk update endpoint
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { claimIds, updates } = body
    
    if (!claimIds || !Array.isArray(claimIds) || claimIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid claim IDs'
      }, { status: 400 })
    }
    
    // Perform bulk update
    const result = await prisma.claim.updateMany({
      where: {
        id: { in: claimIds }
      },
      data: updates
    })
    
    // Log activities for each claim
    await prisma.activity.createMany({
      data: claimIds.map(claimId => ({
        claimId,
        action: 'BULK_UPDATE',
        description: `Bulk update: ${Object.keys(updates).join(', ')}`,
        metadata: JSON.stringify(updates)
      }))
    })
    
    return NextResponse.json({
      success: true,
      data: {
        updated: result.count
      }
    })
    
  } catch (error) {
    console.error('Error updating claims:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update claims'
    }, { status: 500 })
  }
}