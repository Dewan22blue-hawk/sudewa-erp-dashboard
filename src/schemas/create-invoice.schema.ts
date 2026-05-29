import { z } from 'zod';

export const createInvoiceSchema = z.object({
  customerId: z.string().min(1, 'Customer wajib dipilih'),
  date: z.string().min(1, 'Tanggal wajib diisi'),
  subject: z.string().trim().min(1, 'Perihal wajib diisi'),
  letterContent: z.string().trim().min(1, 'Isi surat wajib diisi'),
  description: z.string().optional().default(''),
});

export type CreateInvoiceSchema = z.input<typeof createInvoiceSchema>;
