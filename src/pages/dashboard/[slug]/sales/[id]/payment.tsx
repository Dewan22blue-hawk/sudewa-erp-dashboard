import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { useCompany } from '@/contexts/CompanyContext';
import { useSalesDetail } from '@/hooks/useSales';
import {
  useBillingValidation,
  useCreateBillingHistory,
  useCreateBillingV2,
  useCurrentBilling,
  useBillingHistory,
} from '@/hooks/useUnitBilling';
import { salesService } from '@/services/sales.service';
import { unitTransactionItemSalesService } from '@/services/unitTransactionItemSales.service';
import { formatCurrency } from '@/lib/utils/currency';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const readApiError = (error: any): string => {
  const stringifyDetail = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  };

  const details = error?.details ?? error?.response?.data?.errors;
  if (typeof details === 'string' && details.trim()) return details;

  if (details && typeof details === 'object') {
    const text = Object.entries(details)
      .map(([field, value]) => {
        if (Array.isArray(value)) {
          return `${field}: ${value.map((item) => stringifyDetail(item)).join(' | ')}`;
        }
        return `${field}: ${stringifyDetail(value)}`;
      })
      .join(', ')
      .trim();
    if (text) return text;
  }

  return error?.response?.data?.message || error?.message || 'Gagal menyimpan pembayaran.';
};

const readCheckRightAmountError = (error: any): string => {
  const payload = error?.response?.data ?? {};
  const errors = payload?.errors ?? error?.details;

  const invalidItems = errors?.invalid_items;
  const summary = errors?.summary;
  const hint = errors?.hint;

  if (!invalidItems && !summary && !hint) {
    return readApiError(error);
  }

  const invalidArray = Array.isArray(invalidItems)
    ? invalidItems
    : Array.isArray(summary)
      ? summary.filter((item: any) => item?.is_valid === false)
      : [];

  if (invalidArray.length === 0) {
    return hint ? `Validasi billing gagal. ${String(hint)}` : 'Validasi billing gagal. Lengkapi detail unit terlebih dahulu.';
  }

  const detailText = invalidArray
    .map((item: any) => {
      const itemId = item?.item_id ?? item?.unit_transaction_item_id ?? '-';
      const diff = item?.difference_total ?? item?.difference ?? (Number(item?.qty_input ?? 0) - Number(item?.qty_actual ?? 0));
      return `Item ${itemId}: kurang ${Number(diff) > 0 ? Number(diff) : 0} unit`;
    })
    .join('; ');

  return `Pembayaran belum bisa diproses. Detail unit belum lengkap -> ${detailText}.`;
};

const getInvalidItemIds = (error: any): string[] => {
  const payload = error?.response?.data ?? {};
  const errors = payload?.errors ?? error?.details;

  const invalidItems = Array.isArray(errors?.invalid_items) ? errors.invalid_items : [];
  const summaryItems = Array.isArray(errors?.summary)
    ? errors.summary.filter((item: any) => item?.is_valid === false)
    : [];

  const idsFromInvalid = invalidItems
    .map((item: any) => item?.item_id ?? item?.unit_transaction_item_id)
    .filter((item: any) => item !== undefined && item !== null)
    .map((item: any) => String(item));

  const idsFromSummary = summaryItems
    .map((item: any) => item?.item_id ?? item?.unit_transaction_item_id)
    .filter((item: any) => item !== undefined && item !== null)
    .map((item: any) => String(item));

  return Array.from(new Set([...idsFromInvalid, ...idsFromSummary]));
};

const hasCompleteSalesAssignmentsForInvalidItems = (salesDetailRaw: any, invalidItemIds: string[]): boolean => {
  if (!salesDetailRaw || invalidItemIds.length === 0) return false;

  const items = Array.isArray(salesDetailRaw?.unit_transaction_items) ? salesDetailRaw.unit_transaction_items : [];
  if (items.length === 0) return false;

  return invalidItemIds.every((invalidId) => {
    const row = items.find((item: any) => String(item?.id ?? '') === String(invalidId));
    if (!row) return false;

    const requiredQty = Number(row?.qty_total ?? 0);
    const assignedBySales = Array.isArray(row?.unit_transaction_item_sales) ? row.unit_transaction_item_sales.length : 0;

    return requiredQty > 0 && assignedBySales >= requiredQty;
  });
};

