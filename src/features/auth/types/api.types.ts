export interface SignupRequest {
  email: string;
  password?: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface AuthResponse {
  access_token: string;
  // We can add other fields here if the backend returns them (like user object)
}

export interface UserProfile {
  id: string;
  email: string;
  // We can expand this once we know what the profile endpoint returns exactly
  [key: string]: any;
}
