import { useState, useCallback } from 'react';
import { useFetch } from '../../../hooks/useFetch';
import type { UserProfile } from '../types/api.types';

export function useProfile() {
  const { fetchApi } = useFetch();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchApi<UserProfile>('/auth/profile', {
        method: 'GET',
      });
      setProfile(response);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch profile');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchApi]);

  return { getProfile, profile, isLoading, error };
}
