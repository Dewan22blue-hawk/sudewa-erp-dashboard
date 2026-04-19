import type { Tarif, TarifListResponse, TarifPayload } from '@/@types/tarif.types';
import type { PaginationParams } from '@/@types/pagination.types';
import { apiClient } from '@/lib/api/client';
import { ApiResponseError, LaravelApiResponse, ensureSuccess, ApiValidationError } from '@/lib/api/response';

const basePath = '/wapi/master-data/tarif';

// ─── Internal: fetch raw list (no pagination/search params) ────────────────────
const getAllTarifsRaw = async (): Promise<any[]> => {
    const response = await apiClient.get<LaravelApiResponse<any>>(basePath);
    const raw = response.data;
    if (!raw.status) {
        throw new ApiResponseError(raw.message ?? 'Failed to fetch tarif list');
    }
    const payload = raw.data;
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.data)) return payload.data;
    return [];
};

const mapTarifItem = (item: any): Tarif => ({
    id: item.id,
    uuid: item.uuid,
    customerId: item.customer_id,
    loadingIn: item.loading_in || '',
    loadingOut: item.loading_out || '',
    distance: Number(item.distance) || 0,
    ujTowing: item.uj_towing !== null && item.uj_towing !== undefined ? Number(item.uj_towing) : null,
    ujCdd: item.uj_cdd !== null && item.uj_cdd !== undefined ? Number(item.uj_cdd) : null,
    ujFuso: item.uj_fuso !== null && item.uj_fuso !== undefined ? Number(item.uj_fuso) : null,
    invCdd: item.inv_cdd !== null && item.inv_cdd !== undefined ? Number(item.inv_cdd) : null,
    invFuso: item.inv_fuso !== null && item.inv_fuso !== undefined ? Number(item.inv_fuso) : null,
    isActive: item.is_active ?? true,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    customer: item.customer
        ? {
              id: item.customer.id,
              uuid: item.customer.uuid,
              name: item.customer.name,
              code: item.customer.code,
          }
        : undefined,
});

export const getTarifs = async (
    params: PaginationParams & { search?: string },
): Promise<TarifListResponse> => {
    const allRaw = await getAllTarifsRaw();
    const allItems: Tarif[] = allRaw.map(mapTarifItem);

    // ── Client-side search across multiple fields ──────────────────────────────
    const keyword = (params.search ?? '').toLowerCase().trim();
    const filtered = keyword
        ? allItems.filter((item) => {
              const customerName = (item.customer?.name ?? '').toLowerCase();
              const loadingIn = item.loadingIn.toLowerCase();
              const loadingOut = item.loadingOut.toLowerCase();
              return (
                  customerName.includes(keyword) ||
                  loadingIn.includes(keyword) ||
                  loadingOut.includes(keyword)
              );
          })
        : allItems;

    // ── Client-side pagination ─────────────────────────────────────────────────
    const page = params.page ?? 1;
    const perPage = params.perPage ?? 10;
    const total = filtered.length;
    const lastPage = Math.max(1, Math.ceil(total / perPage));
    const start = (page - 1) * perPage;
    const paged = filtered.slice(start, start + perPage);

    return {
        data: paged,
        meta: { currentPage: page, perPage, total, lastPage },
    };
};

export const getTarifById = async (id: string | number): Promise<Tarif> => {
    const response = await apiClient.get<LaravelApiResponse<any>>(`${basePath}/${id}`);
    const data = ensureSuccess(response.data);
    return mapTarifItem(data);
};

export const createTarif = async (data: TarifPayload): Promise<void> => {
    try {
        const response = await apiClient.post<LaravelApiResponse<any>>(basePath, data, {
            headers: { 'Content-Type': 'application/json' },
        });
        const payload = response.data;
        if (!payload.status) {
            throw new ApiResponseError(payload.message ?? 'Failed to create tarif');
        }
    } catch (error) {
        if (error instanceof ApiValidationError) throw error;
        throw error;
    }
};

export const updateTarif = async (id: string | number, data: TarifPayload): Promise<void> => {
    try {
        const response = await apiClient.put<LaravelApiResponse<any>>(`${basePath}/${id}`, data, {
            headers: { 'Content-Type': 'application/json' },
        });
        const payload = response.data;
        if (!payload.status) {
            throw new ApiResponseError(payload.message ?? 'Failed to update tarif');
        }
    } catch (error) {
        if (error instanceof ApiValidationError) throw error;
        throw error;
    }
};

export const deleteTarif = async (id: string | number): Promise<void> => {
    const response = await apiClient.delete<LaravelApiResponse<any>>(`${basePath}/${id}`);
    const payload = response.data;
    if (!payload.status) {
        throw new ApiResponseError(payload.message ?? 'Failed to delete tarif');
    }
};
