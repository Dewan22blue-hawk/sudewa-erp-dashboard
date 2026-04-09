import { useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card } from "@/components/ui/card"
import { useSpareparts, useImportSparepart } from "@/hooks/useSparepart"
import { SparepartTable } from "@/components/features/sparepart/SparepartTable"
import { SparepartFormDialog } from "@/components/features/sparepart/SparepartFormDialog"
import { DeleteSparepartDialog } from "@/components/features/sparepart/DeleteSparepartDialog"
import { DataImportModal } from "@/components/features/master-data/DataImportModal"
import { useCompany } from "@/contexts/CompanyContext"
import { Sparepart } from "@/@types/sparepart.types"

export default function SparepartPage() {
    const { companyId } = useCompany()
    // Defaulting to "1" if context is missing, but DashboardLayout guards this.
    const safeCompanyId = companyId || "1"

    const { data, isLoading, isError, refetch } = useSpareparts(safeCompanyId)
    const importMutation = useImportSparepart(safeCompanyId)

    const [selected, setSelected] = useState<Sparepart | null>(null)
    const [openForm, setOpenForm] = useState(false)
    const [openDelete, setOpenDelete] = useState(false)
    const [openImport, setOpenImport] = useState(false)

    const handleImport = async (file: File) => {
        await importMutation.mutateAsync({ file });
        refetch();
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold">Sparepart</h1>
                            <p className="text-sm text-muted-foreground">
                                Kelola semua sparepart
                            </p>
                        </div>
                    </div>
                    <Card className="rounded-xl p-6">
                        <div className="text-center text-muted-foreground">Loading...</div>
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
                            <h1 className="text-2xl font-semibold">Sparepart</h1>
                            <p className="text-sm text-muted-foreground">
                                Kelola semua sparepart
                            </p>
                        </div>
                    </div>
                    <Card className="rounded-xl p-6">
                        <div className="text-center text-destructive">Gagal memuat data</div>
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
                        <h1 className="text-2xl font-semibold">Sparepart</h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola semua sparepart
                        </p>
                    </div>
                </div>

                {/* TABLE CARD */}
                <div className="">
                    <SparepartTable
                        data={data?.data ?? []}
                        onEdit={(item) => {
                            setSelected(item)
                            setOpenForm(true)
                        }}
                        onDelete={(item) => {
                            setSelected(item)
                            setOpenDelete(true)
                        }}
                        onAdd={() => {
                            setSelected(null)
                            setOpenForm(true)
                        }}
                        onImport={() => setOpenImport(true)}
                    />
                </div>

                <SparepartFormDialog
                    open={openForm}
                    onOpenChange={setOpenForm}
                    sparepart={selected}
                    companyId={safeCompanyId}
                />

                <DeleteSparepartDialog
                    open={openDelete}
                    onOpenChange={setOpenDelete}
                    sparepart={selected}
                    companyId={safeCompanyId}
                />

                <DataImportModal
                    open={openImport}
                    onOpenChange={setOpenImport}
                    title="Import Data Sparepart"
                    description="Unggah file .xlsx untuk mengimport data sparepart."
                    onImport={handleImport}
                    isPending={importMutation.isPending}
                    templateUrl="https://docs.google.com/spreadsheets/d/16yxx_9Yxx9eHMx85b42dwqr7BQ8okess45wGkd-TUig/edit?usp=sharing"
                />
            </div>
        </DashboardLayout>
    )
}
