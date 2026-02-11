"use client"

import { useState } from "react"
import {
    Table,
    TableHeader,
    TableHead,
    TableRow,
    TableBody,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { SALES_DATA } from "./sales.data"
import { SalesTableRow } from "./SalesTableRow"

/**
 * Sales Table Component dengan Pagination dan Bulk Select
 */
export function SalesTable() {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    // Pagination logic
    const totalPages = Math.ceil(SALES_DATA.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentData = SALES_DATA.slice(startIndex, endIndex)

    // Get IDs of current page items
    const currentPageIds = currentData.map(item => item.id)

    // Check if all items on current page are selected
    const allCurrentPageSelected = currentPageIds.every(id => selectedIds.has(id))

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
            <div className="rounded-sm border bg-card shadow-md hover:shadow-lg transition-shadow duration-300">
                <Table>
                    <TableHeader>
                        <TableRow style={{ backgroundColor: '#F9FAFB' }} className="animate-in fade-in-0 duration-500">
                            <TableHead className="w-12">
                                <Checkbox
                                    checked={allCurrentPageSelected && currentPageIds.length > 0}
                                    onCheckedChange={handleBulkSelect}
                                />
                            </TableHead>
                            <TableHead className="font-semibold text-foreground">KODE JUAL</TableHead>
                            <TableHead className="font-semibold text-foreground">TANGGAL</TableHead>
                            <TableHead className="font-semibold text-foreground">CUSTOMER</TableHead>
                            <TableHead className="font-semibold text-right text-foreground">TOTAL BIAYA</TableHead>
                            <TableHead className="font-semibold text-right text-foreground">TOTAL DPP</TableHead>
                            <TableHead className="font-semibold text-right text-foreground">TOTAL PPN</TableHead>
                            <TableHead className="font-semibold text-right text-foreground">TOTAL JUAL</TableHead>
                            <TableHead className="font-semibold text-right text-foreground">KURANG BAYAR</TableHead>
                            <TableHead className="font-semibold text-right text-foreground">
                                ACTION
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {currentData.map((item, index) => (
                            <SalesTableRow
                                key={item.id}
                                item={item}
                                isSelected={selectedIds.has(item.id)}
                                onToggle={handleToggle}
                            />
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(endIndex, SALES_DATA.length)} of {SALES_DATA.length} entries
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
