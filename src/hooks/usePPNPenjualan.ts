import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
    getPPNPenjualan,
    createPPNPenjualan,
    updatePPNPenjualan,
    deletePPNPenjualan,
} from "@/services/ppn-penjualan.service"

export const usePPNPenjualan = () =>
    useQuery({
        queryKey: ["ppn-penjualan"],
        queryFn: getPPNPenjualan,
    })

export const useCreatePPNPenjualan = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: createPPNPenjualan,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["ppn-penjualan"] }),
    })
}

export const useUpdatePPNPenjualan = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: updatePPNPenjualan,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["ppn-penjualan"] }),
    })
}

export const useDeletePPNPenjualan = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: deletePPNPenjualan,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["ppn-penjualan"] }),
    })
}
