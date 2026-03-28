import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { salesService, SalesPayload } from '@/services/sales.service';

const salesKeys = {
  all: ['sales-transactions'] as const,
  detail: (id: string) => ['sales-transaction', id] as const,
};

export const useSalesList = () => {
  return useQuery({
    queryKey: salesKeys.all,
    queryFn: () => salesService.getSalesList(),
    staleTime: 1000 * 60 * 5,
  });
};

export const useSalesDetail = (id?: string) => {
  return useQuery({
    queryKey: salesKeys.detail(id ?? ''),
    queryFn: () => salesService.getSalesDetail(id as string),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateSales = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SalesPayload) => salesService.createSales(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.all });
    },
  });
};

export const useUpdateSales = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SalesPayload }) => salesService.updateSales(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.all });
      queryClient.invalidateQueries({ queryKey: salesKeys.detail(variables.id) });
    },
  });
};

export const useDeleteSales = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => salesService.deleteSales(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.all });
    },
  });
};
