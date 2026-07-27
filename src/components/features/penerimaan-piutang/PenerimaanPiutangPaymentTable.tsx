import { LiabilityPaymentHistory } from "@/types/pembayaran-hutang.types"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useTableSort } from "@/hooks/useTableSort"
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils/currency"

export default function PenerimaanPiutangPaymentTable({
    payments,
}: {
    payments: LiabilityPaymentHistory[]
}) {
    const [itemsPerPage, setItemsPerPage] = useState("25")
    const [currentPage, setCurrentPage] = useState(1)

    const { sortedData, sortKey, sortOrder, handleSort } = useTableSort({
        data: payments,
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
    const total = payments.reduce((acc, cur) => acc + cur.cash_payment_amount + cur.bca_payment_amount, 0)

    const renderSortHeader = (title: string, sortKeyParam: string, align: 'left' | 'right' | 'center' = 'left') => {
        const isSorted = sortKey === sortKeyParam;
        const justifyClass = align === 'right' ? 'justify-end w-full' : align === 'center' ? 'justify-center w-full' : 'justify-start';
        return (
            <button
                type="button"
                className={`flex items-center gap-1 cursor-pointer select-none group w-full px-4 py-4 text-xs font-semibold uppercase ${isSorted ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'} ${justifyClass}`}
                onClick={() => handleSort(sortKeyParam as any)}
            >
                <span>{title}</span>
                {isSorted ? (
                    sortOrder === 'asc' ? (
                        <ArrowUp className="h-3 w-3 text-indigo-500 shrink-0" />
                    ) : (
                        <ArrowDown className="h-3 w-3 text-indigo-500 shrink-0" />
                    )
                ) : (
                    <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-70 transition-opacity duration-150 shrink-0 text-slate-400" />
                )}
            </button>
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-500 whitespace-nowrap">
                    <span>Show</span>
                    <Select
                        value={itemsPerPage}
                        onValueChange={(val) => {
                            setItemsPerPage(val)
                            setCurrentPage(1)
                        }}
                    >
                        <SelectTrigger className="w-[70px] bg-white">
                            <SelectValue placeholder="25" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                    </Select>
                    <span>Page</span>
                </div>
            </div>

            <div className="bg-white rounded-md border border-slate-200 overflow-hidden shadow-none">
                <table className="w-full text-sm">
                    <thead className="bg-[#f8f9fa] border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500">No</th>
                            <th className="p-0 text-left">{renderSortHeader('Kode Terima', 'kodeTerima', 'left')}</th>
                            <th className="p-0 text-left">{renderSortHeader('TANGGAL', 'tanggalTerima', 'center')}</th>
                            <th className="p-0 text-left">{renderSortHeader('Kas Masuk', 'kasMasuk', 'left')}</th>
                            <th className="p-0 text-left">{renderSortHeader('Jumlah Diterima', 'jumlahTerima', 'center')}</th>
                        </tr>
                    </thead>

                    <tbody>
                        {paginatedData.map((item, index) => (
                            <tr key={item.id} className="border-b hover:bg-gray-50/70 border-slate-100 transition-colors">
                                <td className="px-4 py-4 text-center text-sm text-slate-500">{startIndex + index + 1}</td>
                                <td className="px-4 py-4 text-left text-sm font-medium text-slate-900">{item.id}</td>
                                <td className="px-4 py-4 text-center text-sm text-slate-500">{item.payment_at}</td>
                                <td className="px-4 py-4 text-left text-sm text-slate-700">{item.cash_payment_amount}</td>
                                <td className="px-4 py-4 text-center text-sm font-medium text-slate-900">
                                    {formatCurrency((item.cash_payment_amount + item.bca_payment_amount))}
                                </td>
                            </tr>
                        ))}
                    </tbody>

                    <tfoot>
                        <tr className="bg-slate-50/50 border-t border-slate-200 font-semibold">
                            <td colSpan={3}></td>
                            <td className="px-4 py-4 text-left text-sm font-semibold text-slate-900">
                                Sub Total
                            </td>
                            <td className="px-4 py-4 text-center text-sm font-semibold text-slate-900">
                                {formatCurrency(total)}
                            </td>
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
