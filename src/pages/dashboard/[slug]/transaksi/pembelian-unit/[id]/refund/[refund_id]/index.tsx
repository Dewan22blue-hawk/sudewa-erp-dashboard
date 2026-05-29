'use client';

import { useRouter } from 'next/router';
import PurchaseRefundDetailPageContent from '@/components/features/refund-administrasi/PurchaseRefundDetailPageContent';

export default function PurchaseRefundDetailPage() {
  const router = useRouter();
  const transactionId = typeof router.query.id === 'string' ? router.query.id : '';
  const refundId = typeof router.query.refund_id === 'string' ? router.query.refund_id : '';

  return <PurchaseRefundDetailPageContent transactionId={transactionId} refundId={refundId} />;
}
