'use client';

import { useRouter } from 'next/router';
import SalesRefundFormPageContent from '@/components/features/refund-administrasi/SalesRefundFormPageContent';

export default function SalesRefundEditPage() {
  const router = useRouter();
  const transactionId = typeof router.query.id === 'string' ? router.query.id : '';
  const refundId = typeof router.query.refund_id === 'string' ? router.query.refund_id : '';

  return <SalesRefundFormPageContent transactionId={transactionId} mode="edit" refundId={refundId} />;
}
