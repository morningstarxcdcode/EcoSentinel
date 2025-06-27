/**
 * Performance Optimization System
 * Handles caching, data compression, and performance monitoring
 */

interface PerformanceMetrics {
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  activeConnections: number;
  cacheHitRate: number;
  errorRate: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

class PerformanceOptimizer {
  private dataCache = new Map<string, CacheEntry<any>>();
  private metrics: PerformanceMetrics = {
    responseTime: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    activeConnections: 0,
    cacheHitRate: 0,
    errorRate: 0
  };
  private metricsHistory: PerformanceMetrics[] = [];

  constructor() {
    this.initializeOptimizer();
  }

  private initializeOptimizer() {
    console.log('⚡ Initializing Performance Optimizer...');
    
    // Set up cache cleanup interval
    setInterval(() => {
      this.cleanupCache();
    }, 300000); // Every 5 minutes

    // Set up metrics collection
    setInterval(() => {
      this.collectMetrics();
    }, 60000); // Every minute

    // Set up performance monitoring
    this.setupPerformanceMonitoring();
  }

  /**
   * Intelligent caching with TTL and LRU eviction
   */
  public cache<T>(key: string, data: T, ttlSeconds: number = 300): void {
    const now = Date.now();
    
    this.dataCache.set(key, {
      data,
      timestamp: now,
      ttl: ttlSeconds * 1000,
      accessCount: 0,
      lastAccessed: now
    });

    // Implement cache size limit (LRU eviction)
    if (this.dataCache.size > 10000) {
      this.evictLeastRecentlyUsed();
    }
  }

  /**
   * Retrieve data from cache
   */
  public getFromCache<T>(key: string): T | null {
    const entry = this.dataCache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    
    // Check if entry has expired
    if (now - entry.timestamp > entry.ttl) {
      this.dataCache.delete(key);
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = now;
    
    return entry.data;
  }

  /**
   * Smart cache key generation
   */
  public generateCacheKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    
    return `${prefix}:${this.hashString(sortedParams)}`;
  }

