import React from 'react';
import { MoreVertical } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { DoEkspedisiItem } from '@/@types/do-ekspedisi.types';
import { formatCurrency } from '@/lib/utils/currency';

interface DOEkspedisiDetailTableProps {
  data: DoEkspedisiItem[];
  page: number;
  perPage: number;
  isLoading?: boolean;
  onView: (item: DoEkspedisiItem) => void;
  onEdit: (item: DoEkspedisiItem) => void;
  onDelete: (item: DoEkspedisiItem) => void;
}

export function DOEkspedisiDetailTable({
  data,
  page,
  perPage,
  isLoading = false,
  onView,
  onEdit,
  onDelete,
}: DOEkspedisiDetailTableProps) {
  return (
    <Card className="overflow-hidden rounded-[20px] border border-[#D7DEE7] bg-white shadow-sm">
      <div className="overflow-x-auto">
        <Table className="min-w-[1500px]">
          <TableHeader className="bg-[#EEF3F8]">
            <TableRow className="border-b border-[#D7DEE7]">
              <TableHead className="text-center text-xs font-semibold uppercase text-slate-700">No</TableHead>
              <TableHead className="text-center text-xs font-semibold uppercase text-slate-700">Customer</TableHead>
              <TableHead className="text-center text-xs font-semibold uppercase text-slate-700">Loading In</TableHead>
              <TableHead className="text-center text-xs font-semibold uppercase text-slate-700">Tujuan Kirim</TableHead>
              <TableHead className="text-center text-xs font-semibold uppercase text-slate-700">Loading Out</TableHead>
              <TableHead className="text-center text-xs font-semibold uppercase text-slate-700">Keterangan</TableHead>
              <TableHead className="text-center text-xs font-semibold uppercase text-slate-700">UJ Driver</TableHead>
              <TableHead className="text-center text-xs font-semibold uppercase text-slate-700">UJ Lainnya</TableHead>
              <TableHead className="text-center text-xs font-semibold uppercase text-slate-700">Invoice</TableHead>
              <TableHead className="text-center text-xs font-semibold uppercase text-slate-700">Invoice Tambahan</TableHead>
              <TableHead className="text-center text-xs font-semibold uppercase text-slate-700">PPN</TableHead>
              <TableHead className="text-center text-xs font-semibold uppercase text-slate-700">Fee</TableHead>
              <TableHead className="text-center text-xs font-semibold uppercase text-slate-700">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: Math.min(perPage, 5) }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={13} className="px-4 py-4">
                    <div className="h-5 animate-pulse rounded bg-slate-200" />
                  </TableCell>
                </TableRow>
              ))
            ) : data.length > 0 ? (
              data.map((item, index) => (
                <TableRow key={item.id} className="border-b border-[#EEF2F6] last:border-0 hover:bg-slate-50/80">
                  <TableCell className="px-4 py-4 text-center text-sm text-slate-700">{(page - 1) * perPage + index + 1}</TableCell>
                  <TableCell className="px-4 py-4 text-center text-sm text-slate-700">{item.customerName || '-'}</TableCell>
                  <TableCell className="px-4 py-4 text-center text-sm text-slate-700">{item.loadingIn || '-'}</TableCell>
                  <TableCell className="px-4 py-4 text-center text-sm text-slate-700">{item.destination || '-'}</TableCell>
                  <TableCell className="px-4 py-4 text-center text-sm text-slate-700">{item.loadingOut || '-'}</TableCell>
                  <TableCell className="px-4 py-4 text-center text-sm text-slate-700">-</TableCell>
                  <TableCell className="px-4 py-4 text-center text-sm text-slate-700">{formatCurrency(item.driverFee)}</TableCell>
                  <TableCell className="px-4 py-4 text-center text-sm text-slate-700">{formatCurrency(item.otherFee)}</TableCell>
                  <TableCell className="px-4 py-4 text-center text-sm text-slate-700">{formatCurrency(item.invoiceFee)}</TableCell>
                  <TableCell className="px-4 py-4 text-center text-sm text-slate-700">{formatCurrency(item.additionalCostFee)}</TableCell>
                  <TableCell className="px-4 py-4 text-center text-sm text-slate-700">{formatCurrency(item.ppnFee)}</TableCell>
                  <TableCell className="px-4 py-4 text-center text-sm text-slate-700">{formatCurrency(item.serviceFee)}</TableCell>
                  <TableCell className="px-4 py-4 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4 text-slate-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuItem onClick={() => onView(item)} className="cursor-pointer">
                          Detail
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(item)} className="cursor-pointer">
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(item)} className="cursor-pointer text-red-600 focus:text-red-600">
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={13} className="h-32 text-center text-slate-500">
                  Tidak ada data detail DO ditemukan
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
