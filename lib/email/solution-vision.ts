/**
 * Solution Vision Mapping Engine
 * 
 * Intelligently maps customer challenges to compelling solution visions
 * Creates momentum by showing the transformed future state, not just listing problems
 */

import { Challenge, SolutionVisionBlock, IndustryCustomization, SuccessMetric } from './client-schema';

/**
 * Challenge pattern matching and solution mapping
 */
interface ChallengePattern {
  keywords: string[];                    // Keywords that identify this challenge
  category: Challenge['category'];       // Challenge category
  severity: Challenge['severity'];       // Default severity level
  commonPhrases: string[];              // Common ways this is expressed
  solutionTemplate: SolutionVisionBlock; // Template for solution vision
}

/**
 * Industry-specific challenge patterns and solutions
 */
const CHALLENGE_PATTERNS: ChallengePattern[] = [
  // Manual Process Challenges
  {
    keywords: ['manual', 'manually', 'by hand', 'repetitive', 'tedious'],
    category: 'efficiency',
    severity: 'high',
    commonPhrases: [
      'manual processes',
      'doing everything by hand',
      'repetitive tasks',
      'manual data entry',
      'manual workflow'
    ],
    solutionTemplate: {
      challengeKeyword: 'manual processes',
      visionStatement: 'Your team focused on strategic initiatives while AI handles routine tasks, freeing up 15-20 hours weekly for high-value work',
      specificBenefit: 'What takes 3 hours manually completes in 15 minutes automatically',
      impactMetric: '80% reduction in processing time',
      industryContext: 'operational workflows',
      nextStepHook: 'Let\'s explore exactly which processes we can automate for maximum impact'
    }
  },
  
  // Time and Efficiency Challenges
  {
    keywords: ['time', 'slow', 'delay', 'bottleneck', 'waste'],
    category: 'efficiency',
    severity: 'high',
    commonPhrases: [
      'waste of time',
      'taking too long',
      'slow processes',
      'bottlenecks',
      'delayed response'
    ],
    solutionTemplate: {
      challengeKeyword: 'time waste',
      visionStatement: 'Reclaim 15-20 hours per week currently lost to inefficient processes, redirecting that time to revenue-generating activities',
      specificBenefit: 'Tasks that take half a day now complete in minutes',
      impactMetric: '70% faster completion times',
      industryContext: 'business operations',
      nextStepHook: 'We can show you exactly where these time savings come from in your specific workflows'
    }
  },
  
  // Data and Documentation Challenges
  {
    keywords: ['data', 'document', 'report', 'analysis', 'review'],
    category: 'quality',
    severity: 'medium',
    commonPhrases: [
      'data analysis',
      'document review',
      'report generation',
      'data processing',
      'documentation'
    ],
    solutionTemplate: {
      challengeKeyword: 'document processing',
      visionStatement: 'Intelligent document processing delivering key insights and automated reporting with 95% accuracy and 90% time reduction',
      specificBenefit: 'Complex document analysis that used to take days happens in real-time',
      impactMetric: '95% accuracy with 90% time savings',
      industryContext: 'information processing',
      nextStepHook: 'Let\'s discuss how this applies to your specific document workflows'
    }
  },
  
  // Cost and Resource Challenges
  {
    keywords: ['cost', 'expensive', 'budget', 'resource', 'overhead'],
    category: 'cost',
    severity: 'high',
    commonPhrases: [
      'high costs',
      'expensive processes',
      'resource intensive',
      'overhead costs',
      'budget constraints'
    ],
    solutionTemplate: {
      challengeKeyword: 'operational costs',
      visionStatement: 'Picture reducing operational costs by 30-40% while actually improving service quality and speed',
      specificBenefit: 'Lower costs with better outcomes, not compromise',
      impactMetric: '35% reduction in operational expenses',
      industryContext: 'cost optimization',
      nextStepHook: 'We can model the exact cost savings potential for your organization'
    }
  },
  
  // Quality and Accuracy Challenges
  {
    keywords: ['error', 'mistake', 'accuracy', 'quality', 'inconsistent'],
    category: 'quality',
    severity: 'high',
    commonPhrases: [
      'human error',
      'quality issues',
      'inconsistent results',
      'accuracy problems',
      'mistakes'
    ],
    solutionTemplate: {
      challengeKeyword: 'quality consistency',
      visionStatement: 'Imagine perfect consistency and accuracy in every process, eliminating the costly errors that hurt your reputation',
      specificBenefit: 'Zero human error in routine processes with complete audit trails',
      impactMetric: '99.9% accuracy improvement',
      industryContext: 'quality assurance',
      nextStepHook: 'Let\'s identify where consistency matters most in your operations'
    }
  },
  
  // Growth and Scaling Challenges
  {
    keywords: ['scale', 'growth', 'capacity', 'volume', 'expansion'],
    category: 'growth',
    severity: 'medium',
    commonPhrases: [
      'scaling challenges',
      'growth bottlenecks',
      'capacity limits',
      'volume increases',
      'expansion needs'
    ],
    solutionTemplate: {
      challengeKeyword: 'scaling operations',
      visionStatement: 'Picture your operations seamlessly handling 3x the volume without adding proportional staff or complexity',
      specificBenefit: 'Scale your impact without scaling your headaches',
      impactMetric: '300% capacity increase with same team',
      industryContext: 'business growth',
      nextStepHook: 'Let\'s explore how automation prepares you for scalable growth'
    }
  },
  
  // Compliance and Regulatory Challenges
  {
    keywords: ['compliance', 'regulation', 'audit', 'governance', 'policy'],
    category: 'compliance',
    severity: 'critical',
    commonPhrases: [
      'compliance requirements',
      'regulatory challenges',
      'audit preparation',
      'governance issues',
      'policy enforcement'
    ],
    solutionTemplate: {
      challengeKeyword: 'compliance management',
      visionStatement: 'Envision automated compliance monitoring that ensures you never miss a requirement while reducing audit preparation from weeks to days',
      specificBenefit: 'Continuous compliance with automated documentation and alerts',
      impactMetric: '100% compliance tracking with 80% less effort',
      industryContext: 'regulatory compliance',
      nextStepHook: 'We can map your specific compliance requirements to automated solutions'
    }
  }
];

