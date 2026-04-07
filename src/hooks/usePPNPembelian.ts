import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PPNPembelianFilterParams, UpdatePPNPembelianMutationPayload } from '@/@types/ppn-pembelian.types';
import { getPPNPembelianList, updatePPNPembelian } from '@/services/api/ppn-pembelian';

const PPN_PEMBELIAN_KEY = 'ppn-pembelian';

export const ppnPembelianKeys = {
  all: [PPN_PEMBELIAN_KEY] as const,
  list: (params: PPNPembelianFilterParams) => [PPN_PEMBELIAN_KEY, 'list', params] as const,
};

export function usePPNPembelian(params: PPNPembelianFilterParams) {
  return useQuery({
    queryKey: ppnPembelianKeys.list(params),
    queryFn: () => getPPNPembelianList(params),
    placeholderData: keepPreviousData,
    retry: 2,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}

export function useUpdatePPNPembelian() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: UpdatePPNPembelianMutationPayload) => updatePPNPembelian(variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ppnPembelianKeys.all });
    },
  });
}
