'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { ChevronLeft } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import PenerimaanUnitHeaderCard from '@/components/features/penerimaan-unit/PenerimaanUnitHeaderCard';
import PenerimaanUnitDetailTable from '@/components/features/penerimaan-unit/PenerimaanUnitDetailTable';
import { useReceiptStock, useUpdateWarehouseActivity, useWarehouseActivityDetail } from '@/hooks/useWarehouseActivity';
import { Button } from '@/components/ui/button';

export default function EditPenerimaanUnitPage() {
  const router = useRouter();
  const { id } = router.query as { id?: string; slug?: string };

  const { data: detailData, isLoading } = useWarehouseActivityDetail(id);
  const header = detailData;
  const details = detailData?.unit_transaction_details ?? [];
  const loadingDetail = isLoading;
  const terimaMutation = useReceiptStock();
  const updateMutation = useUpdateWarehouseActivity();

  const [form, setForm] = useState<{
    noPenerimaan: string;
    tanggal: Date | string | undefined;
    supplier: string;
    keterangan: string;
  }>({
    noPenerimaan: '',
    tanggal: undefined,
    supplier: '',
    keterangan: '',
  });

  useEffect(() => {
    if (header) {
      setForm({
        noPenerimaan: header.noPenerimaan || '',
        tanggal: header.tanggal || undefined,
        supplier: header.supplier || '',
        keterangan: header.keterangan || '',
      });
    }
  }, [header]);

  const handleFieldChange = (field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveField = async (field: string, value: unknown) => {
    if (!id) return;

    try {
      const payloadValue = field === 'tanggal' && value instanceof Date ? value.toISOString().split('T')[0] : value;
      const resolvedTanggal = field === 'tanggal' ? String(payloadValue ?? '') : typeof form.tanggal === 'string' ? form.tanggal : new Date(form.tanggal ?? new Date()).toISOString().split('T')[0];
      const resolvedKeterangan = field === 'keterangan' ? String(payloadValue ?? '') : String(form.keterangan ?? '');

      const payload = {
        warehouse_id: header?.warehouse?.id || '1',
        person_id: header?.person?.id || '1',
        activity_type: 'receipt' as const,
        activity_date: resolvedTanggal,
        description: resolvedKeterangan,
      };

      await updateMutation.mutateAsync({
        id,
        payload,
      });
      toast.success('Perubahan otomatis tersimpan');
    } catch {
      toast.error('Gagal menyimpan otomatis');
    }
  };

  const handleTerima = async (ids: number[]) => {
    if (!id) return;

    try {
      await terimaMutation.mutateAsync({
        activityId: id,
        payload: {
          unit_transaction_details: ids,
        },
      });
      toast.success('Data berhasil diterima ke stock warehouse');
    } catch (error: unknown) {
      const apiError = error as { message?: string; details?: unknown };
      const details = apiError?.details;

      // Backend can return details as an array of IDs; avoid showing unreadable "0: 123, 1: 456" toast.
      if (Array.isArray(details)) {
        toast.error(apiError?.message || 'Sebagian data detail tidak valid untuk proses receipt stock');
        return;
      }

      if (details && typeof details === 'object') {
        const detailText = Object.entries(details as Record<string, unknown>)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? String(value[0]) : String(value)}`)
          .join(', ')
          .trim();

        toast.error(detailText || apiError?.message || 'Gagal menerima data ke stock warehouse');
        return;
      }

      toast.error(apiError?.message || 'Gagal menerima data ke stock warehouse');
    }
  };

  const handleDelete = async (_ids: number[]) => {
    void _ids;
    toast.error('Endpoint hapus detail belum tersedia pada API warehouse activity');
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

        {isLoading || !header ? <div className="p-8 text-center text-gray-500">Loading...</div> : <PenerimaanUnitHeaderCard data={form} onChange={handleFieldChange} onBlur={handleSaveField} />}

        <div className="bg-white rounded-xl border p-4 sm:p-5 space-y-4">
          <h2 className="text-sm font-semibold">Detail Penerimaan</h2>
          {loadingDetail ? <div className="p-6 text-center text-gray-500">Memuat detail...</div> : <PenerimaanUnitDetailTable data={details} personId={header?.person?.id} onTerima={handleTerima} onDelete={handleDelete} />}
        </div>
      </div>
    </DashboardLayout>
  );
}
