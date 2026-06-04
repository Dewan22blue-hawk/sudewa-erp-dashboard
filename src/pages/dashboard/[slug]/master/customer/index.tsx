import { CustomerManagementPage } from '@/components/features/customer/CustomerManagementPage';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function CustomerPage() {
  return (
    <DashboardLayout>
      <CustomerManagementPage />
    </DashboardLayout>
  );
}
