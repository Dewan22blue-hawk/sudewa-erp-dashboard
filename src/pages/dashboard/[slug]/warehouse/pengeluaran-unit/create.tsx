"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { toast } from "sonner"
import { ChevronLeft, Save } from "lucide-react"
import PengeluaranUnitHeaderCard from "@/components/features/pengeluaran-unit/PengeluaranUnitHeaderCard"
import PengeluaranUnitCreateTable from "@/components/features/pengeluaran-unit/PengeluaranUnitCreateTable"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { useCreatePengeluaranUnit, useBulkKirimDetail } from "@/hooks/usePengeluaranUnit"
import { Button } from "@/components/ui/button"

export default function CreatePengeluaranUnitPage() {
    const router = useRouter()
    const createMutation = useCreatePengeluaranUnit()
    const kirimMutation = useBulkKirimDetail()

    const [form, setForm] = useState<{
        noPengeluaran: string;
        tanggal: Date | undefined;
        supplier: string;
        keterangan: string;
    }>({
        noPengeluaran: "Loading...",
        tanggal: undefined,
        supplier: "",
        keterangan: "",
    })

    useEffect(() => {
        // Simulate auto-generate 'No Pengeluaran' from backend
        const generateNoPengeluaran = () => {
            const randomCode = Math.floor(10000 + Math.random() * 90000);
            setForm(prev => ({ ...prev, noPengeluaran: `PU-${randomCode}` }));
        };
        generateNoPengeluaran();
    }, []);

    const handleFieldChange = (field: string, value: any) => {
        setForm((prev) => ({ ...prev, [field]: value }))
    }

    const handleKirimTable = async (ids: string[]) => {
        await kirimMutation.mutateAsync(ids)
        toast.success("Data berhasil dikirim")
    }

    const handleSimpan = async () => {
        await createMutation.mutateAsync({
            tanggal: form.tanggal ? form.tanggal.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            customer: form.supplier || 'PT Customer', // fallback per original code
            supplier: form.supplier,
            keterangan: form.keterangan || '-',
        })
        toast.success("Data berhasil disimpan")
        router.back()
    }

    const mockDetails = Array.from({ length: 50 }).map((_, i) => ({
        id: `unit-${i}`,
        pengeluaranId: 'new',
        kodeJual: `Honda XX ${i}`,
        tipeUnit: "ABC",
        warna: "Hitam",
        noMesin: `Mesin ${(i + 1).toString().padStart(2, '0')}`,
        noRangka: `RANGKA ${(i + 1).toString().padStart(2, '0')}`,
        dikirim: false,
    }))

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2 hover:bg-transparent" onClick={() => router.back()}>
                            <ChevronLeft className="h-6 w-6 text-gray-700" />
                        </Button>
                        <h1 className="text-xl font-bold text-gray-900">Data Pengeluaran</h1>
                    </div>
                </div>

                <PengeluaranUnitHeaderCard data={form} onChange={handleFieldChange} mode="create" />

                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                    <PengeluaranUnitCreateTable
                        data={mockDetails}
                        onKirim={handleKirimTable}
                        onCancel={() => router.back()}
                    />
                </div>

                <div className="flex justify-center items-center gap-4 mt-8 pb-4">
                    <Button variant="ghost" className="px-6 font-medium text-gray-600 hover:bg-transparent hover:text-gray-900 text-sm" onClick={() => router.back()}>
                        Batal
                    </Button>
                    <Button
                        onClick={handleSimpan}
                        className="px-6 h-10 bg-[#1e3256] hover:bg-[#15233d] text-white font-medium rounded-lg shadow-sm gap-2"
                    >
                        <Save size={16} /> Simpan
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    )
}