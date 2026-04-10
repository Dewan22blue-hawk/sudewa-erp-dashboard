// src/scheme/purchase.schema.ts

import { z } from 'zod';

/* ============================
   PURCHASE HEADER
============================ */

export const createPurchaseSchema = z.object({
  date: z.string().min(1, 'Tanggal wajib diisi'),
  supplierName: z.string().min(1, 'Supplier wajib diisi'),
  companyId: z.string().min(1),
});

export const updatePurchaseSchema = z.object({
  date: z.string().min(1, 'Tanggal wajib diisi'),
  supplierName: z.string().min(1, 'Supplier wajib diisi'),
});

/* ============================
   PURCHASE UNIT
============================ */

export const createPurchaseUnitSchema = z.object({
  typeUnitId: z.string().optional(),
  qty: z.number().min(1, 'Qty minimal 1').optional(),
  price: z.number().min(0),
  biayaBBN: z.number().min(0),
  biayaEkspedisi: z.number().min(0),
  biayaLain: z.number().min(0),
});

export type CreatePurchaseFormValues = z.infer<typeof createPurchaseSchema>;
export type UpdatePurchaseFormValues = z.infer<typeof updatePurchaseSchema>;
export type CreatePurchaseUnitFormValues = z.infer<typeof createPurchaseUnitSchema>;
