import { useFinanceRefundList } from '@/hooks/useFinanceRefund';

export const useRefundBeli = (params: { page?: number; perPage?: number; search?: string; status?: 'all' | 'waiting' | 'approve' | 'reject' } = {}) =>
  useFinanceRefundList({
    page: params.page,
    per_page: params.perPage,
    search: params.search,
    status: params.status,
    transactionType: 'purchase',
  });
