import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CreateWarehouseDataPayload,
  CreateWarehouseActivityPayload,
  ReceiptStockPayload,
  UpdateWarehouseActivityPayload,
  WarehouseActivityListParams,
} from '@/@types/warehouse.types';
import {
  createWarehouseData,
  createWarehouseActivity,
  getWarehouseActivities,
  getWarehouseActivityById,
  receiptStock,
  updateWarehouseActivity,
} from '@/services/warehouse.service';

const warehouseActivitiesKey = 'warehouse-activities';

export const useWarehouseActivities = (params: WarehouseActivityListParams = {}) => {
  return useQuery({
    queryKey: [warehouseActivitiesKey, params],
    queryFn: () => getWarehouseActivities(params),
  });
};

export const useWarehouseActivityDetail = (id?: string) => {
  return useQuery({
    queryKey: [warehouseActivitiesKey, 'detail', id],
    queryFn: () => getWarehouseActivityById(id as string),
    enabled: Boolean(id),
  });
};

export const useCreateWarehouseActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateWarehouseActivityPayload) => createWarehouseActivity(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [warehouseActivitiesKey] });
    },
  });
};

export const useCreateWarehouseData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateWarehouseDataPayload) => createWarehouseData(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [warehouseActivitiesKey] });
    },
  });
};

export const useUpdateWarehouseActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateWarehouseActivityPayload }) => updateWarehouseActivity(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [warehouseActivitiesKey] });
      queryClient.invalidateQueries({ queryKey: [warehouseActivitiesKey, 'detail', variables.id] });
    },
  });
};

export const useReceiptStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ activityId, payload }: { activityId: string; payload: ReceiptStockPayload }) => receiptStock(activityId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [warehouseActivitiesKey] });
      queryClient.invalidateQueries({ queryKey: [warehouseActivitiesKey, 'detail', variables.activityId] });
      queryClient.invalidateQueries({ queryKey: ['penerimaan-receipt-table'] });
    },
  });
};
