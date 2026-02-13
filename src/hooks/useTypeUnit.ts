import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
    getTypeUnits,
    getTypeUnitById,
    createTypeUnit,
    updateTypeUnit,
    deleteTypeUnit,
} from "@/services/type-unit.service"
import { CreateTypeUnitRequest, UpdateTypeUnitRequest } from "@/@types/type-unit.types"

// Hooks
export function useTypeUnits(companyId: string | null) {
    return useQuery({
        queryKey: ["type-units", companyId],
        queryFn: () => getTypeUnits(companyId!),
        enabled: !!companyId,
    })
}

export function useTypeUnit(id: string) {
    return useQuery({
        queryKey: ["type-unit", id],
        queryFn: () => getTypeUnitById(id),
        enabled: !!id,
    })
}

export function useCreateTypeUnit() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload: CreateTypeUnitRequest) => createTypeUnit(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["type-units"] })
        },
    })
}

export function useUpdateTypeUnit() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string
            payload: UpdateTypeUnitRequest
        }) => updateTypeUnit(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["type-units"] })
            queryClient.invalidateQueries({ queryKey: ["type-unit"] })
        },
    })
}

export function useDeleteTypeUnit() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => deleteTypeUnit(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["type-units"] })
        },
    })
}
