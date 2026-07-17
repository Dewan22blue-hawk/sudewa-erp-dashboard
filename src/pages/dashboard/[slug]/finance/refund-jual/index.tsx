import { FinanceRefundPage } from '@/components/features/finance-refund/FinanceRefundPage';
import { usePermissionGuard } from '@/hooks/usePermissionGuard';

export default function RefundJualPage() {
  const { hasPermission } = usePermissionGuard();
  const canCreate = hasPermission('finance:create');
  const canEdit = hasPermission('finance:edit');
  const canDelete = hasPermission('finance:delete');

  return (
    <FinanceRefundPage
      title="Data Refund Penjualan"
      description="Kelola arus transaksi refund penjualan"
      transactionType="sales"
    />
  );
}
