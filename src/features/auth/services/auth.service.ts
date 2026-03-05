import { apiClient } from '@/lib/api/client';
import { AuthResponse, LoginRequest, ProfileResponse } from '../types/auth.types';

export class AuthService {
  /**
   * Logs in a user using email and password against the backend API.
   *
   * Handles custom business logic responses (e.g. Account not activated or Invalid credentials)
   * which return 200 OK with `status: false` instead of standard HTTP error codes.
   */
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    const body = new URLSearchParams();
    const loginValue = credentials.login || credentials.email; // backend uses `login` (email/username)
    if (loginValue) body.append('login', loginValue);
    if (credentials.password) body.append('password', credentials.password);

    const response = await apiClient.post<AuthResponse>(`/wapi/auth/login`, body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    // Check if business logic failed even with 200 OK HTTP status
    if (!response.data.status) {
      throw new Error(response.data.message || 'Login failed');
    }

    return response.data;
  }

  static async me(): Promise<ProfileResponse> {
    const response = await apiClient.get<ProfileResponse>('/wapi/auth/me');

    if (!response.data.status) {
      throw new Error(response.data.message || 'Failed to fetch profile');
    }

    return response.data;
  }
}