const hasCompleteSalesAssignmentsFromLatestSnapshot = async (salesId: string, fallbackRaw: any, invalidItemIds: string[]): Promise<boolean> => {
  if (invalidItemIds.length === 0) return false;

  if (hasCompleteSalesAssignmentsForInvalidItems(fallbackRaw, invalidItemIds)) {
    return true;
  }

  try {
    const latest = await salesService.getSalesDetail(salesId);
    return hasCompleteSalesAssignmentsForInvalidItems(latest?.raw, invalidItemIds);
  } catch {
    return false;
  }
};

const hasCompleteAssignmentsFromUnitItems = async (invalidItemIds: string[]): Promise<boolean> => {
  if (invalidItemIds.length === 0) return false;

  const checks = await Promise.allSettled(
    invalidItemIds.map(async (itemId) => {
      const unitItem = await unitTransactionItemSalesService.getUnitItemById(String(itemId));
      const requiredQty = Number(unitItem?.qty_total ?? 0);
      const assignedBySales = Array.isArray(unitItem?.unit_transaction_item_sales) ? unitItem.unit_transaction_item_sales.length : 0;
      const assignedByDetails = Array.isArray(unitItem?.unit_transaction_item_details) ? unitItem.unit_transaction_item_details.length : 0;
      const assigned = Math.max(assignedBySales, assignedByDetails);

      return requiredQty > 0 && assigned >= requiredQty;
    }),
  );

  return checks.every((result) => result.status === 'fulfilled' && result.value === true);
};

/**
 * Pembayaran Unit Page
 */
