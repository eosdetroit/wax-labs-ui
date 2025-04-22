import { useQuery } from '@tanstack/react-query';

import { deliverables as getDeliverables } from '@/api/chain/proposals';

/**
 * Custom hook for fetching and caching proposal deliverables
 * Uses staleTime settings based on how frequently deliverables change
 * 
 * @param proposalId - The ID of the proposal to fetch deliverables for
 * @returns Query result containing deliverables data and status
 */
export function useDeliverables({ proposalId }: { proposalId: number }) {
  return useQuery(
    ['proposal', proposalId, 'deliverables'],
    () => getDeliverables({ proposalId }).then(response => response.deliverables),
    {
      enabled: !!proposalId,
      staleTime: 10 * 60 * 1000, // 10 minutes - deliverables don't change frequently
      cacheTime: 30 * 60 * 1000, // 30 minutes - keep in cache longer than stale time
      retry: 2,
      // Avoid unnecessary network requests for deliverables data
      refetchOnWindowFocus: false,
    }
  );
}
