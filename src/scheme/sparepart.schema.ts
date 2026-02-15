import { z } from "zod"

export const sparepartSchema = z.object({
    code: z.string().min(1, "Kode wajib diisi"),
    name: z.string().min(1, "Nama wajib diisi"),
    group: z.string().min(1, "Grup wajib dipilih"),
    unit: z.string().min(1, "Satuan wajib dipilih"),
    sellingPrice: z.coerce.number().min(1, "Harga wajib diisi"),
})

export type SparepartFormValues = z.infer<typeof sparepartSchema>
