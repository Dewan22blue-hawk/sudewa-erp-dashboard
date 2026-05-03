import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAssets, getAssetById, importAsset, createAsset, updateAsset, deleteAsset, exportAsset } from '@/services/asset.service';
import type { PaginationParams } from '@/@types/pagination.types';
import type { AssetPayload } from '@/@types/asset.types';
import { companyQueryKeys } from '@/lib/query/company-key';

export function useAssets(companyId: string | number | null, params: PaginationParams & { search?: string } = { page: 1, perPage: 100 }) {
    return useQuery({
        queryKey: ['assets', companyId, params.page, params.perPage, params.search],
        queryFn: () => getAssets({
            company_id: companyId || undefined,
            ...params
        }),
        enabled: !!companyId,
    });
}

export function useAssetDetail(id: string | number | null) {
    return useQuery({
        queryKey: ['assets', 'detail', id],
        queryFn: () => getAssetById(id as string | number),
        enabled: !!id,
    });
}

export function useImportAsset() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ file, companyId }: { file: File; companyId?: string | number }) => importAsset(file, companyId),
        onSuccess: (_data, variables) => {
            if (variables.companyId !== undefined && variables.companyId !== null) {
                queryClient.invalidateQueries({ queryKey: companyQueryKeys.companyScope(variables.companyId) });
                return;
            }

            queryClient.invalidateQueries({
                predicate: (query) => Array.isArray(query.queryKey) && query.queryKey.includes('assets'),
            });
        },
    });
}

export function useCreateAsset() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<AssetPayload>) => createAsset(data),
        onSuccess: (_data, variables) => {
            if (variables.company_id !== undefined && variables.company_id !== null) {
                queryClient.invalidateQueries({ queryKey: companyQueryKeys.companyScope(variables.company_id) });
                return;
            }

            queryClient.invalidateQueries({
                predicate: (query) => Array.isArray(query.queryKey) && query.queryKey.includes('assets'),
            });
        },
    });
}

export function useUpdateAsset() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: Partial<AssetPayload> }) => updateAsset(id, data),
        onSuccess: (_data, variables) => {
            if (variables.data.company_id !== undefined && variables.data.company_id !== null) {
                queryClient.invalidateQueries({ queryKey: companyQueryKeys.companyScope(variables.data.company_id) });
                return;
            }

            queryClient.invalidateQueries({
                predicate: (query) => Array.isArray(query.queryKey) && query.queryKey.includes('assets'),
            });
        },
    });
}

export function useDeleteAsset() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string | number) => deleteAsset(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                predicate: (query) => Array.isArray(query.queryKey) && query.queryKey.includes('assets'),
            });
        },
    });
}

export function useExportAsset() {
    return useMutation({
        mutationFn: (companyId?: string | number) => exportAsset(companyId),
    });
}
