import { Asset, AssetType } from './asset.types';
import { PaginatedResult } from './pagination.types';

export interface FinanceAsset extends Asset {
    serial_number?: string;
    economic_age?: number;
    depreciation?: number;
    depreciation_per_month?: number;
    final_value?: number;
    description?: string;
}

export interface FinanceAssetPayload {
    economic_age: number;
    depreciation: number;
    description: string;
    serial_number?: string;
    final_value?: number;
}

export type FinanceAssetListResponse = PaginatedResult<FinanceAsset>;
