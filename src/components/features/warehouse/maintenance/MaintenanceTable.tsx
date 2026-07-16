import { Search, Loader2 } from 'lucide-react';
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
  return format(date, 'dd MMMM yyyy', { locale: id });
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
          <TableHead className="w-[100px] px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500 whitespace-nowrap sticky right-0 bg-[#f8f9fa] z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]">ACTION</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow className="group">
            <TableCell colSpan={7} className="py-16 h-28 text-center text-slate-500 text-sm">
    <div className="flex flex-col items-center justify-center gap-3 opacity-0 animate-in fade-in duration-500">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
        <span className="text-sm font-medium text-slate-500">Memuat data...</span>
    </div>
</TableCell>
          </TableRow>
        ) : data.length === 0 ? (
          <TableRow className="group">
            <TableCell colSpan={100} className="py-16 h-28 text-center text-slate-500 text-sm">
                    <div className="flex flex-col items-center justify-center gap-2">
                        <div className="rounded-full bg-slate-50 p-4 mb-2">
                            <Search className="h-8 w-8 text-slate-400" />
                        </div>
                        <p className="text-base font-semibold text-slate-900">Tidak ada data ditemukan</p>
                        <p className="text-sm text-slate-500">Belum ada data atau coba gunakan kata kunci pencarian lain.</p>
                    </div>
                </TableCell>
          </TableRow>
        ) : (
          data.map((item, index) => (
            <TableRow key={item.id} className="group border-slate-200 bg-white hover:bg-slate-50 transition-colors">
              <TableCell className="px-4 py-4 text-sm font-medium text-slate-900 text-left">{startIndex + index}</TableCell>
              <TableCell className="px-4 py-4 text-sm text-slate-700 text-left">{formatDate(item.transactionDate)}</TableCell>
              <TableCell className="px-4 py-4 text-sm text-slate-700 font-medium text-left">{item.driver?.name || '-'}</TableCell>
              <TableCell className="px-4 py-4 text-sm text-slate-700 text-left">{item.vehicleFleet?.registrationNumber || '-'}</TableCell>
              <TableCell className="px-4 py-4 text-sm text-slate-700 uppercase text-left">{item.vehicleFleet?.type || '-'}</TableCell>
              <TableCell className="px-4 py-4 text-sm text-slate-700 text-left">{item.description || '-'}</TableCell>
              <TableCell className="px-4 py-4 text-center sticky right-0 bg-white group-hover:bg-slate-50 z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]">
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
