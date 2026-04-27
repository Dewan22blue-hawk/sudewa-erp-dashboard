import { CheckCircle2, Download, MoreVertical, Plus, Search, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DatePicker } from '@/components/ui/date-picker';
import { getVisiblePageNumbers } from '@/lib/api/pagination';
import type { VehicleData } from '@/@types/vehicle-data.types';
import { SearchableSelect, type SearchableSelectOption } from './SearchableSelect';

interface VehicleDataTableProps {
  items: VehicleData[];
  isLoading?: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  page: number;
  perPage: number;
  totalData: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  selectedIds: number[];
  assignedIds: number[];
  onSelectedIdsChange: (ids: number[]) => void;
  onAdd: () => void;
  onImport: () => void;
  onExport: () => void;
  onAssign: () => void;
  onDetail: (item: VehicleData) => void;
  onEdit: (item: VehicleData) => void;
  onDelete: (item: VehicleData) => void;
  isExporting?: boolean;
  filterDealerId: string;
  onFilterDealerIdChange: (value: string) => void;
  dealerOptions: SearchableSelectOption[];
  onDealerSearchChange: (value: string) => void;
  filterInvoiceDate?: Date;
  onFilterInvoiceDateChange: (value?: Date) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
}

const formatDate = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return format(date, 'dd/MM/yyyy');
};

