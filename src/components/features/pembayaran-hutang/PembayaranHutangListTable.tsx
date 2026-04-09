import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils/currency';
import type { LiabilityPaymentHistory } from '@/types/pembayaran-hutang.types';

interface Props {
    data: LiabilityPaymentHistory[]
}

const formatDate = (value: string) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('id-ID');
};

export default function PembayaranHutangListTable({ data }: Props) {
    const rows = [...data].sort((left, right) => {
        const leftDate = new Date(left.payment_at || left.created_at).getTime();
        const rightDate = new Date(right.payment_at || right.created_at).getTime();
        return rightDate - leftDate;
    });

    const total = rows.reduce((acc, item) => acc + item.cash_payment_amount + item.bca_payment_amount + item.bca_payment_usd_amount, 0)

    return (
        <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100/80 text-xs font-semibold uppercase tracking-wide text-gray-600">
                        <tr className="border-b border-gray-200">
                            <th className="px-4 py-3 text-left">No</th>
                            <th className="px-4 py-3 text-left">Tanggal Bayar</th>
                            <th className="px-4 py-3 text-right">Cash Payment</th>
                            <th className="px-4 py-3 text-right">BCA Payment</th>
                            <th className="px-4 py-3 text-right">Total</th>
                            <th className="px-4 py-3 text-left">Keterangan</th>
                            <th className="px-4 py-3 text-left">Bukti Bayar</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {rows.length > 0 ? (
                            rows.map((item, index) => {
                                const totalPayment = item.cash_payment_amount + item.bca_payment_amount + item.bca_payment_usd_amount;
                                const proofUrl = item.payment_proof;

                                return (
                                    <tr key={item.id} className="transition-colors hover:bg-gray-50/70">
                                        <td className="px-4 py-4 text-gray-600">{index + 1}</td>
                                        <td className="px-4 py-4 text-gray-700">{formatDate(item.payment_at || item.created_at)}</td>
                                        <td className="px-4 py-4 text-right font-medium text-gray-900">{formatCurrency(item.cash_payment_amount)}</td>
                                        <td className="px-4 py-4 text-right font-medium text-gray-900">
                                            <div className="space-y-1">
                                                <div>{formatCurrency(item.bca_payment_amount)}</div>
                                                {item.bca_payment_usd_amount > 0 ? <div className="text-xs text-gray-500">{formatCurrency(item.bca_payment_usd_amount, 'USD')}</div> : null}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-right font-semibold text-emerald-600">{formatCurrency(totalPayment)}</td>
                                        <td className="px-4 py-4 text-gray-600">{item.note || '-'}</td>
                                        <td className="px-4 py-4">
                                            {proofUrl ? (
                                                <Button variant="outline" size="sm" asChild>
                                                    <a href={proofUrl} target="_blank" rel="noreferrer">
                                                        <ExternalLink className="mr-2 h-4 w-4" />
                                                        Lihat Bukti
                                                    </a>
                                                </Button>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                                    Belum ada riwayat pembayaran.
                                </td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot className="border-t bg-gray-50/80">
                        <tr className="font-semibold text-gray-900">
                            <td colSpan={4} className="px-4 py-4 text-right">
                                Sub Total
                            </td>
                            <td className="px-4 py-4 text-right">{formatCurrency(total)}</td>
                            <td colSpan={2}></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    )
}
