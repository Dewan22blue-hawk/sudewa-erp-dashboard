import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
    getSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
} from "@/services/supplier.service"
import type {
    CreateSupplierRequest,
    UpdateSupplierRequest,
} from "@/@types/supplier.types"

export function useSuppliers(companyId: string | null) {
    return useQuery({
        queryKey: ["suppliers", companyId],
        queryFn: () => getSuppliers(companyId!),
        enabled: !!companyId,
    })
}

export function useCreateSupplier() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload: CreateSupplierRequest) => createSupplier(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["suppliers"] })
        },
    })
}

export function useUpdateSupplier() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string
            payload: UpdateSupplierRequest
        }) => updateSupplier(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["suppliers"] })
        },
    })
}

export function useDeleteSupplier() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => deleteSupplier(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["suppliers"] })
        },
    })
}
