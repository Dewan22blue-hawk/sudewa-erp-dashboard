import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getUsers, createUser, updateUser, deleteUser } from "@/services/user.service"
import { CreateUserRequest, UpdateUserRequest } from "@/@types/user.types"

// Strict Query Keys
export const userKeys = {
    all: ["users"] as const,
    list: (companyId: string) => [...userKeys.all, companyId] as const,
}

export function useUsers(companyId: string) {
    return useQuery({
        queryKey: userKeys.list(companyId),
        queryFn: () => getUsers(companyId),
        enabled: !!companyId,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
        refetchOnWindowFocus: false,
    })
}

export function useCreateUser(companyId: string) {
    const qc = useQueryClient()

    return useMutation({
        mutationFn: (payload: Omit<CreateUserRequest, "companyId">) =>
            createUser({ ...payload, companyId }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: userKeys.list(companyId) })
        },
    })
}

export function useUpdateUser(companyId: string) {
    const qc = useQueryClient()

    return useMutation({
        mutationFn: (payload: UpdateUserRequest) => updateUser(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: userKeys.list(companyId) })
        },
    })
}

export function useDeleteUser(companyId: string) {
    const qc = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => deleteUser(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: userKeys.list(companyId) })
        },
    })
}
