import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreateUnitBillingHistoryPayload, CreateUnitBillingPayloadV2, UpsertUnitBillingPayload } from '@/@types/unit-billing.types';
import { unitBillingService } from '@/services/unitBilling.service';

export const useUnitBillings = (purchaseId?: string) => {
  return useQuery({
    queryKey: ['unit-billings', purchaseId],
    queryFn: () => unitBillingService.getBillings(purchaseId as string),
    enabled: !!purchaseId,
    retry: false,
    staleTime: 1000 * 30,
  });
};

export const useCreateBilling = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpsertUnitBillingPayload) => unitBillingService.createBilling(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['unit-billings', data.unit_transaction_id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-by-id', data.unit_transaction_id] });
      queryClient.invalidateQueries({ queryKey: ['unit-transaction', data.unit_transaction_id] });
    },
  });
};

export const useBillingValidation = (companyId?: string, purchaseId?: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['unit-billing-validation', companyId, purchaseId],
    queryFn: async () => {
      await unitBillingService.checkRightAmount(companyId as string, purchaseId as string);
      return true;
    },
    enabled: Boolean(companyId && purchaseId && (options?.enabled ?? true)),
    retry: false,
    staleTime: 1000 * 30,
  });
};

export const useCurrentBilling = (purchaseId?: string) => {
  return useQuery({
    queryKey: ['unit-billing-current', purchaseId],
    queryFn: () => unitBillingService.getCurrentBilling(purchaseId as string),
    enabled: !!purchaseId,
    staleTime: 1000 * 30,
  });
};

export const useCreateBillingV2 = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUnitBillingPayloadV2) => unitBillingService.createBillingV2(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['unit-billing-current', data.unit_transaction_id] });
      queryClient.invalidateQueries({ queryKey: ['unit-billings', data.unit_transaction_id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-by-id', data.unit_transaction_id] });
      queryClient.invalidateQueries({ queryKey: ['unit-transaction', data.unit_transaction_id] });
      queryClient.invalidateQueries({ queryKey: ['unit-transactions'] });
    },
  });
};

export const useBillingHistory = (billingId?: string, purchaseId?: string) => {
  return useQuery({
    queryKey: ['unit-billing-history', billingId ?? '', purchaseId ?? ''],
    queryFn: () => unitBillingService.getBillingHistory(billingId, purchaseId),
    enabled: !!billingId || !!purchaseId,
    staleTime: 1000 * 30,
  });
};

export const useCreateBillingHistory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUnitBillingHistoryPayload) => unitBillingService.createBillingHistory(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['unit-billing-history', data.unit_transaction_billing_id] });
      queryClient.invalidateQueries({ queryKey: ['unit-billing-current'] });
      queryClient.invalidateQueries({ queryKey: ['unit-billings'] });
      queryClient.invalidateQueries({ queryKey: ['unit-transactions'] });
    },
  });
};

export const useUpdateBilling = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpsertUnitBillingPayload }) => unitBillingService.updateBilling(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['unit-billings', data.unit_transaction_id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-by-id', data.unit_transaction_id] });
      queryClient.invalidateQueries({ queryKey: ['unit-transaction', data.unit_transaction_id] });
    },
  });
};