export function VehicleDataTable({
  items,
  isLoading = false,
  search,
  onSearchChange,
  page,
  perPage,
  totalData,
  onPageChange,
  onPerPageChange,
  selectedIds,
  assignedIds,
  onSelectedIdsChange,
  onAdd,
  onImport,
  onExport,
  onAssign,
  onDetail,
  onEdit,
  onDelete,
  isExporting = false,
  filterDealerId,
  onFilterDealerIdChange,
  dealerOptions,
  onDealerSearchChange,
  filterInvoiceDate,
  onFilterInvoiceDateChange,
  onApplyFilters,
  onResetFilters,
}: VehicleDataTableProps) {
  const totalPages = Math.max(1, Math.ceil(totalData / perPage));
  const startData = totalData === 0 ? 0 : (page - 1) * perPage + 1;
  const endData = Math.min(page * perPage, totalData);
  const currentPageSelectableIds = items.filter((item) => !assignedIds.includes(item.id)).map((item) => item.id);
  const allSelected = currentPageSelectableIds.length > 0 && currentPageSelectableIds.every((id) => selectedIds.includes(id));
  const visiblePages = getVisiblePageNumbers(totalPages, page, 5);
  const assignedCountOnPage = items.filter((item) => assignedIds.includes(item.id)).length;
  const selectedPendingCount = selectedIds.filter((id) => !assignedIds.includes(id)).length;

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      const next = Array.from(new Set([...selectedIds, ...currentPageSelectableIds]));
      onSelectedIdsChange(next);
      return;
    }

    onSelectedIdsChange(selectedIds.filter((id) => !currentPageSelectableIds.includes(id)));
  };

  const handleSelectRow = (id: number, checked: boolean | 'indeterminate') => {
    if (checked === true) {
      onSelectedIdsChange(Array.from(new Set([...selectedIds, id])));
      return;
    }

    onSelectedIdsChange(selectedIds.filter((value) => value !== id));
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5 lg:grid-cols-[1.15fr_1.15fr_auto] lg:items-end">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800">Tanggal Faktur</label>
            <DatePicker value={filterInvoiceDate} onChange={onFilterInvoiceDateChange} placeholder="Pilih tanggal faktur" className="h-11 rounded-xl bg-white" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800">Nama Dealer</label>
            <SearchableSelect
              value={filterDealerId}
              onChange={onFilterDealerIdChange}
              options={dealerOptions}
              onSearchChange={onDealerSearchChange}
              placeholder="Pilih dealer"
              searchPlaceholder="Cari dealer..."
              emptyText="Dealer tidak ditemukan."
              className="h-11 rounded-xl bg-white"
            />
          </div>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <Button variant="outline" onClick={onResetFilters} className="h-11 rounded-xl px-5">
              Reset
            </Button>
            <Button onClick={onApplyFilters} className="h-11 rounded-xl bg-[#22c55e] px-5 hover:bg-[#16a34a]">
              Serahkan
            </Button>
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative w-full md:w-[325px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search here" className="h-11 rounded-xl border-slate-200 bg-white pl-10" />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <span>Show</span>
            <Select value={String(perPage)} onValueChange={(value) => onPerPageChange(Number(value))}>
              <SelectTrigger className="h-11 w-[90px] rounded-xl border-slate-200 bg-white">
                <SelectValue />
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

          <div className="flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {assignedIds.length} data sudah di-assign
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700">
              {selectedPendingCount} data siap di-assign
            </div>
            {assignedCountOnPage > 0 ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                {assignedCountOnPage} data di halaman ini sudah diproses
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 xl:justify-end">
          <Button variant="outline" onClick={onImport} className="h-11 rounded-xl px-4">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" onClick={onExport} disabled={isExporting} className="h-11 rounded-xl px-4">
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
          <Button variant="outline" onClick={onAssign} className="h-11 rounded-xl px-4" disabled={selectedPendingCount === 0}>
            Assign Ditlantas
          </Button>
          <Button onClick={onAdd} className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-slate-900 shadow-none hover:bg-slate-50">
            <Plus className="mr-2 h-4 w-4" />
            Tambah
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#eef3fa]">
              <TableRow className="border-slate-200 hover:bg-transparent">
                <TableHead className="w-14 px-4 py-4">
                  <Checkbox checked={allSelected} onCheckedChange={handleSelectAll} aria-label="Pilih semua data kendaraan" />
                </TableHead>
                <TableHead className="px-4 py-4 text-xs font-semibold uppercase text-slate-800">Dealer</TableHead>
                <TableHead className="px-4 py-4 text-xs font-semibold uppercase text-slate-800">Nama STNK</TableHead>
                <TableHead className="px-4 py-4 text-xs font-semibold uppercase text-slate-800">Wilayah</TableHead>
                <TableHead className="px-4 py-4 text-xs font-semibold uppercase text-slate-800">Tipe Motor</TableHead>
                <TableHead className="px-4 py-4 text-xs font-semibold uppercase text-slate-800">No Mesin</TableHead>
                <TableHead className="px-4 py-4 text-xs font-semibold uppercase text-slate-800">No Rangka</TableHead>
                <TableHead className="px-4 py-4 text-xs font-semibold uppercase text-slate-800">Tgl Faktur</TableHead>
                <TableHead className="px-4 py-4 text-xs font-semibold uppercase text-slate-800">Tgl Terima Faktur</TableHead>
                <TableHead className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-800">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: Math.min(perPage, 6) }).map((_, index) => (
                  <TableRow key={`loading-${index}`} className="animate-pulse border-slate-100">
                    {Array.from({ length: 10 }).map((__, cellIndex) => (
                      <TableCell key={cellIndex} className="px-4 py-4">
                        <div className="h-4 rounded bg-slate-100" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : items.length ? (
                items.map((item) => (
                  <TableRow key={item.id} className={assignedIds.includes(item.id) ? 'border-emerald-100 bg-emerald-50/40 hover:bg-emerald-50/60' : 'border-slate-200 hover:bg-slate-50/60'}>
                    <TableCell className="px-4 py-4">
                      <Checkbox
                        checked={assignedIds.includes(item.id) || selectedIds.includes(item.id)}
                        disabled={assignedIds.includes(item.id)}
                        onCheckedChange={(checked) => handleSelectRow(item.id, checked)}
                        aria-label={`Pilih data kendaraan ${item.invoiceNumber}`}
                      />
                    </TableCell>
                    <TableCell className="max-w-[220px] px-4 py-4 text-sm font-medium text-slate-700">
                      <div className="space-y-2">
                        <div className="line-clamp-2 uppercase">{item.dealer?.namaDealer || '-'}</div>
                        {assignedIds.includes(item.id) ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                            Sudah assign Ditlantas
                          </span>
                        ) : selectedIds.includes(item.id) ? (
                          <span className="inline-flex items-center rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-semibold text-sky-700">
                            Siap di-assign
                          </span>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-sm text-slate-700">{item.stnkName || '-'}</TableCell>
                    <TableCell className="px-4 py-4 text-sm text-slate-700">{item.region?.name || '-'}</TableCell>
                    <TableCell className="px-4 py-4 text-sm text-slate-700">{item.motorcycleType || item.motorcycleModel || '-'}</TableCell>
                    <TableCell className="px-4 py-4 text-sm text-slate-700">{item.machineNumber || '-'}</TableCell>
                    <TableCell className="px-4 py-4 text-sm text-slate-700">{item.chassisNumber || '-'}</TableCell>
                    <TableCell className="px-4 py-4 text-sm text-slate-700">{formatDate(item.invoiceDate)}</TableCell>
                    <TableCell className="px-4 py-4 text-sm text-slate-700">{formatDate(item.invoiceReceiveDate)}</TableCell>
                    <TableCell className="px-4 py-4 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4 text-slate-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[170px]">
                          <DropdownMenuItem onClick={() => onDetail(item)} className="cursor-pointer">Detail</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(item)} className="cursor-pointer">Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDelete(item)} className="cursor-pointer text-red-600 focus:text-red-600">Hapus</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="h-28 text-center text-sm text-slate-500">
                    Belum ada data kendaraan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <div className="flex flex-col gap-4 px-1 pb-2 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-slate-500">
          Showing {startData}-{endData} of {totalData} data
        </div>
        <div className="flex items-center gap-1 text-sm text-slate-700">
          <Button variant="ghost" size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="rounded-xl px-3">
            Previous
          </Button>
          {visiblePages[0] > 1 ? <span className="px-1 text-slate-400">...</span> : null}
          {visiblePages.map((pageNumber) => (
            <Button
              key={pageNumber}
              variant={pageNumber === page ? 'outline' : 'ghost'}
              size="sm"
              onClick={() => onPageChange(pageNumber)}
              className="h-9 min-w-9 rounded-xl border-slate-200"
            >
              {pageNumber}
            </Button>
          ))}
          {visiblePages[visiblePages.length - 1] < totalPages ? <span className="px-1 text-slate-400">...</span> : null}
          <Button variant="ghost" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className="rounded-xl px-3">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