/**
 * Industry-specific customizations for solution visions
 */
const INDUSTRY_CUSTOMIZATIONS: Record<string, IndustryCustomization> = {
  'Education': {
    industry: 'Education',
    languagePatterns: {
      formalTerms: ['student outcomes', 'curriculum management', 'administrative efficiency', 'learning analytics'],
      painPointLanguage: ['administrative burden', 'manual grading', 'student tracking', 'report generation'],
      solutionLanguage: ['automated workflows', 'intelligent processing', 'streamlined operations', 'enhanced outcomes'],
      successMetrics: ['student engagement', 'administrative time saved', 'accuracy improvement', 'cost per student']
    },
    commonChallenges: [
      {
        challenge: 'document review process',
        frequency: 8,
        urgency: 'high',
        solution: {
          challengeKeyword: 'educational document processing',
          visionStatement: 'Picture automated document review that processes student submissions, compliance reports, and administrative paperwork with the precision of your best reviewer',
          specificBenefit: 'What takes your staff 3 hours of review completes in 15 minutes with higher accuracy',
          impactMetric: '85% time reduction in document processing',
          industryContext: 'educational administration',
          nextStepHook: 'Let\'s explore how this fits your specific document workflows and compliance requirements'
        }
      },
      {
        challenge: 'manual processes',
        frequency: 9,
        urgency: 'high',
        solution: {
          challengeKeyword: 'educational administration',
          visionStatement: 'Administrative staff focused on student outcomes while automated systems manage enrollment, scheduling, and reporting with zero manual intervention',
          specificBenefit: 'Administrative tasks that consume full days now complete automatically overnight',
          impactMetric: '70% reduction in administrative workload',
          industryContext: 'educational operations',
          nextStepHook: 'We can identify which administrative processes would benefit most from automation'
        }
      }
    ],
    regulatoryFactors: ['FERPA compliance', 'state reporting requirements', 'accreditation standards'],
    competitiveLandscape: ['other educational institutions', 'EdTech solutions', 'manual processes'],
    decisionPatterns: {
      timeframe: '3-6 months',
      stakeholders: ['administrators', 'IT directors', 'faculty leadership'],
      evaluationCriteria: ['student impact', 'cost savings', 'compliance', 'ease of implementation']
    }
  },
  
  'Legal': {
    industry: 'Legal',
    languagePatterns: {
      formalTerms: ['case management', 'document discovery', 'client communication', 'billing efficiency'],
      painPointLanguage: ['manual document review', 'time tracking', 'case preparation', 'client intake'],
      solutionLanguage: ['intelligent automation', 'streamlined workflows', 'enhanced accuracy', 'optimized processes'],
      successMetrics: ['billable hour efficiency', 'case preparation time', 'client satisfaction', 'error reduction']
    },
    commonChallenges: [
      {
        challenge: 'document review',
        frequency: 9,
        urgency: 'critical',
        solution: {
          challengeKeyword: 'legal document processing',
          visionStatement: 'AI-powered document review delivering senior associate-level analysis in 10% of the time with higher accuracy and consistency',
          specificBenefit: 'Document review that typically requires 40 hours completes in 4 hours with higher accuracy',
          impactMetric: '90% time reduction in document analysis',
          industryContext: 'legal practice management',
          nextStepHook: 'Let\'s discuss how this applies to your specific practice areas and document types'
        }
      }
    ],
    regulatoryFactors: ['attorney-client privilege', 'bar regulations', 'data security requirements'],
    competitiveLandscape: ['other law firms', 'legal tech solutions', 'manual processes'],
    decisionPatterns: {
      timeframe: '2-4 months',
      stakeholders: ['managing partners', 'practice group leaders', 'IT managers'],
      evaluationCriteria: ['ROI on billable hours', 'client service improvement', 'competitive advantage']
    }
  },
  
  'Healthcare': {
    industry: 'Healthcare',
    languagePatterns: {
      formalTerms: ['patient outcomes', 'clinical efficiency', 'regulatory compliance', 'care coordination'],
      painPointLanguage: ['administrative burden', 'documentation time', 'patient scheduling', 'data management'],
      solutionLanguage: ['intelligent automation', 'streamlined workflows', 'enhanced patient care', 'operational efficiency'],
      successMetrics: ['patient satisfaction', 'clinical time saved', 'documentation accuracy', 'compliance rates']
    },
    commonChallenges: [
      {
        challenge: 'documentation',
        frequency: 9,
        urgency: 'high',
        solution: {
          challengeKeyword: 'clinical documentation',
          visionStatement: 'Automated clinical documentation capturing patient interactions in real-time, returning 25% of clinician time to direct patient care',
          specificBenefit: 'Documentation that takes 30 minutes per patient completes in 5 minutes automatically',
          impactMetric: '80% reduction in documentation time',
          industryContext: 'healthcare operations',
          nextStepHook: 'Let\'s explore how this integrates with your existing clinical workflows and EHR systems'
        }
      }
    ],
    regulatoryFactors: ['HIPAA compliance', 'FDA regulations', 'CMS requirements'],
    competitiveLandscape: ['other healthcare providers', 'health tech solutions', 'manual processes'],
    decisionPatterns: {
      timeframe: '6-12 months',
      stakeholders: ['chief medical officers', 'administrators', 'IT directors', 'compliance officers'],
      evaluationCriteria: ['patient outcomes', 'clinician satisfaction', 'regulatory compliance', 'cost reduction']
    }
  }
};

