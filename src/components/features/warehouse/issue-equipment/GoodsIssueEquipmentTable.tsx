import Link from 'next/link';
import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { GoodsIssueEquipment } from '@/@types/goods-issue-equipment.types';

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
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
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
      <TableHeader className="bg-slate-100/90">
        <TableRow className="border-slate-200 hover:bg-transparent">
          <TableHead className="px-5 py-4 text-[14px] font-semibold uppercase text-slate-950">KODE PENGELUARAN</TableHead>
          <TableHead className="px-5 py-4 text-[14px] font-semibold uppercase text-slate-950">TANGGAL</TableHead>
          <TableHead className="px-5 py-4 text-[14px] font-semibold uppercase text-slate-950">DRIVER</TableHead>
          <TableHead className="px-5 py-4 text-[14px] font-semibold uppercase text-slate-950">NOMOR POLISI</TableHead>
          <TableHead className="px-5 py-4 text-[14px] font-semibold uppercase text-slate-950">KATEGORI</TableHead>
          <TableHead className="px-5 py-4 text-right text-[14px] font-semibold uppercase text-slate-950">ACTION</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={6} className="h-28 text-center text-slate-500">
              Memuat data pengeluaran perlengkapan...
            </TableCell>
          </TableRow>
        ) : data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="h-28 text-center text-slate-500">
              Belum ada data pengeluaran perlengkapan.
            </TableCell>
          </TableRow>
        ) : (
          data.map((item) => (
            <TableRow key={item.id} className="border-slate-200 hover:bg-slate-50/70">
              <TableCell className="px-5 py-4 text-[15px] font-medium text-slate-900">{item.code || '-'}</TableCell>
              <TableCell className="px-5 py-4 text-[15px] text-slate-800">{formatDate(item.transactionDate)}</TableCell>
              <TableCell className="px-5 py-4 text-[15px] text-slate-800">{item.driver?.name || '-'}</TableCell>
              <TableCell className="px-5 py-4 text-[15px] text-slate-800">{item.vehicleFleet?.registrationNumber || '-'}</TableCell>
              <TableCell className="px-5 py-4 text-[15px] text-slate-800">{getCategoryLabel(item.category)}</TableCell>
              <TableCell className="px-5 py-4 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-9 w-9 rounded-full p-0">
                      <MoreVertical className="h-4 w-4 text-slate-700" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44 rounded-2xl border-slate-200 p-2 shadow-lg">
                    <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2 text-[16px]">
                      <Link href={`/dashboard/${slug}/warehouse/pengeluaran-perlengkapan/${item.id}/edit`}>Edit</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2 text-[16px]">
                      <Link href={`/dashboard/${slug}/warehouse/pengeluaran-perlengkapan/${item.id}`}>Detail</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onUploadInvoice(item)}
                      className="cursor-pointer rounded-xl px-3 py-2 text-[16px]"
                    >
                      Upload Invoice
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(item)}
                      className="cursor-pointer rounded-xl px-3 py-2 text-[16px] text-red-600 focus:text-red-600"
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
