import { useMemo } from 'react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import type { Account } from '@/@types/account.types';
import type { PaginationMeta } from '@/@types/pagination.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { MoreVertical, Pencil, Plus, Trash, Lock, Search } from 'lucide-react';
import { getVisiblePageNumbers } from '@/lib/api/pagination';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface AccountTableProps {
  data: Account[];
  meta?: PaginationMeta;
  search: string;
  page: number;
  perPage: number;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onAdd: () => void;
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}

export const AccountTable = ({ data, meta, search, page, perPage, isLoading = false, onSearchChange, onAdd, onEdit, onDelete, onPageChange, onPerPageChange }: AccountTableProps) => {
  const columns = useMemo<ColumnDef<Account>[]>(
    () => [
      {
        accessorKey: 'code',
        header: 'KODE',
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-left">
            <span className="font-semibold text-sm text-gray-900">{row.original.code}</span>
            {row.original.is_lock && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex cursor-help p-0.5">
                    <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  Akun ini merupakan data default yang tidak bisa dihapus!
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'name',
        header: 'NAMA AKUN',
        cell: ({ row }) => <span className="text-sm text-gray-900 text-left">{row.original.name}</span>,
      },
      {
        accessorKey: 'accountGroupCode',
        header: 'GRUP',
        cell: ({ row }) => <span className="text-sm text-gray-600 text-left">{row.original.accountGroupCode ?? '-'}</span>,
      },
      {
        accessorKey: 'description',
        header: 'DESKRIPSI',
        cell: ({ row }) => <span className="text-sm text-gray-600 text-left">{row.original.description ?? '-'}</span>,
      },
      {
        accessorKey: 'isActive',
        header: 'STATUS',
        cell: ({ row }) => (
          <div className="flex justify-center">
            <Badge variant={row.original.isActive ? 'default' : 'secondary'} className={row.original.isActive ? '' : 'bg-gray-200 text-gray-700'}>
              {row.original.isActive ? 'Aktif' : 'Nonaktif'}
            </Badge>
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'ACTION',
        cell: ({ row }) => (
          <div className="flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[150px] rounded-xl border-slate-200 p-1.5 shadow-lg">
                <DropdownMenuItem
                  onClick={() => onEdit(row.original)}
                  disabled={row.original.is_lock}
                  className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(row.original)}
                  className="rounded-lg px-3 py-2 text-sm text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer"
                  disabled={row.original.is_lock}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [onDelete, onEdit],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      pagination: {
        pageIndex: page - 1,
        pageSize: perPage,
      },
    },
    manualPagination: true,
    pageCount: meta?.lastPage ?? -1,
  });

  const total = meta?.total ?? data.length;
  const start = total === 0 ? 0 : (page - 1) * perPage + 1;
  const end = total === 0 ? 0 : Math.min(page * perPage, total);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* Search Bar */}
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari akun"
              className="pl-9 bg-white"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {/* Show Page Pagination Dropdown */}
          <div className="flex items-center gap-2 text-sm text-slate-500 whitespace-nowrap">
            <span>Tampilkan</span>
            <select className="rounded border px-3 py-2 text-sm bg-white border-slate-200 text-slate-700" value={perPage} onChange={(e) => onPerPageChange(Number(e.target.value))}>
              {[10, 25, 50].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span>data</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          <Button onClick={onAdd} className="w-full sm:w-auto bg-[#1e3a5f] hover:bg-[#152e4d] text-white whitespace-nowrap h-10 gap-2 rounded-xl">
            <Plus className="h-4 w-4" />
            Tambah
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-none">
        <Table>
          <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-[#f8f9fa]">
                {headerGroup.headers.map((header) => {
                  const columnId = header.id;
                  const isAction = columnId === 'actions';
                  const isStatus = columnId === 'isActive';

                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        'px-4 py-4 text-xs font-semibold text-slate-500 uppercase select-none transition-colors',
                        (isAction || isStatus) ? 'text-center text-slate-500' : 'text-left',
                        isAction && 'w-[80px] sticky right-0 bg-[#f8f9fa] z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]'
                      )}
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(perPage)].map((_, i) => (
                <TableRow key={i} className="bg-white hover:bg-slate-50 transition-colors">
                  <TableCell className="px-4 py-4"><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell className="px-4 py-4"><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell className="px-4 py-4"><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell className="px-4 py-4"><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell className="px-4 py-4 text-center"><Skeleton className="h-5 w-16 mx-auto rounded-full" /></TableCell>
                  <TableCell className="px-4 py-4 text-center sticky right-0 bg-white group-hover:bg-slate-50 z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]"><Skeleton className="h-8 w-8 mx-auto rounded-full" /></TableCell>
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="bg-white hover:bg-slate-50 transition-colors">
                  {row.getVisibleCells().map((cell) => {
                    const isAction = cell.column.id === 'actions';
                    const isStatus = cell.column.id === 'isActive';
                    return (
                      <TableCell key={cell.id} className={cn("px-4 py-4 text-sm", isStatus && "text-center", isAction ? "text-center sticky right-0 bg-white group-hover:bg-slate-50 z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]" : !isStatus && "text-left")}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center text-gray-500 py-10 text-sm">
                  Tidak ada data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-4 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between px-1">
        <div>
          Menampilkan {start}-{end} dari {total} data
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1 text-slate-800">
          <Button variant="ghost" size="sm" className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300" disabled={page <= 1} onClick={() => onPageChange(Math.max(1, page - 1))}>
            Sebelumnya
          </Button>
          <div className="flex items-center gap-1">
            {getVisiblePageNumbers(meta?.lastPage ?? 1, page).map((pageNumber) => (
              <Button
                key={pageNumber}
                variant="ghost"
                size="sm"
                className={cn(
                  'h-9 min-w-9 rounded-xl border px-3 text-sm font-medium shadow-none',
                  pageNumber === page
                    ? 'border-slate-200 bg-white text-slate-950 shadow-sm'
                    : 'border-transparent bg-transparent text-slate-700 hover:border-slate-200 hover:bg-white',
                )}
                onClick={() => onPageChange(pageNumber)}
              >
                {pageNumber}
              </Button>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300" disabled={meta ? page >= meta.lastPage : false} onClick={() => onPageChange(page + 1)}>
            Selanjutnya
          </Button>
        </div>
      </div>
    </div>
  );
};
