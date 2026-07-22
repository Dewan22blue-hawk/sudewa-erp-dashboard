'use client';

import { useRouter } from 'next/router';
import PurchaseRefundFormPageContent from '@/components/features/refund-administrasi/PurchaseRefundFormPageContent';

export default function TransaksiRefundBeliEditPage() {
  const router = useRouter();
  const refundId = typeof router.query.refund_id === 'string' ? router.query.refund_id : '';

  if (!refundId) return null;

  return <PurchaseRefundFormPageContent mode="edit" refundId={refundId} />;
}
