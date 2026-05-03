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

export default function LaporanPenjualanPerCustomer({ data, pagination, isLoading, onPageChange }: Props) {
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
              <TableHead>NAMA CUSTOMER</TableHead>
              <TableHead className="text-right">QTY</TableHead>
              <TableHead className="text-right">HARGA</TableHead>
              <TableHead className="text-right">BIAYA BBN</TableHead>
              <TableHead className="text-right">BIAYA EKSPEDISI</TableHead>
              <TableHead className="text-right">BIAYA LAIN</TableHead>
              <TableHead className="text-right">TOTAL JUAL</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, idx) => {
              const items = item.unit_transaction_items || [];
              const qty = items.reduce((acc, curr) => acc + curr.qty_total, 0);
              const harga = items.reduce((acc, curr) => acc + (curr.price * curr.qty_total), 0);
              const biayaBbn = items.reduce((acc, curr) => acc + (curr.bbn_price * curr.qty_total), 0);
              const biayaEkspedisi = items.reduce((acc, curr) => acc + curr.expedition_fee, 0);
              const biayaLain = items.reduce((acc, curr) => acc + curr.other_fee, 0);

              return (
                <TableRow key={item.id} className="hover:bg-gray-50">
                  <TableCell className="text-center">{idx + 1 + (pagination.currentPage - 1) * pagination.perPage}</TableCell>
                  <TableCell className="font-medium whitespace-nowrap">{item.code}</TableCell>
                  <TableCell className="whitespace-nowrap">{formatDate(item.created_at)}</TableCell>
                  <TableCell className="whitespace-nowrap">{item.person?.name || '-'}</TableCell>
                  <TableCell className="text-right">{qty}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">{formatCurrency(harga)}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">{formatCurrency(biayaBbn)}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">{formatCurrency(biayaEkspedisi)}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">{formatCurrency(biayaLain)}</TableCell>
                  <TableCell className="text-right font-semibold whitespace-nowrap">{formatCurrency(item.transaction_bruto_total)}</TableCell>
                </TableRow>
              );
            })}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center text-gray-500">
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
