import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { purchaseService } from "@/services/purchase.service"
import {
    CreatePurchaseRequest,
    UpdatePurchaseRequest,
    CreatePurchaseUnitRequest
} from "@/types/purchase.types"

/* =====================================
   GET LIST
===================================== */

export const usePurchases = (companyId: string) => {
    return useQuery({
        queryKey: ["purchases", companyId],
        queryFn: () => purchaseService.getPurchases(companyId),
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled: !!companyId
    })
}

/* =====================================
   GET DETAIL
===================================== */

export const usePurchaseById = (id: string) => {
    return useQuery({
        queryKey: ["purchase", id],
        queryFn: () => purchaseService.getPurchaseById(id),
        staleTime: 1000 * 60 * 5,
        enabled: !!id
    })
}

/* =====================================
   CREATE PURCHASE
===================================== */

export const useCreatePurchase = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload: CreatePurchaseRequest) =>
            purchaseService.createPurchase(payload),

        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: ["purchases", data.companyId]
            })
        }
    })
}

/* =====================================
   UPDATE PURCHASE
===================================== */

export const useUpdatePurchase = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            id,
            payload
        }: {
            id: string
            payload: UpdatePurchaseRequest
        }) => purchaseService.updatePurchase(id, payload),

        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: ["purchases", data.companyId]
            })

            queryClient.invalidateQueries({
                queryKey: ["purchase", data.id]
            })
        }
    })
}

/* =====================================
   DELETE PURCHASE
===================================== */

export const useDeletePurchase = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) =>
            purchaseService.deletePurchase(id),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["purchases"]
            })
        }
    })
}

/* =====================================
   ADD UNIT TO PURCHASE
===================================== */

export const useAddPurchaseUnit = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload: CreatePurchaseUnitRequest) =>
            purchaseService.addUnit(payload),

        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: ["purchase", data.id]
            })

            queryClient.invalidateQueries({
                queryKey: ["purchases", data.companyId]
            })
        }
    })
}

export const useUpdatePayment = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            id,
            payload
        }: {
            id: string
            payload: { bca: number; bcaUsd: number; cash: number }
        }) => purchaseService.updatePayment(id, payload),

        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: ["purchase", data.id]
            })
            queryClient.invalidateQueries({
                queryKey: ["purchases", data.companyId]
            })
        }
    })
}

export const useDeletePurchaseUnit = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ purchaseId, unitId }: { purchaseId: string; unitId: string }) =>
            purchaseService.deleteUnit(purchaseId, unitId),

        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: ["purchase", data.id]
            })
            queryClient.invalidateQueries({
                queryKey: ["purchases", data.companyId]
            })
        }
    })
}
