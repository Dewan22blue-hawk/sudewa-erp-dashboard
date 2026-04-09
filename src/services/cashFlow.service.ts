import { apiClient } from '@/lib/api/client';

export interface CashFlowQueryParams {
  page?: number;
  per_page?: number;
  start_date?: string;
  end_date?: string;
  search?: string;
}

export interface CashFlowItem {
  id: number;
  code: string;
  date: string;
  note: string;
  debet: number;
  credit: number;
  cash: { description: string };
}

export interface CashFlowResponse {
  current_page: number;
  data: CashFlowItem[];
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export const cashFlowService = {
  async getCashFlow(params: CashFlowQueryParams = {}): Promise<CashFlowResponse> {
    const response = await apiClient.get('/wapi/finance/cash-flow', { params });
    return response.data.data;
  },
};
