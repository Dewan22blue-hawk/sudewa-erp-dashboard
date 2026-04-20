import type { PaginatedResult } from './pagination.types';

export interface Driver {
    id: number;
    uuid?: string;
    companyId?: number | string;
    name: string;
    address?: string;
    phone?: string;
    npwp?: string;
    picName?: string | null;
    mapLink?: string | null;
    /** KTP number — stored as identity_number in the API */
    identityNumber?: string;
    /** SIM number — stored as drive_license_identity_number in the API */
    driveLicenseNumber?: string;
    /** Join date — stored as joined_at in the API */
    joinedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface DriverPayload {
    company_id?: number | string;
    name: string;
    address?: string;
    phone?: string;
    npwp?: string;
    pic_name?: string | null;
    map_link?: string | null;
    identity_number?: string;
    drive_license_identity_number?: string;
    joined_at?: string | null;
}

export type DriverListResponse = PaginatedResult<Driver>;
