"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import DataPiutangTable from "@/components/features/data-piutang/DataPiutangTable"
import { useDataPiutang } from "@/hooks/useDataPiutang"
import { usePermissionGuard } from '@/hooks/usePermissionGuard';

export default function DataPiutangPage() {
    const { hasPermission } = usePermissionGuard();
    const canCreate = hasPermission('finance:create');
    const canEdit = hasPermission('finance:edit');
    const canDelete = hasPermission('finance:delete');
    const [search, setSearch] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [perPage, setPerPage] = useState(25)

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedSearch(search.trim())
            setCurrentPage(1)
        }, 500)

        return () => clearTimeout(timeout)
    }, [search])

    const query = useDataPiutang({
        page: currentPage,
        perPage,
        search: debouncedSearch || undefined,
    })

    const errorMessage = query.error instanceof Error ? query.error.message : query.error ? "Gagal mengambil data piutang" : null

    return (
        <DashboardLayout>
            <div className="space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between gap-4 no-print">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-950">Data Piutang</h1>
                        <p className="text-sm text-slate-500">Kelola data pembayaran piutang</p>
                    </div>

                    {query.isFetching ? (
                        <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Memuat data...
                        </span>
                    ) : null}
                </div>

                {/* Table */}
                <DataPiutangTable
                    data={query.data?.data ?? []}
                    meta={query.data?.meta ?? null}
                    loading={query.isLoading || query.isFetching}
                    error={errorMessage}
                    search={search}
                    perPage={perPage}
                    currentPage={currentPage}
                    onSearchChange={setSearch}
                    onPerPageChange={(value) => {
                        setPerPage(value)
                        setCurrentPage(1)
                    }}
                    onPageChange={setCurrentPage}
                    onRetry={() => query.refetch()}
                />
            </div>
        </DashboardLayout>
    )
}
