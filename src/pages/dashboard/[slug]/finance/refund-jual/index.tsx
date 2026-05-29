import { FinanceRefundPage } from '@/components/features/finance-refund/FinanceRefundPage';

export default function RefundJualPage() {
  return (
    <FinanceRefundPage
      title="Data Refund Penjualan"
      description="Pantau refund penjualan dari modul Administrasi, cek histori pembayarannya, lalu lakukan approval dari satu tempat."
      transactionType="sales"
    />
  );
}
