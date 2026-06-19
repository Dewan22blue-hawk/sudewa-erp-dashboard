import React from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import LaporanBuktiPotongForm from '@/components/features/laporan-bukti-potong/LaporanBuktiPotongForm';
import { useWithholdingTaxReportDetail, useUpdateWithholdingTaxReport } from '@/hooks/useLaporanBuktiPotong';
import type { UpdateWithholdingTaxReportPayload } from '@/@types/laporan-bukti-potong.types';

export default function EditLaporanBuktiPotongPage() {
  const router = useRouter();
  const slug = typeof router.query.slug === 'string' ? router.query.slug : '';
  const id = router.isReady && typeof router.query.id === 'string' ? Number(router.query.id) : null;

  const { data: initialData, isLoading, isError } = useWithholdingTaxReportDetail(id);
  const updateMutation = useUpdateWithholdingTaxReport();

  const handleBack = () => {
    if (!slug) return;
    void router.push(`/dashboard/${slug}/finance/laporan-bukti-potong`);
  };

  const handleSubmit = async (payload: UpdateWithholdingTaxReportPayload) => {
    if (!id) return;
    try {
      await updateMutation.mutateAsync({ id, payload });
      toast.success('Laporan Bukti Potong berhasil diperbarui');
      handleBack();
    } catch (error: any) {
      toast.error(error.message || 'Gagal memperbarui data');
    }
  };

  if (!router.isReady || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !initialData) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
          Data tidak ditemukan atau terjadi kesalahan.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="h-10 w-10 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5 text-slate-700" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-slate-950">Edit Bukti Potong</h1>
            <p className="text-sm text-slate-500">Perbarui data laporan bukti potong</p>
          </div>
        </div>

        <LaporanBuktiPotongForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleBack}
          isSubmitting={updateMutation.isPending}
        />
      </div>
    </DashboardLayout>
  );
}
