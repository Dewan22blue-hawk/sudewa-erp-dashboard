import { Card } from "@/components/ui/card"
import { formatCurrency, formatCurrencyUSD } from "@/lib/utils" // Assuming these exist, otherwise I'll mock
import { Wallet, Landmark, CreditCard } from "lucide-react"


interface Props {
    totalBcaUsd: number
    totalBcaIdr: number
    totalCashIdr: number
    isLoading?: boolean
}

export function TransactionSummaryCards({ totalBcaUsd, totalBcaIdr, totalCashIdr, isLoading }: Props) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="h-40 animate-pulse bg-muted rounded-xl" />
                ))}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* BCA USD */}
            <Card className="p-6 rounded-xl border bg-white space-y-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <Landmark className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-base">BCA (USD)</h3>
                        <p className="text-sm text-muted-foreground">Bank Account - USD</p>
                    </div>
                </div>
                <div className="pt-4 border-t">
                    <div className="flex justify-between items-center bg-black text-white p-3 rounded-lg">
                        <span className="text-sm font-medium">SALDO AKHIR</span>
                        <span className="text-lg font-bold">{formatCurrencyUSD(totalBcaUsd)}</span>
                    </div>
                </div>
            </Card>

            {/* BCA IDR */}
            <Card className="p-6 rounded-xl border bg-white space-y-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                        <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-base">BCA (IDR)</h3>
                        <p className="text-sm text-muted-foreground">Bank Account - IDR</p>
                    </div>
                </div>
                <div className="pt-4 border-t">
                    <div className="flex justify-between items-center bg-black text-white p-3 rounded-lg">
                        <span className="text-sm font-medium">SALDO AKHIR</span>
                        <span className="text-lg font-bold">{formatCurrency(totalBcaIdr)}</span>
                    </div>
                </div>
            </Card>

            {/* CASH IDR */}
            <Card className="p-6 rounded-xl border bg-white space-y-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <Wallet className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-base">CASH (IDR)</h3>
                        <p className="text-sm text-muted-foreground">Cash on hand (IDR)</p>
                    </div>
                </div>
                <div className="pt-4 border-t">
                    <div className="flex justify-between items-center bg-black text-white p-3 rounded-lg">
                        <span className="text-sm font-medium">SALDO AKHIR</span>
                        <span className="text-lg font-bold">{formatCurrency(totalCashIdr)}</span>
                    </div>
                </div>
            </Card>
        </div>
    )
}
