'use client';

import { useRouter } from 'next/router';
import SalesRefundFormPageContent from '@/components/features/refund-administrasi/SalesRefundFormPageContent';

export default function SalesRefundCreatePage() {
  const router = useRouter();
  const transactionId = typeof router.query.id === 'string' ? router.query.id : '';

  return <SalesRefundFormPageContent transactionId={transactionId} mode="create" />;
}
