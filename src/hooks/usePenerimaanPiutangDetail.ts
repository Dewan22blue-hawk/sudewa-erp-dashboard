import { useQuery } from '@tanstack/react-query';
import { liabilityService } from '@/services/liability.service';

export const usePenerimaanPiutangDetail = (id?: number) => {
  return useQuery({
    queryKey: ['sales-liability-detail', id],
    queryFn: () => liabilityService.getDetail(id as number),
    enabled: typeof id === 'number' && Number.isFinite(id),
    staleTime: 1000 * 60 * 5,
  });
};
