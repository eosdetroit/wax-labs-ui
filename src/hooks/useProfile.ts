import { useQuery } from '@tanstack/react-query';

import { accountProfile } from '@/api/chain/profile';
import { Profile } from '@/api/models/profile.ts';
import { imageExists } from '@/utils/image';

interface UseProfileProps {
  actor: string;
}

/**
 * Custom hook for fetching and caching user profile data
 * Implements optimized caching strategy for profiles which change infrequently
 *
 * @param actor - The blockchain account to fetch the profile for
 * @returns Object containing profile data and loading state
 */
export function useProfile({ actor }: UseProfileProps) {
  const { data, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile', actor],
    queryFn: async () => {
      const profile = await accountProfile(actor);

      if (profile) {
        try {
          await imageExists(profile?.image_url);
        } catch {
          profile.image_url = '';
        }
      }

      return profile;
    },
    enabled: !!actor,
    staleTime: 30 * 60 * 1000, // 30 minutes - profiles change infrequently
    cacheTime: 60 * 60 * 1000, // 1 hour - keep in cache longer
    retry: 1, // Only retry once for profile data
  });

  return {
    profile: data as Profile,
    isLoadingProfile,
  };
}
