import type { PaginatedResult } from './pagination.types';

export interface Vendor {
    id: number | string;
    uuid?: string;
    code?: string;
    name: string;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    pic?: string | null;
    userId?: number | string;
    companyId?: number | string;
    createdAt?: string;
    updatedAt?: string;
}

export interface VendorPayload {
    name: string;
    code?: string;
    address?: string;
    phone?: string;
    email?: string;
    pic?: string;
    userId?: number | string;
    companyId?: number | string;
}

export interface VendorListResponse extends PaginatedResult<Vendor> { }
