import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getDrivers,
    getDriverById,
    createDriver,
    updateDriver,
    deleteDriver,
    importDriver,
    exportDriver,
} from '@/services/driver.service';
import type { PaginationParams } from '@/@types/pagination.types';
import type { DriverPayload } from '@/@types/driver.types';

export function useDrivers(params: PaginationParams & { search?: string }) {
    return useQuery({
        queryKey: ['drivers', params.page, params.perPage, params.search],
        queryFn: () => getDrivers(params),
        placeholderData: (prev) => prev,
        staleTime: 30_000,
    });
}

export function useDriverDetail(id: string | number | null) {
    return useQuery({
        queryKey: ['drivers', id],
        queryFn: () => getDriverById(id as string | number),
        enabled: !!id,
    });
}

export function useCreateDriver() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: DriverPayload) => createDriver(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['drivers'] });
        },
    });
}

export function useUpdateDriver() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: DriverPayload }) =>
            updateDriver(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['drivers'] });
        },
    });
}

export function useDeleteDriver() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string | number) => deleteDriver(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['drivers'] });
        },
    });
}

export function useImportDriver() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, file }: { id: string | number; file: File }) => importDriver(id, file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['drivers'] });
        },
    });
}

export function useExportDriver() {
    return useMutation({
        mutationFn: () => exportDriver(),
    });
}
