/**
 * LightRAG Provider
 * Integrates LightRAG knowledge base for policy analysis
 */

import { z } from 'zod';

const LIGHTRAG_API_URL = process.env.LIGHTRAG_API_URL || 'http://localhost:9621';
const LIGHTRAG_API_KEY = process.env.LIGHTRAG_API_KEY || 'LIGHTRAG-API-KEY';
const LIGHTRAG_WORKSPACE = process.env.LIGHTRAG_WORKSPACE || 'home_policies';

export interface LightRAGQueryOptions {
  mode?: 'naive' | 'local' | 'global' | 'hybrid' | 'mix' | 'bypass';
  stream?: boolean;
  top_k?: number;
  chunk_top_k?: number;
  only_need_context?: boolean;
  workspace?: string;
}

export interface LightRAGResponse {
  response?: string;
  references?: Array<{
    source: string;
    content: string;
    score?: number;
  }>;
  data?: any;
}

export class LightRAGProvider {
  private apiUrl: string;
  private apiKey: string;
  private workspace: string;

  constructor(apiUrl?: string, apiKey?: string, workspace?: string) {
    this.apiUrl = apiUrl || LIGHTRAG_API_URL;
    this.apiKey = apiKey || LIGHTRAG_API_KEY;
    this.workspace = workspace || LIGHTRAG_WORKSPACE;
  }

  /**
   * Query the LightRAG knowledge base
   */
  async query(
    query: string,
    options: LightRAGQueryOptions = {}
  ): Promise<LightRAGResponse> {
    const queryOptions = {
      query,
      mode: options.mode || 'hybrid',
      workspace: options.workspace || this.workspace,
      top_k: options.top_k || 30,
      chunk_top_k: options.chunk_top_k || 10,
      stream: false,
      only_need_context: options.only_need_context || false,
    };

    try {
      const response = await fetch(`${this.apiUrl}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        body: JSON.stringify(queryOptions),
      });

      if (!response.ok) {
        throw new Error(`LightRAG query failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('LightRAG query error:', error);
      throw error;
    }
  }

  /**
   * Query for context only (no LLM generation)
   */
  async getContext(
    query: string,
    options: Omit<LightRAGQueryOptions, 'only_need_context'> = {}
  ): Promise<string> {
    const response = await this.query(query, {
      ...options,
      only_need_context: true,
    });
    return response.response || '';
  }

  /**
   * Get structured data from the knowledge base
   */
  async queryData(
    query: string,
    options: LightRAGQueryOptions = {}
  ): Promise<any> {
    const queryOptions = {
      query,
      mode: options.mode || 'hybrid',
      workspace: options.workspace || this.workspace,
      top_k: options.top_k || 30,
      chunk_top_k: options.chunk_top_k || 10,
    };

    try {
      const response = await fetch(`${this.apiUrl}/query/data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        body: JSON.stringify(queryOptions),
      });

      if (!response.ok) {
        throw new Error(`LightRAG data query failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('LightRAG data query error:', error);
      throw error;
    }
  }

  /**
   * Stream query response
   */
  async *streamQuery(
    query: string,
    options: Omit<LightRAGQueryOptions, 'stream'> = {}
  ): AsyncGenerator<string, void, unknown> {
    const queryOptions = {
      query,
      mode: options.mode || 'hybrid',
      workspace: options.workspace || this.workspace,
      top_k: options.top_k || 30,
      chunk_top_k: options.chunk_top_k || 10,
      stream: true,
    };

    try {
      const response = await fetch(`${this.apiUrl}/query/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        body: JSON.stringify(queryOptions),
      });

      if (!response.ok) {
        throw new Error(`LightRAG stream query failed: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              if (data.response) {
                yield data.response;
              }
            } catch (e) {
              console.error('Failed to parse streaming response:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('LightRAG stream query error:', error);
      throw error;
    }
  }

  /**
   * Get documents from the knowledge base
   */
  async getDocuments(workspace?: string): Promise<any> {
    try {
      const url = workspace
        ? `${this.apiUrl}/documents?workspace=${encodeURIComponent(workspace)}`
        : `${this.apiUrl}/documents`;

      const response = await fetch(url, {
        headers: {
          'X-API-Key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get documents: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get documents:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const lightragProvider = new LightRAGProvider();