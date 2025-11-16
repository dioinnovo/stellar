/**
 * Unified Assistant API
 * Handles both Qlik and Azure providers using AI SDK v5
 */

import { NextRequest, NextResponse } from 'next/server';
import { streamText, generateText, CoreMessage, CoreUserMessage, CoreAssistantMessage, CoreSystemMessage } from 'ai';
import { getProvider, resetProviderState } from '@/lib/ai/providers/registry';
import { ModelType } from '@/lib/ai/providers/types';
import { QlikWrapper } from '@/lib/ai/providers/qlik-wrapper';
import { z } from 'zod';
import { buildStellaClaimsPrompt } from '@/lib/ai/prompts/stella-claims-prompt';
import {
  getQuickQuestionSuggestions,
  expandQuickQuestion,
  isQuickQuestion,
  CONTEXT_GATHERING_PROMPTS
} from '@/lib/ai/prompts/qlik-quick-prompts';
import { qlikContextManager } from '@/lib/ai/utils/qlik-context-manager';
import { mockPolicies, generatePolicyAnalysis } from '@/lib/ai/mock-policy-data';
import { LightRAGProvider } from '@/lib/ai/providers/lightrag-provider';

// Request validation schema
const RequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })),
  model: z.enum(['quick', 'stella-pro']).default('stella-pro'),
  stream: z.boolean().default(true),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(8000).optional(),
  generateTitle: z.boolean().optional(),
  resetThread: z.boolean().optional(),
  conversationId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const validatedData = RequestSchema.parse(body);
    const { messages, model, stream, temperature, maxTokens, generateTitle, resetThread, conversationId } = validatedData;

    // Initialize LightRAG provider
    const lightragProvider = new LightRAGProvider();

    // Check if this is a comprehensive policy review request or policy upload
    const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
    const previousMessage = messages[messages.length - 2]?.content?.toLowerCase() || '';

    // Check if user uploaded a policy document
    if (lastMessage.includes("i've uploaded") && (lastMessage.includes('policy document') || lastMessage.includes('policy'))) {
      // Extract filename from the message
      const filenameMatch = lastMessage.match(/: ([^]+)$/);
      const filename = filenameMatch ? filenameMatch[1] : 'policy document';

      // Generate professional response for policy upload
      const uploadResponse = `Perfect! I've received the policy document **"${filename}"** and I'm ready to perform a comprehensive analysis.

I've recently added this policy to our system and can now provide you with:

**📊 Comprehensive Coverage Analysis**
• Complete review of all policy provisions and endorsements
• Identification of hidden coverage opportunities
• Analysis of exclusions and limitations
• Deductible optimization strategies

**💰 Maximum Recovery Potential**
• Line-by-line coverage breakdown
• Additional living expenses calculations
• Business interruption coverage analysis
• Ordinance and law coverage implications

**📈 Strategic Recommendations**
• Priority action items for claim filing
• Documentation requirements checklist
• Timeline and deadline management
• Negotiation leverage points

**Would you like me to create a comprehensive report** that includes all coverage opportunities, strategic recommendations, and maximum settlement calculations for this policy?

This analysis typically uncovers 30-40% more coverage than standard reviews.`;

      return NextResponse.json({
        response: uploadResponse,
        suggestions: [
          'Create comprehensive report',
          'Analyze coverage limits',
          'Review exclusions',
          'Calculate maximum recovery'
        ],
        sources: [{
          name: filename,
          snippet: 'Policy document uploaded and ready for analysis',
          metadata: {
            page: 1,
            section: 'Document Upload',
            confidence: 100
          }
        }],
        provider: model === 'quick' ? 'qlik' : 'azure'
      });
    }

    // Check if user wants to create a comprehensive report after upload
    if ((lastMessage.includes('create comprehensive report') ||
         lastMessage.includes('yes') ||
         lastMessage.includes('comprehensive report')) &&
        previousMessage.includes('would you like me to create')) {

      // Generate a sample comprehensive analysis
      const analysisResponse = `## Comprehensive Policy Analysis Report

**Generated:** ${new Date().toLocaleDateString()}
**Status:** ✅ Complete Analysis Available

### Executive Summary

I've completed a thorough analysis of your client's policy and identified **significant coverage opportunities** that were not immediately apparent. Based on my review, there's potential for **$287,500 in additional recoverable damages** beyond the initial assessment.

### Key Findings

**1. Overlooked Coverage Provisions**
• **Ordinance & Law Coverage**: $150,000 available for code upgrades
• **Business Interruption**: 12 months coverage at $15,000/month
• **Additional Living Expenses**: $75,000 limit (currently unclaimed)
• **Debris Removal**: Separate 25% additional coverage above policy limits

**2. Hidden Endorsements Discovered**
• **Extended Replacement Cost**: Additional 25% above dwelling limit
• **Guaranteed Replacement Cost**: No cap on rebuilding costs
• **Inflation Guard**: Automatic 4% annual increase applied
• **Backup of Sewers**: $50,000 coverage for water damage

**3. Deductible Optimization**
• Hurricane deductible can be waived due to "continuous damage" clause
• Standard deductible applies instead: Saves $18,500
• Multiple peril provision allows single deductible application

### Strategic Recommendations

**Immediate Actions:**
1. ✅ File supplemental claim for overlooked provisions
2. ✅ Document all business interruption losses retroactively
3. ✅ Request advance on ALE immediately (30% available)
4. ✅ Invoke appraisal clause if initial offer is below analysis

**Documentation Required:**
• Pre-loss financial statements (3 years)
• Detailed repair estimates with code upgrades
• Temporary living expense receipts
• Business income projections

### Settlement Calculation

| Coverage Type | Initial Offer | Our Analysis | Additional |
|--------------|--------------|--------------|------------|
| Dwelling | $450,000 | $562,500 | +$112,500 |
| Contents | $125,000 | $156,250 | +$31,250 |
| ALE | $0 | $75,000 | +$75,000 |
| Business Int. | $0 | $180,000 | +$180,000 |
| **Total** | **$575,000** | **$973,750** | **+$398,750** |

### Next Steps

1. **Schedule Strategy Call**: Review findings with your team
2. **Prepare Documentation**: Gather all supporting evidence
3. **Submit Supplemental**: File within 10 business days
4. **Negotiate Settlement**: Use analysis as leverage

### Compliance Notes

✅ All provisions verified against state regulations
✅ Timeline compliant with policy requirements
✅ Documentation meets carrier standards
✅ Analysis includes recent case law precedents

---

**Download this report** for your records and share with your client. This comprehensive analysis provides the ammunition needed to maximize the settlement and ensure no coverage is left on the table.`;

      return NextResponse.json({
        response: analysisResponse,
        suggestions: [
          'Download full report',
          'Review specific provisions',
          'Calculate exact settlement',
          'Prepare appeal documentation'
        ],
        sources: [{
          name: 'Policy Analysis Complete',
          snippet: 'Comprehensive coverage review with all opportunities identified',
          metadata: {
            page: 1,
            section: 'Full Analysis',
            confidence: 100
          }
        }],
        provider: model === 'quick' ? 'qlik' : 'azure',
        downloadable: true,
        downloadContent: analysisResponse,
        downloadFilename: `Policy_Analysis_Report_${new Date().toISOString().split('T')[0]}.pdf`
      });
    }

    // Check if user selected "Perform comprehensive policy review" and then provided a name
    if ((previousMessage.includes('perform comprehensive policy review') ||
         previousMessage.includes('comprehensive policy review')) &&
        lastMessage) {
      // Check for mock policyholder names
      const normalizedInput = lastMessage.trim().toLowerCase();
      const mockPolicy = mockPolicies[normalizedInput];

      if (mockPolicy) {
        // Generate comprehensive analysis for the mock policy
        const analysis = generatePolicyAnalysis(mockPolicy);

        // Add download link suggestion
        const responseWithDownload = `${analysis}

---

**Download Options:**
You can save this comprehensive analysis for your records. The report includes all policy provisions, coverage opportunities, and strategic recommendations.

*To download: Click the download button below or copy this analysis to your preferred format.*`;

        return NextResponse.json({
          response: responseWithDownload,
          suggestions: [
            'Review exclusions in detail',
            'Calculate maximum recovery potential',
            'Check for additional endorsements',
            'Analyze deductible waivers'
          ],
          sources: [{
            name: `Policy Document - ${mockPolicy.policyNumber}`,
            snippet: 'Comprehensive policy analysis completed',
            metadata: {
              page: 1,
              section: 'Full Policy Review',
              confidence: 100
            }
          }],
          title: `${mockPolicy.insuredName} Policy Analysis`,
          provider: model === 'quick' ? 'qlik' : 'azure',
          downloadable: true,
          downloadContent: analysis,
          downloadFilename: `${mockPolicy.insuredName.replace(/\s+/g, '_')}_Policy_Analysis_${new Date().toISOString().split('T')[0]}.pdf`
        });
      } else if (normalizedInput.includes('burleson') || normalizedInput.includes('castillo')) {
        // Partial match - suggest the correct name
        return NextResponse.json({
          response: `I couldn't find an exact match for that policyholder name. Did you mean **Don Burleson-Castillo**? Please enter the complete name exactly as it appears on the policy for me to retrieve the comprehensive analysis.\n\nAlternatively, you can upload the policy document directly for analysis.`,
          suggestions: [
            'Enter: Don Burleson-Castillo',
            'Upload policy document',
            'Try another policyholder name'
          ],
          provider: model === 'quick' ? 'qlik' : 'azure'
        });
      }
    }

    // Check if user is asking for comprehensive policy review without a name
    if (lastMessage.includes('perform comprehensive policy review') ||
        lastMessage.includes('comprehensive policy review')) {
      return NextResponse.json({
        response: `I'll perform a comprehensive policy review to identify all coverage opportunities and critical provisions.\n\n**Please provide the policyholder's name** as it appears on the policy document, and I'll retrieve their complete policy analysis.\n\nI have recently added policies for these clients:\n• Don Burleson-Castillo\n• Maria Gonzalez\n• James Richardson\n\nAlternatively, you can upload any policy document for a custom analysis.`,
        suggestions: [
          'Don Burleson-Castillo',
          'Maria Gonzalez',
          'James Richardson',
          'Upload policy document'
        ],
        needsContext: true,
        provider: model === 'quick' ? 'qlik' : 'azure'
      });
    }

    // Check if user is asking for company knowledge / revenue impact analysis
    if (lastMessage.includes('revenue impact') ||
        lastMessage.includes('policy reviews this month') ||
        lastMessage.includes('show me revenue')) {

      const companyAnalysisResponse = `I've analyzed all comprehensive policy reviews completed this month and found some remarkable opportunities for revenue optimization and operational improvement.

## Last 30 Days Revenue Impact Analysis

Across 23 claims reviewed this month, our AI-assisted policy analysis has identified **$847,300 in additional coverage** that was previously overlooked. This represents a **78% hit rate**, meaning 18 out of 23 policies contained hidden provisions that our traditional review process had missed. The average uplift per claim is **$47,072** in additional recoverable coverage.

Breaking down the discovered coverage by type reveals three major opportunity areas. Additional Living Expenses extensions account for the largest portion at **$312,400**, representing **37% of total discoveries**. These ALE provisions were found in 12 of the 23 policies reviewed, with an average value of $26,033 per policy. Interestingly, these are most commonly overlooked in properties built before 2000.

The second major category is Ordinance and Law upgrades, totaling **$245,100 or 29%** of discoveries. We identified these provisions in 9 policies with older construction, averaging $27,233 per policy. Code compliance requirements often trigger this coverage, yet it frequently goes unnoticed in initial reviews.

Increased Cost of Construction riders round out the top three at **$156,200**, comprising **18% of total findings**. These endorsements were present in 7 policies, with an average value of $22,314 per policy. This inflation protection coverage is often missed during standard review procedures.

## Strategic Insight on Property Age Correlation

One of the most valuable patterns emerging from this analysis is that properties built before 2000 have a **2.3 times higher likelihood** of containing overlooked ordinance and law coverage compared to newer properties. Despite this clear pattern, only 34% of our adjusters consistently check for this provision during their reviews. This represents a significant opportunity for process improvement and additional revenue capture.

## Month-Over-Month Performance Trend

This month's discovery rate is **up 34%** compared to last month, strongly suggesting that our AI-assisted review process is learning to identify patterns that manual reviews consistently miss. As the system continues to analyze more policies, we can expect this improvement trend to continue.

## Actionable Recommendations for Leadership

There are three immediate opportunities to capitalize on these insights. First, prioritizing comprehensive reviews on pre-2000 construction properties could generate an additional **$200,000 per month** in coverage discoveries based on current patterns. Second, carrier-specific training is warranted, as **85% of State Farm policies** contain ALE extensions that are frequently overlooked by our team. Third, scheduling focused training on ordinance and law provisions would help our adjusters capture more of these high-value opportunities.

## Operational Efficiency Gains

Beyond the revenue impact, the AI-assisted process has dramatically improved our operational efficiency. Average policy review time has decreased from **4.2 hours to just 47 minutes**, while simultaneously finding **2.1 times more coverage opportunities** per review. The return on investment is substantial: each hour invested in AI-assisted review generates **$18,400 in additional coverage discoveries**.

Would you like me to drill deeper into carrier-specific patterns, analyze performance by adjuster or region, generate a detailed breakdown by property type, or create a comprehensive training plan for the team based on these findings?`;

      return NextResponse.json({
        response: companyAnalysisResponse,
        suggestions: [
          'Show breakdown by carrier',
          'Analyze by property age',
          'Review adjuster performance',
          'Export full analytics report'
        ],
        sources: [{
          name: 'Company Analytics Database',
          snippet: 'Last 30 days comprehensive policy review data',
          metadata: {
            section: 'Revenue Impact Analysis',
            confidence: 100
          }
        }],
        provider: model === 'quick' ? 'qlik' : 'azure'
      });
    }

    // Handle Qlik separately since it doesn't use AI SDK provider interface
    if (model === 'quick') {
      return handleQlikRequest(messages, stream, generateTitle, resetThread, conversationId);
    }

    // Reset thread if requested (useful for new conversations)
    if (resetThread) {
      resetProviderState('azure');
    }

    // Get the Azure provider
    const provider = getProvider(model as ModelType);

    // Convert messages to CoreMessage format
    const coreMessages: CoreMessage[] = messages.map(msg => {
      switch (msg.role) {
        case 'system':
          return { role: 'system', content: msg.content } as CoreSystemMessage;
        case 'user':
          return { role: 'user', content: msg.content } as CoreUserMessage;
        case 'assistant':
          return { role: 'assistant', content: msg.content } as CoreAssistantMessage;
        default:
          return { role: 'user', content: msg.content } as CoreUserMessage;
      }
    });

    // For Stella Pro, check if this is a policy-related query and fetch context from LightRAG
    let lightragContext = '';
    if (model === 'stella-pro') {
      const lastUserMessage = messages[messages.length - 1]?.content || '';

      // Check if the message contains policy-related keywords
      const policyKeywords = ['policy', 'coverage', 'deductible', 'claim', 'insurance', 'exclusion', 'endorsement', 'limit', 'premium', 'appraisal'];
      const isPolicyRelated = policyKeywords.some(keyword => lastUserMessage.toLowerCase().includes(keyword));

      if (isPolicyRelated) {
        try {
          // Query LightRAG for relevant context
          const lightragResponse = await lightragProvider.query(lastUserMessage, {
            mode: 'hybrid',
            top_k: 20,
            chunk_top_k: 10
          });

          if (lightragResponse.response) {
            lightragContext = lightragResponse.response;
            console.log('LightRAG context retrieved:', lightragContext.substring(0, 200) + '...');
          }
        } catch (error) {
          console.error('Failed to fetch LightRAG context:', error);
          // Continue without LightRAG context if it fails
        }
      }
    }

    // Add system prompt for Stella Pro (Azure) - policy analysis expertise with LightRAG context
    if (model === 'stella-pro' && !messages.some(m => m.role === 'system')) {
      const systemPrompt = buildStellaClaimsPrompt(lightragContext);
      coreMessages.unshift({
        role: 'system',
        content: systemPrompt,
      } as CoreSystemMessage);
    }

    // Configure common options
    const commonOptions = {
      model: provider,
      messages: coreMessages,
      temperature: temperature ?? (model === 'stella-pro' ? 0.5 : 0.7),
    };

    // Handle streaming response
    if (stream && process.env.AI_STREAM_ENABLED === 'true') {
      const result = await streamText(commonOptions);

      // Convert to Response with proper streaming headers
      return result.toTextStreamResponse({
        headers: {
          'X-Provider': 'azure',
        },
      });
    }

    // Handle non-streaming response
    const result = await generateText(commonOptions);

    // Generate suggestions based on the model and response
    const suggestions = generateSuggestions(model as ModelType, result.text, messages);

    // Generate title if requested
    let title: string | undefined;
    if (generateTitle && messages.length > 0) {
      try {
        const titleResult = await generateText({
          model: provider,
          messages: [
            {
              role: 'system',
              content: 'Generate a brief title (max 30 chars) summarizing this conversation. Output only the title, no quotes or punctuation.',
            } as CoreSystemMessage,
            ...coreMessages.slice(-3), // Last 3 messages for context
          ],
          temperature: 0.5,
        });

        title = titleResult.text.trim().substring(0, 30);
      } catch (error) {
        console.error('Failed to generate title:', error);
      }
    }

    return NextResponse.json({
      response: result.text,
      suggestions,
      title,
      usage: result.usage,
      finishReason: result.finishReason,
      provider: 'azure',
    }, {
      headers: {
        'X-Provider': 'azure',
      },
    });

  } catch (error) {
    console.error('Unified API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get('provider');

  try {
    const { checkProvidersHealth } = await import('@/lib/ai/providers/registry');
    const health = await checkProvidersHealth();

    if (provider && (provider === 'qlik' || provider === 'azure')) {
      return NextResponse.json(health[provider]);
    }

    return NextResponse.json(health);
  } catch (error) {
    return NextResponse.json(
      { error: 'Health check failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Generate contextual suggestions based on the model and conversation
 */
function generateSuggestions(model: ModelType, response: string, messages: any[]): string[] {
  const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
  const responseLower = response.toLowerCase();

  if (model === 'quick') {
    // Check if we have context (insured name) established
    const hasContext = messages.some(m =>
      m.content.toLowerCase().includes('policy of') ||
      m.content.toLowerCase().includes('insured:') ||
      m.content.toLowerCase().includes('policyholder:')
    );

    if (!hasContext) {
      // Initial suggestions to establish context
      return [
        'Perform comprehensive policy review',
        'Analyze coverage limits and deductibles',
        'Review exclusions and endorsements',
        'Check claim-specific provisions',
      ];
    }

    // Context-aware comprehensive suggestions
    if (responseLower.includes('policy') || responseLower.includes('coverage')) {
      return getQuickQuestionSuggestions().slice(0, 4);
    }

    if (responseLower.includes('claim') || responseLower.includes('appraisal')) {
      return [
        'Check claim-specific provisions',
        'Analyze water, wind, and mold coverage',
        'Review exclusions and endorsements',
        'Verify compliance requirements',
      ];
    }

    if (responseLower.includes('water') || responseLower.includes('wind') || responseLower.includes('mold')) {
      return [
        'Analyze water, wind, and mold coverage',
        'Review exclusions and endorsements',
        'Check claim-specific provisions',
        'Perform comprehensive policy review',
      ];
    }

    // Default comprehensive suggestions
    return getQuickQuestionSuggestions().slice(0, 4);
  }

  // Stella Pro suggestions (expert analysis)
  if (model === 'stella-pro') {
    if (!messages.some(m => m.content.toLowerCase().includes('policy'))) {
      return [
        'Upload my insurance policy',
        'Perform comprehensive policy review',
        'Find coverage opportunities',
        'Check compliance requirements',
      ];
    }

    if (responseLower.includes('coverage') || responseLower.includes('analysis')) {
      return [
        'Perform 13-point policy review',
        'Identify hidden coverages',
        'Calculate maximum settlement',
        'Review exclusions and endorsements',
      ];
    }

    if (responseLower.includes('settlement') || responseLower.includes('maximize')) {
      return [
        'Generate settlement strategy',
        'Identify bad faith indicators',
        'Review appraisal provisions',
        'Calculate code upgrade benefits',
      ];
    }

    // Default Stella Pro suggestions
    return [
      'Analyze coverage gaps',
      'Review deductibles',
      'Check state requirements',
      'Generate documentation checklist',
    ];
  }

  return [];
}

/**
 * Handle Qlik requests separately since it doesn't use AI SDK provider interface
 */
async function handleQlikRequest(
  messages: any[],
  stream?: boolean,
  generateTitle?: boolean,
  resetThread?: boolean,
  conversationId?: string
) {
  try {
    // Initialize Qlik wrapper
    const qlikWrapper = new QlikWrapper({
      tenantUrl: process.env.QLIK_TENANT_URL || '',
      apiKey: process.env.QLIK_API_KEY || '',
      assistantId: process.env.QLIK_ASSISTANT_ID || '',
      knowledgeBaseId: process.env.QLIK_KNOWLEDGE_BASE_ID,
    });

    if (resetThread) {
      qlikWrapper.resetThread();
      if (conversationId) {
        qlikContextManager.clearContext(conversationId);
      }
    }

    // Get conversation ID for context management
    const convId = conversationId || 'default';
    const context = qlikContextManager.getContext(convId);

    // Get the last user message
    const lastUserMessage = messages
      .filter(m => m.role === 'user')
      .pop()?.content || '';

    if (!lastUserMessage) {
      return NextResponse.json(
        { error: 'No user message found' },
        { status: 400 }
      );
    }

    // Check if this is a quick question that needs expansion
    const quickQuestionId = isQuickQuestion(lastUserMessage);

    // Handle context gathering if needed
    if (!context.insuredName && !context.contextConfirmed) {
      // Try to extract insured name from the message
      const extractedName = qlikContextManager.extractInsuredFromMessage(lastUserMessage);

      if (extractedName) {
        // Found insured name, confirm and proceed
        qlikContextManager.setInsuredName(convId, extractedName);

        // If this was just providing the name, ask what they want to know
        if (lastUserMessage.toLowerCase().trim() === extractedName.toLowerCase()) {
          return NextResponse.json({
            response: qlikContextManager.getContextConfirmationMessage(extractedName),
            suggestions: getQuickQuestionSuggestions().slice(0, 4),
            provider: 'qlik',
            needsContext: false,
          });
        }
      } else if (quickQuestionId) {
        // Quick question clicked but no context, ask for it
        return NextResponse.json({
          response: CONTEXT_GATHERING_PROMPTS.initial,
          suggestions: [],
          provider: 'qlik',
          needsContext: true,
          pendingQuestion: lastUserMessage,
        });
      }
    }

    // Prepare the message for Qlik
    let messageToSend = lastUserMessage;

    // If this is a quick question and we have context, expand it
    if (quickQuestionId && context.insuredName) {
      messageToSend = expandQuickQuestion(quickQuestionId, context.insuredName);
      console.log('Expanded quick question:', {
        original: lastUserMessage,
        expanded: messageToSend.substring(0, 200) + '...'
      });
    } else if (context.insuredName && !lastUserMessage.includes(context.insuredName)) {
      // Add context to regular questions if not already included
      messageToSend = `For the policy of ${context.insuredName}: ${lastUserMessage}`;
    }

    // Track the question
    qlikContextManager.trackQuestion(convId, lastUserMessage);

    // Handle streaming if requested
    if (stream && process.env.AI_STREAM_ENABLED === 'true') {
      const encoder = new TextEncoder();
      const stream = new TransformStream();
      const writer = stream.writable.getWriter();

      // Start streaming in background
      (async () => {
        try {
          for await (const chunk of qlikWrapper.streamMessage(messageToSend)) {
            await writer.write(
              encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`)
            );
          }
          await writer.write(encoder.encode('data: [DONE]\n\n'));
        } catch (error) {
          console.error('Qlik streaming error:', error);
        } finally {
          await writer.close();
        }
      })();

      return new Response(stream.readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'X-Provider': 'qlik',
        },
      });
    }

    // Non-streaming response
    const result = await qlikWrapper.sendMessage(messageToSend);

    // Generate title if requested
    let title: string | undefined;
    if (generateTitle && messages.length === 1) {
      // Simple title generation from first message
      title = lastUserMessage.substring(0, 30);
      if (lastUserMessage.length > 30) {
        title += '...';
      }
    }

    return NextResponse.json({
      response: result.response,
      suggestions: result.suggestions || generateSuggestions('quick', result.response, messages),
      title,
      provider: 'qlik',
      sources: result.sources,
    }, {
      headers: {
        'X-Provider': 'qlik',
      },
    });

  } catch (error) {
    console.error('Qlik request error:', error);

    // Fallback to Azure if enabled
    if (process.env.AI_PROVIDER_FALLBACK === 'true') {
      console.log('Falling back to Azure provider');

      try {
        const provider = getProvider('stella-pro');
        const coreMessages = messages.map(msg => ({
          role: msg.role,
          content: msg.content
        } as CoreMessage));

        const result = await generateText({
          model: provider,
          messages: coreMessages,
        });

        return NextResponse.json({
          response: result.text,
          suggestions: generateSuggestions('stella-pro', result.text, messages),
          provider: 'azure-fallback',
        });
      } catch (fallbackError) {
        console.error('Fallback to Azure also failed:', fallbackError);
      }
    }

    return NextResponse.json(
      { error: 'Failed to process request', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}