import { useState } from "react"
import Head from "next/head"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Layout from "@/components/layout/Layout"
import { useKasHarian } from "@/hooks/useKasHarian"
import KasHarianTable from "@/components/features/kas-harian/KasHarianTable"
import KasHarianSummary from "@/components/features/kas-harian/KasHarianSummary"
import AddKasHarianDialog from "@/components/features/kas-harian/AddKasHarianDialog"
import EditKasHarianDialog from "@/components/features/kas-harian/EditKasHarianDialog"
import DeleteKasHarianDialog from "@/components/features/kas-harian/DeleteKasHarianDialog"
import { KasHarian } from "@/@types/kas-harian.types"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function KasHarianPage() {
    const { data: kasHarianData, isLoading } = useKasHarian()
    const [searchTerm, setSearchTerm] = useState("")

    // Modal states
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState<KasHarian | null>(null)

    const handleEdit = (item: KasHarian) => {
        setSelectedItem(item)
        setIsEditOpen(true)
    }

    const handleDelete = (item: KasHarian) => {
        setSelectedItem(item)
        setIsDeleteOpen(true)
    }

    const filteredData = kasHarianData?.filter(item =>
        item.keterangan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.notaRef.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []

    return (
        <Layout>
            <Head>
                <title>Transaksi Kas Harian - Wajira Dashboard</title>
            </Head>

            <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Arus Transaksi Kas Harian</h1>
                        <p className="text-gray-500">Kelola arus transaksi kas harian</p>
                    </div>

                    <Button
                        onClick={() => setIsAddOpen(true)}
                        className="bg-[#1e293b] hover:bg-[#0f172a] gap-2"
                    >
                        <Plus size={18} />
                        Tambah
                    </Button>
                </div>

                <KasHarianSummary />

                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-4">
                        <div className="relative w-[300px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <Input
                                placeholder="Search here"
                                className="pl-10 bg-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Show</span>
                            <Select defaultValue="25">
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
                </div>

                {isLoading ? (
                    <div className="text-center py-10">Loading...</div>
                ) : (
                    <KasHarianTable
                        data={filteredData}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                )}

                <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                    <div>Showing 1-25 of 100 data</div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled>Previous</Button>
                        <Button variant="outline" size="sm" className="bg-gray-100">1</Button>
                        <Button variant="outline" size="sm">2</Button>
                        <Button variant="outline" size="sm">3</Button>
                        <span className="flex items-center px-2">...</span>
                        <Button variant="outline" size="sm">10</Button>
                        <Button variant="outline" size="sm">Next</Button>
                    </div>
                </div>
            </div>

            <AddKasHarianDialog
                open={isAddOpen}
                onOpenChange={setIsAddOpen}
            />

            <EditKasHarianDialog
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                data={selectedItem}
            />

            <DeleteKasHarianDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                data={selectedItem}
            />
        </Layout>
    )
}
