import { Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PenerimaanItem } from '@/services/laporan-penerimaan.service';

interface Props {
  data: PenerimaanItem[];
  isLoading: boolean;
}

export default function LaporanPenerimaanPerSupplier({
  data,
  isLoading,
}: Props) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 bg-white rounded-xl border">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Aggregate data by supplier
  const aggregatedData = new Map<string, number>();
  data.forEach((item) => {
    const supplierName = item.person;
    aggregatedData.set(supplierName, (aggregatedData.get(supplierName) || 0) + 1);
  });

  if (aggregatedData.size === 0) {
    return (
      <div className="flex justify-center items-center py-20 bg-white rounded-xl border">
        <p className="text-gray-500">Tidak ada data penerimaan</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="text-center w-12">NO</TableHead>
              <TableHead>NAMA SUPPLIER</TableHead>
              <TableHead className="text-right">QTY UNIT</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from(aggregatedData.entries()).map((entry, idx) => {
              const [supplier, qty] = entry;
              return (
                <TableRow key={supplier}>
                  <TableCell className="text-center">{idx + 1}</TableCell>
                  <TableCell>{supplier}</TableCell>
                  <TableCell className="text-right font-semibold">{qty}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
