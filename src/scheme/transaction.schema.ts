import { z } from "zod"

export const transactionSchema = z.object({
    date: z.string().min(1, "Tanggal wajib diisi"),
    name: z.string().min(3, "Nama transaksi minimal 3 karakter"),
    debitUSD: z.preprocess((val) => Number(val) || 0, z.number().optional()),
    creditUSD: z.preprocess((val) => Number(val) || 0, z.number().optional()),
    debitIDR: z.preprocess((val) => Number(val) || 0, z.number().optional()),
    creditIDR: z.preprocess((val) => Number(val) || 0, z.number().optional()),
    debitCash: z.preprocess((val) => Number(val) || 0, z.number().optional()),
    creditCash: z.preprocess((val) => Number(val) || 0, z.number().optional()),
    description: z.string().optional(),
}).refine(
    (data) => {
        const values = [
            data.debitUSD,
            data.creditUSD,
            data.debitIDR,
            data.creditIDR,
            data.debitCash,
            data.creditCash,
        ]
        return values.some((v) => v !== undefined && v > 0)
    },
    {
        message: "Minimal satu nilai nominal transaksi harus diisi (Debit/Kredit)",
        path: ["name"], // Attach error to name field generally, or handle specifically in form
    }
)

export type TransactionFormValues = z.infer<typeof transactionSchema>
