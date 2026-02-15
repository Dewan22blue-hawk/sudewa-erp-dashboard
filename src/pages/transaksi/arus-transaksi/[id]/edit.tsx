"use client"

import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import TransactionForm from "@/components/features/transaction/TransactionForm"
import {
    useTransactions,
    useUpdateTransaction,
} from "@/hooks/useTransaction"
import {
    getTransactionById,
} from "@/services/transaction.service"
import { Transaction } from "@/@types/transaction.types"
import { useCompany } from "@/contexts/CompanyContext"
import { ChevronRight } from "lucide-react"

import { TransactionFormValues } from "@/scheme/transaction.schema"

export default function EditTransactionPage() {
    const router = useRouter()
    const { id } = router.query
    const { companyId } = useCompany()
    const safeCompanyId = companyId || "1"

    const [transaction, setTransaction] = useState<Transaction | null>(null)
    const [isFetching, setIsFetching] = useState(true)

    const updateMutation = useUpdateTransaction(safeCompanyId)

    // Fetch Data Manually or via Query
    // Since we're in 'pages' dir, standard way is useEffect or getServerSideProps. 
    // We stick to client fetch compatible with previous patterns.
    useEffect(() => {
        if (!id) return

        const load = async () => {
            try {
                const data = await getTransactionById(id as string)
                if (!data) {
                    toast.error("Transaksi tidak ditemukan")
                    router.push("/transaksi/arus-transaksi")
                    return
                }
                setTransaction(data)
            } catch (err) {
                toast.error("Gagal mendapatkan data")
            } finally {
                setIsFetching(false)
            }
        }

        load()
    }, [id, router])

    const handleSubmit = async (values: TransactionFormValues) => {
        if (!id) return

        try {
            await updateMutation.mutateAsync({
                id: id as string,
                payload: {
                    ...values,
                    updatedAt: new Date().toISOString(),
                }
            })
            toast.success("Transaksi berhasil diperbarui")
            router.push("/transaksi/arus-transaksi")
        } catch (error) {
            toast.error("Gagal memperbarui transaksi")
        }
    }

    if (isFetching) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-[50vh]">
                    <span className="animate-pulse text-muted-foreground">Loading data...</span>
                </div>
            </DashboardLayout>
        )
    }

    if (!transaction) return null

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* BREADCRUMB HEADER */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="hover:text-foreground cursor-pointer" onClick={() => router.push("/transaksi/arus-transaksi")}>Arus Transaksi</span>
                    <ChevronRight className="h-4 w-4" />
                    <span className="font-medium text-foreground">Edit Transaksi</span>
                </div>

                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Edit Transaksi</h1>
                    <p className="text-muted-foreground">Ubah detail transaksi yang sudah ada</p>
                </div>

                <div className="rounded-xl border bg-white p-6 md:p-8">
                    <TransactionForm
                        defaultValues={{
                            ...transaction,
                            // Ensure date format needs
                        }}
                        onSubmit={handleSubmit}
                        onCancel={() => router.push("/transaksi/arus-transaksi")}
                        isBusy={updateMutation.isPending}
                    />
                </div>
            </div>
        </DashboardLayout>
    )
}
