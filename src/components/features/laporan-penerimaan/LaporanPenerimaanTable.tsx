import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  pagination: { currentPage: number; lastPage: number; total: number; from: number; to: number; perPage: number };
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

const formatDate = (date: string) => new Date(date).toLocaleDateString('id-ID');

export default function LaporanPenerimaanTable({
  data,
  pagination,
  isLoading,
  onPageChange,
}: Props) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 bg-white rounded-xl border">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (data.length === 0) {
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
              <TableHead >NO PENERIMAAN</TableHead>
              <TableHead>TGL TERIMA</TableHead>
              <TableHead>NAMA SUPPLIER</TableHead>
              <TableHead>TIPE UNIT</TableHead>
              <TableHead>WARNA</TableHead>
              <TableHead>NO MESIN</TableHead>
              <TableHead>NO RANGKA</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, idx) => (
              <TableRow key={item.id}>
                <TableCell className="text-center">
                  {idx + 1 + (pagination.currentPage - 1) * pagination.perPage}
                </TableCell>
                <TableCell className="font-medium">{item.transaction_code}</TableCell>
                <TableCell>{formatDate(item.receipt_date)}</TableCell>
                <TableCell>{item.person}</TableCell>
                <TableCell>{item.unit_type.name}</TableCell>
                <TableCell>{item.color}</TableCell>
                <TableCell>{item.machine_number}</TableCell>
                <TableCell>{item.chassis_number}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.total > 0 && (
        <div className="print-hide-pagination flex flex-col sm:flex-row justify-between items-center p-4 border-t gap-4">
          <div className="text-sm text-gray-500">
            Showing {pagination.from}-{pagination.to} of {pagination.total} data
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage === 1}
              onClick={() => onPageChange(pagination.currentPage - 1)}
            >
              Previous
            </Button>
            <Button variant="default" size="sm" className="bg-gray-900">
              {pagination.currentPage}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage === pagination.lastPage}
              onClick={() => onPageChange(pagination.currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
