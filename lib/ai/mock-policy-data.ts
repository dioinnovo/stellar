/**
 * Mock Policy Data for Demo
 * This file contains mock insurance policy data for demonstration purposes
 */

export interface PolicyData {
  insuredName: string;
  policyNumber: string;
  carrier: string;
  policyType: string;
  effectiveDates: {
    start: string;
    end: string;
  };
  insuredLocation: {
    primary: string;
    additional: string[];
  };
  policyLimits: {
    dwelling: number;
    otherStructures: number;
    personalProperty: number;
    lossOfUse: number;
    liability: number;
    medicalPayments: number;
  };
  deductibles: {
    allOtherPerils: number;
    hurricane: string;
    flood: number;
    namedStorm: string;
  };
  exclusions: string[];
  endorsements: string[];
  appraisalLanguage: string;
  managedRepair: {
    required: boolean;
    optOut: boolean;
    preferredVendors: string[];
  };
  premiumReductions: string[];
  claimSpecificLanguage: {
    waterDamage: string;
    windDamage: string;
    mold: string;
  };
  moldLimits: {
    coverage: number;
    remediationLimit: number;
  };
  emergencyServices: {
    limit: number;
    timeRestriction: string;
  };
  mortgageInfo: {
    mortgagee: string;
    loanNumber: string;
  };
  additionalCoverages: {
    codeUpgrade: number;
    debrisRemoval: number;
    treesAndShrubs: number;
    fireDepService: number;
  };
  coveredPerils?: string[];
  personalPropertyLimits?: { [key: string]: number | string };
  discounts?: string[];
}

