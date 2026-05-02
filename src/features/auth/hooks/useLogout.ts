import { useState, useCallback } from 'react';
import { useFetch } from '../../../hooks/useFetch';

export function useLogout() {
  const { fetchApi } = useFetch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchApi('/auth/logout', {
        method: 'POST',
      });
      // Clear token locally
      localStorage.removeItem('jwt_token');
      return response;
    } catch (err: any) {
      setError(err.message || 'Logout failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchApi]);

  return { logout, isLoading, error };
}
