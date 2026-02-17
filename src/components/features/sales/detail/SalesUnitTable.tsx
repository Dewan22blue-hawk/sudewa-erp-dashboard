import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { UnitItem } from "../sales.data"
import { Button } from "@/components/ui/button"
import { MoreVertical, Trash2, Pencil } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/router"

interface Props {
    units: UnitItem[]
    salesId: string
}

export function SalesUnitTable({ units, salesId }: Props) {
    const router = useRouter()

    const handleEdit = (unitId: string) => {
        router.push(`/sales/${salesId}/unit/${unitId}/edit`)
    }

    const handleDetail = (unitId: string) => {
        router.push(`/sales/${salesId}/unit/${unitId}`)
    }

    const handleDelete = (unitId: string) => {
        if (confirm("Apakah Anda yakin ingin menghapus unit ini?")) {
            console.log("Deleting unit:", unitId)
            // In real app, call API here
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Detail Pembelian Unit</h3>
                    <p className="text-sm text-muted-foreground">Rincian lengkap unit yang dibeli</p>
                </div>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[50px] text-center">No</TableHead>
                            <TableHead>WARNA</TableHead>
                            <TableHead>NOMOR MESIN</TableHead>
                            <TableHead>NOMOR RANGKA</TableHead>
                            <TableHead className="text-right">ACTION</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {units.map((unit, index) => (
                            <TableRow key={unit.id} className="hover:bg-muted/50">
                                <TableCell className="text-center font-medium">{index + 1}</TableCell>
                                <TableCell>{unit.color}</TableCell>
                                <TableCell>{unit.engineNumber}</TableCell>
                                <TableCell>{unit.chassisNumber}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleDetail(unit.id)}>
                                                Detail
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleEdit(unit.id)}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleDelete(unit.id)}
                                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Hapus
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                        {units.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    Belum ada unit yang ditambahkan.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <p>Showing 1-{units.length} of {units.length} data</p>
            </div>
        </div>
    )
}
