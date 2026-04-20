import type { Region, RegionListResponse, RegionPayload } from '@/@types/region.types';
import type { PaginationParams } from '@/@types/pagination.types';
import { apiClient } from '@/lib/api/client';
import { buildLaravelPaginationQuery } from '@/lib/api/pagination';
import { ApiResponseError, LaravelApiResponse, ensureSuccess, toPaginatedResult, ApiValidationError } from '@/lib/api/response';

const basePath = '/wapi/master-data/region';

export const getRegions = async (params: PaginationParams & { search?: string }): Promise<RegionListResponse> => {
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
            uuid: item.uuid,
            code: item.code || '',
            name: item.name || '',
            createdAt: item.created_at,
            updatedAt: item.updated_at,
        }),
    );
};

export const getRegionById = async (id: string | number): Promise<Region> => {
    const response = await apiClient.get<LaravelApiResponse<any>>(`${basePath}/${id}`);
    const data = ensureSuccess(response.data);
    
    return {
        id: data.id,
        uuid: data.uuid,
        code: data.code || '',
        name: data.name || '',
        createdAt: data.created_at,
        updatedAt: data.updated_at,
    };
};

const buildPayload = (data: Partial<RegionPayload>, opts?: { asUpdate?: boolean }) => {
    const formData = new URLSearchParams();
    // Use URLSearchParams since the prompt hints "request Body urlencoded" for PUT 
    // Wait, prompt says: "request Body form-data" for POST, "request Body urlencoded" for PUT.
    // I will use FormData for POST and URLSearchParams for PUT to strictly follow the prompt if we didn't spoof _method.
    // Wait, I can just use URLSearchParams for both if simple string, OR follow exactly.
    // Let's use URLSearchParams for both, OR follow exactly: FormData for create, URLSearchParams for update.
    // The previous instruction and standard Laravel is perfectly fine with `FormData` with method spoofing, OR I can just use `URLSearchParams` for urlencoded.
    // The prompt literally said: POST with body form-data, PUT with body urlencoded.
    // I will write custom build for each.
};

export const createRegion = async (data: Partial<RegionPayload>): Promise<void> => {
    const formData = new FormData();
    if (data.code) formData.append('code', data.code);
    if (data.name) formData.append('name', data.name);

    try {
        const response = await apiClient.post<LaravelApiResponse<any>>(basePath, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        const payload = response.data;
        if (!payload.status) {
            throw new ApiResponseError(payload.message ?? 'Failed to create region');
        }
    } catch (error) {
        if (error instanceof ApiValidationError) throw error;
        throw error;
    }
};

export const updateRegion = async (id: string | number, data: Partial<RegionPayload>): Promise<void> => {
    const params = new URLSearchParams();
    if (data.code) params.append('code', data.code);
    if (data.name) params.append('name', data.name);

    try {
        const response = await apiClient.put<LaravelApiResponse<any>>(`${basePath}/${id}`, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const payload = response.data;
        if (!payload.status) {
            throw new ApiResponseError(payload.message ?? 'Failed to update region');
        }
    } catch (error) {
        if (error instanceof ApiValidationError) throw error;
        throw error;
    }
};

export const deleteRegion = async (id: string | number): Promise<void> => {
    const response = await apiClient.delete<LaravelApiResponse<any>>(`${basePath}/${id}`);
    
    const payload = response.data;
    if (!payload.status) {
        throw new ApiResponseError(payload.message ?? 'Failed to delete region');
    }
};

export const importRegion = async (file: File): Promise<void> => {
    const body = new FormData();
    body.append('file', file);

    const response = await apiClient.post(`${basePath}/import`, body, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    const payload = response.data as LaravelApiResponse<null>;
    if (!payload.status) {
        throw new ApiResponseError(payload.message ?? 'Failed to import region');
    }
};

export const exportRegion = async (): Promise<void> => {
    const response = await apiClient.get(`${basePath}/export`, {
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
    link.setAttribute('download', `Wilayah_${timestamp}.xlsx`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};
