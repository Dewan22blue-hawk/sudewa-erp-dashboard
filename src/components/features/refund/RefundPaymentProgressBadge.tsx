import { Badge } from '@/components/ui/badge';
import { getRefundPaymentProgressClasses, refundPaymentProgressLabel, type RefundPaymentProgressStatus } from './refund.utils';

interface RefundPaymentProgressBadgeProps {
  status: RefundPaymentProgressStatus;
}

export function RefundPaymentProgressBadge({ status }: RefundPaymentProgressBadgeProps) {
  return (
    <Badge variant="outline" className={getRefundPaymentProgressClasses(status)}>
      {refundPaymentProgressLabel[status]}
    </Badge>
  );
}
