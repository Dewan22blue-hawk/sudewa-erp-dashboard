import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PPNPenjualanFilterParams, UpdatePPNPenjualanMutationPayload } from '@/@types/ppn-penjualan.types';
import { getPPNPenjualanList, updatePPNPenjualan } from '@/services/api/ppn-penjualan';

const PPN_PENJUALAN_KEY = 'ppn-penjualan';

export const ppnPenjualanKeys = {
  all: [PPN_PENJUALAN_KEY] as const,
  list: (params: PPNPenjualanFilterParams) => [PPN_PENJUALAN_KEY, 'list', params] as const,
};

export function usePPNPenjualan(params: PPNPenjualanFilterParams) {
  return useQuery({
    queryKey: ppnPenjualanKeys.list(params),
    queryFn: () => getPPNPenjualanList(params),
    placeholderData: keepPreviousData,
    retry: 2,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}

export function useUpdatePPNPenjualan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: UpdatePPNPenjualanMutationPayload) => updatePPNPenjualan(variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ppnPenjualanKeys.all });
    },
  });
}
