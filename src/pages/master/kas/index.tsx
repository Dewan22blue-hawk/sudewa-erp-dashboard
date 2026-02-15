import { useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useKas } from "@/hooks/useKas"
import { KasTable } from "@/components/features/kas/KasTable"
import { KasFormDialog } from "@/components/features/kas/KasFormDialog"
import { DeleteKasDialog } from "@/components/features/kas/DeleteKasDialog"
import { Plus } from "lucide-react"
import { useCompany } from "@/contexts/CompanyContext"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Kas } from "@/@types/kas.types"

export default function KasPage() {
    const { companyId } = useCompany()
    const safeCompanyId = companyId || ""

    const { data, isLoading, isError } = useKas(safeCompanyId)

    const [selectedKas, setSelectedKas] = useState<Kas | null>(null)
    const [openForm, setOpenForm] = useState(false)
    const [openDelete, setOpenDelete] = useState(false)

    // State Handler Helpers
    const handleEdit = (item: Kas) => {
        setSelectedKas(item)
        setOpenForm(true)
    }

    const handleDelete = (item: Kas) => {
        setSelectedKas(item)
        setOpenDelete(true)
    }

    const handleCreate = () => {
        setSelectedKas(null)
        setOpenForm(true)
    }

    // Modal Close Handlers (Reset selection)
    const handleOpenFormChange = (open: boolean) => {
        setOpenForm(open)
        if (!open) setSelectedKas(null)
    }

    const handleOpenDeleteChange = (open: boolean) => {
        setOpenDelete(open)
        if (!open) setSelectedKas(null)
    }

    // --- RENDER STATES ---

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold">Kas</h1>
                            <p className="text-sm text-muted-foreground">Kelola keuangan</p>
                        </div>
                    </div>
                    <Card className="rounded-xl p-8 flex justify-center items-center h-[300px]">
                        <div className="text-muted-foreground animate-pulse">Loading...</div>
                    </Card>
                </div>
            </DashboardLayout>
        )
    }

    if (isError) {
        return (
            <DashboardLayout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold">Kas</h1>
                            <p className="text-sm text-muted-foreground">Kelola keuangan</p>
                        </div>
                    </div>
                    <Card className="rounded-xl p-8 flex justify-center items-center h-[300px]">
                        <div className="text-destructive font-medium">Terjadi kesalahan saat mengambil data</div>
                    </Card>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* HEADER */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Kas</h1>
                        <p className="text-sm text-muted-foreground">Kelola keuangan</p>
                    </div>

                    <Button
                        className="bg-black text-white hover:bg-black/90"
                        onClick={handleCreate}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah
                    </Button>
                </div>

                {/* FILTERS & ENTRIES */}
                <div className="flex items-center gap-2 text-sm">
                    <span>Show</span>
                    <Select defaultValue="10">
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder="10" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                    </Select>
                    <span>Entries</span>
                </div>

                {/* TABLE CARD */}
                <Card className="rounded-xl overflow-hidden border p-0 shadow-none">
                    <KasTable
                        data={data?.data ?? []}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </Card>

                {/* PAGINATION CONTROLS */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                        Showing 1-{data?.data?.length || 0} of {data?.meta?.total || 0} data
                    </span>

                    <div className="flex items-center gap-2">
                        <span className="cursor-pointer hover:text-foreground">Previous</span>
                        <div className="rounded-md border bg-muted px-3 py-1 text-foreground font-medium">
                            1
                        </div>
                        <span className="cursor-pointer hover:text-foreground">Next</span>
                    </div>
                </div>

                <KasFormDialog
                    open={openForm}
                    onOpenChange={handleOpenFormChange}
                    kas={selectedKas}
                    companyId={safeCompanyId}
                />

                <DeleteKasDialog
                    open={openDelete}
                    onOpenChange={handleOpenDeleteChange}
                    kas={selectedKas}
                    companyId={safeCompanyId}
                />
            </div>
        </DashboardLayout>
    )
}
