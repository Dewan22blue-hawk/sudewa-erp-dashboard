import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as service from '@/services/pengeluaran-unit.service';

export const usePengeluaranUnits = () =>
    useQuery({
        queryKey: ['pengeluaran-unit'],
        queryFn: service.getPengeluaranUnits,
    });

export const usePengeluaranUnitById = (id?: string) =>
    useQuery({
        queryKey: ['pengeluaran-unit', id],
        queryFn: () => service.getPengeluaranUnitById(id as string),
        enabled: !!id,
    });

export const useCreatePengeluaranUnit = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: service.createPengeluaranUnit,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['pengeluaran-unit'] }),
    });
};

export const useUpdatePengeluaranUnit = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Partial<import('@/@types/pengeluaran-unit.types').PengeluaranUnit> }) =>
            service.updatePengeluaranUnit(id, payload),
        onSuccess: (_, { id }) => {
            qc.invalidateQueries({ queryKey: ['pengeluaran-unit'] });
            qc.invalidateQueries({ queryKey: ['pengeluaran-unit', id] });
        },
    });
};

export const useDeletePengeluaranUnit = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: service.deletePengeluaranUnit,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['pengeluaran-unit'] }),
    });
};

export const usePengeluaranDetail = (pengeluaranId?: string) =>
    useQuery({
        queryKey: ['pengeluaran-unit-detail', pengeluaranId],
        queryFn: () => service.getPengeluaranDetail(pengeluaranId as string),
        enabled: !!pengeluaranId,
    });

export const useBulkKirimDetail = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: service.bulkKirimDetail,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['pengeluaran-unit-detail'] });
        },
    });
};

export const useBulkDeleteDetail = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: service.bulkDeleteDetail,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['pengeluaran-unit-detail'] });
        },
    });
};
