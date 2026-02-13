import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import type { Supplier } from "@/@types/supplier.types"

interface SupplierTableProps {
    suppliers: Supplier[]
    onEdit: (supplier: Supplier) => void
    onDelete: (supplier: Supplier) => void
}

export function SupplierTable({ suppliers, onEdit, onDelete }: SupplierTableProps) {
    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="font-semibold uppercase">Kode Supplier</TableHead>
                        <TableHead className="font-semibold uppercase">Nama Supplier</TableHead>
                        <TableHead className="font-semibold uppercase">Alamat</TableHead>
                        <TableHead className="font-semibold uppercase">NPWP</TableHead>
                        <TableHead className="font-semibold uppercase">PIC</TableHead>
                        <TableHead className="font-semibold uppercase">Handphone</TableHead>
                        <TableHead className="text-right font-semibold uppercase">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {suppliers.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                                Tidak ada data
                            </TableCell>
                        </TableRow>
                    ) : (
                        suppliers.map((supplier) => (
                            <TableRow key={supplier.id}>
                                <TableCell>{supplier.code}</TableCell>
                                <TableCell>{supplier.name}</TableCell>
                                <TableCell className="max-w-[300px] truncate">
                                    {supplier.address}
                                </TableCell>
                                <TableCell>{supplier.npwp}</TableCell>
                                <TableCell>{supplier.pic}</TableCell>
                                <TableCell>{supplier.phone}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button size="icon" variant="ghost">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => onEdit(supplier)}>
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => onDelete(supplier)}
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
