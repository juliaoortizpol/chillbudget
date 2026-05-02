import { useCallback } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function useGoogleLogin() {
  const loginWithGoogle = useCallback(() => {
    // Redirect the browser to the backend Google OAuth endpoint
    // The backend should handle the OAuth flow and eventually redirect back
    // to the frontend with the access_token (e.g. via URL parameters)
    window.location.href = `${BASE_URL}/auth/google`;
  }, []);

  return { loginWithGoogle };
}
