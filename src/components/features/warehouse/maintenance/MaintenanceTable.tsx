import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { MaintenanceItem } from '@/@types/maintenance.types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface MaintenanceTableProps {
  data: MaintenanceItem[];
  isLoading: boolean;
  onViewDetail: (item: MaintenanceItem) => void;
  startIndex: number;
}

const formatDate = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, 'dd MMM yyyy', { locale: id });
};

export function MaintenanceTable({
  data,
  isLoading,
  onViewDetail,
  startIndex,
}: MaintenanceTableProps) {
  return (
    <Table>
      <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
        <TableRow className="border-slate-200 hover:bg-transparent">
          <TableHead className="w-[60px] px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">NO</TableHead>
          <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">TANGGAL</TableHead>
          <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">DRIVER/PIC</TableHead>
          <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">NO POLISI</TableHead>
          <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">ARMADA</TableHead>
          <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">KETERANGAN</TableHead>
          <TableHead className="w-[100px] px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">ACTION</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={7} className="h-28 text-center text-slate-500 text-sm">
              Memuat data maintenance...
            </TableCell>
          </TableRow>
        ) : data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="h-28 text-center text-slate-500 text-sm">
              Belum ada data maintenance.
            </TableCell>
          </TableRow>
        ) : (
          data.map((item, index) => (
            <TableRow key={item.id} className="border-slate-200 hover:bg-gray-50 transition-colors">
              <TableCell className="px-4 py-4 text-sm font-medium text-slate-900 text-left">{startIndex + index}</TableCell>
              <TableCell className="px-4 py-4 text-sm text-slate-700 text-left">{formatDate(item.transactionDate)}</TableCell>
              <TableCell className="px-4 py-4 text-sm text-slate-700 font-medium text-left">{item.driver?.name || '-'}</TableCell>
              <TableCell className="px-4 py-4 text-sm text-slate-700 text-left">{item.vehicleFleet?.registrationNumber || '-'}</TableCell>
              <TableCell className="px-4 py-4 text-sm text-slate-700 uppercase text-left">{item.vehicleFleet?.type || '-'}</TableCell>
              <TableCell className="px-4 py-4 text-sm text-slate-700 text-left">{item.description || '-'}</TableCell>
              <TableCell className="px-4 py-4 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetail(item)}
                  className="h-8 rounded-lg border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                >
                  Detail
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