  /**
   * Data compression for large responses
   */
  public compressData(data: any): string {
    try {
      const jsonString = JSON.stringify(data);
      
      // Simple compression using repeated pattern replacement
      let compressed = jsonString
        .replace(/{"timestamp":/g, '{"t":')
        .replace(/,"location":/g, ',"l":')
        .replace(/,"airQuality":/g, ',"aq":')
        .replace(/,"temperature":/g, ',"temp":')
        .replace(/,"humidity":/g, ',"hum":')
        .replace(/,"pressure":/g, ',"pres":');
      
      return compressed;
    } catch (error) {
      console.error('❌ Compression error:', error);
      return JSON.stringify(data);
    }
  }

  /**
   * Data decompression
   */
  public decompressData(compressedData: string): any {
    try {
      const decompressed = compressedData
        .replace(/{"t":/g, '{"timestamp":')
        .replace(/,"l":/g, ',"location":')
        .replace(/,"aq":/g, ',"airQuality":')
        .replace(/,"temp":/g, ',"temperature":')
        .replace(/,"hum":/g, ',"humidity":')
        .replace(/,"pres":/g, ',"pressure":');
      
      return JSON.parse(decompressed);
    } catch (error) {
      console.error('❌ Decompression error:', error);
      return null;
    }
  }

  /**
   * Request batching for API calls
   */
  private batchQueue: Array<{
    key: string;
    resolver: (data: any) => void;
    rejector: (error: any) => void;
  }> = [];

  public batchRequest<T>(key: string): Promise<T> {
    return new Promise((resolve, reject) => {
      this.batchQueue.push({
        key,
        resolver: resolve,
        rejector: reject
      });

      // Process batch after short delay
      setTimeout(() => {
        this.processBatch();
      }, 50);
    });
  }

  private async processBatch() {
    if (this.batchQueue.length === 0) return;

    const batch = [...this.batchQueue];
    this.batchQueue = [];

    // Group requests by type
    const groupedRequests = batch.reduce((groups, request) => {
      const [type] = request.key.split(':');
      if (!groups[type]) groups[type] = [];
      groups[type].push(request);
      return groups;
    }, {} as Record<string, typeof batch>);

    // Process each group
    for (const [type, requests] of Object.entries(groupedRequests)) {
      try {
        const results = await this.executeBatchRequest(type, requests);
        
        // Resolve individual requests
        requests.forEach((request, index) => {
          request.resolver(results[index]);
        });
      } catch (error) {
        // Reject all requests in the batch
        requests.forEach(request => {
          request.rejector(error);
        });
      }
    }
  }

  private async executeBatchRequest(type: string, requests: any[]): Promise<any[]> {
    // Implementation would depend on the specific API
    // This is a placeholder for batch processing logic
    console.log(`🔄 Processing batch of ${requests.length} ${type} requests`);
    
    // Simulate batch processing
    return requests.map(() => ({ data: 'batch_result' }));
  }

  /**
   * Response streaming for large datasets
   */
  public createDataStream(data: any[], chunkSize: number = 100): AsyncGenerator<any[], void, unknown> {
    return this.streamData(data, chunkSize);
  }

  private async* streamData(data: any[], chunkSize: number): AsyncGenerator<any[], void, unknown> {
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      yield chunk;
      
      // Small delay to prevent blocking
      await new Promise(resolve => setTimeout(resolve, 1));
    }
  }

  /**
   * Memory usage optimization
   */
  public optimizeMemoryUsage() {
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    // Clear old cache entries
    this.cleanupCache();

    // Clear metrics history if too large
    if (this.metricsHistory.length > 1000) {
      this.metricsHistory = this.metricsHistory.slice(-500);
    }

    console.log('🧹 Memory optimization completed');
  }

  /**
   * Database query optimization
   */
  public optimizeQuery(query: string, params: any[]): { query: string; params: any[] } {
    // Add query hints and optimizations
    let optimizedQuery = query;
    
    // Add index hints for common patterns
    if (query.includes('WHERE location =')) {
      optimizedQuery = optimizedQuery.replace(
        'SELECT *',
        'SELECT * /*+ INDEX(location_idx) */'
      );
    }
    
    if (query.includes('ORDER BY timestamp')) {
      optimizedQuery = optimizedQuery.replace(
        'ORDER BY timestamp',
        'ORDER BY timestamp /*+ INDEX(timestamp_idx) */'
      );
    }

    // Limit large result sets
    if (!query.includes('LIMIT') && query.includes('SELECT')) {
      optimizedQuery += ' LIMIT 10000';
    }

    return { query: optimizedQuery, params };
  }

  /**
   * API response optimization
   */
  public optimizeApiResponse(data: any, requestInfo: any): any {
    // Remove unnecessary fields based on request
    if (requestInfo.fields) {
      return this.selectFields(data, requestInfo.fields);
    }

    // Compress large arrays
    if (Array.isArray(data) && data.length > 100) {
      return {
        data: data.slice(0, 100),
        total: data.length,
        hasMore: true,
        nextPage: requestInfo.page ? requestInfo.page + 1 : 2
      };
    }

    return data;
  }

  /**
   * Select specific fields from data
   */
  private selectFields(data: any, fields: string[]): any {
    if (Array.isArray(data)) {
      return data.map(item => this.selectFieldsFromObject(item, fields));
    }
    
    return this.selectFieldsFromObject(data, fields);
  }

  private selectFieldsFromObject(obj: any, fields: string[]): any {
    const result: any = {};
    
    for (const field of fields) {
      if (field.includes('.')) {
        // Handle nested fields
        const [parent, ...rest] = field.split('.');
        if (obj[parent]) {
          if (!result[parent]) result[parent] = {};
          result[parent][rest.join('.')] = obj[parent][rest.join('.')];
        }
      } else {
        if (obj[field] !== undefined) {
          result[field] = obj[field];
        }
      }
    }
    
    return result;
  }

  /**
   * Cache cleanup - remove expired and least used entries
   */
  private cleanupCache() {
    const now = Date.now();
    let removedCount = 0;

    for (const [key, entry] of this.dataCache.entries()) {
      // Remove expired entries
      if (now - entry.timestamp > entry.ttl) {
        this.dataCache.delete(key);
        removedCount++;
      }
    }

    console.log(`🧹 Cache cleanup: removed ${removedCount} expired entries`);
  }

  /**
   * LRU eviction for cache size management
   */
  private evictLeastRecentlyUsed() {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.dataCache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.dataCache.delete(oldestKey);
      console.log(`🗑️ Evicted LRU cache entry: ${oldestKey}`);
    }
  }

