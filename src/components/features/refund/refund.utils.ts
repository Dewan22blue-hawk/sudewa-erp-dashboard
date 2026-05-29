import type { RefundApprovalStatus, RefundTransactionType } from '@/@types/finance-refund.types';

export const refundStatusLabel: Record<RefundApprovalStatus, string> = {
  waiting: 'Menunggu',
  approve: 'Disetujui',
  reject: 'Ditolak',
};

export const refundTypeLabel: Record<RefundTransactionType, string> = {
  purchase: 'Pembelian',
  sales: 'Penjualan',
};

export const normalizeRefundStatus = (value: string | null | undefined): RefundApprovalStatus => {
  if (value === 'approve' || value === 'reject') return value;
  return 'waiting';
};

export const normalizeRefundTransactionType = (value: string | null | undefined): RefundTransactionType => {
  if (value === 'sales') return 'sales';
  return 'purchase';
};

export const getRefundStatusClasses = (status: RefundApprovalStatus) => {
  if (status === 'approve') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }

  if (status === 'reject') {
    return 'border-red-200 bg-red-50 text-red-700';
  }

  return 'border-amber-200 bg-amber-50 text-amber-700';
};

export const getRefundProgress = (refundAmount: number, totalPaid: number) => {
  if (refundAmount <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((totalPaid / refundAmount) * 100)));
};
