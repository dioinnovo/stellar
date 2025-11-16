/**
 * Qlik Context Manager
 * Manages conversation context for Qlik Answers to minimize API calls
 * Stores insured entity information and conversation state
 */

export interface QlikContext {
  insuredName?: string;
  policyNumber?: string;
  establishedAt?: Date;
  lastActivity?: Date;
  conversationId: string;
  questionsAsked: string[];
  apiCallsCount: number;
  needsContext: boolean;
  contextConfirmed: boolean;
}

class QlikContextManager {
  private contexts: Map<string, QlikContext> = new Map();
  private readonly CONTEXT_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  /**
   * Create or get context for a conversation
   */
  getContext(conversationId: string): QlikContext {
    const existing = this.contexts.get(conversationId);

    if (existing && this.isContextValid(existing)) {
      existing.lastActivity = new Date();
      return existing;
    }

    const newContext: QlikContext = {
      conversationId,
      questionsAsked: [],
      apiCallsCount: 0,
      needsContext: true,
      contextConfirmed: false,
      establishedAt: new Date(),
      lastActivity: new Date()
    };

    this.contexts.set(conversationId, newContext);
    return newContext;
  }

  /**
   * Set the insured name for a conversation
   */
  setInsuredName(conversationId: string, insuredName: string): void {
    const context = this.getContext(conversationId);
    context.insuredName = insuredName;
    context.needsContext = false;
    context.contextConfirmed = true;
    context.establishedAt = new Date();
    context.lastActivity = new Date();
    this.contexts.set(conversationId, context);
  }

  /**
   * Check if we need to gather context before proceeding
   */
  needsInsuredContext(conversationId: string): boolean {
    const context = this.getContext(conversationId);
    return context.needsContext || !context.insuredName;
  }

  /**
   * Check if context is still valid (not timed out)
   */
  private isContextValid(context: QlikContext): boolean {
    if (!context.lastActivity) return false;
    const now = Date.now();
    const lastActivity = context.lastActivity.getTime();
    return (now - lastActivity) < this.CONTEXT_TIMEOUT;
  }

  /**
   * Track a question asked in this conversation
   */
  trackQuestion(conversationId: string, question: string): void {
    const context = this.getContext(conversationId);
    context.questionsAsked.push(question);
    context.apiCallsCount++;
    context.lastActivity = new Date();
    this.contexts.set(conversationId, context);
  }

  /**
   * Get API usage stats for a conversation
   */
  getUsageStats(conversationId: string): { questionsCount: number; apiCalls: number } {
    const context = this.getContext(conversationId);
    return {
      questionsCount: context.questionsAsked.length,
      apiCalls: context.apiCallsCount
    };
  }

  /**
   * Clear context for a conversation
   */
  clearContext(conversationId: string): void {
    this.contexts.delete(conversationId);
  }

  /**
   * Clear all expired contexts
   */
  clearExpiredContexts(): void {
    const now = Date.now();
    for (const [id, context] of this.contexts.entries()) {
      if (context.lastActivity) {
        const age = now - context.lastActivity.getTime();
        if (age > this.CONTEXT_TIMEOUT) {
          this.contexts.delete(id);
        }
      }
    }
  }

  /**
   * Check if the message is asking for a specific insured
   */
  extractInsuredFromMessage(message: string): string | null {
    // Common patterns for identifying insured names in messages
    const patterns = [
      /for (?:the )?(?:policy of )?([A-Z][a-zA-Z\s]+)/i,
      /(?:check|review|analyze) ([A-Z][a-zA-Z\s]+)(?:'s)? policy/i,
      /policy (?:for|of) ([A-Z][a-zA-Z\s]+)/i,
      /insured:?\s*([A-Z][a-zA-Z\s]+)/i,
      /policyholder:?\s*([A-Z][a-zA-Z\s]+)/i,
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    // Check for property addresses
    const addressPattern = /(\d+\s+[A-Z][a-zA-Z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Lane|Ln|Drive|Dr|Court|Ct|Boulevard|Blvd))/i;
    const addressMatch = message.match(addressPattern);
    if (addressMatch) {
      return addressMatch[1].trim();
    }

    return null;
  }

  /**
   * Format the insured name for display
   */
  formatInsuredName(name: string): string {
    // Clean up and format the name
    return name
      .trim()
      .replace(/\s+/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Get a prompt to ask for insured context
   */
  getContextGatheringPrompt(): string {
    return "To provide accurate policy information from my knowledge base, please tell me the name of the insured person or the property address you'd like to inquire about.";
  }

  /**
   * Get confirmation message after context is set
   */
  getContextConfirmationMessage(insuredName: string): string {
    return `I'll analyze the policy information for **${insuredName}**. What would you like to know about this policy?`;
  }
}

// Export singleton instance
export const qlikContextManager = new QlikContextManager();

// Also export the class for testing
export { QlikContextManager };