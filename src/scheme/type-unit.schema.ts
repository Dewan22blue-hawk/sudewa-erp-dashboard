import { z } from "zod"

export const typeUnitSchema = z.object({
    merk: z.string().min(1, "Merk wajib dipilih"),
    code: z.string().min(1, "Kode wajib diisi"),
    type: z.string().min(1, "Tipe wajib diisi"),
    jenis: z.string().optional(),
    model: z.string().optional(),
    bruto: z.number().optional(),
    netto: z.number().optional(),
})

export type TypeUnitFormValues = z.infer<typeof typeUnitSchema>
