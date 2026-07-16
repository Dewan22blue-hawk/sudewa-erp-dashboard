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
import { MoreVertical, ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import { useTableSort } from "@/hooks/useTableSort"
import { formatCurrency } from "@/lib/utils/currency"

/**
 * Invoice Item Table dengan Bulk Select dan Action - EXACT sesuai Figma
 */
export function InvoiceItemTable({ items }: { items: InvoiceItem[] }) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 25

    const { sortedData, sortKey, sortOrder, handleSort } = useTableSort({
        data: items,
        defaultSortKey: 'unitType',
        defaultSortOrder: 'asc'
    })

    // Pagination logic
    const totalPages = Math.ceil(sortedData.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentData = sortedData.slice(startIndex, endIndex)

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

    const renderSortHeader = (key: string, label: string, alignment: 'left' | 'center' | 'right' = 'left') => {
        const isSorted = sortKey === key;
        const justifyClass = alignment === 'right' ? 'justify-end' : alignment === 'center' ? 'justify-center' : 'justify-start';
        const textAlignment = alignment === 'right' ? 'text-right' : alignment === 'center' ? 'text-center' : 'text-left';
        return (
            <TableHead
                onClick={() => handleSort(key as any)}
                className={`px-4 py-4 text-xs font-semibold uppercase text-slate-500 cursor-pointer select-none group whitespace-nowrap ${textAlignment}`}
            >
                <div className={`flex items-center gap-1 ${justifyClass}`}>
                    <span>{label}</span>
                    {isSorted ? (
                        sortOrder === 'asc' ? (
                            <ArrowUp className="h-3 w-3 text-indigo-500 shrink-0" />
                        ) : (
                            <ArrowDown className="h-3 w-3 text-indigo-500 shrink-0" />
                        )
                    ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-70 transition-opacity duration-150 shrink-0" />
                    )}
                </div>
            </TableHead>
        );
    };

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
                    <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
                        <TableRow>
                            {/* Bulk Select Checkbox */}
                            <TableHead className="w-12 px-4 py-4 text-center">
                                <Checkbox
                                    checked={allCurrentPageSelected}
                                    onCheckedChange={handleBulkSelect}
                                />
                            </TableHead>
                            <TableHead className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500 w-[60px]">No</TableHead>
                            {renderSortHeader('unitType', 'TIPE UNIT', 'left')}
                            {renderSortHeader('qty', 'QTY', 'center')}
                            {renderSortHeader('hargaJual', 'HARGA JUAL', 'center')}
                            {renderSortHeader('biayaBbn', 'BIAYA BBN', 'center')}
                            {renderSortHeader('biayaEkspedisi', 'BIAYA EKSPEDISI', 'center')}
                            {renderSortHeader('biayaLain', 'BIAYA LAIN', 'center')}
                            {renderSortHeader('hpp', 'HPP', 'center')}
                            {renderSortHeader('dpp', 'DPP', 'center')}
                            {renderSortHeader('ppn', 'PPN', 'center')}
                            {renderSortHeader('jumlah', 'JUMLAH', 'center')}
                            <TableHead className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500 whitespace-nowrap sticky right-0 bg-[#f8f9fa] z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {currentData.map((item, i) => (
                            <TableRow key={item.id} className="group border-b hover:bg-gray-50/70 border-slate-100 transition-colors">
                                {/* Checkbox */}
                                <TableCell className="text-center px-4 py-4 sticky right-0 bg-white group-hover:bg-slate-50 z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]">
                                    <Checkbox
                                        checked={selectedIds.has(item.id)}
                                        onCheckedChange={() => handleToggle(item.id)}
                                    />
                                </TableCell>

                                <TableCell className="text-center px-4 py-4 text-sm text-slate-500">{startIndex + i + 1}</TableCell>
                                <TableCell className="text-left px-4 py-4 text-sm font-medium text-slate-900">{item.unitType}</TableCell>
                                <TableCell className="text-center px-4 py-4 text-sm text-slate-700">{item.qty}</TableCell>
                                <TableCell className="text-center px-4 py-4 text-sm text-slate-700">{formatCurrency(item.hargaJual)}</TableCell>
                                <TableCell className="text-center px-4 py-4 text-sm text-slate-700">{formatCurrency(item.biayaBbn)}</TableCell>
                                <TableCell className="text-center px-4 py-4 text-sm text-slate-700">{formatCurrency(item.biayaEkspedisi)}</TableCell>
                                <TableCell className="text-center px-4 py-4 text-sm text-slate-700">{formatCurrency(item.biayaLain)}</TableCell>
                                <TableCell className="text-center px-4 py-4 text-sm text-slate-700">{formatCurrency(item.hpp)}</TableCell>
                                <TableCell className="text-center px-4 py-4 text-sm text-slate-700">{formatCurrency(item.dpp)}</TableCell>
                                <TableCell className="text-center px-4 py-4 text-sm text-slate-700">{formatCurrency(item.ppn)}</TableCell>
                                <TableCell className="text-center px-4 py-4 text-sm font-semibold text-slate-900">{formatCurrency(item.jumlah)}</TableCell>

                                {/* Action Dropdown */}
                                <TableCell className="px-4 py-4 text-center sticky right-0 bg-white group-hover:bg-gray-50 z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="rounded-md p-1 hover:bg-slate-100 transition-colors duration-200 hover:scale-110 active:scale-95 transform">
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
