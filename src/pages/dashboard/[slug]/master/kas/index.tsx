import { useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card } from "@/components/ui/card"
import { useKas } from "@/hooks/useKas"
import { KasTable } from "@/components/features/kas/KasTable"
import { KasFormDialog } from "@/components/features/kas/KasFormDialog"
import { DeleteKasDialog } from "@/components/features/kas/DeleteKasDialog"
import { useCompany } from "@/contexts/CompanyContext"
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
                </div>

                {/* TABLE CARD */}
                <div className="">
                    <KasTable
                        data={data?.data ?? []}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onAdd={handleCreate}
                    />
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
