"use client"

import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Construction, Code } from "lucide-react"
import { useRouter, useParams } from "next/navigation"

export default function LaporanTransaksiKasPage() {
    const router = useRouter()
    const params = useParams()
    const slug = params?.slug as string

    return (
        <DashboardLayout>
            <div className="flex flex-col items-center justify-center min-h-[75vh] text-center space-y-6">
                <div className="bg-blue-50 p-6 rounded-full">
                    <Construction className="w-16 h-16 text-[#132c4a]" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900">Coming Soon</h1>
                    <p className="text-gray-500 max-w-md mx-auto">
                        Fitur Laporan Transaksi Kas saat ini sedang dalam tahap pengembangan dan riset (On Research).
                        Nantikan pembaruan kami selanjutnya!
                    </p>

                    <div className="pt-6">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-50 border border-gray-100 text-gray-500 rounded-full text-xs hover:bg-gray-100 transition-colors cursor-default">
                            <Code className="w-3.5 h-3.5" />
                            <span>Developer by <span className="font-semibold text-[#132c4a]">Dewan22 </span> _&lt;</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => router.push(`/dashboard/${slug}`)}
                    className="mt-8 px-6 py-2.5 bg-[#132c4a] text-white text-sm font-medium rounded-lg hover:bg-[#1e3256] transition-colors shadow-sm"
                >
                    Kembali ke Dashboard
                </button>
            </div>
        </DashboardLayout>
    )
}