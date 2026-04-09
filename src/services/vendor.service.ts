import type { Vendor, VendorListResponse } from '@/@types/vendor.types';
import type { PaginationParams } from '@/@types/pagination.types';
import { apiClient } from '@/lib/api/client';
import { buildLaravelPaginationQuery } from '@/lib/api/pagination';
import { ApiResponseError, LaravelApiResponse, ensureSuccess, toPaginatedResult } from '@/lib/api/response';

const basePath = '/wapi/master-data/vendor';

export const getVendors = async (params: PaginationParams & { search?: string; company_id?: string | number }): Promise<VendorListResponse> => {
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
            name: item.name || '',
            address: item.address || '',
            phone: item.phone || '',
            email: item.email || '',
            pic: item.pic || '',
            companyId: item.company_id,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
        }),
    );
};

export const importVendor = async (file: File, companyId?: string | number): Promise<void> => {
    const body = new FormData();
    body.append('file', file);

    const url = companyId ? `${basePath}/${companyId}/import` : `${basePath}/import`;

    const response = await apiClient.post(url, body, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    const payload = response.data as LaravelApiResponse<null>;
    if (!payload.status) {
        throw new ApiResponseError(payload.message ?? 'Failed to import vendor');
    }
};
