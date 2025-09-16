import { prisma } from './db'
import { sendEmail } from './email'
import { graphRAG } from './graphrag'

// Mock Prisma enums for demo environment
enum ClaimStatus {
  SUBMITTED = 'SUBMITTED',
  TRIAGING = 'TRIAGING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  ESTIMATING = 'ESTIMATING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

enum WorkflowStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface WorkflowStep {
  name: string
  execute: (claimId: string, data?: any) => Promise<any>
}

export class WorkflowEngine {
  private steps: Map<string, WorkflowStep[]> = new Map()

  constructor() {
    // Define workflow steps for claim submission
    this.steps.set('claim-submission', [
      {
        name: 'Triage Claim',
        execute: this.triageClaim.bind(this)
      },
      {
        name: 'AI Classification',
        execute: this.classifyClaim.bind(this)
      },
      {
        name: 'Generate Estimate',
        execute: this.generateEstimate.bind(this)
      },
      {
        name: 'Send Notification',
        execute: this.sendClaimNotification.bind(this)
      },
      {
        name: 'Create CRM Lead',
        execute: this.createCRMLead.bind(this)
      },
      {
        name: 'Enrich with GraphRAG',
        execute: this.enrichWithGraphRAG.bind(this)
      }
    ])
  }

  async triggerWorkflow(workflowName: string, claimId: string, data?: any) {
    const steps = this.steps.get(workflowName)
    if (!steps) {
      throw new Error(`Workflow ${workflowName} not found`)
    }

    // Create workflow record
    const workflow = await prisma.workflow.create({
      data: {
        name: workflowName,
        claimId,
        status: WorkflowStatus.IN_PROGRESS,
        totalSteps: steps.length,
        currentStep: steps[0].name,
        data: JSON.stringify(data || {})
      }
    })

    try {
      // Execute each step
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i]
        
        // Update current step
        await prisma.workflow.update({
          where: { id: workflow.id },
          data: { currentStep: step.name }
        })

        // Execute step
        await step.execute(claimId, data)
        
        // Log activity
        await prisma.activity.create({
          data: {
            claimId,
            action: 'WORKFLOW_STEP_COMPLETED',
            description: `Completed workflow step: ${step.name}`,
            metadata: JSON.stringify({ workflowId: workflow.id, step: step.name })
          }
        })
      }

      // Mark workflow as completed
      await prisma.workflow.update({
        where: { id: workflow.id },
        data: {
          status: WorkflowStatus.COMPLETED,
          completedAt: new Date()
        }
      })

      return { success: true, workflowId: workflow.id }
    } catch (error) {
      // Mark workflow as failed
      await prisma.workflow.update({
        where: { id: workflow.id },
        data: {
          status: WorkflowStatus.FAILED,
          completedAt: new Date()
        }
      })
      
      throw error
    }
  }

  private async triageClaim(claimId: string) {
    // Update claim status to triaging
    await prisma.claim.update({
      where: { id: claimId },
      data: { status: ClaimStatus.TRIAGING }
    })

    // Simulate triage logic
    const claim = await prisma.claim.findUnique({
      where: { id: claimId }
    })

    if (!claim) throw new Error('Claim not found')

    // Determine priority based on damage type and severity
    let priority: Priority = Priority.MEDIUM
    
    if (claim.damageType?.toLowerCase().includes('hurricane') || 
        claim.severity === 'Total Loss') {
      priority = Priority.URGENT
    } else if (claim.severity === 'Major') {
      priority = Priority.HIGH
    }

    await prisma.claim.update({
      where: { id: claimId },
      data: { priority }
    })

    return { priority }
  }

  private async classifyClaim(claimId: string) {
    // Simulate AI classification
    const claim = await prisma.claim.findUnique({
      where: { id: claimId }
    })

    if (!claim) throw new Error('Claim not found')

    // Mock AI confidence scores
    const aiConfidence = 0.85 + Math.random() * 0.1
    const fraudScore = Math.random() * 0.3
    const settlementScore = 0.7 + Math.random() * 0.2

    await prisma.claim.update({
      where: { id: claimId },
      data: {
        status: ClaimStatus.UNDER_REVIEW,
        aiConfidence,
        fraudScore,
        settlementScore
      }
    })

    return { aiConfidence, fraudScore, settlementScore }
  }

  private async generateEstimate(claimId: string) {
    const claim = await prisma.claim.findUnique({
      where: { id: claimId }
    })

    if (!claim) throw new Error('Claim not found')

    // Generate preliminary estimate based on type and severity
    let baseAmount = claim.type === 'commercial' ? 50000 : 10000
    
    const severityMultiplier = {
      'Minor': 0.5,
      'Moderate': 1,
      'Major': 2.5,
      'Total Loss': 5
    }

    const multiplier = severityMultiplier[claim.severity as keyof typeof severityMultiplier] || 1
    const estimatedAmount = baseAmount * multiplier * (0.8 + Math.random() * 0.4)

    await prisma.claim.update({
      where: { id: claimId },
      data: {
        estimatedAmount,
        status: ClaimStatus.ESTIMATING
      }
    })

    return { estimatedAmount }
  }

  private async sendClaimNotification(claimId: string) {
    const claim = await prisma.claim.findUnique({
      where: { id: claimId }
    })

    if (!claim) throw new Error('Claim not found')

    // Create notification record
    const notification = await prisma.notification.create({
      data: {
        type: 'CLAIM_SUBMITTED',
        recipient: claim.insuredEmail,
        subject: `Claim ${claim.claimNumber} Received - Stellar Intelligence`,
        content: `
          <h2>Your claim has been received</h2>
          <p>Dear ${claim.insuredName},</p>
          <p>We have received your claim ${claim.claimNumber} and our AI system is processing it.</p>
          <p><strong>Preliminary Estimate:</strong> $${claim.estimatedAmount?.toLocaleString()}</p>
          <p>You will receive updates as we process your claim.</p>
        `,
        claimId
      }
    })

    // Send email (will be implemented in email.ts)
    await sendEmail({
      to: claim.insuredEmail,
      subject: notification.subject,
      html: notification.content
    })

    return { notificationId: notification.id }
  }

  private async createCRMLead(claimId: string) {
    const claim = await prisma.claim.findUnique({
      where: { id: claimId }
    })

    if (!claim) throw new Error('Claim not found')

    // Check if lead already exists
    const existingLead = await prisma.lead.findUnique({
      where: { claimId }
    })

    if (existingLead) return { leadId: existingLead.id }

    // Create new lead
    const lead = await prisma.lead.create({
      data: {
        leadNumber: `LEAD-${Date.now()}`,
        contactName: claim.insuredName,
        email: claim.insuredEmail,
        phone: claim.insuredPhone,
        score: claim.type === 'commercial' ? 80 : 60,
        qualification: claim.priority === 'URGENT' ? 'Hot' : 'Warm',
        claimId
      }
    })

    return { leadId: lead.id }
  }

  private async enrichWithGraphRAG(claimId: string) {
    try {
      // Enrich the claim with GraphRAG
      await graphRAG.enrichClaim(claimId)
      
      // Log the enrichment
      await prisma.activity.create({
        data: {
          claimId,
          action: 'GRAPHRAG_ENRICHMENT',
          description: 'Claim enriched with GraphRAG context and suggestions',
          metadata: JSON.stringify({ source: 'GraphRAG' })
        }
      })

      return { enriched: true }
    } catch (error) {
      console.error('GraphRAG enrichment error:', error)
      // Don't fail the workflow if enrichment fails
      return { enriched: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}