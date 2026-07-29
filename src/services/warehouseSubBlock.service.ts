import { apiClient } from '@/lib/api/client';
import { ApiResponse } from './tax.service';
import { WarehouseSubBlock } from './warehouseBlock.service';

export interface CreateUpdateWarehouseSubBlockDTO {
  warehouse_block_id: number;
  name: string;
  description: string;
  is_active: boolean;
  is_default: boolean;
}

export const createWarehouseSubBlock = async (data: CreateUpdateWarehouseSubBlockDTO) => {
  const formData = new URLSearchParams();
  formData.append('warehouse_block_id', String(data.warehouse_block_id));
  formData.append('name', data.name);
  formData.append('description', data.description);
  formData.append('is_active', data.is_active ? '1' : '0');
  formData.append('is_default', data.is_default ? '1' : '0');
  
  const response = await apiClient.post<ApiResponse<WarehouseSubBlock>>(`/wapi/master-data/warehouse-sub-block`, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  return response.data;
};

export const updateWarehouseSubBlock = async (id: number, data: CreateUpdateWarehouseSubBlockDTO) => {
  const formData = new URLSearchParams();
  formData.append('warehouse_block_id', String(data.warehouse_block_id));
  formData.append('name', data.name);
  formData.append('description', data.description);
  formData.append('is_active', data.is_active ? '1' : '0');
  formData.append('is_default', data.is_default ? '1' : '0');
  formData.append('_method', 'PUT');
  
  const response = await apiClient.post<ApiResponse<WarehouseSubBlock>>(`/wapi/master-data/warehouse-sub-block/${id}`, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  return response.data;
};

export const makeDefaultWarehouseSubBlock = async (id: number, data: CreateUpdateWarehouseSubBlockDTO) => {
  const formData = new URLSearchParams();
  formData.append('warehouse_block_id', String(data.warehouse_block_id));
  formData.append('name', data.name);
  formData.append('description', data.description);
  formData.append('is_active', data.is_active ? '1' : '0');
  formData.append('is_default', data.is_default ? '1' : '0');
  formData.append('_method', 'PUT');
  
  const response = await apiClient.post<ApiResponse<WarehouseSubBlock>>(`/wapi/master-data/warehouse-sub-block/${id}/make-default`, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  return response.data;
};

export const assignSubBlock = async (id: number, unitTransactionItemDetailsIds: number[]) => {
  const formData = new URLSearchParams();
  formData.append('unit_transaction_item_details_ids', JSON.stringify(unitTransactionItemDetailsIds));
  formData.append('_method', 'PUT');

  const response = await apiClient.post<ApiResponse<WarehouseSubBlock>>(`/wapi/master-data/warehouse-sub-block/${id}/assign-sub-block`, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  return response.data;
};

export const deleteWarehouseSubBlock = async (id: number) => {
  const response = await apiClient.delete<ApiResponse<any>>(`/wapi/master-data/warehouse-sub-block/${id}`);
  return response.data;
};
