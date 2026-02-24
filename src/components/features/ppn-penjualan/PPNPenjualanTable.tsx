import { PPNPenjualan } from "@/@types/ppn-penjualan.types"
import { MoreVertical } from "lucide-react"

interface Props {
    data: PPNPenjualan[]
    onEdit: (item: PPNPenjualan) => void
    onDelete: (item: PPNPenjualan) => void
}

export default function PPNPenjualanTable({
    data,
    onEdit,
    onDelete,
}: Props) {
    return (
        <div className="bg-white rounded-xl border overflow-x-auto">
            <table className="min-w-[2000px] w-full text-sm">
                <thead className="bg-gray-50/50 uppercase text-sm font-semibold text-gray-900">
                    <tr className="text-center border-b border-gray-200">
                        <th className="px-4 py-3 text-left">Kode Jual</th>
                        <th className="px-4 py-3 text-left">Tanggal Jual</th>
                        <th className="px-4 py-3 text-left">Customer</th>
                        <th className="px-4 py-3 text-left">Tanggal FPK</th>
                        <th className="px-4 py-3 text-left">Masa NSFPK</th>
                        <th className="px-4 py-3 text-left">NSFPK Keluaran</th>
                        <th className="px-4 py-3 text-right">QTY</th>
                        <th className="px-4 py-3 text-left">Tipe Unit</th>
                        <th className="px-4 py-3 text-left">No Mesin</th>
                        <th className="px-4 py-3 text-left">No Rangka</th>
                        <th className="px-4 py-3 text-right">Harga Jual</th>
                        <th className="px-4 py-3 text-right">Biaya</th>
                        <th className="px-4 py-3 text-right">Harga Unit</th>
                        <th className="px-4 py-3 text-right">DPP Jual</th>
                        <th className="px-4 py-3 text-right">PPN 11%</th>
                        <th className="px-4 py-3 text-right">Payment Jual</th>
                        <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map(item => (
                        <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-3 text-blue-600">{item.kodeJual}</td>
                            <td className="px-4 py-3">{item.tanggalJual}</td>
                            <td className="px-4 py-3">{item.customer}</td>
                            <td className="px-4 py-3">{item.tanggalFPK}</td>
                            <td className="px-4 py-3">{item.masaNSFPK}</td>
                            <td className="px-4 py-3">{item.nsfpkKeluaran}</td>
                            <td className="px-4 py-3 text-right">{item.qty}</td>
                            <td className="px-4 py-3">{item.tipeUnit}</td>
                            <td className="px-4 py-3">{item.noMesin}</td>
                            <td className="px-4 py-3">{item.noRangka}</td>
                            <td className="px-4 py-3 text-right">Rp {item.hargaJual.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right">Rp {item.biaya.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right">Rp {item.hargaUnit.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right">Rp {item.dppJual.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right">Rp {item.ppn.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right">Rp {item.paymentJual.toLocaleString()}</td>
                            <td className="px-4 py-3 text-center">
                                <div className="relative group">
                                    <MoreVertical size={18} className="cursor-pointer mx-auto" />
                                    <div className="absolute right-0 hidden group-hover:block bg-white shadow-md rounded-md border text-sm z-10">
                                        <button
                                            onClick={() => onEdit(item)}
                                            className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => onDelete(item)}
                                            className="block px-4 py-2 hover:bg-gray-100 text-red-600 w-full text-left"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
