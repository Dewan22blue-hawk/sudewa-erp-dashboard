import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
    getSpareparts,
    createSparepart,
    updateSparepart,
    deleteSparepart,
    importSparepart,
} from "@/services/sparepart.service"

export function useSpareparts(companyId: string) {
    return useQuery({
        queryKey: ["spareparts", companyId],
        queryFn: () => getSpareparts(companyId),
    })
}

export function useCreateSparepart(companyId: string) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: createSparepart,
        onSuccess: () =>
            qc.invalidateQueries({ queryKey: ["spareparts", companyId] }),
    })
}

export function useUpdateSparepart(companyId: string) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string
            payload: any
        }) => updateSparepart(id, payload),
        onSuccess: () =>
            qc.invalidateQueries({ queryKey: ["spareparts", companyId] }),
    })
}

export function useDeleteSparepart(companyId: string) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: deleteSparepart,
        onSuccess: () =>
            qc.invalidateQueries({ queryKey: ["spareparts", companyId] }),
    })
}

export function useImportSparepart(companyId: string) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: importSparepart,
        onSuccess: () =>
            qc.invalidateQueries({ queryKey: ["spareparts", companyId] }),
    })
}
