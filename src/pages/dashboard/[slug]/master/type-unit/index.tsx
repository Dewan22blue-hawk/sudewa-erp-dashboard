import { useState } from "react"
import { useRouter } from "next/router"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card } from "@/components/ui/card"
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
                </div>

                {/* TABLE CARD */}
                <div className="">
                    <TypeUnitTable
                        typeUnits={data?.data || []}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                        onAdd={handleCreateClick}
                    />
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
