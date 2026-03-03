import { useQuery } from '@tanstack/react-query';
import { getRoles } from '@/services/role.service';
import { UserRoleItem } from '@/@types/user.types';

export const roleKeys = {
  all: ['roles'] as const,
  list: (search?: string) => [...roleKeys.all, search ?? 'all'] as const,
};

export function useRoles(search?: string) {
  return useQuery<UserRoleItem[]>({
    queryKey: roleKeys.list(search),
    queryFn: () => getRoles(search),
    staleTime: 1000 * 60 * 10,
  });
}
