import { Resend } from 'resend'
import { prisma } from './db'

// Initialize Resend (use demo mode if no API key)
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export interface EmailOptions {
  to: string
  subject: string
  html: string
  attachments?: Array<{
    filename: string
    content: Buffer | string
  }>
}

export async function sendEmail(options: EmailOptions) {
  const { to, subject, html, attachments } = options

  try {
    if (resend && process.env.NODE_ENV === 'production') {
      // Send real email in production
      const result = await resend.emails.send({
        from: 'Stellar Intelligence <noreply@stellar-ai.com>',
        to,
        subject,
        html,
        attachments
      })
      
      return { success: true, messageId: result.data?.id }
    } else {
      // In development, just log the email
      console.log('📧 Email (Development Mode):')
      console.log('To:', to)
      console.log('Subject:', subject)
      console.log('Content:', html.substring(0, 200) + '...')
      
      // Still save to database for demo purposes
      return { success: true, messageId: `dev-${Date.now()}` }
    }
  } catch (error) {
    console.error('Failed to send email:', error)
    throw error
  }
}

// Email templates
export const emailTemplates = {
  claimSubmitted: (claimNumber: string, insuredName: string, estimate?: number) => ({
    subject: `Claim ${claimNumber} Received - Stellar Intelligence`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #ff6b35; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .estimate-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff6b35; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Claim Received</h1>
              <p>Your claim is being processed by our AI system</p>
            </div>
            <div class="content">
              <p>Dear ${insuredName},</p>
              
              <p>We have successfully received your insurance claim:</p>
              
              <div class="estimate-box">
                <h3>Claim Details</h3>
                <p><strong>Claim Number:</strong> ${claimNumber}</p>
                <p><strong>Status:</strong> Processing</p>
                ${estimate ? `<p><strong>Preliminary Estimate:</strong> $${estimate.toLocaleString()}</p>` : ''}
              </div>
              
              <p>Our AI-powered system is analyzing your claim and will provide updates within 24 hours. You can track your claim status at any time using the link below.</p>
              
              <a href="https://stellar-ai.com/claims/${claimNumber}" class="button">Track Your Claim</a>
              
              <p>If you have any questions, please don't hesitate to contact us.</p>
              
              <div class="footer">
                <p>© 2025 Stellar Intelligence Platform. All rights reserved.</p>
                <p>This is an automated message. Please do not reply to this email.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  estimateReady: (claimNumber: string, insuredName: string, estimate: number) => ({
    subject: `Estimate Ready for Claim ${claimNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .estimate-box { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; border: 2px solid #ff6b35; }
            .amount { font-size: 32px; color: #ff6b35; font-weight: bold; }
            .button { display: inline-block; padding: 12px 30px; background: #ff6b35; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your Estimate is Ready</h1>
              <p>AI-powered analysis complete</p>
            </div>
            <div class="content">
              <p>Dear ${insuredName},</p>
              
              <p>Good news! Our AI system has completed the analysis of your claim.</p>
              
              <div class="estimate-box">
                <h3>Approved Estimate</h3>
                <p class="amount">$${estimate.toLocaleString()}</p>
                <p><strong>Claim Number:</strong> ${claimNumber}</p>
                <p><strong>Processing Time:</strong> Less than 24 hours</p>
              </div>
              
              <p>This estimate has been generated using our advanced AI technology and verified by our claims experts. The next steps are:</p>
              
              <ol>
                <li>Review the detailed estimate breakdown</li>
                <li>Accept or discuss the estimate</li>
                <li>Schedule repairs with approved contractors</li>
              </ol>
              
              <a href="https://stellar-ai.com/claims/${claimNumber}/estimate" class="button">View Full Estimate</a>
              
              <p>Thank you for choosing Stellar Intelligence for your insurance needs.</p>
            </div>
          </div>
        </body>
      </html>
    `
  })
}