import { z } from 'zod';

const toOptionalNumber = (value: unknown) => {
  if (value === '' || value === null || value === undefined) return undefined;
  const num = Number(value);
  return Number.isNaN(num) ? undefined : num;
};

export const ppnPenjualanSchema = z.object({
  kodeJual: z.string().optional(), // Auto-generated
  customer: z.string().min(1, 'Customer wajib diisi'),
  tanggalFPK: z.date({ required_error: 'Tanggal FPK wajib diisi' }),
  masaNSFPK: z.date({ required_error: 'Masa NSFPK wajib diisi' }),
  nsfpkKeluaran: z.string().min(1, 'NSFPK Keluaran wajib diisi'),
  biaya: z.preprocess(toOptionalNumber, z.number().optional()),
  // Other fields can be optional or have defaults
  qty: z.preprocess(toOptionalNumber, z.number().optional()),
  tipeUnit: z.string().min(1, 'Tipe Unit wajib diisi'),
  noMesin: z.string().min(1, 'No Mesin wajib diisi'),
  noRangka: z.string().min(1, 'No Rangka wajib diisi'),
  hargaJual: z.preprocess(toOptionalNumber, z.number().optional()),
  hargaUnit: z.preprocess(toOptionalNumber, z.number().optional()),
  dppJual: z.preprocess(toOptionalNumber, z.number().optional()),
  ppn: z.preprocess(toOptionalNumber, z.number().optional()),
  paymentJual: z.preprocess(toOptionalNumber, z.number().optional()),
});

export type PPNPenjualanFormValues = z.infer<typeof ppnPenjualanSchema>;
