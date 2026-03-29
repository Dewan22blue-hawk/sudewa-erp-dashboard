import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useCompany } from '@/contexts/CompanyContext';
import { usePaymentData, useSubmitBilling } from '@/hooks/useSalesPayment';
import { formatCurrency } from '@/lib/utils/currency';

const readApiError = (error: any): string => {
  const details = error?.details ?? error?.response?.data?.errors;
  if (typeof details === 'string' && details.trim()) return details;

  if (details && typeof details === 'object') {
    const text = Object.entries(details)
      .map(([field, value]) => `${field}: ${Array.isArray(value) ? value[0] : String(value)}`)
      .join(', ')
      .trim();
    if (text) return text;
  }

  return error?.message || 'Gagal menyimpan pembayaran.';
};

/**
 * Pembayaran Unit Page
 */
export default function PaymentPage() {
  const router = useRouter();
  const { id } = router.query;
  const salesId = Array.isArray(id) ? id[0] : id;
  const { companyId } = useCompany();
  const { salesData, billings, existingBilling, total, isLoading } = usePaymentData(salesId);
  const submitBilling = useSubmitBilling();

  // Billing harus mengikuti total transaksi utama (unit transaction),
  // bukan agregasi item detail yang bisa berbeda kontrak datanya.
  const totalTagihan = Number(salesData?.totalJual ?? (total > 0 ? total : 0));

  const [form, setForm] = useState({
    bca_idr: 0,
    bca_usd: 0,
    cash: 0,
    payment_date: '',
  });

  useEffect(() => {
    setForm({
      bca_idr: Number(existingBilling?.bca_payment ?? 0),
      bca_usd: Number(existingBilling?.bca_payment_2 ?? 0),
      cash: Number(existingBilling?.cash_payment ?? 0),
      payment_date: existingBilling?.payment_date ?? new Date().toISOString().slice(0, 10),
    });
  }, [existingBilling?.bca_payment, existingBilling?.bca_payment_2, existingBilling?.cash_payment, existingBilling?.payment_date]);

  const totalBayar = useMemo(() => Number(form.bca_idr || 0) + Number(form.cash || 0) + Number(form.bca_usd || 0), [form.bca_idr, form.cash, form.bca_usd]);
  const kurangBayar = useMemo(() => Math.max(0, totalTagihan - totalBayar), [totalTagihan, totalBayar]);
  const isPaid = kurangBayar === 0 ? 1 : 0;

  const parseNumericInput = (value: string) => {
    if (!value) return 0;
    const normalized = Number(value.replace(/[^\d]/g, ''));
    return Number.isFinite(normalized) ? normalized : 0;
  };

  const formatNumberWithDot = (value: number) => {
    return Number(value || 0).toLocaleString('id-ID');
  };

  const handleSubmit = async (data: any) => {
    try {
      if (!salesId) {
        toast.error('Data penjualan tidak valid');
        return;
      }
      if (!companyId) {
        toast.error('Company belum dipilih');
        return;
      }

      const bcaPayment = Number(data.paymentBca ?? 0);
      const cashPayment = Number(data.paymentCash ?? 0);
      const bcaPayment2 = Number(data.paymentBcaUsd ?? 0);

      if (bcaPayment > totalTagihan) {
        toast.error('Nominal BCA IDR tidak boleh melebihi total transaksi.');
        return;
      }

      if (cashPayment > totalTagihan) {
        toast.error('Nominal Cash tidak boleh melebihi total transaksi.');
        return;
      }

      if (bcaPayment + cashPayment + bcaPayment2 > totalTagihan) {
        toast.error('Total pembayaran tidak boleh melebihi total transaksi.');
        return;
      }

      const result = await submitBilling.mutateAsync({
        salesId: String(salesId),
        companyId: String(companyId),
        paymentBca: bcaPayment,
        paymentCash: cashPayment,
        paymentBcaUsd: bcaPayment2,
        totalTagihan,
        existingBillingId: existingBilling?.id,
        billings,
        paymentAt: new Date().toISOString().slice(0, 10),
      });

      toast.success(result.mode === 'update' ? 'Pembayaran berhasil diperbarui!' : 'Pembayaran berhasil disimpan!');
      const slugQuery = router.query.slug;
      const slug = Array.isArray(slugQuery) ? slugQuery[0] : slugQuery || '';
      const basePath = slug ? `/dashboard/${slug}/sales` : '/sales';
      router.push(`${basePath}/${salesId}`);
    } catch (error: any) {
      toast.error(readApiError(error));
    }
  };

  if (isLoading || !salesData) {
    return (
      <DashboardLayout>
        <div className="p-6">Loading data...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <button onClick={() => router.back()} className="mb-2 inline-flex text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight">Pembayaran Unit</h1>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Kode Beli / Kode Jual</span>
              <span className="text-blue-600 font-medium">{salesData.kodeJual}</span>
            </div>
          </div>
        </div>

        <Card className="rounded-xl">
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold">Informasi Pembelian</h2>
            <Separator className="my-4" />
            <div className="space-y-6">
              <div className="rounded-lg border">
                <div className="border-b px-4 py-3">
                  <h3 className="text-sm font-semibold text-muted-foreground">Biaya</h3>
                </div>
                <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Total Beli</p>
                    <Input value={formatCurrency(Number(salesData.totalDpp ?? 0))} disabled />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Total PPN</p>
                    <Input value={formatCurrency(Number(salesData.totalPpn ?? 0))} disabled />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Total Biaya</p>
                    <Input value={formatCurrency(totalTagihan)} disabled />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border">
                <div className="border-b px-4 py-3">
                  <h3 className="text-sm font-semibold text-muted-foreground">Pembayaran</h3>
                </div>
                <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">BCA IDR</p>
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="BCA IDR"
                      value={formatNumberWithDot(form.bca_idr)}
                      onChange={(e) => setForm((prev) => ({ ...prev, bca_idr: parseNumericInput(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">BCA USD</p>
                    <Input
                      type="number"
                      min={0}
                      placeholder="BCA USD"
                      value={form.bca_usd}
                      onChange={(e) => setForm((prev) => ({ ...prev, bca_usd: parseNumericInput(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Cash</p>
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="Cash"
                      value={formatNumberWithDot(form.cash)}
                      onChange={(e) => setForm((prev) => ({ ...prev, cash: parseNumericInput(e.target.value) }))}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border">
                <div className="border-b px-4 py-3">
                  <h3 className="text-sm font-semibold text-muted-foreground">Invoice</h3>
                </div>
                <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Tanggal</p>
                    <Input
                      type="date"
                      value={form.payment_date}
                      onChange={(e) => setForm((prev) => ({ ...prev, payment_date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Total Bayar</p>
                    <Input value={formatCurrency(totalBayar)} disabled />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Kurang Bayar</p>
                    <Input value={formatCurrency(kurangBayar)} disabled />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => router.back()}>
                  Batal
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  data-is-paid={isPaid}
                  onClick={() =>
                    handleSubmit({
                      paymentBca: form.bca_idr,
                      paymentCash: form.cash,
                      paymentBcaUsd: form.bca_usd,
                    })
                  }
                  disabled={submitBilling.isPending}
                >
                  {submitBilling.isPending ? 'Menyimpan...' : 'Bayar'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
