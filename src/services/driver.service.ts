import type { Driver, DriverListResponse, DriverPayload } from '@/@types/driver.types';
import type { PaginationParams } from '@/@types/pagination.types';
import { apiClient } from '@/lib/api/client';
import { buildLaravelPaginationQuery } from '@/lib/api/pagination';
import {
    ApiResponseError,
    LaravelApiResponse,
    ensureSuccess,
    toPaginatedResult,
    ApiValidationError,
} from '@/lib/api/response';

const basePath = '/wapi/master-data/driver';

const mapDriver = (item: any): Driver => ({
    id: item.id,
    uuid: item.uuid,
    companyId: item.company_id,
    name: item.name || '',
    address: item.address || '',
    phone: item.phone || '',
    npwp: item.npwp || '',
    picName: item.pic_name ?? null,
    mapLink: item.map_link ?? null,
    identityNumber: item.identity_number || '',
    driveLicenseNumber: item.drive_license_identity_number || '',
    joinedAt: item.joined_at ?? null,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
});

// ─── List (server-side pagination & search via Laravel) ───────────────────────
export const getDrivers = async (
    params: PaginationParams & { search?: string },
): Promise<DriverListResponse> => {
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
        mapDriver,
    );
};

// ─── Get by ID ─────────────────────────────────────────────────────────────────
export const getDriverById = async (id: string | number): Promise<Driver> => {
    const response = await apiClient.get<LaravelApiResponse<any>>(`${basePath}/${id}`);
    const data = ensureSuccess(response.data);
    return mapDriver(data);
};

// ─── Create ────────────────────────────────────────────────────────────────────
export const createDriver = async (data: DriverPayload): Promise<void> => {
    // API expects application/json — build a plain object so all fields are sent
    const body: Record<string, any> = {
        name: data.name,
    };
    if (data.company_id !== undefined) body['company_id'] = data.company_id;
    if (data.address)   body['address']  = data.address;
    if (data.phone)     body['phone']    = data.phone;
    if (data.npwp)      body['npwp']     = data.npwp;
    if (data.pic_name)  body['pic_name'] = data.pic_name;
    if (data.map_link)  body['map_link'] = data.map_link;

    // KTP — send under both common aliases so whichever the backend uses will match
    if (data.identity_number) {
        body['identity_number'] = data.identity_number;
        body['ktp']             = data.identity_number; // short alias
    }
    // SIM — same dual-send strategy
    if (data.drive_license_identity_number) {
        body['drive_license_identity_number'] = data.drive_license_identity_number;
        body['sim']                           = data.drive_license_identity_number; // short alias
    }
    // TGL Gabung
    if (data.joined_at) {
        body['joined_at']  = data.joined_at;
        body['tgl_gabung'] = data.joined_at; // short alias
    }

    try {
        const response = await apiClient.post<LaravelApiResponse<any>>(basePath, body, {
            headers: { 'Content-Type': 'application/json' },
        });
        const payload = response.data;
        if (!payload.status) {
            throw new ApiResponseError(payload.message ?? 'Failed to create driver');
        }
    } catch (error) {
        if (error instanceof ApiValidationError) throw error;
        throw error;
    }
};

// ─── Update ────────────────────────────────────────────────────────────────────
export const updateDriver = async (id: string | number, data: DriverPayload): Promise<void> => {
    // Laravel PUT via axios.put — send JSON body directly
    const body: Record<string, any> = {
        name: data.name,
    };
    if (data.company_id !== undefined) body['company_id'] = data.company_id;
    if (data.address)   body['address']  = data.address;
    if (data.phone)     body['phone']    = data.phone;
    if (data.npwp)      body['npwp']     = data.npwp;
    if (data.pic_name)  body['pic_name'] = data.pic_name;
    if (data.map_link)  body['map_link'] = data.map_link;

    // KTP — dual alias
    if (data.identity_number) {
        body['identity_number'] = data.identity_number;
        body['ktp']             = data.identity_number;
    }
    // SIM — dual alias
    if (data.drive_license_identity_number) {
        body['drive_license_identity_number'] = data.drive_license_identity_number;
        body['sim']                           = data.drive_license_identity_number;
    }
    // TGL Gabung — dual alias
    if (data.joined_at) {
        body['joined_at']  = data.joined_at;
        body['tgl_gabung'] = data.joined_at;
    }

    try {
        const response = await apiClient.put<LaravelApiResponse<any>>(
            `${basePath}/${id}`,
            body,
            { headers: { 'Content-Type': 'application/json' } },
        );
        const payload = response.data;
        if (!payload.status) {
            throw new ApiResponseError(payload.message ?? 'Failed to update driver');
        }
    } catch (error) {
        if (error instanceof ApiValidationError) throw error;
        throw error;
    }
};

// ─── Delete ────────────────────────────────────────────────────────────────────
export const deleteDriver = async (id: string | number): Promise<void> => {
    const response = await apiClient.delete<LaravelApiResponse<any>>(`${basePath}/${id}`);
    const payload = response.data;
    if (!payload.status) {
        throw new ApiResponseError(payload.message ?? 'Failed to delete driver');
    }
};

// ─── Import ────────────────────────────────────────────────────────────────────
export const importDriver = async (id: string | number, file: File): Promise<void> => {
    const body = new FormData();
    body.append('file', file);

    const response = await apiClient.post(`${basePath}/${id}/import`, body, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

    const payload = response.data as LaravelApiResponse<null>;
    if (!payload.status) {
        throw new ApiResponseError(payload.message ?? 'Failed to import driver data');
    }
};

// ─── Export ────────────────────────────────────────────────────────────────────
export const exportDriver = async (): Promise<void> => {
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
    link.setAttribute('download', `Driver_${timestamp}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};
