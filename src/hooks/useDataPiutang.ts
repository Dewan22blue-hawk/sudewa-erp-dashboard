import { useQuery } from '@tanstack/react-query';
import { liabilityService } from '@/services/liability.service';

type DataPiutangListOptions = {
  page?: number;
  perPage?: number;
  search?: string;
};

export const useDataPiutang = (options: DataPiutangListOptions = {}) => {
  return useQuery({
    queryKey: ['data-piutang-list', options.page ?? 1, options.perPage ?? 10, options.search ?? ''],
    queryFn: () => liabilityService.getAllReceivables({ page: options.page, per_page: options.perPage, search: options.search }),
    staleTime: 1000 * 60 * 5,
    placeholderData: (previous) => previous,
  });
};