"use client"

import { useRouter, useParams } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { FileText } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function LaporanFilterCard() {
    const router = useRouter()
    const params = useParams()
    const slug = params?.slug as string

    const [form, setForm] = useState({
        jenis: "",
        bulan: "",
        tahun: "",
    })

    const handleSubmit = () => {
        if (!form.jenis || !form.bulan || !form.tahun) {
            toast.error("Semua field harus diisi")
            return
        }

        router.push(
            `/dashboard/${slug}/laporan/laporan-akuntansi/${form.jenis}?bulan=${form.bulan}&tahun=${form.tahun}`
        )
    }

    return (
        <div className="bg-white rounded-xl border p-8 space-y-10 shadow-sm">
            <div className="flex flex-col space-y-6">
                <div className="flex items-center">
                    <label className="w-48 text-sm font-medium text-gray-900">
                        Jenis Laporan
                    </label>
                    <div className="w-[300px]">
                        <Select
                            value={form.jenis}
                            onValueChange={(value) => setForm({ ...form, jenis: value })}
                        >
                            <SelectTrigger className="w-full bg-white border-gray-200">
                                <SelectValue placeholder="Pilih jenis laporan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="rugi-laba">Laporan Rugi Laba</SelectItem>
                                <SelectItem value="neraca">Neraca</SelectItem>
                                <SelectItem value="ppn-masukan-perbulan">Laporan PPN Masukan Perbulan</SelectItem>
                                <SelectItem value="ppn-keluaran-perbulan">Laporan PPN Keluaran Perbulan</SelectItem>
                                <SelectItem value="ppn-pertahun">Laporan PPN Pertahun</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex items-center">
                    <label className="w-48 text-sm font-medium text-gray-900">
                        Bulan
                    </label>
                    <div className="w-[300px]">
                        <Select
                            value={form.bulan}
                            onValueChange={(value) => setForm({ ...form, bulan: value })}
                        >
                            <SelectTrigger className="w-full bg-white border-gray-200">
                                <SelectValue placeholder="Pilih bulan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">Januari</SelectItem>
                                <SelectItem value="2">Februari</SelectItem>
                                <SelectItem value="3">Maret</SelectItem>
                                <SelectItem value="4">April</SelectItem>
                                <SelectItem value="5">Mei</SelectItem>
                                <SelectItem value="6">Juni</SelectItem>
                                <SelectItem value="7">Juli</SelectItem>
                                <SelectItem value="8">Agustus</SelectItem>
                                <SelectItem value="9">September</SelectItem>
                                <SelectItem value="10">Oktober</SelectItem>
                                <SelectItem value="11">November</SelectItem>
                                <SelectItem value="12">Desember</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex items-center">
                    <label className="w-48 text-sm font-medium text-gray-900">
                        Tahun
                    </label>
                    <div className="w-[300px]">
                        <Select
                            value={form.tahun}
                            onValueChange={(value) => setForm({ ...form, tahun: value })}
                        >
                            <SelectTrigger className="w-full bg-white border-gray-200">
                                <SelectValue placeholder="Pilih tahun" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="2024">2024</SelectItem>
                                <SelectItem value="2025">2025</SelectItem>
                                <SelectItem value="2026">2026</SelectItem>
                                <SelectItem value="2027">2027</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <div className="flex justify-center items-center gap-4 pt-4">
                <button
                    onClick={() => setForm({ jenis: "", bulan: "", tahun: "" })}
                    className="px-6 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                    Batal
                </button>

                <button
                    onClick={handleSubmit}
                    className="bg-[#132c4a] hover:bg-[#1e3256] text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                    <FileText className="w-4 h-4" />
                    Detail
                </button>
            </div>
        </div>
    )
}