/**
 * Monitoring and Observability System for LangGraph Orchestrator
 * 
 * Features:
 * - Structured logging with correlation IDs
 * - Performance metrics tracking
 * - Error monitoring and alerting
 * - Agent execution analytics
 * - Conversation flow visualization
 */

import { BaseMessage } from '@langchain/core/messages';
import { MasterOrchestratorState } from './state';

/**
 * Log levels for structured logging
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * Structured log entry
 */
interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  correlationId: string;
  sessionId?: string;
  agent?: string;
  event: string;
  message: string;
  data?: any;
  duration?: number;
  error?: Error;
}

/**
 * Performance metrics
 */
interface PerformanceMetrics {
  agentExecutions: Map<string, {
    count: number;
    totalDuration: number;
    avgDuration: number;
    errors: number;
    lastExecution: Date;
  }>;
  sessionMetrics: Map<string, {
    startTime: Date;
    endTime?: Date;
    messageCount: number;
    agentCalls: number;
    qualificationScore?: number;
    converted: boolean;
  }>;
  systemMetrics: {
    totalSessions: number;
    activeSessions: number;
    totalMessages: number;
    avgSessionDuration: number;
    conversionRate: number;
    errorRate: number;
  };
}

/**
 * Monitoring class for comprehensive observability
 */
export class LangGraphMonitor {
  private logs: LogEntry[] = [];
  private metrics: PerformanceMetrics = {
    agentExecutions: new Map(),
    sessionMetrics: new Map(),
    systemMetrics: {
      totalSessions: 0,
      activeSessions: 0,
      totalMessages: 0,
      avgSessionDuration: 0,
      conversionRate: 0,
      errorRate: 0,
    },
  };
  
  private correlationIds = new Map<string, string>();
  private maxLogsInMemory = 10000;
  private metricsUpdateInterval: NodeJS.Timeout | null = null;
  
  constructor() {
    // Start metrics aggregation
    this.startMetricsAggregation();
  }
  
