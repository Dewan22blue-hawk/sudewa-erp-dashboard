'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import BaseTable, { ColumnDef } from '@/components/ui/base-table';
import { Button } from '@/components/ui/button';
import { currenciesFormat } from '@/components/ui/currenciesFormat';
import { Badge } from '@/components/ui/badge';
import { CopyBox } from '@/components/ui/copy-box';
import { ReferenceLink } from '@/components/ui/reference-link';
import { PaginationMeta } from '@/@types/pagination.types';
import { SalesItem } from './sales.data';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Plus, Search, Eye, Pencil, Trash2, RotateCcw, Printer } from 'lucide-react';
import SearchVehicleModal from '@/components/features/vehicle/SearchVehicleModal';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface SalesTableProps {
  data: SalesItem[];
  meta?: PaginationMeta;
  onDelete: (id: string) => void;
  onAdd?: () => void;
  slug: string;
  onPageChange?: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  search?: string;
  canEdit?: boolean;
  canDelete?: boolean;
  onSearchChange?: (value: string) => void;
  loading?: boolean;
}

export function SalesTable({
  data,
  meta,
  onDelete,
  onAdd,
  slug,
  onPageChange,
  onPerPageChange,
  loading,
  search,
  canEdit,
  canDelete,
  onSearchChange,
}: SalesTableProps) {
  const router = useRouter();
  const [localSearch, setLocalSearch] = useState(search || '');
  const [isVehicleSearchOpen, setIsVehicleSearchOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Debounce search
  useEffect(() => {
    setLocalSearch(search || '');
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearchChange && localSearch !== (search || '')) {
        onSearchChange(localSearch);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange, search]);

  const currentPage = meta?.currentPage ?? 1;
  const itemsPerPage = meta?.perPage ?? 25;
  const totalPages = meta?.lastPage ?? 1;
  const totalEntries = meta?.total ?? data.length;

  const pagedData = useMemo(() => {
    // If backend pagination metadata is present, do not slice client-side
    if (meta) {
      return data;
    }
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return data.slice(start, end);
  }, [data, meta, currentPage, itemsPerPage]);

  const handleItemsPerPageChange = (value: string) => {
    const parsed = Number(value);
    onPerPageChange?.(parsed);
  };

  const handlePageChange = (page: number) => {
    onPageChange?.(page);
  };

  const handleSearch = (value: string) => {
    setLocalSearch(value);
  };

  const columns: ColumnDef<SalesItem>[] = useMemo(
    () => [
      {
        header: 'KODE JUAL',
        accessorKey: 'kodeJual',
        sortable: true,
        alignment: 'left',
        cell: (item) => <CopyBox text={item.kodeJual} />,
      },
      {
        header: 'TANGGAL',
        accessorKey: 'tanggal',
        sortable: true,
        alignment: 'center',
        cell: (item) => item.tanggal || '-',
      },
      {
        header: 'CUSTOMER',
        accessorKey: 'customer',
        sortable: true,
        alignment: 'left',
        cell: (item) => (
          <div className="flex items-center gap-2">
            <ReferenceLink href={`/dashboard/${slug}/customer?search=${encodeURIComponent(item.customer || '')}`}>
              {item.customer || '-'}
            </ReferenceLink>
            {item.isRefunded && (
              <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700">
                Sudah Refund
              </Badge>
            )}
          </div>
        ),
      },
      {
        header: 'BIAYA EKSPEDISI',
        accessorKey: 'biayaEkspedisi',
        sortable: true,
        alignment: 'center',
        cell: (item) => currenciesFormat('idr', item.biayaEkspedisi),
      },
      {
        header: 'TOTAL BIAYA',
        accessorKey: 'totalBiaya',
        sortable: true,
        alignment: 'center',
        cell: (item) => currenciesFormat('idr', item.totalBiaya),
      },
      {
        header: 'TOTAL DPP',
        accessorKey: 'totalDpp',
        sortable: true,
        alignment: 'center',
        cell: (item) => currenciesFormat('idr', item.totalDpp),
      },
      {
        header: 'TOTAL PPN',
        accessorKey: 'totalPpn',
        sortable: true,
        alignment: 'center',
        cell: (item) => currenciesFormat('idr', item.totalPpn),
      },
      {
        header: 'TOTAL JUAL',
        accessorKey: 'totalJual',
        sortable: true,
        alignment: 'center',
        cell: (item) => (
          <span className="font-semibold text-slate-900">
            {currenciesFormat('idr', item.totalJual)}
          </span>
        ),
      },
      {
        header: 'KURANG BAYAR',
        accessorKey: 'kurangBayar',
        sortable: true,
        alignment: 'center',
        cell: (item) => (
          <span className="text-red-600 font-semibold">
            {currenciesFormat('idr', item.kurangBayar)}
          </span>
        ),
      },
      {
        header: 'Aksi',
        alignment: 'center',
        sticky: 'right',
        cell: (item) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[150px] rounded-md border-slate-200 p-1.5 shadow-lg">
              <DropdownMenuItem
                className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer"
                onClick={() => router.push(slug ? `/dashboard/${slug}/transaksi/penjualan-unit/${item.id}` : `/transaksi/penjualan-unit/${item.id}`)}
              >
                <Eye className="mr-2 h-4 w-4" /> Detail
              </DropdownMenuItem>
              {canEdit && (
                <>
                  <DropdownMenuItem
                    className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer"
                    onClick={() => router.push(slug ? `/dashboard/${slug}/transaksi/penjualan-unit/edit/${item.id}` : `/transaksi/penjualan-unit/edit/${item.id}`)}
                  >
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer"
                    onClick={() => router.push(slug ? `/dashboard/${slug}/transaksi/penjualan-unit/${item.id}/refund` : `/transaksi/penjualan-unit/${item.id}/refund`)}
                    disabled={Boolean(item.isRefunded)}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" /> Refund Jual
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer"
                    onClick={() => window.open(slug ? `/dashboard/${slug}/transaksi/penjualan-unit/print/${item.id}` : `/transaksi/penjualan-unit/print/${item.id}`, '_blank')}
                  >
                    <Printer className="mr-2 h-4 w-4" /> Print
                  </DropdownMenuItem>
                </>
              )}
              {canDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(item.id)}
                  className="rounded-lg px-3 py-2 text-sm text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Hapus
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [slug, canEdit, canDelete, onDelete, router]
  );

  const headerActions = (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
        {/* Search */}
        <div className="relative w-full sm:w-[240px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search No. Rangka / No. Mesin..."
            className="pl-8 bg-white h-9 border-slate-300"
            value={localSearch}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <Button
          type="button"
          variant="outline"
          className="border-slate-300 bg-white hover:bg-slate-50 text-slate-700 h-9 font-medium rounded-md shadow-none px-4 whitespace-nowrap"
          onClick={() => setIsVehicleSearchOpen(true)}
        >
          Cari Data Kendaraan
        </Button>

        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-sm font-medium text-slate-700">Show</span>
          <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
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

      {onAdd && (
        <Button onClick={onAdd} className="w-full sm:w-auto bg-[#1e3a5f] hover:bg-[#152e4d]">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Data
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <BaseTable
        data={pagedData}
        columns={columns}
        loading={loading}
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelectedIds}
        showLimitChange={false}
        perPage={itemsPerPage}
        onPerPageChange={(val) => {
          handleItemsPerPageChange(val.toString());
          onPageChange?.(1);
        }}
        meta={{
          currentPage,
          perPage: itemsPerPage,
          lastPage: totalPages,
          total: totalEntries,
        }}
        onPageChange={handlePageChange}
        headerActions={headerActions}
      />

      {/* Vehicle Search Modal */}
      <SearchVehicleModal open={isVehicleSearchOpen} onOpenChange={setIsVehicleSearchOpen} type="sales" />
    </div>
  );
}
