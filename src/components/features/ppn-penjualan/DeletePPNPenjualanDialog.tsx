import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useDeletePPNPenjualan } from "@/hooks/usePPNPenjualan"
import { toast } from "sonner"

interface Props {
    open: boolean
    onClose: () => void
    id?: string
}

export default function DeletePPNPenjualanDialog({
    open,
    onClose,
    id,
}: Props) {
    const deleteMutation = useDeletePPNPenjualan()

    const handleDelete = async () => {
        if (!id) return
        try {
            await deleteMutation.mutateAsync(id)
            toast.success("Data PPN Penjualan berhasil dihapus")
            onClose()
        } catch {
            toast.error("Gagal menghapus data")
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Data?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Apakah anda yakin ingin menghapus data PPN Penjualan ini?
                        Tindakan ini tidak dapat dibatalkan.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose}>Batal</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        Hapus
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
