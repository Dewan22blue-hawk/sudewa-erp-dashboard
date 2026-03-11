import { z } from 'zod';

const toOptionalNumber = (value: unknown) => {
  if (value === '' || value === null || value === undefined) return undefined;
  const num = Number(value);
  return Number.isNaN(num) ? undefined : num;
};

export const ppnPembelianSchema = z.object({
  kodeBeli: z.string().optional(), // Auto-generated
  noMesin: z.string().min(1, 'No Mesin wajib diisi'),
  tanggalFPM: z.date({ required_error: 'Tanggal FPM wajib diisi' }),
  masaNSFPM: z.date({ required_error: 'Masa NSFPM wajib diisi' }),
  nsfpmMasukan: z.string().min(1, 'NSFPM Masukan wajib diisi'),
  biaya: z.preprocess((val) => toOptionalNumber(val), z.number().optional()),
});

export type PPNPembelianFormValues = z.infer<typeof ppnPembelianSchema>;
