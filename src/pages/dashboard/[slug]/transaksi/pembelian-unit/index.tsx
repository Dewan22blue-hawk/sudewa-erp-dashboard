'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import PurchaseTable from '@/components/features/purchase/PurchaseTable';
import DeletePurchaseDialog from '@/components/features/purchase/DeletePurchaseDialog';
import { PageHeader } from '@/components/common/PageHeader';
import { useDeletePurchase } from '@/hooks/usePurchase';
import { useUnitTransactions } from '@/hooks/useUnitTransaction';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useCompany } from '@/contexts/CompanyContext';
import { companyQueryKeys } from '@/lib/query/company-key';

export default function PurchasePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { companyId } = useCompany();
  const { slug } = router.query;
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [mainTab, setMainTab] = useState('common');
  const [subTab, setSubTab] = useState('all');

  // Reset subtab when maintab changes
  useEffect(() => {
    setSubTab('all');
    setPage(1);
  }, [mainTab]);

  const activeStatus = subTab === 'all' ? undefined : subTab;
  const { data, isLoading, isFetching } = useUnitTransactions({ page, perPage, status: activeStatus });
  const deleteMutation = useDeletePurchase();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const TABS = [
    { id: 'common', label: 'Common' },
    { id: 'inbound', label: 'Inbound' },
    { id: 'outbound', label: 'Outbound' },
  ];

  const SUBTABS = {
    common: [
      { id: 'all', label: 'All' },
      { id: 'draft', label: 'Draft' },
      { id: 'cancel', label: 'Cancel' },
      { id: 'rejected', label: 'Rejected' },
      { id: 'prepare', label: 'Prepare' },
    ],
    inbound: [
      { id: 'all', label: 'All' },
      { id: 'inbound_purcase_order', label: 'Purchase Order' },
      { id: 'inbound_incoming_goods', label: 'Incoming Goods' },
      { id: 'inbound_receipt', label: 'Receipt' },
      { id: 'inbound_return', label: 'Return' },
    ],
    outbound: [
      { id: 'all', label: 'All' },
      { id: 'outbound_reserved', label: 'Reserved' },
      { id: 'outbound_in_transit', label: 'In Transit' },
      { id: 'outbound_delivered', label: 'Delivered' },
      { id: 'outbound_return', label: 'Return' },
    ]
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      await deleteMutation.mutateAsync(selectedId);
      if (companyId) {
        await queryClient.invalidateQueries({ queryKey: companyQueryKeys.companyScope(companyId) });
      } else {
        await queryClient.invalidateQueries({ queryKey: ['unit-transactions'] });
      }
      toast.success('Data berhasil dihapus');
      setSelectedId(null);
      // Refresh list after deletion
      setPage(1);
    } catch {
      toast.error('Gagal menghapus data');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <PageHeader title="Pembelian Unit" description="Kelola dan lacak semua pembelian unit" />
          <div className="flex gap-2"></div>
        </div>

        {/* Main Tabs — baris 1 sesuai desain */}
        <div className="flex items-center gap-4 py-3 border-b border-slate-200">
          <span className="font-bold text-sm text-slate-900">Status</span>
          <div className="flex items-center gap-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setMainTab(tab.id)}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
                  mainTab === tab.id
                    ? "bg-slate-100 text-slate-900 font-semibold"
                    : "text-slate-500 hover:text-slate-900"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading && !data ? (
          <div>Loading...</div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-sm text-slate-600">
                Data pembelian unit disinkronkan otomatis dari backend saat halaman dibuka ulang, saat jendela kembali aktif, dan setiap 30 detik.
              </p>
              <span className={`text-xs font-medium ${isFetching ? 'text-amber-600' : 'text-emerald-600'}`}>
                {isFetching ? 'Menyinkronkan data terbaru...' : 'Data terbaru tersinkron'}
              </span>
            </div>

            <PurchaseTable
              data={data?.data ?? []}
              meta={data?.meta}
              onDelete={(id) => setSelectedId(id)}
              onAdd={() => router.push(`/dashboard/${slug}/transaksi/pembelian-unit/create`)}
              slug={slug as string}
              onPageChange={setPage}
              onPerPageChange={(value) => {
                setPerPage(value);
                setPage(1);
              }}
              loading={isLoading || isFetching}
              subTabs={(SUBTABS as any)[mainTab]}
              activeSubTab={subTab}
              onSubTabChange={(id) => { setSubTab(id); setPage(1); }}
            />
          </div>
        )}
        <DeletePurchaseDialog open={!!selectedId} onClose={() => setSelectedId(null)} onConfirm={handleDelete} loading={deleteMutation.isPending} />
      </div>
    </DashboardLayout>
  );
}
