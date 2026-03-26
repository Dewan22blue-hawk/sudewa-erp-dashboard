import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { IncomeDonutChart } from '@/components/features/dashboard/charts/IncomeDonutChart';
import { FinanceOverview } from '@/components/features/dashboard/FinanceOverview';
import { FinanceChart } from '@/components/features/dashboard/FinanceChart';
import { CustomerOverviewCard, ProductOverviewCard } from '@/components/features/dashboard/CustomerProductOverview';
import { CashflowSummary } from '@/components/features/dashboard/CashflowSummary';
import { TransactionTable } from '@/components/features/dashboard/TransactionTable';
import { useDashboardData } from '@/hooks/useDashboardData';

export default function DashboardPage() {
  const { data, isLoading } = useDashboardData();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <PageHeader title="Overview Keuangan" />

        <FinanceOverview accounts={data?.accounts || []} isLoading={isLoading} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-3">
            <FinanceChart data={data?.financeSeries || []} isLoading={isLoading} />
          </div>
          {/* <div className="lg:col-span-2">
            <FinanceChart data={data?.financeSeries || []} isLoading={isLoading} />
          </div>
          <IncomeDonutChart /> */}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <CustomerOverviewCard data={data?.customers} isLoading={isLoading} />
          <ProductOverviewCard data={data?.products} isLoading={isLoading} />
        </div>

        {/* <CashflowSummary data={data?.cashflow} isLoading={isLoading} /> */}

        <TransactionTable data={data?.transactions || []} isLoading={isLoading} />
      </div>
    </DashboardLayout>
  );
}
