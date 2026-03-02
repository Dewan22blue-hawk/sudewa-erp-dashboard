import { z } from 'zod';

export const accountSchema = z.object({
  accountGroupId: z.number({ required_error: 'Grup akun wajib dipilih' }).positive('Grup akun wajib dipilih'),
  code: z.string().min(1, 'Kode akun wajib diisi'),
  name: z.string().min(1, 'Nama akun wajib diisi'),
  description: z.string().optional(),
  // Backend expects "debet"; allow both spellings for compatibility
  type: z.enum(['debet', 'debit', 'credit'], { required_error: 'Kategori wajib dipilih' }),
  category: z.enum(['DEBET', 'KREDIT']).optional(),
  isActive: z.boolean(),
});

export type AccountFormValues = z.infer<typeof accountSchema>;
