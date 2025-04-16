import { QueryClient, DefaultOptions } from '@tanstack/react-query';

/**
 * QueryClient configuration with default settings for optimized caching and performance
 * 
 * staleTime: 5 minutes - Data remains fresh for 5 minutes before refetching
 * cacheTime: 30 minutes - Unused data is garbage collected after 30 minutes
 * retry: 2 - Failed queries will retry twice before giving up
 * refetchOnWindowFocus: true - Queries will refetch when window regains focus
 * refetchOnReconnect: true - Queries will refetch when network reconnects
 */

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
