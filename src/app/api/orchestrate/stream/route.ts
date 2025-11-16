/**
 * Streaming Orchestration with Vercel AI SDK
 * 
 * Enhanced streaming using AI SDK patterns for real-time conversation
 * Follows best practices from Vercel's LangChain template
 */

import { NextRequest } from 'next/server';
import { streamText } from 'ai';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, AIMessage, BaseMessage } from '@langchain/core/messages';
import { masterOrchestrator } from '@/lib/orchestrator/master';
import { buildMasterOrchestrator } from '@/lib/orchestrator/master';

// Export runtime for edge support
export const runtime = 'edge';

/**
 * Stream conversation responses using Vercel AI SDK
 */
export async function POST(request: NextRequest) {
  try {
    const { message, sessionId, conversationType, voiceProfile } = await request.json();
    
    if (!message || !sessionId) {
      return new Response('Missing required fields', { status: 400 });
    }

    // Get or create session with orchestrator
    let session = masterOrchestrator.getSession(sessionId);
    if (!session) {
      session = await masterOrchestrator.startSession(
        sessionId,
        conversationType || 'chat',
        message
      );
    }

    // Create the orchestrator graph
    const graph = buildMasterOrchestrator();
    
    // Add user message to state
    const updatedState = {
      ...session,
      messages: [...session.messages, new HumanMessage(message)]
    };

    // Stream events from the graph
    const eventStream = graph.streamEvents(updatedState, {
      version: 'v1'
    });

    // Convert LangGraph stream to readable stream for AI SDK
    const textEncoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of eventStream) {
            if (event.event === 'on_llm_stream' && event.data?.chunk?.content) {
              controller.enqueue(textEncoder.encode(event.data.chunk.content));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });
    
    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Session-Id': sessionId,
        'X-Voice-Profile': voiceProfile || 'default',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });
  } catch (error) {
    console.error('Streaming error:', error);
    return new Response('Streaming failed', { status: 500 });
  }
}