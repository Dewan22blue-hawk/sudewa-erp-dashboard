import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAssets, getAssetById, importAsset, createAsset, updateAsset, deleteAsset, exportAsset } from '@/services/asset.service';
import type { PaginationParams } from '@/@types/pagination.types';
import type { AssetPayload } from '@/@types/asset.types';

export function useAssets(params: PaginationParams & { search?: string } = { page: 1, perPage: 100 }) {
    return useQuery({
        queryKey: ['assets', params.page, params.perPage, params.search],
        queryFn: () => getAssets(params),
    });
}

export function useAssetDetail(id: string | number | null) {
    return useQuery({
        queryKey: ['assets', id],
        queryFn: () => getAssetById(id as string | number),
        enabled: !!id,
    });
}

export function useImportAsset() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ file, companyId }: { file: File; companyId?: string | number }) => importAsset(file, companyId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assets'] });
        },
    });
}

export function useCreateAsset() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<AssetPayload>) => createAsset(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assets'] });
        },
    });
}

export function useUpdateAsset() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: Partial<AssetPayload> }) => updateAsset(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assets'] });
        },
    });
}

export function useDeleteAsset() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string | number) => deleteAsset(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assets'] });
        },
    });
}

export function useExportAsset() {
    return useMutation({
        mutationFn: () => exportAsset(),
    });
}
