import type { Dealer, DealerListResponse } from '@/@types/dealer.types';
import type { PaginationParams } from '@/@types/pagination.types';
import { apiClient } from '@/lib/api/client';
import { buildLaravelPaginationQuery } from '@/lib/api/pagination';
import { ApiResponseError, LaravelApiResponse, ensureSuccess, toPaginatedResult } from '@/lib/api/response';

const basePath = '/wapi/master-data/dealer';

export const getDealers = async (params: PaginationParams & { search?: string; company_id?: string | number }): Promise<DealerListResponse> => {
    const response = await apiClient.get<LaravelApiResponse<any>>(basePath, {
        params: buildLaravelPaginationQuery(params),
    });

    const data = ensureSuccess(response.data);

    return toPaginatedResult(
        {
            data: data.data ?? [],
            current_page: data.current_page,
            per_page: data.per_page,
            total: data.total,
            last_page: data.last_page,
        },
        (item: any) => ({
            id: item.id,
            namaDealer: item.nama_dealer || item.name || '',
            alamat: item.alamat || item.address || '',
            pic: item.pic || '',
            handphone: item.handphone || item.phone || '',
            companyId: item.company_id,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
        }),
    );
};

export const importDealer = async (companyId: string | number, file: File): Promise<void> => {
    const body = new FormData();
    body.append('file', file);

    const response = await apiClient.post(`${basePath}/${companyId}/import`, body, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    const payload = response.data as LaravelApiResponse<null>;
    if (!payload.status) {
        throw new ApiResponseError(payload.message ?? 'Failed to import dealer');
    }
};
