import { useMemo } from 'react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import type { Brand } from '@/@types/brand.types';
import type { PaginationMeta } from '@/@types/pagination.types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreVertical, ImageIcon, Pencil, Trash } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useTableSort } from '@/hooks/useTableSort';
import { SortableHeader } from '@/components/ui/sortable-header';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

interface BrandTableProps {
    data: Brand[];
    meta?: PaginationMeta;
    search: string;
    page: number;
    perPage: number;
    isLoading?: boolean;
    onEdit: (brand: Brand) => void;
    onDelete: (brand: Brand) => void;
    onPageChange: (page: number) => void;
    onPerPageChange: (perPage: number) => void;
}

export const BrandTable = ({
    data,
    meta,
    page,
    perPage,
    isLoading = false,
    onEdit,
    onDelete,
    onPageChange,
    onPerPageChange,
}: BrandTableProps) => {
    const { sortedData, sortKey, sortOrder, handleSort } = useTableSort({
        data,
    });

    const columns = useMemo<ColumnDef<Brand>[]>(
        () => [
            {
                accessorKey: 'name',
                header: () => <SortableHeader title="NAMA MERK" sortKey="name" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} />,
                cell: ({ row }) => (
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-slate-50 overflow-hidden">
                            {row.original.image ? (
                                <img src={row.original.image} alt={row.original.name} className="h-full w-full object-contain" />
                            ) : (
                                <ImageIcon className="h-5 w-5 text-slate-400" />
                            )}
                        </div>
                        <span className="text-sm font-semibold text-slate-900">{row.original.name}</span>
                    </div>
                ),
            },
            {
                accessorKey: 'createdAt',
                header: () => <SortableHeader title="TANGGAL DIBUAT" sortKey="createdAt" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} />,
                cell: ({ row }) => (
                    <span className="text-sm text-slate-600">
                        {row.original.createdAt ? format(new Date(row.original.createdAt), 'dd MMMM yyyy', { locale: localeId }) : '-'}
                    </span>
                ),
            },
            {
                id: 'actions',
                header: () => <div className="text-right font-semibold uppercase">ACTION</div>,
                cell: ({ row }) => (
                    <div className="flex justify-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onEdit(row.original)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onDelete(row.original)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                                    <Trash className="mr-2 h-4 w-4" />
                                    Hapus
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ),
            },
        ],
        [onDelete, onEdit, sortKey, sortOrder, handleSort],
    );

    const table = useReactTable({
        data: sortedData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
    });

    const total = meta?.total ?? 0;
    const totalPages = meta?.lastPage ?? 1;
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;

    return (
        <div className="space-y-4">
            {/* SHOW ENTRIES */}
            <div className="flex items-center gap-2 text-sm">
                <span>Show</span>
                <Select value={String(perPage)} onValueChange={(val) => onPerPageChange(Number(val))}>
                    <SelectTrigger className="h-9 w-20 bg-white">
                        <SelectValue placeholder="10" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                </Select>
                <span>Entries</span>
            </div>

            <div className="rounded-xl border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted hover:bg-muted">
                            {table.getHeaderGroups().map((headerGroup) => (
                                headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="text-xs font-semibold text-muted-foreground py-4">
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            [...Array(perPage)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="h-10 w-10 rounded-lg" />
                                            <Skeleton className="h-4 w-32" />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-32" />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Skeleton className="h-8 w-8 ml-auto" />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="text-center text-muted-foreground py-10">
                                    Tidak ada data.
                                </TableCell>
                            </TableRow>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} className="hover:bg-muted/50">
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-4 text-sm">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* PAGINATION */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                    Showing {data.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, total)} of {total} entries
                </span>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1}>
                        Previous
                    </Button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) {
                            pageNum = i + 1;
                        } else if (page <= 3) {
                            pageNum = i + 1;
                        } else if (page >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                        } else {
                            pageNum = page - 2 + i;
                        }

                        return (
                            <Button key={pageNum} variant={page === pageNum ? 'default' : 'outline'} size="sm" onClick={() => onPageChange(pageNum)} className="w-10">
                                {pageNum}
                            </Button>
                        );
                    })}

                    {totalPages > 5 && page < totalPages - 2 && (
                        <>
                            <span className="text-muted-foreground">...</span>
                            <Button variant="outline" size="sm" onClick={() => onPageChange(totalPages)} className="w-10">
                                {totalPages}
                            </Button>
                        </>
                    )}

                    <Button variant="outline" size="sm" onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages}>
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
};
