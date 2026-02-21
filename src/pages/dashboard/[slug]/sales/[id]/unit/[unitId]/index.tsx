import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ArrowLeft } from 'lucide-react';
import { PurchaseDetailCards } from '@/components/features/sales/detail/PurchaseDetailCards';
import { PurchaseUnitTable } from '@/components/features/sales/detail/PurchaseUnitTable';
import { SALES_DATA } from '@/components/features/sales/sales.data';
import { SalesDetail } from '@/types/sales';
import { toast } from 'sonner';
import { useEffect } from 'react';

/**
 * Server Side Data Fetching
 * Simulates Server Component behavior in Pages Router
 */
export const getServerSideProps: GetServerSideProps<{ data: SalesDetail | null }> = async (context) => {
  const { id } = context.params as { id: string; unitId: string };

  // Simulate API Delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // In a real scenario, we might fetch a specific 'Purchase' based on unitId?
  // For now, consistent with previous logic, we use the Sales Data.
  const data = SALES_DATA.find((item) => item.id === id) || null;

  return {
    props: {
      data: data as SalesDetail | null,
    },
  };
};

export default function UnitPurchaseDetailPage({ data }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();

  useEffect(() => {
    if (!data) {
      toast.error('Data penjualan tidak ditemukan');
      const slugQuery = router.query.slug;
      const slug = Array.isArray(slugQuery) ? slugQuery[0] : slugQuery || '';
      router.push(slug ? `/dashboard/${slug}/sales` : '/sales');
    }
  }, [data, router]);

  if (!data) {
    return (
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center h-[50vh]">
          <p className="text-muted-foreground">Data not found...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-10">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <button onClick={() => router.back()} className="mb-2 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </button>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Detail Pembelian Unit</h1>
            <p className="text-sm text-muted-foreground">
              Invoice <span className="text-blue-600 font-medium cursor-pointer hover:underline">{data.kodeJual}</span>
            </p>
          </div>
        </div>

        {/* 3 Info Cards (New Design) */}
        <PurchaseDetailCards data={data} />

        {/* Detail Unit Table (TanStack - New Design) */}
        <PurchaseUnitTable units={data.units} salesId={data.id} />
      </div>
    </DashboardLayout>
  );
}
