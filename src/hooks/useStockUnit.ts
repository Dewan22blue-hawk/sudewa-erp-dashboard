import { useQuery } from '@tanstack/react-query';
import { getStockUnits, getStockUnitById } from '@/services/stock-unit.service';

export const useStockUnits = () =>
  useQuery({
    queryKey: ['stock-unit'],
    queryFn: getStockUnits,
  });

export const useStockUnitDetail = (id: string) =>
  useQuery({
    queryKey: ['stock-unit', id],
    queryFn: () => getStockUnitById(id),
    enabled: !!id,
  });
