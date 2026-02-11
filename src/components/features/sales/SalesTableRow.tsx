import Link from "next/link"
import { useRouter } from "next/router"
import {
    TableRow,
    TableCell,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"
import { SalesItem } from "./sales.data"

interface Props {
    item: SalesItem
    isSelected: boolean
    onToggle: (id: string) => void
}

/**
 * Format angka dengan titik separator (Indonesian format)
 */
function formatNumber(value: number): string {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/**
 * Sales Table Row - EXACT sesuai Figma dengan checkbox state dan navigasi
 */
export function SalesTableRow({ item, isSelected, onToggle }: Props) {
    const router = useRouter()

    const handleEdit = () => {
        router.push(`/sales/edit/${item.id}`)
    }

    const handleDetail = () => {
        router.push(`/sales/${item.id}`)
    }

    const handleDelete = () => {
        if (confirm(`Hapus ${item.kodeJual}?`)) {
            console.log('Delete item:', item.id)
            alert('Item deleted!')
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
                    href={`/sales/${item.id}`}
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
            <TableCell className="text-right transition-all duration-200">
                {formatNumber(item.totalDpp)}
            </TableCell>

            {/* Total PPN */}
            <TableCell className="text-right transition-all duration-200">
                {formatNumber(item.totalPpn)}
            </TableCell>

            {/* Total Jual */}
            <TableCell className="text-right transition-all duration-200">
                {formatNumber(item.totalJual)}
            </TableCell>

            {/* Kurang Bayar - MERAH */}
            <TableCell className="text-right font-semibold text-red-600 transition-all duration-200">
                {formatNumber(item.kurangBayar)}
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
                        <DropdownMenuItem>Print</DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                            Hapus
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    )
}
