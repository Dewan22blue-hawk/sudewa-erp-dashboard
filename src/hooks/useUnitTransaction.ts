import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { unitTransactionService } from '@/services/unitTransaction.service';

export const useUnitTransactions = (options: { page?: number; perPage?: number; search?: string } = {}) => {
  return useQuery({
    queryKey: ['unit-transactions', options.page ?? 1, options.perPage ?? 10, options.search ?? ''],
    queryFn: () => unitTransactionService.getUnitTransactions({ page: options.page, perPage: options.perPage, search: options.search }),
    staleTime: 1000 * 60 * 5,
  });
};

export const useUnitTransactionDetail = (id?: string) => {
  return useQuery({
    queryKey: ['unit-transaction', id],
    queryFn: () => unitTransactionService.getUnitTransactionDetail(id as string),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export const usePurchaseById = (id?: string) => {
  return useQuery({
    queryKey: ['purchase-by-id', id],
    queryFn: () => unitTransactionService.getUnitTransactionDetail(id as string),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdateUnitTransactionState = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      stockState,
      unitTransactionDetails,
    }: {
      id: string;
      stockState?: string;
      unitTransactionDetails?: Array<string | number>;
    }) =>
      unitTransactionService.updateUnitTransactionState(id, {
        stockState,
        unitTransactionDetails,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['unit-transaction', data.id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-by-id', data.id] });
      queryClient.invalidateQueries({ queryKey: ['unit-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['unit-billings', data.id] });
      queryClient.invalidateQueries({ queryKey: ['sales-transaction', data.id] });
      queryClient.invalidateQueries({ queryKey: ['sales-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-unit-items', data.id] });
    },
  });
};