/**
 * Maps raw challenges to structured solution visions
 */
export function mapChallengesToSolutions(
  rawChallenges: string[],
  industry: string,
  companySize: string,
  timeline: string
): Challenge[] {
  const mappedChallenges: Challenge[] = [];
  
  for (const rawChallenge of rawChallenges) {
    const challenge = createChallengeFromText(rawChallenge, industry, companySize, timeline);
    if (challenge) {
      mappedChallenges.push(challenge);
    }
  }
  
  // Sort by priority (severity + industry relevance)
  return mappedChallenges.sort((a, b) => {
    const severityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
    return severityWeight[b.severity] - severityWeight[a.severity];
  });
}

/**
 * Creates a structured challenge from raw text
 */
function createChallengeFromText(
  rawText: string,
  industry: string,
  companySize: string,
  timeline: string
): Challenge | null {
  const normalizedText = rawText.toLowerCase();
  
  // Find matching pattern
  const matchingPattern = CHALLENGE_PATTERNS.find(pattern =>
    pattern.keywords.some(keyword => normalizedText.includes(keyword)) ||
    pattern.commonPhrases.some(phrase => normalizedText.includes(phrase))
  );
  
  if (!matchingPattern) {
    return createGenericChallenge(rawText, industry);
  }
  
  // Customize solution for industry
  const customSolution = customizeSolutionForIndustry(
    matchingPattern.solutionTemplate,
    industry,
    rawText,
    companySize,
    timeline
  );
  
  return {
    original: rawText,
    category: matchingPattern.category,
    severity: adjustSeverityForContext(matchingPattern.severity, timeline, companySize),
    solution: customSolution,
    priority: calculatePriority(matchingPattern.severity, industry, rawText)
  };
}

