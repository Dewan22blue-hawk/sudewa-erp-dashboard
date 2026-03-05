import { PenerimaanPiutang } from "@/@types/penerimaan-piutang.types"
import { MoreVertical, Search, ArrowUpDown } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/router"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useTableSort } from "@/hooks/useTableSort"
import { SortableHeader } from "@/components/ui/sortable-header"

interface Props {
    data: PenerimaanPiutang[]
}

export default function PenerimaanPiutangTable({ data }: Props) {
    const [search, setSearch] = useState("")
    const [itemsPerPage, setItemsPerPage] = useState("25")
    const [currentPage, setCurrentPage] = useState(1)
    const [sortConfig, setSortConfig] = useState<{ key: keyof PenerimaanPiutang; direction: 'asc' | 'desc' } | null>(null)
    const router = useRouter()

    // Ensure slug is a string
    const slug = typeof router.query.slug === 'string' ? router.query.slug : ""

    // FILTERING
    const filteredData = data.filter(item =>
        item.kodeTerima.toLowerCase().includes(search.toLowerCase()) ||
        item.kodeJual.toLowerCase().includes(search.toLowerCase()) ||
        (item as any).kasMasuk?.toLowerCase().includes(search.toLowerCase()) // defensive check
    )

    const { sortedData, sortKey, sortOrder, handleSort } = useTableSort({
        data: filteredData,
    })

    // PAGINATION
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
                        onChange={e => {
                            setSearch(e.target.value)
                            setCurrentPage(1)
                        }}
                        className="pl-9 h-10"
                    />
                </div>

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
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                    </Select>
                    <span>Page</span>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-200/50 uppercase text-sm font-semibold text-gray-900 leading-normal">
                        <tr className="border-b border-gray-200">
                            <th className="px-4 py-3 text-left">NO</th>
                            <th className="py-2 text-left">
                                <SortableHeader title="KODE TERIMA" sortKey="kodeTerima" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-900 justify-start w-full" />
                            </th>
                            <th className="py-2 text-left">
                                <SortableHeader title="KODE JUAL" sortKey="kodeJual" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-900 justify-start w-full" />
                            </th>
                            <th className="py-2 text-left">
                                <SortableHeader title="TANGGAL TERIMA" sortKey="tanggalTerima" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-900 justify-start w-full" />
                            </th>
                            <th className="py-2 text-left">
                                <SortableHeader title="KAS MASUK" sortKey="kasMasuk" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-900 justify-start w-full" />
                            </th>
                            <th className="py-2 text-right">
                                <SortableHeader title="JUMLAH TERIMA" sortKey="jumlahTerima" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-900 justify-end w-full" />
                            </th>
                            <th className="px-4 py-3 text-center">ACTION</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {paginatedData.length > 0 ? (
                            paginatedData.map((item, i) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">{startIndex + i + 1}</td>
                                    <td className="px-4 py-3 font-medium">{item.kodeTerima}</td>
                                    <td className="px-4 py-3 text-blue-600">{item.kodeJual}</td>
                                    <td className="px-4 py-3">{item.tanggalTerima}</td>
                                    <td className="px-4 py-3">{item.kasMasuk}</td>
                                    <td className="px-4 py-3 text-right">
                                        Rp {item.jumlahTerima.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    {slug ? (
                                                        <Link href={`/dashboard/${slug}/finance/data-penerimaan-piutang/${item.id}`}>
                                                            Detail
                                                        </Link>
                                                    ) : (
                                                        <span className="text-gray-400 cursor-not-allowed">Detail</span>
                                                    )}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                    Tidak ada data yang ditemukan.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* PAGINATION */}
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
