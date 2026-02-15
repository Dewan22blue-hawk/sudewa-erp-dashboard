import { Kas } from "@/@types/kas.types"
import { MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface Props {
    data: Kas[]
    onEdit: (item: Kas) => void
    onDelete: (item: Kas) => void
}

export function KasTable({ data, onEdit, onDelete }: Props) {
    if (!data.length) {
        return (
            <div className="text-center py-6 text-sm text-muted-foreground">
                Tidak ada data
            </div>
        )
    }

    return (
        <div className="rounded-xl border">
            <table className="w-full text-sm">
                <thead className="bg-muted uppercase text-xs">
                    <tr>
                        <th className="p-3 text-left font-bold text-muted-foreground">Kode Kas</th>
                        <th className="p-3 text-left font-bold text-muted-foreground">Deskripsi</th>
                        <th className="p-3 text-left font-bold text-muted-foreground">Jenis</th>
                        <th className="p-3 text-right font-bold text-muted-foreground">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr key={item.id} className="border-t hover:bg-muted/50 transition-colors">
                            <td className="p-3">{item.code}</td>
                            <td className="p-3">{item.description}</td>
                            <td className="p-3">{item.type}</td>
                            <td className="p-3 text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onEdit(item)}>
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-destructive focus:text-destructive"
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
