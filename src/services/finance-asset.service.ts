import type { FinanceAsset, FinanceAssetListResponse, FinanceAssetPayload } from '@/@types/finance-asset.types';
import type { PaginationParams } from '@/@types/pagination.types';
import { apiClient } from '@/lib/api/client';
import { buildLaravelPaginationQuery } from '@/lib/api/pagination';
import { ApiResponseError, LaravelApiResponse, ensureSuccess, toPaginatedResult, ApiValidationError } from '@/lib/api/response';

const basePath = '/wapi/finance/finance-asset';

export const getFinanceAssets = async (params: PaginationParams & { search?: string; company_id?: string | number }): Promise<FinanceAssetListResponse> => {
    const response = await apiClient.get<LaravelApiResponse<any>>(basePath, {
        params: {
            ...buildLaravelPaginationQuery(params),
            company_id: params.company_id,
        },
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
            ...item,
            code: item.asset?.code || item.code || '',
            purchase_date: item.asset?.purchase_date || item.purchase_date || '',
            name: item.asset?.name || item.name || '',
            type: item.asset?.type || item.type || '',
            price: Number(item.asset?.price || item.price) || 0,
            serial_number: item.serial_number || item.asset?.serial_number || '',
            depreciation: Number(item.depreciation) || Number(item.depreciation_per_month) || 0,
            depreciation_per_month: Number(item.depreciation_per_month) || Number(item.depreciation) || 0,
            final_value: Number(item.final_value || item.nilai_akhir) || 0,
            economic_age: Number(item.economic_age) || 0,
        }),
    );
};

export const getFinanceAssetById = async (id: string | number): Promise<FinanceAsset> => {
    const response = await apiClient.get<LaravelApiResponse<any>>(`${basePath}/${id}`);
    const data = ensureSuccess(response.data);
    
    return {
        ...data,
        code: data.asset?.code || data.code || '',
        purchase_date: data.asset?.purchase_date || data.purchase_date || '',
        name: data.asset?.name || data.name || '',
        type: data.asset?.type || data.type || '',
        price: Number(data.asset?.price || data.price) || 0,
        serial_number: data.serial_number || data.asset?.serial_number || '',
        depreciation: Number(data.depreciation) || 0,
        depreciation_per_month: Number(data.depreciation_per_month) || Number(data.depreciation) || 0,
        final_value: Number(data.final_value || data.nilai_akhir) || 0,
        economic_age: Number(data.economic_age) || 0,
    };
};

export const updateFinanceAsset = async (id: string | number, data: Partial<FinanceAssetPayload>): Promise<void> => {
    try {
        const params = new URLSearchParams();
        if (data.economic_age !== undefined && data.economic_age !== null) {
            params.append('economic_age', String(data.economic_age));
        }
        if (data.depreciation !== undefined && data.depreciation !== null) {
            params.append('depreciation', String(data.depreciation));
        }
        if (data.final_value !== undefined && data.final_value !== null) {
            params.append('final_value', String(data.final_value));
        }
        if (data.description !== undefined && data.description !== null) {
            params.append('description', data.description);
        }

        const response = await apiClient.put<LaravelApiResponse<any>>(`${basePath}/${id}`, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const result = response.data;
        if (!result.status) {
            throw new ApiResponseError(result.message ?? 'Failed to update finance asset');
        }
    } catch (error) {
        if (error instanceof ApiValidationError) throw error;
        throw error;
    }
};

export const deleteFinanceAsset = async (id: string | number): Promise<void> => {
    const response = await apiClient.delete<LaravelApiResponse<any>>(`${basePath}/${id}`);
    
    const payload = response.data;
    if (!payload.status) {
        throw new ApiResponseError(payload.message ?? 'Failed to delete finance asset');
    }
};

export const exportFinanceAsset = async (): Promise<void> => {
    // User specified this exact URL for export
    const response = await apiClient.get(`/wapi/master-data/asset/export`, {
        responseType: 'blob',
    });

    const contentType = response.headers['content-type'];
    const isJson = contentType && contentType.includes('application/json');

    if (isJson) {
        const textData = await (response.data as Blob).text();
        const jsonResponse = JSON.parse(textData);
        throw new ApiResponseError(jsonResponse.message ?? 'Failed to export data');
    }

    const url = window.URL.createObjectURL(new Blob([response.data as Blob]));
    const link = document.createElement('a');
    link.href = url;
    
    const timestamp = new Date().getTime();
    link.setAttribute('download', `Finance_Asset_${timestamp}.xlsx`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};
