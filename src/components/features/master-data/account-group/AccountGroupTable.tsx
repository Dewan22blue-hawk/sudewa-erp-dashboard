import { useState, useMemo } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreVertical, Pencil, Trash } from 'lucide-react';
import type { AccountGroup } from '@/@types/account-group.types';
import type { PaginationMeta } from '@/@types/pagination.types';
import { useTableSort } from '@/hooks/useTableSort';
import { SortableHeader } from '@/components/ui/sortable-header';
import { Badge } from '@/components/ui/badge';

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
      {/* SHOW ENTRIES */}
      <div className="flex items-center gap-2 text-sm">
        <span>Show</span>
        <Select value={String(perPage)} onValueChange={handlePerPageChange}>
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
                <SortableHeader title="KODE" sortKey="code" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} />
              </TableHead>
              <TableHead>
                <SortableHeader title="NAMA GRUP" sortKey="name" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} />
              </TableHead>
              <TableHead>
                <SortableHeader title="DESKRIPSI" sortKey="description" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} />
              </TableHead>
              <TableHead>
                <SortableHeader title="STATUS" sortKey="isActive" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} />
              </TableHead>
              <TableHead className="text-right font-semibold">ACTION</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              [...Array(perPage)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5} className="h-12 text-center text-muted-foreground">
                    Memuat...
                  </TableCell>
                </TableRow>
              ))
            ) : sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Tidak ada data
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((group) => (
                <TableRow key={group.id} className="hover:bg-muted/50">
                  <TableCell className="font-semibold">{group.code}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={group.name}>
                    {group.name.length > 50 ? `${group.name.substring(0, 50)}...` : group.name}
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate" title={group.description ?? undefined}>
                    {group.description ? (group.description.length > 50 ? `${group.description.substring(0, 50)}...` : group.description) : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={group.isActive ? 'default' : 'secondary'} className={group.isActive ? '' : 'bg-gray-200 text-gray-700'}>
                      {group.isActive ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(group)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(group)} className="text-destructive focus:text-destructive">
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
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {sortedData.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, safeTotal)} of {safeTotal} entries
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

          {totalPages > 5 && (
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
