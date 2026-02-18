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
import { useDeleteKasHarian } from "@/hooks/useKasHarian"
import { KasHarian } from "@/@types/kas-harian.types"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    data: KasHarian | null
}

export default function DeleteKasHarianDialog({ open, onOpenChange, data }: Props) {
    const { mutate: deleteKasHarian, isPending } = useDeleteKasHarian()

    const handleDelete = () => {
        if (!data) return
        deleteKasHarian(data.id, {
            onSuccess: () => {
                onOpenChange(false)
            },
        })
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Apakah anda yakin?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Data transaksi ini akan dihapus permanen dan tidak dapat dikembalikan.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={isPending}
                    >
                        {isPending ? "Menghapus..." : "Hapus"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
