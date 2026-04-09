import { Search } from 'lucide-react';
import { StockStatus, StockUnit } from '@/@types/stock-unit.types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useTableSort } from '@/hooks/useTableSort';
import { SortableHeader } from '@/components/ui/sortable-header';

interface Props {
  data: StockUnit[];
  isLoading: boolean;
  page: number;
  perPage: number;
  totalData: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  search: string;
  onSearchChange: (search: string) => void;
  onStockStateChange: (state: StockStatus | 'all' | undefined) => void;
  onMachineNumberChange: (mn: string | undefined) => void;
  onChassisNumberChange: (cn: string | undefined) => void;
  onColorChange: (color: string | undefined) => void;
}

const statusLabel: Record<StockStatus, string> = {
  draft: 'Draf',
  cancel: 'Batal',
  rejected: 'Ditolak',
  prepare: 'Persiapan',
  inbound_purcase_order: 'Inbound Pesanan Pembelian',
  inbound_incoming_goods: 'Inbound Barang Masuk',
  inbound_receipt: 'Inbound Penerimaan',
  inbound_return: 'Inbound Retur',
  outbound_reserved: 'Outbound Dipesan',
  outbound_in_transit: 'Outbound Dalam Pengiriman',
  outbound_delivered: 'Outbound Terkirim',
  outbound_return: 'Outbound Retur',
};

const statusBadgeClasses: Record<StockStatus, string> = {
  draft: 'bg-gray-100 text-gray-600',
  cancel: 'bg-red-100 text-red-600',
  rejected: 'bg-red-100 text-red-600',
  prepare: 'bg-yellow-100 text-yellow-600',
  inbound_purcase_order: 'bg-blue-100 text-blue-600',
  inbound_incoming_goods: 'bg-blue-100 text-blue-600',
  inbound_receipt: 'bg-green-100 text-green-600',
  inbound_return: 'bg-orange-100 text-orange-600',
  outbound_reserved: 'bg-purple-100 text-purple-600',
  outbound_in_transit: 'bg-indigo-100 text-indigo-600',
  outbound_delivered: 'bg-green-100 text-green-600',
  outbound_return: 'bg-orange-100 text-orange-600',
};

export default function StockUnitTable({
  data,
  isLoading,
  page,
  perPage,
  totalData,
  onPageChange,
  onPerPageChange,
  search,
  onSearchChange,
  onStockStateChange,
  onMachineNumberChange,
  onChassisNumberChange,
  onColorChange,
}: Props) {
  const { sortedData, sortKey, sortOrder, handleSort } = useTableSort({
    data: data,
  });

  const totalPages = Math.max(1, Math.ceil(totalData / perPage));
  const startIndex = totalData === 0 ? 0 : (page - 1) * perPage;
  const endIndex = totalData === 0 ? 0 : Math.min(startIndex + perPage, totalData);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= Math.ceil(maxPagesToShow / 2)) {
        for (let i = 1; i <= maxPagesToShow - 1; i++) pages.push(i);
        pages.push('...', totalPages);
      } else if (page >= totalPages - Math.floor(maxPagesToShow / 2)) {
        pages.push(1, '...');
        for (let i = totalPages - (maxPagesToShow - 2); i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const renderStatus = (status: StockStatus) => {
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${statusBadgeClasses[status] ?? 'bg-gray-100 text-gray-600'}`}>
        {statusLabel[status] ?? status}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between gap-4 items-center">
        <div className="flex flex-wrap items-center gap-4">

          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span>Tampilkan</span>
            <Select
              value={String(perPage)}
              onValueChange={(val) => {
                onPerPageChange(Number(val));
              }}
            >
              <SelectTrigger className="h-10 w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span>Baris</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Cari di sini" value={search} onChange={(e) => onSearchChange(e.target.value)} className="pl-9 h-10" />
          </div>

        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-200/50 uppercase text-xs font-semibold text-gray-900">
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left">No. Urut</th>
              <th className="p-0 text-left">
                <SortableHeader title="Tipe Unit" sortKey="tipeUnit" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="w-full justify-start px-4 text-gray-900 uppercase" />
              </th>
              <th className="p-0 text-left">
                <SortableHeader title="Warna" sortKey="warna" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="w-full justify-start px-4 text-gray-900 uppercase" />
              </th>
              <th className="p-0 text-left">
                <SortableHeader title="Nomor Mesin" sortKey="noMesin" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="w-full justify-start px-4 text-gray-900 uppercase" />
              </th>
              <th className="p-0 text-left">
                <SortableHeader title="Nomor Rangka" sortKey="noRangka" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="w-full justify-start px-4 text-gray-900 uppercase" />
              </th>
              <th className="p-0 text-left">
                <SortableHeader title="Status" sortKey="status" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="w-full justify-start px-4 text-gray-900 uppercase" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  Memuat data...
                </td>
              </tr>
            ) : data.length > 0 ? (
              sortedData.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">{(page - 1) * perPage + index + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{item.tipeUnit}</td>
                  <td className="px-4 py-3">{item.warna}</td>
                  <td className="px-4 py-3">{item.noMesin}</td>
                  <td className="px-4 py-3">{item.noRangka}</td>
                  <td className="px-4 py-3">{renderStatus(item.status)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  Tidak ada data yang ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center text-sm text-gray-600">
        <div>
          Menampilkan {totalData === 0 ? 0 : startIndex + 1}-{endIndex} dari {totalData} data
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page === 1 || isLoading} onClick={() => onPageChange(page - 1)}>
            Sebelumnya
          </Button>

          {getPageNumbers().map((pageNum, idx) => (
            <Button
              key={idx}
              variant={pageNum === page ? 'outline' : 'ghost'}
              size="sm"
              className={pageNum === page ? 'bg-gray-100' : ''}
              onClick={() => typeof pageNum === 'number' && onPageChange(pageNum)}
              disabled={typeof pageNum !== 'number' || isLoading}
            >
              {pageNum}
            </Button>
          ))}

          <Button variant="outline" size="sm" disabled={page === totalPages || totalData === 0 || isLoading} onClick={() => onPageChange(page + 1)}>
            Selanjutnya
          </Button>
        </div>
      </div>
    </div>
  );
}