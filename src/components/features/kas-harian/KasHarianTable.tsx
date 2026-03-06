import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreVertical } from "lucide-react"
import { KasHarian } from "@/@types/kas-harian.types"
import { useTableSort } from "@/hooks/useTableSort"
import { SortableHeader } from "@/components/ui/sortable-header"
import { formatCurrency } from "@/lib/utils/currency"

interface Props {
    data: KasHarian[]
    onEdit: (item: KasHarian) => void
    onDelete: (item: KasHarian) => void
}

export default function KasHarianTable({
    data,
    onEdit,
    onDelete,
}: Props) {
    const { sortedData, sortKey, sortOrder, handleSort } = useTableSort({
        data,
    })

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

            <table className="w-full text-sm">

                <thead className="bg-gray-100 text-xs uppercase tracking-wide font-medium">
                    <tr>
                        <th className="px-4 py-2 text-left">
                            <SortableHeader title="Tanggal" sortKey="tanggal" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-900 justify-start px-0 w-full" />
                        </th>
                        <th className="px-4 py-2 text-left">
                            <SortableHeader title="Nota Reff" sortKey="notaRef" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-900 justify-start px-0 w-full" />
                        </th>
                        <th className="px-4 py-2 text-left">
                            <SortableHeader title="Keterangan" sortKey="keterangan" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-900 justify-start px-0 w-full" />
                        </th>
                        <th className="px-4 py-2 text-right">
                            <SortableHeader title="Debet" sortKey="debit" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-900 justify-end px-0 w-full" />
                        </th>
                        <th className="px-4 py-2 text-right">
                            <SortableHeader title="Kredit" sortKey="kredit" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-900 justify-end px-0 w-full" />
                        </th>
                        <th className="px-4 py-3 text-center w-[60px]">
                            Action
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {sortedData.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                Belum ada data transaksi
                            </td>
                        </tr>
                    ) : (
                        sortedData.map((item) => (
                            <tr
                                key={item.id}
                                className="border-b last:border-none hover:bg-gray-50 h-[48px]"
                            >
                                <td className="px-4 py-3">
                                    {typeof item.tanggal === 'string'
                                        ? item.tanggal
                                        : new Date(item.tanggal).toLocaleDateString("id-ID")}
                                </td>

                                <td className="px-4 py-3">
                                    {item.notaRef}
                                </td>

                                <td className="px-4 py-3">
                                    {item.keterangan}
                                </td>

                                <td className="px-4 py-3 text-right text-green-600 font-medium">
                                    {formatCurrency(item.debit)}
                                </td>

                                <td className="px-4 py-3 text-right text-red-600 font-medium">
                                    {formatCurrency(item.kredit)}
                                </td>

                                <td className="px-4 py-3 text-center">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreVertical size={16} />
                                            </Button>
                                        </DropdownMenuTrigger>

                                        <DropdownMenuContent
                                            align="end"
                                            className="rounded-md shadow-md"
                                        >
                                            <DropdownMenuItem
                                                onClick={() => onEdit(item)}
                                                className="cursor-pointer"
                                            >
                                                Edit
                                            </DropdownMenuItem>

                                            <DropdownMenuItem
                                                onClick={() => onDelete(item)}
                                                className="text-red-600 cursor-pointer"
                                            >
                                                Hapus
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>

            </table>
        </div>
    )
}
