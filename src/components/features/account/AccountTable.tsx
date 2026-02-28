import { useState } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreHorizontal } from 'lucide-react';
import { Account } from '@/@types/account.types';
import { Skeleton } from '@/components/ui/skeleton';

interface AccountTableProps {
  data: Account[] | undefined;
  total: number | undefined;
  isLoading: boolean;
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
}

export function AccountTable({ data, total, isLoading, onEdit, onDelete }: AccountTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const handleItemsPerPageChange = (val: string) => {
    setItemsPerPage(Number(val));
    setCurrentPage(1);
  };

  // Safe defaults
  const safeData = data || [];
  const safeTotal = total ?? safeData.length;

  // Local Pagination Logic (since backend pagination isn't passed as prop yet, we slice locally mimicking SalesTable)
  const totalPages = Math.max(1, Math.ceil(safeData.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = safeData.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      {/* SHOW ENTRIES */}
      <div className="flex items-center gap-2 text-sm">
        <span>Show</span>
        <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
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
              <TableHead className="font-semibold">KODE AKUN</TableHead>
              <TableHead className="font-semibold">GRUP AKUN</TableHead>
              <TableHead className="font-semibold">DESKRIPSI</TableHead>
              <TableHead className="font-semibold">CASH FLOW</TableHead>
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
                  <TableCell>{account.group}</TableCell>
                  <TableCell>{account.description}</TableCell>
                  <TableCell>{account.cashFlow}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
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
          Showing {safeData.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, safeData.length)} of {safeTotal} entries
        </span>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1}>
            Previous
          </Button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <Button key={pageNum} variant={currentPage === pageNum ? 'default' : 'outline'} size="sm" onClick={() => setCurrentPage(pageNum)} className="w-10">
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

          <Button variant="outline" size="sm" onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
