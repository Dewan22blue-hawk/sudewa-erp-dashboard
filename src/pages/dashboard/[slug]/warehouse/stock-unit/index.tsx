import { useState, useMemo, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import StockUnitTable from '@/components/features/stock-unit/StockUnitTable';
import StockUnitFilterTabs from '@/components/features/stock-unit/StockUnitFilterTabs';
import { useStockUnits } from '@/hooks/useStockUnit';
import { useCompany } from '@/contexts/CompanyContext';
import { Card } from '@/components/ui/card';
import type { StockStatus } from '@/@types/stock-unit.types';

export default function StockUnitPage() {
  const { companyId } = useCompany();

  const [search, setSearch] = useState('');
  // State for the hook's parameters
  const [hookPage, setHookPage] = useState(1);
  const [hookPerPage, setHookPerPage] = useState(25);
  const [stockState, setStockState] = useState<StockStatus | undefined>(undefined);
  const [machineNumber] = useState<string | undefined>(undefined);
  const [chassisNumber] = useState<string | undefined>(undefined);
  const [color] = useState<string | undefined>(undefined);

  const params = useMemo(() => ({
    page: hookPage,
    perPage: hookPerPage,
    search,
    stock_state: stockState,
    machine_number: machineNumber,
    chassis_number: chassisNumber,
    color: color,
  }), [hookPage, hookPerPage, search, stockState, machineNumber, chassisNumber, color]);

  const { data, isLoading, isError } = useStockUnits(companyId, params);

  // State for the table's pagination display, derived from hook data
  const [tablePage, setTablePage] = useState(1);
  const [tablePerPage, setTablePerPage] = useState(25);
  const [tableTotalData, setTableTotalData] = useState(0);

  useEffect(() => {
    if (data) {
      setTablePage(data.meta?.currentPage || 1);
      setTablePerPage(data.meta?.perPage || 25);
      setTableTotalData(data.meta?.total || 0);
    }
  }, [data]);

  const PanelName = function () {
    return (
      <div className="flex items-center justify-between" >
        <div>
          <h1 className="text-2xl font-semibold">Data Unit Stok</h1>
          <p className="text-sm text-muted-foreground">Kelola dan lacak semua unit stok</p>
        </div>
      </div >
    )
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <PanelName />
          <Card className="rounded-xl p-6">
            <div className="text-center text-muted-foreground">Memuat data...</div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <PanelName />
          <Card className="rounded-xl p-6">
            <div className="text-center text-destructive">Gagal memuat data</div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PanelName />

        <StockUnitTable
          data={data?.data || []}
          isLoading={isLoading}
          page={tablePage} // Pass tablePage state
          perPage={tablePerPage} // Pass tablePerPage state
          totalData={tableTotalData} // Pass tableTotalData state
          statusTabs={(
            <StockUnitFilterTabs
              active={(stockState as StockStatus) ?? 'all'}
              onChange={(value) => {
                const nextStatus = value === 'all' ? undefined : value;
                setStockState(nextStatus);
                setHookPage(1);
                setTablePage(1);
              }}
            />
          )}
          onPageChange={(p) => {
            setHookPage(p); // Update hook's page state
            setTablePage(p); // Update table's page state
          }}
          onPerPageChange={(pp) => {
            setHookPerPage(pp); // Update hook's perPage state
            setTablePerPage(pp); // Update table's perPage state
            setHookPage(1); // Reset hook page when perPage changes
            setTablePage(1); // Reset table's page state
          }}
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setHookPage(1); // Reset hook page when search changes
            setTablePage(1); // Reset table's page state
          }}
        />
      </div>
    </DashboardLayout>
  );
}