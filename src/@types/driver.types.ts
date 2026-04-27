import type { PaginatedResult } from './pagination.types';

export interface Driver {
    id: number;
    uuid?: string;
    companyId?: number | string;
    userId?: number | string;
    code?: string;
    type?: string;
    name: string;
    address?: string;
    phone?: string;
    npwp?: string;
    picName?: string | null;
    image?: string | null;
    mapLink?: string | null;
    identityNumber?: string;
    driveLicenseNumber?: string;
    socialMedia1Link?: string | null;
    socialMedia2Link?: string | null;
    socialMedia3Link?: string | null;
    socialMedia4Link?: string | null;
    websiteLink?: string | null;
    joinedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface DriverPayload {
    company_id?: number | string;
    user_id?: number | string;
    name: string;
    address?: string;
    phone?: string;
    npwp?: string;
    pic_name?: string | null;
    image?: File | null;
    map_link?: string | null;
    identity_number?: string;
    drive_license_identity_number?: string;
    social_media_1_link?: string | null;
    social_media_2_link?: string | null;
    social_media_3_link?: string | null;
    social_media_4_link?: string | null;
    website_link?: string | null;
    join_date?: string | null;
}

export type DriverListResponse = PaginatedResult<Driver>;
