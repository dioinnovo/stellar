import jsPDF from 'jspdf'
import { PolicyData } from '@/lib/ai/mock-policy-data'

export function generatePolicyAnalysisPDF(policyData: PolicyData): void {
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = 210
  const pageHeight = 297
  const margin = 20
  const contentWidth = pageWidth - (margin * 2)
  let yPosition = margin

  // Define colors - professional, minimal
  const primaryColor = '#1f2937' // Dark gray
  const secondaryColor = '#4b5563' // Medium gray
  const accentColor = '#e74c3c' // Stellar orange (minimal use)

  // Helper functions
  const addText = (text: string, x: number, y: number, options: any = {}) => {
    const { fontSize = 10, color = primaryColor, align = 'left', fontStyle = 'normal' } = options
    pdf.setFontSize(fontSize)
    pdf.setTextColor(color)
    pdf.setFont('helvetica', fontStyle)

    if (align === 'center') {
      pdf.text(text, x, y, { align: 'center' })
    } else {
      pdf.text(text, x, y)
    }

    return y + (fontSize * 0.35) + 2
  }

  const addSection = (title: string, y: number) => {
    pdf.setFillColor(248, 250, 252) // Very light gray background
    pdf.rect(margin, y - 3, contentWidth, 8, 'F')
    return addText(title, margin + 2, y + 2, { fontSize: 12, fontStyle: 'bold', color: primaryColor })
  }

  const addLine = (y: number) => {
    pdf.setDrawColor(229, 231, 235) // Light gray line
    pdf.line(margin, y, pageWidth - margin, y)
    return y + 3
  }

  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      pdf.addPage()
      yPosition = margin
    }
  }

  // Header
  pdf.setFillColor(31, 41, 55) // Dark header
  pdf.rect(0, 0, pageWidth, 25, 'F')

  addText('COMPREHENSIVE POLICY ANALYSIS REPORT', pageWidth/2, 12, {
    fontSize: 16,
    color: '#ffffff',
    align: 'center',
    fontStyle: 'bold'
  })

  addText('Stellar Adjusting Intelligence Platform', pageWidth/2, 18, {
    fontSize: 10,
    color: '#ffffff',
    align: 'center'
  })

  yPosition = 35

  // Policy Information Header
  yPosition = addSection('POLICY INFORMATION', yPosition)
  yPosition = addText(`Insured: ${policyData.insuredName}`, margin, yPosition, { fontSize: 11, fontStyle: 'bold' })
  yPosition = addText(`Policy Number: ${policyData.policyNumber}`, margin, yPosition)
  yPosition = addText(`Carrier: ${policyData.carrier}`, margin, yPosition)
  yPosition = addText(`Policy Type: ${policyData.policyType}`, margin, yPosition)
  yPosition = addText(`Policy Period: ${policyData.effectiveDates.start}`, margin, yPosition)
  if (policyData.effectiveDates.end !== 'No fixed date of expiration') {
    yPosition = addText(`Expiration: ${policyData.effectiveDates.end}`, margin, yPosition)
  } else {
    yPosition = addText(`Expiration: ${policyData.effectiveDates.end}`, margin, yPosition)
  }
  yPosition = addText(`Agency: ${policyData.insuredLocation.additional[0] || 'See policy documents'}`, margin, yPosition)
  yPosition = addText(`Report Date: ${new Date().toLocaleDateString()}`, margin, yPosition)
  yPosition += 5

  // Executive Summary
  checkPageBreak(30)
  yPosition = addSection('EXECUTIVE SUMMARY', yPosition)
  yPosition = addText(`Building Property Protection: $${policyData.policyLimits.dwelling.toLocaleString()}`, margin, yPosition, { fontStyle: 'bold' })
  yPosition = addText(`Personal Property Protection: $${policyData.policyLimits.personalProperty.toLocaleString()} (Replacement Cost)`, margin, yPosition)
  yPosition = addText(`Additional Living Expenses: $${policyData.policyLimits.lossOfUse.toLocaleString()} or 24 months`, margin, yPosition)
  yPosition = addText(`Family Liability Protection: $${policyData.policyLimits.liability.toLocaleString()} each occurrence`, margin, yPosition)
  yPosition = addText(`Building Codes Coverage: $${policyData.additionalCoverages.codeUpgrade.toLocaleString()} (25% of Building Protection)`, margin, yPosition)
  yPosition = addText(`Other Peril Deductible: $${policyData.deductibles.allOtherPerils.toLocaleString()}`, margin, yPosition)
  yPosition += 5

  // Policy Limits
  checkPageBreak(40)
  yPosition = addSection('POLICY LIMITS & SETTLEMENT BASIS', yPosition)

  const limits = [
    ['Building Property (Coverage A)', `$${policyData.policyLimits.dwelling.toLocaleString()}`, 'Replacement Cost'],
    ['Personal Property (Coverage C)', `$${policyData.policyLimits.personalProperty.toLocaleString()}`, 'Replacement Cost'],
    ['Additional Living Expense', `$${policyData.policyLimits.lossOfUse.toLocaleString()}`, 'or 24 months'],
    ['Family Liability Protection', `$${policyData.policyLimits.liability.toLocaleString()}`, 'per occurrence'],
    ['Guest Medical Protection', `$${policyData.policyLimits.medicalPayments.toLocaleString()}`, 'per person'],
    ['Loss Assessments', '$2,120', 'per occurrence']
  ]

  limits.forEach(([coverage, amount, basis]) => {
    checkPageBreak(8)
    yPosition = addText(coverage, margin, yPosition)
    yPosition = addText(`${amount} - ${basis}`, margin + 100, yPosition - (10 * 0.35) - 2, { fontStyle: 'bold', fontSize: 9 })
  })
  yPosition += 5

  // Personal Property Sublimits
  checkPageBreak(40)
  yPosition = addSection('PERSONAL PROPERTY SUBLIMITS', yPosition)

  yPosition = addText('CRITICAL: These limits apply regardless of total personal property coverage:', margin, yPosition, { fontStyle: 'italic', fontSize: 9 })
  yPosition += 2

  if (policyData.personalPropertyLimits) {
    Object.entries(policyData.personalPropertyLimits).forEach(([item, limit]) => {
      checkPageBreak(8)
      yPosition = addText(`• ${item}: ${limit}`, margin, yPosition, { fontSize: 9 })
    })
  }
  yPosition += 5

  // Deductibles
  checkPageBreak(25)
  yPosition = addSection('DEDUCTIBLES', yPosition)
  yPosition = addText(`All Other Perils: $${policyData.deductibles.allOtherPerils.toLocaleString()}`, margin, yPosition)
  yPosition = addText(`Annual Hurricane: ${policyData.deductibles.hurricane}`, margin, yPosition)
  yPosition = addText('IMPORTANT: Hurricane deductible calculated at 0% for this policy', margin, yPosition, { fontSize: 9, fontStyle: 'italic' })
  yPosition += 5

  // Covered Perils
  if (policyData.coveredPerils) {
    checkPageBreak(50)
    yPosition = addSection('COVERED PERILS', yPosition)

    policyData.coveredPerils.forEach(peril => {
      checkPageBreak(8)
      yPosition = addText(`✓ ${peril}`, margin, yPosition, { fontSize: 9 })
    })
    yPosition += 5
  }

  // Endorsements
  checkPageBreak(30)
  yPosition = addSection('POLICY ENDORSEMENTS', yPosition)
  policyData.endorsements.forEach(endorsement => {
    checkPageBreak(8)
    yPosition = addText(`• ${endorsement}`, margin, yPosition)
  })
  yPosition += 5

  // CRITICAL ALERTS FOR PUBLIC ADJUSTERS
  checkPageBreak(30)
  yPosition = addSection('⚠️ CRITICAL ALERTS FOR PUBLIC ADJUSTERS', yPosition)

  pdf.setFillColor(255, 243, 224) // Light warning background
  pdf.rect(margin, yPosition - 2, contentWidth, 25, 'F')

  yPosition = addText('DEPRECIATION WARNING (AP4981):', margin + 2, yPosition + 2, { fontStyle: 'bold', color: accentColor })
  yPosition = addText('Castle Key WILL depreciate labor, overhead & profit in ACV calculations', margin + 2, yPosition)
  yPosition = addText('This significantly reduces initial settlements - prepare clients accordingly', margin + 2, yPosition)
  yPosition += 5

  yPosition = addText('COVERAGE GAPS IDENTIFIED:', margin + 2, yPosition, { fontStyle: 'bold' })
  yPosition = addText('• NO Water Back-Up Coverage - Sewer/drain backup excluded', margin + 2, yPosition)
  yPosition = addText('• NO Sinkhole Activity Coverage - Available but not purchased', margin + 2, yPosition)
  yPosition = addText('• FLOOD EXCLUDED - Including storm surge, overflow, groundwater', margin + 2, yPosition)
  yPosition = addText('• NO Extended Coverage for Jewelry, Cameras, Musical Instruments', margin + 2, yPosition)
  yPosition = addText('NOTE: Mold Remediation IS included at $10,000', margin + 2, yPosition, { fontStyle: 'italic', fontSize: 9 })
  yPosition += 8

  // Settlement Opportunities
  checkPageBreak(45)
  yPosition = addSection('STRATEGIC SETTLEMENT MAXIMIZATION OPPORTUNITIES', yPosition)

  yPosition = addText('IMMEDIATE ACTION ITEMS FOR MAXIMUM RECOVERY:', margin, yPosition, { fontStyle: 'bold', fontSize: 11 })
  yPosition += 3

  const opportunities = [
    `1. BUILDING CODES: $39,750 available - Push for 50% upgrade ($79,500)`,
    `2. ALE CALCULATION: 20% of $53,000 = $10,600 OR 24 months - claim longer period`,
    `3. FAIR RENTAL VALUE: Up to $15,900 if unit was rented - document lost income`,
    `4. DEPRECIATION CHALLENGE: Fight AP4981 labor/overhead depreciation`,
    `5. MOLD REMEDIATION: $10,000 included - document ALL mold immediately`,
    `6. HURRICANE MITIGATION: Document $2,574 in annual discounts as property value`,
    `7. LOSS ASSESSMENT: $2,120 available for association deductibles`,
    `8. EMERGENCY MEASURES: $3,000 for immediate mitigation - act within 72 hours`
  ]

  opportunities.forEach(opportunity => {
    checkPageBreak(8)
    yPosition = addText(opportunity, margin, yPosition, { fontSize: 10, color: primaryColor })
  })
  yPosition += 5

  // Strategic Recommendations
  checkPageBreak(35)
  yPosition = addSection('CLAIM STRATEGY RECOMMENDATIONS', yPosition)

  yPosition = addText('FOR WATER DAMAGE CLAIMS:', margin, yPosition, { fontStyle: 'bold' })
  yPosition = addText('• Confirm sudden & accidental - NOT gradual seepage', margin + 2, yPosition)
  yPosition = addText('• Document within 72 hours to preserve emergency measures coverage', margin + 2, yPosition)
  yPosition = addText('• NO water backup coverage - ensure damage is from covered source', margin + 2, yPosition)
  yPosition += 3

  yPosition = addText('FOR HURRICANE/WIND CLAIMS:', margin, yPosition, { fontStyle: 'bold' })
  yPosition = addText('• Only $1,000 deductible (0% calculation) - major advantage', margin + 2, yPosition)
  yPosition = addText('• Wind-driven rain only covered if wind creates opening first', margin + 2, yPosition)
  yPosition = addText('• Use NOAA date for loss verification', margin + 2, yPosition)
  yPosition += 3

  yPosition = addText('COVERAGE GAP MITIGATION:', margin, yPosition, { fontStyle: 'bold' })
  yPosition = addText('• Add Water Backup immediately - critical gap', margin + 2, yPosition)
  yPosition = addText('• Consider Sinkhole coverage - Florida specific risk', margin + 2, yPosition)
  yPosition = addText('• Upgrade jewelry/valuables coverage - current sublimits inadequate', margin + 2, yPosition)
  yPosition += 5

  // Coverages NOT Purchased - IMPORTANT
  checkPageBreak(50)
  yPosition = addSection('CRITICAL COVERAGE GAPS - IMMEDIATE ATTENTION REQUIRED', yPosition)

  yPosition = addText('HIGH RISK - NO COVERAGE FOR:', margin, yPosition, { fontStyle: 'bold', color: accentColor })
  yPosition += 2

  const criticalGaps = [
    'WATER BACK-UP: Sewer/drain backup completely excluded',
    'SINKHOLE ACTIVITY: Major Florida risk with zero coverage',
    'FLOOD: No coverage for any flood/storm surge/groundwater'
  ]

  criticalGaps.forEach(gap => {
    checkPageBreak(8)
    yPosition = addText(`⚠ ${gap}`, margin, yPosition, { fontSize: 10, color: accentColor })
  })

  yPosition += 3
  yPosition = addText('ADDITIONAL COVERAGES NOT PURCHASED:', margin, yPosition, { fontStyle: 'bold' })
  yPosition += 2

  const notPurchased = [
    'Business Property Protection',
    'Electronic Data Recovery',
    'Extended Coverage on Cameras',
    'Extended Coverage on Jewelry/Watches/Furs (current limit only $5,000)',
    'Extended Coverage on Musical Instruments',
    'Extended Coverage on Sports Equipment',
    'Fire Department Charges',
    'Identity Theft Expenses',
    'Increased Silverware Theft Limit (current $2,500)',
    'Optional Additional Mold Protection (base $10K included)',
    'Credit Card/Bank Transfer Protection'
  ]

  notPurchased.forEach(coverage => {
    checkPageBreak(8)
    yPosition = addText(`• ${coverage}`, margin + 5, yPosition, { fontSize: 9, color: secondaryColor })
  })

  yPosition += 3
  yPosition = addText('URGENT: Contact Rossi & Associates (407) 843-3333 - AmyRossi@allstate.com', margin, yPosition, { fontStyle: 'bold', fontSize: 10 })
  yPosition += 5

  // Critical Deadlines
  checkPageBreak(30)
  yPosition = addSection('TIME-SENSITIVE CRITICAL DEADLINES', yPosition)

  const deadlines = [
    'IMMEDIATE: Report loss to Castle Key - Document everything',
    'IMMEDIATE: Report theft to police if applicable',
    '72 HOURS: Wait period before permanent repairs can begin',
    '72 HOURS: Begin emergency mitigation for $3,000 coverage',
    '2 YEARS: Deadline to file claim or reopened claim',
    '3 YEARS: Deadline for supplemental claims',
    '5 YEARS: Statute of limitations for suit (Florida)',
    '10 DAYS: Notice to DFS before litigation (FL 627.70152)',
    '2 WEEKS: Civil Authority coverage if area evacuated'
  ]

  deadlines.forEach(deadline => {
    checkPageBreak(8)
    const isImmediate = deadline.includes('IMMEDIATE') || deadline.includes('72 HOURS')
    yPosition = addText(`${deadline}`, margin, yPosition, {
      fontSize: isImmediate ? 10 : 9,
      color: isImmediate ? accentColor : secondaryColor,
      fontStyle: isImmediate ? 'bold' : 'normal'
    })
  })
  yPosition += 5

  // Final recommendations
  checkPageBreak(20)
  yPosition = addSection('PUBLIC ADJUSTER ACTION PLAN', yPosition)

  yPosition = addText('1. IMMEDIATE: Document all damage before ANY cleanup', margin, yPosition, { fontStyle: 'bold' })
  yPosition = addText('2. VERIFY: Damage is from covered peril (not flood/backup)', margin, yPosition)
  yPosition = addText('3. MAXIMIZE: Use full $39,750 Building Codes coverage', margin, yPosition)
  yPosition = addText('4. CHALLENGE: Any depreciation of labor/overhead costs', margin, yPosition)
  yPosition = addText('5. CALCULATE: Full ALE for entire displacement period', margin, yPosition)
  yPosition = addText('6. DOCUMENT: All hurricane mitigation features for value', margin, yPosition)
  yPosition = addText('7. LEVERAGE: Low $1,000 hurricane deductible advantage', margin, yPosition)

  // Footer
  const footerY = pageHeight - 15
  yPosition = addLine(footerY - 5)
  addText('This analysis was generated by Stella Claims Intelligence System', pageWidth/2, footerY, {
    fontSize: 9,
    color: secondaryColor,
    align: 'center'
  })

  // Save the PDF
  const filename = `${policyData.insuredName.replace(/\s+/g, '_')}_Policy_Analysis_${new Date().toISOString().split('T')[0]}.pdf`
  pdf.save(filename)
}

