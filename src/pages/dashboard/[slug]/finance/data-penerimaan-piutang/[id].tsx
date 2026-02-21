import { useRouter } from 'next/router';
import { usePenerimaanPiutangDetail } from '@/hooks/usePenerimaanPiutang';
import PenerimaanPiutangDetailHeader from '@/components/features/penerimaan-piutang/PenerimaanPiutangDetailHeader';
import PenerimaanPiutangPaymentTable from '@/components/features/penerimaan-piutang/PenerimaanPiutangPaymentTable';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function DetailPenerimaanPiutangPage() {
  const router = useRouter();
  // Ensure id is string
  const id = typeof router.query.id === 'string' ? router.query.id : '';
  const { data, loading } = usePenerimaanPiutangDetail(id);

  if (loading)
    return (
      <DashboardLayout>
        <div>Loading...</div>
      </DashboardLayout>
    );
  if (!data) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PenerimaanPiutangDetailHeader data={data} />
        <PenerimaanPiutangPaymentTable payments={data.payments} />
      </div>
    </DashboardLayout>
  );
}
