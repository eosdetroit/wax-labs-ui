/**
 * Performance monitoring utilities for tracking API calls and network metrics
 * This is a development tool to help identify inefficient data fetching patterns
 */

// Only implement detailed functionality in development mode
const isDev = () => import.meta.env.DEV;

// Track API call frequency to detect excessive polling
const apiCallRegistry: Record<string, { count: number; lastWarned: number }> = {};
const EXCESSIVE_CALLS_THRESHOLD = 10; // per minute
const WARNING_COOLDOWN = 60 * 1000; // 1 minute

/**
 * Logs API call and warns if frequency exceeds threshold
 * @param endpoint - The API endpoint being called
 */
export function logApiCall(endpoint: string): void {
  if (!isDev()) return;
  
  const now = Date.now();
  
  if (!apiCallRegistry[endpoint]) {
    apiCallRegistry[endpoint] = { count: 0, lastWarned: 0 };
  }
  
  apiCallRegistry[endpoint].count += 1;
  
  // Reset counter after a minute
  setTimeout(() => {
    if (apiCallRegistry[endpoint]) {
      apiCallRegistry[endpoint].count -= 1;
    }
  }, 60 * 1000);
  
  // Show warning for excessive calls with cooldown
  if (
    apiCallRegistry[endpoint].count > EXCESSIVE_CALLS_THRESHOLD &&
    now - apiCallRegistry[endpoint].lastWarned > WARNING_COOLDOWN
  ) {
    console.warn(
      `[Performance Warning] Endpoint ${endpoint} called ${apiCallRegistry[endpoint].count} times in the last minute.\n` +
      'Consider optimizing with better caching or reduced polling frequency.'
    );
    apiCallRegistry[endpoint].lastWarned = now;
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
  // Skip performance monitoring in production
  if (!isDev()) {
    return requestFn();
  }
  
  // Log API call frequency
  logApiCall(endpoint);
  
  // Measure time in development
  const startTime = performance.now();
  try {
    const result = await requestFn();
    const duration = performance.now() - startTime;
    
    // Log slow requests
    if (duration > 1000) {
      console.warn(`Slow Network Request: ${endpoint} took ${duration.toFixed(2)}ms to complete.`);
    }
    
    return result;
  } catch (error) {
    console.error(`Failed Request: ${endpoint}`, error);
    throw error;
  }
}

/**
 * Setup performance monitoring for axios instance
 * @param axiosInstance - The axios instance to monitor
 */
export function setupAxiosMonitoring(axiosInstance: any): void {
  if (!isDev() || !axiosInstance) return;
  
  // Request interceptor
  axiosInstance.interceptors.request.use((config: any) => {
    const url = config?.url || 'unknown';
    config.metadata = { startTime: performance.now() };
    logApiCall(url);
    return config;
  });
  
  // Response interceptor
  axiosInstance.interceptors.response.use(
    (response: any) => {
      const url = response?.config?.url || 'unknown';
      const startTime = response?.config?.metadata?.startTime;
      
      if (startTime) {
        const duration = performance.now() - startTime;
        if (duration > 1000) {
          console.warn(`Slow axios request to ${url}: ${duration.toFixed(2)}ms`);
        }
      }
      
      return response;
    },
    (error: any) => {
      return Promise.reject(error);
    }
  );
}

/**
 * Utility to determine if polling should occur based on tab visibility and other conditions
 * @param intervalMs - The desired polling interval in milliseconds
 * @param options - Additional options to control polling behavior
 * @returns Polling interval in ms or false if polling should be disabled
 */
export function getVisibilityAwarePollingInterval(
  intervalMs: number,
  options: { requireVisible?: boolean; enabledCondition?: boolean } = {}
): number | false {
  const { requireVisible = true, enabledCondition = true } = options;
  
  // Don't poll if the enabled condition is false
  if (!enabledCondition) return false;
  
  // Don't poll if visibility is required and tab is hidden
  if (requireVisible && document.visibilityState !== 'visible') return false;
  
  return intervalMs;
}

/**
 * Initialize performance monitoring
 * This is a very simple implementation that focuses on development only
 */
export function initPerformanceMonitoring(): void {
  // Only run in development mode
  if (!isDev()) return;
  
  console.info('Performance monitoring initialized');
  
  // Setup mutation observer to detect excessive DOM updates
  setupDOMUpdateMonitoring();
}

/**
 * Monitor frequent DOM updates that might indicate performance issues
 */
function setupDOMUpdateMonitoring(): void {
  if (!isDev()) return;
  
  let updateCount = 0;
  let lastWarned = 0;
  const DOM_UPDATE_THRESHOLD = 100; // per second
  
  const observer = new MutationObserver(() => {
    updateCount++;
    
    // Reset counter after a second
    setTimeout(() => updateCount--, 1000);
    
    // Warn about excessive updates with cooldown
    const now = Date.now();
    if (updateCount > DOM_UPDATE_THRESHOLD && now - lastWarned > WARNING_COOLDOWN) {
      console.warn(
        `[Performance Warning] Excessive DOM updates detected (${updateCount} in the last second).\n` +
        'Consider optimizing renders with useMemo, useCallback, or memo().'
      );
      lastWarned = now;
    }
  });
  
  // Observe the entire document
  observer.observe(document.body, {
    childList: true,
    attributes: true,
    subtree: true,
  });
}
