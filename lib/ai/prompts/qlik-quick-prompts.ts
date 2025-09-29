/**
 * Qlik Quick Answers - Comprehensive Prompt Templates
 * These templates ensure maximum information retrieval per API call
 * Each template includes all critical policy information points
 */

export interface QlikPromptTemplate {
  id: string;
  label: string;
  requiresContext: boolean;
  template: string;
}

/**
 * Comprehensive prompt templates for Qlik Quick Answers
 * These are expanded versions of the quick questions that extract maximum information
 */
export const QLIK_PROMPT_TEMPLATES: Record<string, QlikPromptTemplate> = {
  'comprehensive-review': {
    id: 'comprehensive-review',
    label: 'Perform comprehensive policy review',
    requiresContext: true,
    template: `For the insurance policy of {INSURED_NAME}, provide a comprehensive review including ALL of the following information. If any item is not found, explicitly state "Not found in policy documents" for that item:

POLICY IDENTIFICATION:
• Policy number and carrier name
• Policy type (HO3, HO5, DP3, Commercial, etc.)
• Policy effective dates (start and end)
• Current policy status
• Names of ALL policyholders
• Insured location(s) with complete addresses
• Mortgage company information if listed

COVERAGE LIMITS:
• Coverage A (Dwelling) limit
• Coverage B (Other Structures) limit and percentage
• Coverage C (Personal Property) limit and percentage
• Coverage D (Loss of Use) limit and percentage
• Coverage E (Personal Liability) limit
• Coverage F (Medical Payments) limit
• Any additional coverages with specific limits

DEDUCTIBLES:
• All Other Perils (AOP) deductible
• Hurricane/Wind deductible (amount or percentage)
• Named Storm deductible if different
• Flood deductible if covered
• Any special deductibles for specific perils

EXCLUSIONS AND ENDORSEMENTS:
• List ALL policy exclusions
• List ALL endorsements with form numbers
• Any buy-back coverages purchased
• Modified coverage forms
• Special provisions or manuscripted endorsements

APPRAISAL AND CLAIM PROVISIONS:
• Complete appraisal language and procedures
• Time limits for invoking appraisal
• Appraisal cost allocation provisions
• Managed Repair Program (MRP) requirements if any
• Preferred vendor requirements
• Direct repair program provisions
• Time limits for filing claims and suits

WATER AND MOLD COVERAGE:
• Water damage coverage specifics
• Types of water damage covered/excluded
• Mold remediation limits
• Mold coverage waiting periods
• Emergency mitigation service (EMS) limits
• Dry-out service limitations

WIND AND STORM COVERAGE:
• Wind coverage status (included/excluded)
• Hurricane coverage specifics
• Hail coverage provisions
• Wind-driven rain requirements
• Opening protection requirements

ADDITIONAL LIVING EXPENSES:
• ALE/Loss of Use limits
• Time limitations for ALE
• Coverage triggers for ALE
• Prohibited use provisions

SPECIAL LIMITS:
• Jewelry and watches
• Cash and securities
• Firearms
• Electronics and computers
• Business property
• Any other sub-limits

PREMIUM AND DISCOUNTS:
• Annual premium amount
• Premium payment schedule
• Any premium credits or discounts applied
• Wind mitigation credits if applicable
• Security system discounts

COMPLIANCE AND REQUIREMENTS:
• State-specific compliance items
• Building code upgrade coverage
• Ordinance or law coverage
• Any non-standard provisions
• Coinsurance requirements if applicable`
  },

  'coverage-analysis': {
    id: 'coverage-analysis',
    label: 'Analyze coverage limits and deductibles',
    requiresContext: true,
    template: `For the insurance policy of {INSURED_NAME}, provide a detailed analysis of ALL coverage limits and deductibles. Include the following:

MAIN COVERAGE LIMITS:
• Coverage A (Dwelling): $[amount]
• Coverage B (Other Structures): $[amount] or [%] of Coverage A
• Coverage C (Personal Property): $[amount] or [%] of Coverage A
• Coverage D (Loss of Use): $[amount] or [%] of Coverage A
• Coverage E (Personal Liability): $[amount]
• Coverage F (Medical Payments): $[amount]

ADDITIONAL COVERAGE LIMITS:
• Debris removal: $[amount] or coverage details
• Reasonable repairs: $[amount] or coverage details
• Trees, shrubs, plants: $[amount] per item, total limit
• Fire department service charge: $[amount]
• Property removed: coverage period and details
• Credit card/forgery: $[amount]
• Loss assessment: $[amount]
• Collapse coverage: details
• Glass breakage: coverage details

ALL DEDUCTIBLES:
• Standard/All Other Perils: $[amount]
• Hurricane: $[amount] or [%] of Coverage A
• Wind/Hail: $[amount] or [%] if different from hurricane
• Named Storm: $[amount] or [%] if applicable
• Flood: $[amount] if covered
• Earthquake: $[amount] if covered
• Special deductibles for specific items

DEDUCTIBLE APPLICATION:
• How deductibles apply (per occurrence, per season, etc.)
• Calendar year maximum if applicable
• Waiver provisions if any

COVERAGE PERCENTAGE CALCULATIONS:
• Show actual dollar amounts for percentage-based coverages
• Explain any coverage that can be increased or decreased
• Note any coverage that requires separate purchase

Indicate "Not found" for any information not available in the policy documents.`
  },

  'exclusions-endorsements': {
    id: 'exclusions-endorsements',
    label: 'Review exclusions and endorsements',
    requiresContext: true,
    template: `For the insurance policy of {INSURED_NAME}, provide a comprehensive list of ALL exclusions and endorsements:

STANDARD EXCLUSIONS:
List each exclusion with:
• Exclusion name/type
• Brief description of what is excluded
• Any exceptions to the exclusion
• Page/section reference if available

Common exclusions to check:
• Earth movement/earthquake
• Flood and surface water
• Water damage specifics
• Power failure
• Neglect and maintenance
• War and nuclear
• Intentional loss
• Business/professional use
• Motor vehicles
• Aircraft
• Watercraft limitations
• Vandalism/malicious mischief conditions
• Theft limitations
• Collapse limitations
• Pollution
• Settling and cracking
• Animals, birds, vermin
• Mechanical breakdown
• Wear and tear

ENDORSEMENTS:
List each endorsement with:
• Endorsement form number
• Endorsement title
• What it adds, removes, or modifies
• Any additional premium charged

Types to identify:
• Coverage increasing endorsements
• Coverage restricting endorsements
• Buy-back endorsements
• State-specific endorsements
• Manuscripted/custom endorsements
• Wind mitigation endorsements
• Water damage endorsements
• Equipment breakdown endorsements

MODIFIED COVERAGE:
• Any coverage that differs from standard forms
• Special limitations added
• Coverage grants beyond standard
• Unique provisions for this policy

For each item, indicate if it HELPS or LIMITS the policyholder's coverage.`
  },

  'claim-provisions': {
    id: 'claim-provisions',
    label: 'Check claim-specific provisions',
    requiresContext: true,
    template: `For the insurance policy of {INSURED_NAME}, extract ALL claim-related provisions and requirements:

CLAIMS REPORTING:
• Time limit to report a claim
• Required method of notification
• Who must be notified
• Emergency measures allowed before reporting
• Penalties for late reporting

POLICYHOLDER DUTIES AFTER LOSS:
List each duty with specific requirements:
• Protect property from further damage
• Make reasonable repairs
• Keep records of expenses
• Prepare inventory of damaged property
• Show damaged property
• Provide records and documents
• Submit to examination under oath
• Cooperate with investigation
• Send proof of loss requirements
• Notify police/authorities requirements

PROOF OF LOSS:
• Time limit to submit (days)
• What must be included
• Sworn proof requirements
• Supporting documentation needed
• Consequences of not submitting

APPRAISAL PROVISIONS:
• Complete appraisal clause text
• How to invoke appraisal
• Time limits for demanding appraisal
• Appraiser selection process
• Umpire selection process
• Cost allocation between parties
• Binding nature of appraisal
• What can/cannot be appraised

SETTLEMENT PROVISIONS:
• Time limit for insurer to acknowledge
• Time limit for insurer to pay after agreement
• Time limit for insurer to pay after appraisal
• Replacement cost conditions
• Actual cash value situations
• Partial payment provisions
• Advance payment conditions

SUIT AGAINST INSURER:
• Time limit to file suit
• Required conditions before suit
• Venue requirements
• Applicable law provisions

MANAGED REPAIR PROGRAM:
• Is MRP mentioned? (Yes/No)
• Voluntary or mandatory?
• Opt-out provisions
• Preferred vendor requirements
• Guarantees/warranties offered
• Your rights if using MRP

SPECIAL CLAIM PROVISIONS:
• Hurricane deductible application
• CAT fund assessment notice
• Public adjuster regulations mentioned
• Assignment of benefits restrictions
• Any unique claim requirements

For each provision, note the SPECIFIC TIME LIMITS and whether they favor the insured or insurer.`
  },

  'water-wind-coverage': {
    id: 'water-wind-coverage',
    label: 'Analyze water, wind, and mold coverage',
    requiresContext: true,
    template: `For the insurance policy of {INSURED_NAME}, provide detailed analysis of water, wind, and mold-related coverages:

WATER DAMAGE COVERAGE:
Types of water damage COVERED:
• Sudden and accidental discharge from plumbing
• Water heater rupture
• HVAC overflow
• Appliance leaks
• Frozen pipe bursts
• Fire suppression system discharge
• Other covered water sources

Types of water damage EXCLUDED:
• Flood (surface water, waves, tidal water)
• Storm surge
• Groundwater/seepage
• Sewer backup (unless endorsed)
• Sump pump failure (unless endorsed)
• Gradual leaks
• Maintenance-related water damage
• Other excluded water sources

WIND COVERAGE:
• Is windstorm covered? (Yes/No/Excluded)
• Hurricane coverage status
• Named storm coverage
• Tornado coverage
• Hail coverage status
• Wind-driven rain requirements:
  - Must wind create opening first?
  - Time limits for damage to occur
  - Interior damage limitations

WIND EXCLUSIONS/LIMITATIONS:
• Cosmetic damage exclusions
• Roof surfacing limitations
• Screened enclosure limitations
• Fence and outdoor property limits
• Tree and shrub damage limits

MOLD COVERAGE:
• Is mold covered? (Yes/No/Limited)
• Mold remediation limit: $[amount]
• What triggers mold coverage
• Waiting periods or time limits
• Exclusions for pre-existing mold
• Prevention requirements

WATER MITIGATION:
• Emergency mitigation limits
• Reasonable repair provisions
• Dry-out service coverage
• Time limits for mitigation
• Documentation requirements
• Preferred vendor requirements

DEDUCTIBLES:
• Water damage deductible
• Wind/hurricane deductible
• How deductibles interact
• Special sub-deductibles

IMPORTANT LIMITATIONS:
• Continuous seepage exclusion details
• Repeated seepage provisions
• Hidden water damage coverage
• Ensuing loss provisions
• Anti-concurrent causation language

For each coverage type, indicate whether it is FAVORABLE, STANDARD, or RESTRICTIVE compared to typical policies.`
  },

  'compliance-check': {
    id: 'compliance-check',
    label: 'Verify compliance requirements',
    requiresContext: true,
    template: `For the insurance policy of {INSURED_NAME}, verify all compliance and regulatory requirements:

STATE COMPLIANCE:
• State of policy issuance
• Compliance with state minimum requirements
• Required notices present (Yes/No for each):
  - Hurricane deductible notice
  - Flood exclusion notice
  - Sinkhole coverage notice
  - Citizens depopulation notice
  - Non-renewal notice requirements
  - Other state-required notices

PUBLIC ADJUSTER PROVISIONS:
• Public adjuster acknowledgment
• PA fee limitations mentioned
• PA contract requirements referenced
• Time limits for PA involvement
• Anti-fraud provisions

BUILDING CODE COMPLIANCE:
• Ordinance or Law coverage included?
• Coverage amount: $[amount] or [%]
• What it covers:
  - Loss to undamaged portion
  - Demolition costs
  - Increased construction costs
• Limitations or exclusions

MORTGAGE REQUIREMENTS:
• Mortgagee listed correctly
• Mortgagee protection provisions
• Notice requirements to mortgagee
• Payment provisions involving mortgagee
• Mortgagee rights after denial

REGULATORY NOTICES:
• Citizens Property Insurance notices
• CAT Fund assessment notice
• Market Assistance Plan references
• Surplus lines notice if applicable
• Mediation program notice
• Any missing required notices

ASSIGNMENT PROVISIONS:
• Assignment of Benefits (AOB) allowed?
• AOB restrictions or requirements
• Notice requirements for AOB
• Insurer consent requirements

STATUTORY REQUIREMENTS:
• Valued Policy Law compliance
• Replacement cost requirements met
• Time payment of claims compliance
• Bad faith remedies referenced
• Examination under oath limits

FORM COMPLIANCE:
• Are all forms listed approved forms?
• Any manuscripted changes noted?
• Edition dates of all forms
• Any non-standard forms used

PREMIUM COMPLIANCE:
• Premium payment grace period
• Cancellation notice requirements
• Non-renewal notice timing
• Premium refund calculations

RED FLAGS FOR NON-COMPLIANCE:
List any provisions that may violate:
• State insurance regulations
• Unfair claims practices acts
• Consumer protection laws
• Public adjuster regulations

For each item, indicate COMPLIANT, NON-COMPLIANT, or NEEDS REVIEW.`
  }
};

