import type { Supplier } from '@/@types/supplier.types';
import type { Supplier } from '@/@types/supplier.types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Download, MoreVertical, Plus, Search, Upload } from 'lucide-react';
import { useTableSort } from '@/hooks/useTableSort';

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
}: SupplierTableProps) {
  const { sortedData, sortKey, sortOrder, handleSort } = useTableSort({
    data: suppliers,
    data: suppliers,
  });

  const startData = totalData === 0 ? 0 : (page - 1) * perPage + 1;
  const endData = totalData === 0 ? 0 : Math.min(page * perPage, totalData);
  const paginationItems = buildPagination(page, totalPages);
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
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span>Page</span>
            <span>Page</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="w-full sm:w-auto" onClick={onImport}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" className="w-full sm:w-auto" onClick={onExport} disabled={isExporting}>
            <Upload className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
          <Button className="w-full sm:w-auto bg-[#1e3a5f] hover:bg-[#152e4d]" onClick={onAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden rounded-xl border border-[#D4D4D8] bg-white shadow-none">
        <div className="overflow-x-auto">
          <Table>
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
                <TableHead className="w-[80px] px-4 py-4 text-center text-xs font-semibold text-slate-500 uppercase">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                Array.from({ length: Math.max(3, perPage > 3 ? 3 : perPage) }).map((_, index) => (
                  <TableRow key={index} className="border-b border-[#E4E4E7]">
                    <TableCell colSpan={7} className="px-7 py-5">
                      <div className="h-10 animate-pulse rounded-lg bg-[#F4F4F5]" />
                    </TableCell>
                  </TableRow>
                ))
              ) : sortedData.length > 0 ? (
                sortedData.map((supplier) => (
                  <TableRow key={supplier.id} className="border-b border-[#E4E4E7] align-top hover:bg-[#FAFAFA]">
                    <TableCell className="px-7 py-4 text-center text-[15px] font-medium leading-6 text-[#171717]">
                      <div className="mx-auto max-w-[160px] break-words">{supplier.code || '-'}</div>
                    </TableCell>
                    <TableCell className="px-7 py-4 text-center text-[15px] font-medium uppercase leading-6 text-[#171717]">
                      <div className="mx-auto max-w-[220px] break-words">{supplier.name}</div>
                    </TableCell>
                    <TableCell className="px-7 py-4 text-center text-[15px] leading-6 text-[#171717]">
                      <div className="mx-auto max-w-[140px] break-words">{supplier.pic || '-'}</div>
                    </TableCell>
                    <TableCell className="px-7 py-4 text-center text-[15px] leading-6 text-[#171717]">
                      <div className="mx-auto max-w-[140px] break-words">{supplier.phone || '-'}</div>
                    </TableCell>
                    <TableCell className="px-7 py-4 text-center text-[15px] leading-6 text-[#171717]">
                      <div className="mx-auto max-w-[180px] break-words">{supplier.npwp || '-'}</div>
                    </TableCell>
                    <TableCell className="px-7 py-4 text-center text-[15px] leading-6 text-[#171717]">
                      <div className="mx-auto max-w-[240px] whitespace-pre-line break-words">{supplier.address || '-'}</div>
                    </TableCell>
                    <TableCell className="px-7 py-4 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-[#171717] hover:bg-[#F4F4F5]">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[150px] rounded-2xl border-[#E4E4E7] p-2 shadow-lg">
                          <DropdownMenuItem
                            className="cursor-pointer rounded-xl px-3 py-2 text-[15px]"
                            onSelect={(e) => {
                              e.preventDefault();
                              onEdit(supplier);
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer rounded-xl px-3 py-2 text-[15px] text-[#DC2626] focus:text-[#DC2626]"
                            onSelect={(e) => {
                              e.preventDefault();
                              onDelete(supplier);
                            }}
                          >
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="px-7 py-16 text-center text-[15px] text-[#71717A]">
                    Belum ada data supplier untuk company aktif
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <div className="flex flex-col gap-4 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between px-1">
        <p>
          Showing {startData}-{endData} of {totalData} data
        </p>

        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-end gap-1 text-[#171717]">
            <Button
              variant="ghost"
              className="h-9 rounded-xl px-3 text-[15px] font-normal text-[#171717] hover:bg-transparent disabled:text-[#A1A1AA]"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              Previous
            </Button>

            {paginationItems.map((item, index) =>
              item === 'ellipsis' ? (
                <span key={`ellipsis-${index}`} className="px-3 text-[15px] text-[#171717]">
                  ...
                </span>
              ) : (
                <Button
                  key={item}
                  variant="ghost"
                  className={cn(
                    'h-9 min-w-9 rounded-xl border border-transparent px-3 text-[15px] font-normal text-[#171717] hover:bg-transparent',
                    item === page && 'border-[#D4D4D8] bg-white shadow-sm hover:bg-white',
                  )}
                  onClick={() => onPageChange(item)}
                >
                  {item}
                </Button>
              ),
            )}

            <Button
              variant="ghost"
              className="h-9 rounded-xl px-3 text-[15px] font-normal text-[#171717] hover:bg-transparent disabled:text-[#A1A1AA]"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
        )}
    </div>
    </div >
  );
}
