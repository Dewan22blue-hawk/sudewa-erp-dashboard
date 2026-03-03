import { z } from 'zod';

export const typeUnitSchema = z.object({
  brandId: z.coerce.number().min(1, 'Brand ID wajib diisi'),
  code: z.string().min(1, 'Kode wajib diisi'),
  name: z.string().min(1, 'Nama wajib diisi'),
  unitType: z.string().optional(),
  unitModel: z.string().optional(),
  brutoWeight: z.coerce.number().optional(),
  nettoWeight: z.coerce.number().optional(),
  capacity: z.coerce.number().optional(),
  image: z.any().optional().nullable(),
  sellPrice: z.coerce.number().optional(),
  buyPrice: z.coerce.number().optional(),
});

export type TypeUnitFormValues = z.infer<typeof typeUnitSchema>;
