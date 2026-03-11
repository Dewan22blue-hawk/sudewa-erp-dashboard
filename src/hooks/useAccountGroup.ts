import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AccountGroupDetail, AccountGroupPayload } from '@/@types/account-group.types';
import type { PaginationParams } from '@/@types/pagination.types';
import { createAccountGroup, deleteAccountGroup, getAccountGroupById, getAccountGroups, quickCreateAccountGroup, updateAccountGroup } from '@/services/account-group.service';
import type { QuickCreateAccountGroupPayload } from '@/services/account-group.service';

export const useAccountGroups = (params: PaginationParams & { search?: string; enabled?: boolean }) => {
  const { enabled = true, ...rest } = params;

  return useQuery({
    queryKey: ['account-groups', rest],
    queryFn: () => getAccountGroups(rest),
    placeholderData: (previous) => previous,
    enabled,
  });
};

export const useAccountGroup = (id: string | number | undefined) =>
  useQuery<AccountGroupDetail>({
    queryKey: ['account-group', id],
    queryFn: () => getAccountGroupById(id!),
    enabled: !!id,
    retry: false,
  });

export const useCreateAccountGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AccountGroupPayload) => createAccountGroup(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-groups'] });
    },
  });
};

/** Quick create (FormData) used by modal inline add */
export const useQuickCreateAccountGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: QuickCreateAccountGroupPayload) => quickCreateAccountGroup(payload),
    onSuccess: (group) => {
      // Optimistically add to any cached account-group lists
      queryClient.setQueriesData<any>({ queryKey: ['account-groups'] }, (prev: any) => {
        if (!prev) return prev;
        if (Array.isArray(prev)) return [...prev, group];
        if (prev?.data) {
          return {
            ...prev,
            data: [group, ...(prev.data ?? [])],
            meta: prev.meta,
          };
        }
        return prev;
      });
      queryClient.invalidateQueries({ queryKey: ['account-groups'] });
    },
  });
};

export const useUpdateAccountGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: AccountGroupPayload }) => updateAccountGroup(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-groups'] });
      queryClient.invalidateQueries({ queryKey: ['account-group'] });
    },
  });
};

export const useDeleteAccountGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => deleteAccountGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-groups'] });
    },
  });
};
