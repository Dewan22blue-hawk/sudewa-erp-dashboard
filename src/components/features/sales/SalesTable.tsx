'use client';

import { useState } from 'react';
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { SalesTableRow } from './SalesTableRow';
import { Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTableSort } from '@/hooks/useTableSort';
import { SortableHeader } from '@/components/ui/sortable-header';
import { useDeleteSales, useSalesList } from '@/hooks/useSales';
import { toast } from 'sonner';

interface Props {
  // Add props if needed, simpler for SalesTable as it uses static data
  onAdd?: () => void;
}

/**
 * Sales Table Component dengan Pagination dan Bulk Select
 */
export function SalesTable({ onAdd }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const { data, isLoading } = useSalesList({ page: currentPage, perPage: itemsPerPage, search: searchTerm });
  const deleteMutation = useDeleteSales();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const salesData = data?.data ?? [];
  const meta = data?.meta;

  const { sortedData, sortKey, sortOrder, handleSort } = useTableSort({
    data: salesData,
  });

  // Pagination logic
  const totalPages = meta?.lastPage ?? Math.ceil(sortedData.length / itemsPerPage);
  const safeTotalPages = Math.max(1, totalPages);
  const activePage = meta?.currentPage ?? currentPage;
  const activePerPage = meta?.perPage ?? itemsPerPage;
  const startIndex = (activePage - 1) * activePerPage;
  const endIndex = startIndex + sortedData.length;
  const currentData = sortedData;
  const isDataEmpty = salesData.length === 0;
  const isSearchEmpty = !isLoading && !isDataEmpty && currentData.length === 0;

  // Reset page when search changes
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (val: string) => {
    setItemsPerPage(Number(val));
    setCurrentPage(1);
  };

  // Get IDs of current page items
  const currentPageIds = currentData.map((item) => item.id);

  // Check if all items on current page are selected
  const allCurrentPageSelected = currentPageIds.length > 0 && currentPageIds.every((id) => selectedIds.has(id));

  // Bulk select handler
  const handleBulkSelect = () => {
    const newSelectedIds = new Set(selectedIds);

    if (allCurrentPageSelected) {
      // Unselect all on current page
      currentPageIds.forEach((id) => newSelectedIds.delete(id));
    } else {
      // Select all on current page
      currentPageIds.forEach((id) => newSelectedIds.add(id));
    }

    setSelectedIds(newSelectedIds);
  };

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

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Data berhasil dihapus');
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch {
      toast.error('Gagal menghapus data');
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search here"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-white"
            />
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span>Show</span>
            <Select value={String(itemsPerPage)} onValueChange={(val) => handleItemsPerPageChange(val)}>
              <SelectTrigger className="h-9 w-[70px] bg-white">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span>Page</span>
          </div>
        </div>

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
          <TableHeader>
            <TableRow style={{ backgroundColor: '#F9FAFB' }} className="animate-in fade-in-0 duration-500">
              <TableHead className="w-12">
                <Checkbox checked={allCurrentPageSelected && currentPageIds.length > 0} onCheckedChange={handleBulkSelect} />
              </TableHead>
              <TableHead className="p-0 font-semibold text-foreground">
                <SortableHeader title="KODE JUAL" sortKey="kodeJual" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="w-full justify-start text-foreground px-4" />
              </TableHead>
              <TableHead className="p-0 font-semibold text-foreground">
                <SortableHeader title="TANGGAL" sortKey="tanggal" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="w-full justify-start text-foreground px-4" />
              </TableHead>
              <TableHead className="p-0 font-semibold text-foreground">
                <SortableHeader title="CUSTOMER" sortKey="customer" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="w-full justify-start text-foreground px-4" />
              </TableHead>
              <TableHead className="p-0 font-semibold text-right text-foreground">
                <SortableHeader title="TOTAL BIAYA" sortKey="biaya" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="w-full justify-end text-foreground px-4" />
              </TableHead>
              <TableHead className="p-0 font-semibold text-right text-foreground">
                <SortableHeader title="TOTAL DPP" sortKey="totalDPP" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="w-full justify-end text-foreground px-4" />
              </TableHead>
              <TableHead className="p-0 font-semibold text-right text-foreground">
                <SortableHeader title="TOTAL PPN" sortKey="totalPPN" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="w-full justify-end text-foreground px-4" />
              </TableHead>
              <TableHead className="p-0 font-semibold text-right text-foreground">
                <SortableHeader title="TOTAL JUAL" sortKey="totalJual" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="w-full justify-end text-foreground px-4" />
              </TableHead>
              <TableHead className="p-0 font-semibold text-right text-foreground">
                <SortableHeader title="KURANG BAYAR" sortKey="kurangBayar" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="w-full justify-end text-foreground px-4" />
              </TableHead>
              <TableHead className="font-semibold text-right text-foreground">ACTION</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={10} className="h-20 text-center">
                  Loading data...
                </TableCell>
              </TableRow>
            ) : isDataEmpty ? (
              <TableRow>
                <TableCell colSpan={10} className="h-20 text-center text-muted-foreground">
                  Data penjualan masih kosong.
                </TableCell>
              </TableRow>
            ) : isSearchEmpty ? (
              <TableRow>
                <TableCell colSpan={10} className="h-20 text-center text-muted-foreground">
                  Data tidak ditemukan. Coba ubah kata kunci pencarian.
                </TableCell>
              </TableRow>
            ) : (
              currentData.map((item) => (
                <SalesTableRow key={item.id} item={item} isSelected={selectedIds.has(item.id)} onToggle={handleToggle} onDelete={handleDelete} />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {sortedData.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, meta?.total ?? sortedData.length)} of {meta?.total ?? sortedData.length} entries
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={activePage === 1}>
            Previous
          </Button>

          {/* Page numbers */}
          {Array.from({ length: Math.min(5, safeTotalPages) }, (_, i) => {
            let pageNum: number;

            if (safeTotalPages <= 5) {
              pageNum = i + 1;
            } else if (activePage <= 3) {
              pageNum = i + 1;
            } else if (activePage >= safeTotalPages - 2) {
              pageNum = safeTotalPages - 4 + i;
            } else {
              pageNum = activePage - 2 + i;
            }

            return (
              <Button key={pageNum} variant={activePage === pageNum ? 'default' : 'outline'} size="sm" onClick={() => setCurrentPage(pageNum)} className="w-10">
                {pageNum}
              </Button>
            );
          })}

          {safeTotalPages > 5 && (
            <>
              <span className="text-muted-foreground">...</span>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(safeTotalPages)} className="w-10">
                {safeTotalPages}
              </Button>
            </>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(safeTotalPages, prev + 1))}
            disabled={activePage >= safeTotalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
