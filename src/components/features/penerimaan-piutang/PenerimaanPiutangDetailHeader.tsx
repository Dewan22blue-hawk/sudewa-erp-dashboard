import { PenerimaanPiutangDetail } from "@/@types/penerimaan-piutang.types"
import { CalendarDays, FileText, ListChecks, User, ChevronLeft } from "lucide-react"
import { useRouter } from "next/router"
import { Button } from "@/components/ui/button"

interface Props {
    data: PenerimaanPiutangDetail
}

export default function PenerimaanPiutangDetailHeader({ data }: Props) {
    const router = useRouter()
    const percentage = data.totalJual > 0 ? (data.totalTerima / data.totalJual) * 100 : 0

    return (
        <div className="space-y-6 mb-6">
            {/* Header Title with Back Button */}
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="h-10 w-10"
                    >
                        <ChevronLeft size={24} className="text-gray-600" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Data Penerimaan Piutang
                        </h1>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                            <span>No Pembelian</span>
                            <span className="text-blue-600 font-medium">{data.kodeJual}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informasi Pembayaran Hutang Card */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="font-medium text-gray-700">Informasi Pembayaran Hutang</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Nomer Pembelian</p>
                            <p className="font-medium text-gray-900">{data.kodeJual}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500 mb-1">Tanggal</p>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-400"><CalendarDays size={16} className="text-gray-400" /></span>
                                <p className="font-medium text-gray-900">{data.tanggal}</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500 mb-1">Supplier</p>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-400"><User size={16} className="text-gray-400" /></span>
                                <p className="font-medium text-gray-900">{data.customer}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Pembayaran Card */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-pink-50 rounded-lg">
                            <ListChecks className="w-5 h-5 text-pink-500" />
                        </div>
                        <h3 className="font-medium text-gray-700">Status Pembayaran</h3>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Total Beli</span>
                            <span className="font-medium text-gray-900">Rp {data.totalJual.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Total Bayar</span>
                            <span className="font-medium text-gray-900">Rp {data.totalTerima.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Total Hutang</span>
                            <span className="font-medium text-gray-900">Rp {data.totalPiutang.toLocaleString()}</span>
                        </div>

                        <div className="pt-4 mt-4 border-t border-gray-50">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-medium text-gray-900">Kurang Bayar</span>
                                <span className="font-bold text-red-500">Rp {data.totalPiutang.toLocaleString()}</span>
                            </div>

                            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gray-900 rounded-full transition-all duration-500"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>

                            <div className="text-center mt-2">
                                <span className="text-green-500 text-sm font-medium">{percentage.toFixed(0)}% Terbayar</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
