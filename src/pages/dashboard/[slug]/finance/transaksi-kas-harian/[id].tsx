import { useState, useMemo, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeft, Check, ChevronsUpDown, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import TransactionDetailInlineTable from '@/components/features/kas-harian/TransactionDetailInlineTable';
import { useAccounts } from '@/hooks/useAccount';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useKas } from '@/hooks/useKas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useFinanceBillingDetail, useCreateFinanceBillingItem } from '@/hooks/useFinanceBilling';
import { useKasHarianDetail, useUpdateKasHarian } from '@/hooks/useKasHarian';
import { formatCurrency } from '@/lib/utils/currency';
import { getApiErrorMessage } from '@/utils/apiErrorHandler';
import { getAccountCategoryLabel } from '@/lib/account';
import { cn } from '@/lib/utils';

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

const formatDateInput = (value?: string) => {
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
  const companyId = cashFlowDetail?.company_id ?? 0;

  const kasQuery = useKas(companyId > 0 ? companyId : undefined);
  const accountQuery = useAccounts({
    page: 1,
    perPage: 1000,
    search: '',
    company_id: companyId > 0 ? companyId : undefined,
    enabled: companyId > 0,
  });

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

  // Payment Form States
  const mutation = useCreateFinanceBillingItem();
  const updateMutation = useUpdateKasHarian();
  const [paymentDate, setPaymentDate] = useState('');
  const [bcaIdr, setBcaIdr] = useState('');
  const [bcaUsd, setBcaUsd] = useState('');
  const [cash, setCash] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [transactionNote, setTransactionNote] = useState('');

  // Kas/Akun dropdown states for payment form
  const [selectedKasId, setSelectedKasId] = useState<number | null>(null);
  const [selectedAkunId, setSelectedAkunId] = useState<number | null>(null);
  const [kasOpen, setKasOpen] = useState(false);
  const [kasSearch, setKasSearch] = useState('');
  const [akunOpen, setAkunOpen] = useState(false);
  const [akunSearch, setAkunSearch] = useState('');
  const kasDropdownRef = useRef<HTMLDivElement | null>(null);
  const akunDropdownRef = useRef<HTMLDivElement | null>(null);

  const kasOptions = useMemo(() => kasQuery.data?.data ?? [], [kasQuery.data?.data]);
  const akunOptions = useMemo(() => accountQuery.data?.data ?? [], [accountQuery.data?.data]);

  const selectedKas = useMemo(() => kasOptions.find((k) => k.id === selectedKasId) ?? null, [kasOptions, selectedKasId]);
  const selectedAkun = useMemo(() => akunOptions.find((a) => a.id === selectedAkunId) ?? null, [akunOptions, selectedAkunId]);

  const filteredKasOptions = useMemo(() => {
    const q = kasSearch.trim().toLowerCase();
    if (!q) return kasOptions;
    return kasOptions.filter((k) =>
      [k.code, k.description, k.type].some((v) => String(v ?? '').toLowerCase().includes(q)),
    );
  }, [kasOptions, kasSearch]);

  const filteredAkunOptions = useMemo(() => {
    const q = akunSearch.trim().toLowerCase();
    if (!q) return akunOptions;
    return akunOptions.filter((a) =>
      [a.code, a.name, a.description].some((v) => String(v ?? '').toLowerCase().includes(q)),
    );
  }, [akunOptions, akunSearch]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!kasDropdownRef.current?.contains(event.target as Node)) {
        setKasOpen(false);
        setKasSearch('');
      }
      if (!akunDropdownRef.current?.contains(event.target as Node)) {
        setAkunOpen(false);
        setAkunSearch('');
      }
    };

    if (kasOpen || akunOpen) {
      document.addEventListener('mousedown', handlePointerDown);
    }

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [kasOpen, akunOpen]);

  // Billing Calculations
  const totalBeli = Number(financeBillingDetail?.unit_transaction_billing?.grand_total || cashFlowDetail?.finance_billing?.grand_total || 0);
  const totalPpn = 0;
  const totalBiaya = totalBeli + totalPpn;
  const totalCashPayment = Number(financeBillingDetail?.total_cash_payment || 0);
  const totalBcaPayment = Number(financeBillingDetail?.total_bca_payment || 0);
  const totalUsdPayment = Number(financeBillingDetail?.total_usd_payment || 0);
  const totalPaid = Number(financeBillingDetail?.total_paid || 0);
  const remainingPayment = Number(financeBillingDetail?.remaining_payment || totalBeli);
  const currentInputTotal = useMemo(() => parseMoneyInput(bcaIdr) + parseMoneyInput(bcaUsd) + parseMoneyInput(cash), [bcaIdr, bcaUsd, cash]);
  const totalBayar = totalPaid + currentInputTotal;
  const kurangBayar = Math.max(0, remainingPayment - currentInputTotal);

  useEffect(() => {
    if (financeBillingDetail?.last_payment_at) {
      setPaymentDate((current) => (current ? current : formatDateInput(financeBillingDetail.last_payment_at)));
    } else if (cashFlowDetail?.date) {
      setPaymentDate((current) => (current ? current : formatDateInput(cashFlowDetail.date)));
    }
  }, [financeBillingDetail?.last_payment_at, cashFlowDetail?.date]);

  useEffect(() => {
    if (cashFlowDetail) {
      setSelectedKasId(cashFlowDetail.cash_id);
      setSelectedAkunId(cashFlowDetail.account_id ?? null);
      setTransactionNote(cashFlowDetail.note || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cashFlowDetail?.id]);

  const handleSaveData = async () => {
    if (!cashFlowDetail) return;

    if (!selectedKasId) {
      toast.error('Kas terkait wajib dipilih');
      return;
    }

    if (!selectedAkunId) {
      toast.error('Nama akun wajib dipilih');
      return;
    }

    if (!transactionNote || transactionNote.trim().length < 3) {
      toast.error('Catatan transaksi minimal 3 karakter');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: cashFlowDetail.id,
        payload: {
          company_id: companyId,
          cash_id: selectedKasId,
          account_id: selectedAkunId,
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

  const handleSubmit = async () => {
    if (!financeBillingId) {
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
      note: paymentNote,
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
      await mutation.mutateAsync({ id: financeBillingId, payload });
      toast.success('Pembayaran berhasil disimpan');
      setBcaIdr('');
      setBcaUsd('');
      setCash('');
      setPaymentNote('');
      setPaymentProof(null);
      void cashFlowQuery.refetch();
      void financeBillingQuery.refetch();
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Gagal menyimpan pembayaran');
    }
  };

  const totalNominal = Number(cashFlowDetail?.finance_billing?.grand_total || 0) || Number(cashFlowDetail?.debet || 0) + Number(cashFlowDetail?.credit || 0);
  const totalRincian = Number(financeBillingDetail?.total_paid || 0) || totalNominal;
  const proofUrl = buildProofUrl(cashFlowDetail?.payment_proof);

  // Display values for readonly info card
  const kasDisplayValue = cashFlowDetail?.cash
    ? `${cashFlowDetail.cash.code ?? '-'} - ${cashFlowDetail.cash.description ?? '-'}`
    : '-';
  const akunDisplayValue = cashFlowDetail?.account
    ? `${cashFlowDetail.account.code ?? '-'} - ${cashFlowDetail.account.name ?? '-'}`
    : '-';

  return (
    <DashboardLayout>
      <Head>
        <title>Detail & Pembayaran Kas Harian - Wajira Dashboard</title>
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
              <h1 className="text-[36px] font-semibold tracking-tight text-slate-955">
                {isBillingFlow ? (remainingPayment > 0 ? 'Pembayaran Kas Harian' : 'Detail Pembayaran') : 'Detail Transaksi'}
              </h1>
              <p className="text-sm text-slate-500">{isBillingFlow ? 'Detail transaksi kas dan form pembayaran tagihan' : 'Detail transaksi kas harian'}</p>
            </div>
          </div>

          {/* 1. GENERAL INFO CARD (Read-only Summary) */}
          <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Kode Transaksi</label>
                <p className="text-base font-bold text-slate-900">{cashFlowDetail.code || '-'}</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tanggal Transaksi</label>
                <p className="text-base font-medium text-slate-800">{formatDate(cashFlowDetail.date)}</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Company</label>
                <p className="text-base font-medium text-slate-800">{cashFlowDetail.company?.name || '-'}</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Grand Total Billing</label>
                <p className="text-base font-bold text-[#18385b]">{formatCurrency(totalNominal)}</p>
              </div>
              <div className="space-y-1 pt-4 border-t border-slate-100 md:border-t-0 md:pt-0">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Debet (Uang Masuk)</label>
                <p className="text-base font-semibold text-emerald-600">{formatCurrency(Number(cashFlowDetail.debet || 0))}</p>
              </div>
              <div className="space-y-1 pt-4 border-t border-slate-100 md:border-t-0 md:pt-0">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Kredit (Uang Keluar)</label>
                <p className="text-base font-semibold text-rose-600">{formatCurrency(Number(cashFlowDetail.credit || 0))}</p>
              </div>
              <div className="space-y-1 pt-4 border-t border-slate-100 md:border-t-0 md:pt-0">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Terbayar</label>
                <p className="text-base font-medium text-slate-800">{formatCurrency(totalRincian)}</p>
              </div>
              <div className="space-y-1 pt-4 border-t border-slate-100 md:border-t-0 md:pt-0">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sisa Tagihan</label>
                <p className="text-base font-bold text-slate-900">{formatCurrency(remainingPayment)}</p>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4 mt-6 pt-6 border-t border-slate-100 text-xs text-slate-400">
              <div>Dibuat: {formatDate(cashFlowDetail.created_at)}</div>
              <div>Diupdate: {formatDate(cashFlowDetail.updated_at)}</div>
            </div>
          </div>

          {/* 2. KLASIFIKASI & CATATAN TRANSAKSI (Manual Data Finance) */}
          <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-semibold text-slate-900 font-medium text-slate-800">Klasifikasi & Catatan Transaksi</h3>
              <p className="text-sm text-slate-500 mt-1">
                {isBillingFlow
                  ? 'Klasifikasikan kas, akun, dan tambahkan catatan transaksi untuk pembukuan internal finance.'
                  : 'Rincian klasifikasi akun pembukuan dan catatan transaksi.'}
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {/* AKUN DROPDOWN */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800">Nama Akun</label>
                {isBillingFlow ? (
                  <div ref={akunDropdownRef} className="relative">
                    <button
                      type="button"
                      role="combobox"
                      aria-expanded={akunOpen}
                      aria-controls="akun-dropdown-list"
                      className={cn(
                        'flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-left text-sm font-normal hover:bg-slate-50 focus:outline-none focus:border-[#18385b] focus:ring-1 focus:ring-[#18385b] transition-all',
                        !selectedAkunId && 'text-slate-400',
                      )}
                      disabled={accountQuery.isLoading}
                      onClick={() => {
                        if (accountQuery.isLoading) return;
                        setAkunOpen((prev) => !prev);
                      }}
                    >
                      <span className="truncate">
                        {accountQuery.isLoading
                          ? 'Memuat akun...'
                          : selectedAkun
                            ? `${selectedAkun.code} - ${selectedAkun.name}`
                            : 'Pilih nama akun'}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-slate-400" />
                    </button>
                    {akunOpen ? (
                      <div id="akun-dropdown-list" className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[120] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                        <div className="border-b border-slate-100 p-2">
                          <Input placeholder="Cari akun..." value={akunSearch} onChange={(e) => setAkunSearch(e.target.value)} autoFocus />
                        </div>
                        <div className="max-h-64 overflow-y-auto p-2">
                          {filteredAkunOptions.length === 0 ? (
                            <div className="px-3 py-6 text-center text-sm text-slate-500">Akun tidak ditemukan.</div>
                          ) : (
                            filteredAkunOptions.map((a) => (
                              <button
                                key={a.id}
                                type="button"
                                className="flex w-full items-start gap-2 rounded-xl px-3 py-3 text-left text-sm hover:bg-slate-50"
                                onClick={() => { setSelectedAkunId(Number(a.id)); setAkunSearch(''); setAkunOpen(false); }}
                              >
                                <Check className={cn('mt-0.5 h-4 w-4', Number(a.id) === selectedAkunId ? 'opacity-100' : 'opacity-0')} />
                                <div className="space-y-1">
                                  <p className="font-medium text-slate-900">{a.name}</p>
                                  <p className="text-xs text-slate-500">{a.code}{a.description ? ` • ${a.description}` : ''}</p>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <Input value={akunDisplayValue} readOnly className="h-12 rounded-xl border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed" />
                )}
              </div>

              {/* KATEGORI */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800">Kategori</label>
                <Input
                  value={
                    isBillingFlow
                      ? selectedAkun?.category
                        ? getAccountCategoryLabel(selectedAkun.category)
                        : ''
                      : TRANSACTION_CATEGORY_MAP[cashFlowDetail.transaction_category || ''] || cashFlowDetail.transaction_category || '-'
                  }
                  readOnly
                  placeholder={isBillingFlow ? 'Otomatis mengikuti akun' : undefined}
                  className="h-12 rounded-xl border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                />
              </div>

              {/* KAS DROPDOWN */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800">Kas Terkait</label>
                {isBillingFlow ? (
                  <div ref={kasDropdownRef} className="relative">
                    <button
                      type="button"
                      role="combobox"
                      aria-expanded={kasOpen}
                      aria-controls="kas-dropdown-list"
                      className={cn(
                        'flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-left text-sm font-normal hover:bg-slate-50 focus:outline-none focus:border-[#18385b] focus:ring-1 focus:ring-[#18385b] transition-all',
                        !selectedKasId && 'text-slate-400',
                      )}
                      disabled={kasQuery.isLoading}
                      onClick={() => {
                        if (kasQuery.isLoading) return;
                        setKasOpen((prev) => !prev);
                      }}
                    >
                      <span className="truncate">
                        {kasQuery.isLoading
                          ? 'Memuat kas...'
                          : selectedKas
                            ? `${selectedKas.code} - ${selectedKas.description}`
                            : 'Pilih kas terkait'}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-slate-400" />
                    </button>
                    {kasOpen ? (
                      <div id="kas-dropdown-list" className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[120] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                        <div className="border-b border-slate-100 p-2">
                          <Input placeholder="Cari kas..." value={kasSearch} onChange={(e) => setKasSearch(e.target.value)} autoFocus />
                        </div>
                        <div className="max-h-64 overflow-y-auto p-2">
                          {filteredKasOptions.length === 0 ? (
                            <div className="px-3 py-6 text-center text-sm text-slate-500">Kas tidak ditemukan.</div>
                          ) : (
                            filteredKasOptions.map((k) => (
                              <button
                                key={k.id}
                                type="button"
                                className="flex w-full items-start gap-2 rounded-xl px-3 py-3 text-left text-sm hover:bg-slate-50"
                                onClick={() => { setSelectedKasId(Number(k.id)); setKasSearch(''); setKasOpen(false); }}
                              >
                                <Check className={cn('mt-0.5 h-4 w-4', Number(k.id) === selectedKasId ? 'opacity-100' : 'opacity-0')} />
                                <div className="space-y-1">
                                  <p className="font-medium text-slate-900">{k.description}</p>
                                  <p className="text-xs text-slate-500">{k.code} • {k.type}</p>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <Input value={kasDisplayValue} readOnly className="h-12 rounded-xl border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed" />
                )}
              </div>
            </div>

            {/* CATATAN TRANSAKSI */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-800">Catatan Transaksi</label>
              <Textarea
                value={isBillingFlow ? transactionNote : (cashFlowDetail.note || '')}
                onChange={isBillingFlow ? (event) => setTransactionNote(event.target.value) : undefined}
                readOnly={!isBillingFlow}
                placeholder={isBillingFlow ? 'Masukkan catatan transaksi...' : undefined}
                className={cn(
                  'min-h-24 resize-none rounded-xl border-slate-200 transition-colors',
                  isBillingFlow
                    ? 'bg-white border-slate-300 focus:border-[#18385b] focus:ring-1 focus:ring-[#18385b]'
                    : 'bg-slate-50 text-slate-500 cursor-not-allowed',
                )}
              />
            </div>

            {/* SIMPAN DATA KLASIFIKASI */}
            {isBillingFlow && (
              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  className="h-11 rounded-xl bg-[#18385b] px-6 text-white hover:bg-[#102843] transition-colors"
                  disabled={updateMutation.isPending}
                  onClick={() => void handleSaveData()}
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan Data'
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* 3. STATUS LUNAS / FORM PEMBAYARAN BARU */}
          {isBillingFlow && remainingPayment === 0 ? (
            <div className="rounded-[26px] border border-emerald-200 bg-emerald-50/50 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-base font-semibold text-emerald-800">Tagihan telah Lunas</span>
              </div>
              <p className="text-sm text-emerald-600 mt-1">Seluruh rincian pembayaran untuk transaksi ini telah diselesaikan.</p>
            </div>
          ) : null}

          {isBillingFlow && remainingPayment > 0 ? (
            <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg font-semibold text-slate-900">Form Pembayaran Baru</h3>
                <p className="text-sm text-slate-500 mt-1">Masukkan rincian pembayaran untuk melunasi tagihan ini</p>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
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

              <div className="grid gap-5 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900">Tanggal Bayar</label>
                  <Input type="date" value={paymentDate} onChange={(event) => setPaymentDate(event.target.value)} className="h-12 rounded-xl border-slate-200" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900">Sisa Sebelum Bayar</label>
                  <Input value={formatCurrency(remainingPayment)} readOnly className="h-12 rounded-xl border-slate-200 bg-slate-50 cursor-not-allowed text-slate-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900">Kurang Bayar Setelah Input</label>
                  <Input value={formatCurrency(kurangBayar)} readOnly className="h-12 rounded-xl border-slate-200 bg-slate-50 cursor-not-allowed text-slate-500" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-950">Bukti Pembayaran (opsional)</label>
                <label className="mt-2 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-slate-500 hover:bg-slate-100/70 transition-colors">
                  <Upload className="mb-2 h-6 w-6 text-slate-400" />
                  <span className="text-sm text-slate-700 font-medium">Klik untuk upload dokumen</span>
                  <span className="mt-0.5 text-xs text-slate-400">PNG, JPG maksimal 5MB</span>
                  {paymentProof ? <span className="mt-2 text-xs font-semibold text-[#18385b]">{paymentProof.name}</span> : null}
                  <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(event) => setPaymentProof(event.target.files?.[0] ?? null)} />
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900">Catatan Pembayaran</label>
                <Textarea value={paymentNote} onChange={(event) => setPaymentNote(event.target.value)} placeholder="Catatan pembayaran" className="min-h-20 resize-none rounded-xl border-slate-200" />
              </div>

              {/* ACTION BUTTONS FOR PAYMENT */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.back()}
                  className="h-11 rounded-xl px-6"
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  className="h-11 rounded-xl bg-[#18385b] px-6 text-white hover:bg-[#102843] transition-colors"
                  disabled={mutation.isPending}
                  onClick={() => void handleSubmit()}
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    'Bayar'
                  )}
                </Button>
              </div>
            </div>
          ) : null}

          {/* 4. RINCIAN ITEM TAGIHAN */}
          {isBillingFlow ? (
            <TransactionDetailInlineTable
              items={
                financeBillingDetail?.finance_billing_items && financeBillingDetail.finance_billing_items.length > 0
                  ? financeBillingDetail.finance_billing_items
                  : (cashFlowDetail.finance_billing?.finance_billing_items ?? [])
              }
              financeBillingId={financeBillingId}
              paymentAt={cashFlowDetail.date?.slice(0, 10)}
              disabled={false}
            />
          ) : null}

          {/* 5. BUKTI PEMBAYARAN UTAMA */}
          <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Bukti Pembayaran Utama</h3>
            <div className="flex min-h-32 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-slate-500">
              {proofUrl ? (
                <a href={proofUrl} target="_blank" rel="noreferrer" className="font-semibold text-[#18385b] hover:text-[#102843] underline transition-colors">
                  Lihat bukti pembayaran utama
                </a>
              ) : (
                <span className="text-sm">Belum ada bukti pembayaran utama yang diunggah.</span>
              )}
            </div>
          </div>

          {/* 6. FOOTER GENERAL NAVIGATION */}
          <div className="flex justify-center pt-4">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl border-slate-200 bg-white px-8 text-slate-700 hover:bg-slate-50 transition-colors"
              onClick={() => router.back()}
            >
              Kembali ke Daftar Kas Harian
            </Button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