/**
 * Customizes solution vision for specific industry
 */
function customizeSolutionForIndustry(
  baseSolution: SolutionVisionBlock,
  industry: string,
  originalChallenge: string,
  companySize: string,
  timeline: string
): SolutionVisionBlock {
  const industryCustomization = INDUSTRY_CUSTOMIZATIONS[industry];
  
  if (!industryCustomization) {
    return baseSolution;
  }
  
  // Check for industry-specific challenge solutions
  const industryChallenge = industryCustomization.commonChallenges.find(challenge =>
    originalChallenge.toLowerCase().includes(challenge.challenge.toLowerCase())
  );
  
  if (industryChallenge) {
    return enhanceSolutionWithContext(industryChallenge.solution, companySize, timeline);
  }
  
  // Customize base solution with industry language
  return {
    ...baseSolution,
    industryContext: `${industry.toLowerCase()} operations`,
    visionStatement: adaptLanguageForIndustry(baseSolution.visionStatement, industry),
    nextStepHook: `Let's explore how this applies specifically to your ${industry.toLowerCase()} workflows`
  };
}

/**
 * Adapts language for specific industry
 */
function adaptLanguageForIndustry(statement: string, industry: string): string {
  const industryTerms: Record<string, Record<string, string>> = {
    'Education': {
      'team': 'faculty and staff',
      'operations': 'educational programs',
      'processes': 'administrative workflows',
      'customers': 'students and families'
    },
    'Legal': {
      'team': 'legal professionals',
      'operations': 'practice management',
      'processes': 'legal workflows',
      'customers': 'clients'
    },
    'Healthcare': {
      'team': 'clinical staff',
      'operations': 'patient care',
      'processes': 'clinical workflows',
      'customers': 'patients'
    }
  };
  
  const terms = industryTerms[industry];
  if (!terms) return statement;
  
  let adaptedStatement = statement;
  Object.entries(terms).forEach(([generic, specific]) => {
    adaptedStatement = adaptedStatement.replace(new RegExp(generic, 'gi'), specific);
  });
  
  return adaptedStatement;
}

/**
 * Enhances solution with company size and timeline context
 */
function enhanceSolutionWithContext(
  solution: SolutionVisionBlock,
  companySize: string,
  timeline: string
): SolutionVisionBlock {
  // Adjust metrics based on company size
  let scaledMetric = solution.impactMetric;
  if (companySize.includes('500+') || companySize.includes('large')) {
    scaledMetric = solution.impactMetric.replace(/(\d+)%/, (match, num) => {
      return `${Math.min(parseInt(num) + 10, 95)}%`;
    });
  }
  
  // Adjust timeline urgency
  let urgencyContext = solution.nextStepHook;
  if (timeline === 'deciding' || timeline.includes('immediate')) {
    urgencyContext = urgencyContext.replace('explore', 'immediately assess');
  }
  
  return {
    ...solution,
    impactMetric: scaledMetric,
    nextStepHook: urgencyContext
  };
}

/**
 * Creates generic challenge when no pattern matches
 */
