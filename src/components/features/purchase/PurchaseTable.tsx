"use client"

import { useState } from "react"
import {
    Table,
    TableHeader,
    TableHead,
    TableRow,
    TableBody,
    TableCell,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Purchase } from "@/types/purchase.types"
import { MoreVertical, Plus } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { useRouter } from "next/router"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Props {
    data: Purchase[]
    onDelete: (id: string) => void
    onAdd?: () => void
}

export default function PurchaseTable({ data, onDelete, onAdd }: Props) {
    const router = useRouter()
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    // Filter data based on search
    const [searchTerm, setSearchTerm] = useState("")

    const filteredData = data.filter(item =>
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.date.includes(searchTerm)
    )

    // Pagination logic
    const totalPages = Math.ceil(filteredData.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentData = filteredData.slice(startIndex, endIndex)

    // Reset page when search changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // useEffect(() => setCurrentPage(1), [searchTerm]) // implicit by state setter in onChange if needed, or effect.
    // Let's use simple logic: if search changes, set page to 1.
    const handleSearch = (term: string) => {
        setSearchTerm(term)
        setCurrentPage(1)
    }

    const handleItemsPerPageChange = (val: string) => {
        setItemsPerPage(Number(val))
        setCurrentPage(1)
    }

    // Get IDs of current page items
    const currentPageIds = currentData.map(item => item.id)

    // Check if all items on current page are selected
    const allCurrentPageSelected = currentPageIds.length > 0 && currentPageIds.every(id => selectedIds.has(id))

    // Bulk select handler
    const handleBulkSelect = () => {
        const newSelectedIds = new Set(selectedIds)

        if (allCurrentPageSelected) {
            // Unselect all on current page
            currentPageIds.forEach(id => newSelectedIds.delete(id))
        } else {
            // Select all on current page
            currentPageIds.forEach(id => newSelectedIds.add(id))
        }

        setSelectedIds(newSelectedIds)
    }

    // Individual toggle handler
    const handleToggle = (id: string) => {
        const newSelectedIds = new Set(selectedIds)

        if (newSelectedIds.has(id)) {
            newSelectedIds.delete(id)
        } else {
            newSelectedIds.add(id)
        }

        setSelectedIds(newSelectedIds)
    }

    return (
        <div className="space-y-4">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative w-full sm:w-72">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Search here"
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                        />
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <span>Show</span>
                        <Select
                            value={String(itemsPerPage)}
                            onValueChange={(val) => handleItemsPerPageChange(val)}
                        >
                            <SelectTrigger className="h-9 w-[70px] bg-white">
                                <SelectValue placeholder="10" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                        </Select>
                        <span>Page</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {onAdd && (
                        <Button size="sm" onClick={onAdd} className="bg-[#1e293b] hover:bg-[#0f172a] text-white">
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah
                        </Button>
                    )}
                </div>
            </div>

            <div className="rounded-sm border bg-card shadow-md hover:shadow-lg transition-shadow duration-300">
                <Table>
                    <TableHeader>
                        <TableRow style={{ backgroundColor: '#F9FAFB' }} className="animate-in fade-in-0 duration-500">
                            <TableHead className="w-12">
                                <Checkbox
                                    checked={allCurrentPageSelected}
                                    onCheckedChange={handleBulkSelect}
                                />
                            </TableHead>
                            <TableHead className="font-semibold text-foreground">KODE BELI</TableHead>
                            <TableHead className="font-semibold text-foreground">TANGGAL</TableHead>
                            <TableHead className="font-semibold text-foreground">SUPPLIER</TableHead>
                            <TableHead className="font-semibold text-foreground">TOTAL BIAYA</TableHead>
                            <TableHead className="font-semibold text-foreground">TOTAL DPP</TableHead>
                            <TableHead className="font-semibold text-foreground">TOTAL PPN</TableHead>
                            <TableHead className="font-semibold text-foreground">TOTAL BELI</TableHead>
                            <TableHead className="font-semibold text-foreground">KURANG BAYAR</TableHead>
                            <TableHead className="font-semibold text-right text-foreground">
                                ACTION
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentData.map((item) => (
                            <TableRow
                                key={item.id}
                                className="border-t hover:bg-muted/40 transition-colors"
                                data-state={selectedIds.has(item.id) && "selected"}
                            >
                                <TableCell className="w-12">
                                    <Checkbox
                                        checked={selectedIds.has(item.id)}
                                        onCheckedChange={() => handleToggle(item.id)}
                                    />
                                </TableCell>
                                <TableCell className="text-blue-600 font-medium cursor-pointer hover:underline" onClick={() => router.push(`/transaksi/pembelian-unit/${item.id}/detail`)}>
                                    {item.code}
                                </TableCell>
                                <TableCell>
                                    {format(new Date(item.date), "dd/MM/yyyy")}
                                </TableCell>
                                <TableCell>{item.supplierName}</TableCell>
                                <TableCell>{Number(item.totalCost).toLocaleString("id-ID")}</TableCell>
                                <TableCell>{Number(item.totalDpp).toLocaleString("id-ID")}</TableCell>
                                <TableCell>{Number(item.totalPpn).toLocaleString("id-ID")}</TableCell>
                                <TableCell className="font-semibold">{Number(item.totalPurchase).toLocaleString("id-ID")}</TableCell>
                                <TableCell className="text-red-500 font-semibold">
                                    {Number(item.remainingPayment).toLocaleString("id-ID")}
                                </TableCell>

                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    router.push(`/transaksi/pembelian-unit/${item.id}/detail`)
                                                }
                                            >
                                                Detail
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    router.push(`/transaksi/pembelian-unit/${item.id}/edit`)
                                                }
                                            >
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => window.open(`/transaksi/pembelian-unit/${item.id}/detail?print=true`, '_blank')}
                                            >
                                                Print
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => onDelete(item.id)}
                                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                            >
                                                Hapus
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    Showing {filteredData.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </Button>

                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number

                        if (totalPages <= 5) {
                            pageNum = i + 1
                        } else if (currentPage <= 3) {
                            pageNum = i + 1
                        } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i
                        } else {
                            pageNum = currentPage - 2 + i
                        }

                        return (
                            <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(pageNum)}
                                className="w-10"
                            >
                                {pageNum}
                            </Button>
                        )
                    })}

                    {totalPages > 5 && (
                        <>
                            <span className="text-muted-foreground">...</span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(totalPages)}
                                className="w-10"
                            >
                                {totalPages}
                            </Button>
                        </>
                    )}

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}
