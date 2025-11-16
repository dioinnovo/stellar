/**
 * Streaming Conversation Agent
 * 
 * Implements real-time streaming with LangChain following best practices
 * Designed to work with both text and voice modalities
 */

import { AIMessage, BaseMessage, HumanMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { IterableReadableStream } from '@langchain/core/utils/stream';
import { MasterOrchestratorState } from '../orchestrator/state';

/**
 * Streaming response handler for real-time conversations
 */
export class StreamingConversationHandler {
  private model: ChatOpenAI;
  
  constructor() {
    // Initialize with streaming enabled
    this.model = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-4o-mini',
      streaming: true, // Enable streaming
      temperature: 0.8,
      maxTokens: 500,
    });
  }

  /**
   * Stream a response for real-time conversation
   * Returns an async iterator for token-by-token streaming
   */
  async *streamResponse(
    messages: BaseMessage[],
    onPartialResponse?: (partial: string) => void
  ): AsyncGenerator<string, void, unknown> {
    try {
      // Stream the response
      const stream = await this.model.stream(messages);
      
      let fullResponse = '';
      
      for await (const chunk of stream) {
        const content = chunk.content.toString();
        if (content) {
          fullResponse += content;
          
          // Emit partial response for real-time updates
          if (onPartialResponse) {
            onPartialResponse(fullResponse);
          }
          
          // Yield each chunk for streaming
          yield content;
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
      yield 'I apologize, but I encountered an error. Please try again.';
    }
  }

  /**
   * Process streaming events with detailed tracking
   * Useful for debugging and fine-grained control
   */
  async processStreamingEvents(
    messages: BaseMessage[],
    callbacks: {
      onToken?: (token: string) => void;
      onPartial?: (partial: string) => void;
      onComplete?: (full: string) => void;
      onError?: (error: Error) => void;
    }
  ): Promise<void> {
    try {
      const eventStream = this.model.streamEvents(messages, {
        version: 'v2',
      });

      let accumulatedResponse = '';

      for await (const event of eventStream) {
        if (event.event === 'on_llm_stream') {
          const token = event.data?.chunk?.content;
          if (token) {
            accumulatedResponse += token;
            callbacks.onToken?.(token);
            callbacks.onPartial?.(accumulatedResponse);
          }
        } else if (event.event === 'on_llm_end') {
          callbacks.onComplete?.(accumulatedResponse);
        }
      }
    } catch (error) {
      console.error('Event streaming error:', error);
      callbacks.onError?.(error as Error);
    }
  }

  /**
   * Handle interruptions during streaming
   * Cancels current stream and starts new one
   */
  async handleInterruption(
    currentStream: IterableReadableStream<any> | null,
    newMessage: string,
    messages: BaseMessage[]
  ): Promise<IterableReadableStream<any>> {
    // Cancel current stream if exists
    if (currentStream) {
      try {
        await currentStream.cancel();
      } catch (e) {
        // Stream might already be consumed
      }
    }

    // Add interruption message to history
    const updatedMessages = [
      ...messages,
      new HumanMessage(newMessage)
    ];

    // Start new stream
    return await this.model.stream(updatedMessages);
  }
}

/**
 * Integration with voice realtime API
 * Bridges streaming LLM responses with voice synthesis
 */
export class VoiceStreamingBridge {
  private handler: StreamingConversationHandler;
  private textBuffer: string = '';
  private sentenceEndRegex = /[.!?]+\s*/g;
  
  constructor() {
    this.handler = new StreamingConversationHandler();
  }

  /**
   * Stream text responses and convert to voice-ready chunks
   * Optimized for natural speech patterns
   */
  async *streamForVoice(
    messages: BaseMessage[],
    onSentenceComplete?: (sentence: string) => void
  ): AsyncGenerator<string, void, unknown> {
    const stream = this.handler.streamResponse(messages);
    
    for await (const chunk of stream) {
      this.textBuffer += chunk;
      
      // Check for complete sentences
      const sentences = this.extractCompleteSentences();
      
      for (const sentence of sentences) {
        if (onSentenceComplete) {
          onSentenceComplete(sentence);
        }
        yield sentence;
      }
    }
    
    // Yield any remaining text
    if (this.textBuffer.trim()) {
      yield this.textBuffer;
      this.textBuffer = '';
    }
  }

  /**
   * Extract complete sentences from buffer
   */
  private extractCompleteSentences(): string[] {
    const sentences: string[] = [];
    let match;
    let lastIndex = 0;

    while ((match = this.sentenceEndRegex.exec(this.textBuffer)) !== null) {
      sentences.push(this.textBuffer.slice(lastIndex, match.index + match[0].length));
      lastIndex = match.index + match[0].length;
    }

    // Update buffer to keep only incomplete sentence
    if (lastIndex > 0) {
      this.textBuffer = this.textBuffer.slice(lastIndex);
    }

    return sentences;
  }
}

/**
 * Streaming conversation node for LangGraph integration
 * Replaces the standard conversation node with streaming capability
 */
export async function* streamingConversationNode(
  state: MasterOrchestratorState
): AsyncGenerator<Partial<MasterOrchestratorState>, void, unknown> {
  const handler = new StreamingConversationHandler();
  
  // Get conversation history
  const messages = state.messages;
  
  // Check for user message
  const lastMessage = messages[messages.length - 1];
  if (!lastMessage || lastMessage._getType() !== 'human') {
    return;
  }

  // Stream the response
  let fullResponse = '';
  const responseChunks: string[] = [];
  
  // Stream tokens and yield state updates
  const stream = handler.streamResponse(messages, (partial) => {
    fullResponse = partial;
  });

  for await (const chunk of stream) {
    responseChunks.push(chunk);
    
    // Yield incremental state update
    yield {
      currentPhase: 'discovery',
    };
  }

  // Final state update with complete message
  yield {
    messages: [new AIMessage(fullResponse)],
    currentPhase: 'discovery',
  };
}

// Export for use in orchestrator
export const streamingHandler = new StreamingConversationHandler();
export const voiceBridge = new VoiceStreamingBridge();