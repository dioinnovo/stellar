/**
 * Universal Client Email Template
 * 
 * Single, intelligent template that adapts to any lead data
 * No scoring awareness - focuses on solution vision and momentum building
 * Consistent enterprise UI/UX across all communications
 */

import { ClientEmailSchema } from './client-schema';
import { generateEmailStyles, BRAND_COLORS, SPACING, TYPOGRAPHY, COMPONENTS, LAYOUT, PREMIUM_VISUALS } from './design-system';

/**
 * Section generators - modular content creation
 */
interface EmailSection {
  id: string;
  generate: (data: ClientEmailSchema) => string;
  required: boolean;
}

/**
 * Premium Hero Section - World-class branding and visual impact
 */
const generateHeader = (data: ClientEmailSchema): string => {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="
          background: ${PREMIUM_VISUALS.gradients.primary};
          padding: ${COMPONENTS.header.padding.desktop};
          text-align: center;
          border-radius: ${COMPONENTS.header.borderRadius};
          box-shadow: ${PREMIUM_VISUALS.elevations.hero};
          position: relative;
        ">
          <!-- Company Logo Section with Base64 Embedded Image -->
          <div style="margin-bottom: 24px;">
            <img src="data:image/png;base64,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" alt="${data.branding.brandName}" style="
              height: 48px;
              width: auto;
              vertical-align: middle;
            " />
          </div>
          
          <!-- Hero Headline -->
          <h1 style="
            margin: 0 0 16px 0;
            font-family: ${TYPOGRAPHY.fonts.heading};
            font-size: 32px;
            font-weight: ${TYPOGRAPHY.weights.bold};
            line-height: ${TYPOGRAPHY.lineHeights.tight};
            color: ${BRAND_COLORS.text.white};
            letter-spacing: -0.5px;
          ">
            Your AI Transformation Starts Here
          </h1>
          
          <!-- Hero Subheadline -->
          <p style="
            margin: 0;
            font-size: 18px;
            font-weight: ${TYPOGRAPHY.weights.medium};
            color: rgba(255, 255, 255, 0.95);
            line-height: ${TYPOGRAPHY.lineHeights.normal};
            max-width: 400px;
            margin: 0 auto;
          ">
            ${data.personalization.industry} Innovation • Enterprise Solutions
          </p>
        </td>
      </tr>
    </table>
  `;
};

/**
 * Executive Greeting - Professional and relationship-focused
 */
const generateGreeting = (data: ClientEmailSchema): string => {
  const name = data.personalization.recipientName !== 'Valued Client' ? 
    data.personalization.recipientName : 'there';
  
  const companyContext = data.personalization.companyName !== 'Your Organization' ? 
    data.personalization.companyName : 'your organization';
  
  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 32px 0;">
      <tr>
        <td style="padding: 0 32px;">
          <div style="
            background: linear-gradient(145deg, #ffffff 0%, #fafbff 100%);
            border-radius: 16px;
            padding: 32px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1), 0 1px 8px rgba(0, 0, 0, 0.06);
            text-align: left;
            border: 1px solid rgba(102, 126, 234, 0.08);
          ">
            <h2 style="
              margin: 0 0 20px 0;
              font-size: 24px;
              font-weight: ${TYPOGRAPHY.weights.semibold};
              color: ${BRAND_COLORS.text.primary};
              line-height: ${TYPOGRAPHY.lineHeights.tight};
            ">
              Hi ${name},
            </h2>
            <p style="
              margin: 0;
              font-size: 17px;
              line-height: ${TYPOGRAPHY.lineHeights.relaxed};
              color: ${BRAND_COLORS.text.secondary};
              font-weight: ${TYPOGRAPHY.weights.regular};
            ">
              Thank you for connecting with our team. We're excited to explore how AI automation can transform ${companyContext}'s operations.
            </p>
          </div>
        </td>
      </tr>
    </table>
  `;
};

/**
 * Vision Impact Card - Emotional connection and transformation preview
 */
