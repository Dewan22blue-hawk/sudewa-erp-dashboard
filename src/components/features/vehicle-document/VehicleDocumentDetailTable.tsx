import { format } from 'date-fns';
import { Pencil, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getVisiblePageNumbers } from '@/lib/api/pagination';
import type { VehicleDocumentItem } from '@/@types/vehicle-document.types';

interface Props {
  items: VehicleDocumentItem[];
  search: string;
  isLoading?: boolean;
  page: number;
  perPage: number;
  totalData: number;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onPerPageChange: (value: number) => void;
  onEdit: (item: VehicleDocumentItem) => void;
}

const formatDate = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, 'dd/MM/yy');
};

export function VehicleDocumentDetailTable({ items, search, isLoading = false, page, perPage, totalData, onSearchChange, onPageChange, onPerPageChange, onEdit }: Props) {
  const totalPages = Math.max(1, Math.ceil(totalData / perPage));
  const visiblePages = getVisiblePageNumbers(totalPages, page, 5);
  const startData = totalData === 0 ? 0 : (page - 1) * perPage + 1;
  const endData = Math.min(page * perPage, totalData);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search here" className="pl-9 bg-white" />
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
      </div>

      <div className="overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[#f8f9fa] border-b border-gray-200 text-slate-500">
              <tr className="align-top text-xs font-semibold uppercase">
                <th className="px-4 py-4 text-left">Dealer</th>
                <th className="px-4 py-4 text-left">Nama</th>
                <th className="px-4 py-4 text-left">Wilayah</th>
                <th className="px-4 py-4 text-left">No Mesin</th>
                <th className="px-4 py-4 text-center">Tgl Terima Faktur</th>
                <th className="px-4 py-4 text-center">Tgl Daftar BPKB</th>
                <th className="px-4 py-4 text-center">Tgl Daftar STNK</th>
                <th className="px-4 py-4 text-center">Tgl Bayar SKPD</th>
                <th className="px-4 py-4 text-center">Tgl Terima BPKB</th>
                <th className="px-4 py-4 text-center">Tgl Terima STNK</th>
                <th className="px-4 py-4 text-center">Tgl Terima SKPD</th>
                <th className="px-4 py-4 text-center">Tgl Terima TNKB</th>
                <th className="px-4 py-4 text-left">Nomor TNKB</th>
                <th className="px-4 py-4 text-center">Notice SKPD</th>
                <th className="px-4 py-4 text-left">Vendor Karyawan</th>
                <th className="px-4 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
    <tr>
        <td colSpan={100} className="px-4 py-16 text-center bg-white">
            <div className="flex flex-col items-center justify-center gap-3 opacity-0 animate-in fade-in duration-500">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                <span className="text-sm font-medium text-slate-500">Memuat data...</span>
            </div>
        </td>
    </tr>
) : items.length ? (
                items.map((item) => (
                  <tr key={`${item.id}-${item.registrationId}`} className="border-b border-slate-200 text-slate-700 hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-4 text-left text-sm font-medium text-slate-900">{item.dealerName || '-'}</td>
                    <td className="px-4 py-4 text-left text-sm text-slate-700">{item.stnkName || '-'}</td>
                    <td className="px-4 py-4 text-left text-sm text-slate-700">{item.regionName || '-'}</td>
                    <td className="px-4 py-4 text-left text-sm font-medium text-slate-900">{item.machineNumber || '-'}</td>
                    <td className="px-4 py-4 text-center text-sm text-slate-700">{formatDate(item.invoiceReceiveDate)}</td>
                    <td className="px-4 py-4 text-center text-sm text-slate-700">{formatDate(item.bpkbRegistrationDate)}</td>
                    <td className="px-4 py-4 text-center text-sm text-slate-700">{formatDate(item.stnkRegistrationDate)}</td>
                    <td className="px-4 py-4 text-center text-sm text-slate-700">{formatDate(item.skpdPaymentDate)}</td>
                    <td className="px-4 py-4 text-center text-sm text-slate-700">{formatDate(item.bpkbReceivedDate)}</td>
                    <td className="px-4 py-4 text-center text-sm text-slate-700">{formatDate(item.stnkReceivedDate)}</td>
                    <td className="px-4 py-4 text-center text-sm text-slate-700">{formatDate(item.skpdReceivedDate)}</td>
                    <td className="px-4 py-4 text-center text-sm text-slate-700">{formatDate(item.tnkbReceivedDate)}</td>
                    <td className="px-4 py-4 text-left text-sm text-slate-700">{item.tnkbNumber || '-'}</td>
                    <td className="px-4 py-4 text-center text-sm text-slate-700">{new Intl.NumberFormat('id-ID').format(item.noticeFee || 0)}</td>
                    <td className="px-4 py-4 text-left text-sm text-slate-700">{item.vendorEmployee || '-'}</td>
                    <td className="px-4 py-4 text-center">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(item)} className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={100} className="h-24 text-center text-sm text-slate-500 px-4 py-16">
                    <div className="flex flex-col items-center justify-center gap-2">
                        <div className="rounded-full bg-slate-50 p-4 mb-2">
                            <Search className="h-8 w-8 text-slate-400" />
                        </div>
                        <p className="text-base font-semibold text-slate-900">Tidak ada data ditemukan</p>
                        <p className="text-sm text-slate-500">Belum ada data atau coba gunakan kata kunci pencarian lain.</p>
                    </div>
                </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-1 pb-2 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-slate-500">Showing {startData}-{endData} of {totalData} data</div>
        <div className="flex items-center gap-1 text-sm text-slate-700">
          <Button variant="ghost" size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="rounded-xl px-3">Previous</Button>
          {visiblePages[0] > 1 ? <span className="px-1 text-slate-400">...</span> : null}
          {visiblePages.map((pageNumber) => (
            <Button key={pageNumber} variant={pageNumber === page ? 'outline' : 'ghost'} size="sm" onClick={() => onPageChange(pageNumber)} className="h-9 min-w-9 rounded-xl border-slate-200">{pageNumber}</Button>
          ))}
          {visiblePages[visiblePages.length - 1] < totalPages ? <span className="px-1 text-slate-400">...</span> : null}
          <Button variant="ghost" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className="rounded-xl px-3">Next</Button>
        </div>
      </div>
    </div>
  );
}
