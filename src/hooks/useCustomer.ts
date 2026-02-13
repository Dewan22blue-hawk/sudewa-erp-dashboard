import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
    getCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
} from "@/services/customer.service"
import { CreateCustomerRequest, UpdateCustomerRequest } from "@/@types/customer.types"

// Hooks
export function useCustomers(companyId: string | null) {
    return useQuery({
        queryKey: ["customers", companyId],
        queryFn: () => getCustomers(companyId!),
        enabled: !!companyId,
    })
}

export function useCreateCustomer() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload: CreateCustomerRequest) => createCustomer(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customers"] })
        },
    })
}

export function useUpdateCustomer() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string
            payload: UpdateCustomerRequest
        }) => updateCustomer(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customers"] })
        },
    })
}

export function useDeleteCustomer() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => deleteCustomer(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customers"] })
        },
    })
}