/**
 * Quick context questions for gathering insured information
 */
export const CONTEXT_GATHERING_PROMPTS = {
  initial: "I'll help you analyze the policy comprehensively. First, please tell me the name of the insured person or property you'd like information about. For example: 'John Smith' or '123 Main Street'.",

  confirmation: "Thank you. I'll analyze the policy for {INSURED_NAME}. Please select what information you'd like to review:",

  notFound: "I couldn't find a policy for {INSURED_NAME} in my knowledge base. Please verify the name or address and try again. You can also try variations like 'Smith, John' or just the last name.",

  multipleFound: "I found multiple policies that might match. Please be more specific with the full name or complete address."
};

/**
 * Helper function to expand a quick question into a comprehensive prompt
 */
export function expandQuickQuestion(
  questionId: string,
  insuredName: string
): string {
  const template = QLIK_PROMPT_TEMPLATES[questionId];
  if (!template) {
    return questionId; // Return original if no template found
  }

  return template.template.replace(/{INSURED_NAME}/g, insuredName);
}

/**
 * Check if a message is a quick question that needs expansion
 */
export function isQuickQuestion(message: string): string | null {
  // Check if the message matches any quick question label
  for (const [id, template] of Object.entries(QLIK_PROMPT_TEMPLATES)) {
    if (message.toLowerCase() === template.label.toLowerCase()) {
      return id;
    }
  }
  return null;
}

/**
 * Get all quick question suggestions for display
 */
export function getQuickQuestionSuggestions(): string[] {
  return Object.values(QLIK_PROMPT_TEMPLATES).map(t => t.label);
}