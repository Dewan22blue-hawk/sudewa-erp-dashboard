import Head from 'next/head';
import { useRouter } from 'next/router';
import { ArrowLeft, ChevronLeft, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import BuktiPotongForm from '@/components/features/bukti-potong/BuktiPotongForm';
import { useCompany } from '@/contexts/CompanyContext';
import { useWithholdingTaxDetail } from '@/hooks/useWithholdingTax';

export default function EditBuktiPotongPage() {
  const router = useRouter();
  const { companyId } = useCompany();
  const companyNumber = Number(companyId || 4);
  const slug = router.query.slug as string;
  const { id } = router.query;

  const { data, isLoading } = useWithholdingTaxDetail(id as string);

  const handleBack = () => {
    router.push(slug ? `/dashboard/${slug}/administrasi/bukti-potong` : '/administrasi/bukti-potong');
  };

  if (!id) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <button onClick={() => router.back()} className="mb-2 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </button>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Form Edit Bukti Potong</h1>
            <p className="text-sm text-muted-foreground">
              Kelola data Bukti Potong
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-10"><Loader2 className="animate-spin h-8 w-8 text-slate-500" /></div>
        ) : (
          <BuktiPotongForm
            item={data || null}
            companyId={companyNumber}
            onSuccess={handleBack}
            onCancel={handleBack}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
