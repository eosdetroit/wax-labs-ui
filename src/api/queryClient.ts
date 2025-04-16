import { QueryClient, DefaultOptions, QueryFunction, QueryKey } from '@tanstack/react-query';
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
 * Note: Performance monitoring should be implemented at the individual query level 
 * using the measureNetworkTime utility from performanceMonitoring.ts
 */

// We don't need a custom queryFn at the global level as it would prevent 
// individual queries from defining their own fetching logic.
// The performance monitoring should be applied at specific query instances
// or wrapped around actual API calls.

// Default options with optimized caching settings
const defaultOptions: DefaultOptions = {
  queries: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  },
};

export const queryClient = new QueryClient({
  defaultOptions,
});
