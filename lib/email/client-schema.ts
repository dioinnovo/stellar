/**
 * Client Email Schema
 * 
 * Structured schema for consistent, enterprise-grade client email communications
 * Ensures uniform UI/UX and content quality regardless of lead complexity
 */

/**
 * Solution Vision Block - Maps challenges to compelling future states
 */
export interface SolutionVisionBlock {
  challengeKeyword: string;           // Original challenge identifier
  visionStatement: string;            // "Imagine..." or "Picture..." statement
  specificBenefit: string;            // Concrete improvement (e.g., "15 minutes instead of 3 hours")
  impactMetric: string;               // Quantified benefit (e.g., "80% time reduction")
  industryContext: string;            // Industry-specific language adaptation
  nextStepHook: string;              // Momentum builder for consultation
}

/**
 * Challenge categorization and solution mapping
 */
export interface Challenge {
  original: string;                   // Raw challenge text from conversation
  category: 'efficiency' | 'cost' | 'quality' | 'growth' | 'compliance' | 'scale';
  severity: 'critical' | 'high' | 'medium' | 'low';
  solution: SolutionVisionBlock;
  priority: number;                   // For ordering multiple challenges
}

/**
 * Timeline context for urgency and approach
 */
export interface TimelineContext {
  phase: 'exploring' | 'comparing' | 'deciding' | 'implementing';
  urgency: 'immediate' | 'this_month' | 'this_quarter' | 'this_year' | 'researching';
  decisionTimeframe: string;          // Human readable timeline
  businessDrivers: string[];          // What's driving the timeline
}

/**
 * Decision-making context
 */
export interface DecisionContext {
  stakeholders: string[];             // Other decision makers
  decisionProcess: string;            // How decisions are made
  currentEvaluation: string;          // What they're currently evaluating
  competitiveFactors: string[];       // What they're comparing against
}

/**
 * Success metrics and social proof
 */
export interface SuccessMetric {
  metric: string;                     // "80% time reduction"
  context: string;                    // "in document processing"
  industryRelevance: number;          // 1-10 relevance score
}

/**
 * Industry-specific social proof
 */
export interface IndustryProof {
  industry: string;
  clientExample: string;              // "Education companies like yours"
  achievement: string;                // "reduced processing time by 70%"
  timeframe: string;                  // "within 6 weeks"
  credibilityFactor: string;          // "500+ employee organization"
}

/**
 * Main Client Email Schema
 */
export interface ClientEmailSchema {
  // Brand & Visual Identity
  branding: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    logoUrl: string;
    brandName: string;
    tagline: string;
  };
  
  // Email Layout Structure
  layout: {
    template: 'welcome' | 'consultation' | 'nurture' | 'followup' | 'executive';
    headerStyle: 'gradient' | 'solid' | 'minimal';
    contentSections: Array<'greeting' | 'vision' | 'social_proof' | 'next_steps' | 'resources'>;
    ctaStyle: 'primary' | 'secondary' | 'minimal';
    mobilePriority: boolean;            // Optimize for mobile-first
  };
  
  // Personalization Data
  personalization: {
    recipientName: string;
    companyName: string;
    industry: string;
    companySize: string;
    role: string;
    challenges: Challenge[];
    timeline: TimelineContext;
    decisionContext: DecisionContext;
    conversationContext: {
      keyPoints: string[];              // Important conversation highlights
      nextSteps: string[];              // What was promised/discussed
      followUpReason: string;           // Why we're following up
    };
  };
  
  // Solution Vision Content
  solutionVision: {
    primarySolution: SolutionVisionBlock;
    secondarySolutions: SolutionVisionBlock[];
    successMetrics: SuccessMetric[];
    socialProof: IndustryProof;
    demoOffer: {
      enabled: boolean;
      timeframe: string;                // "within 4 weeks"
      deliverable: string;              // "working prototype"
      value: string;                    // "tailored to your workflows"
    };
  };
  
  // Communication Approach
  tone: {
    formality: 'professional' | 'friendly' | 'executive' | 'consultative';
    urgency: 'immediate' | 'priority' | 'standard' | 'exploratory';
    confidence: 'high' | 'moderate' | 'collaborative';
    relationship: 'new' | 'engaged' | 'returning';
  };
  
  // Email Configuration
  emailConfig: {
    subject: string;
    preheader: string;
    fromName: string;
    replyTo: string;
    trackingEnabled: boolean;
    deliverabilityScore: number;
  };
  
  // Quality Assurance
  validation: {
    allFieldsPopulated: boolean;
    contentQuality: 'high' | 'medium' | 'low';
    personalizationScore: number;      // 1-10 based on data richness
    industryRelevance: number;         // 1-10 industry-specific content
    actionabilityScore: number;        // 1-10 clear next steps
  };
}

/**
 * Industry-specific customization rules
 */
