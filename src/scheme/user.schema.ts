import { z } from "zod"

export const createUserSchema = z.object({
    userId: z.string().min(3, "User ID minimal 3 karakter"),
    name: z.string().min(3, "Nama minimal 3 karakter"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    role: z.enum(["Direksi", "Accounting", "Admin", "Warehouse"], {
        required_error: "Role wajib dipilih",
    }),
})

export const updateUserSchema = z.object({
    name: z.string().min(3, "Nama minimal 3 karakter"),
    password: z.string().min(6, "Password minimal 6 karakter").optional().or(z.literal("")),
    role: z.enum(["Direksi", "Accounting", "Admin", "Warehouse"], {
        required_error: "Role wajib dipilih",
    }),
})

export type CreateUserFormValues = z.infer<typeof createUserSchema>
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>
