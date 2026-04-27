import React from 'react';
import { Search, Plus, MoreVertical, Upload, CircleAlert } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Armada } from '@/@types/armada.types';

interface ArmadaTableProps {
  armadas: Armada[];
  search: string;
  onSearchChange: (value: string) => void;
  page: number;
  perPage: number;
  totalData: number;
  totalPages: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onAdd: () => void;
  onEdit: (armada: Armada) => void;
  onDelete: (armada: Armada) => void;
}

const formatDate = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('id-ID');
};

const getRemainingLabel = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const diffInMs = date.getTime() - Date.now();
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays < 0) {
    return { text: `${Math.abs(diffInDays)} hari lalu`, className: 'text-[#DC2626]' };
  }
  if (diffInDays <= 30) {
    return { text: `${diffInDays} hari lagi`, className: 'text-[#DC2626]' };
  }
  if (diffInDays <= 90) {
    return { text: `${diffInDays} hari lagi`, className: 'text-[#F59E0B]' };
  }
  return { text: `${diffInDays} hari lagi`, className: 'text-[#16A34A]' };
};

const renderPagination = (page: number, totalPages: number): Array<number | string> => {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  if (page <= 4) return [1, 2, 3, 4, '...', totalPages];
  if (page >= totalPages - 3) return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  return [1, '...', page - 1, page, page + 1, '...', totalPages];
};

export function ArmadaTable({
  armadas,
  search,
  onSearchChange,
  page,
  perPage,
  totalData,
  totalPages,
  isLoading = false,
  onPageChange,
  onPerPageChange,
  onAdd,
  onEdit,
  onDelete,
}: ArmadaTableProps) {
  const startData = totalData === 0 ? 0 : (page - 1) * perPage + 1;
  const endData = totalData === 0 ? 0 : Math.min(page * perPage, totalData);

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex w-full items-center gap-4 sm:w-auto">
          <div className="relative w-full sm:w-[320px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Search here" className="bg-white pl-9" value={search} onChange={(e) => onSearchChange(e.target.value)} />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Show</span>
            <Select value={String(perPage)} onValueChange={(value) => onPerPageChange(Number(value))}>
              <SelectTrigger className="w-[70px] bg-white">
                <SelectValue placeholder="25" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-500">Page</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2" disabled>
            <Upload className="h-4 w-4 rotate-180" />
            Export
          </Button>
          <Button onClick={onAdd} className="bg-[#1e3a5f] hover:bg-[#152e4d]">
            <Plus className="mr-2 h-4 w-4" />
            Tambah
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
          <Table className="min-w-[1100px]">
            <TableHeader className="border-b border-gray-200 bg-[#f1f5f9]">
              <TableRow>
                <TableHead className="py-3 text-center text-xs font-semibold uppercase text-gray-600">NO POLISI</TableHead>
                <TableHead className="py-3 text-center text-xs font-semibold uppercase text-gray-600">TIPE</TableHead>
                <TableHead className="py-3 text-center text-xs font-semibold uppercase text-gray-600">NO MESIN</TableHead>
                <TableHead className="py-3 text-center text-xs font-semibold uppercase text-gray-600">NO RANGKA</TableHead>
                <TableHead className="py-3 text-center text-xs font-semibold uppercase text-gray-600">MASA STNK</TableHead>
                <TableHead className="py-3 text-center text-xs font-semibold uppercase text-gray-600">MASA KIR</TableHead>
                <TableHead className="py-3 text-center text-xs font-semibold uppercase text-gray-600">ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: Math.min(perPage, 5) }).map((_, index) => (
                  <TableRow key={index} className="animate-pulse">
                    <TableCell colSpan={7} className="px-4 py-4">
                      <div className="h-5 rounded bg-gray-200" />
                    </TableCell>
                  </TableRow>
                ))
              ) : armadas.length > 0 ? (
                armadas.map((armada) => {
                  const stnkInfo = getRemainingLabel(armada.stnkAge);
                  const kirInfo = getRemainingLabel(armada.kirAge);

                  return (
                    <TableRow key={armada.id} className="hover:bg-gray-50/50">
                      <TableCell className="px-4 py-4 text-center text-sm text-gray-900 whitespace-nowrap">{armada.registrationNumber}</TableCell>
                      <TableCell className="px-4 py-4 text-center text-sm text-gray-600 whitespace-nowrap">{armada.type}</TableCell>
                      <TableCell className="px-4 py-4 text-center text-sm text-gray-600 whitespace-nowrap">{armada.machineNumber}</TableCell>
                      <TableCell className="px-4 py-4 text-center text-sm text-gray-600 whitespace-nowrap">{armada.chassisNumber}</TableCell>
                      <TableCell className="px-4 py-4 text-center text-sm text-gray-600 whitespace-nowrap">
                        <div>{formatDate(armada.stnkAge)}</div>
                        {stnkInfo && (
                          <div className="mt-1 flex justify-center">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                                stnkInfo.className.includes('#DC2626')
                                  ? 'bg-red-50 text-[#DC2626]'
                                  : stnkInfo.className.includes('#F59E0B')
                                    ? 'bg-amber-50 text-[#F59E0B]'
                                    : 'bg-green-50 text-[#16A34A]'
                              }`}
                            >
                              <span>{stnkInfo.text}</span>
                              {(stnkInfo.className.includes('#DC2626') || stnkInfo.className.includes('#F59E0B')) && <CircleAlert className="h-3.5 w-3.5" />}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-center text-sm text-gray-600 whitespace-nowrap">
                        <div>{formatDate(armada.kirAge)}</div>
                        {kirInfo && (
                          <div className="mt-1 flex justify-center">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                                kirInfo.className.includes('#DC2626')
                                  ? 'bg-red-50 text-[#DC2626]'
                                  : kirInfo.className.includes('#F59E0B')
                                    ? 'bg-amber-50 text-[#F59E0B]'
                                    : 'bg-green-50 text-[#16A34A]'
                              }`}
                            >
                              <span>{kirInfo.text}</span>
                              {(kirInfo.className.includes('#DC2626') || kirInfo.className.includes('#F59E0B')) && <CircleAlert className="h-3.5 w-3.5" />}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-center text-sm">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4 text-gray-500" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[160px]">
                            <DropdownMenuItem onClick={() => onEdit(armada)} className="cursor-pointer">
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDelete(armada)} className="cursor-pointer text-red-600 focus:text-red-600">
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-gray-500">
                    Tidak ada data armada ditemukan
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <div className="flex items-center justify-between px-2 pt-2">
        <div className="text-sm text-gray-500">
          Showing {startData}-{endData} of {totalData} data
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => onPageChange(page - 1)} disabled={page === 1} className="text-gray-500">
              Previous
            </Button>

            {renderPagination(page, totalPages).map((item, index) => (
              <Button
                key={`${item}-${index}`}
                variant={item === page ? 'outline' : 'ghost'}
                size="sm"
                disabled={item === '...'}
                onClick={() => typeof item === 'number' && onPageChange(item)}
                className={item === page ? 'border-gray-200 bg-white' : 'text-gray-500'}
              >
                {item}
              </Button>
            ))}

            <Button variant="ghost" size="sm" onClick={() => onPageChange(page + 1)} disabled={page === totalPages} className="text-gray-500">
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
