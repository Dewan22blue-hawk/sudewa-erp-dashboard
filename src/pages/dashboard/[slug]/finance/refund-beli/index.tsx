import { FinanceRefundPage } from '@/components/features/finance-refund/FinanceRefundPage';
import { usePermissionGuard } from '@/hooks/usePermissionGuard';

export default function RefundBeliPage() {
  const { hasPermission } = usePermissionGuard();
  const canCreate = hasPermission('finance:create');
  const canEdit = hasPermission('finance:edit');
  const canDelete = hasPermission('finance:delete');

  return (
    <FinanceRefundPage
      title="Data Refund Pembelian"
      description="Kelola arus transaksi refund pembelian"
      transactionType="purchase"
    />
  );
}
