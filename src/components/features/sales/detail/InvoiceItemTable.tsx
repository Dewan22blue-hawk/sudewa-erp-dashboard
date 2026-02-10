"use client"

import { useState } from "react"
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { InvoiceItem } from "./invoice.types"
import { MoreVertical } from "lucide-react"

/**
 * Format angka dengan titik separator
 */
function formatNumber(value: number): string {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/**
 * Invoice Item Table dengan Bulk Select dan Action - EXACT sesuai Figma
 */
export function InvoiceItemTable({ items }: { items: InvoiceItem[] }) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    // Pagination logic
    const totalPages = Math.ceil(items.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentData = items.slice(startIndex, endIndex)

    // Get IDs of current page items
    const currentPageIds = currentData.map(item => item.id)

    // Check if all items on current page are selected
    const allCurrentPageSelected = currentPageIds.every(id => selectedIds.has(id)) && currentPageIds.length > 0

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

    // Action handlers
    const handleEdit = (item: InvoiceItem) => {
        console.log('Edit item:', item)
        alert(`Edit: ${item.unitType}`)
    }

    const handleDetail = (item: InvoiceItem) => {
        console.log('Detail item:', item)
        alert(`Detail: ${item.unitType}`)
    }

    const handleDelete = (item: InvoiceItem) => {
        console.log('Delete item:', item)
        if (confirm(`Hapus ${item.unitType}?`)) {
            alert('Item deleted!')
        }
    }

    return (
        <Card className="rounded-xl" style={{ border: '1px solid #E5E5E5' }}>
            {/* Card Header */}
            <CardHeader className="border-b" style={{ borderColor: '#E5E5E5' }}>
                <div>
                    <h2 className="text-lg font-semibold">Detail Penjualan Unit</h2>
                    <p className="text-sm text-muted-foreground">
                        Rincian lengkap unit yang terjual
                    </p>
                </div>
            </CardHeader>

            {/* Table */}
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow style={{ backgroundColor: '#F9FAFB' }}>
                            {/* Bulk Select Checkbox */}
                            <TableHead className="w-12">
                                <Checkbox
                                    checked={allCurrentPageSelected}
                                    onCheckedChange={handleBulkSelect}
                                />
                            </TableHead>
                            <TableHead className="font-semibold">No</TableHead>
                            <TableHead className="font-semibold">TIPE UNIT</TableHead>
                            <TableHead className="font-semibold text-center">QTY</TableHead>
                            <TableHead className="font-semibold text-right">HARGA JUAL</TableHead>
                            <TableHead className="font-semibold text-right">BIAYA BBN</TableHead>
                            <TableHead className="font-semibold text-right">BIAYA EKSPEDISI</TableHead>
                            <TableHead className="font-semibold text-right">BIAYA LAIN</TableHead>
                            <TableHead className="font-semibold text-right">HPP</TableHead>
                            <TableHead className="font-semibold text-right">DPP</TableHead>
                            <TableHead className="font-semibold text-right">PPN</TableHead>
                            <TableHead className="font-semibold text-right">JUMLAH</TableHead>
                            <TableHead className="font-semibold text-center">ACTION</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {currentData.map((item, i) => (
                            <TableRow key={item.id} className="hover:bg-muted/30">
                                {/* Checkbox */}
                                <TableCell className="w-12">
                                    <Checkbox
                                        checked={selectedIds.has(item.id)}
                                        onCheckedChange={() => handleToggle(item.id)}
                                    />
                                </TableCell>

                                <TableCell className="font-medium">{startIndex + i + 1}</TableCell>
                                <TableCell className="font-medium">{item.unitType}</TableCell>
                                <TableCell className="text-center">{item.qty}</TableCell>
                                <TableCell className="text-right">{formatNumber(item.hargaJual)}</TableCell>
                                <TableCell className="text-right">{item.biayaBbn}</TableCell>
                                <TableCell className="text-right">{item.biayaEkspedisi}</TableCell>
                                <TableCell className="text-right">{item.biayaLain}</TableCell>
                                <TableCell className="text-right">{formatNumber(item.hpp)}</TableCell>
                                <TableCell className="text-right">{formatNumber(item.dpp)}</TableCell>
                                <TableCell className="text-right">{formatNumber(item.ppn)}</TableCell>
                                <TableCell className="text-right font-semibold">{formatNumber(item.jumlah)}</TableCell>

                                {/* Action Dropdown */}
                                <TableCell className="text-center">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="rounded-md p-1 hover:bg-muted">
                                                <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEdit(item)}>
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDetail(item)}>
                                                Detail
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleDelete(item)}
                                                className="text-red-600"
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

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t p-4" style={{ borderColor: '#E5E5E5' }}>
                        <div className="text-sm text-muted-foreground">
                            Showing {startIndex + 1} to {Math.min(endIndex, items.length)} of {items.length} entries
                            {selectedIds.size > 0 && (
                                <span className="ml-2 font-medium text-primary">
                                    ({selectedIds.size} selected)
                                </span>
                            )}
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
                )}
            </CardContent>
        </Card>
    )
}