  /**
   * Generate correlation ID for request tracing
   */
  generateCorrelationId(sessionId: string): string {
    const correlationId = `${sessionId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.correlationIds.set(sessionId, correlationId);
    return correlationId;
  }
  
  /**
   * Get correlation ID for session
   */
  getCorrelationId(sessionId: string): string {
    return this.correlationIds.get(sessionId) || this.generateCorrelationId(sessionId);
  }
  
  /**
   * Log structured event
   */
  log(entry: Omit<LogEntry, 'timestamp'>): void {
    const logEntry: LogEntry = {
      ...entry,
      timestamp: new Date(),
    };
    
    // Add to in-memory logs
    this.logs.push(logEntry);
    
    // Trim logs if exceeding limit
    if (this.logs.length > this.maxLogsInMemory) {
      this.logs = this.logs.slice(-this.maxLogsInMemory);
    }
    
    // Output based on level
    switch (logEntry.level) {
      case LogLevel.DEBUG:
        console.debug(`[${logEntry.correlationId}] ${logEntry.message}`, logEntry.data);
        break;
      case LogLevel.INFO:
        console.log(`[${logEntry.correlationId}] ${logEntry.message}`, logEntry.data);
        break;
      case LogLevel.WARN:
        console.warn(`[${logEntry.correlationId}] ${logEntry.message}`, logEntry.data);
        break;
      case LogLevel.ERROR:
        console.error(`[${logEntry.correlationId}] ${logEntry.message}`, logEntry.error || logEntry.data);
        break;
      case LogLevel.CRITICAL:
        console.error(`🚨 CRITICAL [${logEntry.correlationId}] ${logEntry.message}`, logEntry.error || logEntry.data);
        // Could trigger alerts here
        break;
    }
    
    // Update error metrics
    if (logEntry.level === LogLevel.ERROR || logEntry.level === LogLevel.CRITICAL) {
      this.updateErrorMetrics(logEntry);
    }
  }
  
  /**
   * Track agent execution
   */
  trackAgentExecution(
    sessionId: string,
    agentName: string,
    startTime: Date,
    endTime: Date,
    success: boolean,
    error?: Error
  ): void {
    const duration = endTime.getTime() - startTime.getTime();
    const correlationId = this.getCorrelationId(sessionId);
    
    // Log execution
    this.log({
      level: success ? LogLevel.INFO : LogLevel.ERROR,
      correlationId,
      sessionId,
      agent: agentName,
      event: 'agent_execution',
      message: `Agent ${agentName} ${success ? 'completed' : 'failed'} in ${duration}ms`,
      duration,
      error,
    });
    
    // Update metrics
    const agentMetrics = this.metrics.agentExecutions.get(agentName) || {
      count: 0,
      totalDuration: 0,
      avgDuration: 0,
      errors: 0,
      lastExecution: new Date(),
    };
    
    agentMetrics.count++;
    agentMetrics.totalDuration += duration;
    agentMetrics.avgDuration = agentMetrics.totalDuration / agentMetrics.count;
    agentMetrics.lastExecution = endTime;
    if (!success) agentMetrics.errors++;
    
    this.metrics.agentExecutions.set(agentName, agentMetrics);
  }
  
  /**
   * Track session lifecycle
   */
  trackSession(sessionId: string, event: 'start' | 'end' | 'message' | 'qualify' | 'convert'): void {
    const correlationId = this.getCorrelationId(sessionId);
    
    let sessionMetric = this.metrics.sessionMetrics.get(sessionId);
    
    switch (event) {
      case 'start':
        sessionMetric = {
          startTime: new Date(),
          messageCount: 0,
          agentCalls: 0,
          converted: false,
        };
        this.metrics.sessionMetrics.set(sessionId, sessionMetric);
        this.metrics.systemMetrics.totalSessions++;
        this.metrics.systemMetrics.activeSessions++;
        
        this.log({
          level: LogLevel.INFO,
          correlationId,
          sessionId,
          event: 'session_start',
          message: `New session started: ${sessionId}`,
        });
        break;
        
      case 'end':
        if (sessionMetric) {
          sessionMetric.endTime = new Date();
          this.metrics.systemMetrics.activeSessions--;
          
          const duration = sessionMetric.endTime.getTime() - sessionMetric.startTime.getTime();
          this.log({
            level: LogLevel.INFO,
            correlationId,
            sessionId,
            event: 'session_end',
            message: `Session ended: ${sessionId}`,
            duration,
            data: {
              messageCount: sessionMetric.messageCount,
              agentCalls: sessionMetric.agentCalls,
              converted: sessionMetric.converted,
            },
          });
        }
        break;
        
      case 'message':
        if (sessionMetric) {
          sessionMetric.messageCount++;
          this.metrics.systemMetrics.totalMessages++;
        }
        break;
        
      case 'qualify':
        this.log({
          level: LogLevel.INFO,
          correlationId,
          sessionId,
          event: 'lead_qualified',
          message: `Lead qualified in session: ${sessionId}`,
        });
        break;
        
      case 'convert':
        if (sessionMetric) {
          sessionMetric.converted = true;
          this.log({
            level: LogLevel.INFO,
            correlationId,
            sessionId,
            event: 'lead_converted',
            message: `Lead converted in session: ${sessionId}`,
          });
        }
        break;
    }
  }
  
  /**
   * Track state transitions
   */
  trackStateTransition(
    sessionId: string,
    fromNode: string,
    toNode: string,
    state: Partial<MasterOrchestratorState>
  ): void {
    const correlationId = this.getCorrelationId(sessionId);
    
    this.log({
      level: LogLevel.DEBUG,
      correlationId,
      sessionId,
      event: 'state_transition',
      message: `Transition: ${fromNode} → ${toNode}`,
      data: {
        fromNode,
        toNode,
        phase: state.currentPhase,
        qualificationScore: state.qualification?.totalScore,
        messageCount: state.messages?.length,
      },
    });
  }
  
  /**
   * Update error metrics
   */
  private updateErrorMetrics(entry: LogEntry): void {
    // Calculate error rate
    const totalExecutions = Array.from(this.metrics.agentExecutions.values())
      .reduce((sum, m) => sum + m.count, 0);
    const totalErrors = Array.from(this.metrics.agentExecutions.values())
      .reduce((sum, m) => sum + m.errors, 0);
    
    this.metrics.systemMetrics.errorRate = totalExecutions > 0 
      ? (totalErrors / totalExecutions) * 100 
      : 0;
  }
  
  /**
   * Start metrics aggregation interval
   */
  private startMetricsAggregation(): void {
    this.metricsUpdateInterval = setInterval(() => {
      this.aggregateMetrics();
    }, 60000); // Every minute
  }
  
  /**
   * Aggregate system metrics
   */
  private aggregateMetrics(): void {
    // Calculate average session duration
    const completedSessions = Array.from(this.metrics.sessionMetrics.values())
      .filter(s => s.endTime);
    
    if (completedSessions.length > 0) {
      const totalDuration = completedSessions.reduce((sum, s) => {
        const duration = s.endTime!.getTime() - s.startTime.getTime();
        return sum + duration;
      }, 0);
      
      this.metrics.systemMetrics.avgSessionDuration = totalDuration / completedSessions.length;
    }
    
    // Calculate conversion rate
    const conversions = Array.from(this.metrics.sessionMetrics.values())
      .filter(s => s.converted).length;
    
    this.metrics.systemMetrics.conversionRate = this.metrics.systemMetrics.totalSessions > 0
      ? (conversions / this.metrics.systemMetrics.totalSessions) * 100
      : 0;
    
    // Log system metrics
    this.log({
      level: LogLevel.INFO,
      correlationId: 'system',
      event: 'metrics_aggregation',
      message: 'System metrics updated',
      data: this.metrics.systemMetrics,
    });
  }
  
  /**
   * Get logs for session
   */
  getSessionLogs(sessionId: string): LogEntry[] {
    return this.logs.filter(log => log.sessionId === sessionId);
  }
  
  /**
   * Get agent performance metrics
   */
  getAgentMetrics(agentName?: string): any {
    if (agentName) {
      return this.metrics.agentExecutions.get(agentName);
    }
    return Object.fromEntries(this.metrics.agentExecutions);
  }
  
  /**
   * Get system metrics
   */
  getSystemMetrics(): typeof this.metrics.systemMetrics {
    return this.metrics.systemMetrics;
  }
  
  /**
   * Export logs for analysis
   */
  exportLogs(
    filter?: {
      level?: LogLevel;
      sessionId?: string;
      agent?: string;
      startTime?: Date;
      endTime?: Date;
    }
  ): LogEntry[] {
    let filteredLogs = [...this.logs];
    
    if (filter) {
      if (filter.level) {
        filteredLogs = filteredLogs.filter(log => log.level === filter.level);
      }
      if (filter.sessionId) {
        filteredLogs = filteredLogs.filter(log => log.sessionId === filter.sessionId);
      }
      if (filter.agent) {
        filteredLogs = filteredLogs.filter(log => log.agent === filter.agent);
      }
      if (filter.startTime) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= filter.startTime!);
      }
      if (filter.endTime) {
        filteredLogs = filteredLogs.filter(log => log.timestamp <= filter.endTime!);
      }
    }
    
    return filteredLogs;
  }
  
  /**
   * Generate conversation flow visualization data
   */
  generateFlowVisualization(sessionId: string): any {
    const sessionLogs = this.getSessionLogs(sessionId);
    const transitions = sessionLogs.filter(log => log.event === 'state_transition');
    
    // Build node and edge data for visualization
    const nodes = new Set<string>();
    const edges: Array<{ from: string; to: string; count: number }> = [];
    
    transitions.forEach(log => {
      const { fromNode, toNode } = log.data;
      nodes.add(fromNode);
      nodes.add(toNode);
      
      const existingEdge = edges.find(e => e.from === fromNode && e.to === toNode);
      if (existingEdge) {
        existingEdge.count++;
      } else {
        edges.push({ from: fromNode, to: toNode, count: 1 });
      }
    });
    
    return {
      nodes: Array.from(nodes).map(node => ({ id: node, label: node })),
      edges,
      metrics: this.metrics.sessionMetrics.get(sessionId),
    };
  }
  
  /**
   * Clear old logs and metrics
   */
  cleanup(olderThan: Date): void {
    // Clear old logs
    this.logs = this.logs.filter(log => log.timestamp > olderThan);
    
    // Clear old session metrics
    for (const [sessionId, metrics] of this.metrics.sessionMetrics) {
      if (metrics.endTime && metrics.endTime < olderThan) {
        this.metrics.sessionMetrics.delete(sessionId);
        this.correlationIds.delete(sessionId);
      }
    }
    
    this.log({
      level: LogLevel.INFO,
      correlationId: 'system',
      event: 'cleanup',
      message: `Cleaned up data older than ${olderThan.toISOString()}`,
    });
  }
  
  /**
   * Shutdown monitoring
   */
  shutdown(): void {
    if (this.metricsUpdateInterval) {
      clearInterval(this.metricsUpdateInterval);
    }
    
    this.log({
      level: LogLevel.INFO,
      correlationId: 'system',
      event: 'shutdown',
      message: 'Monitoring system shutting down',
      data: this.metrics.systemMetrics,
    });
  }
}

// Export singleton instance
export const monitor = new LangGraphMonitor();

// Export convenience functions
export const logDebug = (sessionId: string, message: string, data?: any) => 
  monitor.log({
    level: LogLevel.DEBUG,
    correlationId: monitor.getCorrelationId(sessionId),
    sessionId,
    event: 'debug',
    message,
    data,
  });

export const logInfo = (sessionId: string, message: string, data?: any) =>
  monitor.log({
    level: LogLevel.INFO,
    correlationId: monitor.getCorrelationId(sessionId),
    sessionId,
    event: 'info',
    message,
    data,
  });

export const logError = (sessionId: string, message: string, error?: Error) =>
  monitor.log({
    level: LogLevel.ERROR,
    correlationId: monitor.getCorrelationId(sessionId),
    sessionId,
    event: 'error',
    message,
    error,
  });