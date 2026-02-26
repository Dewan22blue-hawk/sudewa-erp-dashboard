"use client"

import { useRouter } from "next/router"
import { toast } from "sonner"
import { usePengeluaranUnits, useDeletePengeluaranUnit } from "@/hooks/usePengeluaranUnit"
import PengeluaranUnitTable from "@/components/features/pengeluaran-unit/PengeluaranUnitTable"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"

export default function PengeluaranUnitPage() {
    const router = useRouter()
    const { data: units = [], isLoading } = usePengeluaranUnits()
    const deleteMutation = useDeletePengeluaranUnit()

    const handleDelete = async (id: string) => {
        await deleteMutation.mutateAsync(id)
        toast.success("Data berhasil dihapus")
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Data Pengeluaran Unit
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Kelola dan lacak semua data pengeluaran stock unit
                        </p>
                    </div>

                    <Button
                        onClick={() => router.push(`${window.location.pathname}/create`)}
                        className="bg-[#132c4a] hover:bg-[#1e3256] text-white font-medium px-4 py-2 text-sm rounded-lg shadow-sm"
                    >
                        + Tambah
                    </Button>
                </div>

                {isLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : (
                    <PengeluaranUnitTable data={units} onDelete={handleDelete} />
                )}
            </div>
        </DashboardLayout>
    )
}