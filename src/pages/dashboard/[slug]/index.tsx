import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Button } from '@/components/ui/button';
import { Eye, Loader2 } from 'lucide-react';

import { FinanceOverview } from '@/components/features/dashboard/FinanceOverview';
import { FinanceChart } from '@/components/features/dashboard/FinanceChart';
import { CustomerOverviewCard, ProductOverviewCard } from '@/components/features/dashboard/CustomerProductOverview';

import { TransactionTable } from '@/components/features/dashboard/TransactionTable';
import { useDashboardData } from '@/hooks/useDashboardData';

export default function DashboardPage() {
  const [dateRangeState, setDateRangeState] = useState<DateRange | undefined>(undefined);
  const [activeDateRange, setActiveDateRange] = useState<{ start: string | null; end: string | null }>({ start: null, end: null });
  const [isFiltering, setIsFiltering] = useState(false);

  const { data, isLoading, isError } = useDashboardData(activeDateRange.start, activeDateRange.end);

  const handleShowData = () => {
    setIsFiltering(true);
    const startDate = dateRangeState?.from ? format(dateRangeState.from, 'yyyy-MM-dd') : null;
    const endDate = dateRangeState?.to ? format(dateRangeState.to, 'yyyy-MM-dd') : null;
    setActiveDateRange({ start: startDate, end: endDate });
    setTimeout(() => setIsFiltering(false), 100);
  };

  const isLoadingDisplay = isLoading || isFiltering;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <PageHeader title="Overview Keuangan" />
          
          <div className="flex items-center gap-3">
            <DatePickerWithRange date={dateRangeState} onChange={setDateRangeState} />
            <Button
              variant="outline"
              className="bg-[#f8f9fa] shadow-sm text-gray-700 gap-2 shrink-0"
              onClick={handleShowData}
              disabled={isLoadingDisplay}
            >
              {isLoadingDisplay ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
              Show
            </Button>
          </div>
        </div>

        <FinanceOverview accounts={data?.accounts || []} isLoading={isLoadingDisplay} isError={isError} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-3">
            <FinanceChart data={data?.financeSeries || []} isLoading={isLoadingDisplay} />
          </div>
          {/* <div className="lg:col-span-2">
            <FinanceChart data={data?.financeSeries || []} isLoading={isLoading} />
          </div>
          <IncomeDonutChart /> */}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <CustomerOverviewCard data={data?.customers} isLoading={isLoadingDisplay} />
          <ProductOverviewCard data={data?.products} isLoading={isLoadingDisplay} />
        </div>

        {/* <CashflowSummary data={data?.cashflow} isLoading={isLoadingDisplay} /> */}

        <TransactionTable data={data?.transactions || []} isLoading={isLoadingDisplay} />
      </div>
    </DashboardLayout>
  );
}