export function generateSimplePolicyPDF(content: string, filename: string): void {
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = 210
  const pageHeight = 297
  const margin = 20
  const contentWidth = pageWidth - (margin * 2)
  let yPosition = margin

  // Header
  pdf.setFillColor(31, 41, 55)
  pdf.rect(0, 0, pageWidth, 25, 'F')

  pdf.setFontSize(16)
  pdf.setTextColor('#ffffff')
  pdf.setFont('helvetica', 'bold')
  pdf.text('POLICY ANALYSIS REPORT', pageWidth/2, 12, { align: 'center' })

  pdf.setFontSize(10)
  pdf.text('Stellar Adjusting Intelligence Platform', pageWidth/2, 18, { align: 'center' })

  yPosition = 35

  // Content
  pdf.setFontSize(10)
  pdf.setTextColor('#1f2937')
  pdf.setFont('helvetica', 'normal')

  // Split content into lines and add to PDF
  const lines = content.split('\n')

  lines.forEach(line => {
    if (yPosition > pageHeight - margin) {
      pdf.addPage()
      yPosition = margin
    }

    // Handle different text formatting
    if (line.startsWith('# ')) {
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text(line.substring(2), margin, yPosition)
      yPosition += 8
    } else if (line.startsWith('## ')) {
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.text(line.substring(3), margin, yPosition)
      yPosition += 6
    } else if (line.startsWith('### ')) {
      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'bold')
      pdf.text(line.substring(4), margin, yPosition)
      yPosition += 5
    } else if (line.trim() === '') {
      yPosition += 3
    } else {
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')

      // Wrap long lines
      const splitText = pdf.splitTextToSize(line, contentWidth)
      pdf.text(splitText, margin, yPosition)
      yPosition += splitText.length * 4
    }
  })

  pdf.save(filename)
}