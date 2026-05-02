import { useState, useCallback } from 'react';
import { useFetch } from '../../../hooks/useFetch';
import type { LoginRequest, AuthResponse } from '../types/api.types';

export function useLogin() {
  const { fetchApi } = useFetch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (data: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchApi<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      if (response.access_token) {
        localStorage.setItem('jwt_token', response.access_token);
      }
      
      return response;
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchApi]);

  return { login, isLoading, error };
}
