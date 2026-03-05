import { Transaction } from "@/@types/transaction.types"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTableSort } from "@/hooks/useTableSort"
import { SortableHeader } from "@/components/ui/sortable-header"

interface Props {
    data: Transaction[]
    onEdit: (trx: Transaction) => void
    onDelete: (trx: Transaction) => void
}

const formatMoney = (val: number, currency: "USD" | "IDR") => {
    if (!val) return "0"
    return new Intl.NumberFormat(currency === "USD" ? "en-US" : "id-ID", {
        style: "currency",
        currency: currency,
    }).format(val)
}

export function TransactionTable({ data, onEdit, onDelete }: Props) {
    if (!data.length) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl bg-white h-64">
                <p className="text-muted-foreground">Tidak ada data transaksi</p>
            </div>
        )
    }

    const { sortedData, sortKey, sortOrder, handleSort } = useTableSort({
        data,
    })

    return (
        <div className="rounded-xl border bg-white overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-muted uppercase text-xs">
                        <tr>
                            <th className="p-0 text-left font-bold text-black min-w-[100px]" rowSpan={2}>
                                <SortableHeader title="Tanggal" sortKey="date" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-black justify-start w-full px-2" />
                            </th>
                            <th className="p-0 text-left font-bold text-black min-w-[150px]" rowSpan={2}>
                                <SortableHeader title="Transaksi" sortKey="name" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-black justify-start w-full px-2" />
                            </th>
                            <th className="p-2 text-center font-bold text-black border-l border-r" colSpan={4}>BANK</th>
                            <th className="p-2 text-center font-bold text-black border-r" colSpan={2}>CASH</th>
                            <th className="p-0 text-left font-bold text-black min-w-[150px]" rowSpan={2}>
                                <SortableHeader title="Keterangan" sortKey="description" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-black justify-start w-full px-2" />
                            </th>
                            <th className="p-2 text-center font-bold text-black" rowSpan={2}>Action</th>
                        </tr>
                        <tr className="border-t">
                            {/* BANK SUBHEADER */}
                            <th className="p-2 text-right font-medium text-xs text-black border-l">Debet USD</th>
                            <th className="p-2 text-right font-medium text-xs text-black">Kredit USD</th>
                            <th className="p-2 text-right font-medium text-xs text-black">Debet IDR</th>
                            <th className="p-2 text-right font-medium text-xs text-black border-r">Kredit IDR</th>

                            {/* CASH SUBHEADER */}
                            <th className="p-2 text-right font-medium text-xs text-black">Debet</th>
                            <th className="p-2 text-right font-medium text-xs text-black border-r">Kredit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.map((trx) => (
                            <tr key={trx.id} className="border-t hover:bg-muted/50 transition-colors">
                                <td className="p-2 whitespace-nowrap">{trx.date}</td>
                                <td className="p-2 font-medium">{trx.name}</td>

                                {/* BANK */}
                                <td className={`p-2 text-right ${trx.debitUSD ? "text-green-600 font-medium" : "text-muted-foreground/50"}`}>
                                    {trx.debitUSD ? formatMoney(trx.debitUSD, "USD") : "0"}
                                </td>
                                <td className={`p-2 text-right ${trx.creditUSD ? "text-red-600 font-medium" : "text-muted-foreground/50"}`}>
                                    {trx.creditUSD ? formatMoney(trx.creditUSD, "USD") : "0"}
                                </td>
                                <td className={`p-2 text-right ${trx.debitIDR ? "text-green-600 font-medium" : "text-muted-foreground/50"}`}>
                                    {trx.debitIDR ? formatMoney(trx.debitIDR, "IDR") : "0"}
                                </td>
                                <td className={`p-2 text-right border-r ${trx.creditIDR ? "text-red-600 font-medium" : "text-muted-foreground/50"}`}>
                                    {trx.creditIDR ? formatMoney(trx.creditIDR, "IDR") : "0"}
                                </td>

                                {/* CASH */}
                                <td className={`p-2 text-right ${trx.debitCash ? "text-green-600 font-medium" : "text-muted-foreground/50"}`}>
                                    {trx.debitCash ? formatMoney(trx.debitCash, "IDR") : "0"}
                                </td>
                                <td className={`p-2 text-right border-r ${trx.creditCash ? "text-red-600 font-medium" : "text-muted-foreground/50"}`}>
                                    {trx.creditCash ? formatMoney(trx.creditCash, "IDR") : "0"}
                                </td>

                                <td className="p-2 text-muted-foreground max-w-[150px] truncate" title={trx.description}>
                                    {trx.description || "-"}
                                </td>
                                <td className="p-2 text-center">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 p-0">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => onEdit(trx)}>
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive"
                                                onClick={() => onDelete(trx)}
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
        </div>
    )
}
