import { apiClient } from '@/lib/api/client';
import { LaravelApiResponse, ensureSuccess } from '@/lib/api/response';

export interface Company {
  id: number;
  uuid?: string;
  name: string;
  slug: string;
  code?: string;
  description?: string;
  type?: string;
  created_at?: string | null;
}

type CompanyListApiResponse = LaravelApiResponse<Company[]>;

export async function fetchUserCompanies(): Promise<Company[]> {
  const response = await apiClient.get<CompanyListApiResponse>('/wapi/global/company');
  const data = ensureSuccess(response.data);
  return data;
}
