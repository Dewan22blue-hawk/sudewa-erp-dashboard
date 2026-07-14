import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreVertical, Plus, Search, Upload, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import type { PaginationMeta } from '@/@types/pagination.types';
import type { TypeUnit } from '@/@types/type-unit.types';
import { useTableSort } from '@/hooks/useTableSort';
import { formatCurrency } from '@/lib/utils/currency';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface TypeUnitTableProps {
  typeUnits: TypeUnit[];
  meta?: PaginationMeta;
  search: string;
  page: number;
  perPage: number;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onPerPageChange: (value: number) => void;
  onEdit: (typeUnit: TypeUnit) => void;
  onDelete: (typeUnit: TypeUnit) => void;
  onAdd?: () => void;
  onImport?: () => void;
  isLoading?: boolean;
}

function SortIcon({ sortKey, currentSortKey, sortOrder }: { sortKey: string; currentSortKey: string; sortOrder: any }) {
  const isActive = currentSortKey === sortKey;
  if (isActive && sortOrder === 'asc')
    return <ArrowUp className="h-3 w-3 text-indigo-500 shrink-0 transition-colors" />;
  if (isActive && sortOrder === 'desc')
    return <ArrowDown className="h-3 w-3 text-indigo-500 shrink-0 transition-colors" />;
  return <ArrowUpDown className="h-3 w-3 text-gray-400 shrink-0 opacity-0 group-hover:opacity-70 transition-opacity duration-150" />;
}

