import * as React from 'react';
import { ChevronLeft, Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateInvoiceDetail, useUpdateCreateInvoice } from '@/hooks/useCreateInvoice';
import { formatDisplayDate } from '@/components/features/create-invoice/create-invoice.utils';

export default function EditCreateInvoicePage() {
  const router = useRouter();
  const slug = typeof router.query.slug === 'string' ? router.query.slug : '';
  const id = router.isReady && typeof router.query.id === 'string' ? Number(router.query.id) : 0;

  const detailQuery = useCreateInvoiceDetail(router.isReady && id > 0 ? id : null);
  const updateMutation = useUpdateCreateInvoice();
  const [qty, setQty] = React.useState('0');
  const [doLetterCode, setDoLetterCode] = React.useState('');
  const [doAssignmentCode, setDoAssignmentCode] = React.useState('');

  React.useEffect(() => {
    if (!detailQuery.data) return;
    setQty(String(detailQuery.data.qty ?? 0));
    setDoLetterCode(detailQuery.data.doLetterCode ?? '');
    setDoAssignmentCode(detailQuery.data.doAssignmentCode ?? '');
  }, [detailQuery.data]);

  const handleSubmit = async () => {
    if (!detailQuery.data) return;

    try {
      await updateMutation.mutateAsync({
        id: detailQuery.data.id,
        payload: {
          qty: Number(qty || 0),
          do_letter_code: doLetterCode,
          do_assignment_code: doAssignmentCode,
        },
      });

      toast.success('Create invoice berhasil diperbarui');
      router.push(`/dashboard/${slug}/administrasi/create-invoice/detail/${detailQuery.data.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Gagal memperbarui create invoice');
    }
  };

  if (!router.isReady || detailQuery.isLoading) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-sm text-slate-500">Memuat data invoice...</div>
      </DashboardLayout>
    );
  }

  if (!id || !detailQuery.data) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-sm text-slate-500">Data invoice tidak ditemukan.</div>
      </DashboardLayout>
    );
  }

  const firstCustomer =
    detailQuery.data.doExpedition?.items?.find((item) => item.customer?.name || item.customerName)?.customer?.name ||
    detailQuery.data.doExpedition?.items?.find((item) => item.customerName)?.customerName ||
    '-';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => router.push(`/dashboard/${slug}/administrasi/create-invoice`)} className="rounded-md p-1 transition-colors hover:bg-slate-100">
            <ChevronLeft className="h-5 w-5 text-slate-500" />
          </button>
          <h1 className="text-[18px] font-semibold text-slate-900 md:text-[20px]">Edit Invoice</h1>
        </div>

        <Card className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-[18px] font-semibold text-slate-900">Informasi Transaksi</h2>
            </div>
            <div className="h-px bg-slate-200" />

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-900">Tanggal</Label>
                <Input value={formatDisplayDate(detailQuery.data.doExpedition?.date)} readOnly className="h-12 rounded-xl border-slate-200 bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-900">Customer</Label>
                <Input value={firstCustomer} readOnly className="h-12 rounded-xl border-slate-200 bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-900">Customer</Label>
                <Input value={firstCustomer} readOnly className="h-12 rounded-xl border-slate-200 bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-900">Kode DO</Label>
                <Input value={detailQuery.data.doExpedition?.doCode ?? '-'} readOnly className="h-12 rounded-xl border-slate-200 bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-900">No Surat DO</Label>
                <Input value={doLetterCode} onChange={(event) => setDoLetterCode(event.target.value)} className="h-12 rounded-xl border-slate-200" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-900">No Surat Jalan</Label>
                <Input value={doAssignmentCode} onChange={(event) => setDoAssignmentCode(event.target.value)} className="h-12 rounded-xl border-slate-200" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-900">QTY</Label>
                <Input value={qty} onChange={(event) => setQty(event.target.value.replace(/[^\d]/g, ''))} className="h-12 rounded-xl border-slate-200" />
              </div>
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-center gap-5">
          <Button type="button" variant="ghost" onClick={() => router.push(`/dashboard/${slug}/administrasi/create-invoice`)} className="text-base text-slate-700 hover:bg-transparent hover:text-slate-900">
            Batal
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={updateMutation.isPending} className="h-12 rounded-xl bg-[#1f4163] px-6 hover:bg-[#183552]">
            {updateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Simpan
              </>
            )}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
