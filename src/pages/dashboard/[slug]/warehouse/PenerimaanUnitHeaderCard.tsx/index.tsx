'use client';

import { useState } from 'react';
import { usePenerimaanUnits } from '@/hooks/usePenerimaanUnit';
import PenerimaanUnitTable from '@/components/features/penerimaan-unit/PenerimaanUnitTable';
import PenerimaanUnitFormDialog from '@/components/features/penerimaan-unit/PenerimaanUnitFormDialog';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function PenerimaanUnitPage() {
  const { data = [] } = usePenerimaanUnits();
  const [open, setOpen] = useState(false);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Data Penerimaan Unit</h1>
            <p className="text-sm text-gray-500">Kelola dan lacak semua data penerimaan stock unit</p>
          </div>

          <button onClick={() => setOpen(true)} className="bg-[#1E3A8A] text-white px-4 py-2 rounded-lg">
            + Tambah
          </button>
        </div>

        <PenerimaanUnitTable data={data} />

        <PenerimaanUnitFormDialog open={open} onClose={() => setOpen(false)} />
      </div>
    </DashboardLayout>
  );
}
