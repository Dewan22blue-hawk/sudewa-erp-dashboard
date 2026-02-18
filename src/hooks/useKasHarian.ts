import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { kasHarianService } from "@/services/kas-harian.service"
import { toast } from "sonner"

export const useKasHarian = () => {
    return useQuery({
        queryKey: ["kas-harian"],
        queryFn: () => kasHarianService.getAll("1"),
    })
}

export const useCreateKasHarian = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: kasHarianService.create,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["kas-harian"] })
            toast.success("Data berhasil ditambahkan")
        },
    })
}

export const useUpdateKasHarian = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: any) =>
            kasHarianService.update(id, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["kas-harian"] })
            toast.success("Data berhasil diperbarui")
        },
    })
}

export const useDeleteKasHarian = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: kasHarianService.delete,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["kas-harian"] })
            toast.success("Data berhasil dihapus")
        },
    })
}
