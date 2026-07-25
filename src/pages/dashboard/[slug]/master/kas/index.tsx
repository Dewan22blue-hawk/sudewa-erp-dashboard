import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { useKas } from '@/hooks/useKas';
import { KasTable } from '@/components/features/kas/KasTable';
import { useCompany } from '@/contexts/CompanyContext';

export default function KasPage() {
  const { companyId } = useCompany();
  const safeCompanyId = companyId || '1';

  const { data, isLoading, isError } = useKas(safeCompanyId);

  // --- RENDER STATES ---

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <PageHeader
            title="Kas"
            subtitle="Kelola Kas Keuangan"
          />
          <Card className="rounded-md p-8 flex justify-center items-center h-[300px]">
            <div className="text-muted-foreground animate-pulse">Loading...</div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <PageHeader
            title="Kas"
            subtitle="Kelola Kas Keuangan"
          />
          <Card className="rounded-md p-8 flex justify-center items-center h-[300px]">
            <div className="text-destructive font-medium">Terjadi kesalahan saat mengambil data</div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <PageHeader
          title="Kas"
          subtitle="Kelola Kas Keuangan"
        />

        {/* TABLE CARD */}
        <div className="">
          <KasTable data={data?.data ?? []} />
        </div>
      </div>
    </DashboardLayout>
  );
}
