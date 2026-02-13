import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UseFormReturn } from "react-hook-form"
import type { TypeUnitFormValues } from "@/scheme/type-unit.schema"
import { Save } from "lucide-react"

interface TypeUnitFormProps {
    form: UseFormReturn<TypeUnitFormValues>
    onSubmit: (values: TypeUnitFormValues) => void
    onCancel: () => void
    isSubmitting?: boolean
    submitLabel?: string
}

export function TypeUnitForm({
    form,
    onSubmit,
    onCancel,
    isSubmitting = false,
    submitLabel = "Simpan",
}: TypeUnitFormProps) {
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* MERK SECTION */}
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                        <FormField
                            control={form.control}
                            name="merk"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-12 items-center gap-4 space-y-0">
                                    <FormLabel className="col-span-3 text-base font-medium">Merk</FormLabel>
                                    <div className="col-span-9">
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Pilih Merk" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="HONDA">HONDA</SelectItem>
                                                <SelectItem value="YAMAHA">YAMAHA</SelectItem>
                                                <SelectItem value="SUZUKI">SUZUKI</SelectItem>
                                                <SelectItem value="KAWASAKI">KAWASAKI</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* UNIT SECTION */}
                <div className="space-y-6">
                    <h3 className="text-sm font-medium text-muted-foreground">Unit</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-12 items-center gap-4 space-y-0">
                                    <FormLabel className="col-span-3 text-base font-medium">Kode</FormLabel>
                                    <div className="col-span-9">
                                        <FormControl>
                                            <Input placeholder="Masukkan Kode" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="jenis"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-12 items-center gap-4 space-y-0">
                                    <FormLabel className="col-span-3 text-base font-medium">Jenis</FormLabel>
                                    <div className="col-span-9">
                                        <FormControl>
                                            <Input placeholder="Masukkan Jenis" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-12 items-center gap-4 space-y-0">
                                    <FormLabel className="col-span-3 text-base font-medium">Tipe</FormLabel>
                                    <div className="col-span-9">
                                        <FormControl>
                                            <Input placeholder="Masukkan Tipe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="model"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-12 items-center gap-4 space-y-0">
                                    <FormLabel className="col-span-3 text-base font-medium">Model</FormLabel>
                                    <div className="col-span-9">
                                        <FormControl>
                                            <Input placeholder="Masukkan Model" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* BERAT SECTION */}
                <div className="space-y-6">
                    <h3 className="text-sm font-medium text-muted-foreground">Berat</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                        <FormField
                            control={form.control}
                            name="bruto"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-12 items-center gap-4 space-y-0">
                                    <FormLabel className="col-span-3 text-base font-medium">Bruto</FormLabel>
                                    <div className="col-span-9">
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="Masukkan Berat"
                                                {...field}
                                                onChange={(e) => {
                                                    const value = e.target.value
                                                    field.onChange(value === "" ? undefined : Number(value))
                                                }}
                                                value={field.value ?? ""}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />
                        {/* Empty column for alignment */}
                        <div className="hidden md:block"></div>

                        <FormField
                            control={form.control}
                            name="netto"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-12 items-center gap-4 space-y-0">
                                    <FormLabel className="col-span-3 text-base font-medium">Netto</FormLabel>
                                    <div className="col-span-9">
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="Masukkan Berat"
                                                {...field}
                                                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                                value={field.value ?? ""}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* ACTION BUTTONS - Per design, Buttons are on the bottom right */}
                <div className="flex justify-end gap-4 pt-8">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        className="bg-black hover:bg-black/90 min-w-[140px]"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            "Menyimpan..."
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                {submitLabel}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
