/**
 * Connection Manager with Resilience Patterns
 * 
 * Implements circuit breaker, retry logic, and connection pooling
 * for robust voice provider connections
 */

import { IVoiceProvider } from './providers/IVoiceProvider';
import { VoiceProviderFactory } from './ProviderFactory';

export enum CircuitState {
  CLOSED = 'closed',    // Normal operation
  OPEN = 'open',        // Failing, use fallback
  HALF_OPEN = 'half-open' // Testing recovery
}

interface CircuitBreakerConfig {
  failureThreshold: number;      // Number of failures before opening
  resetTimeout: number;           // Time before trying again (ms)
  monitoringPeriod: number;       // Time window for failure counting (ms)
  halfOpenMaxAttempts: number;    // Max attempts in half-open state
}

interface ConnectionPoolConfig {
  maxConnections: number;
  minConnections: number;
  connectionTimeout: number;
  idleTimeout: number;
  maxRetries: number;
}

interface ConnectionMetrics {
  totalConnections: number;
  activeConnections: number;
  failedConnections: number;
  averageLatency: number;
  lastError?: string;
  lastErrorTime?: Date;
}

class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private successCount: number = 0;
  private halfOpenAttempts: number = 0;
  
  constructor(private config: CircuitBreakerConfig) {}
  
  async execute<T>(
    fn: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<T> {
    // Check if circuit should be reset
    if (this.state === CircuitState.OPEN) {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      if (timeSinceLastFailure > this.config.resetTimeout) {
        this.state = CircuitState.HALF_OPEN;
        this.halfOpenAttempts = 0;
        console.log('Circuit breaker entering half-open state');
      }
    }
    
    // If open, use fallback
    if (this.state === CircuitState.OPEN) {
      if (fallback) {
        console.log('Circuit open, using fallback');
        return fallback();
      }
      throw new Error('Circuit breaker is open and no fallback provided');
    }
    
    try {
      const result = await fn();
      
      // Success handling
      if (this.state === CircuitState.HALF_OPEN) {
        this.successCount++;
        if (this.successCount >= this.config.halfOpenMaxAttempts) {
          this.state = CircuitState.CLOSED;
          this.failures = 0;
          this.successCount = 0;
          console.log('Circuit breaker closed after successful recovery');
        }
      }
      
      return result;
    } catch (error) {
      this.handleFailure();
      
      // Try fallback if available
      if (fallback) {
        console.log('Primary failed, trying fallback');
        return fallback();
      }
      
      throw error;
    }
  }
  
  private handleFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.OPEN;
      console.log('Circuit breaker opened after half-open failure');
    } else if (this.failures >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
      console.log(`Circuit breaker opened after ${this.failures} failures`);
    }
  }
  
  getState(): CircuitState {
    return this.state;
  }
  
  reset() {
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.successCount = 0;
    this.halfOpenAttempts = 0;
  }
}

export class ConnectionManager {
  private providers: Map<string, IVoiceProvider> = new Map();
  private activeConnections: Map<string, IVoiceProvider> = new Map();
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private connectionPool: IVoiceProvider[] = [];
  private metrics: ConnectionMetrics;
  private factory: VoiceProviderFactory;
  
  private readonly defaultCircuitConfig: CircuitBreakerConfig = {
    failureThreshold: 3,
    resetTimeout: 30000, // 30 seconds
    monitoringPeriod: 60000, // 1 minute
    halfOpenMaxAttempts: 2
  };
  
  private readonly poolConfig: ConnectionPoolConfig = {
    maxConnections: 10,
    minConnections: 2,
    connectionTimeout: 5000,
    idleTimeout: 300000, // 5 minutes
    maxRetries: 3
  };
  
  constructor() {
    this.factory = VoiceProviderFactory.getInstance();
    this.metrics = {
      totalConnections: 0,
      activeConnections: 0,
      failedConnections: 0,
      averageLatency: 0
    };
    
    // Initialize connection pool
    this.initializePool();
    
    // Start monitoring
    this.startMonitoring();
  }
  
  /**
   * Get a connection with resilience
   */
  async getConnection(
    sessionId: string,
    provider: string = 'hume',
    config?: any
  ): Promise<IVoiceProvider> {
    const circuitBreaker = this.getOrCreateCircuitBreaker(provider);
    
    try {
      return await circuitBreaker.execute(
        async () => {
          // Try to get from pool first
          let connection = this.getFromPool(provider);
          
          if (!connection) {
            // Create new connection
            connection = await this.createConnection(provider, config);
          }
          
          this.activeConnections.set(sessionId, connection);
          this.metrics.activeConnections++;
          
          return connection;
        },
        async () => {
          // Fallback to alternative provider
          console.log(`Primary provider ${provider} failed, trying fallback`);
          return this.getFallbackConnection(sessionId, config);
        }
      );
    } catch (error) {
      this.metrics.failedConnections++;
      this.metrics.lastError = error instanceof Error ? error.message : 'Unknown error';
      this.metrics.lastErrorTime = new Date();
      throw error;
    }
  }
  
