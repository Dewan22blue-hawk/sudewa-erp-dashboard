import { PembayaranHutang } from "@/types/pembayaran-hutang.types"
import { useTableSort } from "@/hooks/useTableSort"
import { SortableHeader } from "@/components/ui/sortable-header"

export default function PembayaranHutangPaymentTable({
    payments,
}: {
    payments: PembayaranHutang[]
}) {
    const { sortedData, sortKey, sortOrder, handleSort } = useTableSort({
        data: payments,
    })

    return (
        <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
                <thead className="bg-gray-100 uppercase text-xs font-medium">
                    <tr>
                        <th className="px-4 py-3 text-left">No</th>
                        <th className="py-2 text-left">
                            <SortableHeader title="Kode Bayar" sortKey="kodeBayar" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-600 justify-start w-full px-4" />
                        </th>
                        <th className="py-2 text-left">
                            <SortableHeader title="Tanggal" sortKey="tanggal" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-600 justify-start w-full px-4" />
                        </th>
                        <th className="py-2 text-left">
                            <SortableHeader title="Kas Keluar" sortKey="kasKeluar" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-600 justify-start w-full px-4" />
                        </th>
                        <th className="py-2 text-right">
                            <SortableHeader title="Jumlah Bayar" sortKey="jumlahBayar" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-600 justify-end w-full px-4" />
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {sortedData.map((item, index) => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3">{index + 1}</td>
                            <td className="px-4 py-3">{item.kodeBayar}</td>
                            <td className="px-4 py-3">{item.tanggal}</td>
                            <td className="px-4 py-3">{item.kasKeluar}</td>
                            <td className="px-4 py-3 text-right">
                                Rp {item.jumlahBayar.toLocaleString()}
                            </td>
                        </tr>
                    ))}

                    <tr className="bg-gray-50 font-semibold">
                        <td colSpan={4} className="px-4 py-3 text-right">
                            Sub Total
                        </td>
                        <td className="px-4 py-3 text-right">
                            Rp {payments.reduce((acc, cur) => acc + cur.jumlahBayar, 0).toLocaleString()}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}
