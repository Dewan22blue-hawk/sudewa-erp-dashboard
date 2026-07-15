import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { getVisiblePageNumbers } from '@/lib/api/pagination';
import { getAccountCategoryLabel } from '@/lib/account';
import type { Account } from '@/@types/account.types';
import { MoreVertical, Lock, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { useTableSort } from '@/hooks/useTableSort';

interface AccountTableProps {
  data: Account[];
  total: number;
  isLoading: boolean;
  page: number;
  perPage: number;
  selectedIds: Set<string>;
  canEdit: boolean;
  canDelete: boolean;
  onToggleAll: (checked: boolean) => void;
  onToggleRow: (id: string, checked: boolean) => void;
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
  onPageChange: (page: number) => void;
}

function SortIcon({ sortKey, currentSortKey, sortOrder }: { sortKey: string; currentSortKey: string; sortOrder: any }) {
  const isActive = currentSortKey === sortKey;
  if (isActive && sortOrder === 'asc')
    return <ArrowUp className="h-3 w-3 text-indigo-500 shrink-0 transition-colors" />;
  if (isActive && sortOrder === 'desc')
    return <ArrowDown className="h-3 w-3 text-indigo-500 shrink-0 transition-colors" />;
  return <ArrowUpDown className="h-3 w-3 text-gray-400 shrink-0 opacity-0 group-hover:opacity-70 transition-opacity duration-150" />;
}

export function AccountTable({ data, total, isLoading, page, perPage, selectedIds, onToggleAll, onToggleRow, onEdit, onDelete, onPageChange, canEdit, canDelete }: AccountTableProps) {
  const { sortedData, sortKey, sortOrder, handleSort } = useTableSort({
    data,
  });

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const pageIds = sortedData.map((item) => String(item.id));
  const allChecked = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
  const someChecked = pageIds.some((id) => selectedIds.has(id));
  const start = total === 0 ? 0 : (page - 1) * perPage + 1;
  const end = total === 0 ? 0 : Math.min(page * perPage, total);
  const visiblePages = getVisiblePageNumbers(totalPages, page);
  const showLastPageShortcut = visiblePages[visiblePages.length - 1] !== totalPages;

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <Table>
          <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
            <TableRow className="hover:bg-[#f8f9fa]">
              {/* Checkbox */}
              <TableHead className="w-[52px] px-4 py-4 text-center">
                <Checkbox
                  checked={allChecked ? true : (someChecked ? 'indeterminate' : false)}
                  onCheckedChange={(checked) => onToggleAll(Boolean(checked))}
                  className="size-4 rounded border-slate-300 data-[state=checked]:border-slate-900 data-[state=checked]:bg-slate-900"
                  aria-label="Pilih semua akun"
                />
              </TableHead>
              {/* Kode Akun - left */}
              <TableHead
                className={cn(
                  'group px-4 py-4 text-left text-xs font-semibold uppercase cursor-pointer select-none transition-colors',
                  sortKey === 'code' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'
                )}
                onClick={() => handleSort('code')}
              >
                <div className="flex items-center gap-1">
                  KODE AKUN
                  <SortIcon sortKey="code" currentSortKey={sortKey as string} sortOrder={sortOrder} />
                </div>
              </TableHead>
              {/* Nama Akun - left */}
              <TableHead
                className={cn(
                  'group px-4 py-4 text-left text-xs font-semibold uppercase cursor-pointer select-none transition-colors',
                  sortKey === 'name' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'
                )}
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  NAMA AKUN
                  <SortIcon sortKey="name" currentSortKey={sortKey as string} sortOrder={sortOrder} />
                </div>
              </TableHead>
              {/* Grup Akun - center */}
              <TableHead
                className={cn(
                  'group px-4 py-4 text-center text-xs font-semibold uppercase cursor-pointer select-none transition-colors',
                  sortKey === 'accountGroupCode' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'
                )}
                onClick={() => handleSort('accountGroupCode')}
              >
                <div className="inline-flex items-center">
                  {/* spacer kiri = lebar icon, agar teks benar-benar di tengah */}
                  <span className="w-3 shrink-0" />
                  <span>GRUP AKUN</span>
                  <SortIcon sortKey="accountGroupCode" currentSortKey={sortKey as string} sortOrder={sortOrder} />
                </div>
              </TableHead>
              {/* Kategori Akun - left */}
              <TableHead
                className={cn(
                  'group px-4 py-4 text-left text-xs font-semibold uppercase cursor-pointer select-none transition-colors',
                  sortKey === 'category' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'
                )}
                onClick={() => handleSort('category')}
              >
                <div className="flex items-center gap-1">
                  KATEGORI AKUN
                  <SortIcon sortKey="category" currentSortKey={sortKey as string} sortOrder={sortOrder} />
                </div>
              </TableHead>
              {/* Action - center */}
              <TableHead className="w-[80px] px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                ACTION
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: perPage }).map((_, index) => (
                <TableRow key={index} className="group hover:bg-gray-50 transition-colors">
                  <TableCell className="text-center px-4 py-4 sticky right-0 bg-white group-hover:bg-slate-50 z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]">
                    <Skeleton className="mx-auto h-4 w-4 rounded" />
                  </TableCell>
                  <TableCell className="px-4 py-4"><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell className="px-4 py-4"><Skeleton className="h-4 w-44" /></TableCell>
                  <TableCell className="px-4 py-4 text-center"><Skeleton className="mx-auto h-4 w-8" /></TableCell>
                  <TableCell className="px-4 py-4"><Skeleton className="h-4 w-36" /></TableCell>
                  <TableCell className="px-4 py-4 text-center"><Skeleton className="mx-auto h-7 w-7 rounded-full" /></TableCell>
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow className="group">
                <TableCell colSpan={6} className="px-4 py-10 text-center text-sm text-gray-500">
                  Tidak ada data akun.
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((account) => {
                const checked = selectedIds.has(String(account.id));

                return (
                  <TableRow key={account.id} data-state={checked ? 'selected' : undefined} className="group hover:bg-gray-50 transition-colors">
                    {/* Checkbox */}
                    <TableCell className="px-4 py-4 text-center">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) => onToggleRow(String(account.id), Boolean(value))}
                        className="size-4 rounded border-slate-300 data-[state=checked]:border-slate-900 data-[state=checked]:bg-slate-900"
                        aria-label={`Pilih akun ${account.name}`}
                      />
                    </TableCell>
                    {/* Kode Akun */}
                    <TableCell className="px-4 py-4 text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-1.5">
                        <span>{account.code}</span>
                        {account.is_lock && (
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
                    </TableCell>
                    {/* Nama Akun */}
                    <TableCell className="px-4 py-4 text-sm text-gray-900">{account.name}</TableCell>
                    {/* Grup Akun - center */}
                    <TableCell className="px-4 py-4 text-sm text-gray-600 text-center">{account.accountGroupCode ?? '-'}</TableCell>
                    {/* Kategori Akun */}
                    <TableCell className="px-4 py-4 text-sm text-gray-600">{getAccountCategoryLabel(account.category)}</TableCell>
                    {/* Action */}
                    <TableCell className="px-4 py-4 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-[150px] rounded-xl border-slate-200 p-1.5 shadow-lg">
                          <DropdownMenuItem
                            className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer"
                            disabled={account.is_lock || !canEdit}
                            onSelect={(e) => {
                              e.preventDefault();
                              onEdit(account);
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="rounded-lg px-3 py-2 text-sm text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer"
                            disabled={account.is_lock || !canDelete}
                            onSelect={(e) => {
                              e.preventDefault();
                              onDelete(account);
                            }}
                          >
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-4 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between">
        <p>
          Showing {start}-{end} of {total} data
        </p>

        <div className="flex flex-wrap items-center justify-end gap-1 text-slate-800">
          <Button variant="ghost" size="sm" className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            Previous
          </Button>

          {visiblePages.map((pageNumber) => (
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

          {showLastPageShortcut && (
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
}
