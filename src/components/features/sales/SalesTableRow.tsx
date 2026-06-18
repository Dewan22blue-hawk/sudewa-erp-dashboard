import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/router"
import {
    TableRow,
    TableCell,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
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
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"
import { SalesItem } from "./sales.data"
import { formatCurrency } from "@/lib/utils/currency"
import { Badge } from "@/components/ui/badge"

interface Props {
    item: SalesItem
    isSelected: boolean
    onToggle: (id: string) => void
    onDelete?: (id: string) => Promise<void> | void
}

/**
 * Sales Table Row - EXACT sesuai Figma dengan checkbox state dan navigasi
 */
export function SalesTableRow({ item, isSelected, onToggle, onDelete }: Props) {
    const router = useRouter()
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const slugQuery = router.query.slug
    const slug = Array.isArray(slugQuery) ? slugQuery[0] : slugQuery || ""

    const handleEdit = () => {
        router.push(slug ? `/dashboard/${slug}/transaksi/penjualan-unit/edit/${item.id}` : `/transaksi/penjualan-unit/edit/${item.id}`)
    }

    const handleDetail = () => {
        router.push(slug ? `/dashboard/${slug}/transaksi/penjualan-unit/${item.id}` : `/transaksi/penjualan-unit/${item.id}`)
    }

    const handleRefund = () => {
        router.push(slug ? `/dashboard/${slug}/transaksi/penjualan-unit/${item.id}/refund` : `/transaksi/penjualan-unit/${item.id}/refund`)
    }

    const handleDelete = async () => {
        if (!onDelete) return

        setIsDeleting(true)
        try {
            await onDelete(item.id)
        } finally {
            setIsDeleting(false)
            setIsDeleteOpen(false)
        }
    }

    return (
        <TableRow className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 border-b hover:bg-gray-50/70 border-slate-100 transition-colors">
            {/* Kode Jual - Link biru */}
            <TableCell className="px-4 py-4 text-left text-sm font-medium">
                <Link
                    href={slug ? `/dashboard/${slug}/transaksi/penjualan-unit/${item.id}` : `/transaksi/penjualan-unit/${item.id}`}
                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
                >
                    {item.kodeJual}
                </Link>
            </TableCell>

            {/* Tanggal */}
            <TableCell className="px-4 py-4 text-center text-sm text-slate-700">{item.tanggal}</TableCell>

            {/* Customer */}
            <TableCell className="px-4 py-4 text-left text-sm text-slate-700">
                <div className="flex items-center gap-2">
                    <span>{item.customer}</span>
                    {item.isRefunded ? (
                        <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700">Sudah Refund</Badge>
                    ) : null}
                </div>
            </TableCell>

            {/* Total Biaya */}
            <TableCell className="px-4 py-4 text-center text-sm text-slate-700">
                {item.totalBiaya}
            </TableCell>

            {/* Total DPP */}
            <TableCell className="px-4 py-4 text-center text-sm text-slate-700">
                {formatCurrency(item.totalDpp)}
            </TableCell>

            {/* Total PPN */}
            <TableCell className="px-4 py-4 text-center text-sm text-slate-700">
                {formatCurrency(item.totalPpn)}
            </TableCell>

            {/* Total Jual */}
            <TableCell className="px-4 py-4 text-center text-sm font-semibold text-slate-900">
                {formatCurrency(item.totalJual)}
            </TableCell>

            {/* Kurang Bayar - MERAH */}
            <TableCell className="px-4 py-4 text-center text-sm text-red-600 font-semibold">
                {formatCurrency(item.kurangBayar)}
            </TableCell>

            {/* Action Dropdown */}
            <TableCell className="px-4 py-4 text-center">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="rounded-md p-1 hover:bg-slate-100 transition-colors duration-200 hover:scale-110 active:scale-95 transform">
                            <MoreVertical className="h-4 w-4" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleEdit}>
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDetail}>
                            Detail
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleRefund} disabled={Boolean(item.isRefunded)}>
                            {item.isRefunded ? 'Sudah Refund' : 'Refund'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(slug ? `/dashboard/${slug}/transaksi/penjualan-unit/${item.id}?print=true` : `/transaksi/penjualan-unit/${item.id}?print=true`, '_blank')}>
                            Print
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setIsDeleteOpen(true)} className="text-red-600">
                            Hapus
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Apakah anda yakin?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Data penjualan {item.kodeJual} akan dihapus permanen.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={(event) => {
                                    event.preventDefault()
                                    void handleDelete()
                                }}
                                disabled={isDeleting}
                                className="bg-red-600 text-white hover:bg-red-700"
                            >
                                {isDeleting ? 'Menghapus...' : 'Hapus'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </TableCell>
        </TableRow>
    )
}
