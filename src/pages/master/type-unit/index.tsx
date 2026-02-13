import { useState } from "react"
import { useRouter } from "next/router"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { useCompany } from "@/contexts/CompanyContext"
import { useTypeUnits, useDeleteTypeUnit } from "@/hooks/useTypeUnit"
import { TypeUnitTable } from "@/components/features/type-unit/TypeUnitTable"
import { DeleteTypeUnitDialog } from "@/components/features/type-unit/DeleteTypeUnitDialog"
import type { TypeUnit } from "@/@types/type-unit.types"

export default function TypeUnitPage() {
    const router = useRouter()
    const { companyId } = useCompany()
    const { data, isLoading, isError } = useTypeUnits(companyId)
    const deleteTypeUnit = useDeleteTypeUnit()

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [typeUnitToDelete, setTypeUnitToDelete] = useState<TypeUnit | null>(null)

    const handleCreateClick = () => {
        router.push("/master/type-unit/create")
    }

    const handleEditClick = (typeUnit: TypeUnit) => {
        router.push(`/master/type-unit/${typeUnit.id}/edit`)
    }

    const handleDeleteClick = (typeUnit: TypeUnit) => {
        setTypeUnitToDelete(typeUnit)
        setDeleteDialogOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!typeUnitToDelete) return

        try {
            await deleteTypeUnit.mutateAsync(typeUnitToDelete.id)
            setDeleteDialogOpen(false)
            setTypeUnitToDelete(null)
            toast.success("Data berhasil dihapus")
        } catch (error) {
            console.error("Failed to delete type unit:", error)
            toast.error("Gagal menghapus data tipe unit")
        }
    }

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold">Tipe Unit</h1>
                            <p className="text-sm text-muted-foreground">
                                Kelola semua tipe unit
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
                            <h1 className="text-2xl font-semibold">Tipe Unit</h1>
                            <p className="text-sm text-muted-foreground">
                                Kelola semua tipe unit
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
                        <h1 className="text-2xl font-semibold">Tipe Unit</h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola semua tipe unit
                        </p>
                    </div>
                    <Button onClick={handleCreateClick} className="bg-black text-white hover:bg-black/90">
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah
                    </Button>
                </div>

                {/* FILTERS & ENTRIES */}
                <div className="flex items-center gap-2 text-sm">
                    <span>Show</span>
                    <div className="rounded-md border px-3 py-1 bg-background">
                        10
                    </div>
                    <span>Entries</span>
                </div>

                {/* TABLE CARD */}
                <Card className="rounded-xl overflow-hidden border p-0">
                    <TypeUnitTable
                        typeUnits={data?.data || []}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                    />
                </Card>

                {/* PAGINATION CONTROLS */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                        Showing 1-{data?.data.length || 0} of {data?.meta.total} data
                    </span>

                    <div className="flex items-center gap-2">
                        <span className="cursor-pointer hover:text-foreground">Previous</span>
                        <div className="rounded-md border bg-muted px-3 py-1 text-foreground font-medium">
                            1
                        </div>
                        <span className="cursor-pointer hover:text-foreground">Next</span>
                    </div>
                </div>
            </div>

            <DeleteTypeUnitDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleConfirmDelete}
                isDeleting={deleteTypeUnit.isPending}
            />
        </DashboardLayout>
    )
}
