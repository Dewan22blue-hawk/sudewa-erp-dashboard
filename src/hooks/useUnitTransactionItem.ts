import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CreateUnitTransactionItemPayload,
  UpdateUnitTransactionItemPayload,
} from '@/@types/unit-transaction.types';
import { unitTransactionItemService } from '@/services/unitTransactionItem.service';

export const usePurchaseUnitItems = (purchaseId?: string) => {
  return useQuery({
    queryKey: ['purchase-unit-items', purchaseId],
    queryFn: () => unitTransactionItemService.getItems(purchaseId as string),
    enabled: !!purchaseId,
    staleTime: 1000 * 60 * 2,
  });
};

export const useCreateUnitItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUnitTransactionItemPayload) => unitTransactionItemService.createItem(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-unit-items', data.unit_transaction_id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-by-id', data.unit_transaction_id] });
      queryClient.invalidateQueries({ queryKey: ['unit-transaction', data.unit_transaction_id] });
    },
  });
};

export const useUpdateUnitItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUnitTransactionItemPayload }) => unitTransactionItemService.updateItem(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-unit-items', data.unit_transaction_id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-by-id', data.unit_transaction_id] });
      queryClient.invalidateQueries({ queryKey: ['unit-transaction', data.unit_transaction_id] });
    },
  });
};

export const useDeleteUnitItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, purchaseId }: { id: string; purchaseId: string }) => unitTransactionItemService.deleteItem(id).then(() => ({ purchaseId })),
    onSuccess: ({ purchaseId }) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-unit-items', purchaseId] });
      queryClient.invalidateQueries({ queryKey: ['purchase-by-id', purchaseId] });
      queryClient.invalidateQueries({ queryKey: ['unit-transaction', purchaseId] });
    },
  });
};

export const useBulkDeleteUnitItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, purchaseId }: { id: string; purchaseId: string }) => unitTransactionItemService.bulkDelete(id).then(() => ({ purchaseId })),
    onSuccess: ({ purchaseId }) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-unit-items', purchaseId] });
      queryClient.invalidateQueries({ queryKey: ['purchase-by-id', purchaseId] });
      queryClient.invalidateQueries({ queryKey: ['unit-transaction', purchaseId] });
    },
  });
};
