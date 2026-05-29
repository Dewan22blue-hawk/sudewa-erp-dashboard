'use client';

import { useRouter } from 'next/router';
import PurchaseRefundPageContent from '@/components/features/refund-administrasi/PurchaseRefundPageContent';

export default function PurchaseRefundPage() {
  const router = useRouter();
  const transactionId = typeof router.query.id === 'string' ? router.query.id : '';

  return <PurchaseRefundPageContent transactionId={transactionId} />;
}
