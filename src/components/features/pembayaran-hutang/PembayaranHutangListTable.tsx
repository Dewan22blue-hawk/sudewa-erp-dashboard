import { PembayaranHutang } from "@/types/pembayaran-hutang.types"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useTableSort } from "@/hooks/useTableSort"
import { SortableHeader } from "@/components/ui/sortable-header"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils/currency"

interface Props {
    data: PembayaranHutang[]
}

export default function PembayaranHutangListTable({ data }: Props) {
    const [itemsPerPage, setItemsPerPage] = useState("25")
    const [currentPage, setCurrentPage] = useState(1)

    const { sortedData, sortKey, sortOrder, handleSort } = useTableSort({
        data,
    })

    // PAGINATION LOGIC
    const totalItems = sortedData.length
    const totalPages = Math.ceil(totalItems / Number(itemsPerPage))
    const startIndex = (currentPage - 1) * Number(itemsPerPage)
    const endIndex = Math.min(startIndex + Number(itemsPerPage), totalItems)
    const paginatedData = sortedData.slice(startIndex, startIndex + Number(itemsPerPage))

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page)
        }
    }

    const getPageNumbers = () => {
        const pages = []
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i)
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, "...", totalPages)
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
            } else {
                pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages)
            }
        }
        return pages
    }

    // Subtotal based on ALL payments (not just paginated)
    const total = data.reduce((acc, curr) => acc + curr.jumlahBayar, 0)

    return (
        <div className="space-y-4">
            {/* SHOW PER PAGE */}
            <div className="flex justify-start items-center gap-4 mt-6">
                <div className="flex items-center gap-2 text-sm">
                    <span>Show</span>
                    <Select
                        value={itemsPerPage}
                        onValueChange={(val) => {
                            setItemsPerPage(val)
                            setCurrentPage(1)
                        }}
                    >
                        <SelectTrigger className="h-9 w-[70px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                        </SelectContent>
                    </Select>
                    <span>Page</span>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-200/50 uppercase text-sm font-semibold text-gray-900 leading-normal">
                        <tr className="border-b border-gray-200">
                            <th className="px-4 py-3 text-left">No</th>
                            <th className="py-2 text-left">
                                <SortableHeader title="KODE BAYAR" sortKey="kodeBayar" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-900 justify-start w-full" />
                            </th>
                            <th className="py-2 text-left">
                                <SortableHeader title="TANGGAL" sortKey="tanggal" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-900 justify-start w-full" />
                            </th>
                            <th className="py-2 text-left">
                                <SortableHeader title="KAS KELUAR" sortKey="kasKeluar" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-900 justify-start w-full" />
                            </th>
                            <th className="py-2 text-right">
                                <SortableHeader title="JUMLAH BAYAR" sortKey="jumlahBayar" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-900 justify-end w-full" />
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {paginatedData.map((item, index) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3">{startIndex + index + 1}</td>
                                <td className="px-4 py-3 font-medium">{item.kodeBayar}</td>
                                <td className="px-4 py-3">{item.tanggal}</td>
                                <td className="px-4 py-3">{item.kasKeluar}</td>
                                {formatCurrency(item.jumlahBayar)}
                            </tr>
                        ))}
                    </tbody>

                    <tfoot>
                        <tr className="bg-gray-200/50 font-semibold border-t">
                            <td colSpan={3}></td>
                            <td className="px-4 py-3 text-left text-gray-900">
                                Sub Total
                            </td>
                            {formatCurrency(total)}
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* PAGINATION CONTROLS */}
            <div className="flex justify-between items-center text-sm text-gray-500">
                <div>
                    Showing {paginatedData.length > 0 ? startIndex + 1 : 0}-
                    {endIndex} of {totalItems} data
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                    >
                        Previous
                    </Button>

                    {getPageNumbers().map((page, index) => (
                        <Button
                            key={index}
                            variant={page === currentPage ? "outline" : "ghost"}
                            size="sm"
                            className={page === currentPage ? "bg-gray-100" : ""}
                            onClick={() => typeof page === 'number' && handlePageChange(page)}
                            disabled={typeof page !== 'number'}
                        >
                            {page}
                        </Button>
                    ))}

                    <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === totalPages || totalPages === 0}
                        onClick={() => handlePageChange(currentPage + 1)}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}
