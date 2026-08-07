import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { useKas } from '@/hooks/useKas';
import { KasTable } from '@/components/features/kas/KasTable';
import { useCompany } from '@/contexts/CompanyContext';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { KasFormDialog } from '@/components/features/kas/KasFormDialog';
import { usePermissionGuard } from '@/hooks/usePermissionGuard';

export default function KasPage() {
  const { companyId } = useCompany();
  const safeCompanyId = companyId || '1';

  const { data, isLoading, isError } = useKas(safeCompanyId);
  const { hasPermission } = usePermissionGuard();
  const canCreate = hasPermission('master-data:create');
  
  const sortedData = useMemo(() => {
    const rawData = data?.data ?? [];
    return [...rawData].sort((a: any, b: any) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (dateA !== dateB) return dateB - dateA;

      const idA = typeof a.id === 'number' ? a.id : parseInt(String(a.id)) || 0;
      const idB = typeof b.id === 'number' ? b.id : parseInt(String(b.id)) || 0;
      if (idA !== idB) return idB - idA;

      return (a.code || '').localeCompare(b.code || '');
    });
  }, [data?.data]);

  const [isFormOpen, setIsFormOpen] = useState(false);

  // --- RENDER STATES ---

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Kas</h1>
              <p className="text-sm text-muted-foreground">Kelola Kas Keuangan</p>
            </div>
          </div>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Kas</h1>
              <p className="text-sm text-muted-foreground">Kelola Kas Keuangan</p>
            </div>
          </div>
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Kas</h1>
            <p className="text-sm text-muted-foreground">Kelola Kas Keuangan</p>
          </div>
          {canCreate && (
            <Button onClick={() => setIsFormOpen(true)} className="w-full sm:w-auto bg-[#1e3a5f] hover:bg-[#152e4d]">
              <Plus className="mr-2 h-4 w-4" />
              Tambah
            </Button>
          )}
        </div>

        {/* TABLE CARD */}
        <div className="">
          <KasTable data={sortedData} />
        </div>
      </div>
      <KasFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        kas={null}
        companyId={safeCompanyId}
        title="Tambah Kas"
        description="Tambahkan data kas baru"
      />
    </DashboardLayout>
  );
}
