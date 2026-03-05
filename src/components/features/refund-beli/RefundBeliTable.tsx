import { RefundBeli } from '@/@types/refund-beli.types';
import { SortableHeader } from '@/components/ui/sortable-header';

interface Props {
  data: RefundBeli[];
  sortKey: string | undefined;
  sortOrder: "asc" | "desc" | null;
  onSort: (key: string) => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(value);

export default function RefundBeliTable({ data, sortKey, sortOrder, onSort }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 uppercase text-sm font-semibold text-gray-900 b">
            <tr className="border-b border-gray-200">
              <th className="py-2 text-left">
                <SortableHeader title="No Pembelian" sortKey="noPembelian" currentSortKey={sortKey} sortOrder={sortOrder} onSort={onSort} className="text-gray-900 justify-start w-full px-4" />
              </th>
              <th className="py-2 text-left">
                <SortableHeader title="Tanggal" sortKey="tanggal" currentSortKey={sortKey} sortOrder={sortOrder} onSort={onSort} className="text-gray-900 justify-start w-full px-4" />
              </th>
              <th className="py-2 text-left">
                <SortableHeader title="Nama Supplier" sortKey="namaSupplier" currentSortKey={sortKey} sortOrder={sortOrder} onSort={onSort} className="text-gray-900 justify-start w-full px-4" />
              </th>
              <th className="py-2 text-right">
                <SortableHeader title="Total Pembelian" sortKey="totalPembelian" currentSortKey={sortKey} sortOrder={sortOrder} onSort={onSort} className="text-gray-900 justify-end w-full px-4" />
              </th>
              <th className="py-2 text-right">
                <SortableHeader title="Total Refund" sortKey="totalRefund" currentSortKey={sortKey} sortOrder={sortOrder} onSort={onSort} className="text-gray-900 justify-end w-full px-4" />
              </th>
              <th className="py-2 text-left">
                <SortableHeader title="Kas Masuk" sortKey="kasMasuk" currentSortKey={sortKey} sortOrder={sortOrder} onSort={onSort} className="text-gray-900 justify-start w-full px-4" />
              </th>
              <th className="py-2 text-left">
                <SortableHeader title="Keterangan" sortKey="keterangan" currentSortKey={sortKey} sortOrder={sortOrder} onSort={onSort} className="text-gray-900 justify-start w-full px-4" />
              </th>
            </tr>
          </thead>

          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium">{item.noPembelian}</td>
                <td className="px-4 py-3">{item.tanggal}</td>
                <td className="px-4 py-3">{item.namaSupplier}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(item.totalPembelian)}</td>
                <td className="px-4 py-3 text-right text-red-600 font-medium">{formatCurrency(item.totalRefund)}</td>
                <td className="px-4 py-3">{item.kasMasuk}</td>
                <td className="px-4 py-3 text-gray-500">{item.keterangan}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
