import { z } from 'zod';

export const kasHarianSchema = z
  .object({
    company_id: z.number({ required_error: 'Perusahaan wajib dipilih' }).min(1, 'Perusahaan wajib dipilih'),
    cash_id: z.number({ required_error: 'Kas wajib dipilih' }).min(1, 'Kas wajib dipilih'),
    account_id: z.number({ required_error: 'Akun wajib dipilih' }).min(1, 'Akun wajib dipilih'),
    date: z.date({ required_error: 'Tanggal wajib diisi' }),
    note: z.string().min(3, 'Keterangan minimal 3 karakter'),
    debet: z.number().min(0, 'Debet tidak valid'),
    credit: z.number().min(0, 'Kredit tidak valid'),
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
