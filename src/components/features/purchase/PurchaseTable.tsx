'use client';

import { useState } from 'react';
import { Table, TableHeader, TableRow, TableBody, TableCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Purchase } from '@/@types/purchase.types';
import { MoreVertical, Plus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { useRouter } from 'next/router';
// Select imports removed - not used in this file

interface Props {
  data: Purchase[];
  onDelete: (id: string) => void;
  onAdd?: () => void;
  slug: string;
}

export default function PurchaseTable({ data, onDelete, onAdd, slug }: Props) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Search is not exposed in this simplified table; use empty string
  const searchTerm = '';

  const filteredData = data.filter((item) => item.code.toLowerCase().includes(searchTerm.toLowerCase()) || item.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) || item.date.includes(searchTerm));

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Get IDs of current page items
  // currentPageIds removed (not used)

  // allCurrentPageSelected removed (not used)

  // Bulk select handler removed (not used)

  // Individual toggle handler
  const handleToggle = (id: string) => {
    const newSelectedIds = new Set(selectedIds);

    if (newSelectedIds.has(id)) {
      newSelectedIds.delete(id);
    } else {
      newSelectedIds.add(id);
    }

    setSelectedIds(newSelectedIds);
  };

  return (
    <div className="space-y-4">
      {/* ... (Controls) */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        {/* ... (Search and items per page) */}
        <div className="flex items-center gap-4 w-full sm:w-auto">{/* ... */}</div>

        <div className="flex items-center gap-2">
          {onAdd && (
            <Button size="sm" onClick={onAdd} className="bg-[#1e293b] hover:bg-[#0f172a] text-white">
              <Plus className="mr-2 h-4 w-4" />
              Tambah
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-sm border bg-card shadow-md hover:shadow-lg transition-shadow duration-300">
        <Table>
          <TableHeader>{/* ... */}</TableHeader>
          <TableBody>
            {currentData.map((item) => (
              <TableRow key={item.id} className="border-t hover:bg-muted/40 transition-colors" data-state={selectedIds.has(item.id) && 'selected'}>
                <TableCell className="w-12">
                  <Checkbox checked={selectedIds.has(item.id)} onCheckedChange={() => handleToggle(item.id)} />
                </TableCell>
                <TableCell className="text-blue-600 font-medium cursor-pointer hover:underline" onClick={() => router.push(`/dashboard/${slug}/transaksi/pembelian-unit/${item.id}`)}>
                  {item.code}
                </TableCell>
                <TableCell>{format(new Date(item.date), 'dd/MM/yyyy')}</TableCell>
                <TableCell>{item.supplierName}</TableCell>
                <TableCell>{Number(item.totalBiaya).toLocaleString('id-ID')}</TableCell>
                <TableCell>{Number(item.totalDpp).toLocaleString('id-ID')}</TableCell>
                <TableCell>{Number(item.totalPpn).toLocaleString('id-ID')}</TableCell>
                <TableCell className="font-semibold">{Number(item.totalPurchase).toLocaleString('id-ID')}</TableCell>
                <TableCell className="text-red-500 font-semibold">{Number(item.remainingPayment).toLocaleString('id-ID')}</TableCell>

                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/dashboard/${slug}/transaksi/pembelian-unit/${item.id}`)}>Detail</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/dashboard/${slug}/transaksi/pembelian-unit/edit/${item.id}`)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.open(`/dashboard/${slug}/transaksi/pembelian-unit/${item.id}/detail?print=true`, '_blank')}>Print</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(item.id)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                        Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {filteredData.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1}>
            Previous
          </Button>

          {/* Page numbers */}
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
