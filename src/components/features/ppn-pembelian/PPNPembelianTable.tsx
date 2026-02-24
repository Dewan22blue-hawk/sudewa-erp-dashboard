import { PPNPembelian } from "@/@types/ppn-pembelian.types"
import { MoreVertical } from "lucide-react"

interface Props {
    data: PPNPembelian[]
    onEdit: (item: PPNPembelian) => void
    onDelete: (item: PPNPembelian) => void
}

export default function PPNPembelianTable({
    data,
    onEdit,
    onDelete,
}: Props) {
    return (
        <div className="bg-white rounded-xl border overflow-x-auto">
            <table className="min-w-[1800px] w-full text-sm">
                <thead className="text-center bg-gray-50/50 uppercase text-sm font-semibold text-gray-900">
                    <tr className="text-center border-b border-gray-200">
                        <th className="px-4 py-3 text-left">Kode Beli</th>
                        <th className="px-4 py-3 text-left">Tanggal Beli</th>
                        <th className="px-4 py-3 text-left">Supplier</th>
                        <th className="px-4 py-3 text-left">Tanggal FPM</th>
                        <th className="px-4 py-3 text-left">Masa NSFPM</th>
                        <th className="px-4 py-3 text-left">NSFPM Masukan</th>
                        <th className="px-4 py-3 text-right">QTY</th>
                        <th className="px-4 py-3 text-left">Tipe Unit</th>
                        <th className="px-4 py-3 text-left">No Mesin</th>
                        <th className="px-4 py-3 text-left">No Rangka</th>
                        <th className="px-4 py-3 text-right">Harga Beli</th>
                        <th className="px-4 py-3 text-right">Biaya</th>
                        <th className="px-4 py-3 text-right">Harga Unit</th>
                        <th className="px-4 py-3 text-right">DPP Beli</th>
                        <th className="px-4 py-3 text-right">PPN 11%</th>
                        <th className="px-4 py-3 text-right">Payment Beli</th>
                        <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map(item => (
                        <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-3 text-blue-600">{item.kodeBeli}</td>
                            <td className="px-4 py-3">{item.tanggalBeli}</td>
                            <td className="px-4 py-3">{item.supplier}</td>
                            <td className="px-4 py-3">{item.tanggalFPM}</td>
                            <td className="px-4 py-3">{item.masaNSFPM}</td>
                            <td className="px-4 py-3">{item.nsfpmMasukan}</td>
                            <td className="px-4 py-3 text-right">{item.qty}</td>
                            <td className="px-4 py-3">{item.tipeUnit}</td>
                            <td className="px-4 py-3">{item.noMesin}</td>
                            <td className="px-4 py-3">{item.noRangka}</td>
                            <td className="px-4 py-3 text-right">Rp {item.hargaBeli}</td>
                            <td className="px-4 py-3 text-right">Rp {item.biaya}</td>
                            <td className="px-4 py-3 text-right">Rp {item.hargaUnit}</td>
                            <td className="px-4 py-3 text-right">Rp {item.dppBeli}</td>
                            <td className="px-4 py-3 text-right">Rp {item.ppn}</td>
                            <td className="px-4 py-3 text-right">Rp {item.paymentBeli}</td>
                            <td className="px-4 py-3 text-center">
                                <div className="relative group">
                                    <MoreVertical size={18} className="cursor-pointer" />
                                    <div className="absolute right-0 hidden group-hover:block bg-white shadow-md rounded-md border text-sm">
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
