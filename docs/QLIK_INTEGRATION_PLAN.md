# Qlik Answers Assistant Integration Plan - AI SDK v5

## Executive Summary
This document outlines the comprehensive plan to integrate Qlik Answers Assistant as an alternative AI provider alongside the existing Azure-based Stella Pro assistant. The integration leverages **Vercel AI SDK v5** (already installed: `^5.0.39`) to enable seamless provider switching through the existing dropdown interface in the assistant page.

**Date**: September 22, 2025
**AI SDK Version**: v5.0.39 (Latest)

## Project Scope

### Objectives
1. Integrate Qlik Answers Assistant as the "Quick" option in the assistant dropdown
2. Maintain Azure OpenAI as the "Stella Pro" option for expert policy analysis
3. Implement provider abstraction using **AI SDK v5** patterns
4. Enable type-safe, streaming-first chat experiences
5. Maintain consistent user experience across both providers

### Current System Analysis

#### Existing Architecture
- **Frontend Component**: `MobileChatInterface` with model selector dropdown
  - Location: `/components/mobile-chat-interface.tsx`
  - Current options: Quick and Stella Pro (lines 124-127)
  - Direct API calls without AI SDK hooks

- **Current API Endpoint**: `/api/stella-claims/chat`
  - Direct Azure OpenAI integration
  - No AI SDK abstraction
  - Manual response handling

- **AI SDK Status**: v5.0.39 installed but not utilized

## AI SDK v5 Integration Architecture

### High-Level Design with AI SDK v5

```
┌─────────────────────────────────────────────┐
│     Frontend - AI SDK v5 React Hooks        │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │  useChat() with Type-Safe Messages     │ │
│  │  - Custom message types                │ │
│  │  - Automatic streaming                 │ │
│  │  - Built-in error handling             │ │
│  └────────────────────────────────────────┘ │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│    AI SDK v5 Unified API Layer              │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │  streamText() / generateText()         │ │
│  │  - Provider abstraction                │ │
│  │  - Type-safe tool calls                │ │
│  │  - Automatic retries                   │ │
│  └────────────────────────────────────────┘ │
└─────────────────┬───────────────────────────┘
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
┌───────────────┐   ┌───────────────┐
│ Qlik Provider │   │ Azure Provider│
│ Custom impl.  │   │ @ai-sdk/azure │
└───────────────┘   └───────────────┘
```

### AI SDK v5 Type-Safe Implementation

```typescript
// Custom message type for policy analysis
type PolicyMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: {
    policyId?: string;
    claimId?: string;
    provider?: 'qlik' | 'azure';
  };
  attachments?: {
    policyDocument?: File;
    images?: File[];
  };
};

// Type-safe streaming with AI SDK v5
import { streamText, CoreMessage } from 'ai';
import { createAzure } from '@ai-sdk/azure';

const result = await streamText<PolicyMessage>({
  model: provider,
  messages,
  maxTokens: 3000,
  temperature: 0.5,
  tools: {
    analyzeCoverage: {
      description: 'Analyze policy coverage',
      parameters: z.object({
        policyType: z.string(),
        coverageAreas: z.array(z.string())
      })
    }
  }
});
```

## Implementation Phases with AI SDK v5

### Phase 1: Foundation Setup (Day 1)

#### 1.1 Install AI SDK Provider Packages
```bash
npm install @ai-sdk/azure @ai-sdk/openai zod
```

#### 1.2 Environment Configuration
```env
# Qlik Configuration
QLIK_TENANT_URL=https://your-tenant.us.qlikcloud.com
QLIK_API_KEY=your-qlik-api-key
QLIK_ASSISTANT_ID=assistant-id
QLIK_KNOWLEDGE_BASE_ID=kb-id

# AI SDK v5 Provider Configuration
AI_PROVIDER_DEFAULT=azure
AI_PROVIDER_FALLBACK=true
AI_MAX_RETRIES=3
AI_STREAM_ENABLED=true
```

