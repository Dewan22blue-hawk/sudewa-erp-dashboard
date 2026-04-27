import { Download, MoreVertical, Plus, Search, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getVisiblePageNumbers } from '@/lib/api/pagination';
import type { VehicleDocumentSummary } from '@/@types/vehicle-document.types';

interface Props {
  items: VehicleDocumentSummary[];
  search: string;
  isLoading?: boolean;
  page: number;
  perPage: number;
  totalData: number;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onPerPageChange: (value: number) => void;
  onAdd: () => void;
  onImport: () => void;
  onExport: () => void;
  onEdit: (item: VehicleDocumentSummary) => void;
  onDelete: (item: VehicleDocumentSummary) => void;
  isExporting?: boolean;
}

const formatDate = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, 'dd/MM/yyyy');
};

export function VehicleDocumentTable({
  items,
  search,
  isLoading = false,
  page,
  perPage,
  totalData,
  onSearchChange,
  onPageChange,
  onPerPageChange,
  onAdd,
  onImport,
  onExport,
  onEdit,
  onDelete,
  isExporting = false,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(totalData / perPage));
  const visiblePages = getVisiblePageNumbers(totalPages, page, 5);
  const startData = totalData === 0 ? 0 : (page - 1) * perPage + 1;
  const endData = Math.min(page * perPage, totalData);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative w-full md:w-[380px]">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search here" className="h-11 rounded-xl border-slate-200 bg-white pl-11" />
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

        <div className="flex flex-wrap gap-2 xl:justify-end">
          <Button variant="outline" onClick={onImport} className="h-11 rounded-xl px-4">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" onClick={onExport} disabled={isExporting} className="h-11 rounded-xl px-4">
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
          <Button onClick={onAdd} className="h-11 rounded-xl bg-[#1f3b5b] px-5 hover:bg-[#18304a]">
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
                <TableHead className="px-6 py-4 text-xs font-semibold uppercase text-slate-800">Kode Penerimaan</TableHead>
                <TableHead className="px-6 py-4 text-xs font-semibold uppercase text-slate-800">Vendor</TableHead>
                <TableHead className="px-6 py-4 text-xs font-semibold uppercase text-slate-800">Tgl Terima</TableHead>
                <TableHead className="px-6 py-4 text-xs font-semibold uppercase text-slate-800">Keterangan</TableHead>
                <TableHead className="px-6 py-4 text-center text-xs font-semibold uppercase text-slate-800">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: Math.min(perPage, 6) }).map((_, rowIndex) => (
                  <TableRow key={rowIndex} className="animate-pulse border-slate-100">
                    {Array.from({ length: 5 }).map((__, cellIndex) => (
                      <TableCell key={cellIndex} className="px-6 py-4">
                        <div className="h-4 rounded bg-slate-100" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : items.length ? (
                items.map((item) => (
                  <TableRow key={item.id} className="border-slate-200 hover:bg-slate-50/70">
                    <TableCell className="px-6 py-4 text-sm font-medium text-slate-800">{item.code || '-'}</TableCell>
                    <TableCell className="px-6 py-4 text-sm text-slate-700">{item.vendor?.name || '-'}</TableCell>
                    <TableCell className="px-6 py-4 text-sm text-slate-700">{formatDate(item.receiptDate)}</TableCell>
                    <TableCell className="max-w-[320px] px-6 py-4 text-sm text-slate-700">{item.description || '-'}</TableCell>
                    <TableCell className="px-6 py-4 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4 text-slate-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuItem onClick={() => onEdit(item)} className="cursor-pointer">Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDelete(item)} className="cursor-pointer text-red-600 focus:text-red-600">Hapus</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-28 text-center text-sm text-slate-500">
                    Belum ada data penerimaan BPKB/STNK.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <div className="flex flex-col gap-4 px-1 pb-2 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-slate-500">Showing {startData}-{endData} of {totalData} data</div>
        <div className="flex items-center gap-1 text-sm text-slate-700">
          <Button variant="ghost" size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="rounded-xl px-3">Previous</Button>
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
          <Button variant="ghost" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className="rounded-xl px-3">Next</Button>
        </div>
      </div>
    </div>
  );
}
