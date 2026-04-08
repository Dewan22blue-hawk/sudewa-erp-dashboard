import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { liabilityService } from '@/services/liability.service';
import type { CreateLiabilityPaymentPayload } from '@/types/pembayaran-hutang.types';

type LiabilityListOptions = {
  page?: number;
  perPage?: number;
  search?: string;
};

export const usePembayaranHutang = (options: LiabilityListOptions = {}) => {
  return useQuery({
    queryKey: ['liability-list', options.page ?? 1, options.perPage ?? 10, options.search ?? ''],
    queryFn: () => liabilityService.getList({ page: options.page, per_page: options.perPage, search: options.search }),
    staleTime: 1000 * 60 * 5,
    placeholderData: (previous) => previous,
  });
};

export const usePembayaranHutangDetail = (id?: number) => {
  return useQuery({
    queryKey: ['liability-detail', id],
    queryFn: () => liabilityService.getDetail(id as number),
    enabled: typeof id === 'number' && Number.isFinite(id),
    staleTime: 1000 * 60 * 5,
  });
};

export const useDeletePembayaranHutang = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => liabilityService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liability-list'] });
      queryClient.invalidateQueries({ queryKey: ['liability-detail'] });
    },
  });
};

export const useCreatePembayaranHutangPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLiabilityPaymentPayload | FormData) => liabilityService.createPayment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liability-list'] });
      queryClient.invalidateQueries({ queryKey: ['liability-detail'] });
    },
  });
};
