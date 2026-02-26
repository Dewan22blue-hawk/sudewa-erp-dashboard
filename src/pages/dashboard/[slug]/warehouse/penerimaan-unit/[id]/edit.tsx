'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { ChevronLeft } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import PenerimaanUnitHeaderCard from '@/components/features/penerimaan-unit/PenerimaanUnitHeaderCard';
import PenerimaanUnitDetailTable from '@/components/features/penerimaan-unit/PenerimaanUnitDetailTable';
import {
  useBulkDeleteDetail,
  useBulkTerimaDetail,
  usePenerimaanDetail,
  usePenerimaanUnitById,
  useUpdatePenerimaanUnit
} from '@/hooks/usePenerimaanUnit';
import { Button } from '@/components/ui/button';

export default function EditPenerimaanUnitPage() {
  const router = useRouter();
  const { id } = router.query as { id?: string; slug?: string };

  const { data: header, isLoading } = usePenerimaanUnitById(id);
  const { data: details = [], isLoading: loadingDetail } = usePenerimaanDetail(id);
  const terimaMutation = useBulkTerimaDetail();
  const deleteMutation = useBulkDeleteDetail();
  const updateMutation = useUpdatePenerimaanUnit();

  const [form, setForm] = useState<{
    noPenerimaan: string;
    tanggal: Date | string | undefined;
    supplier: string;
    keterangan: string;
  }>({
    noPenerimaan: "",
    tanggal: undefined,
    supplier: "",
    keterangan: "",
  });

  useEffect(() => {
    if (header) {
      setForm({
        noPenerimaan: header.noPenerimaan || "",
        tanggal: header.tanggal || undefined,
        supplier: header.supplier || "",
        keterangan: header.keterangan || "",
      });
    }
  }, [header]);

  const handleFieldChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveField = async (field: string, value: any) => {
    if (!id) return;

    try {
      const payloadValue = field === 'tanggal' && value instanceof Date
        ? value.toISOString().split('T')[0]
        : value;

      await updateMutation.mutateAsync({
        id,
        payload: { [field]: payloadValue }
      });
      toast.success("Perubahan otomatis tersimpan");
    } catch (error) {
      toast.error("Gagal menyimpan otomatis");
    }
  };

  const handleTerima = async (ids: string[]) => {
    await terimaMutation.mutateAsync(ids);
    toast.success('Data berhasil disimpan');
  };

  const handleDelete = async (ids: string[]) => {
    await deleteMutation.mutateAsync(ids);
    toast.success('Data berhasil dihapus');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2 hover:bg-transparent" onClick={() => router.back()}>
              <ChevronLeft className="h-6 w-6 text-gray-700" />
            </Button>
            <h1 className="text-xl font-bold text-gray-900">Data Penerimaan Unit</h1>
          </div>
        </div>

        {isLoading || !header ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <PenerimaanUnitHeaderCard
            data={form}
            onChange={handleFieldChange}
            onBlur={handleSaveField}
          />
        )}

        <div className="bg-white rounded-xl border p-4 sm:p-5 space-y-4">
          <h2 className="text-sm font-semibold">Detail Penerimaan</h2>
          {loadingDetail ? <div className="p-6 text-center text-gray-500">Memuat detail...</div> : <PenerimaanUnitDetailTable data={details} onTerima={handleTerima} onDelete={handleDelete} />}
        </div>
      </div>
    </DashboardLayout>
  );
}
