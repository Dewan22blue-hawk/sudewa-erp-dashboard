import Link from 'next/link';
import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { GoodsIssueEquipment } from '@/@types/goods-issue-equipment.types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface GoodsIssueEquipmentTableProps {
  data: GoodsIssueEquipment[];
  isLoading: boolean;
  slug: string;
  onUploadInvoice: (item: GoodsIssueEquipment) => void;
  onDelete: (item: GoodsIssueEquipment) => void;
}

const formatDate = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, 'dd MMMM yyyy', { locale: id });
};

const getCategoryLabel = (category: string) => {
  if (category === 'equipped') return 'Perlengkapan Armada';
  if (category === 'maintenance') return 'Maintenance Armada';
  return category;
};

export function GoodsIssueEquipmentTable({
  data,
  isLoading,
  slug,
  onUploadInvoice,
  onDelete,
}: GoodsIssueEquipmentTableProps) {
  return (
    <Table>
      <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
        <TableRow className="hover:bg-[#f8f9fa]">
          <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">KODE PENGELUARAN</TableHead>
          <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">TANGGAL</TableHead>
          <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">DRIVER</TableHead>
          <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">NOMOR POLISI</TableHead>
          <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">KATEGORI</TableHead>
          <TableHead className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500 w-24 whitespace-nowrap sticky right-0 bg-[#f8f9fa] z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]">ACTION</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow className="group">
            <TableCell colSpan={6} className="text-center px-4 py-4 sticky right-0 bg-white group-hover:bg-slate-50 z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]">
              Memuat data pengeluaran perlengkapan...
            </TableCell>
          </TableRow>
        ) : data.length === 0 ? (
          <TableRow className="group">
            <TableCell colSpan={6} className="h-28 text-center text-slate-500 text-sm">
              Belum ada data pengeluaran perlengkapan.
            </TableCell>
          </TableRow>
        ) : (
          data.map((item) => (
            <TableRow key={item.id} className="group bg-white hover:bg-slate-50 transition-colors">
              <TableCell className="px-4 py-4 text-sm font-medium text-slate-900 text-left">{item.code || '-'}</TableCell>
              <TableCell className="px-4 py-4 text-sm text-slate-700 text-left">{formatDate(item.transactionDate)}</TableCell>
              <TableCell className="px-4 py-4 text-sm text-slate-700 text-left">{item.driver?.name || '-'}</TableCell>
              <TableCell className="px-4 py-4 text-sm text-slate-700 text-left">{item.vehicleFleet?.registrationNumber || '-'}</TableCell>
              <TableCell className="px-4 py-4 text-sm text-slate-700 text-left">{getCategoryLabel(item.category)}</TableCell>
              <TableCell className="px-4 py-4 text-center sticky right-0 bg-white group-hover:bg-slate-50 z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[150px] rounded-xl border-slate-200 p-1.5 shadow-lg">
                    <DropdownMenuItem asChild className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer">
                      <Link href={`/dashboard/${slug}/warehouse/pengeluaran-perlengkapan/${item.id}/edit`}>Edit</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer">
                      <Link href={`/dashboard/${slug}/warehouse/pengeluaran-perlengkapan/${item.id}`}>Detail</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onUploadInvoice(item)}
                      className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer"
                    >
                      Upload Invoice
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(item)}
                      className="rounded-lg px-3 py-2 text-sm text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer"
                    >
                      Hapus
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
