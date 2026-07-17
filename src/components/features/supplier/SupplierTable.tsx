import type { Supplier } from '@/@types/supplier.types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Download, MoreVertical, Plus, Search, Upload, ArrowUp, ArrowDown, ArrowUpDown, Loader2 } from 'lucide-react';
import { useTableSort } from '@/hooks/useTableSort';
import { CopyBox } from '@/components/ui/copy-box';

interface SupplierTableProps {
  suppliers: Supplier[];
  isLoading?: boolean;
  search: string;
  page: number;
  perPage: number;
  totalData: number;
  totalPages: number;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onAdd: () => void;
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
  onImport: () => void;
  onExport: () => void;
  isExporting?: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

const buildPagination = (page: number, totalPages: number): Array<number | 'ellipsis'> => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (page <= 4) {
    return [1, 2, 3, 4, 'ellipsis', totalPages];
  }

  if (page >= totalPages - 3) {
    return [1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, 'ellipsis', page - 1, page, page + 1, 'ellipsis', totalPages];
};

function SortIcon({ sortKey, currentSortKey, sortOrder }: { sortKey: string; currentSortKey: string; sortOrder: any }) {
  const isActive = currentSortKey === sortKey;
  if (isActive && sortOrder === 'asc')
    return <ArrowUp className="h-3 w-3 text-indigo-500 shrink-0 transition-colors" />;
  if (isActive && sortOrder === 'desc')
    return <ArrowDown className="h-3 w-3 text-indigo-500 shrink-0 transition-colors" />;
  return <ArrowUpDown className="h-3 w-3 text-gray-400 shrink-0 opacity-0 group-hover:opacity-70 transition-opacity duration-150" />;
}

export function SupplierTable({
  suppliers,
  isLoading = false,
  search,
  page,
  perPage,
  totalData,
  totalPages,
  onSearchChange,
  onPageChange,
  onPerPageChange,
  onAdd,
  onEdit,
  onDelete,
  onImport,
  onExport,
  isExporting = false,
  canCreate,
  canEdit,
  canDelete,
}: SupplierTableProps) {
  const { sortedData, sortKey, sortOrder, handleSort } = useTableSort({
    data: suppliers,
  });

  const startData = totalData === 0 ? 0 : (page - 1) * perPage + 1;
  const endData = totalData === 0 ? 0 : Math.min(page * perPage, totalData);
  const paginationItems = buildPagination(page, totalPages);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search here"
              className="pl-9 bg-white"
            />
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
            <Button variant="outline" className="w-full sm:w-auto" onClick={onImport}>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          )}
          <Button variant="outline" className="w-full sm:w-auto" onClick={onExport} disabled={isExporting}>
            <Upload className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
          {canCreate && (
            <Button className="w-full sm:w-auto bg-[#1e3a5f] hover:bg-[#152e4d]" onClick={onAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-none">s*<Table>
            <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
              <TableRow className="hover:bg-[#f8f9fa]">
                {/* Kode */}
                <TableHead
                  className={cn(
                    'group px-4 py-4 text-left text-xs font-semibold uppercase cursor-pointer select-none transition-colors w-[12%]',
                    sortKey === 'code' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                  )}
                  onClick={() => handleSort('code')}
                >
                  <div className="flex items-center gap-1">
                    Kode
                    <SortIcon sortKey="code" currentSortKey={sortKey as string} sortOrder={sortOrder} />
                  </div>
                </TableHead>
                {/* Nama Supplier */}
                <TableHead
                  className={cn(
                    'group px-4 py-4 text-left text-xs font-semibold uppercase cursor-pointer select-none transition-colors w-[22%]',
                    sortKey === 'name' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                  )}
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    Nama Supplier
                    <SortIcon sortKey="name" currentSortKey={sortKey as string} sortOrder={sortOrder} />
                  </div>
                </TableHead>
                {/* PIC */}
                <TableHead
                  className={cn(
                    'group px-4 py-4 text-left text-xs font-semibold uppercase cursor-pointer select-none transition-colors w-[15%]',
                    sortKey === 'pic' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                  )}
                  onClick={() => handleSort('pic')}
                >
                  <div className="flex items-center gap-1">
                    PIC
                    <SortIcon sortKey="pic" currentSortKey={sortKey as string} sortOrder={sortOrder} />
                  </div>
                </TableHead>
                {/* Phone */}
                <TableHead
                  className={cn(
                    'group px-4 py-4 text-left text-xs font-semibold uppercase cursor-pointer select-none transition-colors w-[13%]',
                    sortKey === 'phone' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                  )}
                  onClick={() => handleSort('phone')}
                >
                  <div className="flex items-center gap-1">
                    Phone
                    <SortIcon sortKey="phone" currentSortKey={sortKey as string} sortOrder={sortOrder} />
                  </div>
                </TableHead>
                {/* NPWP */}
                <TableHead
                  className={cn(
                    'group px-4 py-4 text-left text-xs font-semibold uppercase cursor-pointer select-none transition-colors w-[15%]',
                    sortKey === 'npwp' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                  )}
                  onClick={() => handleSort('npwp')}
                >
                  <div className="flex items-center gap-1">
                    NPWP
                    <SortIcon sortKey="npwp" currentSortKey={sortKey as string} sortOrder={sortOrder} />
                  </div>
                </TableHead>
                {/* Alamat */}
                <TableHead
                  className={cn(
                    'group px-4 py-4 text-left text-xs font-semibold uppercase cursor-pointer select-none transition-colors w-[23%]',
                    sortKey === 'address' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                  )}
                  onClick={() => handleSort('address')}
                >
                  <div className="flex items-center gap-1">
                    Alamat
                    <SortIcon sortKey="address" currentSortKey={sortKey as string} sortOrder={sortOrder} />
                  </div>
                </TableHead>
                {/* Action */}
                <TableHead className="w-[80px] px-4 py-4 text-center text-xs font-semibold text-slate-500 uppercase sticky right-0 bg-[#f8f9fa] z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <tr>
                  <td colSpan={100} className="px-4 py-16 text-center bg-white">
                    <div className="flex flex-col items-center justify-center gap-3 opacity-0 animate-in fade-in duration-500">
                      <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                      <span className="text-sm font-medium text-slate-500">Memuat data...</span>
                    </div>
                  </td>
                </tr>
              ) : sortedData.length > 0 ? (
                sortedData.map((supplier) => (
                  <TableRow key={supplier.id} className="group hover:bg-gray-50 transition-colors">
                    <TableCell className="px-4 py-4 text-sm font-medium text-gray-600 text-left">
                      <CopyBox text={supplier.code || '-'} />
                    </TableCell>
                    <TableCell className="px-4 py-4 text-sm font-medium text-gray-900 text-left truncate max-w-[220px]">
                      {supplier.name}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-sm text-gray-600 text-left">
                      {supplier.pic || '-'}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-sm text-gray-600 text-left">
                      {supplier.phone || '-'}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-sm text-gray-600 text-left">
                      {supplier.npwp || '-'}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-sm text-gray-600 text-left">
                      <span className="line-clamp-2">{supplier.address || '-'}</span>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-center sticky right-0 bg-white group-hover:bg-gray-50 z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]">
                      <div className="flex justify-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="min-w-[150px] rounded-xl border-slate-200 p-1.5 shadow-lg">
                            <DropdownMenuItem
                              className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer"
                              disabled={!canEdit}
                              onSelect={(e) => {
                                e.preventDefault();
                                onEdit(supplier);
                              }}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="rounded-lg px-3 py-2 text-sm text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer"
                              disabled={!canDelete}
                              onSelect={(e) => {
                                e.preventDefault();
                                onDelete(supplier);
                              }}
                            >
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="group">
                  <TableCell colSpan={100} className="px-4 py-16 text-center text-sm text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="rounded-full bg-slate-50 p-4 mb-2">
                        <Search className="h-8 w-8 text-slate-400" />
                      </div>
                      <p className="text-base font-semibold text-slate-900">Tidak ada data ditemukan</p>
                      <p className="text-sm text-slate-500">Belum ada data atau coba gunakan kata kunci pencarian lain.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
            </div>

      <div className="flex flex-col gap-4 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between px-1">
        <p>
          Showing {startData}-{endData} of {totalData} data
        </p>

        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-end gap-1 text-slate-800">
            <Button
              variant="ghost"
              className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              Previous
            </Button>

            {paginationItems.map((item, index) =>
              item === 'ellipsis' ? (
                <span key={`ellipsis-${index}`} className="px-1 text-sm text-slate-500">
                  ...
                </span>
              ) : (
                <Button
                  key={item}
                  variant="ghost"
                  className={cn(
                    'h-9 min-w-9 rounded-xl border px-3 text-sm font-medium shadow-none',
                    item === page
                      ? 'border-slate-200 bg-white text-slate-950 shadow-sm'
                      : 'border-transparent bg-transparent text-slate-700 hover:border-slate-200 hover:bg-white',
                  )}
                  onClick={() => onPageChange(item)}
                >
                  {item}
                </Button>
              ),
            )}

            <Button
              variant="ghost"
              className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
