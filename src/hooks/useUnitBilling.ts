import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UpsertUnitBillingPayload } from '@/@types/unit-billing.types';
import { unitBillingService } from '@/services/unitBilling.service';

export const useUnitBillings = (purchaseId?: string) => {
  return useQuery({
    queryKey: ['unit-billings', purchaseId],
    queryFn: () => unitBillingService.getBillings(purchaseId as string),
    enabled: !!purchaseId,
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
