import { Card } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils/currency"

export default function PembayaranHutangInfoCards({
    detail,
}: any) {
    return (
        <div className="grid grid-cols-2 gap-6 mb-6">
            <Card className="p-6 rounded-xl border shadow-sm">
                <h3 className="text-base font-semibold mb-4">
                    Informasi Pembayaran Hutang
                </h3>

                <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Nomor Pembelian</span><br />{detail.kodeBeli}</p>
                    <p><span className="text-gray-500">Tanggal</span><br />{detail.tanggal}</p>
                    <p><span className="text-gray-500">Supplier</span><br />{detail.supplier}</p>
                </div>
            </Card>

            <Card className="p-6 rounded-xl border shadow-sm">
                <h3 className="text-base font-semibold mb-4">
                    Status Pembayaran
                </h3>

                <div className="text-sm space-y-2">
                    <p>Total Beli: {formatCurrency(detail.totalBeli)}</p>
                    <p>Total Bayar: {formatCurrency(detail.totalBayar)}</p>
                    <p>Total Hutang: {formatCurrency(detail.totalHutang)}</p>
                </div>

                <div className="mt-4">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="bg-black h-2 w-full"></div>
                    </div>
                    <p className="text-xs text-green-600 mt-2 text-center">
                        100% Terbayar
                    </p>
                </div>
            </Card>
        </div>
    )
}
