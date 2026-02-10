import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CreditCard } from "lucide-react"
import { InvoiceStatus } from "./invoice.types"

/**
 * Format Rupiah dengan titik separator
 */
function formatRupiah(value: number): string {
    return 'Rp ' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/**
 * Invoice Status Card - EXACT sesuai Figma
 * Border: 1px #E5E5E5, Radius: 12px, Padding: 24px
 * Progress bar untuk percentage paid
 */
export function InvoiceStatusCard({ data }: { data: InvoiceStatus }) {
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
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
                        <CreditCard className="h-4 w-4 text-red-600" />
                    </div>
                    <span className="font-medium">Status Pembayaran</span>
                </div>

                {/* Total Harga */}
                <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Total Harga</span>
                    <span className="text-sm font-medium">{formatRupiah(data.totalHarga)}</span>
                </div>

                {/* Total Bayar */}
                <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Total Bayar</span>
                    <span className="text-sm font-medium">{formatRupiah(data.totalBayar)}</span>
                </div>

                {/* Kurang Bayar - RED & Bold */}
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Kurang Bayar</span>
                    <span className="text-base font-bold text-red-600">
                        {formatRupiah(data.kurangBayar)}
                    </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <Progress value={data.percentagePaid} className="h-2" />
                    <p className="text-xs text-muted-foreground text-right">
                        {data.percentagePaid}% Terbayar
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
