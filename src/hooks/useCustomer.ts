import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCustomerById, getCustomers, createCustomer, updateCustomer, deleteCustomer, importCustomer, exportCustomer } from '@/services/customer.service';
import { CustomerPayload } from '@/@types/customer.types';
import type { PaginationParams } from '@/@types/pagination.types';

export function useCustomers(params: PaginationParams & { search?: string; company_id?: string | number; enabled?: boolean }) {
  const { enabled = true, ...rest } = params;

  return useQuery({
    queryKey: ['customers', rest],
    queryFn: () => getCustomers(rest),
    placeholderData: (previous) => previous,
    enabled,
  });
}

export function useCustomer(id: string | number | undefined, enabled = true) {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => getCustomerById(id!),
    enabled: enabled && !!id,
    retry: false,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CustomerPayload) => createCustomer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: CustomerPayload }) => updateCustomer(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useImportCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, file }: { companyId: string | number; file: File }) => importCustomer(file, companyId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });
}

export function useExportCustomer() {
  return useMutation({
    mutationFn: () => exportCustomer(),
  });
}
