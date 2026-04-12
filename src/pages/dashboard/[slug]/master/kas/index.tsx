import { DashboardLayout } from '@/components/layout/DashboardLayout';
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Kas</h1>
              <p className="text-sm text-muted-foreground">Kelola keuangan</p>
            </div>
          </div>
          <Card className="rounded-xl p-8 flex justify-center items-center h-[300px]">
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Kas</h1>
              <p className="text-sm text-muted-foreground">Kelola keuangan</p>
            </div>
          </div>
          <Card className="rounded-xl p-8 flex justify-center items-center h-[300px]">
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Kas</h1>
            <p className="text-sm text-muted-foreground">Kelola keuangan</p>
          </div>
        </div>

        {/* TABLE CARD */}
        <div className="">
          <KasTable data={data?.data ?? []} />
        </div>
      </div>
    </DashboardLayout>
  );
}
