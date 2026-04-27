import { useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useFinanceBillingDetail } from '@/hooks/useFinanceBilling';
import { useKasHarianDetail } from '@/hooks/useKasHarian';
import { formatCurrency } from '@/lib/utils/currency';

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
  const id = typeof rawId === 'string' ? Number(rawId) : undefined;

  const cashFlowQuery = useKasHarianDetail(id);
  const financeBillingQuery = useFinanceBillingDetail(id, { enabled: typeof id === 'number' && Number.isFinite(id) });

  const detail = cashFlowQuery.data;
  const billingDetail = financeBillingQuery.data;

  const detailRows = useMemo(() => {
    if (billingDetail?.finance_billing_items?.length) {
      return billingDetail.finance_billing_items.map((item) => ({
        id: item.id,
        description: item.note || `Pembayaran ${item.id}`,
        amount: Number(item.cash_payment_amount || 0) + Number(item.bca_payment_amount || 0) + Number(item.bca_payment_usd_amount || 0),
        paymentAt: item.payment_at,
      }));
    }

    if (!detail) return [];

    return [
      {
        id: detail.id,
        description: detail.note || '-',
        amount: Number(detail.debet || 0) + Number(detail.credit || 0),
        paymentAt: detail.date,
      },
    ];
  }, [billingDetail?.finance_billing_items, detail]);

  const totalRincian = detailRows.reduce((total, row) => total + row.amount, 0);
  const totalNominal = Number(detail?.debet || 0) + Number(detail?.credit || 0);
  const proofUrl = buildProofUrl(billingDetail?.finance_billing_items?.[0]?.payment_proof);

  const isLoading = cashFlowQuery.isLoading || router.isFallback;
  const errorMessage = cashFlowQuery.error instanceof Error ? cashFlowQuery.error.message : null;

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
      ) : errorMessage || !detail ? (
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
              <h1 className="text-[36px] font-semibold tracking-tight text-slate-950">Detail Transaksi</h1>
              <p className="text-sm text-slate-500">Detail transaksi terkait</p>
            </div>
          </div>

          <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-5 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800">Tgl Pembayaran</label>
                <Input value={formatDate(detail.date)} readOnly className="h-12 rounded-xl border-slate-200 bg-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800">Akun KAS</label>
                <Input value={detail.cash.description} readOnly className="h-12 rounded-xl border-slate-200 bg-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800">Nama Akun</label>
                <Input value={detail.cash.code} readOnly className="h-12 rounded-xl border-slate-200 bg-white" />
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

            <div className="mt-8 rounded-[22px] border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-[30px] font-semibold text-slate-950">Detail Transaksi</h2>
                  <p className="text-sm text-slate-500">Rincian transaksi dan histori pembayaran</p>
                </div>
                <Button
                  type="button"
                  className="h-11 rounded-xl bg-[#18385b] px-5 hover:bg-[#102843]"
                  onClick={() => {
                    if (typeof slug !== 'string' || !id) return;
                    void router.push(`/dashboard/${slug}/finance/transaksi-kas-harian/${id}/bayar`);
                  }}
                >
                  Bayar
                </Button>
              </div>

              <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead className="bg-[#f3f6fb] text-xs font-semibold uppercase text-slate-700">
                    <tr>
                      <th className="px-4 py-3 text-left">No</th>
                      <th className="px-4 py-3 text-left">Keterangan</th>
                      <th className="px-4 py-3 text-left">Tanggal</th>
                      <th className="px-4 py-3 text-right">Nominal Bayar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {detailRows.map((row, index) => (
                      <tr key={row.id}>
                        <td className="px-4 py-3 text-slate-600">{index + 1}</td>
                        <td className="px-4 py-3 text-slate-800">{row.description}</td>
                        <td className="px-4 py-3 text-slate-600">{formatDate(row.paymentAt)}</td>
                        <td className="px-4 py-3 text-right font-medium text-slate-900">{formatCurrency(row.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 space-y-2">
                <label className="text-sm font-medium text-slate-800">Catatan</label>
                <Textarea
                  value={detail.note || billingDetail?.finance_billing_items?.[0]?.note || ''}
                  readOnly
                  className="min-h-28 resize-none rounded-2xl border-slate-200 bg-white"
                />
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
                <Button
                  type="button"
                  className="bg-[#18385b] hover:bg-[#102843]"
                  onClick={() => {
                    if (typeof slug !== 'string' || !id) return;
                    void router.push(`/dashboard/${slug}/finance/transaksi-kas-harian/${id}/bayar`);
                  }}
                >
                  Simpan
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
