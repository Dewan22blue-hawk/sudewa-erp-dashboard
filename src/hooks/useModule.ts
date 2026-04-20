import { useQuery } from '@tanstack/react-query';
import { fetchAllModules, fetchModuleDetail } from '@/services/module.service';

export const moduleKeys = {
  all: ['modules'] as const,
  lists: () => [...moduleKeys.all, 'list'] as const,
  details: () => [...moduleKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...moduleKeys.details(), id] as const,
};

export function useModules() {
  return useQuery({
    queryKey: moduleKeys.lists(),
    queryFn: () => fetchAllModules(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useModuleDetail(id: string | number, enabled = true) {
  return useQuery({
    queryKey: moduleKeys.detail(id),
    queryFn: () => fetchModuleDetail(id),
    enabled: !!id && enabled,
    staleTime: 5 * 60 * 1000,
  });
}