export interface IndustryCustomization {
  industry: string;
  languagePatterns: {
    formalTerms: string[];             // Industry-specific terminology
    painPointLanguage: string[];       // How they describe problems
    solutionLanguage: string[];        // How they describe solutions
    successMetrics: string[];          // What they measure
  };
  commonChallenges: {
    challenge: string;
    frequency: number;                 // How often this appears
    urgency: 'critical' | 'high' | 'medium';
    solution: SolutionVisionBlock;
  }[];
  regulatoryFactors: string[];         // Compliance considerations
  competitiveLandscape: string[];      // Who they typically evaluate
  decisionPatterns: {
    timeframe: string;                 // Typical decision timeline
    stakeholders: string[];            // Common decision makers
    evaluationCriteria: string[];      // What they care about most
  };
}

/**
 * Content generation context
 */
export interface ContentGenerationContext {
  customerData: ClientEmailSchema['personalization'];
  industryRules: IndustryCustomization;
  templateType: ClientEmailSchema['layout']['template'];
  urgencyLevel: ClientEmailSchema['tone']['urgency'];
}

/**
 * Helper function to create default client email schema
 */
export function createDefaultClientEmailSchema(): ClientEmailSchema {
  return {
    branding: {
      primaryColor: '#667eea',
      secondaryColor: '#764ba2',
      accentColor: '#00C851',
      logoUrl: 'https://innovoco.com/logo.png',
      brandName: 'Innovoco',
      tagline: 'AI & Automation Excellence',
    },
    layout: {
      template: 'consultation',
      headerStyle: 'gradient',
      contentSections: ['greeting', 'vision', 'social_proof', 'next_steps'],
      ctaStyle: 'primary',
      mobilePriority: true,
    },
    personalization: {
      recipientName: 'Valued Client',
      companyName: 'Your Organization',
      industry: 'Business',
      companySize: 'Growing Company',
      role: 'Decision Maker',
      challenges: [],
      timeline: {
        phase: 'exploring',
        urgency: 'researching',
        decisionTimeframe: 'evaluating options',
        businessDrivers: ['operational efficiency'],
      },
      decisionContext: {
        stakeholders: ['leadership team'],
        decisionProcess: 'collaborative evaluation',
        currentEvaluation: 'exploring solutions',
        competitiveFactors: ['multiple options'],
      },
      conversationContext: {
        keyPoints: ['expressed interest in automation'],
        nextSteps: ['schedule consultation'],
        followUpReason: 'continue our discussion',
      },
    },
    solutionVision: {
      primarySolution: {
        challengeKeyword: 'efficiency',
        visionStatement: 'Imagine streamlined operations that free up your team for strategic work',
        specificBenefit: 'Focus on growth instead of repetitive tasks',
        impactMetric: 'Typical 40% efficiency improvement',
        industryContext: 'business operations',
        nextStepHook: 'Let\'s explore how this applies to your specific situation',
      },
      secondarySolutions: [],
      successMetrics: [
        {
          metric: '40% efficiency increase',
          context: 'in business processes',
          industryRelevance: 8,
        },
      ],
      socialProof: {
        industry: 'Business',
        clientExample: 'Companies like yours',
        achievement: 'streamlined their operations',
        timeframe: 'within weeks',
        credibilityFactor: 'across various industries',
      },
      demoOffer: {
        enabled: true,
        timeframe: 'within 4 weeks',
        deliverable: 'working prototype',
        value: 'tailored to your needs',
      },
    },
    tone: {
      formality: 'professional',
      urgency: 'standard',
      confidence: 'collaborative',
      relationship: 'new',
    },
    emailConfig: {
      subject: 'Thank you for connecting with us',
      preheader: 'Next steps for your AI & automation journey',
      fromName: 'Innovoco AI',
      replyTo: 'hello@innovoco.com',
      trackingEnabled: true,
      deliverabilityScore: 8,
    },
    validation: {
      allFieldsPopulated: false,
      contentQuality: 'medium',
      personalizationScore: 5,
      industryRelevance: 5,
      actionabilityScore: 7,
    },
  };
}

/**
 * Validation helper to ensure email quality
 */
export function validateClientEmailSchema(schema: ClientEmailSchema): {
  isValid: boolean;
  issues: string[];
  qualityScore: number;
} {
  const issues: string[] = [];
  let qualityScore = 0;
  
  // Required field validation
  if (!schema.personalization.recipientName || schema.personalization.recipientName === 'Valued Client') {
    issues.push('Missing personalized recipient name');
  } else {
    qualityScore += 15;
  }
  
  if (!schema.personalization.companyName || schema.personalization.companyName === 'Your Organization') {
    issues.push('Missing company name');
  } else {
    qualityScore += 15;
  }
  
  if (schema.personalization.challenges.length === 0) {
    issues.push('No challenges identified - content will be generic');
  } else {
    qualityScore += 20;
  }
  
  if (schema.solutionVision.primarySolution.challengeKeyword === 'efficiency') {
    issues.push('Using default solution vision - not personalized');
  } else {
    qualityScore += 25;
  }
  
  if (schema.solutionVision.socialProof.industry === 'Business') {
    issues.push('Generic industry social proof - not targeted');
  } else {
    qualityScore += 15;
  }
  
  // Content quality checks
  if (schema.personalization.conversationContext.keyPoints.length === 0) {
    issues.push('Missing conversation context');
  } else {
    qualityScore += 10;
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    qualityScore: Math.min(qualityScore, 100),
  };
}