#### 1.3 Create Provider Registry with AI SDK v5
```typescript
// /lib/ai/providers/registry.ts
import { LanguageModel } from 'ai';
import { createAzure } from '@ai-sdk/azure';
import { QlikProvider } from './qlik-provider';

export const providers = {
  azure: createAzure({
    apiKey: process.env.AZURE_OPENAI_KEY,
    resourceName: 'diod-mevihjma-eastus2',
    apiVersion: '2024-12-01-preview'
  }),
  qlik: new QlikProvider({
    apiKey: process.env.QLIK_API_KEY,
    tenantUrl: process.env.QLIK_TENANT_URL
  })
};

export function getProvider(model: string): LanguageModel {
  switch (model) {
    case 'quick':
      return providers.qlik;
    case 'stella-pro':
      return providers.azure('gpt-4o-mini');
    default:
      throw new Error(`Unknown model: ${model}`);
  }
}
```

### Phase 2: Qlik Provider Implementation (Day 2-3)

#### 2.1 Create Custom Qlik Provider for AI SDK v5
```typescript
// /lib/ai/providers/qlik-provider.ts
import {
  LanguageModelV1,
  LanguageModelV1CallWarning,
  LanguageModelV1FinishReason,
  LanguageModelV1StreamPart
} from 'ai';

export class QlikProvider implements LanguageModelV1 {
  readonly specificationVersion = 'v1';
  readonly provider = 'qlik';
  readonly modelId: string;

  constructor(config: QlikConfig) {
    this.modelId = config.assistantId;
    // Initialize Qlik client
  }

  async doGenerate(options: LanguageModelV1CallOptions): Promise<{
    text: string;
    toolCalls?: LanguageModelV1ToolCall[];
    finishReason: LanguageModelV1FinishReason;
    usage: LanguageModelV1Usage;
  }> {
    // Implement Qlik API call with thread management
    const thread = await this.createThread();
    const response = await this.sendMessage(thread.id, options.prompt);

    return {
      text: response.answer,
      finishReason: 'stop',
      usage: {
        promptTokens: 0,
        completionTokens: 0
      }
    };
  }

  async doStream(options: LanguageModelV1CallOptions): AsyncIterable<LanguageModelV1StreamPart> {
    // Implement streaming with Qlik's SSE endpoint
    const thread = await this.createThread();
    const stream = await this.streamMessage(thread.id, options.prompt);

    for await (const chunk of stream) {
      yield {
        type: 'text-delta',
        textDelta: chunk.delta
      };
    }
  }
}
```

### Phase 3: Azure Provider Migration (Day 4)

#### 3.1 Migrate to AI SDK v5 Azure Provider
```typescript
// /lib/ai/providers/azure-setup.ts
import { createAzure } from '@ai-sdk/azure';

export const azureProvider = createAzure({
  apiKey: process.env.AZURE_OPENAI_KEY!,
  resourceName: 'diod-mevihjma-eastus2',
  apiVersion: '2024-12-01-preview'
});

// Model configurations
export const models = {
  'gpt-4o-mini': azureProvider('gpt-4o-mini'),
  'gpt-5-chat': azureProvider('gpt-5-chat-01')
};
```

### Phase 4: Unified API with AI SDK v5 (Day 5)

#### 4.1 Create Type-Safe Unified Endpoint
```typescript
// /app/api/assistant/unified/route.ts
import { streamText, generateText, CoreMessage } from 'ai';
import { getProvider } from '@/lib/ai/providers/registry';
import { z } from 'zod';

// Define request schema
const RequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string()
  })),
  model: z.enum(['quick', 'stella-pro']),
  stream: z.boolean().default(true)
});

export async function POST(req: Request) {
  const body = await req.json();
  const { messages, model, stream } = RequestSchema.parse(body);

  const provider = getProvider(model);

  if (stream) {
    // Use AI SDK v5 streaming
    const result = await streamText({
      model: provider,
      messages: messages as CoreMessage[],
      maxTokens: 3000,
      temperature: 0.5,
      tools: {
        analyzeCoverage: {
          description: 'Analyze insurance policy coverage',
          parameters: z.object({
            policyType: z.string(),
            coverageAreas: z.array(z.string())
          }),
          execute: async ({ policyType, coverageAreas }) => {
            // Tool implementation
            return { analysis: 'Coverage analysis results' };
          }
        }
      }
    });

    // Return AI SDK v5 stream
    return result.toDataStreamResponse();
  } else {
    // Non-streaming response
    const result = await generateText({
      model: provider,
      messages: messages as CoreMessage[],
      maxTokens: 3000
    });

    return Response.json({
      content: result.text,
      usage: result.usage,
      finishReason: result.finishReason
    });
  }
}
```

### Phase 5: Frontend Integration with AI SDK v5 Hooks (Day 6)