export const mockPolicies: Record<string, PolicyData> = {
  "don burleson-castillo": {
    insuredName: "Don Burleson-Castillo",
    policyNumber: "988 702 301",
    carrier: "Castle Key Indemnity Company",
    policyType: "Condominium Owners Policy",
    effectiveDates: {
      start: "November 23, 2022 at 12:01 A.M. standard time",
      end: "No fixed date of expiration"
    },
    insuredLocation: {
      primary: "Condominium Unit (Address from policy documents)",
      additional: ["Castle Key agency: Rossi & Associates, 901 N Mills Avenue, Orlando FL 32803"]
    },
    policyLimits: {
      dwelling: 159000, // Building Property Protection
      otherStructures: 0, // Not applicable for condo
      personalProperty: 53000, // Personal Property Protection - Replacement Cost
      lossOfUse: 10600, // Additional Living Expense - 20% of Coverage C ($53,000)
      liability: 300000, // Family Liability Protection
      medicalPayments: 1000 // Guest Medical Protection
    },
    deductibles: {
      allOtherPerils: 1000,
      hurricane: "$1,000 (0% of Personal Property Protection limit)",
      flood: 0, // Not purchased
      namedStorm: "$1,000 (0% of Personal Property Protection limit)"
    },
    exclusions: [
      "FLOOD - Includes flood, surface water, waves, tidal water, storm surge, overflow, spray, back-up from sewers/drains",
      "Wind-Driven Rain - Limited coverage (only if wind/hail damages building first creating opening)",
      "Sinkhole Activity - NOT PURCHASED (Optional coverage available)",
      "Water Back-Up - NOT PURCHASED",
      "Business Property Protection - NOT PURCHASED",
      "Electronic Data Recovery - NOT PURCHASED",
      "Extended Coverage on Cameras - NOT PURCHASED",
      "Extended Coverage on Jewelry, Watches and Furs - NOT PURCHASED",
      "Extended Coverage on Musical Instruments - NOT PURCHASED",
      "Extended Coverage on Sports Equipment - NOT PURCHASED",
      "Fire Department Charges - NOT PURCHASED",
      "Identity Theft Expenses - NOT PURCHASED",
      "Increased Silverware Theft Limit - NOT PURCHASED",
      "Optional Protection for Mold - NOT PURCHASED (Note: $10,000 remediation IS included)",
      "Personal Injury Protection - NOT PURCHASED",
      "Credit Card/Bank Fund Transfer/Check Forgery - NOT COVERED (No 'X' on checklist)"
    ],
    endorsements: [
      "Florida Hurricane Deductible Endorsement (AP4490)",
      "Florida Condominium Policy Amendatory Endorsement (AP4992)",
      "Amendatory Endorsement (AP4963) - Additional Living Expense specifications",
      "Depreciation Amendatory Endorsement (AP4981) - ACV calculations include depreciation of labor, overhead, profit",
      "Building Codes Coverage - 25% of Building Property limit (option to increase to 50% available)",
      "Loss Assessments - $2,120 each occurrence",
      "Catastrophic Ground Cover Collapse - Covered per FL statute"
    ],
    appraisalLanguage: "CRITICAL DEPRECIATION NOTICE: Per AP4981 endorsement, when determining actual cash value, repair/rebuild costs including materials, labor, overhead and profit MAY BE DEPRECIATED. This significantly impacts claim settlements. Appraisal provision: Either party may demand appraisal with 20-day appraiser selection deadline. Full compliance with policy terms required before suit. 5-year statute of limitations applies with 10-day DFS notice requirement per FL 627.70152.",
    managedRepair: {
      required: false,
      optOut: true,
      preferredVendors: ["No MRP or warranty program specified in policy"]
    },
    premiumReductions: [
      "Property Insurance Adjustment provision using Marshall Swift Boeckh Publications Building Cost Index",
      "Coverage A increased approximately $3,000 due to adjustment provision",
      "Premium period: November 23, 2022 through November 23, 2023",
      "Mortgagee billing arrangement in place"
    ],
    claimSpecificLanguage: {
      waterDamage: "Water Back-Up NOT PURCHASED - Major coverage gap. No protection for sewer/drain backup. Accidental discharge from plumbing IS covered (sudden & accidental only).",
      windDamage: "Hurricane deductible: $1,000 (0% calculation). Coverage includes catastrophic ground cover collapse. Must report weather losses based on NOAA verification date. 72-hour waiting period before permanent repairs.",
      mold: "MOLD REMEDIATION INCLUDED: $10,000 for Mold, Fungus, Wet Rot, and Dry Rot Remediation. Optional additional mold protection NOT purchased. Remediation covered when resulting from covered peril."
    },
    moldLimits: {
      coverage: 0, // Optional Protection for Mold not purchased
      remediationLimit: 0 // Not purchased
    },
    emergencyServices: {
      limit: 0, // Standard coverage per policy terms
      timeRestriction: "Permanent repairs cannot begin before 72 hours after notification or inspection"
    },
    mortgageInfo: {
      mortgagee: "Mortgagee has been billed (Do not pay)",
      loanNumber: "See mortgage clause in policy documents"
    },
    additionalCoverages: {
      codeUpgrade: 39750, // Building Codes - 25% of Building Property limit (included)
      debrisRemoval: 7950, // 5% over limit of liability (included)
      treesAndShrubs: 0, // Grave Markers coverage included but no trees/shrubs
      fireDepService: 0, // Not purchased
      moldRemediation: 10000, // Mold, Fungus, Wet/Dry Rot Remediation (included)
      reasonableEmergencyMeasures: 3000, // Included
      emergencyRemoval: 30, // 30 days coverage (included)
      powerInterruption: 500, // Included
      collapse: 0, // Included in policy
      glassReplacement: 0, // Included in policy
      landlordssFurnishings: 0, // Included
      graveMarkers: 0, // Included
      creditCardForgery: 0, // NOT COVERED - No 'X' on checklist
      lossAssessment: 2120, // Per occurrence
      claimExpenses: 150, // $150/day for loss of wages when attending trials
      firstAidExpenses: 0, // Included
      damageToPropertyOfOthers: 500 // Included
    },
    coveredPerils: [
      "Windstorm from Hurricane (Hurricane Deductible Applies)",
      "Windstorm or Hail",
      "Wind-Driven Rain (with restrictions - must damage building first)",
      "Fire or Lightning",
      "Freezing",
      "Explosion",
      "Riot or Civil Commotion",
      "Vehicles",
      "Smoke",
      "Vandalism or Malicious Mischief",
      "Theft",
      "Accidental Discharge or Overflow of Water (Sudden and Accidental)",
      "Power Surge (Artificially Generated Electrical Current)",
      "Any Other Peril Not Specifically Excluded (Dwelling Only)"
    ],
    personalPropertyLimits: {
      "Money, bullion, banknotes, coins": "$200",
      "Business property away from premises": "$200",
      "Business property on premises": "$1,000",
      "Trading cards, comics, Hummels (max $250/item)": "$1,000",
      "Securities, tickets, stamps, passports": "$1,000",
      "Manuscripts (including electronic)": "$1,000",
      "Watercraft including equipment": "$1,000",
      "Trailers not used with watercraft": "$1,000",
      "Jewelry/watches/furs theft (max $1,000/item)": "$5,000",
      "Motorized vehicle parts not attached": "$1,000",
      "Firearms/accessories theft": "$2,000",
      "Silverware/pewterware/goldware theft": "$2,500"
    },
    discounts: [
      "Protective Device: 2%",
      "55 and Retired: 5%",
      "Claim Free: 20%",
      "Home Buyer: 8%",
      "Responsible Payment: 8%",
      "HURRICANE MITIGATION DISCOUNTS:",
      "Roof Covering - Meets FL Building Code: 33% ($379 reduction)",
      "Reinforced Concrete Roof Deck: 82% ($943 reduction)",
      "Roof-to-Wall Connection - Using Clips: 9% ($103 reduction)",
      "Roof-to-Wall - Single/Double Wraps: 11% ($126 reduction)",
      "Secondary Water Resistance (SWR): 22% ($253 reduction)",
      "Shutters - Hurricane Protection Type: 22% ($253 reduction)",
      "Hip Roof (45% slope): $517 reduction",
      "Total Hurricane Premium: $1,150.34 (part of annual $2,114.40)"
    ]
  },
  "maria gonzalez": {
    insuredName: "Maria Gonzalez",
    policyNumber: "FL-DP3-2024-298374",
    carrier: "Citizens Property Insurance Corporation",
    policyType: "Dwelling Fire DP-3",
    effectiveDates: {
      start: "January 1, 2024",
      end: "January 1, 2025"
    },
    insuredLocation: {
      primary: "789 Ocean Drive, Fort Lauderdale, FL 33301",
      additional: ["Pool house at same address"]
    },
    policyLimits: {
      dwelling: 650000,
      otherStructures: 65000,
      personalProperty: 325000,
      lossOfUse: 130000,
      liability: 300000,
      medicalPayments: 2500
    },
    deductibles: {
      allOtherPerils: 1000,
      hurricane: "5% of dwelling ($32,500)",
      flood: 2500,
      namedStorm: "5% of dwelling ($32,500)"
    },
    exclusions: [
      "Flood damage",
      "Backup of sewers or drains",
      "Mold, fungus, or wet rot",
      "Settling, cracking, shrinking of foundation",
      "Birds, vermin, rodents, or insects",
      "Wear and tear",
      "Mechanical breakdown"
    ],
    endorsements: [
      "Ordinance or Law Coverage - 25% of dwelling",
      "Inflation Guard - 4% annual increase",
      "Refrigerated Property Coverage - $500",
      "Loss Assessment - $2,000"
    ],
    appraisalLanguage: "If we fail to agree on the amount of loss, either may demand that the amount of loss be determined by appraisal. If either makes a written demand for appraisal, each shall select a competent, independent appraiser. Each shall notify the other of the appraiser's identity within 20 days of receipt of the written demand.",
    managedRepair: {
      required: true,
      optOut: false,
      preferredVendors: ["Contractor Connection Network"]
    },
    premiumReductions: [
      "Age of Home Surcharge - Home built 1998",
      "Hurricane Mitigation - Partial credit"
    ],
    claimSpecificLanguage: {
      waterDamage: "We insure for direct physical loss caused by water damage from plumbing systems, excluding gradual leaks.",
      windDamage: "Windstorm coverage subject to hurricane deductible during named storms.",
      mold: "Not covered unless hidden and resulting from covered water damage."
    },
    moldLimits: {
      coverage: 0,
      remediationLimit: 0
    },
    emergencyServices: {
      limit: 1000,
      timeRestriction: "Within 48 hours"
    },
    mortgageInfo: {
      mortgagee: "Bank of America, N.A.",
      loanNumber: "1234567890"
    },
    additionalCoverages: {
      codeUpgrade: 50000,
      debrisRemoval: 5000,
      treesAndShrubs: 2500,
      fireDepService: 500
    }
  },
  "james richardson": {
    insuredName: "James Richardson",
    policyNumber: "FL-HO6-2024-573821",
    carrier: "Allstate Insurance Company",
    policyType: "Condominium Unit Owners HO-6",
    effectiveDates: {
      start: "June 1, 2024",
      end: "June 1, 2025"
    },
    insuredLocation: {
      primary: "2500 Bayshore Drive Unit 1204, Miami, FL 33133",
      additional: ["Storage unit B-47 in building"]
    },
    policyLimits: {
      dwelling: 150000,
      otherStructures: 0,
      personalProperty: 100000,
      lossOfUse: 30000,
      liability: 300000,
      medicalPayments: 5000
    },
    deductibles: {
      allOtherPerils: 1000,
      hurricane: "2% of dwelling ($3,000)",
      flood: 1500,
      namedStorm: "2% of dwelling ($3,000)"
    },
    exclusions: [
      "Damage to common areas",
      "Flood",
      "Earthquake",
      "Power failure",
      "Neglect",
      "War",
      "Nuclear hazard",
      "Intentional loss"
    ],
    endorsements: [
      "Loss Assessment Coverage - $50,000",
      "Unit Improvements and Betterments - $25,000",
      "Water Backup - $10,000",
      "Jewelry and Watches - $5,000",
      "Electronics Coverage Enhancement - $5,000"
    ],
    appraisalLanguage: "If you and we do not agree on the amount of loss, either party may request an appraisal. Within 30 days of the request, each party must select an appraiser. The appraisers will determine the loss amount.",
    managedRepair: {
      required: false,
      optOut: true,
      preferredVendors: ["Allstate Contractor Network", "Alacrity Services"]
    },
    premiumReductions: [
      "Protective Device Credit - Smoke alarms, deadbolts",
      "Mature Homeowner Discount",
      "Multi-Policy Discount"
    ],
    claimSpecificLanguage: {
      waterDamage: "Covers sudden and accidental water discharge from plumbing within the unit. Does not cover water from outside the unit or from common areas unless unit owner is liable.",
      windDamage: "Covers wind damage to the interior of the unit if exterior opening made by wind.",
      mold: "Limited to $5,000 for mold remediation if caused by covered peril."
    },
    moldLimits: {
      coverage: 5000,
      remediationLimit: 5000
    },
    emergencyServices: {
      limit: 2500,
      timeRestriction: "Immediate action required"
    },
    mortgageInfo: {
      mortgagee: "Chase Manhattan Mortgage Corporation",
      loanNumber: "9876543210"
    },
    additionalCoverages: {
      codeUpgrade: 10000,
      debrisRemoval: 2500,
      treesAndShrubs: 0,
      fireDepService: 1000
    }
  }
};

