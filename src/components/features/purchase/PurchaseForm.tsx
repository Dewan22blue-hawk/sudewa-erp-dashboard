"use client"

import { useForm } from "react-hook-form"
import { PurchaseFormValues } from "@/types/purchase.types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/router"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Save } from "lucide-react"

interface Props {
    defaultValues?: Partial<PurchaseFormValues>
    onSubmit: (data: PurchaseFormValues) => void
    loading?: boolean
    readOnly?: boolean
    onCancel?: () => void
}

export default function PurchaseForm({
    defaultValues,
    onSubmit,
    loading,
    readOnly,
    onCancel
}: Props) {
    const router = useRouter()

    const form = useForm<PurchaseFormValues>({
        defaultValues
    })

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
            >
                {/* Section Header */}
                <div>
                    <h2 className="text-lg font-semibold text-foreground">Informasi Pembelian</h2>
                    <div className="my-4 h-[1px] bg-border" />
                </div>

                {/* ROW 1: Supplier, Date, Code */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                        control={form.control}
                        name="supplierName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium">Supplier</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Nama Supplier"
                                        disabled={readOnly}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium">Tanggal</FormLabel>
                                <FormControl>
                                    <Input
                                        type="date"
                                        disabled={readOnly}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium">Kode Pembelian</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Kode"
                                        disabled={readOnly}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {!readOnly && (
                    <div className="flex justify-end gap-3 pt-8">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onCancel || (() => router.back())}
                            disabled={loading}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-[#1e293b] hover:bg-[#0f172a] text-white min-w-[100px]"
                        >
                            {loading ? (
                                "Menyimpan..."
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Simpan
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </form>
        </Form>
    )
}
