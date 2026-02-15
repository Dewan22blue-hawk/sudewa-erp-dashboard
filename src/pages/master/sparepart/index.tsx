import { useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useSpareparts } from "@/hooks/useSparepart"
import { SparepartTable } from "@/components/features/sparepart/SparepartTable"
import { SparepartFormDialog } from "@/components/features/sparepart/SparepartFormDialog"
import { DeleteSparepartDialog } from "@/components/features/sparepart/DeleteSparepartDialog"
import { ImportSparepartDialog } from "@/components/features/sparepart/ImportSparepartDialog"
import { Plus, Upload } from "lucide-react"
import { useCompany } from "@/contexts/CompanyContext"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

export default function SparepartPage() {
    const { companyId } = useCompany()
    // Defaulting to "1" if context is missing, but DashboardLayout guards this.
    const safeCompanyId = companyId || "1"

    const { data, isLoading, isError } = useSpareparts(safeCompanyId)

    const [selected, setSelected] = useState<any>(null)
    const [openForm, setOpenForm] = useState(false)
    const [openDelete, setOpenDelete] = useState(false)
    const [openImport, setOpenImport] = useState(false)

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

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setOpenImport(true)}>
                            <Upload className="mr-2 h-4 w-4" />
                            Import
                        </Button>
                        <Button
                            className="bg-black text-white hover:bg-black/90"
                            onClick={() => {
                                setSelected(null)
                                setOpenForm(true)
                            }}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah
                        </Button>
                    </div>
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
                <Card className="rounded-xl overflow-hidden border p-0">
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
                    />
                </Card>

                {/* PAGINATION CONTROLS */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                        Showing 1-{data?.data.length || 0} of {data?.meta?.total || 0} data
                    </span>

                    <div className="flex items-center gap-2">
                        <span className="cursor-pointer hover:text-foreground">Previous</span>
                        <div className="rounded-md border bg-muted px-3 py-1 text-foreground font-medium">
                            1
                        </div>
                        <span className="cursor-pointer hover:text-foreground">Next</span>
                    </div>
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

                <ImportSparepartDialog
                    open={openImport}
                    onOpenChange={setOpenImport}
                    companyId={safeCompanyId}
                />
            </div>
        </DashboardLayout>
    )
}
