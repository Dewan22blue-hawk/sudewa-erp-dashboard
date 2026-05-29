import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { refundAdministrasiService } from '@/services/refund-administrasi.service';
import { useCompany } from '@/contexts/CompanyContext';
import { companyQueryKeys } from '@/lib/query/company-key';
import { CreateRefundPayload, CreateRefundPaymentPayload, UpdateRefundPayload, UpdateRefundPaymentPayload } from '@/@types/refund.type';
import type { UnitTransactionItemDetail } from '@/@types/unit-transaction.types';

const refundAdministrasiKeys = {
  list: (companyId: string | number, options: { page?: number; perPage?: number; search?: string }) =>
    companyQueryKeys.list(companyId, 'administrasi-refund-list', { page: options.page, perPage: options.perPage, search: options.search }),
  itemDetails: (companyId: string | number, options: { page?: number; perPage?: number; search?: string }) =>
    companyQueryKeys.list(companyId, 'transaction-item-details', { page: options.page, perPage: options.perPage, search: options.search }),
  transactionDetail: (companyId: string | number, transactionId: string) =>
    companyQueryKeys.detail(companyId, 'refund-transaction-detail', transactionId),
};

export const useRefundList = (options: { page?: number; perPage?: number; search?: string } = {}) => {
  const { companyId } = useCompany();

  return useQuery({
    queryKey: companyId
      ? refundAdministrasiKeys.list(companyId, options)
      : ['administrasi-refund-list', 'unscoped', options],
    queryFn: () => refundAdministrasiService.getRefundList({ page: options.page, per_page: options.perPage, search: options.search }),
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
    enabled: Boolean(companyId),
  });
};

export const useCreateRefund = () => {
  const queryClient = useQueryClient();
  const { companyId } = useCompany();

  return useMutation({
    mutationFn: (payload: CreateRefundPayload) => refundAdministrasiService.createRefund(payload),
    onSuccess: () => {
      if (companyId) {
        queryClient.invalidateQueries({ queryKey: companyQueryKeys.companyScope(companyId) });
      } else {
        queryClient.invalidateQueries({ queryKey: ['administrasi-refund-list'] });
      }
    },
  });
};

export const useUpdateRefund = () => {
  const queryClient = useQueryClient();
  const { companyId } = useCompany();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRefundPayload }) => refundAdministrasiService.updateRefund(id, payload),
    onSuccess: () => {
      if (companyId) {
        queryClient.invalidateQueries({ queryKey: companyQueryKeys.companyScope(companyId) });
      } else {
        queryClient.invalidateQueries({ queryKey: ['administrasi-refund-list'] });
      }
    },
  });
};

export const useDeleteRefund = () => {
  const queryClient = useQueryClient();
  const { companyId } = useCompany();

  return useMutation({
    mutationFn: (id: string) => refundAdministrasiService.deleteRefund(id),
    onSuccess: () => {
      if (companyId) {
        queryClient.invalidateQueries({ queryKey: companyQueryKeys.companyScope(companyId) });
      } else {
        queryClient.invalidateQueries({ queryKey: ['administrasi-refund-list'] });
      }
    },
  });
};

export const useCreateRefundPayment = () => {
  const queryClient = useQueryClient();
  const { companyId } = useCompany();

  return useMutation({
    mutationFn: (payload: CreateRefundPaymentPayload) => refundAdministrasiService.createRefundPayment(payload),
    onSuccess: () => {
      if (companyId) {
        queryClient.invalidateQueries({ queryKey: companyQueryKeys.companyScope(companyId) });
      } else {
        queryClient.invalidateQueries({ queryKey: ['administrasi-refund-list'] });
      }
    },
  });
};

export const useUpdateRefundPayment = () => {
  const queryClient = useQueryClient();
  const { companyId } = useCompany();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRefundPaymentPayload }) => refundAdministrasiService.updateRefundPayment(id, payload),
    onSuccess: () => {
      if (companyId) {
        queryClient.invalidateQueries({ queryKey: companyQueryKeys.companyScope(companyId) });
      } else {
        queryClient.invalidateQueries({ queryKey: ['administrasi-refund-list'] });
      }
    },
  });
};

export const useDeleteRefundPayment = () => {
  const queryClient = useQueryClient();
  const { companyId } = useCompany();

  return useMutation({
    mutationFn: (id: string) => refundAdministrasiService.deleteRefundPayment(id),
    onSuccess: () => {
      if (companyId) {
        queryClient.invalidateQueries({ queryKey: companyQueryKeys.companyScope(companyId) });
      } else {
        queryClient.invalidateQueries({ queryKey: ['administrasi-refund-list'] });
      }
    },
  });
};

export const useTransactionItemDetails = (options: { page?: number; perPage?: number; search?: string } = {}) => {
  const { companyId } = useCompany();

  return useQuery({
    queryKey: companyId
      ? refundAdministrasiKeys.itemDetails(companyId, options)
      : ['transaction-item-details', 'unscoped', options],
    queryFn: () => refundAdministrasiService.getTransactionItemDetails({ page: options.page, per_page: options.perPage, search: options.search }),
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
    enabled: Boolean(companyId),
  });
};

export const useRefundTransactionDetail = (transactionId?: string) => {
  const { companyId } = useCompany();

  return useQuery({
    queryKey: companyId && transactionId ? refundAdministrasiKeys.transactionDetail(companyId, transactionId) : ['refund-transaction-detail', 'unscoped', transactionId],
    queryFn: () => refundAdministrasiService.getTransactionDetail(transactionId as string),
    enabled: Boolean(companyId) && Boolean(transactionId),
    staleTime: 1000 * 60 * 5,
  });
};

export const useRefundSelectableItems = (transactionId?: string) => {
  const transactionQuery = useRefundTransactionDetail(transactionId);
  const itemDetailsQuery = useTransactionItemDetails({ page: 1, perPage: 100, search: transactionId });

  const transactionItems = (transactionQuery.data?.unit_transaction_items ?? []) as Array<{ id?: string | number; price?: string | number; unit_type?: { name?: string } }>;
  const allowedItemIds = new Set(transactionItems.map((item) => String(item.id ?? '')));

  const items = ((itemDetailsQuery.data?.data ?? []) as UnitTransactionItemDetail[]).filter((item) => allowedItemIds.has(String(item.unit_transaction_item_id ?? '')));
  const enrichedItems = items.map((item) => {
    const parent = transactionItems.find((entry) => String(entry.id ?? '') === String(item.unit_transaction_item_id ?? ''));
    return {
      ...item,
      price: item.price ?? Number(parent?.price ?? 0),
      unit_type_name: item.unit_type_name ?? parent?.unit_type?.name ?? '-',
    };
  });

  return {
    transactionQuery,
    itemDetailsQuery,
    items: enrichedItems,
  };
};
