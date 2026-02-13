import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UseFormReturn } from "react-hook-form"

interface AccountFormValues {
    code: string
    group: string
    category: "DEBET" | "KREDIT"
    description: string
}

interface AccountFormModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    form: UseFormReturn<AccountFormValues>
    onSubmit: (values: AccountFormValues) => void
    title: string
    description: string
    submitLabel?: string
    isSubmitting?: boolean
}

export function AccountFormModal({
    open,
    onOpenChange,
    form,
    onSubmit,
    title,
    description,
    submitLabel = "Simpan",
    isSubmitting = false,
}: AccountFormModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-xl">{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        {/* Kode Akun */}
                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Kode Akun</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Masukkan kode akun"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Grup Akun */}
                        <FormField
                            control={form.control}
                            name="group"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Grup Akun</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Masukkan grup akun"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Category */}
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Pilih Kategori" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="DEBET">
                                                Debit
                                            </SelectItem>
                                            <SelectItem value="KREDIT">
                                                Kredit
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Deskripsi */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Deskripsi</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Tulis deskripsi di sini"
                                            className="resize-none"
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Buttons */}
                        <div className="flex flex-col gap-2 pt-2">
                            <Button
                                type="submit"
                                className="w-full bg-black hover:bg-black/90"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Menyimpan..." : submitLabel}
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
                </Form>
            </DialogContent>
        </Dialog>
    )
}
