import { useMemo } from 'react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import type { AccountGroup } from '@/@types/account-group.types';
import type { PaginationMeta } from '@/@types/pagination.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Pencil, Plus, Trash } from 'lucide-react';
import { getVisiblePageNumbers } from '@/lib/api/pagination';
import { useTableSort } from '@/hooks/useTableSort';
import { SortableHeader } from '@/components/ui/sortable-header';

import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

interface AccountGroupTableProps {
  data: AccountGroup[];
  meta?: PaginationMeta;
  search: string;
  page: number;
  perPage: number;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onAdd: () => void;
  onEdit: (accountGroup: AccountGroup) => void;
  onDelete: (accountGroup: AccountGroup) => void;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}

export const AccountGroupTable = ({ data, meta, search, page, perPage, isLoading = false, onSearchChange, onAdd, onEdit, onDelete, onPageChange, onPerPageChange }: AccountGroupTableProps) => {
  const { sortedData, sortKey, sortOrder, handleSort } = useTableSort({
    data,
  });

  const columns = useMemo<ColumnDef<AccountGroup>[]>(
    () => [
      {
        accessorKey: 'code',
        header: () => <SortableHeader title="Kode Grup" sortKey="code" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="px-0 py-0" />,
        cell: ({ row }) => <span className="text-sm font-medium text-foreground">{row.original.code}</span>,
      },
      {
        accessorKey: 'description',
        header: () => <SortableHeader title="Deskripsi" sortKey="description" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="px-0 py-0" />,
        cell: ({ row }) => {
          const desc = row.original.description || '-';
          return (
            <span className="text-sm text-muted-foreground">
              {desc.length > 50 ? `${desc.substring(0, 50)}...` : desc}
            </span>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: () => <SortableHeader title="Tanggal" sortKey="createdAt" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="px-0 py-0" />,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.createdAt ? format(new Date(row.original.createdAt), 'dd MMMM yyyy', { locale: localeId }) : '-'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: () => <div className="text-right uppercase font-semibold text-slate-700">Aksi</div>,
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Input value={search} onChange={(e) => onSearchChange(e.target.value)} placeholder="Cari grup akun" className="w-64" />
          <Button onClick={onAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Tambah
          </Button>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Tampilkan</span>
          <select className="rounded border px-3 py-2 text-sm" value={perPage} onChange={(e) => onPerPageChange(Number(e.target.value))}>
            {[10, 25, 50].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <span>data</span>
        </div>
      </div>

      <div className="rounded-xl border bg-white">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-[#F9FAFB] hover:bg-[#F9FAFB]">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-xs font-semibold text-muted-foreground">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  Tidak ada data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground">
        <div>
          Menampilkan {start}-{end} dari {total} data
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => onPageChange(Math.max(1, page - 1))}>
            Sebelumnya
          </Button>
          <div className="flex items-center gap-1">
            {getVisiblePageNumbers(meta?.lastPage ?? 1, page).map((pageNumber) => (
              <Button key={pageNumber} variant={pageNumber === page ? 'outline' : 'ghost'} size="sm" onClick={() => onPageChange(pageNumber)} className="w-9">
                {pageNumber}
              </Button>
            ))}
          </div>
          <Button variant="ghost" size="sm" disabled={meta ? page >= meta.lastPage : false} onClick={() => onPageChange(page + 1)}>
            Selanjutnya
          </Button>
        </div>
      </div>
    </div>
  );
};
