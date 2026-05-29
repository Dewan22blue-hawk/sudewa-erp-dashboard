import React from 'react';
import { Search, MoreVertical, Printer, Edit, FileText, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { DoEkspedisi } from '@/@types/do-ekspedisi.types';

interface DOEkspedisiTableProps {
  data: DoEkspedisi[];
  search: string;
  page: number;
  perPage: number;
  totalData: number;
  totalPages: number;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onEdit: (item: DoEkspedisi) => void;
  onDetail: (item: DoEkspedisi) => void;
  onDelete: (item: DoEkspedisi) => void;
  onPrint: (item: DoEkspedisi) => void;
}

const renderPagination = (page: number, totalPages: number): Array<number | string> => {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  if (page <= 4) return [1, 2, 3, 4, '...', totalPages];
  if (page >= totalPages - 3) return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  return [1, '...', page - 1, page, page + 1, '...', totalPages];
};

export const DOEkspedisiTable = React.memo(function DOEkspedisiTable({
  data,
  search,
  page,
  perPage,
  totalData,
  totalPages,
  isLoading = false,
  onSearchChange,
  onPageChange,
  onPerPageChange,
  onEdit,
  onDetail,
  onDelete,
  onPrint,
}: DOEkspedisiTableProps) {
  const startData = totalData === 0 ? 0 : (page - 1) * perPage + 1;
  const endData = totalData === 0 ? 0 : Math.min(page * perPage, totalData);

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
          <div className="relative w-full sm:w-[310px]">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search here"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              className="h-12 rounded-xl border-[#E5E7EB] bg-white pl-11"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Show</span>
            <Select value={String(perPage)} onValueChange={(value) => onPerPageChange(Number(value))}>
              <SelectTrigger className="h-12 w-[88px] rounded-xl border-[#E5E7EB] bg-white">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-slate-600">Page</span>
          </div>
        </div>

        {/* Add button removed: creation of DO is not supported by API */}
      </div>

      <Card className="overflow-hidden rounded-2xl border border-[#D7DEE7] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table className="min-w-[980px]">
            <TableHeader className="bg-[#EEF3F8]">
              <TableRow className="border-b border-[#D7DEE7]">
                <TableHead className="h-11 text-center text-xs font-semibold uppercase text-slate-700">Kode DO</TableHead>
                <TableHead className="h-11 text-center text-xs font-semibold uppercase text-slate-700">Kode Order</TableHead>
                <TableHead className="h-11 text-center text-xs font-semibold uppercase text-slate-700">Tanggal</TableHead>
                <TableHead className="h-11 text-center text-xs font-semibold uppercase text-slate-700">Nama Driver</TableHead>
                <TableHead className="h-11 text-center text-xs font-semibold uppercase text-slate-700">No Polisi</TableHead>
                <TableHead className="h-11 text-center text-xs font-semibold uppercase text-slate-700">Tipe</TableHead>
                <TableHead className="h-11 text-center text-xs font-semibold uppercase text-slate-700">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: Math.min(perPage, 5) }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={7} className="px-4 py-4">
                      <div className="h-5 animate-pulse rounded bg-slate-200" />
                    </TableCell>
                  </TableRow>
                ))
              ) : data.length > 0 ? (
                data.map((item) => (
                  <TableRow key={item.id} className="border-b border-[#EEF2F6] last:border-0 hover:bg-slate-50/80">
                    <TableCell className="px-4 py-4 text-center text-sm font-medium text-slate-800">{item.doCode || '-'}</TableCell>
                    <TableCell className="px-4 py-4 text-center text-sm text-slate-600">{item.orderCode || item.orderList?.code || '-'}</TableCell>
                    <TableCell className="px-4 py-4 text-center text-sm text-slate-600">
                      {item.date ? format(new Date(item.date), 'dd/MM/yyyy') : '-'}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-center text-sm text-slate-600">{item.driver?.name || '-'}</TableCell>
                    <TableCell className="px-4 py-4 text-center text-sm text-slate-600">{item.vehicle?.registrationNumber || '-'}</TableCell>
                    <TableCell className="px-4 py-4 text-center text-sm text-slate-600">{item.vehicle?.type || '-'}</TableCell>
                    <TableCell className="px-4 py-4 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4 text-slate-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[170px]">
                          <DropdownMenuItem onClick={() => onEdit(item)} className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDetail(item)} className="cursor-pointer">
                            <FileText className="mr-2 h-4 w-4" />
                            Detail
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onPrint(item)} className="cursor-pointer">
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDelete(item)} className="cursor-pointer text-red-600 focus:text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                    Tidak ada data DO Ekspedisi ditemukan
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <div className="flex flex-col gap-4 px-1 pt-1 lg:flex-row lg:items-center lg:justify-between">
        <div className="text-sm text-slate-500">
          Showing {startData}-{endData} of {totalData} data
        </div>

        {totalPages > 1 ? (
          <div className="flex flex-wrap items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => onPageChange(page - 1)} disabled={page === 1} className="text-slate-600">
              Previous
            </Button>
            {renderPagination(page, totalPages).map((item, index) => (
              <Button
                key={`${item}-${index}`}
                variant={item === page ? 'outline' : 'ghost'}
                size="sm"
                disabled={item === '...'}
                onClick={() => typeof item === 'number' && onPageChange(item)}
                className={item === page ? 'border-[#D7DEE7] bg-white' : 'text-slate-600'}
              >
                {item}
              </Button>
            ))}
            <Button variant="ghost" size="sm" onClick={() => onPageChange(page + 1)} disabled={page === totalPages} className="text-slate-600">
              Next
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
});
