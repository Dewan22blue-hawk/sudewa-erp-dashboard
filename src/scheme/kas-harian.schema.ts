import { z } from 'zod';

const fileField = z
  .custom<File | null | undefined>((value) => {
    if (value === null || value === undefined) return true;
    if (typeof File === 'undefined') return true;
    return value instanceof File;
  }, 'Bukti pembayaran tidak valid')
  .optional();

const dateField = z.preprocess((value) => {
  if (value instanceof Date) return value;
  if (typeof value === 'string' && value.trim().length > 0) {
    return new Date(value);
  }
  return value;
}, z.date({ required_error: 'Tanggal wajib diisi', invalid_type_error: 'Tanggal wajib diisi' }).refine((value) => !Number.isNaN(value.getTime()), 'Tanggal wajib diisi'));

export const kasHarianSchema = z
  .object({
    company_id: z.number({ required_error: 'Perusahaan wajib dipilih' }).min(1, 'Perusahaan wajib dipilih'),
    cash_id: z.number({ required_error: 'Kas wajib dipilih' }).min(1, 'Kas wajib dipilih'),
    account_id: z.number({ required_error: 'Akun wajib dipilih' }).min(1, 'Akun wajib dipilih'),
    date: dateField,
    note: z.string().trim().min(3, 'Keterangan minimal 3 karakter'),
    debet: z.number().min(0, 'Debet tidak valid'),
    credit: z.number().min(0, 'Kredit tidak valid'),
    payment_proof: fileField,
  })
  .superRefine((value, ctx) => {
    const hasDebet = value.debet > 0;
    const hasCredit = value.credit > 0;

    if (!hasDebet && !hasCredit) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Minimal salah satu debet atau kredit harus diisi',
        path: ['debet'],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Minimal salah satu debet atau kredit harus diisi',
        path: ['credit'],
      });
    }

    if (hasDebet && hasCredit) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Debet dan kredit tidak boleh diisi bersamaan',
        path: ['debet'],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Debet dan kredit tidak boleh diisi bersamaan',
        path: ['credit'],
      });
    }
  });

export type KasHarianFormValues = z.infer<typeof kasHarianSchema>;
export type KasHarianFormInput = z.input<typeof kasHarianSchema>;
