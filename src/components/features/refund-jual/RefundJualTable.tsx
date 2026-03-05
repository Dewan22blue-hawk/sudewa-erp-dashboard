import { useMemo, useState } from "react"
import { RefundJual } from "@/@types/refund-jual.types"
import { Search } from "lucide-react"
import { useTableSort } from "@/hooks/useTableSort"
import { SortableHeader } from "@/components/ui/sortable-header"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"

interface Props {
    data: RefundJual[]
}

export default function RefundJualTable({ data }: Props) {
    const [search, setSearch] = useState("")
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(25)

    const filtered = useMemo(() => {
        return data.filter(item =>
            item.noPenjualan.toLowerCase().includes(search.toLowerCase()) ||
            item.namaCustomer.toLowerCase().includes(search.toLowerCase())
        )
    }, [data, search])

    const { sortedData: sorted, sortKey, sortOrder, handleSort } = useTableSort({
        data: filtered,
        defaultSortKey: 'tanggal',
        defaultSortOrder: 'asc'
    })

    const paginated = useMemo(() => {
        const start = (page - 1) * limit
        return sorted.slice(start, start + limit)
    }, [sorted, page, limit])

    const totalPages = Math.ceil(sorted.length / limit)

    return (
        <div className="space-y-4">

            {/* FILTER */}
            <div className="flex justify-start items-center gap-4">
                <div className="relative w-[250px]">
                    <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <Input
                        placeholder="Search here"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-9 h-10"
                    />
                </div>

                <div className="flex items-center gap-2 text-sm">
                    <span>Show</span>
                    <Select
                        value={String(limit)}
                        onValueChange={(val) => {
                            setLimit(Number(val))
                            setPage(1)
                        }}
                    >
                        <SelectTrigger className="h-9 w-[70px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                    </Select>
                    <span>Page</span>
                </div>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50/50 uppercase text-sm font-semibold text-gray-900 leading-normal">
                        <tr className="border-b border-gray-200">
                            <th className="py-2 text-left">
                                <SortableHeader title="NO PENJUALAN" sortKey="noPenjualan" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-900 justify-start w-full px-4" />
                            </th>
                            <th className="py-2 text-left">
                                <SortableHeader title="TANGGAL" sortKey="tanggal" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-900 justify-start w-full px-4" />
                            </th>
                            <th className="py-2 text-left">
                                <SortableHeader title="NAMA CUSTOMER" sortKey="namaCustomer" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-900 justify-start w-full px-4" />
                            </th>
                            <th className="py-2 text-right">
                                <SortableHeader title="TOTAL PENJUALAN" sortKey="totalPenjualan" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-900 justify-end w-full px-4" />
                            </th>
                            <th className="py-2 text-right">
                                <SortableHeader title="TOTAL REFUND" sortKey="totalRefund" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-900 justify-end w-full px-4" />
                            </th>
                            <th className="py-2 text-left">
                                <SortableHeader title="KAS KELUAR" sortKey="kasKeluar" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-900 justify-start w-full px-4" />
                            </th>
                            <th className="py-2 text-left">
                                <SortableHeader title="KETERANGAN" sortKey="keterangan" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-900 justify-start w-full px-4" />
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {paginated.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 font-medium">{item.noPenjualan}</td>
                                <td className="px-4 py-3">{item.tanggal}</td>
                                <td className="px-4 py-3">{item.namaCustomer}</td>
                                <td className="px-4 py-3 text-right">
                                    Rp {item.totalPenjualan.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    Rp {item.totalRefund.toLocaleString()}
                                </td>
                                <td className="px-4 py-3">{item.kasKeluar}</td>
                                <td className="px-4 py-3 text-gray-500">{item.keterangan}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* PAGINATION */}
            <div className="flex justify-between items-center text-sm text-gray-500">
                <div>
                    Showing {(page - 1) * limit + 1}–
                    {Math.min(page * limit, sorted.length)} of {sorted.length} data
                </div>

                <div className="flex gap-1">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="px-3 py-1 border rounded-md"
                    >
                        Previous
                    </button>

                    {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setPage(i + 1)}
                            className={`w-8 h-8 rounded-md border ${page === i + 1 ? "bg-gray-200" : ""
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="px-3 py-1 border rounded-md"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    )
}
