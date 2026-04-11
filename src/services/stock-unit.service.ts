import { StockUnit, StockStatus } from '@/@types/stock-unit.types';
import type { PaginationParams } from '@/@types/pagination.types';
import { apiClient } from '@/lib/api/client';
import { buildLaravelPaginationQuery } from '@/lib/api/pagination';
import { LaravelApiResponse, ensureSuccess, toPaginatedResult } from '@/lib/api/response';

interface StockUnitApiModel {
  id: number;
  unit_transaction_item_id?: number;
  unit_type?: {
    id: number;
    code: string;
    name: string;
    unit_type: string;
    unit_model: string;
  };
  color: string;
  machine_number: string;
  chassis_number: string;
  stock_state: string; // Keep stock_state for API request params
  status: string; // Use 'status' directly from API response
  in_stock: boolean;
  type_unit_name?: string;
}

const mapStockUnit = (payload: StockUnitApiModel): StockUnit => ({
  id: payload.id.toString(),
  tipeUnit: payload.unit_type?.unit_type ?? '-',
  warna: payload.color,
  noMesin: payload.machine_number,
  noRangka: payload.chassis_number,
  status: payload.status as StockStatus, // Map from payload.status
});

type PaginatedStockUnitResponse = LaravelApiResponse<{
  data: StockUnitApiModel[];
  current_page: number;
  perPage: number;
  total: number;
  last_page: number;
}>;

export const getStockUnits = async (
  companyId: number | string,
  params: PaginationParams & {
    stock_state?: string; // Corrected from 'status'
    machine_number?: string;
    chassis_number?: string;
    color?: string;
    search?: string; // Added search param for consistency
  },
) => {
  const response = await apiClient.get<PaginatedStockUnitResponse>(
    `/wapi/warehouse/warehouse-get-unit-transaction-item-details/${companyId}`,
    {
      params: {
        ...buildLaravelPaginationQuery(params), // Handles page, perPage, search, stock_state
        // Explicitly passing common parameters again to ensure they are sent
        // This might be redundant if buildLaravelPaginationQuery handles all, but ensures coverage.
        page: params.page,
        perPage: params.perPage, // Explicitly pass per_page
        search: params.search,
        stock_state: params.stock_state,
        machine_number: params.machine_number,
        chassis_number: params.chassis_number,
        color: params.color,
      },
    },
  );

  const data = ensureSuccess(response.data);

  return toPaginatedResult(
    {
      data: data.data ?? [],
      current_page: data.current_page,
      per_page: data.perPage,
      total: data.total,
      last_page: data.last_page,
    },
    mapStockUnit,
  );
};