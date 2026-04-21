import { PaginatedResult } from './pagination.types';

export type AssetType = 'inventory' | 'vehicles' | 'buildings' | 'land';

export interface Asset {
    id: number;
    uuid: string;
    company_id: number;
    code: string;
    purchase_date: string;
    name: string;
    type: AssetType;
    price: number;
    serial_number?: string | null;
    created_at: string;
    updated_at: string;
}

export interface AssetPayload {
    company_id: number;
    name: string;
    code: string;
    purchase_date: string;
    type: AssetType;
    price: number | string;
    serial_number?: string;
}

export type AssetListResponse = PaginatedResult<Asset>;
