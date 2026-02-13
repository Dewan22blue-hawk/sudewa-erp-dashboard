import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface DeleteTypeUnitDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
    isDeleting?: boolean
}

export function DeleteTypeUnitDialog({
    open,
    onOpenChange,
    onConfirm,
    isDeleting = false,
}: DeleteTypeUnitDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle className="text-xl">Hapus Data Ini?</DialogTitle>
                    <DialogDescription>
                        Apa anda yakin ingin menghapus data ini?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="w-full sm:w-auto mx-2"
                    >
                        Batal
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="w-full sm:w-auto"
                    >
                        {isDeleting ? "Menghapus..." : "Hapus"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
