import { useMemo, useState } from 'react';
import { Sparepart } from '@/@types/sparepart.types';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreVertical, Plus, Search, Upload, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { useTableSort } from '@/hooks/useTableSort';
import { formatCurrency } from '@/lib/utils/currency';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  data: Sparepart[];
  onEdit: (item: Sparepart) => void;
  onDelete: (item: Sparepart) => void;
  onAdd?: () => void;
  onImport?: () => void;
}

function SortIcon({ sortKey, currentSortKey, sortOrder }: { sortKey: string; currentSortKey: string; sortOrder: any }) {
  const isActive = currentSortKey === sortKey;
  if (isActive && sortOrder === 'asc')
    return <ArrowUp className="h-3 w-3 text-indigo-500 shrink-0 transition-colors" />;
  if (isActive && sortOrder === 'desc')
    return <ArrowDown className="h-3 w-3 text-indigo-500 shrink-0 transition-colors" />;
  return <ArrowUpDown className="h-3 w-3 text-gray-400 shrink-0 opacity-0 group-hover:opacity-70 transition-opacity duration-150" />;
}

export function SparepartTable({ data, onEdit, onDelete, onAdd, onImport }: Props) {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredData = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return data;

    return data.filter((item) =>
      [item.code, item.name, item.category?.name, item.group, item.unitType]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [data, search]);

  const { sortedData, sortKey, sortOrder, handleSort } = useTableSort({
    data: filteredData,
    defaultSortKey: 'code',
    defaultSortOrder: 'asc',
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Reset to page 1 on page size change
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search here"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setCurrentPage(1);
              }}
              className="bg-white pl-9"
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500 whitespace-nowrap">
            <span>Show</span>
            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-[70px] bg-white">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
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
              {/* KODE SPAREPART */}
              <TableHead
                className={cn(
                  'group px-4 py-4 text-left text-xs font-semibold uppercase cursor-pointer select-none transition-colors w-[180px]',
                  sortKey === 'code' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                )}
                onClick={() => handleSort('code')}
              >
                <div className="flex items-center gap-1">
                  KODE SPAREPART
                  <SortIcon sortKey="code" currentSortKey={sortKey as string} sortOrder={sortOrder} />
                </div>
              </TableHead>
              {/* NAMA SPAREPART */}
              <TableHead
                className={cn(
                  'group px-4 py-4 text-left text-xs font-semibold uppercase cursor-pointer select-none transition-colors w-[250px]',
                  sortKey === 'name' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                )}
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  NAMA SPAREPART
                  <SortIcon sortKey="name" currentSortKey={sortKey as string} sortOrder={sortOrder} />
                </div>
              </TableHead>
              {/* GRUP SPAREPART */}
              <TableHead
                className={cn(
                  'group px-4 py-4 text-left text-xs font-semibold uppercase cursor-pointer select-none transition-colors w-[180px]',
                  sortKey === ('category.name' as any) ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                )}
                onClick={() => handleSort('category.name' as any)}
              >
                <div className="flex items-center gap-1">
                  GRUP SPAREPART
                  <SortIcon sortKey="category.name" currentSortKey={sortKey as string} sortOrder={sortOrder} />
                </div>
              </TableHead>
              {/* SATUAN */}
              <TableHead
                className={cn(
                  'group px-4 py-4 text-center text-xs font-semibold uppercase cursor-pointer select-none transition-colors w-[120px]',
                  sortKey === 'unitType' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                )}
                onClick={() => handleSort('unitType')}
              >
                <div className="inline-flex items-center">
                  <span className="w-3 shrink-0" />
                  <span>SATUAN</span>
                  <SortIcon sortKey="unitType" currentSortKey={sortKey as string} sortOrder={sortOrder} />
                </div>
              </TableHead>
              {/* HARGA BELI */}
              <TableHead
                className={cn(
                  'group px-4 py-4 text-left text-xs font-semibold uppercase cursor-pointer select-none transition-colors w-[150px]',
                  sortKey === 'purchasePrice' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                )}
                onClick={() => handleSort('purchasePrice')}
              >
                <div className="flex items-center gap-1">
                  HARGA BELI
                  <SortIcon sortKey="purchasePrice" currentSortKey={sortKey as string} sortOrder={sortOrder} />
                </div>
              </TableHead>
              {/* HARGA JUAL */}
              <TableHead
                className={cn(
                  'group px-4 py-4 text-left text-xs font-semibold uppercase cursor-pointer select-none transition-colors w-[150px]',
                  sortKey === 'sellingPrice' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                )}
                onClick={() => handleSort('sellingPrice')}
              >
                <div className="flex items-center gap-1">
                  HARGA JUAL
                  <SortIcon sortKey="sellingPrice" currentSortKey={sortKey as string} sortOrder={sortOrder} />
                </div>
              </TableHead>
              {/* ACTION */}
              <TableHead className="w-[80px] px-4 py-4 text-center text-xs font-semibold text-slate-500 uppercase">ACTION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-505 py-10 text-sm">
                  Tidak ada data.
                </TableCell>
              </TableRow>
            ) : (
              currentData.map((item) => (
                <TableRow key={item.id} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="px-4 py-4 text-sm font-medium text-gray-900 text-left uppercase">{item.code}</TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-900 text-left">{item.name}</TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 text-left uppercase">{item.category?.name || item.group || '-'}</TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 text-center uppercase">{item.unitType}</TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 text-left">{formatCurrency(item.purchasePrice ?? item.price)}</TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 text-left">{formatCurrency(item.sellingPrice ?? item.price)}</TableCell>
                  <TableCell className="px-4 py-4 text-center">
                    <div className="flex justify-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8 p-0 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-[150px] rounded-xl border-slate-200 p-1.5 shadow-lg">
                          <DropdownMenuItem onClick={() => onEdit(item)} className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer">Edit</DropdownMenuItem>
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
      {filteredData.length > 0 && (
        <div className="flex flex-col gap-4 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between px-1">
          <div>
            Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
          </div>
          <div className="flex flex-wrap items-center justify-end gap-1 text-slate-800">
            <Button variant="ghost" size="sm" onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1} className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300">
              Previous
            </Button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) pageNum = i + 1;
              else if (currentPage <= 3) pageNum = i + 1;
              else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
              else pageNum = currentPage - 2 + i;

              return (
                <Button
                  key={pageNum}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-9 min-w-9 rounded-xl border px-3 text-sm font-medium shadow-none',
                    currentPage === pageNum
                      ? 'border-slate-200 bg-white text-slate-950 shadow-sm'
                      : 'border-transparent bg-transparent text-slate-700 hover:border-slate-200 hover:bg-white',
                  )}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                <span className="px-1 text-sm text-slate-500">...</span>
                <Button variant="ghost" size="sm" onClick={() => setCurrentPage(totalPages)} className="h-9 min-w-9 rounded-xl border border-transparent px-3 text-sm font-medium text-slate-700 hover:border-slate-200 hover:bg-white">
                  {totalPages}
                </Button>
              </>
            )}

            <Button variant="ghost" size="sm" onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300">
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
