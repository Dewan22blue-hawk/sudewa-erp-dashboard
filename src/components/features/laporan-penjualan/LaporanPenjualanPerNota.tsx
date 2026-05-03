import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SalesTransactionItem } from '@/services/laporan-penjualan.service';

interface Props {
  data: SalesTransactionItem[];
  pagination: { currentPage: number; lastPage: number; total: number; from: number; to: number; perPage: number; };
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

const formatCurrency = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;
const formatDate = (date: string) => new Date(date).toLocaleDateString('id-ID');

export default function LaporanPenjualanPerNota({ data, pagination, isLoading, onPageChange }: Props) {
  // Flatten data: setiap item bisa memiliki multiple unit_transaction_items
  const flattenedData = data.flatMap((item) =>
    (item.unit_transaction_items || []).map((unit, idx) => ({
      id: `${item.id}-${idx}`,
      noPenjualan: item.code,
      tanggal: item.created_at,
      tipeUnit: unit.unit_type.name,
      qty: unit.qty_total,
      hargaJual: unit.price,
      biayaBbn: unit.bbn_price,
      biayaEkspedisi: unit.expedition_fee,
      biayaLainnya: unit.other_fee,
      hpp: unit.hpp_total_price,
      dpp: unit.dpp_total_price,
      ppn: unit.ppn_total_price,
      jumlah: item.transaction_bruto_total,
    }))
  );

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
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="text-center w-16">NO</TableHead>
              <TableHead>NO PENJUALAN</TableHead>
              <TableHead>TGL JUAL</TableHead>
              <TableHead>TIPE UNIT</TableHead>
              <TableHead className="text-right">QTY</TableHead>
              <TableHead className="text-right">HARGA JUAL</TableHead>
              <TableHead className="text-right">BIAYA BBN</TableHead>
              <TableHead className="text-right">BIAYA EKSPEDISI</TableHead>
              <TableHead className="text-right">BIAYA LAINNYA</TableHead>
              <TableHead className="text-right">HPP</TableHead>
              <TableHead className="text-right">DPP</TableHead>
              <TableHead className="text-right">PPN</TableHead>
              <TableHead className="text-right">JUMLAH</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flattenedData.map((item, idx) => (
              <TableRow key={item.id} className="hover:bg-gray-50">
                <TableCell className="text-center">{idx + 1 + (pagination.currentPage - 1) * pagination.perPage}</TableCell>
                <TableCell className="font-medium whitespace-nowrap">{item.noPenjualan}</TableCell>
                <TableCell className="whitespace-nowrap">{formatDate(item.tanggal)}</TableCell>
                <TableCell className="whitespace-nowrap">{item.tipeUnit}</TableCell>
                <TableCell className="text-right">{item.qty}</TableCell>
                <TableCell className="text-right whitespace-nowrap">{formatCurrency(item.hargaJual)}</TableCell>
                <TableCell className="text-right whitespace-nowrap">{formatCurrency(item.biayaBbn)}</TableCell>
                <TableCell className="text-right whitespace-nowrap">{formatCurrency(item.biayaEkspedisi)}</TableCell>
                <TableCell className="text-right whitespace-nowrap">{formatCurrency(item.biayaLainnya)}</TableCell>
                <TableCell className="text-right whitespace-nowrap">{formatCurrency(item.hpp)}</TableCell>
                <TableCell className="text-right whitespace-nowrap">{formatCurrency(item.dpp)}</TableCell>
                <TableCell className="text-right whitespace-nowrap">{formatCurrency(item.ppn)}</TableCell>
                <TableCell className="text-right font-semibold whitespace-nowrap">{formatCurrency(item.jumlah)}</TableCell>
              </TableRow>
            ))}
            {flattenedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={13} className="h-24 text-center text-gray-500">
                  Tidak ada data penjualan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.total > 0 && (
        <div className="flex justify-between items-center p-4 border-t no-print">
          <div className="text-sm text-gray-500">
            Showing {pagination.from} to {pagination.to} of {pagination.total} data
          </div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled={pagination.currentPage === 1} onClick={() => onPageChange(pagination.currentPage - 1)}>
              Previous
            </Button>
            <Button variant="default" size="sm" className="bg-primary pointer-events-none">
              {pagination.currentPage}
            </Button>
            <Button variant="outline" size="sm" disabled={pagination.currentPage === pagination.lastPage} onClick={() => onPageChange(pagination.currentPage + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
