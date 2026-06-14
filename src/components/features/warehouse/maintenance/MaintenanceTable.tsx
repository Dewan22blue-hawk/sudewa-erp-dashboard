import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { MaintenanceItem } from '@/@types/maintenance.types';

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
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

export function MaintenanceTable({
  data,
  isLoading,
  onViewDetail,
  startIndex,
}: MaintenanceTableProps) {
  return (
    <Table>
      <TableHeader className="bg-slate-100/90">
        <TableRow className="border-slate-200 hover:bg-transparent">
          <TableHead className="w-[60px] px-5 py-4 text-[14px] font-semibold uppercase text-slate-950">NO</TableHead>
          <TableHead className="px-5 py-4 text-[14px] font-semibold uppercase text-slate-950">TANGGAL</TableHead>
          <TableHead className="px-5 py-4 text-[14px] font-semibold uppercase text-slate-950">DRIVER/PIC</TableHead>
          <TableHead className="px-5 py-4 text-[14px] font-semibold uppercase text-slate-950">NO POLISI</TableHead>
          <TableHead className="px-5 py-4 text-[14px] font-semibold uppercase text-slate-950">ARMADA</TableHead>
          <TableHead className="px-5 py-4 text-[14px] font-semibold uppercase text-slate-950">KETERANGAN</TableHead>
          <TableHead className="w-[100px] px-5 py-4 text-right text-[14px] font-semibold uppercase text-slate-950">ACTION</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={7} className="h-28 text-center text-slate-500">
              Memuat data maintenance...
            </TableCell>
          </TableRow>
        ) : data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="h-28 text-center text-slate-500">
              Belum ada data maintenance.
            </TableCell>
          </TableRow>
        ) : (
          data.map((item, index) => (
            <TableRow key={item.id} className="border-slate-200 hover:bg-slate-50/70">
              <TableCell className="px-5 py-4 text-[15px] font-medium text-slate-900">{startIndex + index}</TableCell>
              <TableCell className="px-5 py-4 text-[15px] text-slate-800">{formatDate(item.transactionDate)}</TableCell>
              <TableCell className="px-5 py-4 text-[15px] text-slate-800 font-medium">{item.driver?.name || '-'}</TableCell>
              <TableCell className="px-5 py-4 text-[15px] text-slate-800">{item.vehicleFleet?.registrationNumber || '-'}</TableCell>
              <TableCell className="px-5 py-4 text-[15px] text-slate-800 uppercase">{item.vehicleFleet?.type || '-'}</TableCell>
              <TableCell className="px-5 py-4 text-[15px] text-slate-800">{item.description || '-'}</TableCell>
              <TableCell className="px-5 py-4 text-right">
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
