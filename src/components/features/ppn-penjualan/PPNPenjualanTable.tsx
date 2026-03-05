import { PPNPenjualan } from "@/@types/ppn-penjualan.types"
import { MoreVertical } from "lucide-react"
import { useTableSort } from "@/hooks/useTableSort"
import { SortableHeader } from "@/components/ui/sortable-header"

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
    const { sortedData, sortKey, sortOrder, handleSort } = useTableSort({
        data,
    })
    return (
        <div className="bg-white rounded-xl border overflow-x-auto">
            <table className="min-w-[2000px] w-full text-sm">
                <thead className="bg-gray-50/50 uppercase text-sm font-semibold text-gray-900">
                    <tr className="text-center border-b border-gray-200">
                        <th className="py-2 text-left">
                            <SortableHeader title="Kode Jual" sortKey="kodeJual" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-900 justify-start w-full px-4" />
                        </th>
                        <th className="py-2 text-left">
                            <SortableHeader title="Tanggal Jual" sortKey="tanggalJual" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-900 justify-start w-full px-4" />
                        </th>
                        <th className="py-2 text-left">
                            <SortableHeader title="Customer" sortKey="customer" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-900 justify-start w-full px-4" />
                        </th>
                        <th className="py-2 text-left">
                            <SortableHeader title="Tanggal FPK" sortKey="tanggalFPK" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-900 justify-start w-full px-4" />
                        </th>
                        <th className="py-2 text-left">
                            <SortableHeader title="Masa NSFPK" sortKey="masaNSFPK" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-900 justify-start w-full px-4" />
                        </th>
                        <th className="py-2 text-left">
                            <SortableHeader title="NSFPK Keluaran" sortKey="nsfpkKeluaran" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-900 justify-start w-full px-4" />
                        </th>
                        <th className="py-2 text-right">
                            <SortableHeader title="QTY" sortKey="qty" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-900 justify-end w-full px-4" />
                        </th>
                        <th className="py-2 text-left">
                            <SortableHeader title="Tipe Unit" sortKey="tipeUnit" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-900 justify-start w-full px-4" />
                        </th>
                        <th className="py-2 text-left">
                            <SortableHeader title="No Mesin" sortKey="noMesin" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-900 justify-start w-full px-4" />
                        </th>
                        <th className="py-2 text-left">
                            <SortableHeader title="No Rangka" sortKey="noRangka" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-900 justify-start w-full px-4" />
                        </th>
                        <th className="py-2 text-right">
                            <SortableHeader title="Harga Jual" sortKey="hargaJual" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-900 justify-end w-full px-4" />
                        </th>
                        <th className="py-2 text-right">
                            <SortableHeader title="Biaya" sortKey="biaya" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-900 justify-end w-full px-4" />
                        </th>
                        <th className="py-2 text-right">
                            <SortableHeader title="Harga Unit" sortKey="hargaUnit" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-900 justify-end w-full px-4" />
                        </th>
                        <th className="py-2 text-right">
                            <SortableHeader title="DPP Jual" sortKey="dppJual" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-900 justify-end w-full px-4" />
                        </th>
                        <th className="py-2 text-right">
                            <SortableHeader title="PPN 11%" sortKey="ppn" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-900 justify-end w-full px-4" />
                        </th>
                        <th className="py-2 text-right">
                            <SortableHeader title="Payment Jual" sortKey="paymentJual" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-900 justify-end w-full px-4" />
                        </th>
                        <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedData.map(item => (
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
