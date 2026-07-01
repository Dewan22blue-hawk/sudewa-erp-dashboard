import { useCallback, useMemo, useState, useEffect } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { UnitTransaction } from '@/@types/unit-transaction.types';
import { ArrowDown, ArrowUp, ArrowUpDown, MoreVertical, Plus, Search } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { useRouter } from 'next/router';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils/currency';
import { PaginationMeta } from '@/@types/pagination.types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface PurchaseTableProps {
  data: UnitTransaction[];
  meta?: PaginationMeta;
  onDelete: (id: string) => void;
  onAdd?: () => void;
  slug: string;
  onPageChange?: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  loading?: boolean;
  subTabs?: { id: string; label: string }[];
  activeSubTab?: string;
  onSubTabChange?: (id: string) => void;
  mainTabs?: { id: string; label: string }[];
  activeMainTab?: string;
  onMainTabChange?: (id: string) => void;
  search?: string;
  onSearchChange?: (value: string) => void;
}

export default function PurchaseTable({
  data,
  meta,
  onDelete,
  onAdd,
  slug,
  onPageChange,
  onPerPageChange,
  loading,
  subTabs,
  activeSubTab,
  onSubTabChange,
  mainTabs,
  activeMainTab,
  onMainTabChange,
  search,
  onSearchChange,
}: PurchaseTableProps) {
  const router = useRouter();
  const [localSearch, setLocalSearch] = useState(search || '');
  const [billingFilter, setBillingFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'created_at', direction: 'desc' });

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

  const isRefunded = (item: UnitTransaction) => String(item.stock_state ?? '').toLowerCase() === 'inbound_return';
  const getBillingLabel = useCallback((item: UnitTransaction) => {
    if (isRefunded(item)) return 'Refund';
    return item.isPaid ? 'Lunas' : 'Belum Lunas';
  }, []);

  const getRemainingPayment = (item: UnitTransaction) => {
    if (item.isPaid) return item.remainingPayment || 0;
    if (!item.remainingPayment) return item.transaction_bruto_total || 0;
    return item.remainingPayment || 0;
  };

  const processedData = useMemo(() => {
    const filtered = data.filter((item) => {
      if (billingFilter === 'paid') return Boolean(item.isPaid);
      if (billingFilter === 'unpaid') return !Boolean(item.isPaid);
      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      const factor = sortConfig.direction === 'asc' ? 1 : -1;

      const compareDate = (valueA?: string, valueB?: string) => {
        const dateA = valueA ? new Date(valueA).getTime() : 0;
        const dateB = valueB ? new Date(valueB).getTime() : 0;
        return (dateA - dateB) * factor;
      };

      const compareNumber = (valueA?: number, valueB?: number) => ((Number(valueA ?? 0) - Number(valueB ?? 0)) * factor);
      const compareText = (valueA?: string, valueB?: string) => (String(valueA ?? '').localeCompare(String(valueB ?? '')) * factor);

      switch (sortConfig.key) {
        case 'code':
          return compareText(a.code, b.code);
        case 'created_at':
          return compareDate(a.created_at, b.created_at);
        case 'supplier':
          return compareText(a.supplier, b.supplier);
        case 'warehouse':
          return compareText(a.warehouse, b.warehouse);
        case 'transaction_bruto_total':
          return compareNumber(a.transaction_bruto_total, b.transaction_bruto_total);
        case 'transaction_bbn_total':
          return compareNumber(a.transaction_bbn_total, b.transaction_bbn_total);
        case 'transaction_other_fee':
          return compareNumber(a.transaction_other_fee, b.transaction_other_fee);
        case 'expedition_fee_total':
          return compareNumber(a.expedition_fee_total, b.expedition_fee_total);
        case 'transaction_dpp_total':
          return compareNumber(a.transaction_dpp_total, b.transaction_dpp_total);
        case 'transaction_ppn_total':
          return compareNumber(a.transaction_ppn_total, b.transaction_ppn_total);
        case 'remainingPayment':
          return compareNumber(getRemainingPayment(a), getRemainingPayment(b));
        case 'stock_state':
          return compareText(a.stock_state, b.stock_state);
        case 'billing':
          return compareText(getBillingLabel(a), getBillingLabel(b));
        default:
          return 0;
      }
    });

    return sorted;
  }, [data, billingFilter, sortConfig, getBillingLabel]);

  const currentPage = meta?.currentPage ?? 1;
  const itemsPerPage = meta?.perPage ?? 25;
  const totalPages = meta?.lastPage ?? 1;
  const totalEntries = billingFilter === 'all' ? meta?.total ?? processedData.length : processedData.length;
  const startIndex = totalEntries === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIndex = startIndex === 0 ? 0 : startIndex + processedData.length - 1;

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const renderSortHeader = (key: string, label: string, alignment: 'left' | 'center' | 'right' = 'left') => {
    const isSorted = sortConfig.key === key;
    const justifyClass = alignment === 'right' ? 'justify-end' : alignment === 'center' ? 'justify-center' : 'justify-start';
    const textAlignment = alignment === 'right' ? 'text-right' : alignment === 'center' ? 'text-center' : 'text-left';
    return (
      <TableHead
        onClick={() => handleSort(key)}
        className={`px-4 py-4 text-xs font-semibold uppercase text-slate-500 cursor-pointer select-none group whitespace-nowrap ${textAlignment}`}
      >
        <div className={`flex items-center gap-1 ${justifyClass}`}>
          <span>{label}</span>
          {isSorted ? (
            sortConfig.direction === 'asc' ? (
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

  const renderPageButtons = () => {
    const buttons = [] as number[];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) buttons.push(i);
    } else if (currentPage <= 3) {
      buttons.push(1, 2, 3, 4, 5);
    } else if (currentPage >= totalPages - 2) {
      for (let i = totalPages - 4; i <= totalPages; i++) buttons.push(i);
    } else {
      buttons.push(currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2);
    }

    return buttons.map((pageNumber) => (
      <Button
        key={pageNumber}
        variant="ghost"
        size="sm"
        className={cn(
          'h-9 min-w-9 rounded-xl border px-3 text-sm font-medium shadow-none',
          pageNumber === currentPage
            ? 'border-slate-200 bg-white text-slate-950 shadow-sm'
            : 'border-transparent bg-transparent text-slate-700 hover:border-slate-200 hover:bg-white',
        )}
        onClick={() => handlePageChange(pageNumber)}
      >
        {pageNumber}
      </Button>
    ));
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar — semua dalam satu baris dengan Search di sebelah kiri */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* LEFT CONTROLS */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* 1. Search */}
          <div className="relative w-full sm:w-[240px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input type="text" placeholder="Search No. Rangka / No. Mesin..." className="pl-8 bg-white h-9 border-slate-300" value={localSearch} onChange={(e) => handleSearch(e.target.value)} />
          </div>

          {/* 2. Main Status Dropdown */}
          {mainTabs && mainTabs.length > 0 && (
            <Select value={activeMainTab} onValueChange={onMainTabChange}>
              <SelectTrigger className="w-[130px] bg-white h-9 border-slate-300 text-slate-700 font-medium">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {mainTabs.map((tab) => (
                  <SelectItem key={tab.id} value={tab.id}>
                    {tab.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* 3. Sub Status Dropdown */}
          {subTabs && subTabs.length > 0 && (
            <Select value={activeSubTab} onValueChange={onSubTabChange}>
              <SelectTrigger className="w-[150px] bg-white h-9 border-slate-300 text-slate-700 font-medium">
                <SelectValue placeholder="Detail Status" />
              </SelectTrigger>
              <SelectContent>
                {subTabs.map((sub) => (
                  <SelectItem key={sub.id} value={sub.id}>
                    {sub.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* 4. Show + Page limit */}
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

        {/* RIGHT CONTROLS */}
        {onAdd && (
          <Button onClick={onAdd} className="bg-[#1e3a5f] hover:bg-[#152e4d] text-white whitespace-nowrap h-9 w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Tambah
          </Button>
        )}
      </div>

      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-none">
        <Table>
          <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
            <TableRow>
              {renderSortHeader('code', 'KODE BELI', 'left')}
              {renderSortHeader('created_at', 'TANGGAL', 'center')}
              {renderSortHeader('supplier', 'SUPPLIER', 'left')}
              {renderSortHeader('transaction_bruto_total', 'TOTAL BRUTO', 'center')}
              {renderSortHeader('transaction_bbn_total', 'BBN', 'center')}
              {renderSortHeader('expedition_fee_total', 'BIAYA EKSPEDISI', 'center')}
              {renderSortHeader('transaction_other_fee', 'BIAYA LAIN', 'center')}
              {renderSortHeader('transaction_dpp_total', 'TOTAL DPP', 'center')}
              {renderSortHeader('transaction_ppn_total', 'TOTAL PPN', 'center')}
              {renderSortHeader('remainingPayment', 'KURANG BAYAR', 'center')}
              {renderSortHeader('billing', 'BILLING', 'center')}
              <TableHead className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">ACTION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="h-24 text-center text-muted-foreground px-4 py-4 text-sm">
                  Tidak ada data
                </TableCell>
              </TableRow>
            ) : (
              processedData.map((item) => (
                <TableRow key={item.id} className="border-b hover:bg-gray-50/70 border-slate-100 transition-colors">
                  {/* Kode Jual - Link biru */}
                  <TableCell className="px-4 py-4 text-left text-sm font-medium">
                    <button
                      type="button"
                      className="font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
                      onClick={() => router.push(`/dashboard/${slug}/transaksi/pembelian-unit/${item.id}`)}
                    >
                      {item.code || '-'}
                    </button>
                  </TableCell>
                  <TableCell className="text-center text-sm text-slate-700 px-4 py-4">{item.created_at ? format(new Date(item.created_at), 'dd MMM yyyy') : '-'}</TableCell>
                  <TableCell className="text-left text-sm text-slate-700 px-4 py-4">{item.supplier || '-'}</TableCell>
                  <TableCell className="text-center text-sm text-slate-700 px-4 py-4">{formatCurrency(item.transaction_bruto_total)}</TableCell>
                  <TableCell className="text-center text-sm text-slate-700 px-4 py-4">{formatCurrency(item.transaction_bbn_total)}</TableCell>
                  <TableCell className="text-center text-sm text-slate-700 px-4 py-4">{formatCurrency(item.expedition_fee_total)}</TableCell>
                  <TableCell className="text-center text-sm text-slate-700 px-4 py-4">{formatCurrency(item.transaction_other_fee)}</TableCell>
                  <TableCell className="text-center text-sm text-slate-700 px-4 py-4">{formatCurrency(item.transaction_dpp_total)}</TableCell>
                  <TableCell className="text-center text-sm text-slate-700 px-4 py-4">{formatCurrency(item.transaction_ppn_total)}</TableCell>
                  <TableCell className={`text-center text-sm px-4 py-4 font-medium ${getRemainingPayment(item) > 0 ? 'text-red-500' : 'text-slate-700'}`}>{formatCurrency(getRemainingPayment(item))}</TableCell>
                  <TableCell className="text-center text-sm text-slate-700 px-4 py-4">
                    {isRefunded(item) ? (
                      <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700">
                        Sudah Refund
                      </Badge>
                    ) : item.isPaid ? (
                      <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700">
                        Lunas
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-slate-300 bg-slate-50 text-slate-700">
                        Belum Lunas
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="text-center px-4 py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-[150px] rounded-xl border-slate-200 p-1.5 shadow-lg">
                        <DropdownMenuItem className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer" onClick={() => router.push(`/dashboard/${slug}/transaksi/pembelian-unit/edit/${item.id}`)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer" onClick={() => router.push(`/dashboard/${slug}/transaksi/pembelian-unit/${item.id}`)}>Detail</DropdownMenuItem>
                        <DropdownMenuItem className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer" disabled={isRefunded(item)} onClick={() => router.push(`/dashboard/${slug}/transaksi/pembelian-unit/${item.id}/refund`)}>
                          {isRefunded(item) ? 'Sudah Refund' : 'Refund'}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer" onClick={() => window.open(`/dashboard/${slug}/transaksi/pembelian-unit/print/${item.id}`, '_blank')}>Print</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(item.id)} className="rounded-lg px-3 py-2 text-sm text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer">
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
        {loading && <div className="absolute inset-0 bg-white/60 flex items-center justify-center text-sm text-muted-foreground">Memuat data...</div>}
      </div>

      {/* Pagination */}
      {processedData.length > 0 && (
        <div className="flex flex-col gap-4 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between py-2">
          <p>Showing {startIndex}-{endIndex} of {totalEntries} data</p>
          <div className="flex flex-wrap items-center justify-end gap-1 text-slate-800">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </Button>
            {renderPageButtons()}

            <Button
              variant="ghost"
              size="sm"
              className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300"
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
