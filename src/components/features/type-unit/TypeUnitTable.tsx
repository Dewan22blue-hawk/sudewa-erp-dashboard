import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreVertical } from "lucide-react"
import type { TypeUnit } from "@/@types/type-unit.types"

interface TypeUnitTableProps {
    typeUnits: TypeUnit[]
    onEdit: (typeUnit: TypeUnit) => void
    onDelete: (typeUnit: TypeUnit) => void
}

export function TypeUnitTable({ typeUnits, onEdit, onDelete }: TypeUnitTableProps) {
    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="font-semibold uppercase">KODE TIPE</TableHead>
                        <TableHead className="font-semibold uppercase">MERK</TableHead>
                        <TableHead className="font-semibold uppercase">TIPE UNIT</TableHead>
                        <TableHead className="font-semibold uppercase">JENIS</TableHead>
                        <TableHead className="font-semibold uppercase">MODEL</TableHead>
                        <TableHead className="font-semibold uppercase">BRUTO (KG)</TableHead>
                        <TableHead className="font-semibold uppercase">NETTO (KG)</TableHead>
                        <TableHead className="text-right font-semibold uppercase">ACTION</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {typeUnits.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} className="h-24 text-center">
                                Tidak ada data
                            </TableCell>
                        </TableRow>
                    ) : (
                        typeUnits.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{item.code}</TableCell>
                                <TableCell>{item.merk}</TableCell>
                                <TableCell className="font-medium">{item.type}</TableCell>
                                <TableCell>{item.jenis || "-"}</TableCell>
                                <TableCell>{item.model || "-"}</TableCell>
                                <TableCell>{item.bruto || "-"}</TableCell>
                                <TableCell>{item.netto || "-"}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button size="icon" variant="ghost">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => onEdit(item)}>
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => onDelete(item)}
                                                className="text-destructive focus:text-destructive"
                                            >
                                                Hapus
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
