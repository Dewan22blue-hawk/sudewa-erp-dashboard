import { useState } from "react"
import Head from "next/head"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import { usePPNPembelian } from "@/hooks/usePPNPembelian"
import PPNPembelianTable from "@/components/features/ppn-pembelian/PPNPembelianTable"
import PPNPembelianFormDialog from "@/components/features/ppn-pembelian/PPNPembelianFormDialog"
import DeletePPNPembelianDialog from "@/components/features/ppn-pembelian/DeletePPNPembelianDialog"
import { PPNPembelian } from "@/@types/ppn-pembelian.types"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function DataPPNPembelianPage() {
    const { data: allData = [] } = usePPNPembelian()

    const [searchTerm, setSearchTerm] = useState("")
    const [itemsPerPage, setItemsPerPage] = useState("25")
    const [currentPage, setCurrentPage] = useState(1)

    const [openForm, setOpenForm] = useState(false)
    const [openDelete, setOpenDelete] = useState(false)
    const [selected, setSelected] = useState<PPNPembelian | null>(null)

    // Filter Logic
    const filteredData = allData.filter(item =>
        item.kodeBeli.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tipeUnit.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Pagination Logic
    const totalItems = filteredData.length
    const totalPages = Math.ceil(totalItems / Number(itemsPerPage))
    const startIndex = (currentPage - 1) * Number(itemsPerPage)
    const endIndex = startIndex + Number(itemsPerPage)
    const currentData = filteredData.slice(startIndex, endIndex)

    return (
        <DashboardLayout>
            <Head>
                <title>Data PPN Pembelian - Wajira Dashboard</title>
            </Head>

            <div className="space-y-6 p-6 grid grid-cols-1">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Data PPN Pembelian
                    </h1>
                    <p className="text-sm text-gray-500">
                        Kelola dan lacak semua data ppn pembelian unit
                    </p>
                </div>

                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="relative w-[300px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <Input
                                placeholder="Search here"
                                className="pl-10 bg-white"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value)
                                    setCurrentPage(1) // Reset to page 1 on search
                                }}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Show</span>
                            <Select
                                value={itemsPerPage}
                                onValueChange={(val) => {
                                    setItemsPerPage(val)
                                    setCurrentPage(1)
                                }}
                            >
                                <SelectTrigger className="w-[70px]">
                                    <SelectValue placeholder="25" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                    <SelectItem value="100">100</SelectItem>
                                </SelectContent>
                            </Select>
                            <span className="text-sm text-gray-500">Page</span>
                        </div>
                    </div>

                    <Button
                        className="bg-[#1e293b] hover:bg-[#0f172a]"
                        onClick={() => {
                            setSelected(null)
                            setOpenForm(true)
                        }}
                    >
                        <Plus size={16} className="mr-2" />
                        Tambah
                    </Button>
                </div>

                <PPNPembelianTable
                    data={currentData}
                    onEdit={(item) => {
                        setSelected(item)
                        setOpenForm(true)
                    }}
                    onDelete={(item) => {
                        setSelected(item)
                        setOpenDelete(true)
                    }}
                />

                {/* Pagination Footer */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                    <div>
                        Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} data
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <Button variant="outline" size="sm" className="bg-gray-100">
                            {currentPage}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>

                <PPNPembelianFormDialog
                    open={openForm}
                    onClose={() => setOpenForm(false)}
                    initialData={selected}
                />

                <DeletePPNPembelianDialog
                    open={openDelete}
                    onClose={() => setOpenDelete(false)}
                    id={selected?.id}
                />
            </div>
        </DashboardLayout>
    )
}
