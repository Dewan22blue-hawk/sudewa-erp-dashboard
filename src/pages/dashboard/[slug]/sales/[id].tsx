import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Wallet } from 'lucide-react';
import { SalesDetailCards } from '@/components/features/sales/detail/SalesDetailCards';
import { SalesUnitTable } from '@/components/features/sales/detail/SalesUnitTable';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useSalesDetail } from '@/hooks/useSales';
import { mapSalesDetailCard } from '@/services/sales.mapper';

/**
 * Detail Data Penjualan Unit - Image 4
 */
export default function SalesDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const salesId = Array.isArray(id) ? id[0] : id;
  const { data, isLoading } = useSalesDetail(salesId);

  const { slug } = router.query;
  const salesData = data?.ui ?? null;
  const mappedDetail = data?.raw
    ? mapSalesDetailCard(data.raw)
    : {
        code: '-',
        customerName: '-',
        warehouse: '-',
        total: 0,
        dpp: 0,
        ppn: 0,
      };

  useEffect(() => {
    if (!salesId || isLoading) return;

    if (!salesData) {
      toast.error('Data penjualan tidak ditemukan');
    }
  }, [salesData, salesId, isLoading, slug]);

  useEffect(() => {
    if (router.query.print === 'true' && !isLoading && salesData) {
      setTimeout(() => {
        window.print();
      }, 800);
    }
  }, [router.query.print, isLoading, salesData]);

  const handleCreateUnit = () => {
    const basePath = slug ? `/dashboard/${slug}/sales` : '/sales';
    router.push(`${basePath}/${id}/create-unit`);
  };

  const handlePayment = () => {
    const basePath = slug ? `/dashboard/${slug}/sales` : '/sales';
    router.push(`${basePath}/${id}/payment`);
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
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between print:hidden">
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="icon" className="mt-1 h-8 w-8" onClick={() => router.back()}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">Data Penjualan</h1>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Kode Jual</span>
                <span className="font-medium text-blue-600">{salesData.kodeJual}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 ml-12 md:ml-0">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={handlePayment}>
              <Wallet className="mr-2 h-4 w-4" />
              Bayar
            </Button>
          </div>
        </div>

        {/* Print Header - Visible only on Print */}
        <div className="hidden print:block mb-8">
          <h1 className="text-2xl font-bold mb-2">Detail Penjualan Unit</h1>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold">Kode Jual</p>
              <p className="text-lg">{mappedDetail.code}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Dicetak pada: {new Date().toLocaleDateString('id-ID')}</p>
            </div>
          </div>
        </div>

        {/* 3 Info Cards */}
        <SalesDetailCards data={salesData} />

        {/* Detail Unit Table */}
        <SalesUnitTable lineItems={salesData.lineItems} salesId={salesData.id} onAddUnit={handleCreateUnit} />
      </div>
    </DashboardLayout>
  );
}
