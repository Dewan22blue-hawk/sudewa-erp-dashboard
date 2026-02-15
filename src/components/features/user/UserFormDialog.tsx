"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createUserSchema, updateUserSchema, CreateUserFormValues, UpdateUserFormValues } from "@/scheme/user.schema"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { User } from "@/@types/user.types"
import { useCreateUser, useUpdateUser } from "@/hooks/useUser"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    user: User | null
    companyId: string
}

export function UserFormDialog({
    open,
    onOpenChange,
    user,
    companyId,
}: Props) {
    const isEdit = Boolean(user)
    const [showPassword, setShowPassword] = useState(false)

    const createMutation = useCreateUser(companyId)
    const updateMutation = useUpdateUser(companyId)

    // Using a union type for potential values
    const form = useForm<CreateUserFormValues | UpdateUserFormValues>({
        resolver: zodResolver(isEdit ? updateUserSchema : createUserSchema),
        defaultValues: {
            userId: "",
            name: "",
            password: "",
            role: undefined,
        },
    })

    // Reset Form when Modal Opens/Closes or User Changes
    useEffect(() => {
        if (open) {
            setShowPassword(false) // Reset password visibility
            if (user) {
                // Edit Mode: Prefill
                form.reset({
                    userId: user.userId, // Added userId prefill
                    name: user.name,
                    password: "", // Password always empty on edit start
                    role: user.role,
                })
            } else {
                // Create Mode: Reset all
                form.reset({
                    userId: "",
                    name: "",
                    password: "",
                    role: undefined,
                })
            }
        }
    }, [open, user, form])

    const onSubmit = async (values: any) => {
        if (createMutation.isPending || updateMutation.isPending) return

        try {
            if (isEdit && user) {
                await updateMutation.mutateAsync({
                    id: user.id,
                    name: values.name,
                    role: values.role,
                    password: values.password || undefined, // Send undefined if empty
                })
                toast.success("Data berhasil diperbarui")
            } else {
                await createMutation.mutateAsync({
                    ...values,
                })
                toast.success("Data berhasil ditambahkan")
            }
            onOpenChange(false)
        } catch (error: any) {
            toast.error(error?.message || "Terjadi kesalahan")
        }
    }

    const isBusy = createMutation.isPending || updateMutation.isPending || form.formState.isSubmitting

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Ubah Data User" : "Tambah Data User"}</DialogTitle>
                    <DialogDescription className="hidden">
                        Form untuk {isEdit ? "mengubah" : "menambah"} data user
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* User ID - Visible in both modes, disabled in Edit */}
                        <FormField
                            control={form.control}
                            name="userId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>User ID</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Tambahkan ID"
                                            {...field}
                                            disabled={isBusy || isEdit}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Name */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nama Pengguna</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Tambahkan nama" {...field} disabled={isBusy} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Password */}
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password {isEdit && "(Opsional)"}</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                placeholder={isEdit ? "Kosongkan jika tidak diubah" : "Masukkan password"}
                                                {...field}
                                                disabled={isBusy}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowPassword(!showPassword)}
                                                disabled={isBusy}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                                )}
                                                <span className="sr-only">Toggle password visibility</span>
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Role */}
                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        value={field.value}
                                        disabled={isBusy}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Pilih role" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Direksi">Direksi</SelectItem>
                                            <SelectItem value="Accounting">Accounting</SelectItem>
                                            <SelectItem value="Admin">Admin</SelectItem>
                                            <SelectItem value="Warehouse">Warehouse</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-2 pt-4">
                            <Button type="submit" className="w-full bg-black hover:bg-black/90" disabled={isBusy}>
                                {isBusy ? "Menyimpan..." : "Simpan"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => onOpenChange(false)}
                                disabled={isBusy}
                            >
                                Batal
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
