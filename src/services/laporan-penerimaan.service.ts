import { apiClient } from '@/lib/api/client';

export interface PenerimaanParams {
  page?: number;
  per_page?: number;
  start_date?: string;
  end_date?: string;
  person_id?: number;
  unit_type_id?: number;
  sort_dir?: 'asc' | 'desc';
}

export interface PenerimaanItem {
  id: number;
  transaction_code: string;
  receipt_date: string;
  person: string;
  unit_type: { id: number; name: string };
  machine_number: string;
  chassis_number: string;
  color: string;
  warehouse_movement?: { serial_number: string };
}

export interface PenerimaanResponse {
  current_page: number;
  data: PenerimaanItem[];
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export const getLaporanPenerimaan = async (
  params: PenerimaanParams = {}
): Promise<PenerimaanResponse> => {
  const response = await apiClient.get('/wapi/report/unit-type-detail-report', {
    params: {
      sort_dir: 'desc',
      ...params,
    },
  });
  return response.data.data;
};

export const getSuppliers = async () => {
  const response = await apiClient.get('/wapi/master-data/supplier', {
    params: { per_page: 1000 },
  });
  return response.data.data;
};

export const getUnitTypes = async () => {
  const response = await apiClient.get('/wapi/master-data/unit-type', {
    params: { sort_by: 'created_at', sort_order: 'asc' },
  });
  return response.data.data;
};
