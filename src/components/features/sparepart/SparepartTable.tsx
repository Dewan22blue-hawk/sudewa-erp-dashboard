import { Sparepart } from "@/@types/sparepart.types"
import { MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface Props {
    data: Sparepart[]
    onEdit: (item: Sparepart) => void
    onDelete: (item: Sparepart) => void
}

export function SparepartTable({ data, onEdit, onDelete }: Props) {
    if (!data.length) {
        return <p className="text-sm text-muted-foreground">Tidak ada data</p>
    }

    return (
        <div className="rounded-xl border">
            <table className="w-full text-sm">
                <thead className="bg-muted uppercase text-xs">
                    <tr>
                        <th className="p-3 text-left">Kode Sparepart</th>
                        <th className="p-3 text-left">Nama Sparepart</th>
                        <th className="p-3 text-left">Grup Sparepart</th>
                        <th className="p-3 text-left">Satuan</th>
                        <th className="p-3 text-left">Harga Beli</th>
                        <th className="p-3 text-left">Harga Jual</th>
                        <th className="p-3 text-right">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr key={item.id} className="border-t">
                            <td className="p-3">{item.code}</td>
                            <td className="p-3">{item.name}</td>
                            <td className="p-3">{item.group}</td>
                            <td className="p-3">{item.unit}</td>
                            <td className="p-3">
                                RP {item.purchasePrice.toLocaleString("id-ID")}
                            </td>
                            <td className="p-3">
                                RP {item.sellingPrice.toLocaleString("id-ID")}
                            </td>
                            <td className="p-3 text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button size="icon" variant="ghost">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onEdit(item)}>
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-destructive"
                                            onClick={() => onDelete(item)}
                                        >
                                            Hapus
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
