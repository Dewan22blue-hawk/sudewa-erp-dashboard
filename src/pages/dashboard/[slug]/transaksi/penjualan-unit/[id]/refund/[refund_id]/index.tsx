'use client';

import { useRouter } from 'next/router';
import SalesRefundDetailPageContent from '@/components/features/refund-administrasi/SalesRefundDetailPageContent';

export default function SalesRefundDetailPage() {
  const router = useRouter();
  const transactionId = typeof router.query.id === 'string' ? router.query.id : '';
  const refundId = typeof router.query.refund_id === 'string' ? router.query.refund_id : '';

  return <SalesRefundDetailPageContent transactionId={transactionId} refundId={refundId} />;
}