  /**
   * Collect performance metrics
   */
  private collectMetrics() {
    const now = Date.now();
    
    // Calculate cache hit rate
    const totalCacheAccesses = Array.from(this.dataCache.values())
      .reduce((sum, entry) => sum + entry.accessCount, 0);
    
    this.metrics = {
      responseTime: this.calculateAverageResponseTime(),
      memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
      cpuUsage: process.cpuUsage().user / 1000000, // Convert to seconds
      activeConnections: this.getActiveConnectionCount(),
      cacheHitRate: this.dataCache.size > 0 ? totalCacheAccesses / this.dataCache.size : 0,
      errorRate: this.calculateErrorRate()
    };

    // Store in history
    this.metricsHistory.push({ ...this.metrics });

    // Log performance summary
    if (this.metricsHistory.length % 10 === 0) {
      this.logPerformanceSummary();
    }
  }

  /**
   * Setup performance monitoring
   */
  private setupPerformanceMonitoring() {
    // Monitor response times
    const originalFetch = global.fetch;
    if (originalFetch) {
      global.fetch = async (...args) => {
        const start = Date.now();
        try {
          const response = await originalFetch(...args);
          const duration = Date.now() - start;
          this.recordResponseTime(duration);
          return response;
        } catch (error) {
          const duration = Date.now() - start;
          this.recordResponseTime(duration);
          throw error;
        }
      };
    }
  }

  private recordResponseTime(duration: number) {
    // Update rolling average
    this.metrics.responseTime = (this.metrics.responseTime * 0.9) + (duration * 0.1);
  }

  private calculateAverageResponseTime(): number {
    // This would be calculated from actual request tracking
    return this.metrics.responseTime || 150; // Default 150ms
  }

  private getActiveConnectionCount(): number {
    // This would be tracked from WebSocket connections
    return 0; // Placeholder
  }

  private calculateErrorRate(): number {
    // This would be calculated from error tracking
    return 0.01; // 1% error rate placeholder
  }

  /**
   * Log performance summary
   */
  private logPerformanceSummary() {
    console.log('📊 Performance Summary:');
    console.log(`   Response Time: ${this.metrics.responseTime.toFixed(2)}ms`);
    console.log(`   Memory Usage: ${this.metrics.memoryUsage.toFixed(2)}MB`);
    console.log(`   Cache Hit Rate: ${(this.metrics.cacheHitRate * 100).toFixed(1)}%`);
    console.log(`   Error Rate: ${(this.metrics.errorRate * 100).toFixed(2)}%`);
    console.log(`   Cache Size: ${this.dataCache.size} entries`);
  }

  /**
   * Get current performance metrics
   */
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get performance history
   */
  public getMetricsHistory(): PerformanceMetrics[] {
    return [...this.metricsHistory];
  }

  /**
   * Hash string for cache keys
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
}

// Export singleton instance
export const performanceOptimizer = new PerformanceOptimizer();

// Export types
export type { PerformanceMetrics, CacheEntry };
