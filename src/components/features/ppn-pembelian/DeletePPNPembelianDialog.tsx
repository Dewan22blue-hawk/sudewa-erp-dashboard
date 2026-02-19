"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useDeletePPNPembelian } from "@/hooks/usePPNPembelian"
import { toast } from "sonner"

interface Props {
    open: boolean
    onClose: () => void
    id?: string
}

export default function DeletePPNPembelianDialog({
    open,
    onClose,
    id,
}: Props) {
    const deleteMutation = useDeletePPNPembelian()

    const handleDelete = async () => {
        if (!id) return
        await deleteMutation.mutateAsync(id)
        toast.success("Data berhasil dihapus")
        onClose()
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Hapus Data Ini?</DialogTitle>
                </DialogHeader>

                <p className="text-sm text-gray-500">
                    Apakah anda yakin ingin menghapus data ini?
                </p>

                <div className="flex justify-end gap-3 pt-4">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="w-24"
                    >
                        Batal
                    </Button>
                    <Button
                        onClick={handleDelete}
                        className="w-24 bg-red-600 text-white"
                    >
                        Hapus
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
