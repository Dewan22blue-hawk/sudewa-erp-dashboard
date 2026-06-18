import { useState, useMemo } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { MoreVertical, Pencil, Trash, Lock, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import type { AccountGroup } from '@/@types/account-group.types';
import type { PaginationMeta } from '@/@types/pagination.types';
import { useTableSort } from '@/hooks/useTableSort';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AccountGroupTableProps {
  data: AccountGroup[];
  meta?: PaginationMeta;
  isLoading?: boolean;
  onEdit: (accountGroup: AccountGroup) => void;
  onDelete: (accountGroup: AccountGroup) => void;
  page: number;
  perPage: number;
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

export const AccountGroupTable = ({ data, meta, isLoading = false, onEdit, onDelete, page, perPage, onPageChange, onPerPageChange }: AccountGroupTableProps) => {
  const { sortedData, sortKey, sortOrder, handleSort } = useTableSort({
    data,
  });

  const handlePerPageChange = (val: string) => {
    onPerPageChange(Number(val));
    onPageChange(1);
  };

  const safeTotal = meta?.total ?? sortedData.length;
  const totalPages = meta?.lastPage ?? Math.max(1, Math.ceil(safeTotal / perPage));
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-none">
        <Table>
          <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
            <TableRow className="hover:bg-[#f8f9fa]">
              {/* KODE */}
              <TableHead
                className={cn(
                  'group px-4 py-4 text-left text-xs font-semibold uppercase cursor-pointer select-none transition-colors',
                  sortKey === 'code' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                )}
                onClick={() => handleSort('code')}
              >
                <div className="flex items-center gap-1">
                  KODE
                  <SortIcon sortKey="code" currentSortKey={sortKey as string} sortOrder={sortOrder} />
                </div>
              </TableHead>
              {/* NAMA GRUP */}
              <TableHead
                className={cn(
                  'group px-4 py-4 text-left text-xs font-semibold uppercase cursor-pointer select-none transition-colors',
                  sortKey === 'name' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                )}
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  NAMA GRUP
                  <SortIcon sortKey="name" currentSortKey={sortKey as string} sortOrder={sortOrder} />
                </div>
              </TableHead>
              {/* DESKRIPSI */}
              <TableHead
                className={cn(
                  'group px-4 py-4 text-left text-xs font-semibold uppercase cursor-pointer select-none transition-colors',
                  sortKey === 'description' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                )}
                onClick={() => handleSort('description')}
              >
                <div className="flex items-center gap-1">
                  DESKRIPSI
                  <SortIcon sortKey="description" currentSortKey={sortKey as string} sortOrder={sortOrder} />
                </div>
              </TableHead>
              {/* STATUS */}
              <TableHead
                className={cn(
                  'group px-4 py-4 text-center text-xs font-semibold uppercase cursor-pointer select-none transition-colors',
                  sortKey === 'isActive' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                )}
                onClick={() => handleSort('isActive')}
              >
                <div className="inline-flex items-center">
                  <span className="w-3 shrink-0" />
                  <span>STATUS</span>
                  <SortIcon sortKey="isActive" currentSortKey={sortKey as string} sortOrder={sortOrder} />
                </div>
              </TableHead>
              {/* ACTION */}
              <TableHead className="w-[80px] px-4 py-4 text-center text-xs font-semibold text-slate-500 uppercase">
                ACTION
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              [...Array(perPage)].map((_, i) => (
                <TableRow key={i} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="px-4 py-4"><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell className="px-4 py-4"><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell className="px-4 py-4"><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell className="px-4 py-4 text-center"><Skeleton className="h-5 w-16 mx-auto rounded-full" /></TableCell>
                  <TableCell className="px-4 py-4 text-center"><Skeleton className="h-8 w-8 mx-auto rounded-full" /></TableCell>
                </TableRow>
              ))
            ) : sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500 py-10 text-sm">
                  Tidak ada data.
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((group) => (
                <TableRow key={group.id} className="hover:bg-gray-50 transition-colors">
                  {/* KODE */}
                  <TableCell className="px-4 py-4 text-sm font-semibold text-gray-900 text-left">
                    <div className="flex items-center gap-1.5">
                      <span>{group.code}</span>
                      {group.is_lock && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex cursor-help p-0.5">
                              <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            Grup akun terkunci
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>
                  {/* NAMA GRUP */}
                  <TableCell className="px-4 py-4 text-sm text-gray-900 text-left max-w-[200px] truncate" title={group.name}>
                    {group.name.length > 50 ? `${group.name.substring(0, 50)}...` : group.name}
                  </TableCell>
                  {/* DESKRIPSI */}
                  <TableCell className="px-4 py-4 text-sm text-gray-600 text-left max-w-[300px] truncate" title={group.description ?? undefined}>
                    {group.description ? (group.description.length > 50 ? `${group.description.substring(0, 50)}...` : group.description) : '-'}
                  </TableCell>
                  {/* STATUS */}
                  <TableCell className="px-4 py-4 text-center">
                    <Badge variant={group.isActive ? 'default' : 'secondary'} className={group.isActive ? '' : 'bg-gray-200 text-gray-700'}>
                      {group.isActive ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </TableCell>
                  {/* ACTION */}
                  <TableCell className="px-4 py-4 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8 p-0 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-[150px] rounded-xl border-slate-200 p-1.5 shadow-lg">
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                            onEdit(group);
                          }}
                          disabled={group.is_lock}
                          className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer"
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                            onDelete(group);
                          }}
                          className="rounded-lg px-3 py-2 text-sm text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer"
                          disabled={group.is_lock}
                        >
                          <Trash className="mr-2 h-4 w-4" />
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

      {/* PAGINATION */}
      <div className="flex flex-col gap-4 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between px-1">
        <div>
          Showing {sortedData.length > 0 ? startIndex + 1 : 0}-{Math.min(endIndex, safeTotal)} of {safeTotal} data
        </div>

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

          {totalPages > 5 && (
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
