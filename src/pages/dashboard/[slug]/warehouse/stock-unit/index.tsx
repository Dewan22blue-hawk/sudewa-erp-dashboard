import { useState, useMemo, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import StockUnitTable from '@/components/features/stock-unit/StockUnitTable';
import StockStatusFilterModal from '@/components/features/stock-unit/StockStatusFilterModal';
import { useStockUnits } from '@/hooks/useStockUnit';
import { useCompany } from '@/contexts/CompanyContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { StockStatus } from '@/@types/stock-unit.types';

const statusDisplayNames: Record<string, string> = {
  all: 'Semua Status',
  draft: 'Draf',
  cancel: 'Batal',
  rejected: 'Ditolak',
  prepare: 'Persiapan',
  inbound_purcase_order: 'Inbound Pesanan Pembelian',
  inbound_incoming_goods: 'Inbound Barang Masuk',
  inbound_receipt: 'Inbound Penerimaan',
  inbound_return: 'Inbound Retur',
  outbound_reserved: 'Outbound Dipesan',
  outbound_in_transit: 'Outbound Dalam Pengiriman',
  outbound_delivered: 'Outbound Terkirim',
  outbound_return: 'Outbound Retur',
};

export default function StockUnitPage() {
  const { companyId } = useCompany();

  const [search, setSearch] = useState('');
  // State for the hook's parameters
  const [hookPage, setHookPage] = useState(1);
  const [hookPerPage, setHookPerPage] = useState(10);
  const [stockState, setStockState] = useState<string | undefined>(undefined);
  const [machineNumber, setMachineNumber] = useState<string | undefined>(undefined);
  const [chassisNumber, setChassisNumber] = useState<string | undefined>(undefined);
  const [color, setColor] = useState<string | undefined>(undefined);

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const params = useMemo(() => ({
    page: hookPage,
    per_page: hookPerPage, // Changed 'perPage' to 'per_page'
    search,
    stock_state: stockState,
    machine_number: machineNumber,
    chassis_number: chassisNumber,
    color: color,
  }), [hookPage, hookPerPage, search, stockState, machineNumber, chassisNumber, color]);

  const { data, isLoading, isError } = useStockUnits(companyId, params);

  // State for the table's pagination display, derived from hook data
  const [tablePage, setTablePage] = useState(1);
  const [tablePerPage, setTablePerPage] = useState(10);
  const [tableTotalData, setTableTotalData] = useState(0);

  useEffect(() => {
    if (data) {
      setTablePage(data.current_page || 1);
      setTablePerPage(data.per_page || 10);
      setTableTotalData(data.total || 0);
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

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {stockState && (
              <Badge variant="secondary" className="pl-3 pr-1 py-1 rounded-full flex items-center gap-1">
                <span className="font-normal text-muted-foreground">Status:</span> {statusDisplayNames[stockState]}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-auto w-auto p-0.5 rounded-full"
                  onClick={() => {
                    setStockState(undefined);
                    setHookPage(1); // Reset hook page when filter is cleared
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>

          <Button variant="outline" onClick={() => setIsFilterModalOpen(true)}>
            <Filter className="mr-2 h-4 w-4" /> Filter Status
          </Button>
        </div>

        <StockUnitTable
          data={data?.data || []}
          isLoading={isLoading}
          page={tablePage} // Pass tablePage state
          perPage={tablePerPage} // Pass tablePerPage state
          totalData={tableTotalData} // Pass tableTotalData state
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
          onStockStateChange={(s) => {
            setStockState(s);
            setHookPage(1); // Reset hook page when status filter changes
            setTablePage(1); // Reset table's page state
          }}
          onMachineNumberChange={(mn) => {
            setMachineNumber(mn);
            setHookPage(1); // Reset hook page for other filters too
            setTablePage(1);
          }}
          onChassisNumberChange={(cn) => {
            setChassisNumber(cn);
            setHookPage(1);
            setTablePage(1);
          }}
          onColorChange={(c) => {
            setColor(c);
            setHookPage(1);
            setTablePage(1);
          }}
        />
      </div>

      <StockStatusFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        activeStatus={stockState as any}
        onSelectStatus={(status) => {
          setStockState(status);
          setHookPage(1); // Reset hook page when status filter changes
          setTablePage(1); // Reset table's page state
        }}
      />
    </DashboardLayout>
  );
}