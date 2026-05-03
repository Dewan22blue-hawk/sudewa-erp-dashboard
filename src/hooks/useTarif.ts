import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTarifs, getTarifById, createTarif, updateTarif, deleteTarif } from '@/services/tarif.service';
import type { PaginationParams } from '@/@types/pagination.types';
import type { TarifPayload } from '@/@types/tarif.types';
import { useCompany } from '@/contexts/CompanyContext';
import { companyQueryKeys } from '@/lib/query/company-key';

export function useTarifs(params: PaginationParams & { search?: string }) {
    const { companyId } = useCompany();

    return useQuery({
        queryKey: companyId
            ? companyQueryKeys.list(companyId, 'tarifs', {
                  page: params.page,
                  perPage: params.perPage,
                  search: params.search,
                  sort_by: params.sort_by,
                  sort_order: params.sort_order,
              })
            : ['tarifs', 'unscoped', params],
        queryFn: () => getTarifs({ ...params, company_id: companyId ?? undefined }),
        placeholderData: (prev) => prev,
        staleTime: 30_000,
        enabled: Boolean(companyId),
    });
}

export function useTarifDetail(id: string | number | null) {
    const { companyId } = useCompany();

    return useQuery({
        queryKey: companyId ? companyQueryKeys.detail(companyId, 'tarifs', id ?? '') : ['tarifs', 'detail', id],
        queryFn: () => getTarifById(id as string | number),
        enabled: !!id,
    });
}

export function useCreateTarif() {
    const queryClient = useQueryClient();
    const { companyId } = useCompany();
    return useMutation({
        mutationFn: (data: TarifPayload) => createTarif(data),
        onSuccess: () => {
            if (companyId) {
                queryClient.invalidateQueries({ queryKey: companyQueryKeys.companyScope(companyId) });
                return;
            }

            queryClient.invalidateQueries({
                predicate: (query) => Array.isArray(query.queryKey) && query.queryKey.includes('tarifs'),
            });
        },
    });
}

export function useUpdateTarif() {
    const queryClient = useQueryClient();
    const { companyId } = useCompany();
    return useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: TarifPayload }) =>
            updateTarif(id, data),
        onSuccess: () => {
            if (companyId) {
                queryClient.invalidateQueries({ queryKey: companyQueryKeys.companyScope(companyId) });
                return;
            }

            queryClient.invalidateQueries({
                predicate: (query) => Array.isArray(query.queryKey) && query.queryKey.includes('tarifs'),
            });
        },
    });
}

export function useDeleteTarif() {
    const queryClient = useQueryClient();
    const { companyId } = useCompany();
    return useMutation({
        mutationFn: (id: string | number) => deleteTarif(id),
        onSuccess: () => {
            if (companyId) {
                queryClient.invalidateQueries({ queryKey: companyQueryKeys.companyScope(companyId) });
                return;
            }

            queryClient.invalidateQueries({
                predicate: (query) => Array.isArray(query.queryKey) && query.queryKey.includes('tarifs'),
            });
        },
    });
}
