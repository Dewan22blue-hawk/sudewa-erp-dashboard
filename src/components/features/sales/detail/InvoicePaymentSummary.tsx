import { Card, CardContent } from "@/components/ui/card"
import { DollarSign } from "lucide-react"
import { InvoicePayment } from "./invoice.types"

/**
 * Format Rupiah dengan titik separator
 */
function formatRupiah(value: number): string {
    return 'Rp ' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/**
 * Invoice Payment Summary - EXACT sesuai Figma
 * Border: 1px #E5E5E5, Radius: 12px, Padding: 24px
 * Label: 12px muted, Value: 14px medium
 */
export function InvoicePaymentSummary({ data }: { data: InvoicePayment }) {
    return (
        <Card
            className="rounded-xl"
            style={{
                border: '1px solid #E5E5E5',
                padding: '24px'
            }}
        >
            <CardContent className="space-y-4 p-0">
                {/* Header dengan Icon */}
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50">
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="font-medium">Jumlah Pembayaran</span>
                </div>

                {/* Total DPP */}
                <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Total DPP</span>
                    <span className="text-sm font-medium">{formatRupiah(data.totalDpp)}</span>
                </div>

                {/* Total PPN */}
                <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Total PPN</span>
                    <span className="text-sm font-medium">{formatRupiah(data.totalPpn)}</span>
                </div>

                {/* Total Penjualan - Bold & larger */}
                <div className="flex items-center justify-between border-t pt-4">
                    <span className="text-sm font-medium">Total Penjualan</span>
                    <span className="text-base font-bold">{formatRupiah(data.totalPenjualan)}</span>
                </div>
            </CardContent>
        </Card>
    )
}
