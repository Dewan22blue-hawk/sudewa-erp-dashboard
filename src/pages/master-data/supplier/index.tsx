import { SupplierManagementPage } from '@/components/features/supplier/SupplierManagementPage';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function SupplierPage() {
  return (
    <DashboardLayout>
      <SupplierManagementPage />
    </DashboardLayout>
  );
}
