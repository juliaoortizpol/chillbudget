import { useState, useCallback } from 'react';
import { useFetch } from '../../../hooks/useFetch';
import type { SignupRequest } from '../types/api.types';

export function useSignup() {
  const { fetchApi } = useFetch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signup = useCallback(async (data: SignupRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchApi('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    } catch (err: any) {
      setError(err.message || 'Signup failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchApi]);

  return { signup, isLoading, error };
}
