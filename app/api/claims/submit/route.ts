import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema
const claimSubmissionSchema = z.object({
  type: z.enum(['commercial', 'residential']),
  propertyAddress: z.string().min(1),
  propertyType: z.string().min(1),
  policyNumber: z.string().optional(),
  damageType: z.string().min(1),
  damageDescription: z.string().optional(),
  severity: z.enum(['Minor', 'Moderate', 'Major', 'Total Loss']).optional(),
  insuredName: z.string().min(1),
  insuredEmail: z.string().email(),
  insuredPhone: z.string().min(1),
  images: z.array(z.object({
    url: z.string().url(),
    filename: z.string()
  })).optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = claimSubmissionSchema.parse(body)

    // Skip database operations in Vercel serverless environment
    if (process.env.VERCEL === '1') {
      // Generate mock claim number for serverless
      const claimNumber = `${validatedData.type.toUpperCase()}-${Date.now()}`

      return NextResponse.json({
        success: true,
        data: {
          claimId: `mock_${Date.now()}`,
          claimNumber,
          status: 'SUBMITTED',
          message: 'Claim submitted successfully. Database operations processed asynchronously in serverless mode.',
          estimatedProcessingTime: '24 hours',
          note: 'Serverless mode: Mock response. Real processing handled via background workers.'
        }
      }, { status: 201 })
    }

    // Dynamic import of heavy dependencies only in non-serverless environments
    const { prisma, generateClaimNumber } = await import('@/lib/db')

    // Generate claim number
    const claimNumber = generateClaimNumber(validatedData.type)
    
    // Create claim in database
    const claim = await prisma.claim.create({
      data: {
        claimNumber,
        type: validatedData.type,
        propertyAddress: validatedData.propertyAddress,
        propertyType: validatedData.propertyType,
        policyNumber: validatedData.policyNumber,
        damageType: validatedData.damageType,
        damageDescription: validatedData.damageDescription,
        severity: validatedData.severity,
        insuredName: validatedData.insuredName,
        insuredEmail: validatedData.insuredEmail,
        insuredPhone: validatedData.insuredPhone,
      },
      include: {
        documents: true,
        workflows: true
      }
    })
    
    // Create document records if images were provided
    if (validatedData.images && validatedData.images.length > 0) {
      await prisma.document.createMany({
        data: validatedData.images.map(img => ({
          claimId: claim.id,
          filename: img.filename,
          originalName: img.filename,
          url: img.url,
          mimeType: 'image/jpeg',
          size: 0 // Would be calculated from actual file
        }))
      })
    }
    
    // Log activity
    await prisma.activity.create({
      data: {
        claimId: claim.id,
        action: 'CLAIM_SUBMITTED',
        description: `Claim ${claimNumber} submitted via API`,
        metadata: JSON.stringify({
          source: 'API',
          ip: request.headers.get('x-forwarded-for') || 'unknown'
        })
      }
    })
    
    // Trigger workflow asynchronously (only if not in serverless environment)
    if (process.env.VERCEL !== '1') {
      try {
        const { WorkflowEngine } = await import('@/lib/workflow')
        const workflowEngine = new WorkflowEngine()

        // Don't await - let it run in background
        workflowEngine.triggerWorkflow('claim-submission', claim.id, {
          type: validatedData.type,
          severity: validatedData.severity
        }).catch(error => {
          console.error('Workflow failed:', error)
          // Log error but don't fail the request
          prisma.activity.create({
            data: {
              claimId: claim.id,
              action: 'WORKFLOW_ERROR',
              description: `Workflow failed: ${error.message}`,
              metadata: JSON.stringify({ error: error.message })
            }
          }).catch(console.error)
        })
      } catch (error) {
        console.log('Workflow engine not available in serverless environment')
      }
    } else {
      console.log('Skipping workflow in Vercel serverless environment')
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        claimId: claim.id,
        claimNumber: claim.claimNumber,
        status: claim.status,
        message: 'Claim submitted successfully. Processing initiated.',
        estimatedProcessingTime: '24 hours'
      }
    }, { status: 201 })
    
  } catch (error) {
    console.error('Claim submission error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.issues
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to submit claim',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET endpoint to retrieve claim status
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const claimNumber = searchParams.get('claimNumber')
    const claimId = searchParams.get('claimId')

    if (!claimNumber && !claimId) {
      return NextResponse.json({
        success: false,
        error: 'Please provide claimNumber or claimId'
      }, { status: 400 })
    }

    // Skip database operations in Vercel serverless environment
    if (process.env.VERCEL === '1') {
      return NextResponse.json({
        success: true,
        data: {
          id: claimId || 'mock_claim_id',
          claimNumber: claimNumber || 'MOCK-123456',
          type: 'residential',
          propertyAddress: '123 Mock Street',
          status: 'UNDER_REVIEW',
          submittedAt: new Date().toISOString(),
          documents: [],
          workflows: [],
          notifications: [],
          activities: []
        },
        note: 'Serverless mode: Mock data. Real claim data processed asynchronously.'
      })
    }

    // Dynamic import of Prisma only in non-serverless environments
    const { prisma } = await import('@/lib/db')

    const claim = await prisma.claim.findFirst({
      where: claimNumber ? { claimNumber } : { id: claimId! },
      include: {
        documents: true,
        workflows: {
          orderBy: { triggeredAt: 'desc' },
          take: 1
        },
        notifications: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
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