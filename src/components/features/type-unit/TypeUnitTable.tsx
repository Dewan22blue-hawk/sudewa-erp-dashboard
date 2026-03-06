import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreVertical, Plus, Search } from 'lucide-react';
import type { PaginationMeta } from '@/@types/pagination.types';
import type { TypeUnit } from '@/@types/type-unit.types';
import { useTableSort } from '@/hooks/useTableSort';
import { SortableHeader } from '@/components/ui/sortable-header';
import { formatCurrency } from '@/lib/utils/currency';

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
  isLoading?: boolean;
}

export function TypeUnitTable({ typeUnits, meta, search, page, perPage, onSearchChange, onPageChange, onPerPageChange, onEdit, onDelete, onAdd, isLoading }: TypeUnitTableProps) {
  const totalPages = meta?.lastPage ?? Math.max(1, Math.ceil((meta?.total ?? typeUnits.length) / perPage));
  const hasData = (meta?.total ?? typeUnits.length) > 0;
  const startIndex = meta ? (page - 1) * perPage + 1 : 1;
  const endIndex = meta ? Math.min(page * perPage, meta.total) : typeUnits.length;

  const { sortedData, sortKey, sortOrder, handleSort } = useTableSort({
    data: typeUnits,
    defaultSortKey: 'code',
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search here" value={search} onChange={(e) => onSearchChange(e.target.value)} className="pl-9 bg-white" />
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-sm font-medium">Show</span>
            <Select value={perPage.toString()} onValueChange={(value) => onPerPageChange(Number(value))}>
              <SelectTrigger className="bg-white w-20">
                <SelectValue placeholder="25" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm font-medium">Page</span>
          </div>
        </div>

        <div className="flex w-full sm:w-auto justify-end">
          {onAdd && (
            <Button onClick={onAdd} className="bg-[#1f304f] hover:bg-[#1a2842] text-white whitespace-nowrap">
              <Plus className="mr-2 h-4 w-4" />
              Tambah
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold uppercase text-slate-700 h-12 w-[150px] pl-4">
                <SortableHeader title="KODE TIPE" sortKey="code" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} />
              </TableHead>
              <TableHead className="font-semibold uppercase text-slate-700 h-12 w-[180px]">
                <SortableHeader title="MERK" sortKey="brand.name" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} />
              </TableHead>
              <TableHead className="font-semibold uppercase text-slate-700 h-12 w-[220px]">
                <SortableHeader title="TIPE UNIT" sortKey="name" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} />
              </TableHead>
              <TableHead className="font-semibold uppercase text-slate-700 h-12 w-[150px]">
                <SortableHeader title="HARGA BELI" sortKey="purchasePrice" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} />
              </TableHead>
              <TableHead className="font-semibold uppercase text-slate-700 h-12 w-[150px]">
                <SortableHeader title="HARGA JUAL" sortKey="salePrice" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} />
              </TableHead>
              <TableHead className="font-semibold uppercase text-slate-700 h-12 w-[120px]">
                <SortableHeader title="JENIS" sortKey="unitType" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} />
              </TableHead>
              <TableHead className="font-semibold uppercase text-slate-700 h-12 w-[120px]">
                <SortableHeader title="MODEL" sortKey="unitModel" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} />
              </TableHead>
              <TableHead className="font-semibold uppercase text-slate-700 h-12 w-[120px]">
                <SortableHeader title="NETTO (KG)" sortKey="nettoWeight" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} />
              </TableHead>
              <TableHead className="font-semibold uppercase text-slate-700 h-12 w-[120px]">
                <SortableHeader title="BRUTO (KG)" sortKey="brutoWeight" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} />
              </TableHead>
              <TableHead className="text-right font-semibold uppercase text-slate-700 px-4">ACTION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : typeUnits.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                  Tidak ada data
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((item) => (
                <TableRow key={item.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-medium text-slate-800 uppercase pl-4 py-4">{item.code}</TableCell>
                  <TableCell className="text-slate-700 uppercase py-4">{item.brand?.name ?? item.brandId}</TableCell>
                  <TableCell className="font-medium text-slate-800 uppercase py-4">{item.name}</TableCell>
                  <TableCell className="text-slate-700 uppercase py-4">{(item as any).purchasePrice ? formatCurrency(Number((item as any).purchasePrice)) : '-'}</TableCell>
                  <TableCell className="text-slate-700 uppercase py-4">{(item as any).salePrice ? formatCurrency(Number((item as any).salePrice)) : '-'}</TableCell>
                  <TableCell className="text-slate-700 uppercase py-4">{item.unitType || '-'}</TableCell>
                  <TableCell className="text-slate-700 uppercase py-4">{item.unitModel || '-'}</TableCell>
                  <TableCell className="text-slate-700 uppercase py-4">{item.nettoWeight ?? '-'}</TableCell>
                  <TableCell className="text-slate-700 uppercase py-4">{item.brutoWeight ?? '-'}</TableCell>
                  <TableCell className="text-right pr-4 py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(item)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(item)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {typeUnits.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
          <div className="text-sm text-slate-500">
            Showing {hasData ? startIndex : 0} to {hasData ? endIndex : 0} of {meta?.total ?? typeUnits.length} entries
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1} className="h-8 px-3">
              Previous
            </Button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) pageNum = i + 1;
              else if (page <= 3) pageNum = i + 1;
              else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
              else pageNum = page - 2 + i;

              return (
                <Button key={pageNum} variant={page === pageNum ? 'default' : 'outline'} size="sm" onClick={() => onPageChange(pageNum)} className={`h-8 w-8 p-0 ${page === pageNum ? 'bg-[#1f304f] hover:bg-[#1a2842]' : ''}`}>
                  {pageNum}
                </Button>
              );
            })}

            {totalPages > 5 && page < totalPages - 2 && (
              <>
                <span className="px-2 text-slate-500">...</span>
                <Button variant="outline" size="sm" onClick={() => onPageChange(totalPages)} className="h-8 w-8 p-0">
                  {totalPages}
                </Button>
              </>
            )}

            <Button variant="outline" size="sm" onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="h-8 px-3">
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
