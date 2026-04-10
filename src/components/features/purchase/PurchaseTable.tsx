import { useMemo, useState } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { UnitTransaction } from '@/@types/unit-transaction.types';
import { ArrowDown, ArrowUp, MoreVertical, Plus, Search } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { useRouter } from 'next/router';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils/currency';
import { PaginationMeta } from '@/@types/pagination.types';

export interface PurchaseTableProps {
  data: UnitTransaction[];
  meta?: PaginationMeta;
  onDelete: (id: string) => void;
  onAdd?: () => void;
  slug: string;
  onPageChange?: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  loading?: boolean;
}

export default function PurchaseTable({ data, meta, onDelete, onAdd, slug, onPageChange, onPerPageChange, loading }: PurchaseTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [billingFilter, setBillingFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'created_at', direction: 'desc' });

  const getRemainingPayment = (item: UnitTransaction) => {
    if (item.isPaid) return item.remainingPayment || 0;
    if (!item.remainingPayment) return item.transaction_bruto_total || 0;
    return item.remainingPayment || 0;
  };

  const processedData = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filtered = data.filter((item) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [item.code, item.supplier, item.warehouse, item.stock_state, item.isPaid ? 'lunas' : 'belum lunas']
          .map((value) => String(value ?? '').toLowerCase())
          .some((value) => value.includes(normalizedSearch));

      if (!matchesSearch) return false;
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
        case 'transaction_dpp_total':
          return compareNumber(a.transaction_dpp_total, b.transaction_dpp_total);
        case 'transaction_ppn_total':
          return compareNumber(a.transaction_ppn_total, b.transaction_ppn_total);
        case 'remainingPayment':
          return compareNumber(getRemainingPayment(a), getRemainingPayment(b));
        case 'stock_state':
          return compareText(a.stock_state, b.stock_state);
        case 'billing':
          return compareText(a.isPaid ? 'Lunas' : 'Belum Lunas', b.isPaid ? 'Lunas' : 'Belum Lunas');
        default:
          return 0;
      }
    });

    return sorted;
  }, [data, billingFilter, sortConfig, searchTerm]);

  const currentPage = meta?.currentPage ?? 1;
  const itemsPerPage = meta?.perPage ?? 25;
  const totalPages = meta?.lastPage ?? 1;
  const totalEntries = billingFilter === 'all' ? meta?.total ?? processedData.length : processedData.length;
  const startIndex = totalEntries === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIndex = startIndex === 0 ? 0 : startIndex + processedData.length - 1;

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortConfig({ key, direction });
  };

  const SortableHeader = ({ label, sortKey }: { label: string; sortKey: string }) => (
    <div className="flex items-center gap-2">
      <span>{label}</span>
      <button
        type="button"
        className={`rounded p-0.5 ${sortConfig.key === sortKey && sortConfig.direction === 'asc' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-700'}`}
        onClick={() => handleSort(sortKey, 'asc')}
        aria-label={`Sort ${label} ascending`}
      >
        <ArrowUp className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        className={`rounded p-0.5 ${sortConfig.key === sortKey && sortConfig.direction === 'desc' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-700'}`}
        onClick={() => handleSort(sortKey, 'desc')}
        aria-label={`Sort ${label} descending`}
      >
        <ArrowDown className="h-3.5 w-3.5" />
      </button>
    </div>
  );

  const handleItemsPerPageChange = (value: string) => {
    const parsed = Number(value);
    onPerPageChange?.(parsed);
  };

  const handlePageChange = (page: number) => {
    onPageChange?.(page);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onPageChange?.(1);
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

    return buttons.map((page) => (
      <Button key={page} variant={currentPage === page ? 'default' : 'outline'} size="sm" onClick={() => handlePageChange(page)} className={`h-8 w-8 p-0 ${currentPage === page ? 'bg-[#1f304f] hover:bg-[#1a2842] text-white' : ''}`}>
        {page}
      </Button>
    ));
  };

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-[250px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input type="text" placeholder="Search here..." className="pl-8 bg-white" value={searchTerm} onChange={(e) => handleSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-sm font-medium">Show</span>
            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-[70px] bg-white">
                <SelectValue placeholder="25" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm font-medium">Page</span>
          </div>

          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-sm font-medium">Billing</span>
            <Select value={billingFilter} onValueChange={(value: 'all' | 'paid' | 'unpaid') => setBillingFilter(value)}>
              <SelectTrigger className="w-[150px] bg-white">
                <SelectValue placeholder="Semua" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="paid">Lunas</SelectItem>
                <SelectItem value="unpaid">Belum Lunas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex w-full sm:w-auto items-center gap-2 justify-end">
          {onAdd && (
            <Button onClick={onAdd} className="bg-[#1f304f] hover:bg-[#1a2842] text-white whitespace-nowrap">
              <Plus className="mr-2 h-4 w-4" />
              Tambah
            </Button>
          )}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-none">
        <Table>
          <TableHeader className="bg-[#f5f6f8]">
            <TableRow>
              <TableHead className="text-xs font-semibold uppercase text-slate-600 px-4 py-3"><SortableHeader label="KODE BELI" sortKey="code" /></TableHead>
              <TableHead className="text-xs font-semibold uppercase text-slate-600 px-4 py-3"><SortableHeader label="TANGGAL" sortKey="created_at" /></TableHead>
              <TableHead className="text-xs font-semibold uppercase text-slate-600 px-4 py-3"><SortableHeader label="SUPPLIER" sortKey="supplier" /></TableHead>
              {/* <TableHead className="text-xs font-semibold uppercase text-slate-600 px-4 py-3"><SortableHeader label="GUDANG" sortKey="warehouse" /></TableHead> */}
              <TableHead className="text-xs font-semibold uppercase text-slate-600 px-4 py-3"><SortableHeader label="TOTAL BRUTO" sortKey="transaction_bruto_total" /></TableHead>
              <TableHead className="text-xs font-semibold uppercase text-slate-600 px-4 py-3"><SortableHeader label="BBN" sortKey="transaction_bbn_total" /></TableHead>
              <TableHead className="text-xs font-semibold uppercase text-slate-600 px-4 py-3"><SortableHeader label="BIAYA LAIN" sortKey="transaction_other_fee" /></TableHead>
              <TableHead className="text-xs font-semibold uppercase text-slate-600 px-4 py-3"><SortableHeader label="TOTAL DPP" sortKey="transaction_dpp_total" /></TableHead>
              <TableHead className="text-xs font-semibold uppercase text-slate-600 px-4 py-3"><SortableHeader label="TOTAL PPN" sortKey="transaction_ppn_total" /></TableHead>
              <TableHead className="text-xs font-semibold uppercase text-slate-600 px-4 py-3"><SortableHeader label="KURANG BAYAR" sortKey="remainingPayment" /></TableHead>
              {/* <TableHead className="text-xs font-semibold uppercase text-slate-600 px-4 py-3"><SortableHeader label="STATUS STOK" sortKey="stock_state" /></TableHead> */}
              <TableHead className="text-xs font-semibold uppercase text-slate-600 px-4 py-3"><SortableHeader label="BILLING" sortKey="billing" /></TableHead>
              <TableHead className="text-right text-xs font-semibold uppercase text-slate-600 px-4 py-3">ACTION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="h-24 text-center text-muted-foreground">
                  Tidak ada data
                </TableCell>
              </TableRow>
            ) : (
              processedData.map((item) => (
                <TableRow key={item.id} className="border-t hover:bg-slate-50 transition-colors">
                  {/* Kode Jual - Link biru */}
                  <TableCell className="px-4">
                    <button
                      type="button"
                      className="font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
                      onClick={() => router.push(`/dashboard/${slug}/transaksi/pembelian-unit/${item.id}`)}
                    >
                      {item.code || '-'}
                    </button>
                  </TableCell>
                  <TableCell className="text-slate-700 px-4">{item.created_at ? format(new Date(item.created_at), 'dd/MM/yyyy') : '-'}</TableCell>
                  <TableCell className="text-slate-700 px-4">{item.supplier || '-'}</TableCell>
                  {/* <TableCell className="text-slate-700 px-4">{item.warehouse || '-'}</TableCell> */}
                  <TableCell className="text-slate-700 px-4">{formatCurrency(item.transaction_bruto_total)}</TableCell>
                  <TableCell className="text-slate-700 px-4">{formatCurrency(item.transaction_bbn_total)}</TableCell>
                  <TableCell className="text-slate-700 px-4">{formatCurrency(item.transaction_other_fee)}</TableCell>
                  <TableCell className="text-slate-700 px-4">{formatCurrency(item.transaction_dpp_total)}</TableCell>
                  <TableCell className="text-slate-700 px-4">{formatCurrency(item.transaction_ppn_total)}</TableCell>
                  <TableCell className={`px-4 font-medium ${getRemainingPayment(item) > 0 ? 'text-red-500' : 'text-slate-700'}`}>{formatCurrency(getRemainingPayment(item))}</TableCell>
                  {/* <TableCell className="text-slate-700 px-4">{item.stock_state || '-'}</TableCell> */}
                  <TableCell className="text-slate-700 px-4">{item.isPaid ? 'Lunas' : 'Belum Lunas'}</TableCell>

                  <TableCell className="text-right px-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/${slug}/transaksi/pembelian-unit/${item.id}?action=refund`)}>Refund</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/${slug}/transaksi/pembelian-unit/${item.id}`)}>Detail</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(`/dashboard/${slug}/transaksi/pembelian-unit/${item.id}/detail?print=true`, '_blank')}>Print</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(item.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
          <div className="text-sm text-slate-500">
            Showing {startIndex} to {endIndex} of {totalEntries} data
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => handlePageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="h-8 px-3">
              Previous
            </Button>
            {renderPageButtons()}

            <Button variant="outline" size="sm" onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="h-8 px-3">
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
