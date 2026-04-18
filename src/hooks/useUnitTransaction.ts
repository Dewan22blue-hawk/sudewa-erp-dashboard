import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { unitTransactionService } from '@/services/unitTransaction.service';

export const useUnitTransactions = (options: { page?: number; perPage?: number; search?: string } = {}) => {
  return useQuery({
    queryKey: ['unit-transactions', options.page ?? 1, options.perPage ?? 10, options.search ?? ''],
    queryFn: () => unitTransactionService.getUnitTransactions({ page: options.page, perPage: options.perPage, search: options.search }),
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
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
      cashId,
      description,
    }: {
      id: string;
      stockState?: string;
      unitTransactionDetails?: Array<string | number>;
      cashId?: string | number;
      description?: string;
    }) =>
      unitTransactionService.updateUnitTransactionState(id, {
        stockState,
        unitTransactionDetails,
        cashId,
        description,
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

export const useSubmitTransactionAdjustment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { cashId: string; amount: number; description: string; itemDetailIds: string[] } }) =>
      unitTransactionService.submitTransactionAdjustment(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['unit-transaction', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-by-id', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['sales-transaction', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['unit-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['sales-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-adjustments', variables.id] });
    },
  });
};

export const useTransactionAdjustments = (transactionId?: string) => {
  return useQuery({
    queryKey: ['transaction-adjustments', transactionId],
    queryFn: () => unitTransactionService.getTransactionAdjustments(transactionId as string),
    enabled: !!transactionId,
    staleTime: 1000 * 60 * 2,
  });
};
