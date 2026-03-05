import { PPNPembelian } from "@/@types/ppn-pembelian.types"
import { MoreVertical } from "lucide-react"
import { useTableSort } from "@/hooks/useTableSort"
import { SortableHeader } from "@/components/ui/sortable-header"

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
    const { sortedData, sortKey, sortOrder, handleSort } = useTableSort({
        data,
    })
    return (
        <div className="bg-white rounded-xl border overflow-x-auto">
            <table className="min-w-[1800px] w-full text-sm">
                <thead className="text-center bg-gray-50/50 uppercase text-sm font-semibold text-gray-900">
                    <tr className="text-center border-b border-gray-200">
                        <th className="py-2 text-left">
                            <SortableHeader title="Kode Beli" sortKey="kodeBeli" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-900 justify-start w-full px-4" />
                        </th>
                        <th className="py-2 text-left">
                            <SortableHeader title="Tanggal Beli" sortKey="tanggalBeli" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-900 justify-start w-full px-4" />
                        </th>
                        <th className="py-2 text-left">
                            <SortableHeader title="Supplier" sortKey="supplier" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-900 justify-start w-full px-4" />
                        </th>
                        <th className="py-2 text-left">
                            <SortableHeader title="Tanggal FPM" sortKey="tanggalFPM" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-900 justify-start w-full px-4" />
                        </th>
                        <th className="py-2 text-left">
                            <SortableHeader title="Masa NSFPM" sortKey="masaNSFPM" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-900 justify-start w-full px-4" />
                        </th>
                        <th className="py-2 text-left">
                            <SortableHeader title="NSFPM Masukan" sortKey="nsfpmMasukan" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-900 justify-start w-full px-4" />
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
                            <SortableHeader title="Harga Beli" sortKey="hargaBeli" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-900 justify-end w-full px-4" />
                        </th>
                        <th className="py-2 text-right">
                            <SortableHeader title="Biaya" sortKey="biaya" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-900 justify-end w-full px-4" />
                        </th>
                        <th className="py-2 text-right">
                            <SortableHeader title="Harga Unit" sortKey="hargaUnit" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-900 justify-end w-full px-4" />
                        </th>
                        <th className="py-2 text-right">
                            <SortableHeader title="DPP Beli" sortKey="dppBeli" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-900 justify-end w-full px-4" />
                        </th>
                        <th className="py-2 text-right">
                            <SortableHeader title="PPN 11%" sortKey="ppn" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-900 justify-end w-full px-4" />
                        </th>
                        <th className="py-2 text-right">
                            <SortableHeader title="Payment Beli" sortKey="paymentBeli" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-900 justify-end w-full px-4" />
                        </th>
                        <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedData.map(item => (
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
