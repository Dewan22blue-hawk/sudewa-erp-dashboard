import { PembayaranHutang } from "@/types/pembayaran-hutang.types"

export default function PembayaranHutangPaymentTable({
    payments,
}: {
    payments: PembayaranHutang[]
}) {
    return (
        <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
                <thead className="bg-gray-100 uppercase text-xs font-medium">
                    <tr>
                        <th className="px-4 py-3 text-left">No</th>
                        <th className="px-4 py-3 text-left">Kode Bayar</th>
                        <th className="px-4 py-3 text-left">Tanggal</th>
                        <th className="px-4 py-3 text-left">Kas Keluar</th>
                        <th className="px-4 py-3 text-right">Jumlah Bayar</th>
                    </tr>
                </thead>

                <tbody>
                    {payments.map((item, index) => (
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
