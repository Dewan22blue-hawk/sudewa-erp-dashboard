import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { SalesTable } from '@/components/features/sales/SalesTable';
import { useRouter } from 'next/router';
import { usePermissionGuard } from '@/hooks/usePermissionGuard';

/**
 * Sales Page - Penjualan Unit
 * Halaman untuk mengelola dan melacak semua penjualan unit
 */
export default function SalesPage() {
  const router = useRouter();
  const slugQuery = router.query.slug;
  const slug = Array.isArray(slugQuery) ? slugQuery[0] : slugQuery || '';

  const { hasPermission } = usePermissionGuard();
  const canCreate = hasPermission('transaction:create');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <PageHeader title="Penjualan Unit" description="Kelola dan lacak semua penjualan unit" />
          <div className="flex gap-2"></div>
        </div>

        {/* Sales Table */}
        <SalesTable
          onAdd={canCreate ? () => router.push(slug ? `/dashboard/${slug}/transaksi/penjualan-unit/create` : '/transaksi/penjualan-unit/create') : undefined}
        />
      </div>
    </DashboardLayout>
  );
}
