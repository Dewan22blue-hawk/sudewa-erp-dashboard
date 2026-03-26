import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreateUnitItemDetailPayload, UpdateUnitItemDetailPayload } from '@/@types/unit-transaction.types';
import { unitItemDetailService } from '@/services/unitItemDetail.service';

export const useUnitTransactionItemById = (unitItemId?: string) => {
  return useQuery({
    queryKey: ['unit-transaction-item', unitItemId],
    queryFn: () => unitItemDetailService.getUnitTransactionItemById(unitItemId as string),
    enabled: !!unitItemId,
    staleTime: 1000 * 60 * 2,
  });
};

export const useUnitItemDetails = (unitItemId?: string) => {
  return useQuery({
    queryKey: ['unit-item-details', unitItemId],
    queryFn: () => unitItemDetailService.getDetails(unitItemId as string),
    enabled: !!unitItemId,
    staleTime: 1000 * 60,
  });
};

export const useCreateUnitItemDetail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUnitItemDetailPayload) => unitItemDetailService.createDetail(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['unit-item-details', data.unit_transaction_item_id] });
      queryClient.invalidateQueries({ queryKey: ['unit-transaction-item', data.unit_transaction_item_id] });
    },
  });
};

export const useUpdateUnitItemDetail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUnitItemDetailPayload }) => unitItemDetailService.updateDetail(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['unit-item-details', data.unit_transaction_item_id] });
      queryClient.invalidateQueries({ queryKey: ['unit-transaction-item', data.unit_transaction_item_id] });
    },
  });
};

export const useDeleteUnitItemDetail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, unitItemId }: { id: string; unitItemId: string }) => unitItemDetailService.deleteDetail(id).then(() => ({ unitItemId })),
    onSuccess: ({ unitItemId }) => {
      queryClient.invalidateQueries({ queryKey: ['unit-item-details', unitItemId] });
      queryClient.invalidateQueries({ queryKey: ['unit-transaction-item', unitItemId] });
    },
  });
};
