import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getVendors, getVendorById, importVendor, createVendor, updateVendor, deleteVendor, exportVendor } from '@/services/vendor.service';
import type { PaginationParams } from '@/@types/pagination.types';
import type { VendorPayload } from '@/@types/vendor.types';

export function useVendors(params: PaginationParams & { search?: string }) {
    return useQuery({
        queryKey: ['vendors', params.page, params.perPage, params.search],
        queryFn: () => getVendors(params),
    });
}

export function useVendorDetail(id: string | number | null) {
    return useQuery({
        queryKey: ['vendors', id],
        queryFn: () => getVendorById(id as string | number),
        enabled: !!id,
    });
}

export function useImportVendor() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ companyId, file }: { companyId: string | number; file: File }) => importVendor(companyId, file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendors'] });
        },
    });
}

export function useCreateVendor() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<VendorPayload>) => createVendor(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendors'] });
        },
    });
}

export function useUpdateVendor() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: Partial<VendorPayload> }) => updateVendor(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendors'] });
        },
    });
}

export function useDeleteVendor() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string | number) => deleteVendor(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendors'] });
        },
    });
}

export function useExportVendor() {
    return useMutation({
        mutationFn: () => exportVendor(),
    });
}
