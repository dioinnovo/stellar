/**
 * Workflow Enforcer for BANT Qualification
 * 
 * Ensures strict compliance with the qualification workflow
 * Prevents skipping critical steps and enforces linear progression
 */

export enum ConversationState {
  INITIAL = 'INITIAL',
  CHALLENGES = 'CHALLENGES',
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  COMPANY = 'COMPANY',
  ROLE = 'ROLE',
  SIZE = 'SIZE',
  TIMELINE = 'TIMELINE',
  STAKEHOLDERS = 'STAKEHOLDERS',
  BUDGET = 'BUDGET',
  QUALIFIED = 'QUALIFIED',
  COMPLETED = 'COMPLETED'
}

export interface WorkflowState {
  currentState: ConversationState;
  completedSteps: Set<ConversationState>;
  missingSteps: ConversationState[];
  canProceed: boolean;
  nextRequiredStep: ConversationState | null;
  complianceScore: number; // 0-100
}

export class WorkflowEnforcer {
  private static readonly WORKFLOW_SEQUENCE: ConversationState[] = [
    ConversationState.INITIAL,
    ConversationState.CHALLENGES,
    ConversationState.EMAIL,
    ConversationState.PHONE,
    ConversationState.COMPANY,
    ConversationState.ROLE,
    ConversationState.SIZE,
    ConversationState.TIMELINE,
    ConversationState.STAKEHOLDERS,
    ConversationState.BUDGET,
    ConversationState.QUALIFIED,
    ConversationState.COMPLETED
  ];

  private static readonly MANDATORY_FIELDS = {
    [ConversationState.CHALLENGES]: 'currentChallenges',
    [ConversationState.EMAIL]: 'email',
    [ConversationState.PHONE]: 'phone',
    [ConversationState.COMPANY]: 'company',
    [ConversationState.ROLE]: 'role',
    [ConversationState.SIZE]: 'companySize',
    [ConversationState.TIMELINE]: 'timeline',
    [ConversationState.STAKEHOLDERS]: 'stakeholders',
    [ConversationState.BUDGET]: 'budget'
  };

  /**
   * Get the current workflow state based on customer info
   */
  static getWorkflowState(customerInfo: any): WorkflowState {
    const completedSteps = new Set<ConversationState>();
    const missingSteps: ConversationState[] = [];

    // Always mark INITIAL as completed
    completedSteps.add(ConversationState.INITIAL);

    // Check each mandatory field
    for (const [state, field] of Object.entries(this.MANDATORY_FIELDS)) {
      const stateEnum = state as ConversationState;
      const value = customerInfo[field];
      
      if (this.isFieldCompleted(field, value)) {
        completedSteps.add(stateEnum);
      } else {
        missingSteps.push(stateEnum);
      }
    }

    // Determine current state - the first missing step in sequence
    let currentState = ConversationState.INITIAL;
    let nextRequiredStep: ConversationState | null = null;
    
    for (const state of this.WORKFLOW_SEQUENCE) {
      if (!completedSteps.has(state) && state !== ConversationState.INITIAL) {
        currentState = this.getPreviousState(state);
        nextRequiredStep = state;
        break;
      }
      currentState = state;
    }

    // Can only proceed to QUALIFIED if all mandatory steps are complete
    const canProceed = missingSteps.length === 0;
    
    // Calculate compliance score
    const totalMandatory = Object.keys(this.MANDATORY_FIELDS).length;
    const completed = totalMandatory - missingSteps.length;
    const complianceScore = Math.round((completed / totalMandatory) * 100);

    // Mark as qualified if all steps complete
    if (canProceed) {
      completedSteps.add(ConversationState.QUALIFIED);
      currentState = ConversationState.QUALIFIED;
    }

    return {
      currentState,
      completedSteps,
      missingSteps,
      canProceed,
      nextRequiredStep,
      complianceScore
    };
  }

  /**
   * Check if a field is properly completed
   */
  private static isFieldCompleted(field: string, value: any): boolean {
    if (!value) return false;
    
    switch (field) {
      case 'currentChallenges':
        return Array.isArray(value) && value.length > 0;
      case 'stakeholders':
        return Array.isArray(value) && value.length > 0;
      case 'email':
        return typeof value === 'string' && value.includes('@');
      case 'phone':
        return typeof value === 'string' && value.length >= 10;
      case 'company':
      case 'role':
      case 'companySize':
      case 'timeline':
      case 'budget':
        return typeof value === 'string' && value.trim().length > 0;
      default:
        return false;
    }
  }

  /**
   * Get the previous state in the workflow
   */
  private static getPreviousState(state: ConversationState): ConversationState {
    const index = this.WORKFLOW_SEQUENCE.indexOf(state);
    return index > 0 ? this.WORKFLOW_SEQUENCE[index - 1] : ConversationState.INITIAL;
  }

