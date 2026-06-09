import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeft, Loader2 } from 'lucide-react';
import TransactionDetailInlineTable from '@/components/features/kas-harian/TransactionDetailInlineTable';
import { useAccount } from '@/hooks/useAccount';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useKas } from '@/hooks/useKas';
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
  const { slug, id: rawId } = router.query;
  const cashFlowId = typeof rawId === 'string' ? Number(rawId) : undefined;

  const cashFlowQuery = useKasHarianDetail(cashFlowId, {
    enabled: typeof cashFlowId === 'number' && Number.isFinite(cashFlowId),
    refetchInterval: LIVE_UPDATE_INTERVAL,
  });

  const cashFlowDetail = cashFlowQuery.data;
  const financeBillingId = cashFlowDetail?.finance_billing?.id;
  const accountId = cashFlowDetail?.account_id ?? null;
  const cashId = cashFlowDetail?.cash_id ?? null;
  const companyId = cashFlowDetail?.company_id ?? 0;

  const accountQuery = useAccount(accountId && accountId > 0 ? accountId : undefined);
  const cashQuery = useKas(companyId > 0 ? companyId : undefined);

  const financeBillingQuery = useFinanceBillingDetail(financeBillingId, {
    enabled: typeof financeBillingId === 'number' && Number.isFinite(financeBillingId),
    refetchInterval: typeof financeBillingId === 'number' ? LIVE_UPDATE_INTERVAL : false,
  });

  const financeBillingDetail = financeBillingQuery.data;
  const isBillingFlow = Boolean(financeBillingId);
  const isLoading = cashFlowQuery.isLoading || (isBillingFlow && financeBillingQuery.isLoading) || router.isFallback;
  const errorMessage =
    cashFlowQuery.error instanceof Error
      ? cashFlowQuery.error.message
      : financeBillingQuery.error instanceof Error
        ? financeBillingQuery.error.message
        : null;

  const totalNominal = Number(cashFlowDetail?.finance_billing?.grand_total || 0) || Number(cashFlowDetail?.debet || 0) + Number(cashFlowDetail?.credit || 0);
  const totalRincian = Number(financeBillingDetail?.total_paid || 0) || totalNominal;
  const proofUrl = buildProofUrl(cashFlowDetail?.payment_proof);
  const fallbackCash = (cashQuery.data?.data ?? []).find((item) => Number(item.id) === Number(cashId));
  const accountValue = cashFlowDetail?.account
    ? `${cashFlowDetail.account.code ?? '-'} - ${cashFlowDetail.account.name ?? '-'}`
    : accountQuery.data
      ? `${accountQuery.data.code ?? '-'} - ${accountQuery.data.name ?? '-'}`
      : '-';
  const cashValue =
    cashFlowDetail?.cash && (cashFlowDetail.cash.code !== '-' || cashFlowDetail.cash.description !== '-')
      ? `${cashFlowDetail.cash.code ?? '-'} - ${cashFlowDetail.cash.description ?? '-'}`
      : fallbackCash
        ? `${fallbackCash.code ?? '-'} - ${fallbackCash.description ?? '-'}`
        : '-';

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
      ) : errorMessage || !cashFlowDetail ? (
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
              <h1 className="text-[36px] font-semibold tracking-tight text-slate-950">{isBillingFlow ? 'Detail Pembayaran' : 'Detail Transaksi'}</h1>
              <p className="text-sm text-slate-500">{isBillingFlow ? 'Detail transaksi kas dan finance billing terkait' : 'Detail transaksi kas harian'}</p>
            </div>
          </div>

          <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-5 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800">Kode Transaksi</label>
                <Input value={cashFlowDetail.code || '-'} readOnly className="h-12 rounded-xl border-slate-200 bg-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800">Tanggal</label>
                <Input value={formatDate(cashFlowDetail.date)} readOnly className="h-12 rounded-xl border-slate-200 bg-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800">Kategori</label>
                <Input value={cashFlowDetail.transaction_category || '-'} readOnly className="h-12 rounded-xl border-slate-200 bg-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800">Kas</label>
                <Input value={cashValue} readOnly className="h-12 rounded-xl border-slate-200 bg-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800">Akun</label>
                <Input value={accountValue} readOnly className="h-12 rounded-xl border-slate-200 bg-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800">Company</label>
                <Input value={cashFlowDetail.company?.name || '-'} readOnly className="h-12 rounded-xl border-slate-200 bg-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800">Debet</label>
                <Input value={formatCurrency(Number(cashFlowDetail.debet || 0))} readOnly className="h-12 rounded-xl border-slate-200 bg-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800">Kredit</label>
                <Input value={formatCurrency(Number(cashFlowDetail.credit || 0))} readOnly className="h-12 rounded-xl border-slate-200 bg-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800">Grand Total Billing</label>
                <Input value={formatCurrency(totalNominal)} readOnly className="h-12 rounded-xl border-slate-200 bg-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800">Dibuat</label>
                <Input value={formatDate(cashFlowDetail.created_at)} readOnly className="h-12 rounded-xl border-slate-200 bg-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800">Diupdate</label>
                <Input value={formatDate(cashFlowDetail.updated_at)} readOnly className="h-12 rounded-xl border-slate-200 bg-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800">Total Rincian Pembayaran</label>
                <Input value={formatCurrency(totalRincian)} readOnly className="h-12 rounded-xl border-slate-200 bg-white" />
              </div>
            </div>

            <div className="mt-8 space-y-6">
              {isBillingFlow ? (
                <TransactionDetailInlineTable
                  items={financeBillingDetail?.finance_billing_items ?? cashFlowDetail.finance_billing?.finance_billing_items ?? []}
                  financeBillingId={financeBillingId}
                  paymentAt={cashFlowDetail.date?.slice(0, 10)}
                  disabled={false}
                />
              ) : null}

              <div className="mt-6 space-y-2">
                <label className="text-sm font-medium text-slate-800">Catatan</label>
                <Textarea value={cashFlowDetail.note || ''} readOnly className="min-h-28 resize-none rounded-2xl border-slate-200 bg-white" />
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
                {isBillingFlow ? (
                  <Button
                    type="button"
                    className="h-11 rounded-xl bg-[#18385b] px-6 text-white hover:bg-[#102843]"
                    onClick={() => {
                      if (typeof slug === 'string' && cashFlowId) {
                        void router.push(`/dashboard/${slug}/finance/transaksi-kas-harian/${cashFlowId}/bayar?source=billing`);
                      }
                    }}
                  >
                    Bayar
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
