import { useState } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreVertical } from 'lucide-react';
import { Account } from '@/@types/account.types';
import { Skeleton } from '@/components/ui/skeleton';
import { useTableSort } from '@/hooks/useTableSort';
import { SortableHeader } from '@/components/ui/sortable-header';

interface AccountTableProps {
  data: Account[] | undefined;
  total: number | undefined;
  isLoading: boolean;
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
  page?: number;
  perPage?: number;
  onPageChange?: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
}

export function AccountTable({ data, total, isLoading, onEdit, onDelete, page, perPage, onPageChange, onPerPageChange }: AccountTableProps) {
  const isControlled = !!page && !!perPage;
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const handleItemsPerPageChange = (val: string) => {
    const next = Number(val);
    if (isControlled) {
      onPerPageChange?.(next);
      onPageChange?.(1);
    } else {
      setItemsPerPage(next);
      setCurrentPage(1);
    }
  };

  // Safe defaults
  const safeData = data || [];

  const { sortedData, sortKey, sortOrder, handleSort } = useTableSort({
    data: safeData,
  });

  const activePage = isControlled ? page! : currentPage;
  const activePerPage = isControlled ? perPage! : itemsPerPage;
  const safeTotal = total ?? sortedData.length;

  const totalPages = Math.max(1, Math.ceil(safeTotal / activePerPage));
  const startIndex = (activePage - 1) * activePerPage;
  const endIndex = startIndex + activePerPage;
  const currentData = isControlled ? sortedData : sortedData.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      {/* SHOW ENTRIES */}
      <div className="flex items-center gap-2 text-sm">
        <span>Show</span>
        <Select value={String(activePerPage)} onValueChange={handleItemsPerPageChange}>
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
              <TableHead>
                <SortableHeader title="KODE AKUN" sortKey="code" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} />
              </TableHead>
              <TableHead>
                <SortableHeader title="GRUP AKUN" sortKey="accountGroupName" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} />
              </TableHead>
              <TableHead>
                <SortableHeader title="DESKRIPSI" sortKey="description" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} />
              </TableHead>
              <TableHead>
                <SortableHeader title="KATEGORI" sortKey="type" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} />
              </TableHead>
              <TableHead className="text-right font-semibold">ACTION</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              [...Array(itemsPerPage)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-8 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : currentData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Tidak ada data
                </TableCell>
              </TableRow>
            ) : (
              currentData.map((account) => (
                <TableRow key={account.id} className="hover:bg-muted/50">
                  <TableCell>{account.code}</TableCell>
                  <TableCell>{account.accountGroupName || account.name || '-'}</TableCell>
                  <TableCell>{account.description}</TableCell>
                  <TableCell className="capitalize">{account.type ?? '-'}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(account)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(account)} className="text-destructive focus:text-destructive">
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
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {safeData.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, safeTotal)} of {safeTotal} entries
        </span>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => (isControlled ? onPageChange?.(Math.max(1, activePage - 1)) : setCurrentPage((prev) => Math.max(1, prev - 1)))} disabled={activePage === 1}>
            Previous
          </Button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (activePage <= 3) {
              pageNum = i + 1;
            } else if (activePage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = activePage - 2 + i;
            }

            const changePage = () => {
              if (isControlled) {
                onPageChange?.(pageNum);
              } else {
                setCurrentPage(pageNum);
              }
            };

            return (
              <Button key={pageNum} variant={activePage === pageNum ? 'default' : 'outline'} size="sm" onClick={changePage} className="w-10">
                {pageNum}
              </Button>
            );
          })}

          {totalPages > 5 && (
            <>
              <span className="text-muted-foreground">...</span>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(totalPages)} className="w-10">
                {totalPages}
              </Button>
            </>
          )}

          <Button variant="outline" size="sm" onClick={() => (isControlled ? onPageChange?.(Math.min(totalPages, activePage + 1)) : setCurrentPage((prev) => Math.min(totalPages, prev + 1)))} disabled={activePage === totalPages}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
