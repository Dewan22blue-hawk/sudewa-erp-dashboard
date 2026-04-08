"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import DataPiutangTable from "@/components/features/data-piutang/DataPiutangTable"
import { useDataPiutang } from "@/hooks/useDataPiutang"

export default function DataPiutangPage() {
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
                <div>
                    <h1 className="text-2xl font-semibold">Data Piutang</h1>
                    <p className="text-sm text-gray-500">
                        Kelola data pembayaran piutang
                    </p>
                </div>

                {query.isFetching ? (
                    <span className="inline-flex items-center gap-2 text-sm text-gray-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Memuat data...
                    </span>
                ) : null}

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
