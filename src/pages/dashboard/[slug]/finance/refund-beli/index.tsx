"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select"
import { Search } from "lucide-react"
import { useRefundBeli } from "@/hooks/useRefundBeli"
import RefundBeliTable from "@/components/features/refund-beli/RefundBeliTable"
import { DashboardLayout } from "@/components/layout/DashboardLayout"

import { useRouter } from "next/router"

// ... imports

export default function RefundBeliPage() {
    const router = useRouter()
    const { slug } = router.query
    const { data = [], isLoading } = useRefundBeli()

    const [search, setSearch] = useState("")
    const [pageSize, setPageSize] = useState(25)
    const [currentPage, setCurrentPage] = useState(1)
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

    const filteredData = useMemo(() => {
        let result = data.filter(item =>
            item.namaSupplier.toLowerCase().includes(search.toLowerCase())
        )

        result.sort((a, b) => {
            // Parse DD/MM/YYYY to Date object
            const parseDate = (dateStr: string) => {
                const [day, month, year] = dateStr.split("/")
                return new Date(Number(year), Number(month) - 1, Number(day)).getTime()
            }

            const dateA = parseDate(a.tanggal)
            const dateB = parseDate(b.tanggal)
            return sortOrder === "asc" ? dateA - dateB : dateB - dateA
        })

        return result
    }, [data, search, sortOrder])

    const totalPages = Math.ceil(filteredData.length / pageSize)

    const paginatedData = filteredData.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    )

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* HEADER */}
                <div>
                    <h1 className="text-2xl font-semibold">
                        Data Refund Pembelian
                    </h1>
                    <p className="text-sm text-gray-500">
                        Kelola arus transaksi refund pembelian
                    </p>
                </div>

                {/* FILTER */}
                <div className="flex justify-start gap-2 items-center">
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
                            value={String(pageSize)}
                            onValueChange={val => setPageSize(Number(val))}
                        >
                            <SelectTrigger className="h-10 w-[70px]">
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
                <RefundBeliTable
                    data={paginatedData}
                    sortOrder={sortOrder}
                    onSort={() =>
                        setSortOrder(prev => (prev === "asc" ? "desc" : "asc"))
                    }
                />

                {/* PAGINATION */}
                <div className="flex justify-between items-center text-sm text-gray-500">
                    <div>
                        Showing {(currentPage - 1) * pageSize + 1}-
                        {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
                        {filteredData.length} data
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                        >
                            Previous
                        </button>

                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-8 h-8 rounded-md ${currentPage === i + 1
                                    ? "bg-gray-200"
                                    : ""
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
