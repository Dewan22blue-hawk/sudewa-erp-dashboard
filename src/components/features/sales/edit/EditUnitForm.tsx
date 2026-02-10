"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Save } from "lucide-react"
import { editUnitSchema, EditUnitFormData } from "./edit-unit.schema"
import { PRODUCT_OPTIONS } from "./edit-unit.data"

interface EditUnitFormProps {
    defaultValues: EditUnitFormData
    onSubmit: (data: EditUnitFormData) => void
    onCancel: () => void
}

/**
 * Edit Unit Form - EXACT sesuai Figma
 * Layout: Tipe Unit + Qty | Harga | Satuan (2 cols) | Biaya
 */
export function EditUnitForm({ defaultValues, onSubmit, onCancel }: EditUnitFormProps) {
    const form = useForm<EditUnitFormData>({
        resolver: zodResolver(editUnitSchema),
        defaultValues,
    })

    const qty = form.watch("qty")
    const hppSatuan = form.watch("hppSatuan")
    const dppSatuan = form.watch("dppSatuan")
    const ppnSatuan = form.watch("ppnSatuan")

    // Auto-calculate totals when qty or satuan changes
    useEffect(() => {
        form.setValue("totalHpp", qty * hppSatuan)
        form.setValue("totalDpp", qty * dppSatuan)
        form.setValue("totalPpn", qty * ppnSatuan)
    }, [qty, hppSatuan, dppSatuan, ppnSatuan, form])

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Tipe Unit & Qty Row */}
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="tipeUnit"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs text-muted-foreground">
                                    Tipe Unit
                                </FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="Select an Item" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {PRODUCT_OPTIONS.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="qty"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs text-muted-foreground">
                                    Qty
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min="1"
                                        className="h-10"
                                        {...field}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Harga Section */}
                <div>
                    <h3 className="mb-3 text-sm font-medium">Harga</h3>
                    <FormField
                        control={form.control}
                        name="harga"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs text-muted-foreground">
                                    Value
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        className="h-10"
                                        {...field}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Satuan Section - 2 Columns */}
                <div>
                    <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                        Satuan
                    </h3>
                    <div className="space-y-4">
                        {/* HPP Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="hppSatuan"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs text-muted-foreground">
                                            HPP Satuan
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="Value"
                                                className="h-10"
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="totalHpp"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs text-muted-foreground">
                                            Total HPP
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="Value"
                                                className="h-10 bg-muted"
                                                disabled
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* DPP Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="dppSatuan"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs text-muted-foreground">
                                            DPP Satuan
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="Value"
                                                className="h-10"
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="totalDpp"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs text-muted-foreground">
                                            Total DPP
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="Value"
                                                className="h-10 bg-muted"
                                                disabled
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* PPN Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="ppnSatuan"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs text-muted-foreground">
                                            PPN Satuan
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="Value"
                                                className="h-10"
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="totalPpn"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs text-muted-foreground">
                                            Total PPN
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="Value"
                                                className="h-10 bg-muted"
                                                disabled
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </div>

                {/* Biaya Section */}
                <div>
                    <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                        Biaya
                    </h3>
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="biayaBbn"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs text-muted-foreground">
                                        Biaya BBN
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="Value"
                                            className="h-10"
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="biayaEkspedisi"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs text-muted-foreground">
                                        Biaya Ekspedisi
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="Value"
                                            className="h-10"
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="biayaLain"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs text-muted-foreground">
                                        Biaya Lain
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="Value"
                                            className="h-10"
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={form.formState.isSubmitting}
                    >
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        disabled={form.formState.isSubmitting}
                    >
                        <Save className="mr-2 h-4 w-4" />
                        {form.formState.isSubmitting ? "Menyimpan..." : "Simpan"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
