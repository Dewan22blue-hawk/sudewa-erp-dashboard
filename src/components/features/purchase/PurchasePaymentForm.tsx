
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoneyInput } from "@/components/ui/money-input"
import { Label } from "@/components/ui/label"
import { Wallet, CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { id as idLocale } from "date-fns/locale/id"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Purchase } from "@/@types/purchase.types"
import { useEffect } from "react"

const paymentSchema = z.object({
    paymentBca: z.number().min(0),
    paymentBcaUsd: z.number().min(0),
    paymentCash: z.number().min(0),
    totalBayar: z.number(),
    kurangBayar: z.number(),
})

type PaymentFormData = z.infer<typeof paymentSchema>

interface Props {
    purchaseData: Purchase
    onSubmit: (data: PaymentFormData) => void
    onCancel: () => void
    loading?: boolean
}

function formatMoney(amount: number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount).replace("Rp", "Rp ")
}

export function PurchasePaymentForm({ purchaseData, onSubmit, onCancel, loading }: Props) {
    const form = useForm<PaymentFormData>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            paymentBca: 0, // Should be populated if editing existing payment? For now 0
            paymentBcaUsd: 0,
            paymentCash: 0,
            totalBayar: purchaseData.totalPaid,
            kurangBayar: purchaseData.remainingPayment,
        }
    })

    const { watch, setValue } = form
    const paymentBca = watch("paymentBca")
    const paymentBcaUsd = watch("paymentBcaUsd")
    const paymentCash = watch("paymentCash")

    useEffect(() => {
        // Calculate new total paid including current form values + previously paid?
        // Or is this form purely additive?
        // In Sales PaymentForm, it seems to calculate based on inputs.
        // Assuming inputs represent the *new* payment or *total* payment?
        // Let's assume input is *amount to pay now* for additive, OR *total paid* if editing.
        // Given existing logic in PaymentForm (Sales), it calculates "Total Bayar" from inputs.
        // If inputs are 0, total is 0.
        // We probably want to show Total Paid so far + New Payment?
        // Taking Sales as reference: Sales PaymentForm calculates `total` from inputs and `kurang` from `totalJual - total`.
        // This implies the inputs are the TOTALS paid so far, or this is a "Edit Payment" form where you set the values.
        // The mock service `updatePayment` takes `{ bca, bcaUsd, cash }` and sets `totalPaid` to their sum.
        // So this form sets the TOTAL paid values.

        const total = (paymentBca || 0) + (paymentBcaUsd || 0) + (paymentCash || 0)
        // If we want to support partial payments history, we'd need a different model.
        // But for parity with Sales Mock: it overwrites total paid.

        const kurang = purchaseData.totalPurchase - total
        setValue("totalBayar", total)
        setValue("kurangBayar", Math.max(0, kurang))
    }, [paymentBca, paymentBcaUsd, paymentCash, purchaseData.totalPurchase, setValue])

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold tracking-tight">Informasi Pembelian</h2>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Biaya Section */}
                    <div className="rounded-xl border p-5 space-y-4 shadow-sm">
                        <h3 className="text-sm text-muted-foreground">Biaya</h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Total Beli</Label>
                                <Input className="bg-transparent rounded-lg" readOnly value={formatMoney(purchaseData.totalDpp)} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Total PPN</Label>
                                <Input className="bg-transparent rounded-lg" readOnly value={formatMoney(purchaseData.totalPpn)} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Total Biaya</Label>
                                <Input className="bg-transparent rounded-lg" readOnly value={formatMoney(purchaseData.totalPurchase)} />
                            </div>
                        </div>
                    </div>

                    {/* Pembayaran Section */}
                    <div className="rounded-xl border p-5 space-y-4 shadow-sm">
                        <h3 className="text-sm text-muted-foreground">Pembayaran</h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField
                                control={form.control}
                                name="paymentBca"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel className="text-sm font-medium">BCA IDR</FormLabel>
                                        <FormControl>
                                            <MoneyInput
                                                className="bg-transparent rounded-lg"
                                                {...field}
                                                value={field.value || 0}
                                                onChangeValue={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="paymentBcaUsd"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel className="text-sm font-medium">BCA USD</FormLabel>
                                        <FormControl>
                                            <MoneyInput
                                                className="bg-transparent rounded-lg"
                                                {...field}
                                                value={field.value || 0}
                                                onChangeValue={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="paymentCash"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel className="text-sm font-medium">Cash</FormLabel>
                                        <FormControl>
                                            <MoneyInput
                                                className="bg-transparent rounded-lg"
                                                {...field}
                                                value={field.value || 0}
                                                onChangeValue={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* Invoice Section */}
                    <div className="rounded-xl border p-5 space-y-4 shadow-sm">
                        <h3 className="text-sm text-muted-foreground">Invoice</h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2 flex flex-col justify-end">
                                <Label className="text-sm font-medium">Tanggal</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal bg-transparent rounded-lg",
                                                "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {purchaseData.date ? format(new Date(purchaseData.date), "PPP", { locale: idLocale }) : <span>Pilih Tanggal</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={new Date(purchaseData.date)}
                                            onSelect={() => { }} // Read-only view
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <FormField
                                control={form.control}
                                name="totalBayar"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel className="text-sm font-medium">Total Bayar</FormLabel>
                                        <FormControl>
                                            <Input
                                                className="bg-transparent rounded-lg"
                                                readOnly
                                                value={formatMoney(field.value)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="kurangBayar"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel className="text-sm font-medium">Kurang Bayar</FormLabel>
                                        <FormControl>
                                            <Input
                                                className="bg-transparent rounded-lg"
                                                readOnly
                                                value={field.value === 0 ? "0" : formatMoney(field.value)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <div className="flex justify-center gap-4 pt-8">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onCancel}
                            disabled={loading || form.formState.isSubmitting}
                            className="text-foreground hover:bg-muted font-medium px-8"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || form.formState.isSubmitting}
                            className="bg-[#00d05a] hover:bg-[#00ba51] text-white min-w-[120px] font-medium px-8"
                        >
                            {loading || form.formState.isSubmitting ? (
                                "Menyimpan..."
                            ) : (
                                <>
                                    <Wallet className="mr-2 h-4 w-4" />
                                    Bayar
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
