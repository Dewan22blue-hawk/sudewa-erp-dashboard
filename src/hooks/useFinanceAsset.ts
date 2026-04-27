import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFinanceAssets, getFinanceAssetById, updateFinanceAsset, deleteFinanceAsset, exportFinanceAsset } from '@/services/finance-asset.service';
import type { PaginationParams } from '@/@types/pagination.types';
import type { FinanceAssetPayload } from '@/@types/finance-asset.types';

export function useFinanceAssets(companyId: string | number | null, params: PaginationParams & { search?: string } = { page: 1, perPage: 10 }) {
    return useQuery({
        queryKey: ['finance-assets', companyId, params.page, params.perPage, params.search],
        queryFn: () => getFinanceAssets({
            company_id: companyId || undefined,
            ...params
        }),
        enabled: !!companyId,
    });
}

export function useFinanceAssetDetail(id: string | number | null) {
    return useQuery({
        queryKey: ['finance-assets', id],
        queryFn: () => getFinanceAssetById(id as string | number),
        enabled: !!id,
    });
}

export function useUpdateFinanceAsset() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: Partial<FinanceAssetPayload> }) => updateFinanceAsset(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['finance-assets'] });
        },
    });
}

export function useDeleteFinanceAsset() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string | number) => deleteFinanceAsset(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['finance-assets'] });
        },
    });
}

export function useExportFinanceAsset() {
    return useMutation({
        mutationFn: () => exportFinanceAsset(),
    });
}
