import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreditCard, TrendingUp, TrendingDown } from "lucide-react"
import { DatePicker } from "@/components/ui/date-picker"
import { formatCurrency } from "@/lib/utils"

export default function KasHarianSummary() {
    const [date, setDate] = useState<Date | undefined>(new Date())
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Informasi Akun */}
            <Card className="rounded-xl border shadow-sm">
                <CardContent className="p-6 space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                            <CreditCard size={24} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Informasi Akun</h3>
                            <p className="text-sm text-gray-500">Detail Informasi akun</p>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Nama KAS</label>
                        <Select defaultValue="BCA USD">
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih Akun" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="BCA USD">BCA USD</SelectItem>
                                <SelectItem value="BCA IDR">BCA IDR</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Periode Transaksi</label>
                        <DatePicker
                            value={date}
                            onChange={setDate}
                            placeholder="Pilih Tanggal"
                        />
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Saldo Awal</p>
                        <p className="text-lg font-bold">Rp 0</p>
                    </div>
                </CardContent>
            </Card>

            {/* Total Debit */}
            <Card className="rounded-xl border shadow-sm">
                <CardContent className="p-6 flex flex-col justify-between h-full">
                    <div className="flex items-start gap-4">
                        <div className="bg-green-100 p-3 rounded-lg text-green-600">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Total Debit</h3>
                            <p className="text-sm text-gray-500">Uang Masuk</p>
                        </div>
                    </div>

                    <div className="mt-4">
                        <h2 className="text-3xl font-bold text-green-500">Rp 99.000.000</h2>
                        <p className="text-sm text-gray-500 mt-1">Total Uang Masuk Januari 2026</p>
                    </div>

                    <div className="flex justify-between items-center mt-6 pt-6 border-t">
                        <span className="text-sm text-gray-500">Transaksi</span>
                        <span className="font-medium">10</span>
                    </div>
                </CardContent>
            </Card>

            {/* Total Kredit */}
            <Card className="rounded-xl border shadow-sm">
                <CardContent className="p-6 flex flex-col justify-between h-full">
                    <div className="flex items-start gap-4">
                        <div className="bg-red-100 p-3 rounded-lg text-red-600">
                            <TrendingDown size={24} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Total Kredit</h3>
                            <p className="text-sm text-gray-500">Uang Keluar</p>
                        </div>
                    </div>

                    <div className="mt-4">
                        <h2 className="text-3xl font-bold text-red-500">Rp 99.000.000</h2>
                        <p className="text-sm text-gray-500 mt-1">Total Uang Keluar Januari 2026</p>
                    </div>

                    <div className="flex justify-between items-center mt-6 pt-6 border-t">
                        <span className="text-sm text-gray-500">Transaksi</span>
                        <span className="font-medium">10</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
