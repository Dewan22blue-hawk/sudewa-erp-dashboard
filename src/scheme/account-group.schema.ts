import { z } from 'zod';

export const accountGroupSchema = z.object({
  code: z.string().min(1, 'Kode wajib diisi'),
  name: z.string().min(1, 'Nama wajib diisi'),
  description: z.string().optional(),
  isActive: z.boolean(),
});

export type AccountGroupFormValues = z.infer<typeof accountGroupSchema>;
