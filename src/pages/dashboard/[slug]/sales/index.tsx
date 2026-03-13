import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { SalesTable } from '@/components/features/sales/SalesTable';
import { CreateSalesModal } from '@/components/features/sales/CreateSalesModal';
import { useRouter } from 'next/router';

/**
 * Sales Page - Penjualan Unit
 * Halaman untuk mengelola dan melacak semua penjualan unit
 */
export default function SalesPage() {
  const router = useRouter();
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <PageHeader title="Penjualan Unit" description="Kelola dan lacak semua penjualan unit" />
          <div className="flex gap-2"></div>
        </div>

        {/* Sales Table */}
        <SalesTable
          onAdd={() => setIsAddOpen(true)}
        />
      </div>

      <CreateSalesModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />
    </DashboardLayout>
  );
}
