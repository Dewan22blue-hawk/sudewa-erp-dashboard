import { z } from 'zod';

/**
 * Edit Unit Validation Schema - EXACT sesuai Figma
 */
export const editUnitSchema = z.object({
  customer: z.string().optional(),

  // Main fields
  tipeUnit: z.string().min(1, 'Tipe Unit wajib dipilih'),
  qty: z.number().optional(),

  // Harga section
  harga: z.number().min(0, 'Harga tidak boleh negatif'),

  // Satuan section
  hppSatuan: z.number().min(0).optional(),
  totalHpp: z.number().min(0).optional(),
  dppSatuan: z.number().min(0).optional(),
  totalDpp: z.number().min(0).optional(),
  ppnSatuan: z.number().min(0).optional(),
  totalPpn: z.number().min(0).optional(),

  // Biaya section
  biayaBbn: z.number().min(0),
  biayaEkspedisi: z.number().min(0),
  biayaLain: z.number().min(0),
});

export type EditUnitFormData = z.infer<typeof editUnitSchema>;
