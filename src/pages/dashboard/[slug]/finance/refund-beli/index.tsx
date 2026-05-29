import { FinanceRefundPage } from '@/components/features/finance-refund/FinanceRefundPage';

export default function RefundBeliPage() {
  return (
    <FinanceRefundPage
      title="Data Refund Pembelian"
      description="Review refund pembelian yang dibuat dari modul Administrasi, lalu lakukan approval dan pilih cash account yang tepat."
      transactionType="purchase"
    />
  );
}
