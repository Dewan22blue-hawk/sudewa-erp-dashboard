import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { UnitItem } from "../sales.data"
import { Button } from "@/components/ui/button"
import { MoreVertical, Trash2, Pencil, ChevronLeft, ChevronRight, Eye } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/router"
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import React from "react"

interface Props {
    units: UnitItem[]
    salesId: string
}

export function SalesUnitTable({ units, salesId }: Props) {
    const router = useRouter()

    const columns: ColumnDef<UnitItem>[] = [
        {
            id: "no",
            header: "No",
            cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
        },
        {
            accessorKey: "color",
            header: "WARNA",
            cell: ({ row }) => <div className="font-medium">{row.getValue("color")}</div>,
        },
        {
            accessorKey: "engineNumber",
            header: "NOMOR MESIN",
            cell: ({ row }) => <div>{row.getValue("engineNumber")}</div>,
        },
        {
            accessorKey: "chassisNumber",
            header: "NOMOR RANGKA",
            cell: ({ row }) => <div>{row.getValue("chassisNumber")}</div>,
        },
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
                                <DropdownMenuItem onClick={() => {
                                    const slugQuery = router.query.slug
                                    const slug = Array.isArray(slugQuery) ? slugQuery[0] : slugQuery || ""
                                    const basePath = slug ? `/dashboard/${slug}/sales` : "/sales"
                                    router.push(`${basePath}/${salesId}/unit/${unit.id}`)
                                }}>
                                    Detail
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                    const slugQuery = router.query.slug
                                    const slug = Array.isArray(slugQuery) ? slugQuery[0] : slugQuery || ""
                                    const basePath = slug ? `/dashboard/${slug}/sales` : "/sales"
                                    router.push(`${basePath}/${salesId}/unit/${unit.id}/edit`)
                                }}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => console.log("Delete", unit.id)}
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
                <h3 className="text-xl font-semibold">Detail Penjualan Unit</h3>
                <p className="text-sm text-muted-foreground">Rincian lengkap unit yang dijual</p>
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

            <div className="rounded-md border bg-white shadow-sm">
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
                                    Belum ada unit yang ditambahkan.
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
        </div>
    )
}
