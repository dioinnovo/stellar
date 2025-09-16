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

// Generate HTML content for the report
function generateHTMLReport(data: InspectionReportData): string {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inspection Report - ${data.metadata.claimNumber}</title>
  <style>
    @page {
      size: letter;
      margin: 0.5in;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #2C3E50;
      max-width: 8.5in;
      margin: 0 auto;
      padding: 20px;
    }
    
    .header {
      text-align: center;
      border-bottom: 3px solid #E74C3C;
      padding-bottom: 20px;
      margin-bottom: 30px;
      page-break-after: avoid;
    }
    
    .logo {
      color: #E74C3C;
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    
    h1 {
      color: #2C3E50;
      font-size: 28px;
      margin: 20px 0;
    }
    
    h2 {
      color: #E74C3C;
      font-size: 20px;
      margin-top: 30px;
      margin-bottom: 15px;
      border-bottom: 2px solid #E74C3C;
      padding-bottom: 5px;
      page-break-after: avoid;
    }
    
    h3 {
      color: #2C3E50;
      font-size: 16px;
      margin-top: 20px;
      margin-bottom: 10px;
      page-break-after: avoid;
    }
    
    .metadata {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    
    .metadata-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    
    .metadata-label {
      font-weight: bold;
      color: #666;
    }
    
    .executive-summary {
      background: #fff3cd;
      border: 2px solid #ffc107;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      page-break-inside: avoid;
    }
    
    .financial-summary {
      background: #d4edda;
      border: 2px solid #28a745;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      page-break-inside: avoid;
    }
    
    .area-finding {
      border: 1px solid #dee2e6;
      border-radius: 8px;
      padding: 15px;
      margin: 15px 0;
      page-break-inside: avoid;
    }
    
    .area-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
    }
    
    .status-damaged { background: #f8d7da; color: #721c24; }
    .status-minor { background: #fff3cd; color: #856404; }
    .status-none { background: #d4edda; color: #155724; }
    
    .priority-high { color: #dc3545; font-weight: bold; }
    .priority-medium { color: #ffc107; font-weight: bold; }
    .priority-low { color: #28a745; font-weight: bold; }
    
    .cost {
      font-size: 18px;
      font-weight: bold;
      color: #E74C3C;
      text-align: right;
      margin-top: 10px;
    }
    
    .ai-insights {
      background: #e7f3ff;
      border: 2px solid #007bff;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      page-break-inside: avoid;
    }
    
    .recommendations {
      background: #f8f9fa;
      padding: 10px;
      border-left: 4px solid #E74C3C;
      margin: 10px 0;
    }
    
    .recommendations ul {
      margin: 10px 0;
      padding-left: 20px;
    }
    
    .page-break {
      page-break-after: always;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #dee2e6;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    
    .total-row {
      font-size: 20px;
      font-weight: bold;
      color: #E74C3C;
      border-top: 3px double #E74C3C;
      padding-top: 10px;
      margin-top: 10px;
    }
    
    @media print {
      body {
        padding: 0;
      }
      .page-break {
        page-break-after: always;
      }
    }
  </style>
</head>
<body>
  <!-- Cover Page -->
  <div class="header">
    <div class="logo">STELLAR INTELLIGENCE PLATFORM</div>
    <h1>PROPERTY INSPECTION REPORT</h1>
    <div style="font-size: 18px; margin: 10px 0;">
      ${data.metadata.property.address}<br>
      ${data.metadata.property.city}, ${data.metadata.property.state} ${data.metadata.property.zipCode}
    </div>
    <div style="color: #666; margin-top: 20px;">
      <div>Report Date: ${new Date(data.metadata.generatedDate).toLocaleDateString()}</div>
      <div>Claim Number: ${data.metadata.claimNumber}</div>
      <div>Inspector: ${data.metadata.inspector}</div>
    </div>
  </div>

  <!-- Property Information -->
  <div class="metadata">
    <h3>Property Information</h3>
    <div class="metadata-row">
      <span class="metadata-label">Property Type:</span>
      <span>${data.metadata.property.type}</span>
    </div>
    <div class="metadata-row">
      <span class="metadata-label">Year Built:</span>
      <span>${data.metadata.property.yearBuilt}</span>
    </div>
    <div class="metadata-row">
      <span class="metadata-label">Owner:</span>
      <span>${data.metadata.property.owner}</span>
    </div>
    <div class="metadata-row">
      <span class="metadata-label">Policy Number:</span>
      <span>${data.metadata.property.policyNumber}</span>
    </div>
    <div class="metadata-row">
      <span class="metadata-label">Date of Loss:</span>
      <span>${data.metadata.claimInfo.dateOfLoss}</span>
    </div>
    <div class="metadata-row">
      <span class="metadata-label">Damage Types:</span>
      <span>${data.metadata.claimInfo.damageTypes.join(', ')}</span>
    </div>
  </div>

  <!-- Executive Summary -->
  <div class="executive-summary">
    <h2>Executive Summary</h2>
    <div class="metadata-row">
      <span class="metadata-label">Total Damage Value:</span>
      <span style="font-size: 20px; color: #E74C3C; font-weight: bold;">
        $${data.executiveSummary.totalDamageValue.toLocaleString()}
      </span>
    </div>
    <div class="metadata-row">
      <span class="metadata-label">Critical Issues Found:</span>
      <span style="font-weight: bold; color: #dc3545;">${data.executiveSummary.criticalIssues}</span>
    </div>
    <div class="metadata-row">
      <span class="metadata-label">Repair Timeline:</span>
      <span>${data.executiveSummary.timelineEstimate}</span>
    </div>
    <div class="metadata-row">
      <span class="metadata-label">Confidence Score:</span>
      <span>${data.executiveSummary.confidenceScore}%</span>
    </div>
    
    <!-- Estimated Repair Costs Banner -->
    <div style="background: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h3 style="margin-top: 0; margin-bottom: 20px; color: #2C3E50;">ESTIMATED REPAIR COSTS</h3>
      <div style="display: flex; justify-content: space-between; text-align: center;">
        <div style="flex: 1;">
          <div style="font-weight: bold; color: #666; font-size: 12px; margin-bottom: 8px;">IMMEDIATE</div>
          <div style="font-size: 24px; font-weight: bold; color: #dc3545;">
            $${Math.round(data.executiveSummary.totalDamageValue * 0.25).toLocaleString()}
          </div>
          <div style="font-size: 11px; color: #999; margin-top: 4px;">0-30 days</div>
        </div>
        <div style="flex: 1; border-left: 1px solid #ffc107; border-right: 1px solid #ffc107;">
          <div style="font-weight: bold; color: #666; font-size: 12px; margin-bottom: 8px;">SHORT-TERM</div>
          <div style="font-size: 24px; font-weight: bold; color: #fd7e14;">
            $${Math.round(data.executiveSummary.totalDamageValue * 0.45).toLocaleString()}
          </div>
          <div style="font-size: 11px; color: #999; margin-top: 4px;">1-3 months</div>
        </div>
        <div style="flex: 1;">
          <div style="font-weight: bold; color: #666; font-size: 12px; margin-bottom: 8px;">LONG-TERM</div>
          <div style="font-size: 24px; font-weight: bold; color: #495057;">
            $${Math.round(data.executiveSummary.totalDamageValue * 0.30).toLocaleString()}
          </div>
          <div style="font-size: 11px; color: #999; margin-top: 4px;">3+ months</div>
        </div>
      </div>
      <div style="border-top: 1px solid #ffc107; margin-top: 20px; padding-top: 15px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: bold; color: #666;">TOTAL ESTIMATED COST</span>
        <span style="font-size: 20px; font-weight: bold; color: #2C3E50;">
          $${data.executiveSummary.totalDamageValue.toLocaleString()}
        </span>
      </div>
    </div>
    
    <h3>Key Recommendations</h3>
    <ul>
      ${data.executiveSummary.repairRecommendations.map(rec => `<li>${rec}</li>`).join('')}
    </ul>
  </div>

  <div class="page-break"></div>

  <!-- Area Findings -->
  <h2>Detailed Area Findings</h2>
  ${data.areaFindings.map(area => `
    <div class="area-finding">
      <div class="area-header">
        <h3>${area.area}</h3>
        <div>
          <span class="status-badge status-${area.status}">${area.status}</span>
          <span class="priority-${area.priority}" style="margin-left: 10px;">
            Priority: ${area.priority.toUpperCase()}
          </span>
        </div>
      </div>
      
      <div style="margin: 10px 0;">
        <strong>Category:</strong> ${area.category}<br>
        <strong>Photos Taken:</strong> ${area.photoCount}
      </div>
      
      <div style="margin: 15px 0;">
        <strong>Description:</strong><br>
        ${area.description}
      </div>
      
      ${area.findings ? `
        <div style="margin: 15px 0;">
          <strong>Findings:</strong><br>
          ${area.findings}
        </div>
      ` : ''}
      
      ${area.damageDescription ? `
        <div style="margin: 15px 0;">
          <strong>Damage Details:</strong><br>
          ${area.damageDescription}
        </div>
      ` : ''}
      
      <div class="recommendations">
        <strong>Recommendations:</strong>
        <ul>
          ${area.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
      </div>
      
      <div class="cost">
        Estimated Cost: $${area.estimatedCost.toLocaleString()}
      </div>
    </div>
  `).join('')}

  <div class="page-break"></div>

  <!-- AI Insights -->
  <div class="ai-insights">
    <h2>AI Analysis & Insights</h2>
    
    <div class="metadata-row">
      <span class="metadata-label">Hidden Damage Estimate:</span>
      <span style="font-weight: bold; color: #dc3545;">
        $${data.aiInsights.hiddenDamageEstimate.toLocaleString()}
      </span>
    </div>
    
    <div class="metadata-row">
      <span class="metadata-label">Code Upgrade Opportunities:</span>
      <span style="font-weight: bold;">
        $${data.aiInsights.codeUpgradeOpportunities.toLocaleString()}
      </span>
    </div>
    
    <div class="metadata-row">
      <span class="metadata-label">Historical Recovery:</span>
      <span style="font-weight: bold;">
        $${data.aiInsights.historicalRecovery.toLocaleString()}
      </span>
    </div>
    
    <div style="margin: 20px 0;">
      <strong>Market Comparison:</strong><br>
      ${data.aiInsights.marketComparison}
    </div>
    
    <div style="margin: 20px 0;">
      <strong>Risk Assessment:</strong>
      <ul>
        ${data.aiInsights.riskAssessment.map(risk => `<li>${risk}</li>`).join('')}
      </ul>
    </div>
  </div>

  <!-- Financial Summary -->
  <div class="financial-summary">
    <h2>Financial Summary</h2>
    
    <div class="metadata-row">
      <span class="metadata-label">Documented Damage:</span>
      <span>$${data.financialSummary.subtotal.toLocaleString()}</span>
    </div>
    
    <div class="metadata-row">
      <span class="metadata-label">Hidden/Consequential Damage:</span>
      <span>$${data.financialSummary.hiddenDamage.toLocaleString()}</span>
    </div>
    
    <div class="metadata-row">
      <span class="metadata-label">Code Upgrades Required:</span>
      <span>$${data.financialSummary.codeUpgrades.toLocaleString()}</span>
    </div>
    
    <div class="metadata-row">
      <span class="metadata-label">Contingency (10%):</span>
      <span>$${data.financialSummary.contingency.toLocaleString()}</span>
    </div>
    
    <div class="total-row metadata-row">
      <span>TOTAL CLAIM VALUE:</span>
      <span>$${data.financialSummary.total.toLocaleString()}</span>
    </div>
    
    <div style="margin-top: 20px; padding: 15px; background: #fff; border-radius: 8px;">
      <div class="metadata-row">
        <span class="metadata-label">Insurance Initial Estimate:</span>
        <span>$${data.financialSummary.insuranceEstimate.toLocaleString()}</span>
      </div>
      
      <div class="metadata-row" style="font-size: 18px; font-weight: bold; color: #E74C3C;">
        <span>COVERAGE GAP:</span>
        <span>$${data.financialSummary.gap.toLocaleString()}</span>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <p>
      This report was generated by Stellar Intelligence Platform<br>
      AI-Powered Insurance Claim Intelligence<br>
      Report ID: ${data.metadata.reportId}<br>
      Generated: ${new Date(data.metadata.generatedDate).toLocaleString()}
    </p>
    <p style="margin-top: 20px; font-style: italic;">
      This report represents a comprehensive assessment of all damages and necessary repairs.
      The total claim value includes both visible and hidden damages identified through
      AI-powered analysis and historical pattern recognition.
    </p>
  </div>
</body>
</html>
  `
  
  return html
}

// Generate and download actual PDF file
export async function generateInspectionPDF(data: InspectionReportData): Promise<void> {
  try {
    const htmlContent = generateHTMLReport(data)

    // Create a hidden iframe to render the content
    const iframe = document.createElement('iframe')
    iframe.style.position = 'absolute'
    iframe.style.width = '8.5in'
    iframe.style.height = '11in'
    iframe.style.left = '-9999px'
    iframe.style.top = '-9999px'

    document.body.appendChild(iframe)

    // Write content to iframe
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
    if (iframeDoc) {
      iframeDoc.open()
      iframeDoc.write(htmlContent)
      iframeDoc.close()

      // Wait for content to load and then print to PDF
      setTimeout(() => {
        const printWindow = iframe.contentWindow
        if (printWindow) {
          // Set the title to suggest PDF saving
          const titleElement = iframeDoc.querySelector('title')
          if (titleElement) {
            titleElement.textContent = `Inspection_Report_${data.metadata.claimNumber}.pdf`
          }

          printWindow.focus()
          printWindow.print()
        }

        // Clean up after a delay
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe)
          }
        }, 1000)
      }, 1000)
    }

  } catch (error) {
    console.error('Error generating PDF:', error)

    // Fallback: Open in new window for manual PDF save
    const htmlContent = generateHTMLReport(data)
    const printWindow = window.open('', '_blank')

    if (printWindow) {
      printWindow.document.write(htmlContent)
      printWindow.document.close()

      // Set document title to suggest PDF filename
      printWindow.document.title = `Inspection_Report_${data.metadata.claimNumber}.pdf`

      // Focus and trigger print dialog
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
      }, 500)
    }
  }
}

// Alternative: Download as HTML file that can be opened and printed
export function downloadPDF(data: Uint8Array, filename: string) {
  // Since we're using print dialog, we'll download as HTML instead
  // This is a fallback method
}

// Export HTML report directly for download
export function downloadHTMLReport(data: InspectionReportData) {
  const htmlContent = generateHTMLReport(data)
  const blob = new Blob([htmlContent], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `inspection-report-${data.metadata.claimNumber}.html`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}