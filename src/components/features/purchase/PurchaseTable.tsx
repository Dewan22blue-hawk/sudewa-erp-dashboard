import { useEffect, useState } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PurchaseUnitItemRow } from '@/@types/purchase.types';
import { MoreVertical, Plus, Search } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { useRouter } from 'next/router';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils/currency';
import { PaginationMeta } from '@/@types/pagination.types';

export interface PurchaseTableProps {
  data: PurchaseUnitItemRow[];
  meta?: PaginationMeta;
  onDelete: (id: string) => void;
  onAdd?: () => void;
  slug: string;
  onPageChange?: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  onSearch?: (term: string) => void;
  loading?: boolean;
}

export default function PurchaseTable({ data, meta, onDelete, onAdd, slug, onPageChange, onPerPageChange, onSearch, loading }: PurchaseTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      onPageChange?.(1);
      onSearch?.(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm, onSearch, onPageChange]);

  const currentPage = meta?.currentPage ?? 1;
  const itemsPerPage = meta?.perPage ?? 10;
  const totalPages = meta?.lastPage ?? 1;
  const totalEntries = meta?.total ?? data.length;
  const startIndex = totalEntries === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIndex = startIndex === 0 ? 0 : startIndex + data.length - 1;

  const handleItemsPerPageChange = (value: string) => {
    const parsed = Number(value);
    onPerPageChange?.(parsed);
  };

  const handlePageChange = (page: number) => {
    onPageChange?.(page);
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
            <Input type="text" placeholder="Search here..." className="pl-8 bg-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-sm font-medium">Show</span>
            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-[70px] bg-white">
                <SelectValue placeholder="10" />
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
              <TableHead className="text-xs font-semibold uppercase text-slate-600 px-4 py-3">KODE BELI</TableHead>
              <TableHead className="text-xs font-semibold uppercase text-slate-600 px-4 py-3">TANGGAL</TableHead>
              <TableHead className="text-xs font-semibold uppercase text-slate-600 px-4 py-3">UNIT TYPE</TableHead>
              <TableHead className="text-xs font-semibold uppercase text-slate-600 px-4 py-3">QTY</TableHead>
              <TableHead className="text-xs font-semibold uppercase text-slate-600 px-4 py-3">HARGA</TableHead>
              <TableHead className="text-xs font-semibold uppercase text-slate-600 px-4 py-3">BBN</TableHead>
              <TableHead className="text-xs font-semibold uppercase text-slate-600 px-4 py-3">EXPEDISI</TableHead>
              <TableHead className="text-xs font-semibold uppercase text-slate-600 px-4 py-3">BIAYA LAIN</TableHead>
              <TableHead className="text-xs font-semibold uppercase text-slate-600 px-4 py-3">TOTAL DPP</TableHead>
              <TableHead className="text-xs font-semibold uppercase text-slate-600 px-4 py-3">TOTAL PPN</TableHead>
              <TableHead className="text-xs font-semibold uppercase text-slate-600 px-4 py-3">TOTAL HPP</TableHead>
              <TableHead className="text-right text-xs font-semibold uppercase text-slate-600 px-4 py-3">ACTION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="h-24 text-center text-muted-foreground">
                  Tidak ada data
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id} className="border-t hover:bg-slate-50 transition-colors">
                  <TableCell className="font-medium text-[#1f304f] cursor-pointer hover:underline px-4" onClick={() => router.push(`/dashboard/${slug}/transaksi/pembelian-unit/${item.unitTransactionId}`)}>
                    {item.unitTransactionCode || '-'}
                  </TableCell>
                  <TableCell className="text-slate-700 px-4">{item.createdAt ? format(new Date(item.createdAt), 'dd/MM/yyyy') : '-'}</TableCell>
                  <TableCell className="text-slate-700 px-4">{item.unitTypeId ?? '-'}</TableCell>
                  <TableCell className="text-slate-700 px-4">{item.qtyTotal}</TableCell>
                  <TableCell className="text-slate-700 px-4">{formatCurrency(item.price)}</TableCell>
                  <TableCell className="text-slate-700 px-4">{formatCurrency(item.bbnPrice)}</TableCell>
                  <TableCell className="text-slate-700 px-4">{formatCurrency(item.expeditionFee)}</TableCell>
                  <TableCell className="text-slate-700 px-4">{formatCurrency(item.otherFee)}</TableCell>
                  <TableCell className="text-slate-700 px-4">{formatCurrency(item.dppTotal)}</TableCell>
                  <TableCell className="text-slate-700 px-4">{formatCurrency(item.ppnTotal)}</TableCell>
                  <TableCell className="text-slate-800 font-semibold px-4">{formatCurrency(item.hppTotal)}</TableCell>

                  <TableCell className="text-right px-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/${slug}/transaksi/pembelian-unit/${item.unitTransactionId}?action=refund`)}>Refund</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/${slug}/transaksi/pembelian-unit/${item.unitTransactionId}`)}>Detail</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(`/dashboard/${slug}/transaksi/pembelian-unit/${item.unitTransactionId}/detail?print=true`, '_blank')}>Print</DropdownMenuItem>
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
      {data.length > 0 && (
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
