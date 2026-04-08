import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { liabilityService } from '@/services/liability.service';
import type { CreatePenerimaanPiutangPaymentPayload } from '@/@types/penerimaan-piutang.types';

type PenerimaanPiutangListOptions = {
    page?: number;
    perPage?: number;
    search?: string;
};

export const usePenerimaanPiutang = (options: PenerimaanPiutangListOptions = {}) => {
    return useQuery({
        queryKey: ['sales-liability-list', options.page ?? 1, options.perPage ?? 10, options.search ?? ''],
        queryFn: () => liabilityService.getList({ type: 'sales', page: options.page, per_page: options.perPage, search: options.search }),
        staleTime: 1000 * 60 * 5,
        placeholderData: (previous) => previous,
    });
};

export const useDeletePenerimaanPiutang = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => liabilityService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sales-liability-list'] });
            queryClient.invalidateQueries({ queryKey: ['sales-liability-detail'] });
        },
    });
};

export const useCreatePenerimaanPiutangPayment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreatePenerimaanPiutangPaymentPayload | FormData) => liabilityService.createPayment(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sales-liability-list'] });
            queryClient.invalidateQueries({ queryKey: ['sales-liability-detail'] });
        },
    });
};
