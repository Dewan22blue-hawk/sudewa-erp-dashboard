import Head from 'next/head';
import { useRouter } from 'next/router';
import { ChevronLeft } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import BuktiPotongForm from '@/components/features/bukti-potong/BuktiPotongForm';
import { useCompany } from '@/contexts/CompanyContext';

export default function CreateBuktiPotongPage() {
  const router = useRouter();
  const { companyId } = useCompany();
  const companyNumber = Number(companyId || 4);
  const slug = router.query.slug as string;

  const handleBack = () => {
    router.push(slug ? `/dashboard/${slug}/administrasi/bukti-potong` : '/administrasi/bukti-potong');
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Tambah Bukti Potong</title>
      </Head>

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8 rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-semibold text-slate-950">Tambah Bukti Potong</h1>
        </div>

        <BuktiPotongForm
          item={null}
          companyId={companyNumber}
          onSuccess={handleBack}
          onCancel={handleBack}
        />
      </div>
    </DashboardLayout>
  );
}
