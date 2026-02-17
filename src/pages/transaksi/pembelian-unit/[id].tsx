"use client"

import { useRouter } from "next/router"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { PageHeader } from "@/components/common/PageHeader"
import { Button } from "@/components/ui/button"
import { PurchaseDetailCards } from "@/components/features/purchase/PurchaseDetailCards"
import PurchaseUnitTable from "@/components/features/purchase/PurchaseUnitTable"
import { usePurchaseById } from "@/hooks/usePurchase"
import { ArrowLeft, Plus, CreditCard, Loader2 } from "lucide-react"

export default function PurchaseDetailPage() {
    const router = useRouter()
    const { id } = router.query
    const { data: purchase, isLoading } = usePurchaseById(id as string)

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex h-[50vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </DashboardLayout>
        )
    }

    if (!purchase) {
        return (
            <DashboardLayout>
                <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
                    <p className="text-muted-foreground">Pembelian tidak ditemukan</p>
                    <Button onClick={() => router.push("/transaksi/pembelian-unit")}>
                        Kembali ke List
                    </Button>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* HEADLINE & ACTIONS */}
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="-ml-2 h-8 w-8"
                                onClick={() => router.push("/transaksi/pembelian-unit")}
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <PageHeader
                                title="Detail Pembelian Unit"
                                description="Informasi lengkap transaksi pembelian"
                            />
                        </div>
                        <div className="ml-8 mt-1 flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Kode Pembelian</span>
                            <span className="font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                                {purchase.code}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-2 ml-8 md:ml-0">
                        <Button
                            variant="outline"
                            onClick={() => router.push(`/transaksi/pembelian-unit/${purchase.id}/payment`)}
                        >
                            <CreditCard className="mr-2 h-4 w-4" />
                            Bayar
                        </Button>
                        <Button onClick={() => router.push(`/transaksi/pembelian-unit/${purchase.id}/create-unit`)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Unit
                        </Button>
                    </div>
                </div>

                {/* 3-COLUMN CARDS */}
                <PurchaseDetailCards data={purchase} />

                {/* UNIT TABLE */}
                <PurchaseUnitTable units={purchase.units} purchaseId={purchase.id} />
            </div>
        </DashboardLayout>
    )
}
