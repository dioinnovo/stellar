import { generate } from '@pdfme/generator'
import { Template, Font } from '@pdfme/common'

// Define the inspection report template structure
export const inspectionReportTemplate: Template = {
  basePdf: {
    width: 210,
    height: 297,
    padding: [20, 20, 20, 20]
  },
  schemas: [
    // Cover Page
    {
      header: {
        type: 'text',
        position: { x: 20, y: 20 },
        width: 170,
        height: 30,
        fontSize: 24,
        fontWeight: 'bold',
        alignment: 'center',
        fontColor: '#E74C3C'
      },
      logo: {
        type: 'image',
        position: { x: 85, y: 55 },
        width: 40,
        height: 40
      },
      reportTitle: {
        type: 'text',
        position: { x: 20, y: 100 },
        width: 170,
        height: 20,
        fontSize: 20,
        fontWeight: 'bold',
        alignment: 'center'
      },
      propertyAddress: {
        type: 'text',
        position: { x: 20, y: 130 },
        width: 170,
        height: 15,
        fontSize: 14,
        alignment: 'center'
      },
      reportDate: {
        type: 'text',
        position: { x: 20, y: 150 },
        width: 170,
        height: 12,
        fontSize: 10,
        alignment: 'center',
        fontColor: '#666666'
      },
      inspector: {
        type: 'text',
        position: { x: 20, y: 180 },
        width: 170,
        height: 12,
        fontSize: 10,
        alignment: 'center',
        fontColor: '#666666'
      },
      claimNumber: {
        type: 'text',
        position: { x: 20, y: 200 },
        width: 170,
        height: 12,
        fontSize: 10,
        alignment: 'center',
        fontColor: '#666666'
      }
    },
    // Executive Summary Page
    {
      executiveSummaryTitle: {
        type: 'text',
        position: { x: 20, y: 20 },
        width: 170,
        height: 20,
        fontSize: 18,
        fontWeight: 'bold',
        fontColor: '#2C3E50'
      },
      totalDamageLabel: {
        type: 'text',
        position: { x: 20, y: 50 },
        width: 80,
        height: 12,
        fontSize: 12,
        fontWeight: 'bold'
      },
      totalDamageValue: {
        type: 'text',
        position: { x: 100, y: 50 },
        width: 90,
        height: 12,
        fontSize: 12,
        fontColor: '#E74C3C'
      },
      criticalIssuesLabel: {
        type: 'text',
        position: { x: 20, y: 65 },
        width: 80,
        height: 12,
        fontSize: 12,
        fontWeight: 'bold'
      },
      criticalIssuesValue: {
        type: 'text',
        position: { x: 100, y: 65 },
        width: 90,
        height: 12,
        fontSize: 12
      },
      timelineLabel: {
        type: 'text',
        position: { x: 20, y: 80 },
        width: 80,
        height: 12,
        fontSize: 12,
        fontWeight: 'bold'
      },
      timelineValue: {
        type: 'text',
        position: { x: 100, y: 80 },
        width: 90,
        height: 12,
        fontSize: 12
      },
      recommendations: {
        type: 'text',
        position: { x: 20, y: 100 },
        width: 170,
        height: 100,
        fontSize: 11,
        lineHeight: 1.5
      }
    },
    // Property Information Page
    {
      propertyInfoTitle: {
        type: 'text',
        position: { x: 20, y: 20 },
        width: 170,
        height: 20,
        fontSize: 18,
        fontWeight: 'bold',
        fontColor: '#2C3E50'
      },
      propertyDetails: {
        type: 'text',
        position: { x: 20, y: 50 },
        width: 170,
        height: 200,
        fontSize: 11,
        lineHeight: 1.8
      }
    },
    // Area Findings Pages (Dynamic)
    {
      areaTitle: {
        type: 'text',
        position: { x: 20, y: 20 },
        width: 170,
        height: 20,
        fontSize: 16,
        fontWeight: 'bold',
        fontColor: '#2C3E50'
      },
      areaStatus: {
        type: 'text',
        position: { x: 20, y: 45 },
        width: 50,
        height: 12,
        fontSize: 10
      },
      areaPriority: {
        type: 'text',
        position: { x: 140, y: 45 },
        width: 50,
        height: 12,
        fontSize: 10,
        alignment: 'right'
      },
      areaDescription: {
        type: 'text',
        position: { x: 20, y: 65 },
        width: 170,
        height: 80,
        fontSize: 11,
        lineHeight: 1.5
      },
      areaPhotos: {
        type: 'image',
        position: { x: 20, y: 150 },
        width: 170,
        height: 100
      },
      areaCost: {
        type: 'text',
        position: { x: 20, y: 260 },
        width: 170,
        height: 12,
        fontSize: 12,
        fontWeight: 'bold',
        alignment: 'right',
        fontColor: '#E74C3C'
      }
    },
    // AI Insights Page
    {
      aiInsightsTitle: {
        type: 'text',
        position: { x: 20, y: 20 },
        width: 170,
        height: 20,
        fontSize: 18,
        fontWeight: 'bold',
        fontColor: '#2C3E50'
      },
      aiAnalysis: {
        type: 'text',
        position: { x: 20, y: 50 },
        width: 170,
        height: 220,
        fontSize: 11,
        lineHeight: 1.5
      }
    },
    // Financial Summary Page
    {
      financialTitle: {
        type: 'text',
        position: { x: 20, y: 20 },
        width: 170,
        height: 20,
        fontSize: 18,
        fontWeight: 'bold',
        fontColor: '#2C3E50'
      },
      costBreakdown: {
        type: 'text',
        position: { x: 20, y: 50 },
        width: 170,
        height: 200,
        fontSize: 11,
        lineHeight: 1.5
      }
    }
  ]
}

