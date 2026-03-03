import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getKas, createKas, updateKas, deleteKas } from '@/services/kas.service';
import type { KasPayload } from '@/@types/kas.types';

// Strictly scoped query keys
export const kasKeys = {
  all: ['kas'] as const,
  list: (companyId?: string | number) => [...kasKeys.all, companyId ?? 'unknown'] as const,
};

export function useKas(companyId?: string | number) {
  return useQuery({
    queryKey: kasKeys.list(companyId),
    queryFn: () => getKas(companyId),
    enabled: !!companyId, // Prevent query if companyId is missing
  });
}

export function useCreateKas(companyId?: string | number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: KasPayload) => createKas({ ...payload, companyId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: kasKeys.list(companyId) });
    },
  });
}

export function useUpdateKas(companyId?: string | number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: KasPayload }) => updateKas(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: kasKeys.list(companyId) });
    },
  });
}

export function useDeleteKas(companyId?: string | number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => deleteKas(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: kasKeys.list(companyId) });
    },
  });
}
