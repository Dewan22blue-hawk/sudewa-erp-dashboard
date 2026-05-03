import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import * as service from "@/services/hutang.service"
import { companyQueryKeys } from '@/lib/query/company-key';

export const useHutang = (companyId?: string | number | null) => {
    return useQuery({
        queryKey: companyId ? companyQueryKeys.list(companyId, 'hutang') : ['company', 'unselected', 'hutang'],
        queryFn: () => service.getHutang(companyId),
        enabled: Boolean(companyId),
    })
}

export const useHutangDetail = (id: string) => {
    return useQuery({
        queryKey: ["hutang", id],
        queryFn: () => service.getHutangById(id),
        enabled: !!id,
    })
}

export const useHutangPayments = (id: string) => {
    return useQuery({
        queryKey: ["hutang-payments", id],
        queryFn: () => service.getPaymentsByHutang(id),
        enabled: !!id,
    })
}

export const useBayarHutang = () => {
    const qc = useQueryClient()

    return useMutation({
        mutationFn: ({
            hutangId,
            data,
        }: {
            hutangId: string
            data: any
        }) => service.bayarHutang(hutangId, data),
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: ["hutang"] })
            qc.invalidateQueries({ queryKey: ["hutang", variables.hutangId] })
            qc.invalidateQueries({
                queryKey: ["hutang-payments", variables.hutangId],
            })
        },
    })
}
