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
  onImport: () => void;
  onEdit: (armada: Armada) => void;
  onDelete: (armada: Armada) => void;
  onDetail?: (armada: Armada) => void;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
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
  onImport,
  onEdit,
  onDelete,
  onDetail,
  canCreate,
  canEdit,
  canDelete,
}: ArmadaTableProps) {
  const startData = totalData === 0 ? 0 : (page - 1) * perPage + 1;
  const endData = totalData === 0 ? 0 : Math.min(page * perPage, totalData);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Search here" className="bg-white pl-9" value={search} onChange={(e) => onSearchChange(e.target.value)} />
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500 whitespace-nowrap">
            <span>Show</span>
            <Select value={String(perPage)} onValueChange={(value) => onPerPageChange(Number(value))}>
              <SelectTrigger className="w-[70px] bg-white">
                <SelectValue placeholder="25" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span>Page</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canCreate && (
            <>
              {onImport && (
                <Button onClick={onImport} variant="outline" className="w-full sm:w-auto">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
              )}
              <Button onClick={onAdd} className="w-full sm:w-auto bg-[#1e3a5f] hover:bg-[#152e4d]">
                <Plus className="h-4 w-4 mr-2" />
                Tambah
              </Button>
            </>
          )}
        </div>
      </div>

      <Card className="overflow-hidden rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
          <Table className="min-w-[1100px]">
            <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
              <TableRow>
                <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500">NO POLISI</TableHead>
                <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500">TIPE</TableHead>
                <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500">NO MESIN</TableHead>
                <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500">NO RANGKA</TableHead>
                <TableHead className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500">MASA STNK</TableHead>
                <TableHead className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500">MASA KIR</TableHead>
                <TableHead className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500 whitespace-nowrap sticky right-0 bg-[#f8f9fa] z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]">ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: Math.min(perPage, 5) }).map((_, index) => (
                  <TableRow key={index} className="group animate-pulse">
                    <TableCell colSpan={7} className="text-center px-4 py-4 sticky right-0 bg-white group-hover:bg-slate-50 z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]">
                      <div className="h-5 rounded bg-gray-200" />
                    </TableCell>
                  </TableRow>
                ))
              ) : armadas.length > 0 ? (
                armadas.map((armada) => {
                  const stnkInfo = getRemainingLabel(armada.stnkAge);
                  const kirInfo = getRemainingLabel(armada.kirAge);
 
                  return (
                    <TableRow key={armada.id} className="group border-b hover:bg-gray-50/70 border-slate-100 transition-colors">
                      <TableCell className="px-4 py-4 text-left text-sm font-medium text-slate-900 whitespace-nowrap">{armada.registrationNumber}</TableCell>
                      <TableCell className="px-4 py-4 text-left text-sm text-slate-700 whitespace-nowrap">{armada.type}</TableCell>
                      <TableCell className="px-4 py-4 text-left text-sm text-slate-700 font-medium whitespace-nowrap">{armada.machineNumber}</TableCell>
                      <TableCell className="px-4 py-4 text-left text-sm text-slate-700 whitespace-nowrap">{armada.chassisNumber}</TableCell>
                      <TableCell className="px-4 py-4 text-center text-sm text-slate-700 whitespace-nowrap">
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
                      <TableCell className="px-4 py-4 text-center text-sm text-slate-700 whitespace-nowrap">
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
                            {onDetail && (
                              <DropdownMenuItem onClick={() => onDetail(armada)} className="cursor-pointer">
                                Detail
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => onEdit(armada)} disabled={!canEdit} className="cursor-pointer">
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDelete(armada)} disabled={!canDelete} className="cursor-pointer text-red-600 focus:text-red-600">
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow className="group">
                  <TableCell colSpan={7} className="h-32 text-center text-slate-500 px-4 py-4 text-sm">
                    Tidak ada data armada ditemukan
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <div className="flex flex-col gap-4 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between px-1">
        <div>
          Showing {startData}-{endData} of {totalData} data
        </div>

        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-end gap-1 text-slate-800">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300 text-gray-500"
            >
              Previous
            </Button>

            {renderPagination(page, totalPages).map((item, index) => (
              <Button
                key={`${item}-${index}`}
                variant="ghost"
                size="sm"
                disabled={item === '...'}
                onClick={() => typeof item === 'number' && onPageChange(item)}
                className={
                  item === page
                    ? 'h-9 min-w-9 rounded-xl border px-3 text-sm font-medium shadow-sm border-slate-200 bg-white text-slate-950'
                    : item === '...'
                    ? 'h-9 min-w-9 rounded-xl border px-3 text-sm font-medium border-transparent bg-transparent text-slate-500 cursor-default hover:bg-transparent hover:border-transparent'
                    : 'h-9 min-w-9 rounded-xl border px-3 text-sm font-medium border-transparent bg-transparent text-slate-700 hover:border-slate-200 hover:bg-white'
                }
              >
                {item}
              </Button>
            ))}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300 text-gray-500"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
