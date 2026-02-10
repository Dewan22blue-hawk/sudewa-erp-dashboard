import { z } from "zod"

/**
 * Edit Unit Validation Schema - EXACT sesuai Figma
 */
export const editUnitSchema = z.object({
    // Main fields
    tipeUnit: z.string().min(1, "Tipe Unit wajib dipilih"),
    qty: z.number().min(1, "Qty minimal 1"),

    // Harga section
    harga: z.number().min(0, "Harga tidak boleh negatif"),

    // Satuan section
    hppSatuan: z.number().min(0),
    totalHpp: z.number().min(0),
    dppSatuan: z.number().min(0),
    totalDpp: z.number().min(0),
    ppnSatuan: z.number().min(0),
    totalPpn: z.number().min(0),

    // Biaya section
    biayaBbn: z.number().min(0),
    biayaEkspedisi: z.number().min(0),
    biayaLain: z.number().min(0),
})

export type EditUnitFormData = z.infer<typeof editUnitSchema>
