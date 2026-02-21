import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import { SALES_DATA } from '@/components/features/sales/sales.data';
import { SalesDetailCards } from '@/components/features/sales/detail/SalesDetailCards';
import { SalesUnitTable } from '@/components/features/sales/detail/SalesUnitTable';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { SalesItem } from '@/components/features/sales/sales.data';

/**
 * Detail Data Penjualan Unit - Image 4
 */
export default function SalesDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [isLoading, setIsLoading] = useState(true);
  const [salesData, setSalesData] = useState<SalesItem | null>(null);

  const { slug } = router.query;

  useEffect(() => {
    if (!id) return;

    const data = SALES_DATA.find((item) => item.id === id);
    if (data) {
      setSalesData(data);
    } else {
      toast.error('Data penjualan tidak ditemukan');
      // router.push(slug ? `/dashboard/${slug}/sales` : "/sales")
    }
    setIsLoading(false);
  }, [id, slug]);

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
              <ArrowLeft className="h-5 w-5" />
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
            <Button variant="outline" className="bg-white hover:bg-gray-50 text-black border-input" onClick={handlePayment}>
              <span className="mr-2 font-semibold text-lg leading-none">$</span>
              Bayar
            </Button>
            <Button className="bg-gray-100 hover:bg-gray-200 text-black border-input border" onClick={handleCreateUnit}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Unit
            </Button>
          </div>
        </div>

        {/* Print Header - Visible only on Print */}
        <div className="hidden print:block mb-8">
          <h1 className="text-2xl font-bold mb-2">Detail Penjualan Unit</h1>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold">Kode Jual</p>
              <p className="text-lg">{salesData.kodeJual}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Dicetak pada: {new Date().toLocaleDateString('id-ID')}</p>
            </div>
          </div>
        </div>

        {/* 3 Info Cards */}
        <SalesDetailCards data={salesData} />

        {/* Detail Unit Table */}
        <SalesUnitTable units={salesData.units} salesId={salesData.id} />
      </div>
    </DashboardLayout>
  );
}