export function TypeUnitTable({ typeUnits, meta, search, page, perPage, onSearchChange, onPageChange, onPerPageChange, onEdit, onDelete, onAdd, onImport, isLoading }: TypeUnitTableProps) {
  const totalPages = meta?.lastPage ?? Math.max(1, Math.ceil((meta?.total ?? typeUnits.length) / perPage));
  const hasData = (meta?.total ?? typeUnits.length) > 0;
  const startIndex = meta ? (page - 1) * perPage + 1 : 1;
  const endIndex = meta ? Math.min(page * perPage, meta.total) : typeUnits.length;

  const { sortedData, sortKey, sortOrder, handleSort } = useTableSort({
    data: typeUnits,
    defaultSortKey: 'createdAt',
    defaultSortOrder: 'desc',
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search here" value={search} onChange={(e) => onSearchChange(e.target.value)} className="pl-9 bg-white" />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 whitespace-nowrap">
            <span>Show</span>
            <Select value={perPage.toString()} onValueChange={(value) => onPerPageChange(Number(value))}>
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
          {onImport && (
            <Button onClick={onImport} variant="outline" className="w-full sm:w-auto">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          )}
          {onAdd && (
            <Button onClick={onAdd} className="w-full sm:w-auto bg-[#1e3a5f] hover:bg-[#152e4d]">
              <Plus className="h-4 w-4 mr-2" />
              Tambah
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-none">
        <Table>
          <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
            <TableRow className="hover:bg-[#f8f9fa]">
              {/* KODE TIPE */}
              <TableHead
                className={cn(
                  'group px-4 py-4 text-left text-xs font-semibold uppercase cursor-pointer select-none transition-colors w-[130px]',
                  sortKey === 'code' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                )}
                onClick={() => handleSort('code')}
              >
                <div className="flex items-center gap-1">
                  KODE TIPE
                  <SortIcon sortKey="code" currentSortKey={sortKey as string} sortOrder={sortOrder} />
                </div>
              </TableHead>
              {/* MERK */}
              <TableHead
                className={cn(
                  'group px-4 py-4 text-left text-xs font-semibold uppercase cursor-pointer select-none transition-colors w-[150px]',
                  sortKey === ('brand.name' as any) ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                )}
                onClick={() => handleSort('brand.name' as any)}
              >
                <div className="flex items-center gap-1">
                  MEREK
                  <SortIcon sortKey="brand.name" currentSortKey={sortKey as string} sortOrder={sortOrder} />
                </div>
              </TableHead>
              {/* TIPE UNIT */}
              <TableHead
                className={cn(
                  'group px-4 py-4 text-left text-xs font-semibold uppercase cursor-pointer select-none transition-colors w-[180px]',
                  sortKey === 'name' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                )}
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  TIPE UNIT
                  <SortIcon sortKey="name" currentSortKey={sortKey as string} sortOrder={sortOrder} />
                </div>
              </TableHead>
              {/* JENIS */}
              <TableHead
                className={cn(
                  'group px-4 py-4 text-left text-xs font-semibold uppercase cursor-pointer select-none transition-colors w-[110px]',
                  sortKey === 'unitType' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                )}
                onClick={() => handleSort('unitType')}
              >
                <div className="flex items-center gap-1">
                  JENIS
                  <SortIcon sortKey="unitType" currentSortKey={sortKey as string} sortOrder={sortOrder} />
                </div>
              </TableHead>
              {/* MODEL */}
              <TableHead
                className={cn(
                  'group px-4 py-4 text-left text-xs font-semibold uppercase cursor-pointer select-none transition-colors w-[110px]',
                  sortKey === 'unitModel' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                )}
                onClick={() => handleSort('unitModel')}
              >
                <div className="flex items-center gap-1">
                  MODEL
                  <SortIcon sortKey="unitModel" currentSortKey={sortKey as string} sortOrder={sortOrder} />
                </div>
              </TableHead>
              {/* NETTO */}
              <TableHead
                className={cn(
                  'group px-4 py-4 text-center text-xs font-semibold uppercase cursor-pointer select-none transition-colors w-[110px]',
                  sortKey === 'nettoWeight' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                )}
                onClick={() => handleSort('nettoWeight')}
              >
                <div className="inline-flex items-center">
                  <span className="w-3 shrink-0" />
                  <span>NETTO (KG)</span>
                  <SortIcon sortKey="nettoWeight" currentSortKey={sortKey as string} sortOrder={sortOrder} />
                </div>
              </TableHead>
              {/* BRUTO */}
              <TableHead
                className={cn(
                  'group px-4 py-4 text-center text-xs font-semibold uppercase cursor-pointer select-none transition-colors w-[110px]',
                  sortKey === 'brutoWeight' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                )}
                onClick={() => handleSort('brutoWeight')}
              >
                <div className="inline-flex items-center">
                  <span className="w-3 shrink-0" />
                  <span>BRUTO (KG)</span>
                  <SortIcon sortKey="brutoWeight" currentSortKey={sortKey as string} sortOrder={sortOrder} />
                </div>
              </TableHead>
              {/* HARGA BELI */}
              <TableHead
                className={cn(
                  'group px-4 py-4 text-center text-xs font-semibold uppercase cursor-pointer select-none transition-colors w-[130px]',
                  sortKey === 'buyPrice' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                )}
                onClick={() => handleSort('buyPrice')}
              >
                <div className="flex items-center justify-center gap-1">
                  HARGA BELI
                  <SortIcon sortKey="buyPrice" currentSortKey={sortKey as string} sortOrder={sortOrder} />
                </div>
              </TableHead>
              {/* HARGA JUAL */}
              <TableHead
                className={cn(
                  'group px-4 py-4 text-center text-xs font-semibold uppercase cursor-pointer select-none transition-colors w-[130px]',
                  sortKey === 'sellPrice' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                )}
                onClick={() => handleSort('sellPrice')}
              >
                <div className="flex items-center justify-center gap-1">
                  HARGA JUAL
                  <SortIcon sortKey="sellPrice" currentSortKey={sortKey as string} sortOrder={sortOrder} />
                </div>
              </TableHead>
              {/* ACTION */}
              <TableHead className="w-[80px] px-4 py-4 text-center text-xs font-semibold text-slate-500 uppercase sticky right-0 bg-[#f8f9fa] z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]">ACTION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(perPage)].map((_, i) => (
                <TableRow key={i} className="bg-white hover:bg-slate-50 transition-colors">
                  <TableCell className="px-4 py-4"><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell className="px-4 py-4"><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell className="px-4 py-4"><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell className="px-4 py-4"><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell className="px-4 py-4"><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell className="px-4 py-4 text-center"><Skeleton className="h-4 w-10 mx-auto" /></TableCell>
                  <TableCell className="px-4 py-4 text-center"><Skeleton className="h-4 w-10 mx-auto" /></TableCell>
                  <TableCell className="px-4 py-4 text-center"><Skeleton className="h-4 w-20 mx-auto" /></TableCell>
                  <TableCell className="px-4 py-4 text-center"><Skeleton className="h-4 w-20 mx-auto" /></TableCell>
                  <TableCell className="px-4 py-4 text-center sticky right-0 bg-white group-hover:bg-slate-50 z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]"><Skeleton className="h-8 w-8 mx-auto rounded-full" /></TableCell>
                </TableRow>
              ))
            ) : typeUnits.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-gray-550 py-10 text-sm">
                  Tidak ada data.
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((item) => (
                <TableRow key={item.id} className="bg-white hover:bg-slate-50 transition-colors">
                  <TableCell className="px-4 py-4 text-sm font-medium text-gray-900 text-left uppercase">{item.code}</TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 text-left uppercase">{item.brand?.name ?? item.brandId}</TableCell>
                  <TableCell className="px-4 py-4 text-sm font-medium text-gray-900 text-left uppercase">{item.name}</TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 text-left uppercase">{item.unitType || '-'}</TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 text-left uppercase">{item.unitModel || '-'}</TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 text-center">{item.nettoWeight ?? '-'}</TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 text-center">{item.brutoWeight ?? '-'}</TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 text-center">{item.buyPrice !== null && item.buyPrice !== undefined ? formatCurrency(item.buyPrice) : '-'}</TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 text-center">{item.sellPrice !== null && item.sellPrice !== undefined ? formatCurrency(item.sellPrice) : '-'}</TableCell>
                  <TableCell className="px-4 py-4 text-center sticky right-0 bg-white group-hover:bg-slate-50 z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]">
                    <div className="flex justify-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8 p-0 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-[150px] rounded-xl border-slate-200 p-1.5 shadow-lg">
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
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {typeUnits.length > 0 && (
        <div className="flex flex-col gap-4 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between px-1">
          <div>
            Showing {hasData ? startIndex : 0} to {hasData ? endIndex : 0} of {meta?.total ?? typeUnits.length} entries
          </div>
          <div className="flex flex-wrap items-center justify-end gap-1 text-slate-800">
            <Button variant="ghost" size="sm" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1} className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300">
              Previous
            </Button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) pageNum = i + 1;
              else if (page <= 3) pageNum = i + 1;
              else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
              else pageNum = page - 2 + i;

              return (
                <Button
                  key={pageNum}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-9 min-w-9 rounded-xl border px-3 text-sm font-medium shadow-none',
                    page === pageNum
                      ? 'border-slate-200 bg-white text-slate-950 shadow-sm'
                      : 'border-transparent bg-transparent text-slate-700 hover:border-slate-200 hover:bg-white',
                  )}
                  onClick={() => onPageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}

            {totalPages > 5 && page < totalPages - 2 && (
              <>
                <span className="px-1 text-sm text-slate-500">...</span>
                <Button variant="ghost" size="sm" onClick={() => onPageChange(totalPages)} className="h-9 min-w-9 rounded-xl border border-transparent px-3 text-sm font-medium text-slate-700 hover:border-slate-200 hover:bg-white">
                  {totalPages}
                </Button>
              </>
            )}

            <Button variant="ghost" size="sm" onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300">
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
