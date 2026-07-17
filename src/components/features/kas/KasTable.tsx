import { useState, useMemo } from 'react';
import { Kas } from '@/@types/kas.types';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTableSort } from '@/hooks/useTableSort';
import { ArrowUp, ArrowDown, ArrowUpDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { CopyBox } from '@/components/ui/copy-box';
import { currenciesFormat } from '@/components/ui/currenciesFormat';

const KAS_NAME_MAP: Record<string, string> = {
  bca_usd: 'BANK BCA USD',
  bca_idr: 'BANK BCA IDR',
  cash_idr: 'CASH IDR',
};

const getKasName = (code: string) => {
  const key = code.trim().toLowerCase();
  if (key in KAS_NAME_MAP) return KAS_NAME_MAP[key];
  return code.replace(/_/g, ' ').toUpperCase();
};

interface Props {
  data: Kas[];
}

function SortIcon({ sortKey, currentSortKey, sortOrder }: { sortKey: string; currentSortKey: string; sortOrder: any }) {
  const isActive = currentSortKey === sortKey;
  if (isActive && sortOrder === 'asc')
    return <ArrowUp className="h-3 w-3 text-indigo-500 shrink-0 transition-colors" />;
  if (isActive && sortOrder === 'desc')
    return <ArrowDown className="h-3 w-3 text-indigo-500 shrink-0 transition-colors" />;
  return <ArrowUpDown className="h-3 w-3 text-gray-400 shrink-0 opacity-0 group-hover:opacity-70 transition-opacity duration-150" />;
}

export function KasTable({ data }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const enrichedData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      name: getKasName(item.code),
    }));
  }, [data]);

  const [search, setSearch] = useState('');

  const filteredData = useMemo(() => {
    if (!search) return enrichedData;
    const lower = search.toLowerCase();
    return enrichedData.filter(
      (item) =>
        item.code.toLowerCase().includes(lower) ||
        item.name.toLowerCase().includes(lower)
    );
  }, [enrichedData, search]);

  const { sortedData, sortKey, sortOrder, handleSort } = useTableSort({
    data: filteredData,
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

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search here"
              className="pl-9 bg-white"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500 whitespace-nowrap">
            <span>Show</span>
            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
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
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-none">
        <Table>
          <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
            <TableRow className="hover:bg-[#f8f9fa]">
              {/* Kode Kas */}
              <TableHead
                className={cn(
                  'group px-4 py-4 text-left text-xs font-semibold uppercase cursor-pointer select-none transition-colors w-[20%]',
                  sortKey === 'code' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                )}
                onClick={() => handleSort('code')}
              >
                <div className="flex items-center gap-1">
                  Kode Kas
                  <SortIcon sortKey="code" currentSortKey={sortKey as string} sortOrder={sortOrder} />
                </div>
              </TableHead>
              {/* Nama */}
              <TableHead
                className={cn(
                  'group px-4 py-4 text-left text-xs font-semibold uppercase cursor-pointer select-none transition-colors w-[30%]',
                  sortKey === 'name' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                )}
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  Nama
                  <SortIcon sortKey="name" currentSortKey={sortKey as string} sortOrder={sortOrder} />
                </div>
              </TableHead>
              {/* Deskripsi */}
              <TableHead
                className={cn(
                  'group px-4 py-4 text-left text-xs font-semibold uppercase cursor-pointer select-none transition-colors w-[35%]',
                  sortKey === 'description' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                )}
                onClick={() => handleSort('description')}
              >
                <div className="flex items-center gap-1">
                  Deskripsi
                  <SortIcon sortKey="description" currentSortKey={sortKey as string} sortOrder={sortOrder} />
                </div>
              </TableHead>
              {/* Jumlah Nominal */}
              <TableHead
                className={cn(
                  'group px-4 py-4 text-left text-xs font-semibold uppercase cursor-pointer select-none transition-colors w-[35%]',
                  sortKey === 'amount' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                )}
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center gap-1">
                  Jumlah Nominal
                  <SortIcon sortKey="amount" currentSortKey={sortKey as string} sortOrder={sortOrder} />
                </div>
              </TableHead>
              {/* Jenis */}
              <TableHead
                className={cn(
                  'group px-4 py-4 text-left text-xs font-semibold uppercase cursor-pointer select-none transition-colors w-[15%]',
                  sortKey === 'type' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                )}
                onClick={() => handleSort('type')}
              >
                <div className="flex items-center gap-1">
                  Jenis
                  <SortIcon sortKey="type" currentSortKey={sortKey as string} sortOrder={sortOrder} />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length === 0 ? (
              <TableRow className="group">
                <TableCell colSpan={100} className="text-center text-gray-505 py-16 text-sm">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="rounded-full bg-slate-50 p-4 mb-2">
                      <Search className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-base font-semibold text-slate-900">Tidak ada data ditemukan</p>
                    <p className="text-sm text-slate-500">Belum ada data atau coba gunakan kata kunci pencarian lain.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              currentData.map((item) => (
                <TableRow key={item.id} className="group hover:bg-gray-50 transition-colors">
                  <TableCell className="px-4 py-4 text-sm font-semibold text-gray-900 text-left">
                    <CopyBox text={item.code} />
                  </TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-900 text-left">{item.name}</TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 text-left">{item.description || '-'}</TableCell>
                  <TableCell className="px-4 py-4 text-sm font-semibold text-gray-600 text-left">
                    {item.code === 'bca_usd' ? currenciesFormat('usd', item.amount ? Number(item.amount) : 0) : currenciesFormat('idr', item.amount ? Number(item.amount) : 0)}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 text-left">{item.type === 'cash' ? 'Cash' : 'Bank'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {data.length > 0 && (
        <div className="flex flex-col gap-4 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between px-1">
          <div>
            Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of {data.length} entries
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
