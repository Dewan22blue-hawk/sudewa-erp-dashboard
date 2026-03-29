import { useMemo } from 'react';
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
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm">Page</span>
        </div>

        <div className="w-full md:w-[280px]">
          <Input value={searchValue} onChange={(event) => onSearchChange(event.target.value)} placeholder="Cari warna/nomor mesin/nomor rangka" />
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[56px]">No</TableHead>
              <TableHead className="w-[56px] text-center">
                <Checkbox checked={allPageSelected} onCheckedChange={(checked) => onToggleAllPage(Boolean(checked))} aria-label="Pilih semua baris" />
              </TableHead>
              <TableHead>Warna</TableHead>
              <TableHead>Nomor Mesin</TableHead>
              <TableHead>Nomor Rangka</TableHead>
              <TableHead>Status Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-20 text-center text-muted-foreground">
                  Memuat stock unit...
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={6} className="h-20 text-center text-destructive">
                  Gagal memuat stock unit
                </TableCell>
              </TableRow>
            ) : pagedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-20 text-center text-muted-foreground">
                  Stock unit tidak tersedia
                </TableCell>
              </TableRow>
            ) : (
              pagedRows.map((row, index) => (
                <TableRow key={row.id}>
                  <TableCell>{(currentPage - 1) * perPage + index + 1}</TableCell>
                  <TableCell className="text-center">
                    <Checkbox checked={selectedIds.has(row.id)} onCheckedChange={(checked) => onToggleOne(row.id, Boolean(checked))} aria-label="Pilih baris" />
                  </TableCell>
                  <TableCell>{row.color}</TableCell>
                  <TableCell>{row.machine_number}</TableCell>
                  <TableCell>{row.chassis_number}</TableCell>
                  <TableCell>{row.in_stock ? 'In Stock' : 'Out Stock'}</TableCell>
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
