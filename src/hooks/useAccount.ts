import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
    getAccounts,
    getAccountById,
    getAccountHierarchy,
    createAccount,
    updateAccount,
    deleteAccount,
} from "@/services/account.service"
import {
    CreateAccountRequest,
    UpdateAccountRequest,
    AccountType,
} from "@/@types/account.types"

/**
 * Hook untuk fetch list accounts dengan optional filter
 */
export function useAccounts(companyId: string | null, filter?: AccountType) {
    return useQuery({
        queryKey: ["accounts", companyId, filter],
        queryFn: () => getAccounts(companyId!, filter),
        enabled: !!companyId,
    })
}

/**
 * Hook untuk fetch single account by ID
 */
export function useAccount(id: string | undefined) {
    return useQuery({
        queryKey: ["account", id],
        queryFn: () => getAccountById(id!),
        enabled: !!id,
    })
}

/**
 * Hook untuk get account hierarchy (untuk dropdown parent)
 */
export function useAccountHierarchy(companyId: string | null) {
    return useQuery({
        queryKey: ["account-hierarchy", companyId],
        queryFn: () => getAccountHierarchy(companyId!),
        enabled: !!companyId,
    })
}

/**
 * Hook untuk create account
 */
export function useCreateAccount() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload: CreateAccountRequest) => createAccount(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["accounts"] })
            queryClient.invalidateQueries({ queryKey: ["account-hierarchy"] })
        },
    })
}

/**
 * Hook untuk update account
 */
export function useUpdateAccount() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string
            payload: UpdateAccountRequest
        }) => updateAccount(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["accounts"] })
            queryClient.invalidateQueries({ queryKey: ["account"] })
            queryClient.invalidateQueries({ queryKey: ["account-hierarchy"] })
        },
    })
}

/**
 * Hook untuk delete account (soft delete)
 */
export function useDeleteAccount() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => deleteAccount(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["accounts"] })
            queryClient.invalidateQueries({ queryKey: ["account-hierarchy"] })
        },
    })
}