export function generatePolicyAnalysis(policyData: PolicyData): string {
  const analysis = `# COMPREHENSIVE POLICY ANALYSIS REPORT
## ${policyData.insuredName} - Policy #${policyData.policyNumber}

---

## EXECUTIVE SUMMARY

**Carrier:** ${policyData.carrier}
**Policy Type:** ${policyData.policyType}
**Primary Location:** ${policyData.insuredLocation.primary}
**Total Dwelling Coverage:** $${policyData.policyLimits.dwelling.toLocaleString()}

### KEY FINDINGS
- **Extended Replacement Cost:** Available up to 125% of dwelling limit
- **ATTENTION - Hurricane Deductible:** ${policyData.deductibles.hurricane}
- **Additional Living Expenses:** $${policyData.policyLimits.lossOfUse.toLocaleString()} available
- **Code Upgrade Coverage:** $${policyData.additionalCoverages.codeUpgrade.toLocaleString()}

---

## 1. POLICY EFFECTIVE DATES
- **Coverage Period:** ${policyData.effectiveDates.start} to ${policyData.effectiveDates.end}
- **Status:** Active and in force
- **Renewal:** Annual renewal with 30-day notice required
- **Cancellation:** 20-day notice required for non-payment, 45 days for other reasons

## 2. POLICYHOLDER IDENTIFICATION
- **Named Insured:** ${policyData.insuredName}
- **Additional Insureds:** Spouse and resident relatives
- **Coverage Recipients:** Named insured and residents of household
- **Mortgagee:** ${policyData.mortgageInfo.mortgagee}
- **Loan Number:** ${policyData.mortgageInfo.loanNumber}

## 3. INSURED LOCATION
- **Primary Location:** ${policyData.insuredLocation.primary}
${policyData.insuredLocation.additional.map(loc => `- **Additional:** ${loc}`).join('\n')}
- **Coverage Territory:** Worldwide for personal property
- **Off-Premises Coverage:** 10% of personal property limit

## 4. POLICY LIMITS

| Coverage Type | Limit | Notes |
|--------------|-------|-------|
| **Dwelling (Coverage A)** | $${policyData.policyLimits.dwelling.toLocaleString()} | Main structure |
| **Other Structures (Coverage B)** | $${policyData.policyLimits.otherStructures.toLocaleString()} | 10% of dwelling |
| **Personal Property (Coverage C)** | $${policyData.policyLimits.personalProperty.toLocaleString()} | 75% of dwelling |
| **Loss of Use (Coverage D)** | $${policyData.policyLimits.lossOfUse.toLocaleString()} | 30% of dwelling |
| **Liability (Coverage E)** | $${policyData.policyLimits.liability.toLocaleString()} | Per occurrence |
| **Medical Payments (Coverage F)** | $${policyData.policyLimits.medicalPayments.toLocaleString()} | Per person |

### IMPORTANT SUBLIMITS
- Jewelry, Watches, Furs: $2,500 (can be increased by endorsement)
- Cash and Securities: $200
- Firearms: $2,500
- Silverware and Goldware: $2,500
- Electronics: $5,000
- Business Property: $2,500

## 5. DEDUCTIBLES

| Peril | Deductible | Application |
|-------|-----------|-------------|
| **All Other Perils** | $${policyData.deductibles.allOtherPerils.toLocaleString()} | Standard deductible |
| **Hurricane** | ${policyData.deductibles.hurricane} | Named storms |
| **Flood** | $${policyData.deductibles.flood.toLocaleString()} | If flood coverage added |
| **Named Storm** | ${policyData.deductibles.namedStorm} | Tropical storms/hurricanes |

## 6. EXCLUSIONS

The following perils are EXCLUDED from coverage:
${policyData.exclusions.map(exc => `- ${exc}`).join('\n')}

## 7. ENDORSEMENTS

The following endorsements ENHANCE your coverage:
${policyData.endorsements.map(end => `- **${end}**`).join('\n')}

## 8. APPRAISAL PROVISION

${policyData.appraisalLanguage}

**Key Points:**
- Either party may invoke appraisal for disputes on loss amount
- 20-day deadline to select appraisers after demand
- Appraisal is binding on the amount of loss only
- Coverage disputes not subject to appraisal

## 9. MANAGED REPAIR PROGRAM

- **Program Required:** ${policyData.managedRepair.required ? 'YES' : 'NO'}
- **Opt-Out Available:** ${policyData.managedRepair.optOut ? 'YES' : 'NO'}
- **Preferred Vendors:** ${policyData.managedRepair.preferredVendors.join(', ')}
- **Warranty:** 5-year warranty on workmanship if using MRP

## 10. PREMIUM CREDITS & REDUCTIONS

Active premium reductions:
${policyData.premiumReductions.map(red => `- ${red}`).join('\n')}

## 11. WATER DAMAGE COVERAGE

${policyData.claimSpecificLanguage.waterDamage}

**Coverage Includes:**
- Sudden pipe bursts
- Appliance overflow
- HVAC system leaks
- Water heater rupture

**Coverage Excludes:**
- Gradual leaks over 14+ days
- Flood water
- Groundwater seepage
- Surface water

## 12. WIND/HURRICANE COVERAGE

${policyData.claimSpecificLanguage.windDamage}

**Important:** Hurricane deductible applies to all claims during named storm events.

## 13. MOLD COVERAGE

${policyData.claimSpecificLanguage.mold}

- **Coverage Limit:** $${policyData.moldLimits.coverage.toLocaleString()}
- **Remediation Limit:** $${policyData.moldLimits.remediationLimit.toLocaleString()}

## 14. EMERGENCY MITIGATION SERVICES

- **Coverage Limit:** $${policyData.emergencyServices.limit.toLocaleString()}
- **Time Restriction:** ${policyData.emergencyServices.timeRestriction}
- **Covered Services:** Water extraction, board-up, tarping, emergency repairs

## 15. ADDITIONAL COVERAGES

| Coverage | Limit | Purpose |
|----------|-------|---------|
| **Code Upgrade** | $${policyData.additionalCoverages.codeUpgrade.toLocaleString()} | Building code compliance |
| **Debris Removal** | $${policyData.additionalCoverages.debrisRemoval.toLocaleString()} | Clean-up costs |
| **Trees & Shrubs** | $${policyData.additionalCoverages.treesAndShrubs.toLocaleString()} | Landscape damage |
| **Fire Dept Service** | $${policyData.additionalCoverages.fireDepService.toLocaleString()} | Fire department charges |

---

## SETTLEMENT MAXIMIZATION OPPORTUNITIES

### HIGH-PRIORITY OPPORTUNITIES

1. **Extended Replacement Cost**: Coverage available up to 125% of dwelling limit ($${(policyData.policyLimits.dwelling * 1.25).toLocaleString()})
2. **Code Upgrade Coverage**: $${policyData.additionalCoverages.codeUpgrade.toLocaleString()} for building code compliance
3. **Additional Living Expenses**: $${policyData.policyLimits.lossOfUse.toLocaleString()} for temporary housing
4. **Water Backup Coverage**: Check endorsement limits
5. **Scheduled Personal Property**: Review for high-value items

### DOCUMENTATION REQUIREMENTS

For maximum recovery, ensure you have:
- [ ] Pre-loss photos/videos of property
- [ ] Receipts for personal property
- [ ] Contractor estimates from 3+ sources
- [ ] Engineering report if structural damage
- [ ] Moisture readings for water damage
- [ ] Mold testing if applicable
- [ ] Temporary living expense receipts
- [ ] Proof of loss form (deadline: 60 days)

### CRITICAL DEADLINES

- **Notice of Loss:** Immediate
- **Emergency Mitigation:** Within ${policyData.emergencyServices.timeRestriction}
- **Proof of Loss:** 60 days from date of loss
- **Suit Against Insurer:** 5 years (Florida statute)
- **Appraisal Demand:** No specific deadline but should be timely

---

## RECOMMENDATIONS

1. **Document Everything:** Take extensive photos/videos before any cleanup
2. **Mitigate Damages:** Take reasonable steps to prevent further damage
3. **Get Multiple Estimates:** Obtain 3+ detailed repair estimates
4. **Review Endorsements:** Maximize coverage through all endorsements
5. **Track ALE:** Keep all receipts for additional living expenses
6. **Consider Appraisal:** If settlement offer seems low, invoke appraisal rights

---

*This analysis generated by Stella Claims Intelligence System - ${new Date().toLocaleDateString()}*
*For: ${policyData.insuredName} | Policy: ${policyData.policyNumber}*`;

  return analysis;
}