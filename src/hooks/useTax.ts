import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { TaxListParams, TaxPayload } from '@/@types/tax.types';
import { createTax, deleteTax, getTaxById, getTaxDefault, getTaxList, updateTax } from '@/services/tax.service';

export function useTaxes(params?: TaxListParams & { enabled?: boolean }) {
  const { enabled = true, ...rest } = params ?? {};

  return useQuery({
    queryKey: ['tax', 'list', rest],
    queryFn: () => getTaxList(rest),
    enabled,
    placeholderData: (previous) => previous,
  });
}

export function useTaxDetail(id: string | number | null) {
  return useQuery({
    queryKey: ['tax', 'detail', id],
    queryFn: () => getTaxById(id as string | number),
    enabled: !!id,
  });
}

export function useCreateTax() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TaxPayload) => createTax(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax'] });
    },
  });
}

export function useUpdateTax() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: TaxPayload }) => updateTax(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tax'] });
      queryClient.invalidateQueries({ queryKey: ['tax', 'detail', variables.id] });
    },
  });
}

export function useDeleteTax() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => deleteTax(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax'] });
    },
  });
}

export function useTaxDefault(code: string | null) {
  return useQuery({
    queryKey: ['tax', 'default', code],
    queryFn: () => getTaxDefault(code as string),
    enabled: !!code,
    staleTime: 1000 * 60 * 5,
  });
}
