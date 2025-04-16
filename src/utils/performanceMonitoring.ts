/**
 * Performance monitoring utilities for tracking API calls and network metrics
 * This is a simplified version that works in both development and production
 */

// Only implement functionality in development mode to avoid any impact on production
const isDev = () => import.meta.env.DEV;

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
 * Initialize performance monitoring
 * This is a very simple implementation that does nothing in production
 */
export function initPerformanceMonitoring(): void {
  // Only run in development mode
  if (!isDev()) return;
  
  console.info('Performance monitoring initialized');
}
