import Head from 'next/head';
import { useRouter } from 'next/router';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
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
      {/* BREADCRUMB HEADER */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span className="hover:text-slate-800 cursor-pointer" onClick={() => router.push(`/dashboard/${slug}/administrasi/bukti-potong`)}>
          Bukti Potong
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
        <span className="font-medium text-slate-800">Tambah Bukti Potong</span>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={() => router.back()} variant="ghost" size="icon" className="h-10 w-10 rounded-md border border-slate-200 hover:bg-slate-50 cursor-pointer">
            <ArrowLeft className="h-5 w-5 text-slate-700" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-slate-900">Form Tambah Bukti Potong</h1>
            <span>Kelola data Bukti Potong</span>
          </div>
        </div>
      </div>

      <div className="rounded-md border bg-white p-5 md:p-6 shadow-sm">
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
