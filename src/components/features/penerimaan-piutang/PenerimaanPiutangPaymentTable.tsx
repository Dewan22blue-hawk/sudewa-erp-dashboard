import { LiabilityPaymentHistory } from "@/types/pembayaran-hutang.types"
import { useState } from "react"
import { formatCurrency } from "@/lib/utils/currency"
import BaseTable, { ColumnDef } from "@/components/ui/base-table"

export default function PenerimaanPiutangPaymentTable({
    payments,
}: {
    payments: LiabilityPaymentHistory[]
}) {
    const [itemsPerPage, setItemsPerPage] = useState(25)
    const [currentPage, setCurrentPage] = useState(1)

    const total = payments.reduce((acc, cur) => acc + cur.cash_payment_amount + cur.bca_payment_amount, 0)

    const columns: ColumnDef<LiabilityPaymentHistory>[] = [
        {
            header: 'No',
            alignment: 'center',
            cell: (_, index) => {
                const startIndex = (currentPage - 1) * itemsPerPage;
                return <span className="text-slate-500">{startIndex + index + 1}</span>;
            },
        },
        {
            header: 'Kode Terima',
            accessorKey: 'id',
            sortable: true,
            alignment: 'left',
            cell: (item) => <span className="font-medium text-slate-900">{item.id}</span>,
        },
        {
            header: 'TANGGAL',
            accessorKey: 'payment_at',
            sortable: true,
            alignment: 'center',
            cell: (item) => <span className="text-slate-500">{item.payment_at}</span>,
        },
        {
            header: 'Kas Masuk',
            accessorKey: 'cash_payment_amount',
            sortable: true,
            alignment: 'left',
            cell: (item) => <span className="text-slate-700">{formatCurrency(item.cash_payment_amount)}</span>,
        },
        {
            header: 'Jumlah Diterima',
            accessorKey: 'total_payment',
            sortable: true,
            alignment: 'center',
            cell: (item) => (
                <span className="font-medium text-slate-900">
                    {formatCurrency((item.cash_payment_amount + item.bca_payment_amount))}
                </span>
            ),
        },
    ];

    const footer = (
        <tfoot>
            <tr className="bg-slate-50/50 border-t border-slate-200 font-semibold">
                <td colSpan={3}></td>
                <td className="px-4 py-4 text-left text-sm font-semibold text-slate-900">
                    Sub Total
                </td>
                <td className="px-4 py-4 text-center text-sm font-semibold text-slate-900">
                    {formatCurrency(total)}
                </td>
            </tr>
        </tfoot>
    );

    return (
        <div className="space-y-4">
            <BaseTable
                data={payments}
                columns={columns}
                showLimitChange={true}
                perPage={itemsPerPage}
                onPerPageChange={(val) => {
                    setItemsPerPage(val);
                    setCurrentPage(1);
                }}
                meta={{
                    currentPage: currentPage,
                    perPage: itemsPerPage,
                    total: payments.length,
                    lastPage: Math.ceil(payments.length / itemsPerPage),
                }}
                onPageChange={setCurrentPage}
                footer={footer}
            />
        </div>
    )
}
