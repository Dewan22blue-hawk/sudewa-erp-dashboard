import { useQuery } from '@tanstack/react-query';
import { liabilityService } from '@/services/liability.service';
import { useCompany } from '@/contexts/CompanyContext';
import { companyQueryKeys } from '@/lib/query/company-key';

type DataHutangListOptions = {
  page?: number;
  perPage?: number;
  search?: string;
};

export const useDataHutang = (options: DataHutangListOptions = {}) => {
  const { companyId } = useCompany();

  return useQuery({
    queryKey: companyId ? companyQueryKeys.list(companyId, 'data-hutang-list', options) : ['data-hutang-list', 'unscoped', options],
    queryFn: () => liabilityService.getAllLiabilities({ company_id: companyId ?? undefined, page: options.page, per_page: options.perPage, search: options.search }),
    staleTime: 1000 * 60 * 5,
    placeholderData: (previous) => previous,
    enabled: Boolean(companyId),
  });
};
