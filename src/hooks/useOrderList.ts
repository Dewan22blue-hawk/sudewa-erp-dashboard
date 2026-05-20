import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreateOrderListPayload,
  CreateOrderListTarifPayload,
  OrderListListParams,
  OrderListTarifListParams,
  UpdateOrderListPayload,
  UpdateOrderListTarifPayload,
} from '@/@types/order-list.types';
import {
  createOrderList,
  createOrderListTarif,
  deleteOrderList,
  deleteOrderListTarif,
  getOrderListById,
  getOrderListTarifById,
  getOrderListTarifs,
  getOrderLists,
  updateOrderList,
  updateOrderListTarif,
} from '@/services/order-list.service';

export function useOrderLists(params: OrderListListParams & { enabled?: boolean }) {
  const { enabled = true, ...rest } = params;

  return useQuery({
    queryKey: ['order-list', 'list', rest],
    queryFn: () => getOrderLists(rest),
    enabled,
    placeholderData: (previous) => previous,
  });
}

export function useOrderListDetail(id: string | number | null) {
  return useQuery({
    queryKey: ['order-list', 'detail', id],
    queryFn: () => getOrderListById(id as string | number),
    enabled: !!id,
    retry: false,
  });
}

export function useOrderListTarifs(params: OrderListTarifListParams & { enabled?: boolean }) {
  const { enabled = true, ...rest } = params;

  return useQuery({
    queryKey: ['order-list-tarif', 'list', rest],
    queryFn: () => getOrderListTarifs(rest),
    enabled,
    placeholderData: (previous) => previous,
  });
}

export function useOrderListTarifDetail(id: string | number | null) {
  return useQuery({
    queryKey: ['order-list-tarif', 'detail', id],
    queryFn: () => getOrderListTarifById(id as string | number),
    enabled: !!id,
    retry: false,
  });
}

export function useCreateOrderList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrderListPayload) => createOrderList(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-list'] });
    },
  });
}

export function useUpdateOrderList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: UpdateOrderListPayload }) => updateOrderList(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['order-list'] });
      queryClient.invalidateQueries({ queryKey: ['order-list', 'detail', variables.id] });
    },
  });
}

export function useDeleteOrderList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => deleteOrderList(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-list'] });
    },
  });
}

export function useCreateOrderListTarif() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrderListTarifPayload) => createOrderListTarif(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['order-list-tarif'] });
      queryClient.invalidateQueries({ queryKey: ['order-list', 'detail', variables.do_orderlist_id] });
      queryClient.invalidateQueries({ queryKey: ['order-list'] });
    },
  });
}

export function useUpdateOrderListTarif() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: UpdateOrderListTarifPayload }) => updateOrderListTarif(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['order-list-tarif'] });
      queryClient.invalidateQueries({ queryKey: ['order-list-tarif', 'detail', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['order-list'] });
    },
  });
}

export function useDeleteOrderListTarif() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string | number; orderListId?: string | number }) => deleteOrderListTarif(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['order-list-tarif'] });
      if (variables.orderListId != null) {
        queryClient.invalidateQueries({ queryKey: ['order-list', 'detail', variables.orderListId] });
      }
      queryClient.invalidateQueries({ queryKey: ['order-list'] });
    },
  });
}
