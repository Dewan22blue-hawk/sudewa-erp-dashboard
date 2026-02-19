"use client"

import { useEffect } from "react"

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
    const { slug, id } = router.query
    const { data: purchase, isLoading } = usePurchaseById(id as string)

    useEffect(() => {
        if (router.query.print === 'true' && !isLoading && purchase) {
            setTimeout(() => {
                window.print()
            }, 800)
        }
    }, [router.query.print, isLoading, purchase])

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
                    <Button onClick={() => router.push(`/dashboard/${slug}/transaksi/pembelian-unit`)}>
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
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between print:hidden">
                    <div className="flex items-start gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="mt-1 h-8 w-8"
                            onClick={() => router.push(`/dashboard/${slug}/transaksi/pembelian-unit`)}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div className="space-y-1">
                            <h1 className="text-2xl font-bold tracking-tight">Data Pembelian</h1>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground">Kode Beli</span>
                                <span className="font-medium text-blue-600">
                                    {purchase.code}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 ml-12 md:ml-0">
                        <Button
                            variant="outline"
                            className="bg-white hover:bg-gray-50 text-black border-input"
                            onClick={() => router.push(`/dashboard/${slug}/transaksi/pembelian-unit/${purchase.id}/payment`)}
                        >
                            <span className="mr-2 font-semibold text-lg leading-none">$</span>
                            Bayar
                        </Button>
                        <Button
                            className="bg-gray-100 hover:bg-gray-200 text-black border-input border"
                            onClick={() => router.push(`/dashboard/${slug}/transaksi/pembelian-unit/${purchase.id}/add-unit`)}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Unit
                        </Button>
                    </div>
                </div>

                {/* Print Header - Visible only on Print */}
                <div className="hidden print:block mb-8">
                    <h1 className="text-2xl font-bold mb-2">Detail Pembelian Unit</h1>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-semibold">Kode Pembelian</p>
                            <p className="text-lg">{purchase.code}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Dicetak pada: {new Date().toLocaleDateString('id-ID')}</p>
                        </div>
                    </div>
                </div>

                {/* 3-COLUMN CARDS */}
                <PurchaseDetailCards data={purchase} />

                {/* UNIT TABLE */}
                <PurchaseUnitTable
                    units={purchase.units}
                    purchaseId={purchase.id}
                    slug={slug as string}
                />
            </div>
        </DashboardLayout>
    )
}
