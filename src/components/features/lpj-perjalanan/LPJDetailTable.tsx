import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { LPJDetailItem } from './lpj-perjalanan.data';

interface LPJDetailTableProps {
  items: LPJDetailItem[];
}

const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export function LPJDetailTable({ items }: LPJDetailTableProps) {
  const totalInvoice = items.reduce((acc, item) => acc + item.invoiceEkspedisi, 0);
  const totalUJDriver = items.reduce((acc, item) => acc + item.ujDriver, 0);
  const totalPPH = items.reduce((acc, item) => acc + item.pph2, 0);

  return (
    <div className="overflow-hidden rounded-xl border border-[#d5dce7]">
      <Table className="min-w-250">
        <TableHeader className="bg-[#d9e5f7]">
          <TableRow>
            <TableHead className="text-[11px] font-semibold text-center">NO</TableHead>
            <TableHead className="text-[11px] font-semibold text-center">TANGGAL</TableHead>
            <TableHead className="text-[11px] font-semibold text-center">NO POLISI</TableHead>
            <TableHead className="text-[11px] font-semibold text-center">TYPE</TableHead>
            <TableHead className="text-[11px] font-semibold text-center">DRIVER</TableHead>
            <TableHead className="text-[11px] font-semibold text-center text-green-600">INVOICE EKSPEDISI</TableHead>
            <TableHead className="text-[11px] font-semibold text-center">BIAYA TAMBAHAN</TableHead>
            <TableHead className="text-[11px] font-semibold text-center text-red-500">UJ DRIVER</TableHead>
            <TableHead className="text-[11px] font-semibold text-center">LAINNYA</TableHead>
            <TableHead className="text-[11px] font-semibold text-center text-red-500">PPH 2%</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={item.id} className="text-xs">
              <TableCell className="text-center py-2">{index + 1}</TableCell>
              <TableCell className="text-center py-2">{format(new Date(item.tanggal), 'dd/MM/yyyy')}</TableCell>
              <TableCell className="text-center py-2">{item.noPolisi}</TableCell>
              <TableCell className="text-center py-2">{item.type}</TableCell>
              <TableCell className="text-center py-2">{item.driver}</TableCell>
              <TableCell className="text-center py-2 text-green-600">{rupiah.format(item.invoiceEkspedisi)}</TableCell>
              <TableCell className="text-center py-2">{item.biayaTambahan > 0 ? rupiah.format(item.biayaTambahan) : '-'}</TableCell>
              <TableCell className="text-center py-2 text-red-500">{rupiah.format(item.ujDriver)}</TableCell>
              <TableCell className="text-center py-2">{item.lainnya > 0 ? rupiah.format(item.lainnya) : '-'}</TableCell>
              <TableCell className="text-center py-2 text-red-500">{rupiah.format(item.pph2)}</TableCell>
            </TableRow>
          ))}

          <TableRow className="bg-[#d9e5f7] text-sm font-semibold">
            <TableCell colSpan={5} className="text-center py-2">
              Keterangan
            </TableCell>
            <TableCell className="text-center py-2">{rupiah.format(totalInvoice)}</TableCell>
            <TableCell className="text-center py-2">-</TableCell>
            <TableCell className="text-center py-2">{rupiah.format(totalUJDriver)}</TableCell>
            <TableCell className="text-center py-2">-</TableCell>
            <TableCell className="text-center py-2">{rupiah.format(totalPPH)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
