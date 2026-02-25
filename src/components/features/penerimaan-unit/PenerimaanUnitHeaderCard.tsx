'use client';

import { Calendar } from 'lucide-react';
import { PenerimaanUnit } from '@/@types/penerimaan-unit.types';
import { Input } from '@/components/ui/input';

interface Props {
  data: PenerimaanUnit;
}

export default function PenerimaanUnitHeaderCard({ data }: Props) {
  const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
      <h2 className="text-lg font-bold text-gray-900">Informasi Penerimaan</h2>
      <hr className="border-gray-100" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
        <div className="space-y-2">
          <label className="text-gray-900 font-medium">No Pemesanan</label>
          <Input value={data.noPenerimaan} disabled className="bg-white text-gray-500 rounded-lg h-10 border-gray-200" />
        </div>

        <div className="space-y-2">
          <label className="text-gray-900 font-medium">Tanggal Terima</label>
          <div className="relative">
            <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input value={formatDate(data.tanggal)} disabled className="pl-10 bg-white text-gray-900 rounded-lg h-10 border-gray-200" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-gray-900 font-medium">Supplier</label>
          <Input value={data.supplier} disabled className="bg-white text-gray-400 rounded-lg h-10 border-gray-200" />
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <label className="text-gray-900 font-medium">Keterangan</label>
        <Input value={data.keterangan || '-'} disabled className="bg-white text-gray-500 rounded-lg h-10 border-gray-200" />
      </div>
    </div>
  );
}
