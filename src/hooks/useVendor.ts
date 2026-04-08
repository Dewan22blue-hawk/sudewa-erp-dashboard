import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getVendors, importVendor } from '@/services/vendor.service';

export function useVendors(companyId: string | null) {
    return useQuery({
        queryKey: ['vendors', companyId],
        queryFn: () =>
            getVendors({
                company_id: companyId || undefined,
                perPage: 100,
            }),
        enabled: !!companyId,
    });
}

export function useImportVendor() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ companyId, file }: { companyId: string | number; file: File }) => importVendor(companyId, file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendors'] });
        },
    });
}
