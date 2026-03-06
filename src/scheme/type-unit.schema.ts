import { z } from 'zod';

const toOptionalNumber = (value: unknown) => {
  if (value === '' || value === null || value === undefined) return undefined;
  const num = Number(value);
  return Number.isNaN(num) ? undefined : num;
};

export const typeUnitSchema = z.object({
  brandId: z.coerce.number().min(1, 'Brand ID wajib diisi'),
  code: z.string().min(1, 'Kode wajib diisi'),
  name: z.string().min(1, 'Nama wajib diisi'),
  unitType: z.string().optional(),
  unitModel: z.string().optional(),
  brutoWeight: z.preprocess(toOptionalNumber, z.number().optional()),
  nettoWeight: z.preprocess(toOptionalNumber, z.number().optional()),
  capacity: z.preprocess(toOptionalNumber, z.number().optional()),
  image: z.any().optional().nullable(),
  sellPrice: z.preprocess(toOptionalNumber, z.number().optional()),
  buyPrice: z.preprocess(toOptionalNumber, z.number().optional()),
});

export type TypeUnitFormValues = z.infer<typeof typeUnitSchema>;
