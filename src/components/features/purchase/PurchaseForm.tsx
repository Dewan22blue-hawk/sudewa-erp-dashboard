"use client"

import { useForm } from "react-hook-form"
import { PurchaseFormValues } from "@/@types/purchase.types"
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
import { Save, Check, ChevronsUpDown } from "lucide-react"
import { useSuppliers } from "@/hooks/useSupplier"
import { useState, useMemo, useEffect } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"

interface Props {
    defaultValues?: Partial<PurchaseFormValues>
    onSubmit: (data: PurchaseFormValues) => void
    loading?: boolean
    readOnly?: boolean
    onCancel?: () => void
    companyId?: string | null
}

export default function PurchaseForm({
    defaultValues,
    onSubmit,
    loading,
    readOnly,
    onCancel,
    companyId
}: Props) {
    const router = useRouter()
    const { data: supplierData } = useSuppliers(companyId || null)
    const [supplierOpen, setSupplierOpen] = useState(false)

    const personOptions = useMemo(() => supplierData?.data ?? [], [supplierData])

    const form = useForm<PurchaseFormValues>({
        defaultValues
    })

    // Auto-populate supplier address and NPWP on load/mount once supplier list is loaded
    useEffect(() => {
        if (personOptions.length > 0 && defaultValues?.supplierName) {
            const matchedSupplier = personOptions.find(
                (p) => p.name === defaultValues.supplierName
            );
            if (matchedSupplier) {
                if (!form.getValues('supplierAddress')) {
                    form.setValue('supplierAddress', matchedSupplier.address ?? '');
                }
                if (!form.getValues('supplierNpwp')) {
                    form.setValue('supplierNpwp', matchedSupplier.npwp ?? '');
                }
            }
        }
    }, [personOptions, defaultValues?.supplierName, form]);

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
            >
                {/* Section Header */}
                <div>
                    <h2 className="text-xl font-semibold text-foreground tracking-tight">Informasi Pembelian</h2>
                    <p className="text-sm text-gray-500 mt-1">Kelola detail informasi pembelian unit dan biaya-biaya terkait</p>
                    <div className="my-6 h-px bg-muted/60" />
                </div>

                {/* ROW 1: Supplier, Date, Code */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        name="supplierName"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel className="text-sm font-medium">Supplier</FormLabel>
                                <Popover open={supplierOpen} onOpenChange={setSupplierOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={supplierOpen}
                                            className="w-full justify-between bg-transparent font-normal"
                                            disabled={readOnly}
                                        >
                                            <span className={cn('truncate', !field.value && 'text-muted-foreground')}>
                                                {field.value || 'Pilih supplier'}
                                            </span>
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                        <Command>
                                            <CommandInput placeholder="Cari supplier..." />
                                            <CommandList id="supplier-combobox-list">
                                                <CommandEmpty>Supplier tidak ditemukan.</CommandEmpty>
                                                <CommandGroup>
                                                    {personOptions.map((person) => (
                                                        <CommandItem
                                                            key={String(person.id)}
                                                            value={`${person.name} ${person.code ?? ''} ${person.id}`}
                                                            onSelect={() => {
                                                                form.setValue('supplierName', person.name)
                                                                form.setValue('supplierAddress', person.address ?? '')
                                                                form.setValue('supplierNpwp', person.npwp ?? '')
                                                                setSupplierOpen(false)
                                                            }}
                                                        >
                                                            <Check className={cn('mr-2 h-4 w-4', field.value === person.name ? 'opacity-100' : 'opacity-0')} />
                                                            {person.name}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="supplierAddress"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium">Alamat</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Alamat Supplier"
                                        readOnly={true}
                                        className="bg-transparent"
                                        {...field}
                                        value={field.value ?? ''}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="supplierNpwp"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium">NPWP</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="NPWP Supplier"
                                        readOnly={true}
                                        className="bg-transparent"
                                        {...field}
                                        value={field.value ?? ''}
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
