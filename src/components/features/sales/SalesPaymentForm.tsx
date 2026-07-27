import { useState, useEffect, useMemo } from 'react';
import { Wallet, Trash, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UnitBilling, UnitBillingHistory } from '@/@types/unit-billing.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MoneyInput } from '@/components/ui/money-input';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils/currency';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import {
    getHistoryBcaIdrAmount,
    getHistoryCashIdrAmount,
    getHistoryUsdAmount,
    getHistoryTotalIdrEquivalent
} from '@/utils/payment-helpers';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const paymentSchema = z.object({
    bcaPayment: z.union([z.string(), z.number()]).transform(v => Number(v) || 0).pipe(z.number().min(0, 'Tidak boleh negatif')),
    cashPayment: z.number().min(0, 'Tidak boleh negatif'),
    bcaPayment2: z.number().min(0, 'Tidak boleh negatif'),
    paymentDate: z.string().min(1, 'Tanggal wajib diisi'),
    note: z.string().max(255, 'Maksimal 255 karakter'),
    isPaid: z.boolean(),
});

export type PaymentFormData = z.input<typeof paymentSchema>;

interface Props {
    salesCode: string;
    totalTagihan: number;
    totalPpn: number;
    totalDpp: number;
    billing: UnitBilling | null;
    histories: UnitBillingHistory[];
    onSubmitPayment: (data: PaymentFormData) => Promise<void>;
    onDeleteHistory?: (id: string | number) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
    canSubmit?: boolean;
    validationMessage?: string;
}

