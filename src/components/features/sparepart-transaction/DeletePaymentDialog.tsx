import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from "@/components/ui/alert-dialog"

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
}

export default function DeletePaymentDialog({ open, onClose, onConfirm, loading }: Props) {
  return (
      <AlertDialog open={open} onOpenChange={onClose}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Hapus Riwayat Pembayaran?</AlertDialogTitle>
                  <AlertDialogDescription>
                      Apa anda yakin ingin menghapus data riwayat pembayaran ini?
                  </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                      onClick={onConfirm}
                      disabled={loading}
                      className="bg-red-500 hover:bg-red-600"
                  >
                      Hapus
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
  )
}
