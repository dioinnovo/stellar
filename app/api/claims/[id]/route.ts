import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const claim = await prisma.claim.findUnique({
      where: { id },
      include: {
        documents: true,
        workflows: {
          orderBy: { triggeredAt: 'desc' }
        },
        notifications: {
          orderBy: { createdAt: 'desc' }
        },
        activities: {
          orderBy: { createdAt: 'desc' }
        },
        enrichments: true,
        lead: true
      }
    })

    if (!claim) {
      return NextResponse.json({
        success: false,
        error: 'Claim not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: claim
    })
  } catch (error) {
    console.error('Error fetching claim:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch claim'
    }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    
    const claim = await prisma.claim.update({
      where: { id },
      data: body
    })

    // Log activity
    await prisma.activity.create({
      data: {
        claimId: id,
        action: 'CLAIM_UPDATED',
        description: `Claim updated: ${Object.keys(body).join(', ')}`,
        metadata: JSON.stringify(body)
      }
    })

    return NextResponse.json({
      success: true,
      data: claim
    })
  } catch (error) {
    console.error('Error updating claim:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update claim'
    }, { status: 500 })
  }
}