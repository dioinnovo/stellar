/**
 * Simplified Qlik Provider Wrapper
 * Works directly with Qlik API without AI SDK provider interface
 */

import { QlikConfig } from './types';

export class QlikWrapper {
  private config: QlikConfig;
  private currentThreadId?: string;

  constructor(config: QlikConfig) {
    this.config = config;
  }

  private get baseUrl(): string {
    const url = this.config.tenantUrl;
    return url.endsWith('/') ? url.slice(0, -1) : url;
  }

  private get headers() {
    return {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async createThread(): Promise<string> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/assistants/${this.config.assistantId}/threads`,
        {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify({
            name: `Thread-${Date.now()}`, // Required thread name
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create thread: ${response.status} - ${error}`);
      }

      const data = await response.json();
      this.currentThreadId = data.id;
      return data.id;
    } catch (error) {
      console.error('Error creating Qlik thread:', error);
      throw error;
    }
  }

  async ensureThread(): Promise<string> {
    if (!this.currentThreadId) {
      this.currentThreadId = await this.createThread();
    }
    return this.currentThreadId;
  }

  async sendMessage(message: string): Promise<{
    response: string;
    sources?: any[];
    suggestions?: string[];
  }> {
    const threadId = await this.ensureThread();

    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/assistants/${this.config.assistantId}/threads/${threadId}/actions/invoke`,
        {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify({
            input: {
              prompt: message,
              promptType: 'thread',
              includeText: true,
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Qlik API error: ${response.status} - ${error}`);
      }

      const data = await response.json();

      // Log the full response to understand its structure
      console.log('Qlik API full response:', JSON.stringify(data, null, 2));

      // Clean up any encoding issues in the response
      const cleanResponse = this.cleanEncodingIssues(data.output || data.answer || 'No response from Qlik');

      // Parse sources from Qlik response with comprehensive field mapping
      const rawSources = data.sources || data.citations || data.references || data.chunks || [];
      const parsedSources = this.parseQlikSources(rawSources, data);

      // Log sources structure if present
      if (parsedSources && parsedSources.length > 0) {
        console.log('Parsed sources for UI:', parsedSources);
      }

      return {
        response: cleanResponse,
        sources: parsedSources,
        suggestions: data.followups || data.suggestions,
      };
    } catch (error) {
      console.error('Error calling Qlik API:', error);
      throw error;
    }
  }

  /**
   * Parse Qlik sources into a consistent format for the UI
   */
  private parseQlikSources(rawSources: any[], fullResponse: any): any[] {
    if (!rawSources || rawSources.length === 0) {
      // Check if sources might be embedded in the response differently
      if (fullResponse.knowledgebaseResults) {
        return this.parseKnowledgebaseResults(fullResponse.knowledgebaseResults);
      }
      return [];
    }

    return rawSources.map((source: any, index: number) => {
      // Handle different source structures from Qlik
      const parsedSource: any = {
        id: source.id || source.chunkId || `source-${index}`,
        // Extract document title/name from various possible fields
        documentTitle: this.extractDocumentTitle(source),
        // Get the actual source text
        text: source.text || source.content || source.snippet || source.chunk || '',
        // Build comprehensive metadata
        metadata: {
          // Document-level metadata
          documentId: source.documentId || source.datasourceId || source.sourceId,
          documentName: source.documentName || source.fileName || source.source || 'Unknown Document',
          documentType: source.documentType || source.fileType || this.inferDocumentType(source),
          // Location metadata
          page: source.page || source.pageNumber,
          section: source.section || source.heading,
          paragraph: source.paragraph,
          // Relevance metadata
          confidence: source.confidence || source.score || source.relevance,
          matchType: source.matchType || 'semantic',
          // Knowledge base metadata
          knowledgebaseId: source.knowledgebaseId || fullResponse.knowledgebaseId,
          datasourceId: source.datasourceId,
          chunkId: source.chunkId,
          // Additional context
          url: source.url || source.link,
          lastModified: source.lastModified || source.updatedAt,
        },
        // Include any chunks for expandable view
        chunks: source.chunks || (source.text ? [{ chunkId: source.chunkId, text: source.text }] : [])
      };

      // Clean up undefined values
      Object.keys(parsedSource.metadata).forEach(key => {
        if (parsedSource.metadata[key] === undefined) {
          delete parsedSource.metadata[key];
        }
      });

      return parsedSource;
    });
  }

  /**
   * Parse knowledge base results format
   */
  private parseKnowledgebaseResults(results: any): any[] {
    if (!results || !Array.isArray(results)) return [];

    return results.map((result: any, index: number) => ({
      id: result.id || `kb-result-${index}`,
      documentTitle: result.title || result.documentName || 'Knowledge Base Result',
      text: result.text || result.content || '',
      metadata: {
        documentId: result.documentId,
        documentName: result.documentName || result.title,
        confidence: result.score || result.relevance,
        knowledgebaseId: result.knowledgebaseId,
      }
    }));
  }

  /**
   * Extract document title from various possible source fields
   */
  private extractDocumentTitle(source: any): string {
    // Try different field combinations that might contain the title
    const possibleTitles = [
      source.documentTitle,
      source.title,
      source.documentName,
      source.fileName,
      source.name,
      source.source,
      // If it's a file path, extract just the filename
      source.filePath?.split('/').pop()?.split('\\').pop(),
      source.path?.split('/').pop()?.split('\\').pop(),
    ].filter(Boolean);

    if (possibleTitles.length > 0) {
      // Clean up the title (remove file extensions if present)
      let title = possibleTitles[0];

      // If it looks like a filename with extension, make it more readable
      if (title.includes('.')) {
        const parts = title.split('.');
        const ext = parts.pop();
        const name = parts.join('.');

        // Convert common separators to spaces for readability
        const readableName = name
          .replace(/[-_]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        // Capitalize first letter of each word
        const capitalizedName = readableName
          .split(' ')
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');

        return `${capitalizedName} (${ext?.toUpperCase()})`;
      }

      return title;
    }

    // Fallback to generic title
    return 'Policy Document';
  }

  /**
   * Infer document type from available fields
   */
  private inferDocumentType(source: any): string {
    const fileName = source.fileName || source.name || source.source || '';
    const extension = fileName.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'pdf':
        return 'PDF Document';
      case 'doc':
      case 'docx':
        return 'Word Document';
      case 'txt':
        return 'Text File';
      case 'html':
        return 'Web Page';
      default:
        return source.type || 'Document';
    }
  }

  async *streamMessage(message: string): AsyncGenerator<string> {
    const threadId = await this.ensureThread();

    const response = await fetch(
      `${this.baseUrl}/api/v1/assistants/${this.config.assistantId}/threads/${threadId}/actions/stream`,
      {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          input: {
            prompt: message,
            promptType: 'thread',
            includeText: true,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Qlik streaming failed: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body available for streaming');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              return;
            }

            try {
              const chunk = JSON.parse(data);
              if (chunk.delta) {
                yield this.cleanEncodingIssues(chunk.delta);
              } else if (chunk.text) {
                yield this.cleanEncodingIssues(chunk.text);
              }
            } catch (e) {
              console.error('Error parsing SSE chunk:', e);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Clean up common encoding issues in text
   */
  private cleanEncodingIssues(text: string): string {
    // Common UTF-8 encoding replacements
    const replacements: { [key: string]: string } = {
      'â€™': "'",  // Right single quote
      'â€œ': '"',  // Left double quote
      'â€': '"',   // Right double quote
      'â€"': '—',  // Em dash
      'Â': '',     // Non-breaking space artifact
      'â€¦': '...',// Ellipsis
      'â€‚': ' ',  // En space
      'â€ƒ': ' ',  // Em space
      'â€‰': ' ',  // Thin space
      'â€Š': ' ',  // Hair space
      'â€¯': ' ',  // Figure space
      'Ã©': 'é',   // e with acute
      'Ã¨': 'è',   // e with grave
      'Ã¢': 'â',   // a with circumflex
      'Ã ': 'à',   // a with grave
      'Ã§': 'ç',   // c with cedilla
      'Ãª': 'ê',   // e with circumflex
      'Ã´': 'ô',   // o with circumflex
      'Ã®': 'î',   // i with circumflex
      'Ã¹': 'ù',   // u with grave
      'Ã»': 'û',   // u with circumflex
    };

    let cleaned = text;
    for (const [bad, good] of Object.entries(replacements)) {
      cleaned = cleaned.split(bad).join(good);
    }

    // Remove any remaining non-printable characters
    cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    // Fix multiple spaces
    cleaned = cleaned.replace(/\s+/g, ' ');

    return cleaned.trim();
  }

  resetThread(): void {
    this.currentThreadId = undefined;
  }

  async health(): Promise<{ status: 'healthy' | 'unhealthy'; latency?: number }> {
    const startTime = Date.now();

    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/assistants/${this.config.assistantId}`,
        {
          method: 'GET',
          headers: this.headers,
        }
      );

      const latency = Date.now() - startTime;

      if (response.ok) {
        return { status: 'healthy', latency };
      }

      return { status: 'unhealthy', latency };
    } catch (error) {
      console.error('Qlik health check failed:', error);
      return { status: 'unhealthy' };
    }
  }
}