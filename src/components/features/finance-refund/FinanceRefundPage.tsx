import { useMemo } from 'react';
import Head from 'next/head';
import { Search } from 'lucide-react';
import type { RefundTransactionType } from '@/@types/finance-refund.types';
import FinanceRefundTable from '@/components/features/finance-refund/FinanceRefundTable';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useQueryParamsTable } from '@/hooks/useQueryParamsTable';
import { useFinanceRefundList } from '@/hooks/useFinanceRefund';

interface FinanceRefundPageProps {
  title: string;
  description: string;
  transactionType: RefundTransactionType;
}

export function FinanceRefundPage({ title, description, transactionType }: FinanceRefundPageProps) {
  const { page, perPage, search, getParam, updateQuery, setPage, setPerPage, setSearch } = useQueryParamsTable({
    defaultPage: 1,
    defaultPerPage: 10,
  });
  const status = getParam('status', 'all') as 'all' | 'waiting' | 'approve' | 'reject';
  const debouncedSearch = useDebouncedValue(search, 400);

  const refundQuery = useFinanceRefundList({
    page,
    per_page: perPage,
    search: debouncedSearch || undefined,
    status,
    transactionType,
  });

  const data = useMemo(() => refundQuery.data?.data ?? [], [refundQuery.data?.data]);

  return (
    <DashboardLayout>
      <Head>
        <title>{title} - Wajira Dashboard</title>
      </Head>

      <div className="space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari refund, transaksi, atau relasi" className="pl-10" />
            </div>

            <Select value={status} onValueChange={(value) => updateQuery({ status: value, page: 1 })}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="waiting">Menunggu</SelectItem>
                <SelectItem value="approve">Approve</SelectItem>
                <SelectItem value="reject">Reject</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Tampilkan</span>
              <Select value={String(perPage)} onValueChange={(value) => setPerPage(Number(value))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 25, 50, 100].map((option) => (
                    <SelectItem key={option} value={String(option)}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span>data</span>
            </div>
          </div>

          {(search || status !== 'all') ? (
            <Button variant="outline" onClick={() => updateQuery({ search: undefined, status: undefined, page: 1 })}>
              Reset Filter
            </Button>
          ) : null}
        </div>

        <FinanceRefundTable
          data={data}
          meta={refundQuery.data?.meta}
          page={page}
          isLoading={refundQuery.isLoading}
          transactionType={transactionType}
          onPageChange={setPage}
        />
      </div>
    </DashboardLayout>
  );
}
