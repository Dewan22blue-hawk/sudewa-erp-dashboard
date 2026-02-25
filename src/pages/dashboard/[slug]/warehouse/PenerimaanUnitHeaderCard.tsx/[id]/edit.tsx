'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import PenerimaanUnitHeaderCard from '@/components/features/penerimaan-unit/PenerimaanUnitHeaderCard';
import PenerimaanUnitDetailTable from '@/components/features/penerimaan-unit/PenerimaanUnitDetailTable';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function EditPenerimaanUnitPage() {
  const [selected, setSelected] = useState<string[]>([]);

  const handleTerima = () => {
    toast.success('Data berhasil disimpan');
  };

  const handleDelete = () => {
    toast.success('Data berhasil dihapus');
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <PenerimaanUnitHeaderCard />

        <PenerimaanUnitDetailTable selected={selected} setSelected={setSelected} />

        <div className="flex gap-3">
          <button onClick={handleTerima} className="bg-green-600 text-white px-4 py-2 rounded">
            Terima
          </button>

          <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded">
            Hapus
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
