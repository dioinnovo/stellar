/**
 * Data Extraction Agent
 * 
 * Extracts structured data from unstructured conversation text
 * using pattern matching, NLP, and validation
 */

import { MasterOrchestratorState, CustomerInfo, AgentExecution } from '../orchestrator/state';

/**
 * Extract and validate email addresses
 */
function extractEmail(text: string): string | undefined {
  const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;
  const matches = text.match(emailPattern);
  
  if (matches && matches.length > 0) {
    // Validate and return the first valid email
    const email = matches[0].toLowerCase();
    if (email.includes('@') && email.includes('.') && !email.includes(' ')) {
      return email;
    }
  }
  
  return undefined;
}

/**
 * Extract and format phone numbers
 */
function extractPhone(text: string): string | undefined {
  // Multiple phone patterns
  const patterns = [
    /(\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g, // US format
    /(\d{3}[-.\s]\d{3}[-.\s]\d{4})/g, // Simple format
    /(\+\d{1,3}[-.\s]?\d{8,12})/g, // International
  ];
  
  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      // Clean and format the phone number
      const phone = matches[0].replace(/[^\d+]/g, '');
      if (phone.length >= 10) {
        return phone;
      }
    }
  }
  
  return undefined;
}

/**
 * Extract person's name using patterns and heuristics
 */
