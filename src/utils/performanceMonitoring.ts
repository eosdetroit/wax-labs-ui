/**
 * Performance monitoring utilities for tracking API calls and network metrics
 */

// Define the memory interface that's available in some browsers (like Chrome)
interface PerformanceMemory {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
}

// Extend the Performance interface to include the memory property
interface Performance {
  memory?: PerformanceMemory;
}

// Type guard to check if we're in development mode
const isDevelopmentMode = (): boolean => import.meta.env.DEV === true;

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
  if (!isDevelopmentMode()) return;
  
  if (typeof endpoint !== 'string' || !endpoint) {
    console.warn('Invalid endpoint provided to trackApiCall');
    return;
  }
  
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
  // Don't measure in production - just execute the request
  if (!isDevelopmentMode()) {
    return requestFn();
  }
  
  // Type checking
  if (typeof endpoint !== 'string' || !endpoint) {
    console.warn('Invalid endpoint provided to measureNetworkTime');
    return requestFn();
  }

  if (typeof requestFn !== 'function') {
    console.error('Invalid request function provided to measureNetworkTime');
    throw new Error('Invalid request function');
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
  if (!isDevelopmentMode()) return;
  
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || !window) return;
  
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
function getNavigationTiming(): Record<string, number> | null {
  // No-op in production mode
  if (!isDevelopmentMode()) return null;

  if (typeof window === 'undefined' || !window.performance || !window.performance.timing) {
    return null;
  }
  
  const timing = window.performance.timing;
  
  // Check that all required timing properties exist
  if (
    typeof timing.domainLookupEnd !== 'number' || 
    typeof timing.domainLookupStart !== 'number' ||
    typeof timing.connectEnd !== 'number' ||
    typeof timing.connectStart !== 'number' ||
    typeof timing.responseEnd !== 'number' ||
    typeof timing.requestStart !== 'number' ||
    typeof timing.domComplete !== 'number' ||
    typeof timing.domLoading !== 'number' ||
    typeof timing.loadEventEnd !== 'number' ||
    typeof timing.navigationStart !== 'number'
  ) {
    return null;
  }
  
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
function getMemoryUsage(): { 
  jsHeapSizeLimit: string; 
  totalJSHeapSize: string; 
  usedJSHeapSize: string; 
} | null {
  // No-op in production mode
  if (!isDevelopmentMode()) return null;

  // Check if performance.memory is available (Chrome only)
  if (
    typeof window === 'undefined' || 
    !window.performance || 
    !window.performance.memory
  ) {
    return null;
  }
  
  const memory = window.performance.memory as PerformanceMemory;
  
  // Verify that memory properties exist
  if (
    typeof memory.jsHeapSizeLimit !== 'number' ||
    typeof memory.totalJSHeapSize !== 'number' ||
    typeof memory.usedJSHeapSize !== 'number'
  ) {
    return null;
  }
  
  return {
    jsHeapSizeLimit: formatBytes(memory.jsHeapSizeLimit),
    totalJSHeapSize: formatBytes(memory.totalJSHeapSize),
    usedJSHeapSize: formatBytes(memory.usedJSHeapSize),
  };
}

/**
 * Summarizes API call statistics
 */
function summarizeApiCalls(): Array<{
  endpoint: string;
  calls: number;
  timeWindow: string;
}> {
  // No-op in production mode
  if (!isDevelopmentMode()) return [];

  return Object.entries(apiCallCounts).map(([endpoint, data]) => ({
    endpoint,
    calls: data.count,
    timeWindow: `${(Date.now() - data.lastReset) / 1000}s`,
  }));
}

/**
 * Formats bytes into a human-readable string
 */
function formatBytes(bytes: number | undefined): string {
  if (bytes === undefined || bytes === 0 || typeof bytes !== 'number') return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  if (i < 0 || i >= sizes.length) return '0 Bytes'; // Additional safety check
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Initialize performance monitoring
export function initPerformanceMonitoring(): void {
  // Don't initialize in production or if not in browser
  if (!isDevelopmentMode() || typeof window === 'undefined' || !window) return;
  
  try {
    // Log initial metrics
    window.addEventListener('load', () => {
      setTimeout(() => logPerformanceMetrics(), 3000);
    });
    
    // Log metrics periodically
    const intervalId = setInterval(() => logPerformanceMetrics(), 60000); // Every minute
    
    // Provide a way to clean up the interval if needed
    window.__performanceMonitoringCleanup = () => {
      clearInterval(intervalId);
      console.info('Performance monitoring stopped');
    };
    
    console.info('✅ Performance monitoring initialized');
  } catch (error) {
    console.warn('Failed to initialize performance monitoring:', error);
  }
}

// Add cleanup interface to Window object
declare global {
  interface Window {
    __performanceMonitoringCleanup?: () => void;
  }
}
