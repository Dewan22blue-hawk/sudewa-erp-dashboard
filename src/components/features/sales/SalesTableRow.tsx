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
        router.push(slug ? `/dashboard/${slug}/sales/edit/${item.id}` : `/sales/edit/${item.id}`)
    }

    const handleDetail = () => {
        router.push(slug ? `/dashboard/${slug}/sales/${item.id}` : `/sales/${item.id}`)
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
        <TableRow className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 hover:bg-accent/50">
            {/* Checkbox */}
            <TableCell className="w-12 transition-all duration-200 group-hover:translate-x-0.5">
                <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggle(item.id)}
                />
            </TableCell>

            {/* Kode Jual - Link biru */}
            <TableCell className="transition-all duration-200">
                <Link
                    href={slug ? `/dashboard/${slug}/sales/${item.id}` : `/sales/${item.id}`}
                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
                >
                    {item.kodeJual}
                </Link>
            </TableCell>

            {/* Tanggal */}
            <TableCell className="transition-all duration-200">{item.tanggal}</TableCell>

            {/* Customer */}
            <TableCell className="transition-all duration-200">{item.customer}</TableCell>

            {/* Total Biaya */}
            <TableCell className="text-left transition-all duration-200">
                {item.totalBiaya}
            </TableCell>

            {/* Total DPP */}
            <TableCell className="text-right py-4 transition-all duration-200">
                {formatCurrency(item.totalDpp)}
            </TableCell>

            {/* Total PPN */}
            <TableCell className="text-right py-4 transition-all duration-200">
                {formatCurrency(item.totalPpn)}
            </TableCell>

            {/* Total Jual */}
            <TableCell className="text-right font-semibold py-4 transition-all duration-200">
                {formatCurrency(item.totalJual)}
            </TableCell>

            {/* Kurang Bayar - MERAH */}
            <TableCell className="text-right text-red-600 font-semibold py-4 transition-all duration-200">
                {formatCurrency(item.kurangBayar)}
            </TableCell>

            {/* Action Dropdown */}
            <TableCell className="text-right transition-all duration-200">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="rounded-md p-1 hover:bg-muted transition-colors duration-200 hover:scale-110 active:scale-95 transform">
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
                        <DropdownMenuItem onClick={() => window.open(slug ? `/dashboard/${slug}/sales/${item.id}?print=true` : `/sales/${item.id}?print=true`, '_blank')}>
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
