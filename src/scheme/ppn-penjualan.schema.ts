import { z } from "zod"

export const ppnPenjualanSchema = z.object({
    kodeJual: z.string().optional(), // Auto-generated
    customer: z.string().min(1, "Customer wajib diisi"),
    tanggalFPK: z.date({ required_error: "Tanggal FPK wajib diisi" }),
    masaNSFPK: z.date({ required_error: "Masa NSFPK wajib diisi" }),
    nsfpkKeluaran: z.string().min(1, "NSFPK Keluaran wajib diisi"),
    biaya: z.coerce.number().min(0),
    // Other fields can be optional or have defaults
    qty: z.coerce.number().min(1),
    tipeUnit: z.string().min(1, "Tipe Unit wajib diisi"),
    noMesin: z.string().min(1, "No Mesin wajib diisi"),
    noRangka: z.string().min(1, "No Rangka wajib diisi"),
    hargaJual: z.coerce.number().min(0),
    hargaUnit: z.coerce.number().min(0),
    dppJual: z.coerce.number().min(0),
    ppn: z.coerce.number().min(0),
    paymentJual: z.coerce.number().min(0),
})

export type PPNPenjualanFormValues = z.infer<typeof ppnPenjualanSchema>