  /**
   * Get the mandatory question for a given state
   */
  static getMandatoryQuestion(state: ConversationState): string {
    const questions: Record<ConversationState, string> = {
      [ConversationState.INITIAL]: "Hello! I'm Stella, your claims intelligence assistant. What's the biggest bottleneck slowing your team down right now?",
      [ConversationState.CHALLENGES]: "What specific challenges are you looking to solve with automation or AI?",
      [ConversationState.EMAIL]: "I'm going to put together a custom automation roadmap for your situation. What's the best email to send your personalized strategy?",
      [ConversationState.PHONE]: "For something this transformative, I want to make sure you get direct access to our senior team. What's the best number for a quick strategy call?",
      [ConversationState.COMPANY]: "Excellent! Now, tell me about your company - what's the name and what industry are you revolutionizing?",
      [ConversationState.ROLE]: "And you're the decision maker here? What's your specific role?",
      [ConversationState.SIZE]: "To scope the right solution architecture, roughly how big is the team? 10-50, 50-200, or larger?",
      [ConversationState.TIMELINE]: "How quickly do you need to see results? Some clients need wins within 30 days, others plan for Q1 - what works for you?",
      [ConversationState.STAKEHOLDERS]: "Who's your champion for this internally? I want to make sure they're as excited as you are.",
      [ConversationState.BUDGET]: "For the transformation you're describing, companies typically invest between 50K-200K to start. Where does your company fall in that range?",
      [ConversationState.QUALIFIED]: "Perfect! I have everything I need. You'll receive your custom roadmap within 24 hours, and our senior strategist will reach out to discuss implementation.",
      [ConversationState.COMPLETED]: "Thank you for your time! We're excited to help transform your business."
    };
    
    return questions[state] || "Let me gather some more information to help you better.";
  }

  /**
   * Enforce workflow compliance - generate the next required message
   */
  static enforceNextStep(customerInfo: any, userMessage: string): {
    forcedQuestion: string | null;
    allowNaturalResponse: boolean;
    warningMessage: string | null;
  } {
    const workflowState = this.getWorkflowState(customerInfo);
    
    // If user is trying to end conversation but we're missing critical info
    const isEndingEarly = this.isUserEndingConversation(userMessage) && !workflowState.canProceed;
    
    if (isEndingEarly) {
      const firstMissing = workflowState.missingSteps[0];
      return {
        forcedQuestion: `Before we wrap up, I just need a few quick details to ensure you get the right solution. ${this.getMandatoryQuestion(firstMissing)}`,
        allowNaturalResponse: false,
        warningMessage: `⚠️ User trying to end early. Missing ${workflowState.missingSteps.length} required steps.`
      };
    }
    
    // If we have a next required step and it's not being addressed
    if (workflowState.nextRequiredStep) {
      // Check if the user's message might contain the required info
      const mightContainInfo = this.checkIfMessageContainsRequiredInfo(
        userMessage, 
        workflowState.nextRequiredStep
      );
      
      if (!mightContainInfo) {
        return {
          forcedQuestion: this.getMandatoryQuestion(workflowState.nextRequiredStep),
          allowNaturalResponse: false,
          warningMessage: `📋 Enforcing ${workflowState.nextRequiredStep} collection. Compliance: ${workflowState.complianceScore}%`
        };
      }
    }
    
    return {
      forcedQuestion: null,
      allowNaturalResponse: true,
      warningMessage: null
    };
  }

  /**
   * Check if user is trying to end the conversation
   */
  private static isUserEndingConversation(message: string): boolean {
    const endingPhrases = [
      'bye', 'goodbye', 'thanks', 'thank you', 'that\'s all',
      'i\'m done', 'gotta go', 'talk later', 'end call',
      'that\'s it', 'all set', 'we\'re done'
    ];
    
    const lower = message.toLowerCase();
    return endingPhrases.some(phrase => lower.includes(phrase));
  }

  /**
   * Check if message might contain required information
   */
  private static checkIfMessageContainsRequiredInfo(
    message: string, 
    requiredState: ConversationState
  ): boolean {
    const lower = message.toLowerCase();
    
    switch (requiredState) {
      case ConversationState.EMAIL:
        return lower.includes('@') || lower.includes('email');
      case ConversationState.PHONE:
        return /\d{10}/.test(message.replace(/\D/g, '')) || lower.includes('phone');
      case ConversationState.COMPANY:
        return lower.includes('company') || lower.includes('work at') || lower.includes('we are');
      case ConversationState.BUDGET:
        return lower.includes('$') || lower.includes('budget') || /\d+k/i.test(lower);
      case ConversationState.TIMELINE:
        return lower.includes('month') || lower.includes('week') || lower.includes('quarter') || 
               lower.includes('asap') || lower.includes('q1') || lower.includes('q2');
      default:
        return true; // Give benefit of doubt for other fields
    }
  }

  /**
   * Get compliance report
   */
  static getComplianceReport(customerInfo: any): string {
    const state = this.getWorkflowState(customerInfo);
    
    let report = `
🎯 WORKFLOW COMPLIANCE REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Compliance Score: ${state.complianceScore}%
📍 Current State: ${state.currentState}
✅ Completed: ${state.completedSteps.size - 1}/${Object.keys(this.MANDATORY_FIELDS).length}
`;

    if (state.missingSteps.length > 0) {
      report += `
⚠️ MISSING REQUIRED INFORMATION:
${state.missingSteps.map(step => `  ❌ ${step}`).join('\n')}

🚨 NEXT REQUIRED: ${state.nextRequiredStep || 'None'}
`;
    } else {
      report += `
✅ ALL REQUIRED INFORMATION COLLECTED
🎉 Ready for qualification!
`;
    }
    
    return report;
  }
}