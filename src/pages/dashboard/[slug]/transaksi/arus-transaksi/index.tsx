'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useTransactions, useTransactionSummary } from '@/hooks/useTransaction';
import { useCompany } from '@/contexts/CompanyContext';
import { TransactionTable } from '@/components/features/transaction/TransactionTable';
import { TransactionSummaryCards } from '@/components/features/transaction/TransactionSummaryCards';
import { DeleteTransactionDialog } from '@/components/features/transaction/DeleteTransactionDialog';
import { Plus, Search } from 'lucide-react';
import { Transaction } from '@/@types/transaction.types';

// This page implements the List view
export default function TransactionListPage() {
  const LIVE_REFRESH_SECONDS = 10;
  const router = useRouter();
  const { slug } = router.query;
  const { companyId } = useCompany();
  const safeCompanyId = companyId || '1'; // Fallback to "1" for PT Wajira Morindo
  const basePath = slug ? `/dashboard/${slug}/transaksi/arus-transaksi` : '/transaksi/arus-transaksi';

  // Local State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [localSearch, setLocalSearch] = useState('');

  // Query Hooks
  const { data, isLoading: isListLoading, isFetching: isListFetching, dataUpdatedAt } = useTransactions(safeCompanyId, page, limit, localSearch);
  const { data: summary, isLoading: isSummaryLoading, isFetching: isSummaryFetching } = useTransactionSummary(safeCompanyId);

  // Dialog State
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedTrx, setSelectedTrx] = useState<Transaction | null>(null);

  const lastUpdatedLabel = useMemo(() => {
    if (!dataUpdatedAt) return 'Menunggu sinkronisasi data terbaru...';

    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'medium',
    }).format(new Date(dataUpdatedAt));
  }, [dataUpdatedAt]);

  // Handlers
  const handleEdit = (trx: Transaction) => {
    router.push(`${basePath}/${trx.id}/edit`);
  };

  const handleDelete = (trx: Transaction) => {
    setSelectedTrx(trx);
    setOpenDelete(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADLINE */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-950">Arus Transaksi Operasional</h1>
            <p className="text-sm text-muted-foreground">Kelola arus transaksi operasional perusahaan</p>
          </div>
          <div className="text-xs text-slate-500 text-left sm:text-right self-start sm:self-center">
            Data diperbarui otomatis setiap {LIVE_REFRESH_SECONDS} detik •{' '}
            <span className={isListFetching || isSummaryFetching ? 'text-emerald-600 font-medium' : 'font-medium'}>
              {isListFetching || isSummaryFetching ? 'Menyinkronkan data...' : `Update terakhir ${lastUpdatedLabel}`}
            </span>
          </div>
        </div>

        <TransactionSummaryCards
          totalBcaUsd={summary?.totalBcaUsd || 0}
          totalBcaIdr={summary?.totalBcaIdr || 0}
          totalCashIdr={summary?.totalCashIdr || 0}
          isLoading={isSummaryLoading}
        />

        {/* FILTERS & ACTIONS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search here..." className="pl-9 bg-white" value={localSearch} onChange={(e) => setLocalSearch(e.target.value)} />
            </div>
            <div className="flex items-center gap-2 text-sm whitespace-nowrap">
              <span>Show</span>
              <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v))}>
                <SelectTrigger className="h-9 w-[70px] bg-white">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span>Page</span>
            </div>
          </div>

          <Button className="w-full sm:w-auto bg-[#1e3a5f] hover:bg-[#152e4d]" onClick={() => router.push(`${basePath}/create`)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah
          </Button>
        </div>

        {/* TABLE */}
        {isListLoading ? (
          <div className="h-64 flex items-center justify-center border rounded-xl bg-white">
            <span className="animate-pulse text-muted-foreground">Loading transactions...</span>
          </div>
        ) : (
          <TransactionTable data={data?.data || []} onEdit={handleEdit} onDelete={handleDelete} />
        )}

        {/* PAGINATION INFO */}
        {!isListLoading && data && (
          <div className="flex flex-col gap-4 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between px-1">
            <div>
              Showing {(page - 1) * limit + 1}-{Math.min(page * limit, data.total)} of {data.total} data
            </div>
            {data.total > limit && (
              <div className="flex flex-wrap items-center justify-end gap-1 text-slate-800">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 min-w-9 rounded-xl border px-3 text-sm font-medium border-slate-200 bg-white text-slate-950 shadow-sm"
                >
                  {page}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300"
                  onClick={() => setPage(page + 1)}
                  disabled={page * limit >= data.total}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}

        {/* DELETE DIALOG */}
        <DeleteTransactionDialog open={openDelete} onOpenChange={setOpenDelete} transaction={selectedTrx} companyId={safeCompanyId} />
      </div>
    </DashboardLayout>
  );
}
