"use client"
import React, { useState } from "react"
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Eye, MoreVertical, Pencil, Trash2 } from "lucide-react"
import { PurchaseUnit } from "@/@types/purchase.types"
import { useRouter } from "next/router"
import { toast } from "sonner"
import { useDeletePurchaseUnit } from "@/hooks/usePurchase"

interface Props {
    units: PurchaseUnit[]
    purchaseId: string
    slug: string
}

export default function PurchaseUnitTable({ units, purchaseId, slug }: Props) {
    const router = useRouter()
    const deleteMutation = useDeletePurchaseUnit()
    const [unitToDelete, setUnitToDelete] = useState<string | null>(null)

    // DELETE HANDLER
    const handleDeleteConfirm = async () => {
        if (!unitToDelete) return
        try {
            await deleteMutation.mutateAsync({ purchaseId, unitId: unitToDelete })
            toast.success("Unit deleted successfully")
            setUnitToDelete(null)
        } catch (error) {
            console.error("Failed to delete unit:", error)
            toast.error("Failed to delete unit")
        }
    }

    // ACTIONS
    const handleDetail = (unitId: string) => {
        router.push(`/dashboard/${slug}/transaksi/pembelian-unit/${purchaseId}/unit/${unitId}`)
    }

    const handleEdit = (unitId: string) => {
        router.push(`/dashboard/${slug}/transaksi/pembelian-unit/${purchaseId}/unit/${unitId}/edit`)
    }

    const columns: ColumnDef<PurchaseUnit>[] = [
        // ... (other columns)
        {
            id: "actions",
            header: () => <div className="text-right">ACTION</div>,
            cell: ({ row }) => {
                const unit = row.original
                return (
                    <div className="flex justify-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleDetail(unit.id)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Detail
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(unit.id)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setUnitToDelete(unit.id)}
                                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Hapus
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )
            },
        },
    ]

    const table = useReactTable({
        data: units,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize: 5,
            },
        },
    })

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-xl font-semibold">Detail Pembelian Unit</h2>
                <p className="text-muted-foreground">Rincian lengkap unit yang dibeli</p>
            </div>

            <div className="flex items-center gap-2">
                <span className="text-sm">Show</span>
                <Select
                    value={`${table.getState().pagination.pageSize}`}
                    onValueChange={(value) => {
                        table.setPageSize(Number(value))
                    }}
                >
                    <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue placeholder={table.getState().pagination.pageSize} />
                    </SelectTrigger>
                    <SelectContent side="top">
                        {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                            <SelectItem key={pageSize} value={`${pageSize}`}>
                                {pageSize}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <span className="text-sm">Page</span>
            </div>

            <div className="rounded-md border bg-card shadow-sm">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="bg-[#F9FAFB] hover:bg-[#F9FAFB]">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead
                                            key={header.id}
                                            className={`font-semibold text-foreground bg-[#F9FAFB] ${header.id === 'actions' ? 'print:hidden' : ''}`}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row, index) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="hover:bg-muted/50"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className={`py-4 ${cell.column.id === 'actions' ? 'print:hidden' : ''}`}
                                        >
                                            {cell.column.id === 'no' ? index + 1 : flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                                    No units found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-2 print:hidden pb-4">
                <div className="text-sm text-muted-foreground">
                    Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
                    {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of {table.getFilteredRowModel().rows.length} data
                </div>

                <div className="flex items-center space-x-2">
                    <Button
                        variant="ghost"
                        className="h-8 px-2 text-muted-foreground hover:text-foreground"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>

                    {Array.from({ length: Math.min(5, table.getPageCount()) }, (_, i) => {
                        let pageNum: number
                        const currentPage = table.getState().pagination.pageIndex + 1
                        const totalPages = table.getPageCount()

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
                                variant={currentPage === pageNum ? "outline" : "ghost"}
                                size="sm"
                                onClick={() => table.setPageIndex(pageNum - 1)}
                                className={`w-8 h-8 p-0 ${currentPage === pageNum ? "border-input bg-white text-black font-medium shadow-sm" : "text-muted-foreground"}`}
                            >
                                {pageNum}
                            </Button>
                        )
                    })}

                    {table.getPageCount() > 5 && (
                        <span className="text-muted-foreground">...</span>
                    )}

                    <Button
                        variant="ghost"
                        className="h-8 px-2 text-muted-foreground hover:text-foreground"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>

            <AlertDialog open={!!unitToDelete} onOpenChange={() => setUnitToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the unit
                            from the purchase order.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                            {deleteMutation.isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
