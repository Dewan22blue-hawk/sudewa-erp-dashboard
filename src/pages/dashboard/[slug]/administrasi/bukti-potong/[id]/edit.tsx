import Head from 'next/head';
import { useRouter } from 'next/router';
import { ChevronLeft, Loader2 } from 'lucide-react';
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
      <Head>
        <title>Edit Bukti Potong</title>
      </Head>

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8 rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-semibold text-slate-950">Edit Bukti Potong</h1>
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
