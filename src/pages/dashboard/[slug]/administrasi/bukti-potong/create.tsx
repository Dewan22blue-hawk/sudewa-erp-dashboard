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
      <div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleBack}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-semibold tracking-tight">Tambah Bukti Potong</h1>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-5 md:p-6 shadow-sm">
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
