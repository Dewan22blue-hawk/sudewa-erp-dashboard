import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
    getPPNPembelian,
    createPPNPembelian,
    updatePPNPembelian,
    deletePPNPembelian,
} from "@/services/ppn-pembelian.service"

export const usePPNPembelian = () =>
    useQuery({
        queryKey: ["ppn-pembelian"],
        queryFn: getPPNPembelian,
    })

export const useCreatePPNPembelian = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: createPPNPembelian,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["ppn-pembelian"] }),
    })
}

export const useUpdatePPNPembelian = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: updatePPNPembelian,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["ppn-pembelian"] }),
    })
}

export const useDeletePPNPembelian = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: deletePPNPembelian,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["ppn-pembelian"] }),
    })
}
