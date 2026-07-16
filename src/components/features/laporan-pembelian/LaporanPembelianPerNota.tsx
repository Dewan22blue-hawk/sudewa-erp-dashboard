import { useEffect, useMemo, useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PurchaseTransactionItem } from '@/services/laporan-pembelian.service';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface Props {
  data: PurchaseTransactionItem[];
  pagination: { currentPage: number; lastPage: number; total: number; from: number; to: number; perPage: number; };
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

interface PerNotaRow {
  id: string;
  noPembelian: string;
  tanggal: string;
  tipeUnit: string;
  qty: number;
  hargaBeli: number;
  biayaBbn: number;
  biayaEkspedisi: number;
  biayaLainnya: number;
  hpp: number;
  dpp: number;
  ppn: number;
  jumlah: number;
}

const toNumber = (val: unknown) => {
  const num = Number(val);
  return Number.isFinite(num) ? num : 0;
};

const formatCurrency = (val: number) => `Rp ${toNumber(val).toLocaleString('id-ID')}`;
const formatDate = (date: string) => {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? '-' : format(parsed, 'dd MMMM yyyy', { locale: id });
};

export default function LaporanPembelianPerNota({ data, pagination, isLoading, onPageChange }: Props) {
  // Render all transactions. If detail items are missing, create one fallback row per transaction.
  const flattenedData: PerNotaRow[] = data.flatMap((item) => {
    const units = Array.isArray(item.unit_transaction_items) ? item.unit_transaction_items : [];

    if (units.length === 0) {
      return [{
        id: `${item.id}-fallback`,
        noPembelian: item.code,
        tanggal: item.created_at,
        tipeUnit: '-',
        qty: 0,
        hargaBeli: 0,
        biayaBbn: 0,
        biayaEkspedisi: 0,
        biayaLainnya: 0,
        hpp: 0,
        dpp: 0,
        ppn: 0,
        jumlah: toNumber(item.transaction_bruto_total),
      }];
    }

    return units.map((unit, idx) => ({
      id: `${item.id}-${idx}`,
      noPembelian: item.code,
      tanggal: item.created_at,
      tipeUnit: unit.unit_type?.name || '-',
      qty: toNumber(unit.qty_total),
      hargaBeli: toNumber(unit.price),
      biayaBbn: toNumber(unit.bbn_price),
      biayaEkspedisi: toNumber(unit.expedition_fee),
      biayaLainnya: toNumber(unit.other_fee),
      hpp: toNumber(unit.hpp_total_price),
      dpp: toNumber(unit.dpp_total_price),
      ppn: toNumber(unit.ppn_total_price),
      jumlah: toNumber(item.transaction_bruto_total),
    }));
  });

  const rowsPerPage = pagination.perPage || 50;
  const [tablePage, setTablePage] = useState(1);

  useEffect(() => {
    setTablePage(1);
  }, [data]);

  const totalRows = flattenedData.length;
  const lastTablePage = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const safePage = Math.min(tablePage, lastTablePage);

  useEffect(() => {
    if (tablePage > lastTablePage) {
      setTablePage(lastTablePage);
    }
  }, [tablePage, lastTablePage]);

  const pagedData = useMemo(() => {
    const start = (safePage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return flattenedData.slice(start, end);
  }, [flattenedData, safePage, rowsPerPage]);

  const showingFrom = totalRows === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
  const showingTo = Math.min(safePage * rowsPerPage, totalRows);

  // Keep prop consumed for compatibility with parent contract; pagination on this table is row-based.
  void onPageChange;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 bg-white rounded-xl border border-gray-200">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Generate pagination items
  const pages: (number | string)[] = [];
  if (lastTablePage <= 5) {
    for (let i = 1; i <= lastTablePage; i++) pages.push(i);
  } else {
    if (safePage <= 3) {
      pages.push(1, 2, 3, 4, '...', lastTablePage);
    } else if (safePage >= lastTablePage - 2) {
      pages.push(1, '...', lastTablePage - 3, lastTablePage - 2, lastTablePage - 1, lastTablePage);
    } else {
      pages.push(1, '...', safePage - 1, safePage, safePage + 1, '...', lastTablePage);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-none w-full">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
              <TableRow>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-center w-16">NO</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-left">NO PEMBELIAN</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-center">TGL BELI</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-left">TIPE UNIT</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-center">QTY</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-center">HARGA BELI</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-center">BIAYA BBN</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-center">BIAYA EKSPEDISI</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-center">BIAYA LAINNYA</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-center">HPP</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-center">DPP</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-center">PPN</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-center">JUMLAH</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedData.map((item, idx) => (
                <TableRow key={item.id} className="border-b border-slate-200 hover:bg-gray-50 transition-colors">
                  <TableCell className="px-4 py-4 text-sm text-gray-600 text-center">{idx + 1 + (safePage - 1) * rowsPerPage}</TableCell>
                  <TableCell className="px-4 py-4 text-sm font-medium text-slate-900 text-left whitespace-nowrap">{item.noPembelian}</TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 text-center whitespace-nowrap">{formatDate(item.tanggal)}</TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 text-left whitespace-nowrap">{item.tipeUnit}</TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 text-center">{item.qty}</TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 text-center whitespace-nowrap">{formatCurrency(item.hargaBeli)}</TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 text-center whitespace-nowrap">{formatCurrency(item.biayaBbn)}</TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 text-center whitespace-nowrap">{formatCurrency(item.biayaEkspedisi)}</TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 text-center whitespace-nowrap">{formatCurrency(item.biayaLainnya)}</TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 text-center whitespace-nowrap">{formatCurrency(item.hpp)}</TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 text-center whitespace-nowrap">{formatCurrency(item.dpp)}</TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 text-center whitespace-nowrap">{formatCurrency(item.ppn)}</TableCell>
                  <TableCell className="px-4 py-4 text-sm font-semibold text-slate-900 text-center whitespace-nowrap">{formatCurrency(item.jumlah)}</TableCell>
                </TableRow>
              ))}
              {pagedData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={100} className="px-4 py-16 text-center text-sm text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                        <div className="rounded-full bg-slate-50 p-4 mb-2">
                            <Search className="h-8 w-8 text-slate-400" />
                        </div>
                        <p className="text-base font-semibold text-slate-900">Tidak ada data ditemukan</p>
                        <p className="text-sm text-slate-500">Belum ada data atau coba gunakan kata kunci pencarian lain.</p>
                    </div>
                </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {totalRows > 0 && (
        <div className="flex flex-col gap-4 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between px-1 no-print">
          <div>
            Showing {showingFrom} to {showingTo} of {totalRows} data
          </div>
          {lastTablePage > 1 && (
            <div className="flex flex-wrap items-center justify-end gap-1 text-slate-800">
              <Button
                variant="ghost"
                className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300 text-gray-500"
                onClick={() => setTablePage((prev) => Math.max(1, prev - 1))}
                disabled={safePage <= 1}
              >
                Previous
              </Button>

              {pages.map((p, idx) =>
                p === '...' ? (
                  <span key={`ellipsis-${idx}`} className="px-1 text-sm text-slate-500">
                    ...
                  </span>
                ) : (
                  <Button
                    key={p}
                    variant="ghost"
                    className={cn(
                      'h-9 min-w-9 rounded-xl border px-3 text-sm font-medium shadow-none',
                      p === safePage
                        ? 'border-slate-200 bg-white text-slate-950 shadow-sm'
                        : 'border-transparent bg-transparent text-slate-700 hover:border-slate-200 hover:bg-white',
                    )}
                    onClick={() => setTablePage(Number(p))}
                  >
                    {p}
                  </Button>
                )
              )}

              <Button
                variant="ghost"
                className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300 text-gray-500"
                onClick={() => setTablePage((prev) => Math.min(lastTablePage, prev + 1))}
                disabled={safePage >= lastTablePage}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
