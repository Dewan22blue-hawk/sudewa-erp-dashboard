'use client';

import { useRouter } from 'next/router';
import SalesRefundPageContent from '@/components/features/refund-administrasi/SalesRefundPageContent';

export default function SalesRefundPage() {
  const router = useRouter();
  const transactionId = typeof router.query.id === 'string' ? router.query.id : '';

  return <SalesRefundPageContent transactionId={transactionId} />;
}
