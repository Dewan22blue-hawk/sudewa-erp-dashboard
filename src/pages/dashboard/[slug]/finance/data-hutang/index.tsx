import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import DataHutangTable from '@/components/features/data-hutang/DataHutangTable';
import { useDataHutang } from '@/hooks/useDataHutang';

export default function DataHutangPage() {
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(25);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedSearch(search.trim());
            setCurrentPage(1);
        }, 500);

        return () => clearTimeout(timeout);
    }, [search]);

    const query = useDataHutang({
        page: currentPage,
        perPage,
        search: debouncedSearch || undefined,
    });

    const errorMessage = query.error instanceof Error ? query.error.message : query.error ? 'Gagal mengambil data hutang' : null;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Data Hutang</h1>
                        <p className="text-sm text-gray-500">Kelola data hutang</p>
                    </div>

                    {query.isFetching ? (
                        <span className="inline-flex items-center gap-2 text-sm text-gray-500">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Memuat data...
                        </span>
                    ) : null}
                </div>

                <DataHutangTable
                    data={query.data?.data ?? []}
                    meta={query.data?.meta ?? null}
                    loading={query.isLoading || query.isFetching}
                    error={errorMessage}
                    search={search}
                    perPage={perPage}
                    currentPage={currentPage}
                    onSearchChange={setSearch}
                    onPerPageChange={(value) => {
                        setPerPage(value);
                        setCurrentPage(1);
                    }}
                    onPageChange={setCurrentPage}
                    onRetry={() => query.refetch()}
                />
            </div>
        </DashboardLayout>
    )
}
