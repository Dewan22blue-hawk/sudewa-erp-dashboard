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

      <div className="space-y-6 p-6">
        <div className="space-y-1.5">
          <h1 className="text-[28px] font-bold tracking-tight text-slate-950 font-sans">{title}</h1>
          <p className="text-sm font-normal text-slate-500 font-sans">{description}</p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center py-1">
          <div className="relative w-full max-w-[280px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search here"
              className="pl-9 h-[38px] bg-white border border-slate-200 rounded-lg shadow-sm focus-visible:ring-1 focus-visible:ring-slate-400 focus-visible:border-slate-400 font-sans"
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-700 font-sans">
            <span>Show</span>
            <Select value={String(perPage)} onValueChange={(value) => setPerPage(Number(value))}>
              <SelectTrigger className="w-[70px] h-[38px] bg-white border border-slate-200 rounded-lg shadow-sm focus:ring-1 focus:ring-slate-400 font-semibold text-slate-700">
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
            <span>Page</span>
          </div>

          {search ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateQuery({ search: undefined, page: 1 })}
              className="h-[38px] text-xs font-semibold px-3 text-slate-600 font-sans"
            >
              Reset
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
