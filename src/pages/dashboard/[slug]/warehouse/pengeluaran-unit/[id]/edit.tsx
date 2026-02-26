"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { toast } from "sonner"
import { ChevronLeft, Save } from "lucide-react"
import PengeluaranUnitHeaderCard from "@/components/features/pengeluaran-unit/PengeluaranUnitHeaderCard"
import PengeluaranUnitEditTable from "@/components/features/pengeluaran-unit/PengeluaranUnitEditTable"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import {
    usePengeluaranUnitById,
    usePengeluaranDetail,
    useBulkDeleteDetail,
    useUpdatePengeluaranUnit
} from "@/hooks/usePengeluaranUnit"
import { Button } from "@/components/ui/button"

export default function EditPengeluaranUnitPage() {
    const router = useRouter()
    const { slug, id } = router.query as { slug?: string, id?: string }

    const { data: header, isLoading } = usePengeluaranUnitById(id)
    const { data: details = [], isLoading: loadingDetail } = usePengeluaranDetail(id)
    const deleteMutation = useBulkDeleteDetail()
    const updateMutation = useUpdatePengeluaranUnit()

    const [form, setForm] = useState<{
        noPengeluaran: string;
        tanggal: Date | undefined;
        supplier: string;
        keterangan: string;
    }>({
        noPengeluaran: "",
        tanggal: undefined,
        supplier: "",
        keterangan: "",
    })

    // Populate data when fetched
    useEffect(() => {
        if (header) {
            setForm({
                noPengeluaran: header.noPengeluaran || "",
                tanggal: header.tanggal ? new Date(header.tanggal) : undefined,
                supplier: header.supplier || header.customer || "",
                keterangan: header.keterangan || "",
            })
        }
    }, [header])

    const handleFieldChange = (field: string, value: any) => {
        setForm((prev) => ({ ...prev, [field]: value }))
    }

    // Auto-save logic (to fire on blur from HeaderCard)
    const handleSaveField = async (field: string, value: any) => {
        if (!id) return;

        try {
            const payloadValue = field === 'tanggal' && value instanceof Date
                ? value.toISOString().split('T')[0]
                : value;

            await updateMutation.mutateAsync({
                id,
                payload: { [field]: payloadValue }
            });
            toast.success("Perubahan otomatis tersimpan")
        } catch (error) {
            toast.error("Gagal menyimpan otomatis")
        }
    }

    const handleDeleteTable = async (ids: string[]) => {
        await deleteMutation.mutateAsync(ids)
        toast.success("Data berhasil dihapus")
    }

    const handleSimpanClick = () => {
        toast.success("Perubahan data berhasil disinkronisasi")
        router.push(`/dashboard/${slug}/warehouse/pengeluaran-unit`)
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2 hover:bg-transparent" onClick={() => router.push(`/dashboard/${slug}/warehouse/pengeluaran-unit`)}>
                            <ChevronLeft className="h-6 w-6 text-gray-700" />
                        </Button>
                        <h1 className="text-xl font-bold text-gray-900">Data Pengeluaran</h1>
                    </div>
                </div>

                {isLoading || !header ? (
                    <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-100">Loading...</div>
                ) : (
                    <PengeluaranUnitHeaderCard
                        data={form}
                        onChange={handleFieldChange}
                        onBlur={handleSaveField}
                    />
                )}

                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                    {loadingDetail ? (
                        <div className="p-8 text-center text-gray-500">Memuat detail...</div>
                    ) : (
                        <PengeluaranUnitEditTable
                            data={details}
                            onDelete={handleDeleteTable}
                        />
                    )}
                </div>

                <div className="flex justify-center items-center gap-4 mt-8 pb-4">
                    <Button variant="ghost" className="px-6 font-medium text-gray-600 hover:bg-transparent hover:text-gray-900 text-sm" onClick={() => router.push(`/dashboard/${slug}/warehouse/pengeluaran-unit`)}>
                        Kembali
                    </Button>
                    <Button
                        onClick={handleSimpanClick}
                        className="px-6 h-10 bg-[#1e3256] hover:bg-[#15233d] text-white font-medium rounded-lg shadow-sm gap-2"
                    >
                        <Save size={16} /> Simpan Selesai
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    )
}