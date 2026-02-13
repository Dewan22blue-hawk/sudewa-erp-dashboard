import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import type { Customer } from "@/@types/customer.types"

interface CustomerTableProps {
    customers: Customer[]
    onEdit: (customer: Customer) => void
    onDelete: (customer: Customer) => void
}

export function CustomerTable({ customers, onEdit, onDelete }: CustomerTableProps) {
    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="font-semibold uppercase">Kode Customer</TableHead>
                        <TableHead className="font-semibold uppercase">Nama Customer</TableHead>
                        <TableHead className="font-semibold uppercase">Alamat</TableHead>
                        <TableHead className="font-semibold uppercase">NPWP</TableHead>
                        <TableHead className="font-semibold uppercase">PIC</TableHead>
                        <TableHead className="font-semibold uppercase">Handphone</TableHead>
                        <TableHead className="text-right font-semibold uppercase">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {customers.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                                Tidak ada data
                            </TableCell>
                        </TableRow>
                    ) : (
                        customers.map((customer) => (
                            <TableRow key={customer.id}>
                                <TableCell>{customer.code}</TableCell>
                                <TableCell>{customer.name}</TableCell>
                                <TableCell className="max-w-[300px] truncate">
                                    {customer.address}
                                </TableCell>
                                <TableCell>{customer.npwp}</TableCell>
                                <TableCell>{customer.pic}</TableCell>
                                <TableCell>{customer.phone}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button size="icon" variant="ghost">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => onEdit(customer)}>
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => onDelete(customer)}
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