#### 5.1 Update MobileChatInterface with useChat Hook
```typescript
// /components/mobile-chat-interface.tsx
import { useChat } from 'ai/react';
import { useState } from 'react';

export default function MobileChatInterface() {
  const [selectedModel, setSelectedModel] = useState('quick');

  // Use AI SDK v5 useChat hook with type safety
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    reload,
    stop
  } = useChat({
    api: '/api/assistant/unified',
    body: {
      model: selectedModel
    },
    onFinish: (message) => {
      // Generate title or perform other actions
      console.log('Message completed:', message);
    },
    onError: (error) => {
      console.error('Chat error:', error);
    }
  });

  return (
    // Component JSX with AI SDK v5 integration
    <div>
      {/* Messages display */}
      {messages.map((message) => (
        <div key={message.id}>
          {message.role}: {message.content}
        </div>
      ))}

      {/* Input form */}
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          Send
        </button>
      </form>
    </div>
  );
}
```

### Phase 6: Advanced AI SDK v5 Features (Day 7)

#### 6.1 Implement Tool Calling
```typescript
// AI SDK v5 tool definitions
const tools = {
  searchKnowledgeBase: {
    description: 'Search Qlik knowledge base',
    parameters: z.object({
      query: z.string(),
      filters: z.object({
        documentType: z.enum(['policy', 'claim', 'regulation']).optional(),
        dateRange: z.object({
          start: z.string().optional(),
          end: z.string().optional()
        }).optional()
      }).optional()
    }),
    execute: async ({ query, filters }) => {
      // Implementation
      return await searchQlikKB(query, filters);
    }
  }
};
```

#### 6.2 Implement Structured Output
```typescript
// AI SDK v5 structured output with Zod
import { generateObject } from 'ai';
import { z } from 'zod';

const PolicyAnalysisSchema = z.object({
  coverageGaps: z.array(z.object({
    area: z.string(),
    severity: z.enum(['low', 'medium', 'high']),
    recommendation: z.string()
  })),
  maximumSettlement: z.number(),
  confidenceScore: z.number()
});

const analysis = await generateObject({
  model: provider,
  schema: PolicyAnalysisSchema,
  prompt: 'Analyze this insurance policy'
});
```

### Phase 7: Testing & Optimization (Day 8)

#### 7.1 Testing Suite
```typescript
// Tests for AI SDK v5 integration
describe('AI SDK v5 Provider Integration', () => {
  test('should switch between providers', async () => {
    const qlikResponse = await generateText({
      model: providers.qlik,
      prompt: 'Test query'
    });

    const azureResponse = await generateText({
      model: providers.azure('gpt-4o-mini'),
      prompt: 'Test query'
    });

    expect(qlikResponse).toBeDefined();
    expect(azureResponse).toBeDefined();
  });

  test('should handle streaming', async () => {
    const stream = await streamText({
      model: providers.qlik,
      messages: [{ role: 'user', content: 'Test' }]
    });

    const chunks = [];
    for await (const chunk of stream.textStream) {
      chunks.push(chunk);
    }

    expect(chunks.length).toBeGreaterThan(0);
  });
});
```

## File Structure with AI SDK v5

```
/lib/ai/
├── providers/
│   ├── registry.ts              # AI SDK v5 provider registry
│   ├── qlik-provider.ts         # Custom Qlik LanguageModelV1
│   ├── azure-setup.ts           # Azure provider config
│   └── types.ts                 # Type definitions
│
├── hooks/
│   ├── use-policy-chat.ts       # Custom hook extending useChat
│   └── use-assistant.ts         # Assistant-specific hooks
│
├── tools/
│   ├── coverage-analyzer.ts     # AI SDK v5 tool implementation
│   ├── knowledge-search.ts      # Knowledge base search tool
│   └── settlement-calculator.ts # Settlement calculation tool
│
└── schemas/
    ├── messages.ts              # Zod schemas for messages
    ├── responses.ts             # Response type schemas
    └── tools.ts                 # Tool parameter schemas

/app/api/
├── assistant/
│   ├── unified/
│   │   └── route.ts            # AI SDK v5 unified endpoint
│   ├── qlik/
│   │   └── route.ts            # Qlik-specific endpoint
│   └── azure/
│       └── route.ts            # Azure-specific endpoint
```

## AI SDK v5 Best Practices Implementation

