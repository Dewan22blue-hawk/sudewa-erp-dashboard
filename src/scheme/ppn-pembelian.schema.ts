import { z } from "zod"

export const ppnPembelianSchema = z.object({
    kodeBeli: z.string().optional(), // Auto-generated
    noMesin: z.string().min(1, "No Mesin wajib diisi"),
    tanggalFPM: z.date({ required_error: "Tanggal FPM wajib diisi" }),
    masaNSFPM: z.date({ required_error: "Masa NSFPM wajib diisi" }),
    nsfpmMasukan: z.string().min(1, "NSFPM Masukan wajib diisi"),
    biaya: z.coerce.number().min(0),
})

export type PPNPembelianFormValues = z.infer<typeof ppnPembelianSchema>
