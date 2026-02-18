import { z } from "zod"

export const kasHarianSchema = z.object({
    tanggal: z.date({
        required_error: "Tanggal wajib diisi",
    }),
    akun: z.string().min(1, "Akun wajib dipilih"),
    keterangan: z.string().min(1, "Keterangan wajib diisi"),
    nominal: z.number().min(1, "Nominal harus lebih dari 0"),
    type: z.enum(["debit", "kredit"]),
})

export type KasHarianFormValues = z.infer<typeof kasHarianSchema>
