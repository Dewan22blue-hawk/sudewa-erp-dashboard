import { Card, CardContent } from "@/components/ui/card"
import { FileText, DollarSign, Receipt } from "lucide-react"
import { SalesItem } from "../sales.data"

interface Props {
    data: SalesItem
}

function formatMoney(amount: number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount).replace("Rp", "Rp ")
}

export function SalesDetailCards({ data }: Props) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            {/* Card 1: Informasi Penjualan */}
            <Card className="rounded-xl border border-input shadow-sm">
                <CardContent className="p-6 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                            <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <span className="font-medium text-base">Informasi Penjualan</span>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Nomor Pembelian</p>
                            <p className="font-medium text-sm">{data.kodeJual}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Tipe Unit</p>
                            <p className="font-medium text-sm">{data.tipeUnit}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Card 2: Detail Penjualan */}
            <Card className="rounded-xl border border-input shadow-sm">
                <CardContent className="p-6 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                            <DollarSign className="h-5 w-5 text-green-600" />
                        </div>
                        <span className="font-medium text-base">Detail Penjualan</span>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Harga Unit</span>
                            <span className="font-medium">{formatMoney(data.hargaSatuan)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Quantity</span>
                            <span className="font-medium">{data.qty} PCS</span>
                        </div>
                        <div className="pt-4 border-t flex justify-between items-center">
                            <span className="font-medium text-sm">Total Pembelian</span>
                            <span className="font-bold text-base">{formatMoney(data.totalDpp)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Card 3: Biaya Lainnya */}
            <Card className="rounded-xl border border-input shadow-sm">
                <CardContent className="p-6 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
                            <Receipt className="h-5 w-5 text-orange-600" />
                        </div>
                        <span className="font-medium text-base">Biaya Lainnya</span>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-muted-foreground">Biaya BBN</span>
                            <span className="font-medium">{formatMoney(data.biayaBbn)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-muted-foreground">Ekspedisi</span>
                            <span className="font-medium">{formatMoney(data.biayaEkspedisi)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-muted-foreground">HPP</span>
                            <span className="font-medium">{formatMoney(data.totalHpp)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-muted-foreground">DPP</span>
                            <span className="font-medium">{formatMoney(data.totalDpp)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-muted-foreground">PPN</span>
                            <span className="font-medium">{formatMoney(data.totalPpn)}</span>
                        </div>

                        <div className="pt-3 border-t flex justify-between items-center mt-2">
                            <span className="font-medium text-sm">Total</span>
                            <span className="font-bold text-base">{formatMoney(data.totalJual)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