export default function PaymentPage() {
  const router = useRouter();
  const { id } = router.query;
  const salesId = Array.isArray(id) ? id[0] : id;
  const { companyId } = useCompany();
  const { data: salesDetail, isLoading: salesLoading } = useSalesDetail(salesId);
  const { refetch: revalidateAmount } = useBillingValidation(
    companyId ? String(companyId) : undefined,
    salesId ? String(salesId) : undefined,
    { enabled: false },
  );
  const {
    data: existingBilling,
    isLoading: billingLoading,
    refetch: refetchCurrentBilling,
  } = useCurrentBilling(salesId ? String(salesId) : undefined);
  const billingId = String(existingBilling?.id ?? '');
  const {
    data: billingHistories = [],
    isLoading: historyLoading,
    refetch: refetchBillingHistory,
  } = useBillingHistory(billingId || undefined, salesId ? String(salesId) : undefined);
  const createBilling = useCreateBillingV2();
  const createBillingHistory = useCreateBillingHistory();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | undefined>(undefined);

  const salesData = salesDetail?.ui ?? null;

  // Billing harus mengikuti total transaksi utama (unit transaction),
  // bukan agregasi item detail yang bisa berbeda kontrak datanya.
  const totalTagihan = Number(existingBilling?.grand_total ?? salesData?.totalJual ?? 0);

  const [form, setForm] = useState({
    bca_idr: 0,
    bca_usd: 0,
    cash: 0,
    payment_date: '',
    note: '',
  });

  useEffect(() => {
    setForm({
      bca_idr: Number(existingBilling?.bca_payment ?? 0),
      bca_usd: Number(existingBilling?.bca_payment_2 ?? 0),
      cash: Number(existingBilling?.cash_payment ?? 0),
      payment_date: existingBilling?.payment_date ? String(existingBilling.payment_date).slice(0, 10) : new Date().toISOString().slice(0, 10),
      note: '',
    });
  }, [existingBilling?.bca_payment, existingBilling?.bca_payment_2, existingBilling?.cash_payment, existingBilling?.payment_date]);

  const totalPaidFromHistory = useMemo(
    () =>
      billingHistories.reduce(
        (acc, item) =>
          acc + Number(item.bca_payment_amount ?? 0) + Number(item.cash_payment_amount ?? 0) + Number(item.bca_payment_usd_amount ?? 0),
        0,
      ),
    [billingHistories],
  );
  const totalPaidFromBilling = Number(
    existingBilling?.total_paid ??
    Number(existingBilling?.bca_payment ?? 0) +
    Number(existingBilling?.cash_payment ?? 0) +
    Number(existingBilling?.bca_payment_2 ?? 0),
  );
  const totalPaid = existingBilling?.is_paid ? Math.max(totalPaidFromBilling, totalPaidFromHistory) : totalPaidFromHistory;

  const totalBayarInput = useMemo(
    () => Number(form.bca_idr || 0) + Number(form.cash || 0) + Number(form.bca_usd || 0),
    [form.bca_idr, form.cash, form.bca_usd],
  );
  const kurangBayar = useMemo(() => Math.max(0, totalTagihan - (totalPaid + totalBayarInput)), [totalTagihan, totalPaid, totalBayarInput]);
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
    setIsSubmitting(true);
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
      const inputPayment = bcaPayment + cashPayment + bcaPayment2;

      if (inputPayment <= 0) {
        toast.error('Minimal salah satu nominal pembayaran harus lebih dari 0.');
        return;
      }

      setValidationMessage(undefined);

      const validationResult = await revalidateAmount();
      if (validationResult.error) {
        const message = readCheckRightAmountError(validationResult.error);
        setValidationMessage(message);
        const invalidItemIds = getInvalidItemIds(validationResult.error);

        const shouldIgnoreLegacyValidationMismatch = await hasCompleteSalesAssignmentsFromLatestSnapshot(
          String(salesId),
          salesDetail?.raw,
          invalidItemIds,
        );
        const shouldIgnoreWithItemService =
          !shouldIgnoreLegacyValidationMismatch && invalidItemIds.length > 0
            ? await hasCompleteAssignmentsFromUnitItems(invalidItemIds)
            : false;

        if (shouldIgnoreLegacyValidationMismatch || shouldIgnoreWithItemService) {
          setValidationMessage(undefined);
        } else {

          if (invalidItemIds.length > 0) {
            const slugQuery = router.query.slug;
            const slugValue = Array.isArray(slugQuery) ? slugQuery[0] : slugQuery || '';
            const basePath = slugValue ? `/dashboard/${slugValue}/sales` : '/sales';

            toast.error(message, {
              action: {
                label: 'Lengkapi Detail',
                onClick: () => {
                  router.push(`${basePath}/${salesId}/unit/${invalidItemIds[0]}`);
                },
              },
            });
            return;
          }

          throw new Error(message);
        }
      }

      const refreshedBilling = await refetchCurrentBilling();
      let billing = refreshedBilling.data ?? existingBilling ?? null;

      const latestGrandTotal = Number(billing?.grand_total ?? totalTagihan);
      const latestPaid = Number(billing?.total_paid ?? totalPaid);
      const latestRemaining = billing?.is_paid
        ? 0
        : Math.max(0, Number(billing?.remaining_payment ?? (latestGrandTotal - latestPaid)));

      if (inputPayment > latestRemaining) {
        toast.error('Nominal pembayaran melebihi sisa tagihan saat ini.');
        return;
      }

      if (!billing) {
        try {
          billing = await createBilling.mutateAsync({
            company_id: String(companyId),
            unit_transaction_id: String(salesId),
            is_paid: false,
          });
        } catch (error: any) {
          const statusCode = error?.statusCode ?? error?.response?.status;
          if (statusCode === 422) {
            const existing = await refetchCurrentBilling();
            billing = existing.data ?? null;
          } else {
            throw error;
          }
        }
      }

      if (!billing?.id) {
        const createdSnapshot = await refetchCurrentBilling();
        billing = createdSnapshot.data ?? billing ?? null;
      }

      if (!billing?.id) {
        throw new Error('Billing utama tidak ditemukan.');
      }

      await createBillingHistory.mutateAsync({
        unit_transaction_billing_id: String(billing.id),
        bca_payment_amount: bcaPayment,
        cash_payment_amount: cashPayment,
        bca_payment_usd_amount: bcaPayment2,
        payment_at: form.payment_date,
      });

      await Promise.all([refetchCurrentBilling(), refetchBillingHistory(), revalidateAmount()]);
      setForm((prev) => ({ ...prev, bca_idr: 0, bca_usd: 0, cash: 0 }));

      toast.success('Pembayaran berhasil disimpan!');
      const slugQuery = router.query.slug;
      const slug = Array.isArray(slugQuery) ? slugQuery[0] : slugQuery || '';
      const basePath = slug ? `/dashboard/${slug}/sales` : '/sales';
      router.push(`${basePath}/${salesId}`);
    } catch (error: any) {
      const message = readApiError(error);
      if (message.toLowerCase().includes('total payment exceeds grand total')) {
        toast.error('Nominal pembayaran melebihi sisa tagihan saat ini. Silakan refresh lalu gunakan nominal sesuai Sisa Bayar.');
        return;
      }
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (salesLoading || billingLoading || historyLoading || !salesData) {
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
              <span className="text-muted-foreground">Kode Jual</span>
              <span className="text-blue-600 font-medium">{salesData.kodeJual}</span>
            </div>
          </div>
        </div>

        <Card className="rounded-xl">
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold">Informasi Penjualan</h2>
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

              {validationMessage && (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">{validationMessage}</div>
              )}

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
                      type="text"
                      inputMode="numeric"
                      placeholder="BCA USD"
                      value={formatNumberWithDot(form.bca_usd)}
                      onChange={(e) => setForm((prev) => ({ ...prev, bca_usd: parseNumericInput(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">CASH IDR</p>
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
                    <Input value={formatCurrency(totalPaid + totalBayarInput)} disabled />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Kurang Bayar</p>
                    <Input value={formatCurrency(kurangBayar)} disabled />
                  </div>
                </div>
              </div>

              {/* ── Section: Catatan ── */}
              <div className="rounded-lg border">
                <div className="border-b px-4 py-3">
                  <h3 className="text-sm font-semibold text-muted-foreground">Catatan</h3>
                </div>
                <div className="p-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Note</p>
                    <Input
                      placeholder="Catatan pembayaran (opsional)"
                      value={form.note}
                      onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
                    />
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
                  disabled={isSubmitting || createBilling.isPending || createBillingHistory.isPending}
                >
                  {isSubmitting || createBilling.isPending || createBillingHistory.isPending ? (
                    'Menyimpan...'
                  ) : (
                    <>
                      <Wallet className="mr-2 h-4 w-4" />
                      Bayar
                    </>
                  )}
                </Button>
              </div>

              <div className="rounded-lg border">
                <div className="border-b px-4 py-3">
                  <h3 className="text-sm font-semibold text-muted-foreground">Histori Pembayaran</h3>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>BCA IDR</TableHead>
                        <TableHead>BCA USD</TableHead>
                        <TableHead>Cash</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead>Note</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {billingHistories.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-20 text-center text-muted-foreground">
                            Belum ada histori pembayaran
                          </TableCell>
                        </TableRow>
                      ) : (
                        billingHistories.map((item) => {
                          const rowTotal = Number(item.bca_payment_amount ?? 0) + Number(item.bca_payment_usd_amount ?? 0) + Number(item.cash_payment_amount ?? 0);
                          return (
                            <TableRow key={item.id}>
                              <TableCell>{item.payment_at ? String(item.payment_at).slice(0, 10) : '-'}</TableCell>
                              <TableCell>{formatCurrency(Number(item.bca_payment_amount ?? 0))}</TableCell>
                              <TableCell>{formatCurrency(Number(item.bca_payment_usd_amount ?? 0))}</TableCell>
                              <TableCell>{formatCurrency(Number(item.cash_payment_amount ?? 0))}</TableCell>
                              <TableCell className="text-right font-medium">{formatCurrency(rowTotal)}</TableCell>
                              <TableCell>{item.note || '-'}</TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
