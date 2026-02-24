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
    const params = new URLSearchParams();
    if (credentials.email) params.append('email', credentials.email);
    if (credentials.password) params.append('password', credentials.password);

    // Using POST with query params as per API requirements
    const response = await apiClient.post<AuthResponse>(`/wapi/auth/login?${params.toString()}`);

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
