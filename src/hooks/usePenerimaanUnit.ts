import { useMutation } from '@tanstack/react-query';
import {
  useCreateWarehouseActivity,
  useReceiptStock,
  useUpdateWarehouseActivity,
  useWarehouseActivities,
  useWarehouseActivityDetail,
} from '@/hooks/useWarehouseActivity';

export const usePenerimaanUnits = () => {
  return useWarehouseActivities({ activityType: 'receipt' });
};

export const usePenerimaanUnitById = (id?: string) => {
  return useWarehouseActivityDetail(id);
};

export const useCreatePenerimaanUnit = () => {
  return useCreateWarehouseActivity();
};

export const useDeletePenerimaanUnit = () => {
  // Endpoint delete warehouse activity is not available in current backend contract.
  return useMutation({
    mutationFn: async () => {
      throw new Error('Delete endpoint tidak tersedia untuk warehouse activity');
    },
  });
};

export const usePenerimaanDetail = (penerimaanId?: string) => {
  return useWarehouseActivityDetail(penerimaanId);
};

export const useBulkTerimaDetail = () => {
  return useReceiptStock();
};

export const useBulkDeleteDetail = () => {
  return useMutation({
    mutationFn: async () => {
      throw new Error('Delete detail endpoint tidak tersedia untuk warehouse activity');
    },
  });
};

export const useUpdatePenerimaanUnit = () => {
  return useUpdateWarehouseActivity();
};
