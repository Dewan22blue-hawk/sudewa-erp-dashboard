import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { getVisiblePageNumbers } from '@/lib/api/pagination';
import { getAccountCategoryLabel } from '@/lib/account';
import type { Account } from '@/@types/account.types';
import { MoreVertical } from 'lucide-react';

interface AccountTableProps {
  data: Account[];
  total: number;
  isLoading: boolean;
  page: number;
  perPage: number;
  selectedIds: Set<string>;
  onToggleAll: (checked: boolean) => void;
  onToggleRow: (id: string, checked: boolean) => void;
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
  onPageChange: (page: number) => void;
}

export function AccountTable({ data, total, isLoading, page, perPage, selectedIds, onToggleAll, onToggleRow, onEdit, onDelete, onPageChange }: AccountTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const pageIds = data.map((item) => String(item.id));
  const allChecked = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
  const someChecked = pageIds.some((id) => selectedIds.has(id));
  const start = total === 0 ? 0 : (page - 1) * perPage + 1;
  const end = total === 0 ? 0 : Math.min(page * perPage, total);
  const visiblePages = getVisiblePageNumbers(totalPages, page);
  const showLastPageShortcut = visiblePages[visiblePages.length - 1] !== totalPages;

  return (
    <div className="space-y-7">
      <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.05)]">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-200 bg-[#EFF3F8] hover:bg-[#EFF3F8]">
              <TableHead className="w-[72px] px-4 py-5">
                <Checkbox
                  checked={allChecked ? true : (someChecked ? 'indeterminate' : false)}
                  onCheckedChange={(checked) => onToggleAll(Boolean(checked))}
                  className="size-6 rounded-[8px] border-slate-300 data-[state=checked]:border-slate-900 data-[state=checked]:bg-slate-900"
                  aria-label="Pilih semua akun"
                />
              </TableHead>
              <TableHead className="py-5 text-center text-[1.05rem] font-semibold uppercase tracking-[-0.01em] text-slate-950">Kode Akun</TableHead>
              <TableHead className="py-5 text-center text-[1.05rem] font-semibold uppercase tracking-[-0.01em] text-slate-950">Nama Akun</TableHead>
              <TableHead className="py-5 text-center text-[1.05rem] font-semibold uppercase tracking-[-0.01em] text-slate-950">Grup Akun</TableHead>
              <TableHead className="py-5 text-center text-[1.05rem] font-semibold uppercase tracking-[-0.01em] text-slate-950">Kategori Akun</TableHead>
              <TableHead className="w-[110px] py-5 text-center text-[1.05rem] font-semibold uppercase tracking-[-0.01em] text-slate-950">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: perPage }).map((_, index) => (
                <TableRow key={index} className="border-b border-slate-200">
                  <TableCell className="px-4 py-5">
                    <Skeleton className="h-6 w-6 rounded-[8px]" />
                  </TableCell>
                  <TableCell className="py-5 text-center"><Skeleton className="mx-auto h-5 w-16" /></TableCell>
                  <TableCell className="py-5 text-center"><Skeleton className="mx-auto h-5 w-40" /></TableCell>
                  <TableCell className="py-5 text-center"><Skeleton className="mx-auto h-5 w-14" /></TableCell>
                  <TableCell className="py-5 text-center"><Skeleton className="mx-auto h-5 w-36" /></TableCell>
                  <TableCell className="py-5 text-center"><Skeleton className="mx-auto h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-14 text-center text-base text-slate-500">
                  Tidak ada data akun.
                </TableCell>
              </TableRow>
            ) : (
              data.map((account) => {
                const checked = selectedIds.has(String(account.id));

                return (
                  <TableRow key={account.id} data-state={checked ? 'selected' : undefined} className="border-b border-slate-200 bg-white hover:bg-slate-50/60">
                    <TableCell className="px-4 py-4">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) => onToggleRow(String(account.id), Boolean(value))}
                        className="size-6 rounded-[8px] border-slate-300 data-[state=checked]:border-slate-900 data-[state=checked]:bg-slate-900"
                        aria-label={`Pilih akun ${account.name}`}
                      />
                    </TableCell>
                    <TableCell className="py-4 text-center text-[1.05rem] font-medium text-slate-900">{account.code}</TableCell>
                    <TableCell className="py-4 text-center text-[1.05rem] font-medium uppercase text-slate-900">{account.name}</TableCell>
                    <TableCell className="py-4 text-center text-[1.05rem] text-slate-800">{account.accountGroupCode ?? '-'}</TableCell>
                    <TableCell className="py-4 text-center text-[1.05rem] text-slate-800">{getAccountCategoryLabel(account.category)}</TableCell>
                    <TableCell className="py-4 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-slate-900 hover:bg-slate-100">
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-[180px] rounded-2xl border-slate-200 p-2 shadow-xl">
                          <DropdownMenuItem className="rounded-xl px-4 py-3 text-base text-slate-900 focus:bg-slate-50" onClick={() => onEdit(account)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-xl px-4 py-3 text-base text-red-600 focus:bg-red-50 focus:text-red-600" onClick={() => onDelete(account)}>
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

      <div className="flex flex-col gap-4 text-[15px] text-slate-500 lg:flex-row lg:items-center lg:justify-between">
        <p>
          Showing {start}-{end} of {total} data
        </p>

        <div className="flex flex-wrap items-center justify-end gap-2 text-slate-800">
          <Button variant="ghost" size="sm" className="h-11 rounded-2xl px-2 text-[1rem] font-medium hover:bg-transparent disabled:text-slate-300" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            Previous
          </Button>

          {visiblePages.map((pageNumber) => (
            <Button
              key={pageNumber}
              variant="ghost"
              size="sm"
              className={cn(
                'h-12 min-w-12 rounded-2xl border px-4 text-[1rem] font-medium shadow-none',
                pageNumber === page
                  ? 'border-slate-200 bg-white text-slate-950 shadow-[0_8px_20px_rgba(15,23,42,0.08)]'
                  : 'border-transparent bg-transparent text-slate-700 hover:border-slate-200 hover:bg-white',
              )}
              onClick={() => onPageChange(pageNumber)}
            >
              {pageNumber}
            </Button>
          ))}

          {showLastPageShortcut && (
            <>
              <span className="px-2 text-[1.15rem] text-slate-500">...</span>
              <Button variant="ghost" size="sm" className="h-12 min-w-12 rounded-2xl border border-transparent px-4 text-[1rem] font-medium text-slate-700 hover:border-slate-200 hover:bg-white" onClick={() => onPageChange(totalPages)}>
                {totalPages}
              </Button>
            </>
          )}

          <Button variant="ghost" size="sm" className="h-11 rounded-2xl px-2 text-[1rem] font-medium hover:bg-transparent disabled:text-slate-300" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
