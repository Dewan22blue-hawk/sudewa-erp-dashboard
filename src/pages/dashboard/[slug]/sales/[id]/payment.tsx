import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';
import { PaymentForm } from '@/components/features/sales/payment/PaymentForm';
import { toast } from 'sonner';
import { useSalesDetail } from '@/hooks/useSales';
import { useCreateBilling, useUnitBillings } from '@/hooks/useUnitBilling';
import { useCompany } from '@/contexts/CompanyContext';
import { UpsertUnitBillingPayload } from '@/@types/unit-billing.types';

/**
 * Pembayaran Unit Page
 */
export default function PaymentPage() {
  const router = useRouter();
  const { id } = router.query;
  const salesId = Array.isArray(id) ? id[0] : id;
  const { companyId } = useCompany();
  const { data: salesDetail, isLoading: salesLoading } = useSalesDetail(salesId);
  const { data: billings = [], isLoading: billingLoading } = useUnitBillings(salesId);
  const createBilling = useCreateBilling();

  const salesData = salesDetail?.ui ?? null;
  const totalTagihan = Number(salesData?.totalJual ?? 0);
  const totalPaid = billings.reduce(
    (acc, item) => acc + Number(item.bca_payment ?? 0) + Number(item.cash_payment ?? 0) + Number(item.bca_payment_2 ?? 0),
    0,
  );

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
      const submittedTotal = bcaPayment + cashPayment + bcaPayment2;
      const isPaid = totalPaid + submittedTotal >= totalTagihan && totalTagihan > 0;

      const payload: UpsertUnitBillingPayload = {
        company_id: String(companyId),
        unit_transaction_id: String(salesId),
        bca_payment: bcaPayment,
        cash_payment: cashPayment,
        bca_payment_2: bcaPayment2,
        payment_date: new Date().toISOString().slice(0, 10),
        is_paid: isPaid,
      };

      await createBilling.mutateAsync(payload);

      toast.success('Pembayaran berhasil disimpan!');
      const slugQuery = router.query.slug;
      const slug = Array.isArray(slugQuery) ? slugQuery[0] : slugQuery || '';
      const basePath = slug ? `/dashboard/${slug}/sales` : '/sales';
      router.push(`${basePath}/${salesId}`);
    } catch (error: any) {
      toast.error(error?.message || 'Gagal menyimpan pembayaran.');
    }
  };

  if (salesLoading || billingLoading || !salesData) {
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
            <h2 className="text-2xl font-semibold">Informasi Pembelian</h2>
            <Separator className="my-4" />
            <PaymentForm salesData={salesData} onSubmit={handleSubmit} onCancel={() => router.back()} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
