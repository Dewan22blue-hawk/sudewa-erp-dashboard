import { apiClient } from '@/lib/api/client';
import { type LaravelApiResponse, ensureSuccess } from '@/lib/api/response';

const basePath = '/wapi/transaction/goods-transaction';

export const uploadGoodsTransactionInvoice = async (id: number | string, file: File): Promise<void> => {
  try {
    const body = new FormData();
    body.append('file', file);
    body.append('invoice_file', file);

    const response = await apiClient.post<LaravelApiResponse<null>>(`${basePath}/${id}/upload-invoice`, body, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    ensureSuccess(response.data);
  } catch (error) {
    throw error;
  }
};