### 1. Type Safety Throughout
```typescript
// Define custom types with AI SDK v5
type AssistantMessage = CoreMessage & {
  metadata?: {
    provider: 'qlik' | 'azure';
    threadId?: string;
    sources?: Source[];
  };
};
```

### 2. Error Handling
```typescript
// AI SDK v5 automatic retries and error handling
const result = await streamText({
  model: provider,
  messages,
  maxRetries: 3,
  abortSignal: controller.signal,
  onFinish: ({ text, usage, finishReason }) => {
    // Log metrics
    console.log('Token usage:', usage);
  }
});
```

### 3. Streaming-First Approach
```typescript
// AI SDK v5 streaming by default
const stream = await streamText({
  model: provider,
  messages,
  streamProtocol: 'data' // or 'text' for SSE
});

return stream.toDataStreamResponse();
```

### 4. Tool Execution
```typescript
// AI SDK v5 tool calling with type safety
const result = await generateText({
  model: provider,
  messages,
  toolChoice: 'auto', // or 'required' or specific tool
  tools: {
    searchPolicy: tool({
      description: 'Search policy database',
      parameters: z.object({
        query: z.string()
      }),
      execute: async ({ query }) => {
        return await searchPolicies(query);
      }
    })
  }
});
```

## Migration Strategy from Current Implementation

### Step 1: Parallel Development
1. Keep existing `/api/stella-claims/chat` endpoint
2. Build new AI SDK v5 endpoints alongside
3. Test thoroughly in development

### Step 2: Gradual Migration
1. Update MobileChatInterface to use AI SDK v5 hooks
2. Route "Quick" option to new Qlik provider
3. Migrate "Stella Pro" to AI SDK v5 Azure provider
4. Monitor performance and errors

### Step 3: Cleanup
1. Remove old direct API calls
2. Consolidate to AI SDK v5 patterns
3. Update all documentation

## Success Metrics

### Technical Metrics
- Response time < 2s for initial response
- Streaming latency < 100ms between chunks
- Provider switch time < 500ms
- Error rate < 0.1%
- Type safety coverage > 95%

### AI SDK v5 Specific Metrics
- Tool execution success rate > 99%
- Stream stability > 99.9%
- Automatic retry effectiveness > 95%
- Token usage optimization (tracked via AI SDK)

## Testing Plan

### Unit Tests
```typescript
// Test AI SDK v5 provider implementation
describe('Qlik Provider', () => {
  it('implements LanguageModelV1 interface', () => {
    const provider = new QlikProvider(config);
    expect(provider.specificationVersion).toBe('v1');
  });

  it('handles streaming correctly', async () => {
    const stream = await provider.doStream(options);
    // Test stream implementation
  });
});
```

### Integration Tests
```typescript
// Test full AI SDK v5 flow
describe('Chat Integration', () => {
  it('completes full chat cycle with Qlik', async () => {
    const { result } = renderHook(() => useChat({
      api: '/api/assistant/unified',
      body: { model: 'quick' }
    }));

    // Test chat interaction
  });
});
```

## Deliverables

1. **AI SDK v5 Integration**
   - Custom Qlik provider implementation
   - Azure provider configuration
   - Unified API endpoints
   - Type-safe message handling

2. **Frontend Updates**
   - useChat hook integration
   - Streaming UI components
   - Provider selection logic
   - Error handling UI

3. **Documentation**
   - API documentation with AI SDK v5 patterns
   - Provider configuration guide
   - Migration guide from direct API calls
   - Type definitions documentation

## Timeline

### Week 1 (Sept 22-28, 2025)
- Day 1: Foundation setup, provider packages
- Day 2-3: Qlik provider implementation
- Day 4: Azure provider migration
- Day 5: Unified API development

### Week 2 (Sept 29 - Oct 5, 2025)
- Day 6: Frontend integration
- Day 7: Advanced features
- Day 8: Testing and optimization
- Day 9-10: Documentation and deployment

## Next Steps

1. ✅ Confirm AI SDK v5 is installed (v5.0.39)
2. Install provider packages (@ai-sdk/azure)
3. Create Qlik provider implementation
4. Update frontend to use AI SDK v5 hooks
5. Test provider switching
6. Deploy to staging environment

---

*Document Version: 2.0*
*Last Updated: September 22, 2025*
*AI SDK Version: v5.0.39*
*Author: Stellar Development Team*