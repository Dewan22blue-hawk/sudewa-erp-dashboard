import { useState } from "react"
import { Kas } from "@/@types/kas.types"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreVertical, Plus } from "lucide-react"

interface Props {
    data: Kas[]
    onEdit: (item: Kas) => void
    onDelete: (item: Kas) => void
    onAdd?: () => void
}

export function KasTable({ data, onEdit, onDelete, onAdd }: Props) {
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    // Pagination logic
    const totalPages = Math.ceil(data.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentData = data.slice(startIndex, endIndex)

    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(Number(value))
        setCurrentPage(1) // Reset to page 1 on page size change
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="flex items-center gap-2 whitespace-nowrap">
                    <span className="text-sm font-medium">Show</span>
                    <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                        <SelectTrigger className="w-[70px] bg-white">
                            <SelectValue placeholder="10" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                    </Select>
                    <span className="text-sm font-medium">Entries</span>
                </div>

                <div className="flex w-full sm:w-auto justify-end">
                    {onAdd && (
                        <Button onClick={onAdd} className="bg-[#1f304f] hover:bg-[#1a2842] text-white whitespace-nowrap">
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah
                        </Button>
                    )}
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="font-semibold uppercase text-slate-700">Kode Kas</TableHead>
                            <TableHead className="font-semibold uppercase text-slate-700">Deskripsi</TableHead>
                            <TableHead className="font-semibold uppercase text-slate-700">Jenis</TableHead>
                            <TableHead className="text-right font-semibold uppercase text-slate-700">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                    Tidak ada data
                                </TableCell>
                            </TableRow>
                        ) : (
                            currentData.map((item) => (
                                <TableRow key={item.id} className="hover:bg-slate-50/50">
                                    <TableCell className="font-medium text-slate-800">{item.code}</TableCell>
                                    <TableCell className="text-slate-700">{item.description}</TableCell>
                                    <TableCell className="text-slate-700">{item.type}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button size="icon" variant="ghost" className="h-8 w-8">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onEdit(item)}>
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => onDelete(item)}
                                                    className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                                >
                                                    Hapus
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            {data.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
                    <div className="text-sm text-slate-500">
                        Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of {data.length} entries
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="h-8 px-3"
                        >
                            Previous
                        </Button>

                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum: number;
                            if (totalPages <= 5) pageNum = i + 1;
                            else if (currentPage <= 3) pageNum = i + 1;
                            else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                            else pageNum = currentPage - 2 + i;

                            return (
                                <Button
                                    key={pageNum}
                                    variant={currentPage === pageNum ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`h-8 w-8 p-0 ${currentPage === pageNum ? 'bg-[#1f304f] hover:bg-[#1a2842]' : ''}`}
                                >
                                    {pageNum}
                                </Button>
                            );
                        })}

                        {totalPages > 5 && currentPage < totalPages - 2 && (
                            <>
                                <span className="px-2 text-slate-500">...</span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(totalPages)}
                                    className="h-8 w-8 p-0"
                                >
                                    {totalPages}
                                </Button>
                            </>
                        )}

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="h-8 px-3"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
