/**
 * Dashboard API Service
 * Service layer untuk semua dashboard-related API calls
 */

import { DashboardApiResponse } from '@/@types/dashboard';
import { ApiResponse } from '@/@types/api';
import { apiClient } from './client';
import { MOCK_DASHBOARD_DATA } from './mock-data';
import { dashboardResponseSchema } from '@/scheme/dashboard.schema';

/**
 * Environment flag untuk toggle mock data
 */
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || true;

/**
 * Dashboard Service
 */
export const dashboardService = {
  /**
   * Fetch dashboard data
   * Saat ini menggunakan mock data, nanti tinggal uncomment API call
   */
  async getDashboardData(): Promise<DashboardApiResponse> {
    if (USE_MOCK_DATA) {
      // Simulate network delay
      return new Promise((resolve) => {
        setTimeout(() => {
          // Validate dengan Zod schema
          const validated = dashboardResponseSchema.parse(MOCK_DASHBOARD_DATA);
          resolve(validated);
        }, 500);
      });
    }

    // Real API call (uncomment ketika backend ready)
    const response = await apiClient.get<ApiResponse<DashboardApiResponse>>('/dashboard');

    // Validate response dengan Zod
    const validated = dashboardResponseSchema.parse(response.data.data);
    return validated;
  },

  /**
   * Refresh dashboard data
   */
  async refreshDashboard(): Promise<DashboardApiResponse> {
    return this.getDashboardData();
  },
};
