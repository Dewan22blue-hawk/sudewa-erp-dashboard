import { useRouter } from "next/router"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Printer, Pencil } from "lucide-react"
import { INVOICE_DETAIL } from "@/components/features/sales/detail/invoice.data"
import { InvoiceInfoCard } from "@/components/features/sales/detail/InvoiceInfoCard"
import { InvoicePaymentSummary } from "@/components/features/sales/detail/InvoicePaymentSummary"
import { InvoiceStatusCard } from "@/components/features/sales/detail/InvoiceStatusCard"
import { InvoiceItemTable } from "@/components/features/sales/detail/InvoiceItemTable"

/**
 * Invoice Detail Page - EXACT sesuai Figma
 * Struktur wajib: Back nav → Title/Subtitle → Action buttons → 3 Cards → Table
 */
export default function SalesDetailPage() {
    const router = useRouter()
    const { id } = router.query

    const handleEdit = () => {
        router.push(`/sales/edit/${id}`)
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header Section dengan Back Navigation */}
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        {/* Back Navigation - 14px, muted */}
                        <button
                            onClick={() => router.back()}
                            className="mb-2 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali
                        </button>

                        {/* Title - 24px, Semibold */}
                        <h1 className="text-2xl font-semibold">Detail Penjualan</h1>

                        {/* Subtitle - Invoice number */}
                        <p className="text-sm text-muted-foreground">
                            Invoice {INVOICE_DETAIL.info.invoiceNumber}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                        </Button>
                        <Button variant="outline" size="sm">
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                        </Button>
                        <Button size="sm" onClick={handleEdit}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                    </div>
                </div>

                {/* 3 Info Cards - Grid 3 kolom */}
                <div className="grid gap-4 md:grid-cols-3">
                    <InvoiceInfoCard data={INVOICE_DETAIL.info} />
                    <InvoicePaymentSummary data={INVOICE_DETAIL.payment} />
                    <InvoiceStatusCard data={INVOICE_DETAIL.status} />
                </div>

                {/* Detail Table */}
                <InvoiceItemTable items={INVOICE_DETAIL.items} />
            </div>
        </DashboardLayout>
    )
}
