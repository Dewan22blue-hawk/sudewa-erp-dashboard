import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { unitTransactionItemSalesService } from '@/services/unitTransactionItemSales.service';

export const useUnitItemSalesAssignments = (unitTransactionItemId?: string) => {
  return useQuery({
    queryKey: ['unit-item-sales-assignment', unitTransactionItemId],
    queryFn: () => unitTransactionItemSalesService.getAssignments(unitTransactionItemId as string),
    enabled: !!unitTransactionItemId,
    staleTime: 1000 * 60,
  });
};

export const useAvailableStockUnits = (params: {
  unitTypeId?: string;
  warehouseId?: string;
  companyId?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['available-stock-units', params.unitTypeId ?? '', params.warehouseId ?? '', params.companyId ?? '', params.search ?? ''],
    queryFn: () =>
      unitTransactionItemSalesService.getAvailableStockUnits({
        unitTypeId: params.unitTypeId as string,
        warehouseId: params.warehouseId,
        companyId: params.companyId,
        search: params.search,
      }),
    enabled: !!params.unitTypeId,
    staleTime: 1000 * 30,
  });
};

export const useAssignUnitItemSales = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { unitTransactionItemId: string; unitTransactionDetails: number[] }) => unitTransactionItemSalesService.assignStock(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['unit-item-sales-assignment', variables.unitTransactionItemId] });
      queryClient.invalidateQueries({ queryKey: ['available-stock-units'] });
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
      queryClient.invalidateQueries({ queryKey: ['unit-item-sales-assignment'] });
      queryClient.invalidateQueries({ queryKey: ['available-stock-units'] });
    },
  });
};
