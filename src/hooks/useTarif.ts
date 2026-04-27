import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTarifs, getTarifById, createTarif, updateTarif, deleteTarif } from '@/services/tarif.service';
import type { PaginationParams } from '@/@types/pagination.types';
import type { TarifPayload } from '@/@types/tarif.types';

export function useTarifs(params: PaginationParams & { search?: string }) {
    return useQuery({
        queryKey: ['tarifs-list', params.page, params.perPage, params.search],
        queryFn: () => getTarifs(params),
        placeholderData: (prev) => prev,
        staleTime: 30_000,
    });
}

export function useTarifDetail(id: string | number | null) {
    return useQuery({
        queryKey: ['tarifs', id],
        queryFn: () => getTarifById(id as string | number),
        enabled: !!id,
    });
}

export function useCreateTarif() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: TarifPayload) => createTarif(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tarifs-list'] });
            queryClient.invalidateQueries({ queryKey: ['tarifs'] });
        },
    });
}

export function useUpdateTarif() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: TarifPayload }) =>
            updateTarif(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tarifs-list'] });
            queryClient.invalidateQueries({ queryKey: ['tarifs'] });
        },
    });
}

export function useDeleteTarif() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string | number) => deleteTarif(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tarifs-list'] });
            queryClient.invalidateQueries({ queryKey: ['tarifs'] });
        },
    });
}
