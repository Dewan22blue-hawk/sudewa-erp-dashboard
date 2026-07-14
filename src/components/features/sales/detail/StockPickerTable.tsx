import { ReactNode, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { WarehouseStockUnit } from '@/@types/unit-transaction.types';

interface StockPickerTableProps {
  units: WarehouseStockUnit[];
  selectedIds: Set<number>;
  onToggleOne: (id: number, checked: boolean) => void;
  onToggleAllPage: (checked: boolean) => void;
  currentPage: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (value: number) => void;
  isLoading?: boolean;
  isError?: boolean;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchAction?: ReactNode;
}

export function StockPickerTable({
  units,
  selectedIds,
  onToggleOne,
  onToggleAllPage,
  currentPage,
  perPage,
  onPageChange,
  onPerPageChange,
  isLoading,
  isError,
  searchValue,
  onSearchChange,
  searchAction,
}: StockPickerTableProps) {
  const filteredUnits = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) return units;

    return units.filter((item) => {
      return [item.color, item.machine_number, item.chassis_number].some((field) => String(field ?? '').toLowerCase().includes(query));
    });
  }, [units, searchValue]);

  const totalPages = Math.max(1, Math.ceil(filteredUnits.length / perPage));
  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filteredUnits.slice(start, start + perPage);
  }, [filteredUnits, currentPage, perPage]);

  const allPageSelected = pagedRows.length > 0 && pagedRows.every((item) => selectedIds.has(item.id));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">Show</span>
          <Select
            value={String(perPage)}
            onValueChange={(value) => {
              onPerPageChange(Number(value));
              onPageChange(1);
            }}
          >
            <SelectTrigger className="h-9 w-20 bg-white">
              <SelectValue placeholder="25" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm">Page</span>
        </div>

        <div className="flex w-full items-center gap-2 md:w-auto">
          <div className="w-full md:w-[280px]">
            <Input value={searchValue} onChange={(event) => onSearchChange(event.target.value)} placeholder="Cari warna/nomor mesin/nomor rangka" />
          </div>
          {searchAction}
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
            <TableRow>
              <TableHead className="w-[60px] text-center text-xs font-semibold uppercase text-slate-500 px-4 py-4">No</TableHead>
              <TableHead className="w-[50px] text-center text-xs font-semibold uppercase text-slate-500 px-4 py-4">
                <Checkbox checked={allPageSelected} onCheckedChange={(checked) => onToggleAllPage(Boolean(checked))} aria-label="Pilih semua baris" />
              </TableHead>
              <TableHead className="text-left text-xs font-semibold uppercase text-slate-500 px-4 py-4">Warna</TableHead>
              <TableHead className="text-left text-xs font-semibold uppercase text-slate-500 px-4 py-4">Nomor Mesin</TableHead>
              <TableHead className="text-left text-xs font-semibold uppercase text-slate-500 px-4 py-4">Nomor Rangka</TableHead>
              <TableHead className="text-center text-xs font-semibold uppercase text-slate-500 px-4 py-4">Status Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow className="group">
                <TableCell colSpan={6} className="h-20 text-center text-muted-foreground px-4 py-4 text-sm">
                  Memuat stock unit...
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow className="group">
                <TableCell colSpan={6} className="h-20 text-center text-destructive px-4 py-4 text-sm">
                  Gagal memuat stock unit
                </TableCell>
              </TableRow>
            ) : pagedRows.length === 0 ? (
              <TableRow className="group">
                <TableCell colSpan={6} className="h-20 text-center text-muted-foreground px-4 py-4 text-sm">
                  Stock unit tidak tersedia
                </TableCell>
              </TableRow>
            ) : (
              pagedRows.map((row, index) => (
                <TableRow key={row.id} className="group border-b hover:bg-gray-50/70 border-slate-100 transition-colors">
                  <TableCell className="text-center px-4 py-4 text-sm text-slate-500">{(currentPage - 1) * perPage + index + 1}</TableCell>
                  <TableCell className="text-center px-4 py-4">
                    <Checkbox checked={selectedIds.has(row.id)} onCheckedChange={(checked) => onToggleOne(row.id, Boolean(checked))} aria-label="Pilih baris" />
                  </TableCell>
                  <TableCell className="text-left px-4 py-4 text-sm text-slate-700">{row.color}</TableCell>
                  <TableCell className="text-left px-4 py-4 text-sm text-slate-700 font-medium">{row.machine_number}</TableCell>
                  <TableCell className="text-left px-4 py-4 text-sm text-slate-700">{row.chassis_number}</TableCell>
                  <TableCell className="text-center px-4 py-4 text-sm text-slate-700">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${row.in_stock ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                      {row.in_stock ? 'In Stock' : 'Out Stock'}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filteredUnits.length === 0 ? 0 : (currentPage - 1) * perPage + 1}-{Math.min(currentPage * perPage, filteredUnits.length)} of {filteredUnits.length} data
        </span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
            Previous
          </Button>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            {currentPage}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
