import { apiClient } from '@/lib/api/client';
import { buildLaravelPaginationQuery } from '@/lib/api/pagination';
import { ApiResponseError, ApiValidationError, ensureSuccess, type LaravelApiResponse, toPaginatedResult } from '@/lib/api/response';
import type {
  WithholdingTaxItem,
  WithholdingTaxListParams,
  WithholdingTaxListResponse,
  WithholdingTaxPayload,
} from '@/@types/withholding-tax.types';

const basePath = '/wapi/finance/withholding-tax';

const mapWithholdingTax = (item: any): WithholdingTaxItem => {
  return {
    id: Number(item.id ?? 0),
    company_id: item.company_id ? Number(item.company_id) : null,
    source: item.source ?? 'internal',
    cash_id: item.cash_id ? Number(item.cash_id) : null,
    unit_transaction_id: item.unit_transaction_id ? Number(item.unit_transaction_id) : null,
    bbn_bill_id: item.bbn_bill_id ? Number(item.bbn_bill_id) : null,
    do_invoice_id: item.do_invoice_id ? Number(item.do_invoice_id) : null,
    withholding_number: item.withholding_number ?? null,
    withholding_age: item.withholding_age ? Number(item.withholding_age) : null,
    pph_amount: item.pph_amount ? Number(item.pph_amount) : null,
    pph_description: item.pph_description ?? null,
    payment_amount: item.payment_amount ? Number(item.payment_amount) : null,
    payment_date: item.payment_date ?? null,
    created_at: item.created_at ?? null,
    updated_at: item.updated_at ?? null,
    company: item.company,
    cash: item.cash,
    unit_transaction: item.unit_transaction,
    bbn_bill: item.bbn_bill,
    do_invoice: item.do_invoice,
  };
};

const buildPayloadBody = (payload: WithholdingTaxPayload): FormData => {
  const body = new FormData();
  body.append('source', payload.source);
  body.append('withholding_number', payload.withholding_number);
  body.append('withholding_age', String(payload.withholding_age));
  body.append('pph_amount', String(payload.pph_amount));
  body.append('payment_amount', String(payload.payment_amount));
  body.append('payment_date', payload.payment_date);

  if (payload.pph_description) {
    body.append('pph_description', payload.pph_description);
  }

  if (payload.company_id != null) {
    body.append('company_id', String(payload.company_id));
  }

  if (payload.cash_id != null) {
    body.append('cash_id', String(payload.cash_id));
  }

  if (payload.do_invoice_id != null) {
    body.append('do_invoice_id', String(payload.do_invoice_id));
  }

  if (payload.unit_transaction_id != null) {
    body.append('unit_transaction_id', String(payload.unit_transaction_id));
  }

  if (payload.bbn_bill_id != null) {
    body.append('bbn_bill_id', String(payload.bbn_bill_id));
  }

  // The PUT request might use _method=PUT to simulate it through POST, or just use FormData with POST
  // In Laravel, PUT with multipart/form-data often requires POST + _method=PUT, but apiClient.put handles it?
  // Actually, we'll let apiClient handle the serialization or explicitly pass it if needed.
  return body;
};

export const getWithholdingTaxList = async (params: WithholdingTaxListParams): Promise<WithholdingTaxListResponse> => {
  const response = await apiClient.get<LaravelApiResponse<any>>(basePath, {
    params: {
      ...buildLaravelPaginationQuery(params),
      source: params.source,
      company_id: params.company_id,
      cash_id: params.cash_id,
      do_invoice_id: params.do_invoice_id,
      withholding_number: params.withholding_number,
      withholding_age: params.withholding_age,
      pph_amount: params.pph_amount,
      pph_description: params.pph_description,
      payment_amount: params.payment_amount,
      payment_date: params.payment_date,
      order_by: params.order_by ?? 'created_at',
      order_dir: params.order_dir ?? 'desc',
    },
  });

  const payload = ensureSuccess(response.data);
  return toPaginatedResult(payload, mapWithholdingTax);
};

export const getWithholdingTaxDetail = async (id: string | number): Promise<WithholdingTaxItem> => {
  const response = await apiClient.get<LaravelApiResponse<any>>(`${basePath}/${id}`);
  return mapWithholdingTax(ensureSuccess(response.data));
};

export const createWithholdingTax = async (payload: WithholdingTaxPayload): Promise<WithholdingTaxItem> => {
  try {
    const response = await apiClient.post<LaravelApiResponse<any>>(basePath, buildPayloadBody(payload), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return mapWithholdingTax(ensureSuccess(response.data));
  } catch (error) {
    if (error instanceof ApiValidationError) throw error;
    throw error;
  }
};

export const updateWithholdingTax = async (id: string | number, payload: WithholdingTaxPayload): Promise<WithholdingTaxItem> => {
  try {
    // In Laravel, if updating with FormData, we usually POST with _method=PUT
    const body = buildPayloadBody(payload);
    body.append('_method', 'PUT');

    const response = await apiClient.post<LaravelApiResponse<any>>(`${basePath}/${id}`, body, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return mapWithholdingTax(ensureSuccess(response.data));
  } catch (error) {
    if (error instanceof ApiValidationError) throw error;
    throw error;
  }
};

export const deleteWithholdingTax = async (id: string | number): Promise<void> => {
  const response = await apiClient.delete<LaravelApiResponse<null>>(`${basePath}/${id}`);
  if (!response.data.status) {
    throw new ApiResponseError(response.data.message ?? 'Failed to delete withholding tax data');
  }
};
