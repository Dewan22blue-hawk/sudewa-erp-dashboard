import { PembayaranHutang } from "@/types/pembayaran-hutang.types"
import { ArrowUpDown } from "lucide-react"

interface Props {
    data: PembayaranHutang[]
}

export default function PembayaranHutangListTable({ data }: Props) {
    const total = data.reduce((acc, curr) => acc + curr.jumlahBayar, 0)

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-6">
            <table className="w-full text-sm">
                <thead className="bg-gray-200/50 uppercase text-sm font-semibold text-gray-900 leading-normal">
                    <tr className="border-b border-gray-200">
                        <th className="px-4 py-3 text-left">No</th>
                        <th className="px-4 py-3 text-left">KODE BAYAR</th>
                        <th className="px-4 py-3 text-left">
                            <div className="flex items-center gap-1">
                                TANGGAL
                                <ArrowUpDown size={14} className="text-gray-400" />
                            </div>
                        </th>
                        <th className="px-4 py-3 text-left">KAS KELUAR</th>
                        <th className="px-4 py-3 text-right">JUMLAH BAYAR</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {data.map((item, index) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">{index + 1}</td>
                            <td className="px-4 py-3 font-medium">{item.kodeBayar}</td>
                            <td className="px-4 py-3">{item.tanggal}</td>
                            <td className="px-4 py-3">{item.kasKeluar}</td>
                            <td className="px-4 py-3 text-right">
                                Rp {item.jumlahBayar.toLocaleString()}
                            </td>
                        </tr>
                    ))}
                </tbody>

                <tfoot>
                    <tr className="bg-gray-200/50 font-semibold border-t">
                        <td colSpan={3}></td>
                        <td className="px-4 py-3 text-left text-gray-900">
                            Sub Total
                        </td>
                        <td className="px-4 py-3 text-right text-gray-900">
                            Rp {total.toLocaleString()}
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    )
}
