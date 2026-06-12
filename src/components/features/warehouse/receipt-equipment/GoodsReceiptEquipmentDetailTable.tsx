import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { GoodsTransactionDetailEquipment } from '@/@types/goods-receipt-equipment.types';
import { formatCurrency } from './goodsReceiptEquipment.utils';

interface GoodsReceiptEquipmentDetailTableProps {
  data: GoodsTransactionDetailEquipment[];
  selectedIds: number[];
  onSelectedIdsChange: (ids: number[]) => void;
  onEdit: (item: GoodsTransactionDetailEquipment) => void;
  onDelete: (item: GoodsTransactionDetailEquipment) => void;
}

export function GoodsReceiptEquipmentDetailTable({
  data,
  selectedIds,
  onSelectedIdsChange,
  onEdit,
  onDelete,
}: GoodsReceiptEquipmentDetailTableProps) {
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
      <TableHeader className="bg-slate-100/90">
        <TableRow className="border-slate-200 hover:bg-transparent">
          <TableHead className="w-12 px-3 py-4 text-center">
            <Checkbox checked={isAllChecked} onCheckedChange={(checked) => toggleAll(!!checked)} />
          </TableHead>
          <TableHead className="px-5 py-4 text-[14px] font-semibold uppercase text-slate-950">NO</TableHead>
          <TableHead className="px-5 py-4 text-[14px] font-semibold uppercase text-slate-950">KODE BARANG</TableHead>
          <TableHead className="px-5 py-4 text-[14px] font-semibold uppercase text-slate-950">NAMA BARANG</TableHead>
          <TableHead className="px-5 py-4 text-[14px] font-semibold uppercase text-slate-950">QTY</TableHead>
          <TableHead className="px-5 py-4 text-[14px] font-semibold uppercase text-slate-950">HARGA</TableHead>
          <TableHead className="px-5 py-4 text-[14px] font-semibold uppercase text-slate-950">TOTAL</TableHead>
          <TableHead className="px-5 py-4 text-[14px] font-semibold uppercase text-slate-950">STATUS IN STOCK</TableHead>
          <TableHead className="px-5 py-4 text-[14px] font-semibold uppercase text-slate-950">STATUS FORECAST</TableHead>
          <TableHead className="px-5 py-4 text-right text-[14px] font-semibold uppercase text-slate-950">ACTION</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={10} className="h-28 text-center text-[15px] text-slate-500">
              Belum ada detail perlengkapan yang dimasukkan.
            </TableCell>
          </TableRow>
        ) : (
          data.map((item, index) => {
            console.log('GoodsReceiptEquipmentDetailTable item:', item);
            return (
              <TableRow key={item.id} className="border-slate-200 hover:bg-slate-50/70">
                <TableCell className="px-3 py-4 text-center">
                  <Checkbox checked={selectedIds.includes(item.id)} onCheckedChange={(checked) => toggleOne(item.id, !!checked)} />
                </TableCell>
              <TableCell className="px-5 py-4 text-[15px] text-slate-800">{index + 1}</TableCell>
              <TableCell className="px-5 py-4 text-[15px] text-slate-800">{item.vehicleEquipment?.code || '-'}</TableCell>
              <TableCell className="px-5 py-4 text-[15px] text-slate-800">{item.vehicleEquipment?.name || '-'}</TableCell>
              <TableCell className="px-5 py-4 text-[15px] font-semibold text-slate-900">{item.qty}</TableCell>
              <TableCell className="px-5 py-4 text-[15px] text-slate-800">{formatCurrency(item.price || 0)}</TableCell>
              <TableCell className="px-5 py-4 text-[15px] font-semibold text-slate-900">
                {formatCurrency((item.price || 0) * item.qty)}
              </TableCell>
              <TableCell className="px-5 py-4 text-[15px]">
                {item.inStock ? (
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                    In Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                    Out of Stock
                  </span>
                )}
              </TableCell>
              <TableCell className="px-5 py-4 text-[15px]">
                {item.isForecast ? (
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    Forecast
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-slate-200">
                    Real
                  </span>
                )}
              </TableCell>
              <TableCell className="px-5 py-4 text-right">
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
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