  /**
   * Create a new connection with retry logic
   */
  private async createConnection(
    provider: string,
    config?: any,
    retries: number = 0
  ): Promise<IVoiceProvider> {
    try {
      const startTime = Date.now();
      const voiceConfig = { provider, ...config };
      const connection = this.factory.createProvider(voiceConfig);
      
      await connection.connect(
        config?.apiKey,
        config?.wsEndpoint,
        config?.hasExistingContext
      );
      
      // Update metrics
      const latency = Date.now() - startTime;
      this.updateLatencyMetrics(latency);
      this.metrics.totalConnections++;
      
      return connection;
    } catch (error) {
      if (retries < this.poolConfig.maxRetries) {
        console.log(`Connection failed, retrying... (${retries + 1}/${this.poolConfig.maxRetries})`);
        await this.delay(Math.pow(2, retries) * 1000); // Exponential backoff
        return this.createConnection(provider, config, retries + 1);
      }
      throw error;
    }
  }
  
  /**
   * Get fallback connection
   */
  private async getFallbackConnection(
    sessionId: string,
    config?: any
  ): Promise<IVoiceProvider> {
    // Try alternative providers in order of preference
    const fallbackProviders = ['openai', 'hume'];
    
    for (const provider of fallbackProviders) {
      try {
        const connection = await this.createConnection(provider, config);
        this.activeConnections.set(sessionId, connection);
        console.log(`Fallback to ${provider} successful`);
        return connection;
      } catch (error) {
        console.log(`Fallback to ${provider} failed:`, error);
      }
    }
    
    throw new Error('All providers failed');
  }
  
  /**
   * Initialize connection pool
   */
  private async initializePool() {
    console.log('Initializing connection pool...');
    
    for (let i = 0; i < this.poolConfig.minConnections; i++) {
      try {
        const connection = await this.createConnection('hume');
        this.connectionPool.push(connection);
      } catch (error) {
        console.error('Failed to initialize pool connection:', error);
      }
    }
  }
  
  /**
   * Get connection from pool
   */
  private getFromPool(provider: string): IVoiceProvider | null {
    const index = this.connectionPool.findIndex(
      conn => conn.getProviderName().toLowerCase() === provider.toLowerCase() &&
              conn.getConnectionState().isConnected
    );
    
    if (index !== -1) {
      return this.connectionPool.splice(index, 1)[0];
    }
    
    return null;
  }
  
  /**
   * Return connection to pool
   */
  async returnToPool(sessionId: string) {
    const connection = this.activeConnections.get(sessionId);
    
    if (connection && this.connectionPool.length < this.poolConfig.maxConnections) {
      this.activeConnections.delete(sessionId);
      this.connectionPool.push(connection);
      this.metrics.activeConnections--;
      console.log(`Connection returned to pool (pool size: ${this.connectionPool.length})`);
    } else if (connection) {
      // Pool is full, disconnect
      await connection.disconnect();
      this.activeConnections.delete(sessionId);
      this.metrics.activeConnections--;
    }
  }
  
  /**
   * Get or create circuit breaker for provider
   */
  private getOrCreateCircuitBreaker(provider: string): CircuitBreaker {
    if (!this.circuitBreakers.has(provider)) {
      this.circuitBreakers.set(
        provider,
        new CircuitBreaker(this.defaultCircuitConfig)
      );
    }
    return this.circuitBreakers.get(provider)!;
  }
  
  /**
   * Update latency metrics
   */
  private updateLatencyMetrics(latency: number) {
    const alpha = 0.2; // Exponential moving average factor
    this.metrics.averageLatency = 
      alpha * latency + (1 - alpha) * this.metrics.averageLatency;
  }
  
  /**
   * Start monitoring connections
   */
  private startMonitoring() {
    setInterval(() => {
      // Clean up idle connections
      const now = Date.now();
      this.connectionPool = this.connectionPool.filter(conn => {
        const state = conn.getConnectionState();
        if (!state.isConnected) {
          return false;
        }
        // Keep connection (implement idle check if needed)
        return true;
      });
      
      // Log metrics
      if (this.metrics.activeConnections > 0) {
        console.log('Connection metrics:', {
          active: this.metrics.activeConnections,
          poolSize: this.connectionPool.length,
          avgLatency: Math.round(this.metrics.averageLatency),
          failures: this.metrics.failedConnections
        });
      }
    }, 30000); // Every 30 seconds
  }
  
  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Get current metrics
   */
  getMetrics(): ConnectionMetrics {
    return { ...this.metrics };
  }
  
  /**
   * Reset circuit breaker for provider
   */
  resetCircuitBreaker(provider: string) {
    const breaker = this.circuitBreakers.get(provider);
    if (breaker) {
      breaker.reset();
      console.log(`Circuit breaker reset for ${provider}`);
    }
  }
  
  /**
   * Cleanup all connections
   */
  async cleanup() {
    // Disconnect all active connections
    for (const [sessionId, connection] of this.activeConnections) {
      await connection.disconnect();
    }
    this.activeConnections.clear();
    
    // Clear pool
    for (const connection of this.connectionPool) {
      await connection.disconnect();
    }
    this.connectionPool = [];
    
    console.log('Connection manager cleaned up');
  }
}

// Export singleton instance
export const connectionManager = new ConnectionManager();