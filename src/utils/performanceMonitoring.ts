/**
 * Performance monitoring utilities for tracking API calls and network metrics
 */

// Store API call counts to detect frequent calls
const apiCallCounts: Record<string, { count: number; lastReset: number }> = {};

// Configuration
const WARN_THRESHOLD = 5; // Warn if same endpoint called X times in the interval
const RESET_INTERVAL = 10000; // Reset counters every 10 seconds
const TIMING_THRESHOLD = 1000; // Warn for requests taking longer than 1 second

/**
 * Tracks API call frequency and logs warnings if an endpoint is called too frequently
 * @param endpoint - The API endpoint being called
 */
export function trackApiCall(endpoint: string): void {
  // Don't track in production
  if (process.env.NODE_ENV === 'production') return;
  
  const now = Date.now();
  
  // Initialize or reset counter if it's been too long
  if (!apiCallCounts[endpoint]) {
    apiCallCounts[endpoint] = { count: 0, lastReset: now };
  } else if (now - apiCallCounts[endpoint].lastReset > RESET_INTERVAL) {
    apiCallCounts[endpoint] = { count: 0, lastReset: now };
  }
  
  // Increment counter
  apiCallCounts[endpoint].count++;
  
  // Check if we're making too many calls
  if (apiCallCounts[endpoint].count > WARN_THRESHOLD) {
    console.warn(
      `🚨 Performance Warning: Endpoint ${endpoint} called ${apiCallCounts[endpoint].count} times in ${RESET_INTERVAL/1000}s. Consider optimizing.`
    );
  }
}

/**
 * Measures and logs the time taken for a network request
 * @param endpoint - The API endpoint being called
 * @param requestFn - The async function that makes the request
 * @returns The result of the request function
 */
export async function measureNetworkTime<T>(
  endpoint: string,
  requestFn: () => Promise<T>
): Promise<T> {
  // Don't measure in production
  if (process.env.NODE_ENV === 'production') {
    return requestFn();
  }
  
  // Track this API call
  trackApiCall(endpoint);
  
  // Measure time
  const startTime = performance.now();
  try {
    const result = await requestFn();
    const duration = performance.now() - startTime;
    
    // Log timing for long requests
    if (duration > TIMING_THRESHOLD) {
      console.warn(
        `⏱️ Slow Network Request: ${endpoint} took ${duration.toFixed(2)}ms to complete. Consider optimizing.`
      );
    } else {
      console.debug(`Network Request: ${endpoint} completed in ${duration.toFixed(2)}ms`);
    }
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error(
      `🔴 Failed Network Request: ${endpoint} failed after ${duration.toFixed(2)}ms`,
      error
    );
    throw error;
  }
}

/**
 * Logs overall performance metrics for the application
 */
export function logPerformanceMetrics(): void {
  // Don't log in production
  if (process.env.NODE_ENV === 'production') return;
  
  const metrics = {
    // Core Web Vitals and other performance metrics
    navigationTiming: getNavigationTiming(),
    memoryUsage: getMemoryUsage(),
    apiCallStats: summarizeApiCalls(),
  };
  
  console.info('📊 Performance Metrics:', metrics);
}

/**
 * Gets navigation timing data from the Performance API
 */
function getNavigationTiming() {
  if (typeof window === 'undefined' || !window.performance || !window.performance.timing) {
    return null;
  }
  
  const timing = window.performance.timing;
  
  return {
    dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
    tcpConnection: timing.connectEnd - timing.connectStart,
    serverResponse: timing.responseEnd - timing.requestStart,
    domProcessing: timing.domComplete - timing.domLoading,
    pageLoad: timing.loadEventEnd - timing.navigationStart,
  };
}

/**
 * Gets memory usage statistics if available
 */
function getMemoryUsage() {
  // Check if performance.memory is available (Chrome only)
  const performance = window.performance as any;
  if (typeof performance === 'undefined' || !performance.memory) {
    return null;
  }
  
  return {
    jsHeapSizeLimit: formatBytes(performance.memory.jsHeapSizeLimit),
    totalJSHeapSize: formatBytes(performance.memory.totalJSHeapSize),
    usedJSHeapSize: formatBytes(performance.memory.usedJSHeapSize),
  };
}

/**
 * Summarizes API call statistics
 */
function summarizeApiCalls() {
  return Object.entries(apiCallCounts).map(([endpoint, data]) => ({
    endpoint,
    calls: data.count,
    timeWindow: `${(Date.now() - data.lastReset) / 1000}s`,
  }));
}

/**
 * Formats bytes into a human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Initialize performance monitoring
export function initPerformanceMonitoring(): void {
  // Don't initialize in production
  if (process.env.NODE_ENV === 'production') return;
  
  // Log initial metrics
  window.addEventListener('load', () => {
    setTimeout(() => logPerformanceMetrics(), 3000);
  });
  
  // Log metrics periodically
  setInterval(() => logPerformanceMetrics(), 60000); // Every minute
  
  console.info('✅ Performance monitoring initialized');
}
