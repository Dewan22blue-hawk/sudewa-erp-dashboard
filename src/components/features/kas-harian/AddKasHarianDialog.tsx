import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { kasHarianSchema, KasHarianFormValues } from "@/scheme/kas-harian.schema"
import { useCreateKasHarian } from "@/hooks/useKasHarian"
import KasHarianForm from "./KasHarianForm"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export default function AddKasHarianDialog({ open, onOpenChange }: Props) {
    const { mutate: createKasHarian, isPending } = useCreateKasHarian()

    const form = useForm<KasHarianFormValues>({
        resolver: zodResolver(kasHarianSchema),
        defaultValues: {
            tanggal: new Date(),
            akun: "",
            keterangan: "",
            nominal: 0,
            type: "debit", // Default
        },
    })

    const onSubmit = (data: KasHarianFormValues) => {
        createKasHarian(data, {
            onSuccess: () => {
                onOpenChange(false)
                form.reset()
            },
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Tambah Transaksi KAS</DialogTitle>
                    <p className="text-sm text-gray-500">
                        Masukkan detail transaksi baru
                    </p>
                </DialogHeader>

                <KasHarianForm
                    form={form}
                    onSubmit={onSubmit}
                    isLoading={isPending}
                    id="add-kas-form"
                />

                <div className="flex flex-col gap-3 mt-4">
                    <Button
                        type="submit"
                        className="w-full bg-[#1e293b] hover:bg-[#0f172a]"
                        form="add-kas-form"
                        disabled={isPending}
                    >
                        {isPending ? "Menyimpan..." : "Simpan"}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                    >
                        Batal
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
