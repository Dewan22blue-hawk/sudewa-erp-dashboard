import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { unitTransactionItemSalesService } from '@/services/unitTransactionItemSales.service';

export const useStockUnits = (itemId?: string, options?: { companyId?: string }) => {
  const unitItemQuery = useQuery({
    queryKey: ['unit-transaction-item', itemId ?? ''],
    queryFn: () => unitTransactionItemSalesService.getUnitItemById(itemId as string),
    enabled: !!itemId,
    staleTime: 1000 * 60,
  });

  const stockQuery = useQuery({
    queryKey: ['stock-units', itemId ?? '', unitItemQuery.data?.unit_type_id ?? '', options?.companyId ?? '1'],
    queryFn: () => unitTransactionItemSalesService.getStockByUnitType(unitItemQuery.data?.unit_type_id as string, options?.companyId ?? '1'),
    enabled: !!itemId && !!unitItemQuery.data?.unit_type_id,
    staleTime: 1000 * 30,
  });

  return {
    unitItem: unitItemQuery.data,
    stockUnits: stockQuery.data ?? [],
    isUnitItemLoading: unitItemQuery.isLoading,
    isStockLoading: stockQuery.isLoading,
    isLoading: unitItemQuery.isLoading || stockQuery.isLoading,
    isUnitItemError: unitItemQuery.isError,
    isStockError: stockQuery.isError,
    unitItemError: unitItemQuery.error,
    stockError: stockQuery.error,
  };
};

export const useAssignUnitItemSales = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { unitTransactionItemId: string; unitTransactionDetails: number[] }) => unitTransactionItemSalesService.assignStock(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['stock-units', variables.unitTransactionItemId] });
      queryClient.invalidateQueries({ queryKey: ['unit-transaction-item', variables.unitTransactionItemId] });
      queryClient.invalidateQueries({ queryKey: ['sales-transaction'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-unit-items'] });
    },
  });
};

export const useDispatchStockLifecycle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      transactionId: string;
      personId: string;
      warehouseId: string;
      unitTransactionDetails: number[];
    }) => {
      const activityId = await unitTransactionItemSalesService.dispatchStockInit(payload.transactionId, {
        personId: payload.personId,
        warehouseId: payload.warehouseId,
        activityType: 'issue',
      });

      if (!activityId) {
        throw new Error('Warehouse activity tidak ditemukan saat dispatch');
      }

      await unitTransactionItemSalesService.dispatchStockConfirm(activityId, payload.unitTransactionDetails);
      return { activityId };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sales-transaction', variables.transactionId] });
      queryClient.invalidateQueries({ queryKey: ['sales-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-unit-items', variables.transactionId] });
      queryClient.invalidateQueries({ queryKey: ['stock-units'] });
    },
  });
};