const generateSolutionVision = (data: ClientEmailSchema): string => {
  const challenges = data.personalization.challenges;
  
  if (challenges.length === 0) {
    return generateGenericVision(data);
  }
  
  const primaryChallenge = challenges[0];
  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 40px 0;">
      <tr>
        <td style="padding: 0 32px;">
          <div style="
            background: linear-gradient(145deg, #f0f4ff 0%, #e0e7ff 100%);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(102, 126, 234, 0.15), 0 4px 12px rgba(0, 0, 0, 0.05);
            border: 1px solid rgba(102, 126, 234, 0.12);
            text-align: center;
            position: relative;
          ">
            <!-- Vision Icon -->
            <div style="
              font-size: 48px;
              margin-bottom: 24px;
              height: 60px;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              ${PREMIUM_VISUALS.icons.vision}
            </div>
            
            <!-- Vision Headline -->
            <h3 style="
              margin: 0 0 24px 0;
              font-size: 26px;
              font-weight: ${TYPOGRAPHY.weights.bold};
              color: ${BRAND_COLORS.text.primary};
              line-height: ${TYPOGRAPHY.lineHeights.tight};
              letter-spacing: -0.3px;
            ">
              Your Strategic Advantage
            </h3>
            
            <!-- Vision Statement -->
            <p style="
              margin: 0;
              font-size: 19px;
              line-height: ${TYPOGRAPHY.lineHeights.relaxed};
              color: ${BRAND_COLORS.text.secondary};
              font-style: italic;
              font-weight: ${TYPOGRAPHY.weights.medium};
              max-width: 500px;
              margin: 0 auto;
            ">
              ${primaryChallenge.solution.visionStatement}
            </p>
            
            <!-- Impact Highlight -->
            <div style="
              background: rgba(102, 126, 234, 0.1);
              border-radius: 12px;
              padding: 20px;
              margin: 28px 0 0 0;
              border: 1px solid rgba(102, 126, 234, 0.2);
            ">
              <p style="
                margin: 0;
                font-size: 16px;
                color: ${BRAND_COLORS.primary.dark};
                font-weight: ${TYPOGRAPHY.weights.semibold};
              ">
                ${PREMIUM_VISUALS.icons.success} <strong>Real Impact:</strong> ${primaryChallenge.solution.specificBenefit}
              </p>
            </div>
          </div>
        </td>
      </tr>
    </table>
  `;
};

/**
 * Generic vision for when challenges aren't identified
 */
const generateGenericVision = (data: ClientEmailSchema): string => {
  return `
    <div style="
      background: ${BRAND_COLORS.background.secondary};
      border-left: 4px solid ${data.branding.primaryColor || BRAND_COLORS.primary.main};
      border-radius: 0 ${SPACING.xs} ${SPACING.xs} 0;
      padding: ${SPACING.lg};
      margin: ${SPACING.lg} 0;
    ">
      <h3 style="
        margin: 0 0 ${SPACING.md} 0;
        font-size: ${TYPOGRAPHY.sizes.desktop.h3};
        font-weight: ${TYPOGRAPHY.weights.semibold};
        color: ${BRAND_COLORS.text.primary};
      ">
        Transform Your Operations
      </h3>
      <p style="
        margin: 0;
        font-size: ${TYPOGRAPHY.sizes.desktop.body};
        line-height: ${TYPOGRAPHY.lineHeights.relaxed};
        color: ${BRAND_COLORS.text.secondary};
      ">
        Imagine your team focusing on strategic initiatives while AI handles the routine work that currently 
        consumes valuable time. Most ${data.personalization.industry.toLowerCase()} organizations see immediate 
        improvements in efficiency, accuracy, and team satisfaction.
      </p>
    </div>
  `;
};

/**
 * Results Showcase Card - Visual proof and credibility
 */
const generateSocialProof = (data: ClientEmailSchema): string => {
  const proof = data.solutionVision.socialProof;
  const metrics = data.solutionVision.successMetrics;
  
  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 32px 0;">
      <tr>
        <td style="padding: 0 32px;">
          <div style="
            background: linear-gradient(145deg, #ffffff 0%, #fafbff 100%);
            border-radius: 16px;
            padding: 32px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1), 0 1px 8px rgba(0, 0, 0, 0.06);
            border: 1px solid rgba(102, 126, 234, 0.08);
            text-align: center;
          ">
            <!-- Results Icon -->
            <div style="font-size: 36px; margin-bottom: 20px;">
              ${PREMIUM_VISUALS.icons.results}
            </div>
            
            <!-- Results Headline -->
            <h3 style="
              margin: 0 0 20px 0;
              font-size: 22px;
              font-weight: ${TYPOGRAPHY.weights.semibold};
              color: ${BRAND_COLORS.text.primary};
              line-height: ${TYPOGRAPHY.lineHeights.tight};
            ">
              Proven Results in ${data.personalization.industry}
            </h3>
            
            <!-- Proof Statement -->
            <p style="
              margin: 0;
              font-size: 17px;
              line-height: ${TYPOGRAPHY.lineHeights.normal};
              color: ${BRAND_COLORS.text.secondary};
              font-weight: ${TYPOGRAPHY.weights.medium};
            ">
              ${proof.clientExample} achieved <strong style="color: ${BRAND_COLORS.primary.main};">${proof.achievement}</strong> ${proof.timeframe}.
            </p>
          </div>
        </td>
      </tr>
    </table>
  `;
};

/**
 * Action Card - Clear next steps with urgency and value
 */
const generateNextSteps = (data: ClientEmailSchema): string => {
  const companyName = data.personalization.companyName !== 'Your Organization' ? 
    data.personalization.companyName : 'your organization';
  
  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 32px 0;">
      <tr>
        <td style="padding: 0 32px;">
          <div style="
            background: linear-gradient(145deg, #ffffff 0%, #fafbff 100%);
            border-radius: 16px;
            padding: 32px;
            box-shadow: 0 12px 35px rgba(139, 92, 246, 0.12), 0 2px 10px rgba(0, 0, 0, 0.08);
            border: 2px solid rgba(139, 92, 246, 0.15);
            text-align: center;
          ">
            <!-- Action Icon -->
            <div style="font-size: 36px; margin-bottom: 20px;">
              ${PREMIUM_VISUALS.icons.nextSteps}
            </div>
            
            <!-- Action Headline -->
            <h3 style="
              margin: 0 0 20px 0;
              font-size: 22px;
              font-weight: ${TYPOGRAPHY.weights.semibold};
              color: ${BRAND_COLORS.text.primary};
              line-height: ${TYPOGRAPHY.lineHeights.tight};
            ">
              What Happens Next
            </h3>
            
            <!-- Action Description -->
            <p style="
              margin: 0;
              font-size: 17px;
              line-height: ${TYPOGRAPHY.lineHeights.relaxed};
              color: ${BRAND_COLORS.text.secondary};
              font-weight: ${TYPOGRAPHY.weights.regular};
            ">
              Our AI strategist will contact you within <strong style="color: ${BRAND_COLORS.primary.main};">24-48 hours</strong> for a brief consultation tailored specifically to ${companyName}.
            </p>
          </div>
        </td>
      </tr>
    </table>
  `;
};

/**
 * Premium CTA Section - Conversion-optimized action
 */
const generateCTA = (data: ClientEmailSchema): string => {
  const ctaText = data.personalization.timeline.urgency === 'immediate' ?
    'Schedule Priority Consultation' :
    'Get Your AI Strategy Session';
  
  const ctaUrl = data.personalization.timeline.urgency === 'immediate' ?
    'https://innovoco.com/schedule-priority' :
    'https://innovoco.com/strategy-session';
  
  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 40px 0;">
      <tr>
        <td style="
          text-align: center;
          padding: 48px 32px;
          background: ${BRAND_COLORS.background.light};
        ">
          <!-- Premium 3D CTA Button with Emerald Green -->
          <a href="${ctaUrl}" style="
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            background-color: #10B981 !important;
            color: #ffffff !important;
            padding: 20px 48px;
            font-size: 18px;
            font-weight: 700;
            border-radius: 12px;
            text-decoration: none !important;
            display: inline-block;
            box-shadow: 0 8px 30px rgba(16, 185, 129, 0.35), 0 2px 8px rgba(0, 0, 0, 0.1);
            letter-spacing: 0.5px;
            min-width: 300px;
            text-align: center;
            border: none;
            text-transform: none;
            line-height: 1.2;
            position: relative;
          ">
            ${ctaText}
          </a>
          
          <!-- Trust Indicators -->
          <div style="margin-top: 24px;">
            <p style="
              margin: 0;
              font-size: 15px;
              color: ${BRAND_COLORS.text.light};
              font-weight: ${TYPOGRAPHY.weights.medium};
            ">
              ${PREMIUM_VISUALS.icons.success} Free consultation • No commitment required • Expert guidance
            </p>
          </div>
        </td>
      </tr>
    </table>
  `;
};

/**
 * Professional Footer - Brand reinforcement and contact
 */
const generateFooter = (data: ClientEmailSchema): string => {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 40px;">
      <tr>
        <td style="
          background: ${BRAND_COLORS.background.secondary};
          padding: 40px 32px;
          text-align: center;
          border-radius: 24px 24px 0 0;
        ">
          <!-- Team Signature -->
          <p style="
            margin: 0 0 20px 0;
            font-size: 17px;
            font-weight: ${TYPOGRAPHY.weights.semibold};
            color: ${BRAND_COLORS.text.secondary};
            line-height: ${TYPOGRAPHY.lineHeights.normal};
          ">
            Best regards,<br>
            <span style="color: ${BRAND_COLORS.primary.main};">The ${data.branding.brandName} AI Strategy Team</span>
          </p>
          
          <!-- Contact Links -->
          <div style="margin: 24px 0;">
            <a href="https://innovoco.com" style="
              color: ${BRAND_COLORS.primary.main};
              text-decoration: none;
              font-size: 16px;
              font-weight: ${TYPOGRAPHY.weights.medium};
              margin: 0 16px;
            ">
              ${PREMIUM_VISUALS.icons.contact} innovoco.com
            </a>
            <span style="color: ${BRAND_COLORS.borders.medium}; margin: 0 8px;">•</span>
            <a href="tel:1-800-INNOVOCO" style="
              color: ${BRAND_COLORS.primary.main};
              text-decoration: none;
              font-size: 16px;
              font-weight: ${TYPOGRAPHY.weights.medium};
              margin: 0 16px;
            ">
              1-800-INNOVOCO
            </a>
          </div>
          
          <!-- Brand Line -->
          <div style="
            margin: 24px 0 0 0;
            padding: 16px 0 0 0;
            border-top: 1px solid ${BRAND_COLORS.borders.light};
          ">
            <p style="
              margin: 0;
              font-size: 14px;
              color: ${BRAND_COLORS.text.light};
              font-weight: ${TYPOGRAPHY.weights.regular};
            ">
              © 2025 ${data.branding.brandName} • ${data.branding.tagline}
            </p>
          </div>
        </td>
      </tr>
    </table>
  `;
};

/**
 * World-Class Email Template Builder - Table-based layout for compatibility
 */
export function buildClientEmail(data: ClientEmailSchema): string {
  const sections = data.layout.contentSections;
  let content = '';
  
  // Generate each requested section
  if (sections.includes('greeting')) {
    content += generateGreeting(data);
  }
  
  if (sections.includes('vision')) {
    content += generateSolutionVision(data);
  }
  
  if (sections.includes('social_proof')) {
    content += generateSocialProof(data);
  }
  
  if (sections.includes('next_steps')) {
    content += generateNextSteps(data);
  }
  
  // Build world-class email with table-based structure
  return `
    <!DOCTYPE html>
    <html lang="en" xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="format-detection" content="telephone=no">
      <meta name="x-apple-disable-message-reformatting">
      <title>${data.emailConfig.subject}</title>
      <style>
        ${generatePremiumEmailStyles()}
      </style>
    </head>
    <body style="
      margin: 0;
      padding: 0;
      font-family: ${TYPOGRAPHY.fonts.primary};
      background-color: ${BRAND_COLORS.background.secondary};
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    ">
      <!-- Email Container Table -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="
        background-color: ${BRAND_COLORS.background.secondary};
        min-height: 100vh;
        padding: 20px 0;
      ">
        <tr>
          <td align="center" valign="top">
            <!-- Main Content Table -->
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="
              max-width: 600px;
              width: 100%;
              background-color: ${BRAND_COLORS.background.primary};
              border-radius: 24px;
              box-shadow: ${PREMIUM_VISUALS.elevations.hero};
              overflow: hidden;
            ">
              <tr>
                <td>
                  ${generateHeader(data)}
                  ${content}
                  ${generateCTA(data)}
                  ${generateFooter(data)}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

/**
 * Generate premium email styles for world-class design
 */
function generatePremiumEmailStyles(): string {
  return `
    /* Email Client Resets */
    body, table, td, p, a, li, blockquote { 
      -webkit-text-size-adjust: 100%; 
      -ms-text-size-adjust: 100%; 
    }
    table, td { 
      mso-table-lspace: 0pt; 
      mso-table-rspace: 0pt; 
    }
    img { 
      -ms-interpolation-mode: bicubic; 
    }
    
    /* Premium Typography */
    h1, h2, h3, h4, h5, h6 {
      font-family: ${TYPOGRAPHY.fonts.heading};
      margin: 0;
      padding: 0;
      line-height: ${TYPOGRAPHY.lineHeights.tight};
    }
    
    p {
      font-family: ${TYPOGRAPHY.fonts.primary};
      margin: 0;
      padding: 0;
      line-height: ${TYPOGRAPHY.lineHeights.normal};
    }
    
    /* Link Styles */
    a {
      color: ${BRAND_COLORS.primary.main};
      text-decoration: none;
    }
    
    a:hover {
      color: ${BRAND_COLORS.primary.dark};
      text-decoration: underline;
    }
    
    /* Mobile Responsive */
    @media screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        margin: 0 !important;
        border-radius: 0 !important;
      }
      
      .mobile-padding {
        padding: 20px !important;
      }
      
      .mobile-center {
        text-align: center !important;
      }
      
      .mobile-full-width {
        width: 100% !important;
        display: block !important;
      }
      
      .mobile-text-small {
        font-size: 14px !important;
        line-height: 1.4 !important;
      }
    }
    
    /* Dark Mode Support */
    @media (prefers-color-scheme: dark) {
      .dark-mode-bg {
        background-color: #1a1a1a !important;
      }
      
      .dark-mode-text {
        color: #ffffff !important;
      }
      
      .dark-mode-card {
        background-color: #2d2d2d !important;
        border-color: #404040 !important;
      }
    }
  `;
}

/**
 * Quick email builder with minimal data
 */
export function buildQuickClientEmail(
  recipientName: string,
  companyName: string,
  industry: string,
  challenges: string[]
): string {
  // Import required functions
  const { mapChallengesToSolutions, generateSuccessMetrics, generateIndustryProof } = require('./solution-vision');
  const { createDefaultClientEmailSchema } = require('./client-schema');
  
  // Create base schema
  const schema = createDefaultClientEmailSchema();
  
  // Populate with provided data
  schema.personalization.recipientName = recipientName;
  schema.personalization.companyName = companyName;
  schema.personalization.industry = industry;
  
  // Map challenges to solutions
  const mappedChallenges = mapChallengesToSolutions(challenges, industry, '100+', 'exploring');
  schema.personalization.challenges = mappedChallenges;
  
  // Update primary solution
  if (mappedChallenges.length > 0) {
    schema.solutionVision.primarySolution = mappedChallenges[0].solution;
  }
  
  // Generate industry-specific metrics and proof
  schema.solutionVision.successMetrics = generateSuccessMetrics(mappedChallenges, industry);
  schema.solutionVision.socialProof = generateIndustryProof(industry, '100+');
  
  // Update email config
  schema.emailConfig.subject = `${recipientName}, next steps for your AI transformation`;
  schema.emailConfig.preheader = `Personalized solutions for ${companyName}'s automation needs`;
  
  return buildClientEmail(schema);
}