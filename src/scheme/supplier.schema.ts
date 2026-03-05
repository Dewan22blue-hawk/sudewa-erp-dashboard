import { z } from "zod"

export const createSupplierSchema = z.object({
    name: z.string().min(1, "Nama supplier wajib diisi"),
    address: z.string().min(1, "Alamat wajib diisi"),
    npwp: z.string().min(15, "NPWP harus 15 digit").max(15, "NPWP harus 15 digit"),
    pic: z.string().optional(),
    phone: z.string().optional(),
})

export const updateSupplierSchema = z.object({
    name: z.string().min(1, "Nama supplier wajib diisi"),
    address: z.string().min(1, "Alamat wajib diisi"),
    npwp: z.string().min(15, "NPWP harus 15 digit").max(15, "NPWP harus 15 digit"),
    pic: z.string().optional(),
    phone: z.string().optional(),
})

export type CreateSupplierFormValues = z.infer<typeof createSupplierSchema>
export type UpdateSupplierFormValues = z.infer<typeof updateSupplierSchema>
