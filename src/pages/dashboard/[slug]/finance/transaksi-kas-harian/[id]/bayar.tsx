import { useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeft, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCreateFinanceBillingItem, useFinanceBillingDetail } from '@/hooks/useFinanceBilling';
import { formatCurrency } from '@/lib/utils/currency';

const formatDate = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const formatMoneyInput = (value: string) => {
  const digits = value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
  if (!digits) return '';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const parseMoneyInput = (value: string) => {
  const normalized = value.replace(/\D/g, '');
  if (!normalized) return 0;
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : 0;
};

const translateFinanceBillingError = (message: string) => {
  const trimmed = message.trim();

  const balanceMatch = trimmed.match(/^Payment amount exceeds remaining billing balance \(([\d.,]+)\)\.?$/i);
  if (balanceMatch) {
    return `Nominal pembayaran melebihi sisa saldo tagihan (${balanceMatch[1]}).`;
  }

  if (/^Validation failed$/i.test(trimmed)) {
    return 'Validasi gagal. Periksa kembali data pembayaran yang Anda masukkan.';
  }

  return trimmed
    .replace(/^Payment amount exceeds remaining billing balance/i, 'Nominal pembayaran melebihi sisa saldo tagihan')
    .replace(/^Payment amount is required/i, 'Nominal pembayaran wajib diisi')
    .replace(/^Payment date is required/i, 'Tanggal pembayaran wajib diisi')
    .replace(/^The note field is required/i, 'Catatan wajib diisi');
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (!error || typeof error !== 'object') return fallback;

  const details = 'details' in error ? (error as { details?: unknown }).details : undefined;
  if (typeof details === 'string' && details.trim()) {
    return translateFinanceBillingError(details);
  }

  if (details && typeof details === 'object') {
    const firstValue = Object.values(details as Record<string, unknown>)[0];
    if (typeof firstValue === 'string' && firstValue.trim()) {
      return translateFinanceBillingError(firstValue);
    }
    if (Array.isArray(firstValue) && typeof firstValue[0] === 'string') {
      return translateFinanceBillingError(firstValue[0]);
    }
  }

  const message = 'message' in error ? (error as { message?: unknown }).message : undefined;
  if (typeof message === 'string' && message.trim()) {
    return translateFinanceBillingError(message);
  }

  return fallback;
};

export default function BayarKasHarianPage() {
  const router = useRouter();
  const { slug, id: rawId, source } = router.query;
  const financeBillingId = typeof rawId === 'string' ? Number(rawId) : undefined;
  const isBillingSource = source === 'billing';

  const financeBillingQuery = useFinanceBillingDetail(financeBillingId, {
    enabled: isBillingSource && typeof financeBillingId === 'number' && Number.isFinite(financeBillingId),
  });
  const mutation = useCreateFinanceBillingItem(financeBillingId);

  const financeBillingDetail = financeBillingQuery.data;
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [bcaIdr, setBcaIdr] = useState('');
  const [bcaUsd, setBcaUsd] = useState('');
  const [cash, setCash] = useState('');
  const [note, setNote] = useState('');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);

  const totalBeli = Number(financeBillingDetail?.unit_transaction_billing?.grand_total || 0);
  const totalPpn = 0;
  const totalBiaya = totalBeli + totalPpn;
  const totalPaid = Number(financeBillingDetail?.total_paid || 0);
  const remainingPayment = Number(financeBillingDetail?.remaining_payment || 0);

  const currentInputTotal = useMemo(
    () => parseMoneyInput(bcaIdr) + parseMoneyInput(bcaUsd) + parseMoneyInput(cash),
    [bcaIdr, bcaUsd, cash],
  );
  const totalBayar = totalPaid + currentInputTotal;
  const kurangBayar = Math.max(0, remainingPayment - currentInputTotal);

  const isBusy = mutation.isPending;

  const handleSubmit = async () => {
    if (!financeBillingId || !financeBillingDetail) {
      toast.error('Data finance billing belum tersedia pada transaksi ini');
      return;
    }

    const payload = {
      finance_billing_id: financeBillingId,
      bca_payment_amount: parseMoneyInput(bcaIdr),
      bca_payment_usd_amount: parseMoneyInput(bcaUsd),
      cash_payment_amount: parseMoneyInput(cash),
      payment_proof: paymentProof,
      payment_at: paymentDate,
      note,
    };

    if ((payload.bca_payment_amount || 0) + (payload.bca_payment_usd_amount || 0) + (payload.cash_payment_amount || 0) <= 0) {
      toast.error('Isi minimal salah satu nominal pembayaran');
      return;
    }

    if (currentInputTotal > remainingPayment) {
      toast.error(`Nominal pembayaran melebihi sisa saldo tagihan (${formatCurrency(remainingPayment)}).`);
      return;
    }

    try {
      await mutation.mutateAsync(payload);
      toast.success('Pembayaran berhasil disimpan');

      if (typeof slug === 'string') {
        void router.push(`/dashboard/${slug}/finance/transaksi-kas-harian/${financeBillingId}?source=billing`);
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Gagal menyimpan pembayaran'));
    }
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Pembayaran Kas Harian - Wajira Dashboard</title>
      </Head>

      {!isBillingSource ? (
        <div className="rounded-[30px] border border-amber-200 bg-amber-50 px-6 py-5 text-amber-800">
          <p className="font-medium">Fitur pembayaran hanya tersedia untuk data fractal pembayaran.</p>
          <p className="mt-1 text-sm text-amber-700">Data kas harian manual tidak memiliki alur pembayaran dari finance billing.</p>
        </div>
      ) : financeBillingQuery.isLoading || router.isFallback ? (
        <div className="flex min-h-[50vh] items-center justify-center rounded-[30px] border border-slate-200 bg-white">
          <div className="flex items-center gap-3 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Memuat data pembayaran...
          </div>
        </div>
      ) : financeBillingQuery.error || !financeBillingDetail ? (
        <div className="rounded-[30px] border border-red-200 bg-red-50 px-6 py-5 text-red-700">
          <p className="font-medium">{financeBillingQuery.error instanceof Error ? financeBillingQuery.error.message : 'Data pembayaran tidak ditemukan'}</p>
          <p className="mt-1 text-sm text-red-600">Pastikan ID billing yang dipakai sudah benar.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-2">
            <Link href={typeof slug === 'string' ? `/dashboard/${slug}/finance/transaksi-kas-harian/${financeBillingId}?source=billing` : '/dashboard'} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800">
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Link>
            <div>
              <h1 className="text-[36px] font-semibold tracking-tight text-slate-950">Detail Pembayaran</h1>
              <p className="text-sm text-slate-500">
                Nota Referensi <span className="text-[#255ee8]">{financeBillingDetail.unit_transaction_billing.unit_transaction.code}</span>
              </p>
            </div>
          </div>

          <div className="space-y-6 rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm">
            <section className="rounded-[22px] border border-slate-200 p-5">
              <h2 className="text-[18px] font-medium text-slate-700">Biaya</h2>
              <div className="mt-5 grid gap-5 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900">Total Beli</label>
                  <Input value={formatCurrency(totalBeli)} readOnly className="h-12 rounded-xl border-slate-200 bg-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900">Total PPN</label>
                  <Input value={formatCurrency(totalPpn)} readOnly className="h-12 rounded-xl border-slate-200 bg-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900">Total Biaya</label>
                  <Input value={formatCurrency(totalBiaya)} readOnly className="h-12 rounded-xl border-slate-200 bg-white" />
                </div>
              </div>
            </section>

            <section className="rounded-[22px] border border-slate-200 p-5">
              <h2 className="text-[18px] font-medium text-slate-700">Pembayaran</h2>
              <div className="mt-5 grid gap-5 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900">BCA IDR</label>
                  <Input value={bcaIdr} onChange={(event) => setBcaIdr(formatMoneyInput(event.target.value))} placeholder="Rp 99.999.999" className="h-12 rounded-xl border-slate-200" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900">BCA USD</label>
                  <Input value={bcaUsd} onChange={(event) => setBcaUsd(formatMoneyInput(event.target.value))} placeholder="Rp 99.999.999" className="h-12 rounded-xl border-slate-200" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900">Cash</label>
                  <Input value={cash} onChange={(event) => setCash(formatMoneyInput(event.target.value))} placeholder="Rp 99.999.999" className="h-12 rounded-xl border-slate-200" />
                </div>
              </div>
            </section>

            <section className="rounded-[22px] border border-slate-200 p-5">
              <h2 className="text-[18px] font-medium text-slate-700">Invoice</h2>
              <div className="mt-5 grid gap-5 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900">Tanggal</label>
                  <Input type="date" value={paymentDate || formatDate(financeBillingDetail.last_payment_at)} onChange={(event) => setPaymentDate(event.target.value)} className="h-12 rounded-xl border-slate-200" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900">Total Bayar</label>
                  <Input value={formatCurrency(totalBayar)} readOnly className="h-12 rounded-xl border-slate-200 bg-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900">Kurang Bayar</label>
                  <Input value={formatCurrency(kurangBayar)} readOnly className="h-12 rounded-xl border-slate-200 bg-white" />
                </div>
              </div>
            </section>

            <section className="rounded-[22px] border border-slate-200 p-5">
              <p className="text-sm font-medium text-slate-700">Bukti Pembayaran (opsional)</p>
              <label className="mt-4 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-slate-500">
                <Upload className="mb-3 h-8 w-8 text-slate-500" />
                <span className="text-base text-slate-700">Klik untuk upload dokumen</span>
                <span className="mt-1 text-sm text-slate-400">PNG, JPG maksimal 5MB</span>
                {paymentProof ? <span className="mt-3 text-sm font-medium text-slate-700">{paymentProof.name}</span> : null}
                <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(event) => setPaymentProof(event.target.files?.[0] ?? null)} />
              </label>
            </section>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900">Catatan</label>
              <Textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder={financeBillingDetail.unit_transaction_billing.unit_transaction.code || 'pembayaran utama termin 1'}
                className="min-h-28 resize-none rounded-2xl border-slate-200"
              />
            </div>

            <div className="flex items-center justify-center gap-4 pt-4">
              <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isBusy}>
                Batal
              </Button>
              <Button type="button" className="bg-[#12c04b] hover:bg-[#0fa040]" onClick={handleSubmit} disabled={isBusy}>
                {isBusy ? 'Menyimpan...' : 'Bayar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
