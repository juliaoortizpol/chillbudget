import { useCallback } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface FetchOptions extends RequestInit {}

export function useFetch() {
  const fetchApi = useCallback(async <T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> => {
    const token = localStorage.getItem('jwt_token');
    
    const headers = new Headers(options.headers);
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

    const response = await fetch(url, config);
    
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      // In nestjs, exceptions usually return { statusCode, message, error }
      const errorMessage = data?.message 
        ? (Array.isArray(data.message) ? data.message.join(', ') : data.message)
        : data || response.statusText;
        
      throw new Error(typeof errorMessage === 'string' ? errorMessage : 'An error occurred');
    }

    return data as T;
  }, []);

  return { fetchApi };
}
