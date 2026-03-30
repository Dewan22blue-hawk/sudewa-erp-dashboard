import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale/id';
import { CalendarIcon, Pencil, Wallet } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UnitBilling } from '@/@types/unit-billing.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MoneyInput } from '@/components/ui/money-input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils/currency';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const paymentSchema = z
    .object({
        bcaPayment: z.number().min(0, 'Tidak boleh negatif'),
        cashPayment: z.number().min(0, 'Tidak boleh negatif'),
        bcaPayment2: z.number().min(0, 'Tidak boleh negatif').optional().default(0),
        paymentDate: z.string().min(1, 'Tanggal wajib diisi'),
        isPaid: z.boolean().default(false),
    })
    .refine((value) => (value.bcaPayment || 0) + (value.cashPayment || 0) + (value.bcaPayment2 || 0) > 0, {
        path: ['bcaPayment'],
        message: 'Minimal salah satu nominal pembayaran harus lebih dari 0',
    });

export type PaymentFormData = z.infer<typeof paymentSchema>;

interface Props {
    purchaseCode: string;
    totalTagihan: number;
    totalPaid: number;
    remainingPayment: number;
    billings: UnitBilling[];
    onCreate: (data: PaymentFormData) => Promise<void>;
    onUpdate: (billingId: string, data: PaymentFormData) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

export function PurchasePaymentForm({
    purchaseCode,
    totalTagihan,
    totalPaid,
    remainingPayment,
    billings,
    onCreate,
    onUpdate,
    onCancel,
    loading,
}: Props) {
    const [editingBilling, setEditingBilling] = useState<UnitBilling | null>(null);

    const form = useForm<PaymentFormData>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            bcaPayment: 0,
            cashPayment: 0,
            bcaPayment2: 0,
            paymentDate: new Date().toISOString().slice(0, 10),
            isPaid: false,
        },
    });

    const paymentBca = Number(form.watch('bcaPayment') ?? 0);
    const paymentCash = Number(form.watch('cashPayment') ?? 0);
    const paymentBca2 = Number(form.watch('bcaPayment2') ?? 0);
    const totalPaymentInput = paymentBca + paymentCash + paymentBca2;

    const projectedTotalPaid = useMemo(() => {
        if (!editingBilling) return totalPaid + totalPaymentInput;
        const editingOldTotal = Number(editingBilling.bca_payment ?? 0) + Number(editingBilling.cash_payment ?? 0) + Number(editingBilling.bca_payment_2 ?? 0);
        return totalPaid - editingOldTotal + totalPaymentInput;
    }, [editingBilling, totalPaid, totalPaymentInput]);

    const projectedRemaining = Math.max(0, totalTagihan - projectedTotalPaid);

    useEffect(() => {
        const autoIsPaid = projectedTotalPaid >= totalTagihan && totalTagihan > 0;
        form.setValue('isPaid', autoIsPaid);
    }, [form, projectedTotalPaid, totalTagihan]);

    const resetForm = () => {
        setEditingBilling(null);
        form.reset({
            bcaPayment: 0,
            cashPayment: 0,
            bcaPayment2: 0,
            paymentDate: new Date().toISOString().slice(0, 10),
            isPaid: projectedTotalPaid >= totalTagihan && totalTagihan > 0,
        });
    };

    const handleEdit = (item: UnitBilling) => {
        setEditingBilling(item);
        form.reset({
            bcaPayment: Number(item.bca_payment ?? 0),
            cashPayment: Number(item.cash_payment ?? 0),
            bcaPayment2: Number(item.bca_payment_2 ?? 0),
            paymentDate: item.payment_date ? item.payment_date.slice(0, 10) : new Date().toISOString().slice(0, 10),
            isPaid: Boolean(item.is_paid),
        });
    };

    const handleSubmit = async (values: PaymentFormData) => {
        if (editingBilling) {
            await onUpdate(editingBilling.id, values);
        } else {
            await onCreate(values);
        }

        resetForm();
    };

    const getPaymentMethods = (item: UnitBilling): string[] => {
        const methods: string[] = [];
        if (Number(item.bca_payment ?? 0) > 0) methods.push('BCA IDR');
        if (Number(item.bca_payment_2 ?? 0) > 0) methods.push('BCA USD');
        if (Number(item.cash_payment ?? 0) > 0) methods.push('Cash');
        return methods;
    };

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h2 className="text-xl font-semibold tracking-tight">Pembayaran Unit</h2>
                <p className="text-xs text-muted-foreground">
                    Kode Beli <span className="text-blue-500 font-medium">{purchaseCode}</span>
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-xl border p-5">
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Total Tagihan</p>
                    <p className="text-base font-semibold">{formatCurrency(totalTagihan)}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Total Dibayar</p>
                    <p className="text-base font-semibold">{formatCurrency(totalPaid)}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Sisa Bayar</p>
                    <p className="text-base font-semibold">{formatCurrency(remainingPayment)}</p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5 rounded-xl border p-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                            control={form.control}
                            name="bcaPayment"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>BCA Payment</FormLabel>
                                    <FormControl>
                                        <MoneyInput name={field.name} value={Number(field.value) || 0} onChangeValue={field.onChange} onBlur={field.onBlur} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="cashPayment"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cash Payment</FormLabel>
                                    <FormControl>
                                        <MoneyInput name={field.name} value={Number(field.value) || 0} onChangeValue={field.onChange} onBlur={field.onBlur} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="bcaPayment2"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>BCA Payment 2 (Opsional)</FormLabel>
                                    <FormControl>
                                        <MoneyInput name={field.name} value={Number(field.value) || 0} onChangeValue={field.onChange} onBlur={field.onBlur} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                            control={form.control}
                            name="paymentDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Payment Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button variant="outline" className={cn('justify-start text-left font-normal', !field.value && 'text-muted-foreground')}>
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {field.value ? format(new Date(field.value), 'PPP', { locale: idLocale }) : 'Pilih tanggal'}
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value ? new Date(field.value) : undefined}
                                                onSelect={(date) => field.onChange(date ? date.toISOString().slice(0, 10) : '')}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-2">
                            <Label>Total Payment (Input)</Label>
                            <Input readOnly value={formatCurrency(totalPaymentInput)} />
                        </div>

                        <div className="space-y-2">
                            <Label>Sisa Setelah Submit</Label>
                            <Input readOnly value={formatCurrency(projectedRemaining)} />
                        </div>
                    </div>

                    <FormField
                        control={form.control}
                        name="isPaid"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center gap-2 rounded-md border p-3 w-fit">
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                                </FormControl>
                                <div>
                                    <FormLabel className="text-sm">Tandai Lunas</FormLabel>
                                </div>
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-end gap-3">
                        {editingBilling && (
                            <Button type="button" variant="outline" onClick={resetForm}>
                                Batal Edit
                            </Button>
                        )}
                        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
                            Kembali
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-[#00d05a] hover:bg-[#00ba51] text-white min-w-[140px]">
                            <Wallet className="mr-2 h-4 w-4" />
                            {loading ? 'Menyimpan...' : editingBilling ? 'Update Payment' : 'Simpan Payment'}
                        </Button>
                    </div>
                </form>
            </Form>

            <div className="rounded-xl border p-5 space-y-3">
                <div>
                    <h3 className="text-base font-semibold">Histori Pembayaran</h3>
                    <p className="text-xs text-muted-foreground">Daftar transaksi pembayaran pada pembelian ini.</p>
                </div>

                <div className="rounded-md border overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Metode Pembayaran</TableHead>
                                <TableHead className="text-right">BCA Payment</TableHead>
                                <TableHead className="text-right">BCA USD</TableHead>
                                <TableHead className="text-right">Cash Payment</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {billings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-20 text-center text-muted-foreground">
                                        Belum ada histori pembayaran
                                    </TableCell>
                                </TableRow>
                            ) : (
                                billings.map((item) => {
                                    const total = Number(item.bca_payment ?? 0) + Number(item.cash_payment ?? 0) + Number(item.bca_payment_2 ?? 0);
                                    const methods = getPaymentMethods(item);
                                    return (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.payment_date ? format(new Date(item.payment_date), 'dd MMM yyyy', { locale: idLocale }) : '-'}</TableCell>
                                            <TableCell>
                                                {methods.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {methods.map((method) => (
                                                            <span key={`${item.id}-${method}`} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                                                                {method}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.bca_payment)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.bca_payment_2, 'USD')}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.cash_payment)}</TableCell>
                                            <TableCell className="text-right font-medium">{formatCurrency(total)}</TableCell>
                                            <TableCell>
                                                <span className={cn('text-xs px-2 py-1 rounded-full', item.is_paid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>
                                                    {item.is_paid ? 'Lunas' : 'Belum Lunas'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button type="button" size="sm" variant="outline" onClick={() => handleEdit(item)}>
                                                    <Pencil className="h-3.5 w-3.5 mr-1" />
                                                    Edit
                                                </Button>
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
    );
}
