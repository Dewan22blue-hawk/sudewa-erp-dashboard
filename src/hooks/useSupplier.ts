import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier, importSupplier } from '@/services/supplier.service';
import type { SupplierPayload } from '@/@types/supplier.types';

export function useSuppliers(companyId: string | null) {
  return useQuery({
    queryKey: ['suppliers', companyId],
    queryFn: () =>
      getSuppliers({
        company_id: companyId || undefined,
        perPage: 100,
      }),
    enabled: !!companyId,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SupplierPayload) => createSupplier(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: SupplierPayload }) => updateSupplier(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
}

export function useImportSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyId, file }: { companyId: string | number; file: File }) => importSupplier(companyId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
}

