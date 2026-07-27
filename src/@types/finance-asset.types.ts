import { Asset, AssetType } from './asset.types';
import { PaginatedResult } from './pagination.types';

export interface FinanceAsset extends Asset {
    asset_id: number;
    price: number;
    purchase_date: string;
    serial_number?: string;
    economic_age?: number;
    depreciation?: number;
    depreciation_per_month?: number;
    final_value?: number;
    description?: string;
    asset?: Asset;
}

export interface FinanceAssetPayload {
    asset_id: number;
    price: number | string;
    purchase_date: string;
    economic_age: number;
    description: string;
    serial_number?: string;
    depreciation?: number;
    final_value?: number;
}

export type FinanceAssetListResponse = PaginatedResult<FinanceAsset>;
