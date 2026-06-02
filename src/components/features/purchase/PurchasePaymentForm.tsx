import { useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale/id';
import { Wallet } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UnitBilling, UnitBillingHistory } from '@/@types/unit-billing.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MoneyInput } from '@/components/ui/money-input';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils/currency';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const paymentSchema = z
    .object({
        bcaPayment: z.number().min(0, 'Tidak boleh negatif'),
        cashPayment: z.number().min(0, 'Tidak boleh negatif'),
        bcaPayment2: z.number().min(0, 'Tidak boleh negatif'),
        paymentDate: z.string().min(1, 'Tanggal wajib diisi'),
        note: z.string().max(255, 'Maksimal 255 karakter'),
        isPaid: z.boolean(),
    })
    .refine((value) => (value.bcaPayment || 0) + (value.cashPayment || 0) + (value.bcaPayment2 || 0) > 0, {
        path: ['bcaPayment'],
        message: 'Minimal salah satu nominal pembayaran harus lebih dari 0',
    });

export type PaymentFormData = z.infer<typeof paymentSchema>;

interface Props {
    purchaseCode: string;
    totalTagihan: number;
    totalPpn: number;
    billing: UnitBilling | null;
    histories: UnitBillingHistory[];
    onSubmitPayment: (data: PaymentFormData) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
    canSubmit?: boolean;
    validationMessage?: string;
}

