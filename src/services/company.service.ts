import { apiClient } from '@/lib/api/client';
import { LaravelApiResponse, ensureSuccess } from '@/lib/api/response';

export interface CompanyModule {
  id: number;
  name: string;
  slug?: string;
  description?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Company {
  id: number;
  uuid?: string;
  name: string;
  slug: string;
  code?: string;
  description?: string | null;
  type?: string;
  created_at?: string | null;
  updated_at?: string | null;
  modules?: CompanyModule[];
}

type CompanyListApiResponse = LaravelApiResponse<Company[] | Company>;

export async function fetchUserCompanies(): Promise<Company[]> {
  const response = await apiClient.get<CompanyListApiResponse>('/wapi/global/company');
  const data = ensureSuccess(response.data);
  const list = Array.isArray(data) ? data : data ? [data] : [];
  
  // Exclude company_id = 5 (PT Adhiyas Agradasta) temporarily for separate dashboard
  return list.filter(company => company.id !== 5);
}

export async function fetchCompanyDetail(slug: string): Promise<Company> {
  const response = await apiClient.get<LaravelApiResponse<Company>>(`/wapi/global/company/${slug}`);
  const data = ensureSuccess(response.data);
  return data;
}
