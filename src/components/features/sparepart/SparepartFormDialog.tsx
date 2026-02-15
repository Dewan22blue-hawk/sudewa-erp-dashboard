"use client"

import { useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { sparepartSchema, SparepartFormValues } from "@/scheme/sparepart.schema"
import { Sparepart } from "@/@types/sparepart.types"
import { useCreateSparepart, useUpdateSparepart } from "@/hooks/useSparepart"
import { toast } from "sonner"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    sparepart: Sparepart | null
    companyId: string
}

export function SparepartFormDialog({
    open,
    onOpenChange,
    sparepart,
    companyId,
}: Props) {
    const isEdit = Boolean(sparepart)

    const createMutation = useCreateSparepart(companyId)
    const updateMutation = useUpdateSparepart(companyId)

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<SparepartFormValues>({
        resolver: zodResolver(sparepartSchema),
    })

    useEffect(() => {
        if (sparepart) {
            reset({
                code: sparepart.code,
                name: sparepart.name,
                group: sparepart.group,
                unit: sparepart.unit,
                sellingPrice: sparepart.sellingPrice,
            })
        } else {
            reset({
                code: "",
                name: "",
                group: "",
                unit: "",
                sellingPrice: 0,
            })
        }
    }, [sparepart, reset])

    const onSubmit = async (values: SparepartFormValues) => {
        try {
            if (isEdit && sparepart) {
                await updateMutation.mutateAsync({
                    id: sparepart.id,
                    payload: values,
                })
                toast.success("Data berhasil diperbarui")
            } else {
                await createMutation.mutateAsync({
                    ...values,
                    companyId,
                })
                toast.success("Data berhasil ditambahkan")
            }

            onOpenChange(false)
            reset()
        } catch {
            toast.error("Terjadi kesalahan")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Ubah Data SparePart" : "Tambah Data SparePart"}
                    </DialogTitle>
                    <DialogDescription>
                        Masukkan detail sparepart baru
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Input placeholder="Tambahkan kode" {...register("code")} />
                        {errors.code && (
                            <p className="text-xs text-destructive mt-1">
                                {errors.code.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <Input placeholder="Tambahkan nama" {...register("name")} />
                        {errors.name && (
                            <p className="text-xs text-destructive mt-1">
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <Select
                            onValueChange={(value) => setValue("group", value)}
                            defaultValue={sparepart?.group}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih Grup" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PART">PART</SelectItem>
                                <SelectItem value="OLI">OLI</SelectItem>
                                <SelectItem value="Others">Others</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.group && (
                            <p className="text-xs text-destructive mt-1">
                                {errors.group.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <Select
                            onValueChange={(value) => setValue("unit", value)}
                            defaultValue={sparepart?.unit}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih Satuan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PCS">PCS</SelectItem>
                                <SelectItem value="Set">Set</SelectItem>
                                <SelectItem value="Box">Box</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.unit && (
                            <p className="text-xs text-destructive mt-1">
                                {errors.unit.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <Input
                            type="number"
                            placeholder="Tambahkan harga"
                            {...register("sellingPrice")}
                        />
                        {errors.sellingPrice && (
                            <p className="text-xs text-destructive mt-1">
                                {errors.sellingPrice.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2 pt-2">
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            Simpan
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => onOpenChange(false)}
                        >
                            Batal
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