export function SalesPaymentForm({
    salesCode,
    totalTagihan,
    totalPpn,
    totalDpp,
    billing,
    histories,
    onSubmitPayment,
    onDeleteHistory,
    onCancel,
    loading,
    canSubmit = true,
    validationMessage,
}: Props) {
    const [deleteId, setDeleteId] = useState<string | number | null>(null);

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
        (acc, item) => acc + getHistoryTotalIdrEquivalent(item),
        0,
    );
    const totalPaidFromBilling = Number(billing?.total_paid ?? (Number(billing?.bca_payment ?? 0) + Number(billing?.cash_payment ?? 0) + Number(billing?.bca_payment_2 ?? 0)));
    const totalPaid = Math.max(totalPaidFromBilling, historyPaid);
    const billingRemaining = Number(billing?.remaining_payment ?? 0);
    const remainingPayment = billing?.is_paid ? 0 : billingRemaining > 0 ? billingRemaining : Math.max(0, totalTagihan - totalPaid);

    const paymentBca = Number(form.watch('bcaPayment') ?? 0); // BCA USD
    const paymentCash = Number(form.watch('cashPayment') ?? 0); // CASH IDR
    const paymentBca2 = Number(form.watch('bcaPayment2') ?? 0); // BCA IDR
    const totalPaymentInputIdr = paymentCash + paymentBca2;

    const projectedTotalPaid = useMemo(() => totalPaid + totalPaymentInputIdr, [totalPaid, totalPaymentInputIdr]);
    const projectedRemaining = Math.max(0, totalTagihan - projectedTotalPaid);

    const totalPaidUsdFromHistory = useMemo(() => (histories ?? []).reduce((acc, item) => acc + getHistoryUsdAmount(item), 0), [histories]);
    const projectedTotalPaidUsd = useMemo(() => totalPaidUsdFromHistory + paymentBca, [totalPaidUsdFromHistory, paymentBca]);
    const projectedRemainingUsd = useMemo(() => Math.max(0, Number(billing?.remaining_payment_usd || 0) - paymentBca), [billing?.remaining_payment_usd, paymentBca]);

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
        const total = Number(values.bcaPayment || 0) + (values.cashPayment || 0) + (values.bcaPayment2 || 0);
        if (total <= 0) {
            toast.error('Minimal salah satu nominal pembayaran harus lebih dari 0.');
            return;
        }
        if (remainingPayment > 0 && total > remainingPayment) {
            form.setError('cashPayment', { type: 'manual', message: 'Total pembayaran tidak boleh melebihi sisa tagihan' });
            form.setError('bcaPayment', { type: 'manual', message: 'Total pembayaran tidak boleh melebihi sisa tagihan' });
            form.setError('bcaPayment2', { type: 'manual', message: 'Total pembayaran tidak boleh melebihi sisa tagihan' });
            toast.error('Total pembayaran tidak boleh melebihi sisa tagihan.');
            return;
        }
        await onSubmitPayment(values);
        resetForm();
    };

    const getPaymentMethods = (item: UnitBillingHistory): string[] => {
        if (Array.isArray(item.payment_methods) && item.payment_methods.length > 0) {
            return item.payment_methods;
        }

        const methods: string[] = [];
        if (getHistoryBcaIdrAmount(item) > 0) methods.push('BCA IDR');
        if (getHistoryUsdAmount(item) > 0) methods.push('BCA USD');
        if (getHistoryCashIdrAmount(item) > 0) methods.push('Cash');
        return methods;
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold">Informasi Penjualan</h2>
                <p className="mt-1 text-sm text-muted-foreground">Kode Jual: {salesCode || '-'}</p>
                <Separator className="my-4" />
            </div>

            <div className="space-y-6">
                <div className="rounded-lg border">
                    <div className="border-b px-4 py-3">
                        <h3 className="text-sm font-semibold text-muted-foreground">Biaya</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <p className="text-sm font-medium">Total Beli</p>
                            <Input value={formatCurrency(totalDpp)} disabled />
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium">Total PPN</p>
                            <Input value={formatCurrency(totalPpn)} disabled />
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium">Total Biaya</p>
                            <Input value={formatCurrency(totalTagihan)} disabled />
                        </div>
                    </div>
                </div>

                {validationMessage && (
                    <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                        {validationMessage}
                    </div>
                )}

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
                                                <Input
                                                    type="text"
                                                    inputMode="decimal"
                                                    value={field.value}
                                                    onChange={(e) => {
                                                        let val = e.target.value.replace(/,/g, '.').replace(/[^0-9.]/g, '');
                                                        const parts = val.split('.');
                                                        if (parts.length > 2) {
                                                            val = parts[0] + '.' + parts.slice(1).join('');
                                                        }
                                                        field.onChange(val);
                                                    }}
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
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">Tanggal</p>
                                    <Input
                                        type="date"
                                        value={form.watch('paymentDate')}
                                        onChange={(e) => form.setValue('paymentDate', e.target.value)}
                                    />
                                </div>
                                {/* Total Bayar */}
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">Total Bayar</p>
                                    <Input value={formatCurrency(projectedTotalPaid)} disabled />
                                </div>
                                {/* Kurang Bayar */}
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">Kurang Bayar</p>
                                    <Input value={formatCurrency(projectedRemaining)} disabled />
                                </div>
                                {/* Tanggal USD */}
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">Tanggal (USD)</p>
                                    <Input value="-" disabled />
                                </div>
                                {/* Total Bayar USD */}
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">Total Bayar (USD)</p>
                                    <Input value={formatCurrency(projectedTotalPaidUsd, 'USD')} disabled />
                                </div>
                                {/* Kurang Bayar USD */}
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">Kurang Bayar (USD)</p>
                                    <Input value={formatCurrency(projectedRemainingUsd, 'USD')} disabled />
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
                                    <TableHead>BCA USD</TableHead>
                                    <TableHead>BCA IDR</TableHead>
                                    <TableHead>Cash</TableHead>
                                    <TableHead>Metode</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead>Note</TableHead>
                                    <TableHead>Bukti</TableHead>
                                    <TableHead className="w-10"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {histories.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={100} className="py-16 h-20 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <div className="rounded-full bg-slate-50 p-4 mb-2">
                                                    <Search className="h-8 w-8 text-slate-400" />
                                                </div>
                                                <p className="text-base font-semibold text-slate-900">Tidak ada data ditemukan</p>
                                                <p className="text-sm text-slate-500">Belum ada data atau coba gunakan kata kunci pencarian lain.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    histories.map((item) => {
                                        const total = getHistoryTotalIdrEquivalent(item);
                                        const usdAmount = getHistoryUsdAmount(item);
                                        const idrAmount = getHistoryBcaIdrAmount(item) + getHistoryCashIdrAmount(item);
                                        const isPureUsd = usdAmount > 0 && idrAmount === 0 && total === usdAmount;

                                        const methods = getPaymentMethods(item);
                                        return (
                                            <TableRow key={item.id}>
                                                <TableCell>{item.payment_at ? format(new Date(item.payment_at), 'dd MMMM yyyy', { locale: idLocale }) : '-'}</TableCell>
                                                <TableCell>{formatCurrency(usdAmount, 'USD')}</TableCell>
                                                <TableCell>{formatCurrency(getHistoryBcaIdrAmount(item))}</TableCell>
                                                <TableCell>{formatCurrency(getHistoryCashIdrAmount(item))}</TableCell>
                                                <TableCell>{methods.length > 0 ? methods.join(', ') : '-'}</TableCell>
                                                <TableCell className="text-right font-medium">{formatCurrency(total, isPureUsd ? 'USD' : 'IDR')}</TableCell>
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
                                                <TableCell>
                                                    {onDeleteHistory && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => setDeleteId(item.id)}
                                                            disabled={loading}
                                                            type="button"
                                                        >
                                                            <Trash className="w-4 h-4 text-red-500" />
                                                        </Button>
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

            <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent className="rounded-2xl border-slate-200">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Histori Pembayaran</AlertDialogTitle>
                        <AlertDialogDescription>
                            Data histori pembayaran ini akan dihapus secara permanen.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-md">Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (deleteId && onDeleteHistory) {
                                    onDeleteHistory(deleteId);
                                    setDeleteId(null);
                                }
                            }}
                            className="rounded-md bg-red-600 hover:bg-red-700"
                        >
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
