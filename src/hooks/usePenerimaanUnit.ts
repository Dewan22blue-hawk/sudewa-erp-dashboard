import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as service from '@/services/penerimaan-unit.service';

export const usePenerimaanUnits = () =>
  useQuery({
    queryKey: ['penerimaan-unit'],
    queryFn: service.getPenerimaanUnits,
  });

export const usePenerimaanUnitById = (id?: string) =>
  useQuery({
    queryKey: ['penerimaan-unit', id],
    queryFn: () => service.getPenerimaanUnitById(id as string),
    enabled: !!id,
  });

export const useCreatePenerimaanUnit = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: service.createPenerimaanUnit,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['penerimaan-unit'] }),
  });
};

export const useDeletePenerimaanUnit = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: service.deletePenerimaanUnit,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['penerimaan-unit'] }),
  });
};

export const usePenerimaanDetail = (penerimaanId?: string) =>
  useQuery({
    queryKey: ['penerimaan-unit-detail', penerimaanId],
    queryFn: () => service.getPenerimaanDetail(penerimaanId as string),
    enabled: !!penerimaanId,
  });

export const useBulkTerimaDetail = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: service.bulkTerimaDetail,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['penerimaan-unit-detail'] });
    },
  });
};

export const useBulkDeleteDetail = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: service.bulkDeleteDetail,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['penerimaan-unit-detail'] });
    },
  });
};
