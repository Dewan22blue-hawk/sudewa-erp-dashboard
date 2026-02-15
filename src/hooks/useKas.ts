import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getKas, createKas, updateKas, deleteKas } from "@/services/kas.service"
import { CreateKasRequest, UpdateKasRequest } from "@/@types/kas.types"

// Strictly scoped query keys
export const kasKeys = {
    all: ["kas"] as const,
    list: (companyId: string) => [...kasKeys.all, companyId] as const,
}

export function useKas(companyId: string) {
    return useQuery({
        queryKey: kasKeys.list(companyId),
        queryFn: () => getKas(companyId),
        enabled: !!companyId, // Prevent query if companyId is missing
    })
}

export function useCreateKas(companyId: string) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (payload: Omit<CreateKasRequest, "companyId">) =>
            createKas({ ...payload, companyId }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: kasKeys.list(companyId) })
        },
    })
}

export function useUpdateKas(companyId: string) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateKasRequest }) =>
            updateKas(id, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: kasKeys.list(companyId) })
        },
    })
}

export function useDeleteKas(companyId: string) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: deleteKas,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: kasKeys.list(companyId) })
        },
    })
}
