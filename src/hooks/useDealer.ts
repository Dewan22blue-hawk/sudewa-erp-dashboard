import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDealers, importDealer } from '@/services/dealer.service';

export function useDealers(companyId: string | null) {
    return useQuery({
        queryKey: ['dealers', companyId],
        queryFn: () =>
            getDealers({
                company_id: companyId || undefined,
                perPage: 100,
            }),
        enabled: !!companyId,
    });
}

export function useImportDealer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ companyId, file }: { companyId: string | number; file: File }) => importDealer(file, companyId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dealers'] });
        },
    });
}