function createGenericChallenge(rawText: string, industry: string): Challenge {
  return {
    original: rawText,
    category: 'efficiency',
    severity: 'medium',
    solution: {
      challengeKeyword: 'operational efficiency',
      visionStatement: `Imagine transforming your ${rawText} into a streamlined, automated process that delivers better results with less effort`,
      specificBenefit: 'Significant time savings with improved accuracy',
      impactMetric: '50% efficiency improvement',
      industryContext: `${industry.toLowerCase()} operations`,
      nextStepHook: 'Let\'s discuss how automation can address this specific challenge'
    },
    priority: 5
  };
}

/**
 * Adjusts severity based on context
 */
function adjustSeverityForContext(
  baseSeverity: Challenge['severity'],
  timeline: string,
  companySize: string
): Challenge['severity'] {
  const severityLevels: Challenge['severity'][] = ['low', 'medium', 'high', 'critical'];
  const currentIndex = severityLevels.indexOf(baseSeverity);
  
  let adjustment = 0;
  
  // Urgency increases severity
  if (timeline === 'deciding' || timeline.includes('immediate')) {
    adjustment += 1;
  }
  
  // Large companies have higher impact
  if (companySize.includes('500+') || companySize.includes('large')) {
    adjustment += 1;
  }
  
  const newIndex = Math.min(currentIndex + adjustment, severityLevels.length - 1);
  return severityLevels[newIndex];
}

/**
 * Calculates priority score for challenge ordering
 */
function calculatePriority(
  severity: Challenge['severity'],
  industry: string,
  challenge: string
): number {
  const severityScores = { critical: 10, high: 8, medium: 5, low: 2 };
  let score = severityScores[severity];
  
  // Industry-specific priority boosts
  const industryCustomization = INDUSTRY_CUSTOMIZATIONS[industry];
  if (industryCustomization) {
    const matchingChallenge = industryCustomization.commonChallenges.find(c =>
      challenge.toLowerCase().includes(c.challenge.toLowerCase())
    );
    if (matchingChallenge) {
      score += matchingChallenge.frequency;
    }
  }
  
  return score;
}

/**
 * Generates success metrics relevant to industry and challenges
 */
export function generateSuccessMetrics(
  challenges: Challenge[],
  industry: string
): SuccessMetric[] {
  const metrics: SuccessMetric[] = [];
  
  // Base metrics from challenges
  challenges.forEach(challenge => {
    metrics.push({
      metric: challenge.solution.impactMetric,
      context: `in ${challenge.solution.industryContext}`,
      industryRelevance: 9
    });
  });
  
  // Industry-specific metrics
  const industryCustomization = INDUSTRY_CUSTOMIZATIONS[industry];
  if (industryCustomization) {
    industryCustomization.languagePatterns.successMetrics.forEach(metric => {
      metrics.push({
        metric: `Improved ${metric}`,
        context: `for ${industry.toLowerCase()} organizations`,
        industryRelevance: 10
      });
    });
  }
  
  // Remove duplicates and sort by relevance
  const uniqueMetrics = metrics.filter((metric, index, self) =>
    index === self.findIndex(m => m.metric === metric.metric)
  );
  
  return uniqueMetrics
    .sort((a, b) => b.industryRelevance - a.industryRelevance)
    .slice(0, 3); // Top 3 most relevant metrics
}

/**
 * Gets industry-specific social proof
 */
export function generateIndustryProof(industry: string, companySize: string): any {
  const industryCustomization = INDUSTRY_CUSTOMIZATIONS[industry];
  
  if (!industryCustomization) {
    return {
      industry,
      clientExample: `${industry} organizations like yours`,
      achievement: 'streamlined their operations',
      timeframe: 'within months',
      credibilityFactor: 'across the industry'
    };
  }
  
  const sizeContext = companySize.includes('500+') ? 'large-scale' : 
                     companySize.includes('50+') ? 'mid-size' : 'growing';
  
  return {
    industry,
    clientExample: `${sizeContext} ${industry.toLowerCase()} organizations`,
    achievement: 'transformed their most time-consuming processes',
    timeframe: industryCustomization.decisionPatterns.timeframe,
    credibilityFactor: `with ${industryCustomization.decisionPatterns.stakeholders.join(' and ')}`
  };
}