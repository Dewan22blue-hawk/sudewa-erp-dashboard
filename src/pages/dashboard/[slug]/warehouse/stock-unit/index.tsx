import { DashboardLayout } from '@/components/layout/DashboardLayout';
import StockUnitTable from '@/components/features/stock-unit/StockUnitTable';
import { useStockUnits } from '@/hooks/useStockUnit';

export default function StockUnitPage() {
  const { data = [], isLoading } = useStockUnits();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Data Stock Unit</h1>
          <p className="text-sm text-gray-500">Kelola dan lacak semua stock unit</p>
        </div>

        {isLoading ? <div>Loading...</div> : <StockUnitTable data={data} />}
      </div>
    </DashboardLayout>
  );
}
