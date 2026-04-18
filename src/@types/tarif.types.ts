import type { PaginatedResult } from './pagination.types';
import type { Customer } from './customer.types';

export interface Tarif {
    id: number;
    uuid?: string;
    customerId: number;
    loadingIn: string;
    loadingOut: string;
    distance: number;
    ujTowing?: number | null;
    ujCdd?: number | null;
    ujFuso?: number | null;
    invCdd?: number | null;
    invFuso?: number | null;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
    customer?: Partial<Customer>;
}

export interface TarifPayload {
    customer_id: number;
    loading_in: string;
    loading_out: string;
    distance: number;
    uj_towing?: number | null;
    uj_cdd?: number | null;
    uj_fuso?: number | null;
    inv_cdd?: number | null;
    inv_fuso?: number | null;
    is_active?: boolean;
}

export type TarifListResponse = PaginatedResult<Tarif>;
