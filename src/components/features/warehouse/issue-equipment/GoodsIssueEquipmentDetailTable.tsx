import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { GoodsTransactionDetailEquipment } from '@/@types/goods-issue-equipment.types';

interface GoodsIssueEquipmentDetailTableProps {
  data: GoodsTransactionDetailEquipment[];
  selectedIds: number[];
  onSelectedIdsChange: (ids: number[]) => void;
  onEdit: (item: GoodsTransactionDetailEquipment) => void;
  onDelete: (item: GoodsTransactionDetailEquipment) => void;
}

export function GoodsIssueEquipmentDetailTable({
  data,
  selectedIds,
  onSelectedIdsChange,
  onEdit,
  onDelete,
}: GoodsIssueEquipmentDetailTableProps) {
  const toggleAll = (checked: boolean) => {
    if (checked) {
      onSelectedIdsChange(data.map((item) => item.id));
    } else {
      onSelectedIdsChange([]);
    }
  };

  const toggleOne = (id: number, checked: boolean) => {
    if (checked) {
      onSelectedIdsChange([...selectedIds, id]);
    } else {
      onSelectedIdsChange(selectedIds.filter((item) => item !== id));
    }
  };

  const isAllChecked = data.length > 0 && data.every((item) => selectedIds.includes(item.id));

  return (
    <Table>
      <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
        <TableRow className="border-slate-200 hover:bg-transparent">
          <TableHead className="w-12 px-4 py-4 text-center">
            <Checkbox checked={isAllChecked} onCheckedChange={(checked) => toggleAll(!!checked)} />
          </TableHead>
          <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">NO</TableHead>
          <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">KODE BARANG</TableHead>
          <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">NAMA BARANG</TableHead>
          <TableHead className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">QTY</TableHead>
          <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">KETERANGAN</TableHead>
          <TableHead className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500 w-24 whitespace-nowrap">ACTION</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="h-28 text-center text-sm text-slate-500">
              Belum ada detail perlengkapan yang dimasukkan.
            </TableCell>
          </TableRow>
        ) : (
          data.map((item, index) => (
            <TableRow key={item.id} className="border-slate-200 hover:bg-slate-50/70 transition-colors">
              <TableCell className="px-4 py-4 text-center">
                <Checkbox checked={selectedIds.includes(item.id)} onCheckedChange={(checked) => toggleOne(item.id, !!checked)} />
              </TableCell>
              <TableCell className="px-4 py-4 text-sm text-slate-700 text-left">{index + 1}</TableCell>
              <TableCell className="px-4 py-4 text-sm text-slate-700 text-left">{item.vehicleEquipment?.code || '-'}</TableCell>
              <TableCell className="px-4 py-4 text-sm text-slate-700 text-left">{item.vehicleEquipment?.name || '-'}</TableCell>
              <TableCell className="px-4 py-4 text-center text-sm font-semibold text-slate-900">{item.qty}</TableCell>
              <TableCell className="px-4 py-4 text-sm text-slate-700 text-left">{item.description || '-'}</TableCell>
              <TableCell className="px-4 py-4 text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-9 w-9 rounded-full p-0">
                      <MoreVertical className="h-4 w-4 text-slate-700" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36 rounded-2xl border-slate-200 p-2 shadow-lg">
                    <DropdownMenuItem
                      onClick={() => onEdit(item)}
                      className="cursor-pointer rounded-xl px-3 py-2 text-[16px]"
                    >
                      Edit
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
