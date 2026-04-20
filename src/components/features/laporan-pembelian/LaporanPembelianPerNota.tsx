import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PurchaseTransactionItem } from '@/services/laporan-pembelian.service';

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
  return Number.isNaN(parsed.getTime()) ? '-' : parsed.toLocaleDateString('id-ID');
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
      <div className="flex justify-center items-center py-20 bg-white rounded-xl border">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50 ">
            <TableRow >
              <TableHead className="text-center w-16 font-semibold">NO</TableHead>
              <TableHead className='fo font-semibold'>NO PEMBELIAN</TableHead>
              <TableHead className="font-semibold">TGL BELI</TableHead>
              <TableHead className="font-semibold">TIPE UNIT</TableHead>
              <TableHead className="text-right font-semibold">QTY</TableHead>
              <TableHead className="text-right font-semibold">HARGA BELI</TableHead>
              <TableHead className="text-right font-semibold">BIAYA BBN</TableHead>
              <TableHead className="text-right font-semibold">BIAYA EKSPEDISI</TableHead>
              <TableHead className="text-right font-semibold">BIAYA LAINNYA</TableHead>
              <TableHead className="text-right font-semibold">HPP</TableHead>
              <TableHead className="text-right font-semibold">DPP</TableHead>
              <TableHead className="text-right font-semibold">PPN</TableHead>
              <TableHead className="text-right font-semibold">JUMLAH</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedData.map((item, idx) => (
              <TableRow key={item.id} className="hover:bg-gray-50">
                <TableCell className="text-center">{idx + 1 + (safePage - 1) * rowsPerPage}</TableCell>
                <TableCell className="font-medium whitespace-nowrap">{item.noPembelian}</TableCell>
                <TableCell className="whitespace-nowrap">{formatDate(item.tanggal)}</TableCell>
                <TableCell className="whitespace-nowrap">{item.tipeUnit}</TableCell>
                <TableCell className="text-right">{item.qty}</TableCell>
                <TableCell className="text-right whitespace-nowrap">{formatCurrency(item.hargaBeli)}</TableCell>
                <TableCell className="text-right whitespace-nowrap">{formatCurrency(item.biayaBbn)}</TableCell>
                <TableCell className="text-right whitespace-nowrap">{formatCurrency(item.biayaEkspedisi)}</TableCell>
                <TableCell className="text-right whitespace-nowrap">{formatCurrency(item.biayaLainnya)}</TableCell>
                <TableCell className="text-right whitespace-nowrap">{formatCurrency(item.hpp)}</TableCell>
                <TableCell className="text-right whitespace-nowrap">{formatCurrency(item.dpp)}</TableCell>
                <TableCell className="text-right whitespace-nowrap">{formatCurrency(item.ppn)}</TableCell>
                <TableCell className="text-right font-semibold whitespace-nowrap">{formatCurrency(item.jumlah)}</TableCell>
              </TableRow>
            ))}
            {pagedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={13} className="h-24 text-center text-gray-500">
                  Tidak ada data pembelian.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalRows > 0 && (
        <div className="flex justify-between items-center p-4 border-t no-print">
          <div className="text-sm text-gray-500">
            Showing {showingFrom} to {showingTo} of {totalRows} data
          </div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled={safePage === 1} onClick={() => setTablePage((prev) => Math.max(1, prev - 1))}>
              Previous
            </Button>
            <Button variant="default" size="sm" className="bg-gray-900 pointer-events-none">
              {safePage}
            </Button>
            <Button variant="outline" size="sm" disabled={safePage === lastTablePage} onClick={() => setTablePage((prev) => Math.min(lastTablePage, prev + 1))}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
