import { FinanceRefundPage } from '@/components/features/finance-refund/FinanceRefundPage';

export default function RefundJualPage() {
  return (
    <FinanceRefundPage
      title="Data Refund Penjualan"
      description="Kelola arus transaksi refund penjualan"
      transactionType="sales"
    />
  );
}
