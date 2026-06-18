import { useMemo } from 'react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import type { Brand } from '@/@types/brand.types';
import type { PaginationMeta } from '@/@types/pagination.types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreVertical, ImageIcon, Pencil, Trash, ArrowUp, ArrowDown, ArrowUpDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useTableSort } from '@/hooks/useTableSort';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface BrandTableProps {
    data: Brand[];
    meta?: PaginationMeta;
    search: string;
    onSearchChange: (value: string) => void;
    page: number;
    perPage: number;
    isLoading?: boolean;
    onEdit: (brand: Brand) => void;
    onDelete: (brand: Brand) => void;
    onPageChange: (page: number) => void;
    onPerPageChange: (perPage: number) => void;
}

function SortIcon({ sortKey, currentSortKey, sortOrder }: { sortKey: string; currentSortKey: string; sortOrder: any }) {
  const isActive = currentSortKey === sortKey;
  if (isActive && sortOrder === 'asc')
    return <ArrowUp className="h-3 w-3 text-indigo-500 shrink-0 transition-colors" />;
  if (isActive && sortOrder === 'desc')
    return <ArrowDown className="h-3 w-3 text-indigo-500 shrink-0 transition-colors" />;
  return <ArrowUpDown className="h-3 w-3 text-gray-400 shrink-0 opacity-0 group-hover:opacity-70 transition-opacity duration-150" />;
}

export const BrandTable = ({
    data,
    meta,
    search,
    onSearchChange,
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
                header: () => (
                    <div className="flex items-center gap-1">
                        NAMA MERK
                        <SortIcon sortKey="name" currentSortKey={sortKey as string} sortOrder={sortOrder} />
                    </div>
                ),
                cell: ({ row }) => (
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-slate-50 overflow-hidden">
                            {row.original.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
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
                header: () => (
                    <div className="flex items-center gap-1">
                        TANGGAL DIBUAT
                        <SortIcon sortKey="createdAt" currentSortKey={sortKey as string} sortOrder={sortOrder} />
                    </div>
                ),
                cell: ({ row }) => (
                    <span className="text-sm text-slate-600">
                        {row.original.createdAt ? format(new Date(row.original.createdAt), 'dd MMMM yyyy', { locale: localeId }) : '-'}
                    </span>
                ),
            },
            {
                id: 'actions',
                header: () => 'ACTION',
                cell: ({ row }) => (
                    <div className="flex justify-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 p-0 rounded-full">
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
        [onDelete, onEdit, sortKey, sortOrder],
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
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative w-full sm:w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search here"
                            className="pl-9 bg-white"
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-500 whitespace-nowrap">
                        <span>Show</span>
                        <Select value={perPage.toString()} onValueChange={(v) => onPerPageChange(Number(v))}>
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
                        <span>Page</span>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                <Table>
                    <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
                        <TableRow className="hover:bg-[#f8f9fa]">
                            {table.getHeaderGroups().map((headerGroup) => (
                                headerGroup.headers.map((header) => {
                                    const columnId = header.id;
                                    const isSortable = columnId === 'name' || columnId === 'createdAt';
                                    const isAction = columnId === 'actions';
                                    const isSorted = sortKey === columnId;

                                    return (
                                        <TableHead
                                            key={header.id}
                                            className={cn(
                                                'px-4 py-4 text-xs font-semibold uppercase select-none transition-colors',
                                                isAction ? 'text-center text-gray-600 w-[100px]' : 'text-left',
                                                isSortable ? 'group cursor-pointer' : '',
                                                isSortable && isSorted ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'
                                            )}
                                            onClick={isSortable ? () => handleSort(columnId) : undefined}
                                        >
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    );
                                })
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            [...Array(perPage)].map((_, i) => (
                                <TableRow key={i} className="hover:bg-gray-50 transition-colors">
                                    <TableCell className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="h-10 w-10 rounded-lg" />
                                            <Skeleton className="h-4 w-32" />
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-4 py-4">
                                        <Skeleton className="h-4 w-32" />
                                    </TableCell>
                                    <TableCell className="px-4 py-4 text-center">
                                        <Skeleton className="h-8 w-8 mx-auto rounded-full" />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="text-center text-gray-500 py-10 text-sm">
                                    Tidak ada data.
                                </TableCell>
                            </TableRow>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} className="hover:bg-gray-50 transition-colors">
                                    {row.getVisibleCells().map((cell) => {
                                        const isAction = cell.column.id === 'actions';
                                        return (
                                            <TableCell key={cell.id} className={cn("px-4 py-4 text-sm", isAction ? "text-center" : "text-left")}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* PAGINATION */}
            <div className="flex flex-col gap-4 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between">
                <span>
                    Showing {data.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, total)} of {total} entries
                </span>

                <div className="flex flex-wrap items-center justify-end gap-1 text-slate-800">
                    <Button variant="ghost" size="sm" className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
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
                            <Button
                                key={pageNum}
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    'h-9 min-w-9 rounded-xl border px-3 text-sm font-medium shadow-none',
                                    page === pageNum
                                        ? 'border-slate-200 bg-white text-slate-950 shadow-sm'
                                        : 'border-transparent bg-transparent text-slate-700 hover:border-slate-200 hover:bg-white',
                                )}
                                onClick={() => onPageChange(pageNum)}
                            >
                                {pageNum}
                            </Button>
                        );
                    })}

                    {totalPages > 5 && page < totalPages - 2 && (
                        <>
                            <span className="px-1 text-sm text-slate-500">...</span>
                            <Button variant="ghost" size="sm" className="h-9 min-w-9 rounded-xl border border-transparent px-3 text-sm font-medium text-slate-700 hover:border-slate-200 hover:bg-white" onClick={() => onPageChange(totalPages)}>
                                {totalPages}
                            </Button>
                        </>
                    )}

                    <Button variant="ghost" size="sm" className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
};
