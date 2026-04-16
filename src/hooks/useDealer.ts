import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDealers, getDealerById, importDealer, createDealer, updateDealer, deleteDealer, exportDealer } from '@/services/dealer.service';
import type { PaginationParams } from '@/@types/pagination.types';
import type { DealerPayload } from '@/@types/dealer.types';

export function useDealers(companyId: string | null, params: PaginationParams & { search?: string } = { page: 1, perPage: 25 }) {
    return useQuery({
        queryKey: ['dealers', companyId, params.page, params.perPage, params.search],
        queryFn: () =>
            getDealers({
                company_id: companyId || undefined,
                ...params,
            }),
        enabled: !!companyId,
    });
}

export function useDealerDetail(id: string | number | null) {
    return useQuery({
        queryKey: ['dealers', id],
        queryFn: () => getDealerById(id as string | number),
        enabled: !!id,
    });
}

export function useImportDealer() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ companyId, file }: { companyId: string | number; file: File }) => importDealer(file, companyId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dealers'] });
        },
    });
}

export function useCreateDealer() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<DealerPayload>) => createDealer(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dealers'] });
        },
    });
}

export function useUpdateDealer() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: Partial<DealerPayload> }) => updateDealer(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dealers'] });
        },
    });
}

export function useDeleteDealer() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string | number) => deleteDealer(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dealers'] });
        },
    });
}

export function useExportDealer() {
    return useMutation({
        mutationFn: () => exportDealer(),
    });
}
