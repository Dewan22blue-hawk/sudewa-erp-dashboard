import { ArrowUpDown } from 'lucide-react';
import { RefundBeli } from '@/@types/refund-beli.types';

interface Props {
  data: RefundBeli[];
  sortOrder?: "asc" | "desc";
  onSort: () => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(value);

export default function RefundBeliTable({ data, onSort }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 uppercase text-sm font-semibold text-gray-900 b">
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left">No Pembelian</th>
              <th className="px-4 py-3 text-left cursor-pointer select-none group" onClick={onSort}>
                <div className="flex items-center gap-1">
                  Tanggal
                  <ArrowUpDown size={14} className="text-gray-400 group-hover:text-gray-600" />
                </div>
              </th>
              <th className="px-4 py-3 text-left">Nama Supplier</th>
              <th className="px-4 py-3 text-right">Total Pembelian</th>
              <th className="px-4 py-3 text-right">Total Refund</th>
              <th className="px-4 py-3 text-left">Kas Masuk</th>
              <th className="px-4 py-3 text-left">Keterangan</th>
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