function extractName(text: string): string | undefined {
  // Simple pattern matching for "My name is X" or "I'm X"
  const namePatterns = [
    /my name is (\w+)/i,
    /i'm (\w+)/i,
    /i am (\w+)/i,
    /this is (\w+)/i,
    /^(\w+) here/i,
  ];

  for (const pattern of namePatterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      // Extract the name group
      const fullMatch = matches[0];
      const nameMatch = fullMatch.replace(/^(hi|hello|hey),?\s+/gi, '')
        .replace(/^(i'm|i am|my name is|this is|name:?\s+|call me|you can call me)\s+/gi, '')
        .replace(/\s+(here|speaking|calling)$/gi, '');
      
      // Clean up and validate
      const name = nameMatch.trim();
      if (name.length > 2 && name.length < 50 && !name.includes('@')) {
        // Capitalize properly
        return name.split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
      }
    }
  }
  
  return undefined;
}

/**
 * Extract company name
 */
function extractCompany(text: string): string | undefined {
  // Skip phrases that are clearly not company names
  const textLower = text.toLowerCase();
  if (textLower.includes('my real estate business') || 
      textLower.includes('my business') ||
      textLower.includes('our company') ||
      textLower.includes('the company')) {
    // Extract actual company name from context if mentioned
    const actualCompanyPattern = /(?:called|named|it's|its)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})/gi;
    const match = text.match(actualCompanyPattern);
    if (match) {
      return match[1].trim();
    }
    return undefined;
  }
  
  // Company patterns - more specific
  const patterns = [
    /(?:I'm with|I work at|from|represent)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,4})\s+(?:LLC|LLP|Inc|Corp|Company)/gi,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,4})\s+(?:LLC|LLP|Inc|Corp|Company|Firm|Associates|Partners|Group|Solutions|Services)/gi,
    /(?:company is|firm is|organization is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,4})/gi,
  ];
  
  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      // Clean the match
      let company = matches[0];
      
      // Remove prefixes
      company = company.replace(/^(I'm with|I work at|from|represent|company is|firm is|organization is)\s+/gi, '');
      company = company.replace(/\s+(LLC|LLP|Inc|Corp|Company|Firm|Associates|Partners|Group|Solutions|Services)$/gi, '');
      
      // Clean up
      company = company.trim();
      
      // Validate - must be a proper name
      if (company.length > 2 && 
          !company.toLowerCase().includes('my') && 
          !company.toLowerCase().includes('our') &&
          !company.toLowerCase().includes('your')) {
        return company.split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
    }
  }
  
  return undefined;
}

/**
 * Extract industry from text
 */
function extractIndustry(text: string): string | undefined {
  const textLower = text.toLowerCase();
  
  // Extract company name if present to avoid false positives
  // Look for patterns like "from TechCorp Financial" or "at ABC Banking"
  const companyPattern = /(?:from|at|with|work for|represent|representing)\s+([A-Z][\w\s]+?)(?:\.|,|\s+and|\s+we|\s+where|$)/gi;
  const companyMatches = text.match(companyPattern);
  const companyNames = companyMatches ? companyMatches.map(m => m.toLowerCase()) : [];
  
  // Common industries - check with more context
  const industries = [
    'real estate', 'healthcare', 'banking', 'insurance', 
    'retail', 'e-commerce', 'manufacturing', 'logistics', 'transportation',
    'technology', 'software', 'saas', 'education', 'hospitality',
    'construction', 'automotive', 'energy', 'utilities', 'telecom',
    'media', 'entertainment', 'legal', 'consulting', 'marketing',
    'pharmaceutical', 'biotech', 'agriculture', 'food service', 'nonprofit'
  ];
  
  // Special handling for finance to avoid false positives from company names
  // Only match "finance" if it's used in industry context, not company names
  if (textLower.includes('finance') && 
      !companyNames.some(name => name.includes('financial') || name.includes('finance'))) {
    // Check for finance industry context
    if (textLower.includes('finance industry') || 
        textLower.includes('financial services') ||
        textLower.includes('finance sector') ||
        textLower.includes('work in finance')) {
      return 'Finance';
    }
  }
  
  for (const industry of industries) {
    // Skip if this appears to be part of a company name
    const isInCompanyName = companyNames.some(name => name.includes(industry));
    if (isInCompanyName) {
      continue;
    }
    
    if (textLower.includes(industry)) {
      // Additional validation for common false positives
      if (industry === 'consulting' && textLower.includes('consulting firm')) {
        return 'Consulting';
      }
      if (textLower.includes(`${industry} industry`) || 
          textLower.includes(`${industry} sector`) ||
          textLower.includes(`${industry} company`) ||
          textLower.includes(`work in ${industry}`) ||
          textLower.includes(`${industry} business`)) {
        // Capitalize properly
        return industry.split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
    }
  }
  
  return undefined;
}

/**
 * Extract job title/role
 */
function extractTitle(text: string): string | undefined {
  const titles = [
    'CEO', 'CTO', 'CFO', 'COO', 'CMO', 'CIO', 'CISO',
    'President', 'Vice President', 'VP',
    'Director', 'Manager', 'Head of', 'Lead',
    'Partner', 'Principal', 'Founder', 'Owner',
    'Analyst', 'Engineer', 'Developer', 'Architect',
    'Consultant', 'Specialist', 'Coordinator',
  ];
  
  const textLower = text.toLowerCase();
  for (const title of titles) {
    if (textLower.includes(title.toLowerCase())) {
      // Try to extract the full title with department
      const pattern = new RegExp(`(${title}[^.!?]*?)(?:\\.|!|\\?|$)`, 'gi');
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        const fullTitle = matches[0].trim();
        if (fullTitle.length < 100) {
          return fullTitle;
        }
      }
      return title;
    }
  }
  
  return undefined;
}

/**
 * Extract employee count/company size
 */
function extractEmployeeCount(text: string): number | undefined {
  const pattern = /\b(\d+)\s*(employee|people|person|staff|lawyer|attorney|consultant|worker|team\s*member|professional|developer|engineer)/gi;
  const matches = text.match(pattern);
  
  if (matches && matches.length > 0) {
    const numberMatch = matches[0].match(/\d+/);
    if (numberMatch) {
      return parseInt(numberMatch[0]);
    }
  }
  
  return undefined;
}

/**
 * Extract budget information
 */
function extractBudget(text: string): { amount?: number; range?: string } | undefined {
  const patterns = [
    /\$\s*(\d+)k/gi, // $50k
    /\$\s*(\d+),?(\d+)k/gi, // $150,000k
    /\$\s*(\d+(?:,\d{3})*)/gi, // $150,000
    /(\d+)\s*k\s*(?:budget|dollars?)/gi, // 50k budget
    /budget.*?(\d+)k/gi, // budget of 50k
  ];
  
  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      const match = matches[0];
      
      // Extract number
      let amount = 0;
      if (match.includes('k')) {
        const num = match.match(/(\d+(?:,\d+)?)/);
        if (num) {
          amount = parseInt(num[0].replace(/,/g, '')) * 1000;
        }
      } else {
        const num = match.match(/\d+(?:,\d{3})*/);
        if (num) {
          amount = parseInt(num[0].replace(/,/g, ''));
        }
      }
      
      if (amount > 0) {
        // Determine range
        let range = '';
        if (amount < 50000) range = 'Under $50K';
        else if (amount < 100000) range = '$50K-$100K';
        else if (amount < 250000) range = '$100K-$250K';
        else if (amount < 500000) range = '$250K-$500K';
        else if (amount < 1000000) range = '$500K-$1M';
        else range = 'Over $1M';
        
        return { amount, range };
      }
    }
  }
  
  return undefined;
}

/**
 * Extract timeline/urgency
 */
function extractTimeline(text: string): string | undefined {
  const urgentPatterns = [
    'urgent', 'asap', 'immediately', 'right away', 'as soon as possible',
    'critical', 'emergency', 'now', 'today', 'tomorrow',
  ];
  
  const textLower = text.toLowerCase();
  
  // Check urgent patterns
  for (const pattern of urgentPatterns) {
    if (textLower.includes(pattern)) {
      return 'immediate';
    }
  }
  
  // Check for specific timeframes
  if (textLower.includes('this week') || textLower.includes('next week')) {
    return 'immediate';
  }
  if (textLower.includes('this month') || textLower.includes('next month')) {
    return 'this_quarter';
  }
  if (textLower.includes('this quarter') || textLower.includes('q1') || textLower.includes('q2')) {
    return 'this_quarter';
  }
  if (textLower.includes('this year') || textLower.includes('2025')) {
    return 'this_year';
  }
  if (textLower.includes('next year') || textLower.includes('2026')) {
    return 'next_year';
  }
  
  return undefined;
}

/**
 * Extract pain points and challenges
 */
function extractChallenges(text: string): string[] {
  const challenges: string[] = [];
  const keywords = [
    'problem', 'challenge', 'issue', 'pain', 'struggle', 'difficult',
    'frustrat', 'slow', 'manual', 'error', 'mistake', 'inefficient',
    'waste', 'cost', 'expensive', 'time-consuming', 'complex',
    'integration', 'data quality', 'compliance', 'security',
  ];
  
  const textLower = text.toLowerCase();
  const sentences = text.split(/[.!?]+/);
  
  for (const sentence of sentences) {
    const sentLower = sentence.toLowerCase();
    for (const keyword of keywords) {
      if (sentLower.includes(keyword)) {
        const cleaned = sentence.trim();
        if (cleaned.length > 10 && cleaned.length < 200) {
          challenges.push(cleaned);
          break; // Only add sentence once
        }
      }
    }
  }
  
  return [...new Set(challenges)]; // Remove duplicates
}

/**
 * Main extraction node
 */
export async function extractionNode(
  state: MasterOrchestratorState
): Promise<Partial<MasterOrchestratorState>> {
  const startTime = new Date();
  console.log('🔍 Extraction agent running...');
  
  try {
    // Find the last user message (might not be the very last message if AI already responded)
    const userMessages = state.messages.filter(m => m._getType() === 'human');
    const lastUserMessage = userMessages[userMessages.length - 1];
    
    // Skip if no user messages
    if (!lastUserMessage) {
      console.log('⏭️ Skipping extraction - no user messages found');
      return {
        agentExecutions: [{
          agentId: 'extraction',
          startTime,
          endTime: new Date(),
          status: 'completed',
          result: { reason: 'No new user message' },
          retryCount: 0,
        }],
      };
    }
    
    const fullText = lastUserMessage.content.toString();
    
    console.log('📝 Extracting from last user message:', fullText.substring(0, 200));
    
    // Extract all data points
    const extracted: Partial<CustomerInfo> = {};
    
    // Basic Information
    const email = extractEmail(fullText);
    if (email && !state.customerInfo.email) {
      extracted.email = email;
    }
    
    const phone = extractPhone(fullText);
    if (phone && !state.customerInfo.phone) {
      extracted.phone = phone;
    }
    
    const name = extractName(fullText);
    if (name && !state.customerInfo.name) {
      extracted.name = name;
    }
    
    // Company Information
    const company = extractCompany(fullText);
    if (company && !state.customerInfo.company) {
      extracted.company = company;
    }
    
    // Industry
    const industry = extractIndustry(fullText);
    if (industry && !state.customerInfo.industry) {
      extracted.industry = industry;
    }
    
    const employeeCount = extractEmployeeCount(fullText);
    if (employeeCount && !state.customerInfo.employeeCount) {
      extracted.employeeCount = employeeCount;
      
      // Determine company size
      if (employeeCount < 10) extracted.companySize = 'startup';
      else if (employeeCount < 50) extracted.companySize = 'small';
      else if (employeeCount < 250) extracted.companySize = 'medium';
      else if (employeeCount < 1000) extracted.companySize = 'large';
      else extracted.companySize = 'enterprise';
    }
    
    // Role Information
    const title = extractTitle(fullText);
    if (title && !state.customerInfo.title) {
      extracted.title = title;
      
      // Determine role level
      if (title.match(/CEO|CTO|CFO|COO|President|Owner|Founder/i)) {
        extracted.role = 'decision_maker';
      } else if (title.match(/Director|VP|Vice President|Head of|Manager/i)) {
        extracted.role = 'influencer';
      } else {
        extracted.role = 'researcher';
      }
    }
    
    // Challenges
    const challenges = extractChallenges(fullText);
    if (challenges.length > 0) {
      extracted.currentChallenges = [
        ...(state.customerInfo.currentChallenges || []),
        ...challenges.filter(c => !state.customerInfo.currentChallenges?.includes(c))
      ];
    }
    
    // Budget (store in state for qualification)
    const budget = extractBudget(fullText);
    
    // Timeline (store in state for qualification)
    const timeline = extractTimeline(fullText);
    
    // Track execution
    const execution: AgentExecution = {
      agentId: 'extraction',
      startTime,
      endTime: new Date(),
      status: 'completed',
      result: {
        extracted: Object.keys(extracted).length,
        budget,
        timeline,
      },
      retryCount: 0,
    };
    
    // Log what we extracted
    console.log('✅ Extracted data:', extracted);
    console.log('📦 Current customerInfo:', state.customerInfo);
    console.log('🔄 Will return merged:', { ...state.customerInfo, ...extracted });
    
    // Return updates
    return {
      customerInfo: { ...state.customerInfo, ...extracted },  // Merge with existing
      agentExecutions: [execution],
      // Store budget and timeline for qualification
      ...(budget && {
        qualification: state.qualification ? {
          ...state.qualification,
          budget: {
            ...state.qualification.budget,
            amount: budget.amount,
            range: budget.range,
          },
        } : null,
      }),
      ...(timeline && {
        qualification: state.qualification ? {
          ...state.qualification,
          timeline: {
            ...state.qualification.timeline,
            timeframe: timeline as any,
          },
        } : null,
      }),
    };
    
  } catch (error) {
    console.error('Extraction error:', error);
    
    // Track error
    return {
      errors: [{
        timestamp: new Date(),
        agent: 'extraction',
        error: error instanceof Error ? error.message : 'Unknown extraction error',
        recovered: false,
      }],
      agentExecutions: [{
        agentId: 'extraction',
        startTime,
        endTime: new Date(),
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        retryCount: 0,
      }],
    };
  }
}