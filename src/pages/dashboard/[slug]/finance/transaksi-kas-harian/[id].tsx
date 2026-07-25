import { useState, useMemo, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ArrowLeft, Loader2, Tag, Upload, Info, Save, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import FinanceBillingTable from '@/components/features/kas-harian/FinanceBillingTable';
import TransactionCategoryModal from '@/components/features/kas-harian/TransactionCategoryModal';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useKasHarianDetail, useUpdateKasHarian } from '@/hooks/useKasHarian';
import TogglePaymentStatusDialog from '@/components/features/kas-harian/TogglePaymentStatusDialog';
import { getApiErrorMessage } from '@/utils/apiErrorHandler';
import { currenciesFormat } from '@/components/ui/currenciesFormat';
import { cn } from '@/lib/utils';
import { CopyBox } from '@/components/ui/copy-box';

const LIVE_UPDATE_INTERVAL = 5000;

const TRANSACTION_CATEGORY_MAP: Record<string, string> = {
  general: 'Umum (General)',
  operational: 'Operasional (Operational)',
  director_receivable: 'Piutang Direktur (Director Receivable)',
  shareholder_receivable: 'Piutang Pemegang Saham (Shareholder Receivable)',
  receivable: 'Piutang Usaha (Receivable)',
  inventory: 'Persediaan (Inventory)',
};

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

  const [isToggleOpen, setIsToggleOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const cashFlowQuery = useKasHarianDetail(cashFlowId, {
    enabled: typeof cashFlowId === 'number' && Number.isFinite(cashFlowId),
    refetchInterval: false,
  });

  const cashFlowDetail = cashFlowQuery.data;
  const companyId = cashFlowDetail?.company_id ?? 0;
  const financeBillings = useMemo(() => cashFlowDetail?.finance_billings ?? [], [cashFlowDetail?.finance_billings]);
  const hasBillings = financeBillings.length > 0;

  const updateMutation = useUpdateKasHarian();
  const [transactionNote, setTransactionNote] = useState('');

  const isLoading = cashFlowQuery.isLoading || router.isFallback;
  const errorMessage = cashFlowQuery.error instanceof Error ? cashFlowQuery.error.message : null;

  const handleUploadProof = async (file: File) => {
    if (!cashFlowDetail) return;
    setIsUploading(true);

    try {
      await updateMutation.mutateAsync({
        id: cashFlowDetail.id,
        payload: {
          company_id: companyId,
          date: cashFlowDetail.date.slice(0, 10),
          note: transactionNote.trim() || cashFlowDetail.note || '',
          debet: cashFlowDetail.debet,
          credit: cashFlowDetail.credit,
          transaction_category: cashFlowDetail.transaction_category || 'general',
          payment_proof: file,
        },
      });
      toast.success('Bukti pembayaran utama berhasil disimpan');
      setSelectedFile(null);
      void cashFlowQuery.refetch();
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Gagal menyimpan bukti pembayaran utama');
    } finally {
      setIsUploading(false);
    }
  };

  const grandTotal = Number(cashFlowDetail?.grand_total || cashFlowDetail?.unit_transaction_billing?.grand_total || 0);
  const totalPaid = useMemo(
    () => financeBillings.reduce((sum, fb) => sum + Number(fb.amount || 0), 0),
    [financeBillings],
  );
  const remainingPayment = Number(cashFlowDetail?.remaining_payment ?? Math.max(0, grandTotal - totalPaid));
  const proofUrl = buildProofUrl(cashFlowDetail?.payment_proof);

  useEffect(() => {
    if (cashFlowDetail) {
      setTransactionNote(cashFlowDetail.note || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cashFlowDetail?.id]);

  const handleSaveData = async () => {
    if (!cashFlowDetail) return;

    if (!transactionNote || transactionNote.trim().length < 3) {
      toast.error('Catatan transaksi minimal 3 karakter');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: cashFlowDetail.id,
        payload: {
          company_id: companyId,
          date: cashFlowDetail.date.slice(0, 10),
          note: transactionNote.trim(),
          debet: cashFlowDetail.debet,
          credit: cashFlowDetail.credit,
          transaction_category: cashFlowDetail.transaction_category || 'general',
        },
      });
      toast.success('Data transaksi berhasil disimpan');
      void cashFlowQuery.refetch();
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Gagal menyimpan data transaksi');
    }
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Detail & Pembayaran Kas Harian - Wajira Dashboard</title>
      </Head>

      {/* BREADCRUMB HEADER */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span className="hover:text-slate-800 cursor-pointer" onClick={() => router.push(`/dashboard/${slug}/finance/transaksi-kas-harian`)}>
          Transaksi Kas Harian
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
        <span className="font-medium text-slate-800">Detail Transaksi</span>
      </div>

      {isLoading ? (
        <div className="flex min-h-[50vh] items-center justify-center rounded-md border border-slate-200 bg-white">
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
          {/* HEADER */}
          <div className="flex items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-4">
              <Button onClick={() => router.push(typeof slug === 'string' ? `/dashboard/${slug}/finance/transaksi-kas-harian` : '/dashboard')} variant="ghost" size="icon" className="h-10 w-10 rounded-md border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <ArrowLeft className="h-5 w-5 text-slate-700" />
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold">
                    {hasBillings ? (remainingPayment > 0 ? 'Pembayaran Kas Harian' : 'Detail Pembayaran') : 'Detail Transaksi'}
                  </h1>
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider",
                    cashFlowDetail.is_paid
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  )}>
                    {cashFlowDetail.is_paid ? 'Lunas' : 'Belum Lunas'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{hasBillings ? 'Detail transaksi kas dan pembayaran tagihan' : 'Detail transaksi kas harian'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-md px-4 text-xs font-semibold cursor-pointer border-slate-200 hover:bg-slate-50 transition-all"
                onClick={() => {
                  setTargetStatus(!cashFlowDetail.is_paid);
                  setIsToggleOpen(true);
                }}
                disabled={Number(remainingPayment) !== 0 && !cashFlowDetail?.is_valid}
              >
                {cashFlowDetail.is_paid ? 'Tandai Belum Lunas' : 'Tandai Lunas'}
              </Button>
            </div>
          </div>

          {/* 1. GENERAL INFO CARD */}
          <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Kode Transaksi</label>
                <div className="flex items-center gap-1.5">
                  {(cashFlowDetail.unit_transaction_billing_id || cashFlowDetail.goods_transaction_billing_id || cashFlowDetail.unit_transaction_billing || cashFlowDetail.goods_transaction_billing) ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" className="cursor-help text-[#18385b] hover:text-[#102843] transition-colors flex items-center">
                            <Info className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="start" className="max-w-xs bg-slate-900 text-white rounded-lg p-2 text-xs shadow-md">
                          Data Arus Transaksi Kas Harian ini terhubung dengan data Administrasi
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : null}
                  <CopyBox text={cashFlowDetail?.code || '-'} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tanggal Transaksi</label>
                <p className="text-base font-medium text-slate-800">{formatDate(cashFlowDetail.date)}</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Perusahaan</label>
                <p className="text-base font-medium text-slate-800">{cashFlowDetail.company?.name || '-'}</p>
              </div>
              <div className="space-y-1 pt-4 border-t border-slate-100 md:border-t-0 md:pt-0">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Debet (Uang Masuk)</label>
                <p className="text-base font-semibold text-emerald-600">{currenciesFormat('idr', Number(cashFlowDetail.debet || 0))}</p>
              </div>
              <div className="space-y-1 pt-4 border-t border-slate-100 md:border-t-0 md:pt-0">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Kredit (Uang Keluar)</label>
                <p className="text-base font-semibold text-rose-600">{currenciesFormat('idr', Number(cashFlowDetail.credit || 0))}</p>
              </div>
              <div className="space-y-1 pt-4 border-t border-slate-100 md:border-t-0 md:pt-0">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Terbayar</label>
                <p className="text-base font-medium text-slate-800">{currenciesFormat('idr', totalPaid)}</p>
              </div>
              <div className="space-y-1 pt-4 border-t border-slate-100 md:border-t-0 md:pt-0">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sisa Tagihan</label>
                <p className="text-base font-bold text-slate-900">{currenciesFormat('idr', remainingPayment)}</p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100 pt-2" />

            <div className="grid gap-6 md:grid-cols-3">
              {/* TRANSACTION CATEGORY - Clickable */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800">Kategori Transaksi</label>
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(true)}
                  className={cn(
                    'flex h-10 w-full items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-left text-sm transition-all',
                    'hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:border-[#18385b] focus:ring-1 focus:ring-[#18385b] cursor-pointer',
                  )}
                >
                  <Tag className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="flex-1 truncate font-medium text-slate-800">
                    {TRANSACTION_CATEGORY_MAP[cashFlowDetail.transaction_category || ''] || cashFlowDetail.transaction_category || '-'}
                  </span>
                  <span className="text-xs font-semibold text-[#18385b] hover:underline">Ubah</span>
                </button>
              </div>

              {/* CATATAN TRANSAKSI */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-800">Catatan Transaksi</label>
                <div className="flex gap-4 items-start">
                  <Textarea
                    value={transactionNote}
                    onChange={(event) => setTransactionNote(event.target.value)}
                    placeholder="Masukkan catatan transaksi..."
                    className="resize-none rounded-md border-slate-200 bg-white border-slate-300 focus:border-[#18385b] focus:ring-1 focus:ring-[#18385b] transition-colors flex-1"
                  />
                  <Button
                    type="button"
                    className="h-10 rounded-md bg-[#18385b] px-6 text-white hover:bg-[#102843] transition-colors shrink-0"
                    disabled={updateMutation.isPending}
                    onClick={() => void handleSaveData()}
                  >
                    {updateMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Simpan Catatan
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100 pt-6" />

            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4 text-xs text-slate-400">
              <div>Dibuat: {formatDate(cashFlowDetail.created_at)}</div>
              <div>Diupdate: {formatDate(cashFlowDetail.updated_at)}</div>
            </div>
          </div>

          {/* 3. STATUS LUNAS */}
          {remainingPayment === 0 && financeBillings.length > 0 ? (
            <div className="rounded-md border border-emerald-200 bg-emerald-50/50 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-base font-semibold text-emerald-800">Tagihan sudah dilengkapi</span>
              </div>
              <p className="text-sm text-emerald-600 mt-1">Transaksi ini sudah dilengkapi dengan rincian pembayaran.</p>
            </div>
          ) : null}

          {/* 4. TABEL PEMBAYARAN (FinanceBillings) */}
          <FinanceBillingTable
            financeBillings={financeBillings}
            cashFlowDetail={cashFlowDetail}
            companyId={companyId}
          />

          {/* 5. BUKTI PEMBAYARAN UTAMA */}
          <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Bukti Pembayaran Utama</h3>
              {proofUrl && (
                <a href={proofUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-[#18385b] hover:text-[#102843] underline transition-colors">
                  Lihat bukti pembayaran utama saat ini
                </a>
              )}
            </div>

            <div className="space-y-3">
              <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-center hover:bg-slate-100/50 transition-colors">
                <Upload className="mb-3 h-7 w-7 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">
                  {selectedFile ? selectedFile.name : (proofUrl ? 'Klik untuk ganti bukti pembayaran' : 'Klik untuk upload bukti pembayaran')}
                </span>
                <span className="mt-1 text-xs text-slate-400">PNG, JPG, PDF maksimal 5MB</span>
                <input autoComplete="off"
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    if (file) {
                      setSelectedFile(file);
                    }
                  }}
                />
              </label>

              {selectedFile && (
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 rounded-md px-4 text-xs font-semibold cursor-pointer border-slate-200 hover:bg-slate-50"
                    onClick={() => setSelectedFile(null)}
                    disabled={isUploading}
                  >
                    Batal
                  </Button>
                  <Button
                    type="button"
                    className="h-10 rounded-md bg-[#18385b] px-4 text-xs font-semibold text-white hover:bg-[#102843] transition-colors cursor-pointer"
                    onClick={() => void handleUploadProof(selectedFile)}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Mengunggah...
                      </>
                    ) : (
                      'Simpan Bukti Pembayaran'
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* 6. FOOTER */}
          <div className="flex justify-center pt-4">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-md border-slate-200 bg-white px-8 text-slate-700 hover:bg-slate-50 transition-colors"
              onClick={() => router.back()}
            >
              Kembali ke Daftar Kas Harian
            </Button>
          </div>

          <TogglePaymentStatusDialog open={isToggleOpen} onOpenChange={setIsToggleOpen} data={cashFlowDetail} targetStatus={targetStatus} />
          <TransactionCategoryModal open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen} cashFlowDetail={cashFlowDetail} />
        </div>
      )
      }
    </DashboardLayout >
  );
}
