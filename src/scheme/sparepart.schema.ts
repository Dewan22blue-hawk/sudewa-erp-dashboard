import { z } from 'zod';

export const sparepartSchema = z.object({
  code: z.string().min(1, 'Kode wajib diisi'),
  name: z.string().min(1, 'Nama wajib diisi'),
  categoryId: z.coerce.number().min(1, 'Kategori wajib dipilih'),
  unit: z.string().min(1, 'Satuan wajib dipilih'),
  purchasePrice: z.coerce.number().min(0, 'Harga beli wajib diisi'),
  sellingPrice: z.coerce.number().min(1, 'Harga jual wajib diisi'),
});

export type SparepartFormValues = z.infer<typeof sparepartSchema>;
