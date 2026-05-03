import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeft, Loader2 } from 'lucide-react';
import TransactionDetailInlineTable from '@/components/features/kas-harian/TransactionDetailInlineTable';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useFinanceBillingDetail } from '@/hooks/useFinanceBilling';
import { useKasHarianDetail } from '@/hooks/useKasHarian';
import { formatCurrency } from '@/lib/utils/currency';

const LIVE_UPDATE_INTERVAL = 5000;

const formatDate = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

const buildProofUrl = (path?: string | null) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;

  const base = process.env.NEXT_PUBLIC_API_URL ?? 'https://wajirabackend.hawk-dev.com';
  return `${base.replace(/\/$/, '')}/storage/${path.replace(/^\/+/, '')}`;
};

export default function KasHarianDetailPage() {
  const router = useRouter();
  const { slug, id: rawId, source: rawSource } = router.query;
  const id = typeof rawId === 'string' ? Number(rawId) : undefined;
  const source = rawSource === 'billing' ? 'billing' : 'manual';

  const cashFlowQuery = useKasHarianDetail(id, {
    enabled: source === 'manual',
    refetchInterval: source === 'manual' ? LIVE_UPDATE_INTERVAL : false,
  });

  const financeBillingQuery = useFinanceBillingDetail(id, {
    enabled: source === 'billing',
    refetchInterval: source === 'billing' ? LIVE_UPDATE_INTERVAL : false,
  });

  const manualDetail = cashFlowQuery.data;
  const billingDetail = financeBillingQuery.data;

  const isLoading = source === 'billing' ? financeBillingQuery.isLoading || router.isFallback : cashFlowQuery.isLoading || router.isFallback;
  const errorMessage =
    source === 'billing'
      ? financeBillingQuery.error instanceof Error
        ? financeBillingQuery.error.message
        : null
      : cashFlowQuery.error instanceof Error
        ? cashFlowQuery.error.message
        : null;

  const pageTitle = source === 'billing' ? 'Detail Transaksi' : 'Detail Pembayaran';
  const pageSubtitle = source === 'billing' ? 'Detail fractal pembayaran dan histori pelunasan' : 'Detail transaksi terkait';
  const paymentDate = source === 'billing' ? billingDetail?.last_payment_at : manualDetail?.date;
  const cashAccount = source === 'billing' ? 'Fractal Pembayaran' : manualDetail?.cash?.description ?? '-';
  const accountName = source === 'billing' ? billingDetail?.unit_transaction_billing.unit_transaction.code ?? '-' : manualDetail?.account?.name ?? manualDetail?.cash?.description ?? '-';
  const totalNominal =
    source === 'billing'
      ? Number(billingDetail?.unit_transaction_billing.grand_total || 0)
      : Number(manualDetail?.debet || 0) + Number(manualDetail?.credit || 0);
  const totalRincian =
    source === 'billing'
      ? Number(billingDetail?.total_paid || 0)
      : Number(manualDetail?.debet || 0) + Number(manualDetail?.credit || 0);
  const note =
    source === 'billing'
      ? billingDetail?.unit_transaction_billing.unit_transaction_billing_histories?.[0]?.note || ''
      : manualDetail?.note || '';
  const proofUrl = buildProofUrl(
    source === 'billing'
      ? billingDetail?.unit_transaction_billing.unit_transaction_billing_histories?.[0]?.payment_proof
      : manualDetail?.finance_billing?.finance_billing_items?.[0]?.payment_proof,
  );

  return (
    <DashboardLayout>
      <Head>
        <title>Detail Transaksi Kas Harian - Wajira Dashboard</title>
      </Head>

      {isLoading ? (
        <div className="flex min-h-[50vh] items-center justify-center rounded-[30px] border border-slate-200 bg-white">
          <div className="flex items-center gap-3 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Memuat detail transaksi...
          </div>
        </div>
      ) : errorMessage || (source === 'billing' ? !billingDetail : !manualDetail) ? (
        <div className="rounded-[30px] border border-red-200 bg-red-50 px-6 py-5 text-red-700">
          <p className="font-medium">{errorMessage ?? 'Data transaksi tidak ditemukan'}</p>
          <p className="mt-1 text-sm text-red-600">Periksa kembali ID transaksi pada URL.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-2">
            <Link href={typeof slug === 'string' ? `/dashboard/${slug}/finance/transaksi-kas-harian` : '/dashboard'} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800">
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Link>
            <div>
              <h1 className="text-[36px] font-semibold tracking-tight text-slate-950">{pageTitle}</h1>
              <p className="text-sm text-slate-500">{pageSubtitle}</p>
            </div>
          </div>

          <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-5 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800">Tgl Pembayaran</label>
                <Input value={formatDate(paymentDate)} readOnly className="h-12 rounded-xl border-slate-200 bg-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800">Akun KAS</label>
                <Input value={cashAccount} readOnly className="h-12 rounded-xl border-slate-200 bg-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800">Nama Akun</label>
                <Input value={accountName} readOnly className="h-12 rounded-xl border-slate-200 bg-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800">Nominal Bayar</label>
                <Input value={formatCurrency(totalNominal)} readOnly className="h-12 rounded-xl border-slate-200 bg-white" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-800">Total Rincian Pembayaran</label>
                <Input value={formatCurrency(totalRincian)} readOnly className="h-12 rounded-xl border-slate-200 bg-white" />
              </div>
            </div>

            <div className="mt-8 space-y-6">
              <TransactionDetailInlineTable
                items={billingDetail?.finance_billing_items ?? []}
                financeBillingId={source === 'billing' ? billingDetail?.id : undefined}
                paymentAt={
                  source === 'billing'
                    ? billingDetail?.last_payment_at?.slice(0, 10)
                    : undefined
                }
                disabled={source !== 'billing'}
              />

              <div className="mt-6 space-y-2">
                <label className="text-sm font-medium text-slate-800">Catatan</label>
                <Textarea value={note} readOnly className="min-h-28 resize-none rounded-2xl border-slate-200 bg-white" />
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 p-4">
                <p className="text-sm font-medium text-slate-800">Bukti Pembayaran (opsional)</p>
                <div className="mt-4 flex min-h-32 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-slate-500">
                  {proofUrl ? (
                    <a href={proofUrl} target="_blank" rel="noreferrer" className="font-medium text-[#18385b] underline">
                      Lihat bukti pembayaran
                    </a>
                  ) : (
                    <span>Belum ada bukti pembayaran yang diunggah.</span>
                  )}
                </div>
              </div>

              <div className="mt-8 flex items-center justify-center gap-4">
                <Button type="button" variant="ghost" onClick={() => router.back()}>
                  Batal
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