export interface InspectionReportData {
  metadata: {
    reportId: string
    claimNumber: string
    generatedDate: string
    inspector: string
    property: {
      address: string
      city: string
      state: string
      zipCode: string
      type: string
      yearBuilt: string
      owner: string
      policyNumber: string
    }
    claimInfo: {
      dateOfLoss: string
      damageTypes: string[]
      initialEstimate: number
    }
  }
  executiveSummary: {
    totalDamageValue: number
    criticalIssues: number
    repairRecommendations: string[]
    timelineEstimate: string
    confidenceScore: number
  }
  areaFindings: Array<{
    area: string
    category: string
    status: string
    photoCount: number
    photos?: string[]
    description: string
    estimatedCost: number
    priority: string
    recommendations: string[]
    findings?: string
    damageDescription?: string
  }>
  aiInsights: {
    hiddenDamageEstimate: number
    codeUpgradeOpportunities: number
    historicalRecovery: number
    marketComparison: string
    riskAssessment: string[]
  }
  financialSummary: {
    subtotal: number
    hiddenDamage: number
    codeUpgrades: number
    contingency: number
    total: number
    insuranceEstimate: number
    gap: number
  }
}

export async function generateInspectionPDF(data: InspectionReportData): Promise<Uint8Array> {
  const inputs = []
  
  // Cover Page
  inputs.push({
    header: 'STELLAR INTELLIGENCE PLATFORM',
    logo: '/images/stellar_logo.png',
    reportTitle: 'PROPERTY INSPECTION REPORT',
    propertyAddress: `${data.metadata.property.address}, ${data.metadata.property.city}, ${data.metadata.property.state} ${data.metadata.property.zipCode}`,
    reportDate: `Report Generated: ${new Date(data.metadata.generatedDate).toLocaleDateString()}`,
    inspector: `Inspector: ${data.metadata.inspector}`,
    claimNumber: `Claim #: ${data.metadata.claimNumber}`
  })

  // Executive Summary
  inputs.push({
    executiveSummaryTitle: 'EXECUTIVE SUMMARY',
    totalDamageLabel: 'Total Damage Value:',
    totalDamageValue: `$${data.executiveSummary.totalDamageValue.toLocaleString()}`,
    criticalIssuesLabel: 'Critical Issues Found:',
    criticalIssuesValue: data.executiveSummary.criticalIssues.toString(),
    timelineLabel: 'Repair Timeline:',
    timelineValue: data.executiveSummary.timelineEstimate,
    recommendations: `Key Recommendations:\n\n${data.executiveSummary.repairRecommendations.map((r, i) => `${i + 1}. ${r}`).join('\n\n')}`
  })

  // Property Information
  const propertyInfo = `
Property Type: ${data.metadata.property.type}
Year Built: ${data.metadata.property.yearBuilt}
Owner: ${data.metadata.property.owner}
Policy Number: ${data.metadata.property.policyNumber}

Incident Information:
Date of Loss: ${data.metadata.claimInfo.dateOfLoss}
Damage Types: ${data.metadata.claimInfo.damageTypes.join(', ')}
Initial Estimate: $${data.metadata.claimInfo.initialEstimate.toLocaleString()}
  `.trim()

  inputs.push({
    propertyInfoTitle: 'PROPERTY INFORMATION',
    propertyDetails: propertyInfo
  })

  // Area Findings - One page per area
  for (const area of data.areaFindings) {
    const areaDetails = `
${area.description}

Findings:
${area.findings || 'No specific findings documented'}

Damage Description:
${area.damageDescription || 'No damage description provided'}

Recommendations:
${area.recommendations.map((r, i) => `• ${r}`).join('\n')}

Photos Taken: ${area.photoCount}
    `.trim()

    inputs.push({
      areaTitle: area.area.toUpperCase(),
      areaStatus: `Status: ${area.status}`,
      areaPriority: `Priority: ${area.priority}`,
      areaDescription: areaDetails,
      areaPhotos: area.photos?.[0] || '', // Include first photo if available
      areaCost: `Estimated Cost: $${area.estimatedCost.toLocaleString()}`
    })
  }

  // AI Insights
  const aiInsightsText = `
Hidden Damage Estimate: $${data.aiInsights.hiddenDamageEstimate.toLocaleString()}
Code Upgrade Opportunities: $${data.aiInsights.codeUpgradeOpportunities.toLocaleString()}
Historical Recovery Analysis: $${data.aiInsights.historicalRecovery.toLocaleString()}

Market Comparison:
${data.aiInsights.marketComparison}

Risk Assessment:
${data.aiInsights.riskAssessment.map(r => `• ${r}`).join('\n')}
  `.trim()

  inputs.push({
    aiInsightsTitle: 'AI ANALYSIS & INSIGHTS',
    aiAnalysis: aiInsightsText
  })

  // Financial Summary
  const financialText = `
COST BREAKDOWN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Documented Damage:          $${data.financialSummary.subtotal.toLocaleString()}
Hidden/Consequential:        $${data.financialSummary.hiddenDamage.toLocaleString()}
Code Upgrades Required:      $${data.financialSummary.codeUpgrades.toLocaleString()}
Contingency (10%):          $${data.financialSummary.contingency.toLocaleString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL CLAIM VALUE:          $${data.financialSummary.total.toLocaleString()}

Insurance Initial Estimate:  $${data.financialSummary.insuranceEstimate.toLocaleString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COVERAGE GAP:               $${data.financialSummary.gap.toLocaleString()}

This report represents a comprehensive assessment of all damages and necessary repairs. 
The total claim value includes both visible and hidden damages identified through 
AI-powered analysis and historical pattern recognition.
  `.trim()

  inputs.push({
    financialTitle: 'FINANCIAL SUMMARY',
    costBreakdown: financialText
  })

  // Generate PDF
  const pdf = await generate({
    template: inspectionReportTemplate,
    inputs,
    options: {
      font: {
        'NotoSans': {
          data: await fetch('/fonts/NotoSans-Regular.ttf').then(r => r.arrayBuffer()),
          style: 'normal',
          weight: 400
        },
        'NotoSans-Bold': {
          data: await fetch('/fonts/NotoSans-Bold.ttf').then(r => r.arrayBuffer()),
          style: 'normal',
          weight: 700
        }
      }
    }
  })

  return pdf
}

// Helper function to download PDF
export function downloadPDF(pdfData: Uint8Array, filename: string) {
  const blob = new Blob([pdfData], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}