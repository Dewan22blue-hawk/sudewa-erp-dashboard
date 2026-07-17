'use client';

import { useState, useEffect } from 'react';
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from '@/components/ui/table';
import { usePermissionGuard } from '@/hooks/usePermissionGuard';
import { Button } from '@/components/ui/button';
import { SalesTableRow } from './SalesTableRow';
import { Plus, ArrowDown, ArrowUp, ArrowUpDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTableSort } from '@/hooks/useTableSort';
import { useDeleteSales, useSalesList } from '@/hooks/useSales';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import SearchVehicleModal from '@/components/features/vehicle/SearchVehicleModal';

interface Props {
  // Add props if needed, simpler for SalesTable as it uses static data
  onAdd?: () => void;
}

/**
 * Sales Table Component dengan Pagination dan Bulk Select
 */
export function SalesTable({ onAdd }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');
  const [localSearch, setLocalSearch] = useState('');
  const [isVehicleSearchOpen, setIsVehicleSearchOpen] = useState(false);

  const { hasPermission } = usePermissionGuard();
  const canCreate = hasPermission('transaction:create');
  const canEdit = hasPermission('transaction:edit');
  const canDelete = hasPermission('transaction:delete');

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
  const totalEntries = meta?.total ?? sortedData.length;
  const startIndex = totalEntries === 0 ? 0 : (activePage - 1) * activePerPage + 1;
  const endIndex = startIndex === 0 ? 0 : startIndex + sortedData.length - 1;
  const currentData = sortedData;
  const isDataEmpty = salesData.length === 0;
  const isSearchEmpty = !isLoading && !isDataEmpty && currentData.length === 0;

  // Reset page when search changes
  const handleSearch = (term: string) => {
    setLocalSearch(term);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== localSearch) {
        setSearchTerm(localSearch);
        setCurrentPage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, searchTerm]);

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPageButtons = () => {
    const buttons = [] as number[];
    if (safeTotalPages <= 5) {
      for (let i = 1; i <= safeTotalPages; i++) buttons.push(i);
    } else if (activePage <= 3) {
      buttons.push(1, 2, 3, 4, 5);
    } else if (activePage >= safeTotalPages - 2) {
      for (let i = safeTotalPages - 4; i <= safeTotalPages; i++) buttons.push(i);
    } else {
      buttons.push(activePage - 2, activePage - 1, activePage, activePage + 1, activePage + 2);
    }

    return buttons.map((pageNumber) => (
      <Button
        key={pageNumber}
        variant="ghost"
        size="sm"
        className={cn(
          'h-9 min-w-9 rounded-xl border px-3 text-sm font-medium shadow-none',
          pageNumber === activePage
            ? 'border-slate-200 bg-white text-slate-950 shadow-sm'
            : 'border-transparent bg-transparent text-slate-700 hover:border-slate-200 hover:bg-white',
        )}
        onClick={() => handlePageChange(pageNumber)}
      >
        {pageNumber}
      </Button>
    ));
  };

  const renderSortHeader = (key: string, label: string, alignment: 'left' | 'center' | 'right' = 'left') => {
    const isSorted = sortKey === key;
    const justifyClass = alignment === 'right' ? 'justify-end' : alignment === 'center' ? 'justify-center' : 'justify-start';
    const textAlignment = alignment === 'right' ? 'text-right' : alignment === 'center' ? 'text-center' : 'text-left';
    return (
      <TableHead
        onClick={() => handleSort(key as any)}
        className={`px-4 py-4 text-xs font-semibold uppercase text-slate-500 cursor-pointer select-none group whitespace-nowrap ${textAlignment}`}
      >
        <div className={`flex items-center gap-1 ${justifyClass}`}>
          <span>{label}</span>
          {isSorted ? (
            sortOrder === 'asc' ? (
              <ArrowUp className="h-3 w-3 text-indigo-500 shrink-0" />
            ) : (
              <ArrowDown className="h-3 w-3 text-indigo-500 shrink-0" />
            )
          ) : (
            <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-70 transition-opacity duration-150 shrink-0" />
          )}
        </div>
      </TableHead>
    );
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* LEFT CONTROLS */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* 1. Search */}
          <div className="relative w-full sm:w-[240px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search No. Rangka / No. Mesin..."
              value={localSearch}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-8 bg-white h-9 border-slate-300"
            />
          </div>

          <Button
            type="button"
            variant="outline"
            className="border-slate-300 bg-white hover:bg-slate-50 text-slate-700 h-9 font-medium rounded-xl shadow-none px-4 whitespace-nowrap"
            onClick={() => setIsVehicleSearchOpen(true)}
          >
            Cari Data Kendaraan
          </Button>

          {/* 4. Show + Page limit */}
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-sm font-medium text-slate-700">Show</span>
            <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-[70px] bg-white h-9 border-slate-300">
                <SelectValue placeholder="25" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm font-medium text-slate-700">Page</span>
          </div>
        </div>

        {/* RIGHT CONTROLS */}
        {canCreate && onAdd && (
          <Button onClick={onAdd} className="bg-[#1e3a5f] hover:bg-[#152e4d] text-white whitespace-nowrap h-9 w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Tambah
          </Button>
        )}
      </div>

      <div className="relative overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-none">
        <Table>
          <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
            <TableRow>
              {renderSortHeader('kodeJual', 'KODE JUAL', 'left')}
              {renderSortHeader('tanggal', 'TANGGAL', 'center')}
              {renderSortHeader('customer', 'CUSTOMER', 'left')}
              {renderSortHeader('biayaEkspedisi', 'BIAYA EKSPEDISI', 'center')}
              {renderSortHeader('biaya', 'TOTAL BIAYA', 'center')}
              {renderSortHeader('totalDPP', 'TOTAL DPP', 'center')}
              {renderSortHeader('totalPPN', 'TOTAL PPN', 'center')}
              {renderSortHeader('totalJual', 'TOTAL JUAL', 'center')}
              {renderSortHeader('kurangBayar', 'KURANG BAYAR', 'center')}
              <TableHead className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500 w-[100px] sticky right-0 bg-[#f8f9fa] z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]">Aksi</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow className="group">
                <TableCell colSpan={10} className="h-20 text-center text-muted-foreground px-4 py-4 text-sm">
                  Loading data...
                </TableCell>
              </TableRow>
            ) : isDataEmpty ? (
              <TableRow className="group">
                <TableCell colSpan={10} className="h-20 text-center text-muted-foreground px-4 py-4 text-sm">
                  Data penjualan masih kosong.
                </TableCell>
              </TableRow>
            ) : isSearchEmpty ? (
              <TableRow className="group">
                <TableCell colSpan={100} className="h-20 text-center text-muted-foreground px-4 py-16 text-sm">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="rounded-full bg-slate-50 p-4 mb-2">
                      <Search className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-base font-semibold text-slate-900">Tidak ada data ditemukan</p>
                    <p className="text-sm text-slate-500">Belum ada data atau coba gunakan kata kunci pencarian lain.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              currentData.map((item) => (
                <SalesTableRow key={item.id} item={item} isSelected={selectedIds.has(item.id)} onToggle={handleToggle} onDelete={handleDelete} canEdit={canEdit} canDelete={canDelete} />
              ))
            )}
          </TableBody>
        </Table>
        {isLoading && <div className="absolute inset-0 bg-white/60 flex items-center justify-center text-sm text-muted-foreground">Memuat data...</div>}
      </div>

      {/* Pagination */}
      {currentData.length > 0 && (
        <div className="flex flex-col gap-4 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between py-2">
          <p>Showing {startIndex}-{endIndex} of {totalEntries} data</p>
          <div className="flex flex-wrap items-center justify-end gap-1 text-slate-800">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300"
              disabled={activePage <= 1}
              onClick={() => handlePageChange(activePage - 1)}
            >
              Previous
            </Button>
            {renderPageButtons()}

            <Button
              variant="ghost"
              size="sm"
              className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300"
              disabled={activePage >= safeTotalPages}
              onClick={() => handlePageChange(activePage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
      {/* Vehicle Search Modal */}
      <SearchVehicleModal
        open={isVehicleSearchOpen}
        onOpenChange={setIsVehicleSearchOpen}
        type="sales"
      />
    </div>
  );
}
