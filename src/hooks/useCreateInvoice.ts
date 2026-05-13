import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  DoExpeditionInvoiceCreatePayload,
  DoExpeditionInvoiceListParams,
  DoExpeditionInvoiceProcessPayload,
  DoExpeditionInvoiceUpdatePayload,
} from '@/@types/create-invoice.types';
import type { PaginationParams } from '@/@types/pagination.types';
import {
  createDoExpeditionInvoice,
  deleteDoExpeditionInvoice,
  getDoExpeditionInvoiceById,
  getDoExpeditionInvoices,
  processDoExpeditionInvoice,
  updateDoExpeditionInvoice,
} from '@/services/create-invoice.service';

export function useCreateInvoiceList(params: PaginationParams & DoExpeditionInvoiceListParams & { enabled?: boolean }) {
  const { enabled = true, ...rest } = params;

  return useQuery({
    queryKey: ['create-invoice', rest],
    queryFn: () => getDoExpeditionInvoices(rest),
    enabled,
    placeholderData: (previous) => previous,
  });
}

export function useCreateInvoiceDetail(id: string | number | null) {
  return useQuery({
    queryKey: ['create-invoice', 'detail', id],
    queryFn: () => getDoExpeditionInvoiceById(id as string | number),
    enabled: !!id,
    retry: false,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DoExpeditionInvoiceCreatePayload) => createDoExpeditionInvoice(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['create-invoice'] });
    },
  });
}

export function useUpdateCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: DoExpeditionInvoiceUpdatePayload }) => updateDoExpeditionInvoice(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['create-invoice'] });
      queryClient.invalidateQueries({ queryKey: ['create-invoice', 'detail', variables.id] });
    },
  });
}

export function useDeleteCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => deleteDoExpeditionInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['create-invoice'] });
    },
  });
}

export function useProcessCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DoExpeditionInvoiceProcessPayload) => processDoExpeditionInvoice(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['create-invoice'] });
    },
  });
}