export function PurchasePaymentForm({
    purchaseCode,
    totalTagihan,
    totalPpn,
    billing,
    histories,
    onSubmitPayment,
    onCancel,
    loading,
    canSubmit = true,
    validationMessage,
}: Props) {
    const form = useForm<PaymentFormData>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            bcaPayment: 0,
            cashPayment: 0,
            bcaPayment2: 0,
            paymentDate: new Date().toISOString().slice(0, 10),
            note: '',
            isPaid: false,
        },
    });

    const historyPaid = (histories ?? []).reduce(
        (acc, item) => acc + Number(item.bca_payment_amount ?? 0) + Number(item.cash_payment_amount ?? 0) + Number(item.bca_payment_usd_amount ?? 0),
        0,
    );
    const totalPaidFromBilling = Number(billing?.total_paid ?? (Number(billing?.bca_payment ?? 0) + Number(billing?.cash_payment ?? 0) + Number(billing?.bca_payment_2 ?? 0)));
    const totalPaid = billing?.is_paid ? Math.max(totalPaidFromBilling, historyPaid) : historyPaid;
    const billingRemaining = Number(billing?.remaining_payment ?? 0);
    const remainingPayment = billing?.is_paid ? 0 : billingRemaining > 0 ? billingRemaining : Math.max(0, totalTagihan - totalPaid);

    const paymentBca = Number(form.watch('bcaPayment') ?? 0);
    const paymentCash = Number(form.watch('cashPayment') ?? 0);
    const paymentBca2 = Number(form.watch('bcaPayment2') ?? 0);
    const totalPaymentInput = paymentBca + paymentCash + paymentBca2;

    const projectedTotalPaid = useMemo(() => totalPaid + totalPaymentInput, [totalPaid, totalPaymentInput]);
    const projectedRemaining = Math.max(0, totalTagihan - projectedTotalPaid);

    useEffect(() => {
        const autoIsPaid = projectedTotalPaid >= totalTagihan && totalTagihan > 0;
        form.setValue('isPaid', autoIsPaid);
    }, [form, projectedTotalPaid, totalTagihan]);

    const resetForm = () => {
        form.reset({
            bcaPayment: 0,
            cashPayment: 0,
            bcaPayment2: 0,
            paymentDate: new Date().toISOString().slice(0, 10),
            note: '',
            isPaid: projectedTotalPaid >= totalTagihan && totalTagihan > 0,
        });
    };

    const handleSubmit = async (values: PaymentFormData) => {
        await onSubmitPayment(values);
        resetForm();
    };

    const getPaymentMethods = (item: UnitBillingHistory): string[] => {
        if (Array.isArray(item.payment_methods) && item.payment_methods.length > 0) {
            return item.payment_methods;
        }

        const methods: string[] = [];
        if (Number(item.bca_payment_amount ?? 0) > 0) methods.push('BCA IDR');
        if (Number(item.bca_payment_usd_amount ?? 0) > 0) methods.push('BCA USD');
        if (Number(item.cash_payment_amount ?? 0) > 0) methods.push('Cash');
        return methods;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-semibold">Informasi Pembelian</h2>
                <p className="mt-1 text-sm text-muted-foreground">Kode Beli: {purchaseCode || '-'}</p>
                <Separator className="my-4" />
            </div>

            <div className="space-y-6">
                {/* ── Section: Biaya ── */}
                <div className="rounded-lg border">
                    <div className="border-b px-4 py-3">
                        <h3 className="text-sm font-semibold text-muted-foreground">Biaya</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <p className="text-sm font-medium">Total Beli</p>
                            <Input value={formatCurrency(totalTagihan)} disabled />
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium">Total PPN</p>
                            <Input value={formatCurrency(totalPpn)} disabled />
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium">Total Biaya</p>
                            <Input value={formatCurrency(remainingPayment)} disabled />
                        </div>
                    </div>
                </div>

                {/* Validation warning */}
                {validationMessage && (
                    <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                        {validationMessage}
                    </div>
                )}

                {/* ── Section: Pembayaran ── */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">

                        <div className="rounded-lg border">
                            <div className="border-b px-4 py-3">
                                <h3 className="text-sm font-semibold text-muted-foreground">Pembayaran</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3">
                                <FormField
                                    control={form.control}
                                    name="bcaPayment"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-sm font-medium">BCA USD</FormLabel>
                                            <FormControl>
                                                <MoneyInput
                                                    name={field.name}
                                                    value={Number(field.value) || 0}
                                                    onChangeValue={field.onChange}
                                                    onBlur={field.onBlur}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="bcaPayment2"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-sm font-medium">BCA IDR</FormLabel>
                                            <FormControl>
                                                <MoneyInput
                                                    name={field.name}
                                                    value={Number(field.value) || 0}
                                                    onChangeValue={field.onChange}
                                                    onBlur={field.onBlur}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="cashPayment"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-sm font-medium">CASH IDR</FormLabel>
                                            <FormControl>
                                                <MoneyInput
                                                    name={field.name}
                                                    value={Number(field.value) || 0}
                                                    onChangeValue={field.onChange}
                                                    onBlur={field.onBlur}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* ── Section: Invoice ── */}
                        <div className="rounded-lg border">
                            <div className="border-b px-4 py-3">
                                <h3 className="text-sm font-semibold text-muted-foreground">Invoice</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3">
                                {/* Tanggal */}
                                <FormField
                                    control={form.control}
                                    name="paymentDate"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-sm font-medium">Tanggal</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="date"
                                                    value={field.value}
                                                    onChange={(e) => field.onChange(e.target.value)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {/* Total Bayar */}
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">Total Bayar</p>
                                    <Input value={formatCurrency(totalPaymentInput)} disabled />
                                </div>
                                {/* Kurang Bayar */}
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">Kurang Bayar</p>
                                    <Input value={formatCurrency(projectedRemaining)} disabled />
                                </div>
                            </div>
                        </div>

                        {/* Note + Tandai Lunas */}
                        <div className="rounded-lg border">
                            <div className="border-b px-4 py-3">
                                <h3 className="text-sm font-semibold text-muted-foreground">Catatan</h3>
                            </div>
                            <div className="flex flex-col gap-4 p-4 md:flex-row md:items-end">
                                <FormField
                                    control={form.control}
                                    name="note"
                                    render={({ field }) => (
                                        <FormItem className="flex-1 space-y-2">
                                            <FormLabel className="text-sm font-medium">Note</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Catatan pembayaran (opsional)"
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
                                    name="isPaid"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center gap-2 rounded-md border px-4 py-3 w-fit">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                                                />
                                            </FormControl>
                                            <FormLabel className="text-sm cursor-pointer">Tandai Lunas</FormLabel>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                                disabled={loading}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading || !canSubmit}
                                className="bg-green-600 hover:bg-green-700 text-white min-w-[120px]"
                            >
                                {loading ? (
                                    'Menyimpan...'
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

                {/* ── Section: Histori Pembayaran ── */}
                <div className="rounded-lg border">
                    <div className="border-b px-4 py-3">
                        <h3 className="text-sm font-semibold text-muted-foreground">Histori Pembayaran</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>BCA IDR</TableHead>
                                    <TableHead>BCA USD</TableHead>
                                    <TableHead>Cash</TableHead>
                                    <TableHead>Metode</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead>Note</TableHead>
                                    <TableHead>Bukti</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {histories.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-20 text-center text-muted-foreground">
                                            Belum ada histori pembayaran
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    histories.map((item) => {
                                        const total = Number(item.bca_payment_amount ?? 0) + Number(item.cash_payment_amount ?? 0) + Number(item.bca_payment_usd_amount ?? 0);
                                        const methods = getPaymentMethods(item);
                                        return (
                                            <TableRow key={item.id}>
                                                <TableCell>{item.payment_at ? format(new Date(item.payment_at), 'dd MMM yyyy', { locale: idLocale }) : '-'}</TableCell>
                                                <TableCell>{formatCurrency(Number(item.bca_payment_amount ?? 0))}</TableCell>
                                                <TableCell>{formatCurrency(Number(item.bca_payment_usd_amount ?? 0))}</TableCell>
                                                <TableCell>{formatCurrency(Number(item.cash_payment_amount ?? 0))}</TableCell>
                                                <TableCell>{methods.length > 0 ? methods.join(', ') : '-'}</TableCell>
                                                <TableCell className="text-right font-medium">{formatCurrency(total)}</TableCell>
                                                <TableCell>{item.note || '-'}</TableCell>
                                                <TableCell>
                                                    {item.payment_proof ? (
                                                        <a href={item.payment_proof} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                                            Lihat
                                                        </a>
                                                    ) : (
                                                        '-'
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    );
}
