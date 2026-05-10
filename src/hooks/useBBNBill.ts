import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PaginationParams } from '@/@types/pagination.types';
import type {
  BBNBillBillingItemPayload,
  BBNBillBillingPayload,
  BBNBillPayload,
  BBNBillVehicleFeePayload,
} from '@/@types/bbn-bill.types';
import {
  createBBNBill,
  createBBNBillBilling,
  createBBNBillBillingItem,
  deleteBBNBill,
  deleteBBNBillBilling,
  deleteBBNBillBillingItem,
  getBBNBillBillingDetail,
  getBBNBillBillingItems,
  getBBNBillBillings,
  getBBNBillDetail,
  getBBNBills,
  updateBBNBill,
  updateBBNBillBillingItem,
  updateBBNBillVehicleData,
} from '@/services/bbn-bill.service';

export const bbnBillKeys = {
  all: ['bbn-bills'] as const,
  list: (params: PaginationParams) => [...bbnBillKeys.all, 'list', params] as const,
  detail: (id: string | number | null) => [...bbnBillKeys.all, 'detail', id] as const,
  billings: (params: PaginationParams) => [...bbnBillKeys.all, 'billings', params] as const,
  billingDetail: (id: string | number | null) => [...bbnBillKeys.all, 'billing-detail', id] as const,
  billingItems: (params: PaginationParams) => [...bbnBillKeys.all, 'billing-items', params] as const,
};

export function useBBNBillList(params: PaginationParams & { search?: string }) {
  return useQuery({
    queryKey: bbnBillKeys.list(params),
    queryFn: () => getBBNBills(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useBBNBillDetail(id: string | number | null) {
  return useQuery({
    queryKey: bbnBillKeys.detail(id),
    queryFn: () => getBBNBillDetail(id as string | number),
    enabled: !!id,
  });
}

export function useCreateBBNBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BBNBillPayload) => createBBNBill(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bbnBillKeys.all });
    },
  });
}

export function useUpdateBBNBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: BBNBillPayload }) => updateBBNBill(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: bbnBillKeys.all });
      queryClient.invalidateQueries({ queryKey: bbnBillKeys.detail(variables.id) });
    },
  });
}

export function useDeleteBBNBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => deleteBBNBill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bbnBillKeys.all });
    },
  });
}

export function useUpdateBBNBillVehicleData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ vehicleDataId, payload }: { vehicleDataId: string | number; payload: BBNBillVehicleFeePayload }) =>
      updateBBNBillVehicleData(vehicleDataId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bbnBillKeys.all });
    },
  });
}

export function useBBNBillBillings(params: PaginationParams & { search?: string }) {
  return useQuery({
    queryKey: bbnBillKeys.billings(params),
    queryFn: () => getBBNBillBillings(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useBBNBillBillingDetail(id: string | number | null) {
  return useQuery({
    queryKey: bbnBillKeys.billingDetail(id),
    queryFn: () => getBBNBillBillingDetail(id as string | number),
    enabled: !!id,
  });
}

export function useCreateBBNBillBilling() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BBNBillBillingPayload) => createBBNBillBilling(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bbnBillKeys.all });
    },
  });
}

export function useDeleteBBNBillBilling() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => deleteBBNBillBilling(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bbnBillKeys.all });
    },
  });
}

export function useBBNBillBillingItems(params: PaginationParams & { search?: string }) {
  return useQuery({
    queryKey: bbnBillKeys.billingItems(params),
    queryFn: () => getBBNBillBillingItems(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateBBNBillBillingItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BBNBillBillingItemPayload) => createBBNBillBillingItem(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bbnBillKeys.all });
    },
  });
}

export function useUpdateBBNBillBillingItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: BBNBillBillingItemPayload }) => updateBBNBillBillingItem(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bbnBillKeys.all });
    },
  });
}

export function useDeleteBBNBillBillingItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => deleteBBNBillBillingItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bbnBillKeys.all });
    },
  });
}
