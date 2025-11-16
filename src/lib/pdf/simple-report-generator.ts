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
    technicalFindings?: Record<string, string>
    materialSpecs?: Record<string, string>
    environmentalConcerns?: Record<string, string>
  }>
  aiInsights: {
    hiddenDamageEstimate: number
    codeUpgradeOpportunities: number
    historicalRecovery: number
    marketComparison: string
    riskAssessment: string[]
    technicalAnalysis?: string
    materialSpecifications?: string
    environmentalConcerns?: string
    confidenceMetrics?: {
      damagePrediction?: number
      costAccuracy?: number
      timelineReliability?: number
      riskAssessment?: number
    }
    historicalData?: {
      similarClaims?: number
      averageSettlement?: number
      timeToResolution?: string
      litigationRate?: string
    }
    environmentalFactors?: Record<string, string>
    claimsIntelligence?: {
      carrierProfile?: {
        name?: string
        claimsReputation?: string
        negotiationHistory?: string
        timelineBehavior?: string
      }
      strategicConsiderations?: string[]
    }
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
  <title>Inspection Report - ${data.metadata?.claimNumber || 'N/A'}</title>
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

      /* Hide all navigation and UI elements */
      nav,
      .sidebar,
      .navbar,
      .navigation,
      .menu,
      .header-nav,
      .side-nav,
      .top-nav,
      .breadcrumb,
      .breadcrumbs,
      button,
      .btn,
      .button,
      .action-bar,
      .toolbar,
      .controls,
      .tabs,
      .tab-nav,
      .pagination,
      .footer-nav,
      .print-hidden,
      .no-print,
      [data-print="hidden"] {
        display: none !important;
      }

      /* Ensure full width for content */
      .content,
      .main-content,
      .report-content {
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      /* Remove any fixed positioning */
      * {
        position: static !important;
      }

      /* Reset margins for clean PDF */
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: white !important;
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
      ${data.metadata?.property?.address || 'N/A'}<br>
      ${data.metadata?.property?.city || 'N/A'}, ${data.metadata?.property?.state || 'N/A'} ${data.metadata?.property?.zipCode || 'N/A'}
    </div>
    <div style="color: #666; margin-top: 20px;">
      <div>Report Date: ${new Date(data.metadata?.generatedDate || new Date().toISOString()).toLocaleDateString()}</div>
      <div>Claim Number: ${data.metadata?.claimNumber || 'N/A'}</div>
      <div>Inspector: ${data.metadata?.inspector || 'N/A'}</div>
    </div>
  </div>

  <!-- Property Image -->
  <div style="margin-bottom: 30px; page-break-inside: avoid;">
    <div style="position: relative; height: 300px; border-radius: 8px; overflow: hidden; margin-bottom: 20px;">
      <img
        src="https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&h=600&fit=crop&q=80"
        alt="${data.metadata?.property?.address || 'N/A'}"
        style="width: 100%; height: 100%; object-fit: cover;"
      />
      <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(10, 22, 40, 0.8), transparent); padding: 20px;">
        <h2 style="color: white; font-size: 24px; font-weight: bold; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
          ${data.metadata?.property?.address || 'N/A'}
        </h2>
        <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 16px;">
          ${data.metadata?.property?.city || 'N/A'}, ${data.metadata?.property?.state || 'N/A'} ${data.metadata?.property?.zipCode || 'N/A'}
        </p>
      </div>
      <div style="position: absolute; top: 15px; left: 15px;">
        <span style="background: rgba(255,255,255,0.9); color: #333; padding: 8px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: capitalize;">
          ${data.metadata?.property?.type || 'N/A'}
        </span>
      </div>
    </div>
  </div>

  <!-- Property Information -->
  <div class="metadata">
    <h3>Property Information</h3>
    <div class="metadata-row">
      <span class="metadata-label">Property Type:</span>
      <span>${data.metadata?.property?.type || 'N/A'}</span>
    </div>
    <div class="metadata-row">
      <span class="metadata-label">Year Built:</span>
      <span>${data.metadata?.property?.yearBuilt || 'N/A'}</span>
    </div>
    <div class="metadata-row">
      <span class="metadata-label">Owner:</span>
      <span>${data.metadata?.property?.owner || 'N/A'}</span>
    </div>
    <div class="metadata-row">
      <span class="metadata-label">Policy Number:</span>
      <span>${data.metadata?.property?.policyNumber || 'N/A'}</span>
    </div>
    <div class="metadata-row">
      <span class="metadata-label">Date of Loss:</span>
      <span>${data.metadata?.claimInfo?.dateOfLoss || 'N/A'}</span>
    </div>
    <div class="metadata-row">
      <span class="metadata-label">Damage Types:</span>
      <span>${(data.metadata?.claimInfo?.damageTypes || []).join(', ')}</span>
    </div>
  </div>

  <!-- Executive Summary -->
  <div class="executive-summary">
    <h2>Executive Summary</h2>
    <div class="metadata-row">
      <span class="metadata-label">Total Damage Value:</span>
      <span style="font-size: 20px; color: #E74C3C; font-weight: bold;">
        $${(data.executiveSummary?.totalDamageValue || 0).toLocaleString()}
      </span>
    </div>
    <div class="metadata-row">
      <span class="metadata-label">Critical Issues Found:</span>
      <span style="font-weight: bold; color: #dc3545;">${data.executiveSummary?.criticalIssues || 0}</span>
    </div>
    <div class="metadata-row">
      <span class="metadata-label">Repair Timeline:</span>
      <span>${data.executiveSummary?.timelineEstimate || 'N/A'}</span>
    </div>
    <div class="metadata-row">
      <span class="metadata-label">Confidence Score:</span>
      <span>${data.executiveSummary?.confidenceScore || 0}%</span>
    </div>
    
    <!-- Estimated Repair Costs Banner -->
    <div style="background: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h3 style="margin-top: 0; margin-bottom: 20px; color: #2C3E50;">ESTIMATED REPAIR COSTS</h3>
      <div style="display: flex; justify-content: space-between; text-align: center;">
        <div style="flex: 1;">
          <div style="font-weight: bold; color: #666; font-size: 12px; margin-bottom: 8px;">IMMEDIATE</div>
          <div style="font-size: 24px; font-weight: bold; color: #dc3545;">
            $${Math.round(data.executiveSummary?.totalDamageValue || 0 * 0.25).toLocaleString()}
          </div>
          <div style="font-size: 11px; color: #999; margin-top: 4px;">0-30 days</div>
        </div>
        <div style="flex: 1; border-left: 1px solid #ffc107; border-right: 1px solid #ffc107;">
          <div style="font-weight: bold; color: #666; font-size: 12px; margin-bottom: 8px;">SHORT-TERM</div>
          <div style="font-size: 24px; font-weight: bold; color: #fd7e14;">
            $${Math.round(data.executiveSummary?.totalDamageValue || 0 * 0.45).toLocaleString()}
          </div>
          <div style="font-size: 11px; color: #999; margin-top: 4px;">1-3 months</div>
        </div>
        <div style="flex: 1;">
          <div style="font-weight: bold; color: #666; font-size: 12px; margin-bottom: 8px;">LONG-TERM</div>
          <div style="font-size: 24px; font-weight: bold; color: #495057;">
            $${Math.round(data.executiveSummary?.totalDamageValue || 0 * 0.30).toLocaleString()}
          </div>
          <div style="font-size: 11px; color: #999; margin-top: 4px;">3+ months</div>
        </div>
      </div>
      <div style="border-top: 1px solid #ffc107; margin-top: 20px; padding-top: 15px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: bold; color: #666;">TOTAL ESTIMATED COST</span>
        <span style="font-size: 20px; font-weight: bold; color: #2C3E50;">
          $${(data.executiveSummary?.totalDamageValue || 0).toLocaleString()}
        </span>
      </div>
    </div>
    
    <h3>Key Recommendations</h3>
    <ul>
      ${(data.executiveSummary?.repairRecommendations || []).map(rec => `<li>${rec}</li>`).join('')}
    </ul>
  </div>

  <div class="page-break"></div>

  <!-- Area Findings -->
  <h2>Detailed Area Findings</h2>
  ${(data.areaFindings || []).map(area => `
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

      ${area.technicalFindings && Object.keys(area.technicalFindings).length > 0 ? `
        <div style="margin: 15px 0; background: #f8f9fa; padding: 10px; border-radius: 5px;">
          <strong>Technical Analysis:</strong><br>
          ${Object.entries(area.technicalFindings).map(([key, value]) =>
            `<div style="margin: 5px 0;"><strong>${key.replace(/([A-Z])/g, ' $1').trim()}:</strong> ${value}</div>`
          ).join('')}
        </div>
      ` : ''}

      ${area.materialSpecs && Object.keys(area.materialSpecs).length > 0 ? `
        <div style="margin: 15px 0; background: #f0f9f0; padding: 10px; border-radius: 5px; border-left: 4px solid #28a745;">
          <strong>Material Specifications:</strong><br>
          ${Object.entries(area.materialSpecs).map(([key, value]) =>
            `<div style="margin: 5px 0;"><strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong> ${value}</div>`
          ).join('')}
        </div>
      ` : ''}

      ${area.environmentalConcerns && Object.keys(area.environmentalConcerns).length > 0 ? `
        <div style="margin: 15px 0; background: #fef5e7; padding: 10px; border-radius: 5px; border-left: 4px solid #ffc107;">
          <strong>⚠️ Environmental Assessment:</strong><br>
          ${Object.entries(area.environmentalConcerns).map(([key, value]) =>
            `<div style="margin: 5px 0;"><strong>${key.replace(/([A-Z])/g, ' $1').trim()}:</strong> ${value}</div>`
          ).join('')}
        </div>
      ` : ''}

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
          ${(area.recommendations || []).map(rec => `<li>${rec}</li>`).join('')}
        </ul>
      </div>
      
      <div class="cost">
        Estimated Cost: $${(area.estimatedCost || 0).toLocaleString()}
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
        $${(data.aiInsights?.hiddenDamageEstimate || 0).toLocaleString()}
      </span>
    </div>
    
    <div class="metadata-row">
      <span class="metadata-label">Code Upgrade Opportunities:</span>
      <span style="font-weight: bold;">
        $${(data.aiInsights?.codeUpgradeOpportunities || 0).toLocaleString()}
      </span>
    </div>
    
    <div class="metadata-row">
      <span class="metadata-label">Historical Recovery:</span>
      <span style="font-weight: bold;">
        $${(data.aiInsights?.historicalRecovery || 0).toLocaleString()}
      </span>
    </div>
    
    <div style="margin: 20px 0;">
      <strong>Market Comparison:</strong><br>
      ${data.aiInsights?.marketComparison || 'Analysis pending...'}
    </div>

    <div style="margin: 20px 0;">
      <strong>Risk Assessment:</strong>
      <ul>
        ${(data.aiInsights?.riskAssessment || []).map(risk => `<li>${risk}</li>`).join('')}
      </ul>
    </div>

    <div style="margin: 20px 0;">
      <strong>Technical Analysis:</strong><br>
      ${data.aiInsights?.technicalAnalysis || 'Technical analysis pending...'}
    </div>

    <div style="margin: 20px 0;">
      <strong>Material Specifications:</strong><br>
      ${data.aiInsights?.materialSpecifications || 'Material specifications pending...'}
    </div>

    <div style="margin: 20px 0;">
      <strong>Environmental Concerns:</strong><br>
      ${data.aiInsights?.environmentalConcerns || 'Environmental assessment pending...'}
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

  <div class="page-break"></div>

  <!-- Confidence Metrics -->
  <div class="confidence-metrics">
    <h2>AI Analysis Confidence Metrics</h2>

    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0;">
      <div style="background: #f0f8ff; padding: 15px; border-radius: 8px;">
        <div style="font-size: 24px; font-weight: bold; color: #007bff;">${data.aiInsights?.confidenceMetrics?.damagePrediction || 0}%</div>
        <div style="font-size: 14px; color: #007bff;">Damage Prediction</div>
      </div>

      <div style="background: #f0fff0; padding: 15px; border-radius: 8px;">
        <div style="font-size: 24px; font-weight: bold; color: #28a745;">${data.aiInsights?.confidenceMetrics?.costAccuracy || 0}%</div>
        <div style="font-size: 14px; color: #28a745;">Cost Accuracy</div>
      </div>

      <div style="background: #f8f0ff; padding: 15px; border-radius: 8px;">
        <div style="font-size: 24px; font-weight: bold; color: #6f42c1;">${data.aiInsights?.confidenceMetrics?.timelineReliability || 0}%</div>
        <div style="font-size: 14px; color: #6f42c1;">Timeline Reliability</div>
      </div>

      <div style="background: #fff8f0; padding: 15px; border-radius: 8px;">
        <div style="font-size: 24px; font-weight: bold; color: #fd7e14;">${data.aiInsights?.confidenceMetrics?.riskAssessment || 0}%</div>
        <div style="font-size: 14px; color: #fd7e14;">Risk Assessment</div>
      </div>
    </div>
  </div>

  <!-- Historical Data Analysis -->
  <div class="historical-data">
    <h2>Historical Claims Recovery Analysis</h2>

    <div style="margin: 20px 0;">
      <div class="metadata-row">
        <span class="metadata-label">Similar Claims Analyzed:</span>
        <span style="font-weight: bold;">${data.aiInsights?.historicalData?.similarClaims || 'N/A'}</span>
      </div>
      <div class="metadata-row">
        <span class="metadata-label">Average Settlement:</span>
        <span style="font-weight: bold; color: #28a745;">$${(data.aiInsights?.historicalData?.averageSettlement || 0).toLocaleString()}</span>
      </div>
      <div class="metadata-row">
        <span class="metadata-label">Resolution Time:</span>
        <span style="font-weight: bold;">${data.aiInsights?.historicalData?.timeToResolution || 'N/A'}</span>
      </div>
      <div class="metadata-row">
        <span class="metadata-label">Litigation Rate:</span>
        <span style="font-weight: bold; color: #dc3545;">${data.aiInsights?.historicalData?.litigationRate || 'N/A'}</span>
      </div>
    </div>
  </div>

  <!-- Environmental Factors -->
  <div class="environmental-factors">
    <h2>Environmental Conditions Assessment</h2>

    <div style="margin: 20px 0;">
      ${Object.entries(data.aiInsights?.environmentalFactors || {}).map(([key, value]) => `
        <div class="metadata-row">
          <span class="metadata-label">${key.replace(/([A-Z])/g, ' $1').trim()}:</span>
          <span style="font-weight: bold; color: #28a745;">${value}</span>
        </div>
      `).join('')}
    </div>
  </div>

  <!-- Claims Intelligence -->
  <div class="claims-intelligence">
    <h2>Claims Intelligence & Strategic Analysis</h2>

    <div style="margin: 20px 0; background: #f8f9fa; padding: 15px; border-radius: 8px;">
      <h3>Carrier Profile Analysis</h3>
      <div class="metadata-row">
        <span class="metadata-label">Carrier:</span>
        <span style="font-weight: bold;">${data.aiInsights?.claimsIntelligence?.carrierProfile?.name || 'N/A'}</span>
      </div>
      <div class="metadata-row">
        <span class="metadata-label">Claims Reputation:</span>
        <span>${data.aiInsights?.claimsIntelligence?.carrierProfile?.claimsReputation || 'N/A'}</span>
      </div>
      <div class="metadata-row">
        <span class="metadata-label">Negotiation Pattern:</span>
        <span>${data.aiInsights?.claimsIntelligence?.carrierProfile?.negotiationHistory || 'N/A'}</span>
      </div>
      <div class="metadata-row">
        <span class="metadata-label">Timeline Behavior:</span>
        <span>${data.aiInsights?.claimsIntelligence?.carrierProfile?.timelineBehavior || 'N/A'}</span>
      </div>
    </div>

    <div style="margin: 20px 0;">
      <h3>Strategic Considerations</h3>
      <ol>
        ${(data.aiInsights?.claimsIntelligence?.strategicConsiderations || []).map(strategy => `<li style="margin: 5px 0;">${strategy}</li>`).join('')}
      </ol>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- Inspection Methodology & Standards -->
  <div class="methodology">
    <h2>Inspection Methodology & Professional Standards</h2>

    <div style="margin: 20px 0;">
      <h3>Inspection Standards Compliance</h3>
      <div style="margin: 15px 0; background: #f8f9fa; padding: 15px; border-radius: 8px;">
        <div class="metadata-row">
          <span class="metadata-label">Standards Followed:</span>
          <span>ASHI (American Society of Home Inspectors) Standards of Practice</span>
        </div>
        <div class="metadata-row">
          <span class="metadata-label">Code References:</span>
          <span>International Residential Code (IRC), National Electrical Code (NEC)</span>
        </div>
        <div class="metadata-row">
          <span class="metadata-label">Inspector Certification:</span>
          <span>Licensed Professional Engineer, Certified Home Inspector</span>
        </div>
        <div class="metadata-row">
          <span class="metadata-label">Insurance Specialization:</span>
          <span>Property Damage Assessment, Storm Damage Analysis</span>
        </div>
      </div>
    </div>

    <div style="margin: 20px 0;">
      <h3>Systems Evaluated</h3>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 15px 0;">
        <div>
          <h4>Structural Systems</h4>
          <ul style="margin: 5px 0; padding-left: 20px;">
            <li>Foundation and structural elements</li>
            <li>Roof system and weather protection</li>
            <li>Attic and roof structure</li>
            <li>Exterior walls and siding</li>
          </ul>
        </div>
        <div>
          <h4>Mechanical Systems</h4>
          <ul style="margin: 5px 0; padding-left: 20px;">
            <li>Electrical systems and panels</li>
            <li>Plumbing systems and fixtures</li>
            <li>HVAC systems and ductwork</li>
            <li>Water heater and appliances</li>
          </ul>
        </div>
        <div>
          <h4>Interior Systems</h4>
          <ul style="margin: 5px 0; padding-left: 20px;">
            <li>Windows and doors</li>
            <li>Interior walls and ceilings</li>
            <li>Flooring systems</li>
            <li>Insulation and ventilation</li>
          </ul>
        </div>
        <div>
          <h4>Safety & Environmental</h4>
          <ul style="margin: 5px 0; padding-left: 20px;">
            <li>Fire and life safety systems</li>
            <li>Environmental hazards assessment</li>
            <li>Air quality evaluation</li>
            <li>Mold and moisture analysis</li>
          </ul>
        </div>
      </div>
    </div>

    <div style="margin: 20px 0;">
      <h3>Damage Assessment Methodology</h3>
      <div style="margin: 15px 0;">
        <p><strong>Visual Inspection:</strong> Comprehensive examination of all accessible areas including crawl spaces, attics, and mechanical rooms.</p>
        <p><strong>Technical Analysis:</strong> Use of moisture meters, thermal imaging, and electrical testing equipment to identify hidden damage.</p>
        <p><strong>Photographic Documentation:</strong> Digital photography of all significant findings with detailed annotations.</p>
        <p><strong>Code Compliance Review:</strong> Assessment of current systems against applicable building codes and safety standards.</p>
        <p><strong>Cost Analysis:</strong> Detailed repair cost estimates based on local labor rates and material costs.</p>
      </div>
    </div>

    <div style="margin: 20px 0; background: #e7f3ff; padding: 15px; border-radius: 8px; border-left: 4px solid #007bff;">
      <h3>Professional Disclaimer</h3>
      <p style="font-size: 12px; line-height: 1.4;">
        This inspection report represents the professional opinion of a licensed home inspector based on visual examination
        of accessible areas at the time of inspection. Some conditions may not be visible or may develop after the inspection date.
        This report is intended for insurance claim purposes and should be used in conjunction with estimates from licensed contractors.
        The inspector recommends verification of all findings by appropriate trade professionals before beginning repair work.
      </p>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <p>
      This report was generated by Stellar Intelligence Platform<br>
      AI-Powered Insurance Claim Intelligence<br>
      Report ID: ${data.metadata.reportId}<br>
      Generated: ${new Date(data.metadata?.generatedDate || new Date().toISOString()).toLocaleString()}
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
            titleElement.textContent = `Inspection_Report_${data.metadata?.claimNumber || 'N/A'}.pdf`
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
      printWindow.document.title = `Inspection_Report_${data.metadata?.claimNumber || 'N/A'}.pdf`

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
  link.download = `inspection-report-${data.metadata?.claimNumber || 'N/A'}.html`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}