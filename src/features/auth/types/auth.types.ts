export interface User {
  id: number;
  avatar: string | null;
  is_active: number; // 1 | 0
  name: string;
  email: string;
  username: string;
  firstname: string;
  lastname: string;
  role?: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthData {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface AuthResponse {
  status: boolean;
  message: string;
  errors: string | null;
  data: AuthData | null;
}

export interface ProfileResponse {
  status: boolean;
  message: string;
  errors: string | null;
  data: User | null;
}

export interface LoginRequest {
  /** backend accepts `login` (email/username) */
  login?: string;
  email?: string; // kept for backward compatibility; mapped to `login` in service
  password?: string;
}
