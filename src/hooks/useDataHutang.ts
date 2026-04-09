import { useQuery } from '@tanstack/react-query';
import { liabilityService } from '@/services/liability.service';

type DataHutangListOptions = {
  page?: number;
  perPage?: number;
  search?: string;
};

export const useDataHutang = (options: DataHutangListOptions = {}) => {
  return useQuery({
    queryKey: ['data-hutang-list', options.page ?? 1, options.perPage ?? 10, options.search ?? ''],
    queryFn: () => liabilityService.getAllLiabilities({ page: options.page, per_page: options.perPage, search: options.search }),
    staleTime: 1000 * 60 * 5,
    placeholderData: (previous) => previous,
  });
};