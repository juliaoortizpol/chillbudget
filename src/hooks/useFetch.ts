import { useCallback } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

type FetchOptions = RequestInit;

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export function useFetch() {
  const fetchApi = useCallback(async <T = unknown>(endpoint: string, options: FetchOptions = {}): Promise<T> => {
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
        
      throw new ApiError(
        typeof errorMessage === 'string' ? errorMessage : 'An error occurred',
        response.status,
        typeof data?.code === 'string' ? data.code : undefined,
      );
    }

    return data as T;
  }, []);

  return { fetchApi };
}
