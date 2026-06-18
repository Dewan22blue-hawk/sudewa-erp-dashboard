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
  const getDestinationSummary = (item: DoEkspedisiItem) => {
    if (item.destinations && item.destinations.length > 0) {
      return item.destinations.map((destination) => destination.destination).filter(Boolean).join(', ');
    }

    return item.destination || '-';
  };

  return (
    <Card className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-none">
      <div className="overflow-x-auto">
        <Table className="min-w-[1500px]">
          <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
            <TableRow className="hover:bg-[#f8f9fa]">
              <TableHead className="text-center text-xs font-semibold uppercase text-slate-500 px-4 py-4">No</TableHead>
              <TableHead className="text-center text-xs font-semibold uppercase text-slate-500 px-4 py-4">Customer</TableHead>
              <TableHead className="text-center text-xs font-semibold uppercase text-slate-500 px-4 py-4">Loading In</TableHead>
              <TableHead className="text-center text-xs font-semibold uppercase text-slate-500 px-4 py-4">Tujuan Kirim</TableHead>
              <TableHead className="text-center text-xs font-semibold uppercase text-slate-500 px-4 py-4">Loading Out</TableHead>
              <TableHead className="text-center text-xs font-semibold uppercase text-slate-500 px-4 py-4">Keterangan</TableHead>
              <TableHead className="text-center text-xs font-semibold uppercase text-slate-500 px-4 py-4">UJ Driver</TableHead>
              <TableHead className="text-center text-xs font-semibold uppercase text-slate-500 px-4 py-4">UJ Lainnya</TableHead>
              <TableHead className="text-center text-xs font-semibold uppercase text-slate-500 px-4 py-4">Invoice</TableHead>
              <TableHead className="text-center text-xs font-semibold uppercase text-slate-500 px-4 py-4">Invoice Tambahan</TableHead>
              <TableHead className="text-center text-xs font-semibold uppercase text-slate-500 px-4 py-4">PPN</TableHead>
              <TableHead className="text-center text-xs font-semibold uppercase text-slate-500 px-4 py-4">Fee</TableHead>
              <TableHead className="text-center text-xs font-semibold uppercase text-slate-500 px-4 py-4 w-[80px]">Action</TableHead>
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
                <TableRow key={item.id} className="border-b border-[#EEF2F6] last:border-0 hover:bg-gray-50 transition-colors">
                  <TableCell className="px-4 py-4 text-center text-sm text-slate-700">{(page - 1) * perPage + index + 1}</TableCell>
                  <TableCell className="px-4 py-4 text-center text-sm text-slate-700">{item.customerName || '-'}</TableCell>
                  <TableCell className="px-4 py-4 text-center text-sm text-slate-700">{item.loadingIn || '-'}</TableCell>
                  <TableCell className="px-4 py-4 text-center text-sm text-slate-700">{getDestinationSummary(item)}</TableCell>
                  <TableCell className="px-4 py-4 text-center text-sm text-slate-700">{item.loadingOut || '-'}</TableCell>
                  <TableCell className="px-4 py-4 text-center text-sm text-slate-700">{item.driverNote || '-'}</TableCell>
                  <TableCell className="px-4 py-4 text-center text-sm text-slate-700">{formatCurrency(item.driverFee)}</TableCell>
                  <TableCell className="px-4 py-4 text-center text-sm text-slate-700">{formatCurrency(item.otherFee)}</TableCell>
                  <TableCell className="px-4 py-4 text-center text-sm text-slate-700">{formatCurrency(item.invoiceFee)}</TableCell>
                  <TableCell className="px-4 py-4 text-center text-sm text-slate-700">{formatCurrency(item.additionalCostFee)}</TableCell>
                  <TableCell className="px-4 py-4 text-center text-sm text-slate-700">{formatCurrency(item.ppnFee)}</TableCell>
                  <TableCell className="px-4 py-4 text-center text-sm text-slate-700">{formatCurrency(item.serviceFee)}</TableCell>
                  <TableCell className="px-4 py-4 text-center">
                    <div className="flex justify-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-[150px] rounded-xl border-slate-200 p-1.5 shadow-lg">
                          <DropdownMenuItem onClick={() => onView(item)} className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer">
                            Detail
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(item)} className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer">
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDelete(item)} className="rounded-lg px-3 py-2 text-sm text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer">
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
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
