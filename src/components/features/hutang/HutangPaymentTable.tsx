import { HutangPayment } from "@/types/hutang.types"
import { ArrowUpDown } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"

interface Props {
    data: HutangPayment[]
}

const formatRupiah = (value: number) =>
    "Rp " + value.toLocaleString("id-ID")

export default function HutangPaymentTable({
    data,
}: Props) {
    const subtotal = data.reduce(
        (acc, item) => acc + item.jumlahBayar,
        0
    )

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm mb-4">
                <span>Show</span>
                <Select defaultValue="25">
                    <SelectTrigger className="h-9 w-[70px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                </Select>
                <span>Page</span>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50/50 uppercase text-sm font-semibold text-gray-900 leading-normal">
                        <tr className="border-b border-gray-200">
                            <th className="px-4 py-3 text-left">
                                No
                            </th>
                            <th className="px-4 py-3 text-left">
                                KODE BAYAR
                            </th>
                            <th className="px-4 py-3 text-left">
                                <div className="flex items-center gap-1">
                                    TANGGAL
                                    <ArrowUpDown size={14} className="text-gray-400" />
                                </div>
                            </th>
                            <th className="px-4 py-3 text-right">
                                KAS KELUAR
                            </th>
                            <th className="px-4 py-3 text-right">
                                JUMLAH BAYAR
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {data.map((item, index) => (
                            <tr
                                key={item.id}
                                className="hover:bg-gray-50 transition-colors"
                            >
                                <td className="px-4 py-3">
                                    {index + 1}
                                </td>
                                <td className="px-4 py-3">
                                    {item.kodeBayar}
                                </td>
                                <td className="px-4 py-3">
                                    {item.tanggal}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    {formatRupiah(item.kasKeluar)}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    {formatRupiah(item.jumlahBayar)}
                                </td>
                            </tr>
                        ))}

                        {/* SUBTOTAL ROW */}
                        <tr className="bg-gray-50/80 font-semibold border-t border-gray-200">
                            <td
                                colSpan={4}
                                className="px-4 py-4 text-right text-gray-900"
                            >
                                Sub Total
                            </td>
                            <td className="px-4 py-4 text-right text-gray-900 text-base">
                                {formatRupiah(subtotal)}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* PAGINATION FOOTER */}
            <div className="flex justify-between items-center text-sm text-gray-500">
                <span>
                    Showing 1-{data.length || 0} of 100 data
                </span>

                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" disabled>Previous</Button>
                    <Button variant="outline" size="sm">1</Button>
                    <Button variant="ghost" size="sm">2</Button>
                    <Button variant="ghost" size="sm">3</Button>
                    <Button variant="ghost" size="sm">4</Button>
                    <span className="self-center">...</span>
                    <Button variant="ghost" size="sm">10</Button>
                    <Button variant="ghost" size="sm">Next</Button>
                </div>
            </div>
        </div>
    )
}
