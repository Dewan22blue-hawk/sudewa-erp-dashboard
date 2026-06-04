import { z } from 'zod';

export const createRefundSchema = z.object({
  unit_transaction_id: z.string().min(1, 'Transaksi wajib dipilih'),
  refund_date: z.string().min(1, 'Tanggal refund wajib diisi'),
  refund_amount: z.coerce.number().min(1, 'Nominal refund harus lebih dari 0'),
  note: z.string().optional(),
  unit_transaction_item_detail_ids: z.array(z.coerce.number()).min(1, 'Pilih minimal satu unit yang akan direfund.'),
});

export type CreateRefundFormValues = z.infer<typeof createRefundSchema>;

export const createRefundPaymentSchema = z.object({
  unit_transaction_refund_id: z.string().min(1, 'Refund ID wajib ada'),
  amount: z.coerce.number().min(1, 'Nominal pembayaran harus lebih dari 0'),
  payment_date: z.string().min(1, 'Tanggal pembayaran wajib diisi'),
  note: z.string().optional(),
});

export type CreateRefundPaymentFormValues = z.infer<typeof createRefundPaymentSchema>;

export const financeApprovalRefundSchema = z.object({
  status: z.enum(['waiting', 'approve', 'reject'], {
    required_error: 'Status wajib dipilih',
  }),
  cash_id: z.string().optional(), // Bisa opsional jika reject
}).refine(data => {
  if (data.status === 'approve' && !data.cash_id) {
    return false;
  }
  return true;
}, {
  message: 'Kas/Bank wajib dipilih jika status approve',
  path: ['cash_id'],
});

export type FinanceApprovalRefundFormValues = z.infer<typeof financeApprovalRefundSchema>;
