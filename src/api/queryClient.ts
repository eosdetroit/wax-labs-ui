import { QueryClient, DefaultOptions } from '@tanstack/react-query';
import { measureNetworkTime } from '../utils/performanceMonitoring';

/**
 * QueryClient configuration with default settings for optimized caching and performance
 * 
 * staleTime: 5 minutes - Data remains fresh for 5 minutes before refetching
 * cacheTime: 30 minutes - Unused data is garbage collected after 30 minutes
 * retry: 2 - Failed queries will retry twice before giving up
 * refetchOnWindowFocus: true - Queries will refetch when window regains focus
 * refetchOnReconnect: true - Queries will refetch when network reconnects
 * 
 * Performance Monitoring:
 * - Default queryFn is enhanced with performance monitoring
 * - Tracks API call frequency and response times
 * - Logs warnings for slow or frequent API calls
 */

// Create a custom fetch function that measures network performance
const createQueryFn = () => {
  return async ({ queryKey }: { queryKey: unknown[] }) => {
    // Use the query key's first element (usually the endpoint name) for monitoring
    const endpoint = Array.isArray(queryKey) ? String(queryKey[0]) : 'unknown-endpoint';
    
    // Wrap the fetch call with performance monitoring
    return measureNetworkTime(endpoint, async () => {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Network request failed: ${response.status}`);
      }
      return response.json();
    });
  };
};

// Default options with performance monitoring
const defaultOptions: DefaultOptions = {
  queries: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    queryFn: createQueryFn(),
  },
};

export const queryClient = new QueryClient({
  defaultOptions,
});
