import Link from "next/link"
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
 * Sales Table Row - EXACT sesuai Figma dengan checkbox state
 */
export function SalesTableRow({ item, isSelected, onToggle }: Props) {
    return (
        <TableRow className="hover:bg-muted/30">
            {/* Checkbox */}
            <TableCell className="w-12">
                <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggle(item.id)}
                />
            </TableCell>

            {/* Kode Jual - Link biru */}
            <TableCell>
                <Link
                    href={`/sales/${item.id}`}
                    className="font-medium text-blue-600 hover:underline"
                >
                    {item.kodeJual}
                </Link>
            </TableCell>

            {/* Tanggal */}
            <TableCell>{item.tanggal}</TableCell>

            {/* Customer */}
            <TableCell>{item.customer}</TableCell>

            {/* Total Biaya */}
            <TableCell className="text-left">
                {item.totalBiaya}
            </TableCell>

            {/* Total DPP */}
            <TableCell className="text-right">
                {formatNumber(item.totalDpp)}
            </TableCell>

            {/* Total PPN */}
            <TableCell className="text-right">
                {formatNumber(item.totalPpn)}
            </TableCell>

            {/* Total Jual */}
            <TableCell className="text-right">
                {formatNumber(item.totalJual)}
            </TableCell>

            {/* Kurang Bayar - MERAH */}
            <TableCell className="text-right font-semibold text-red-600">
                {formatNumber(item.kurangBayar)}
            </TableCell>

            {/* Action Dropdown */}
            <TableCell className="text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="rounded-md p-1 hover:bg-muted">
                            <MoreVertical className="h-4 w-4" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Detail</DropdownMenuItem>
                        <DropdownMenuItem>Print</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                            Hapus
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    )
}
