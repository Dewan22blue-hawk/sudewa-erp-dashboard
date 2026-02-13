import { z } from "zod"

export const createSupplierSchema = z.object({
    name: z.string().min(1, "Nama supplier wajib diisi"),
    address: z.string().min(1, "Alamat wajib diisi"),
    npwp: z.string().min(15, "NPWP harus 15 digit").max(15, "NPWP harus 15 digit"),
    pic: z.string().min(1, "PIC wajib diisi"),
    phone: z.string().min(1, "Nomor telepon wajib diisi"),
})

export const updateSupplierSchema = z.object({
    name: z.string().min(1, "Nama supplier wajib diisi"),
    address: z.string().min(1, "Alamat wajib diisi"),
    npwp: z.string().min(15, "NPWP harus 15 digit").max(15, "NPWP harus 15 digit"),
    pic: z.string().min(1, "PIC wajib diisi"),
    phone: z.string().min(1, "Nomor telepon wajib diisi"),
})

export type CreateSupplierFormValues = z.infer<typeof createSupplierSchema>
export type UpdateSupplierFormValues = z.infer<typeof updateSupplierSchema>
