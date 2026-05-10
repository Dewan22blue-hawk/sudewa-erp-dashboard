import * as React from 'react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useCompany } from '@/contexts/CompanyContext';
import { useDealers } from '@/hooks/useDealer';
import { useKas } from '@/hooks/useKas';
import {
  useBBNBillList,
  useCreateBBNBill,
  useCreateBBNBillBilling,
  useCreateBBNBillBillingItem,
  useDeleteBBNBill,
} from '@/hooks/useBBNBill';
import { BBNBillFormDialog, BBNBillPaymentDialog, DeleteBBNBillDialog } from '@/components/features/tagihan-bbn/BBNBillDialogs';
import { BBNBillTable } from '@/components/features/tagihan-bbn/BBNBillTable';
import type { BBNBill } from '@/@types/bbn-bill.types';
import { getCashLabel } from '@/components/features/tagihan-bbn/utils';

export default function BBNBillListPage() {
  const router = useRouter();
  const slug = typeof router.query.slug === 'string' ? router.query.slug : '';
  const { companyId } = useCompany();
  const safeCompanyId = companyId || '1';

  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(25);
  const [dealerSearch, setDealerSearch] = React.useState('');
  const [createOpen, setCreateOpen] = React.useState(false);
  const [paymentOpen, setPaymentOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [selectedBill, setSelectedBill] = React.useState<BBNBill | null>(null);

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  const listQuery = useBBNBillList({ page, perPage, search });
  const dealersQuery = useDealers(safeCompanyId, { page: 1, perPage: 100, search: dealerSearch, sort_order: 'asc' });
  const kasQuery = useKas(safeCompanyId);
  const createMutation = useCreateBBNBill();
  const deleteMutation = useDeleteBBNBill();
  const createBillingMutation = useCreateBBNBillBilling();
  const createBillingItemMutation = useCreateBBNBillBillingItem();

  const dealerOptions = React.useMemo(
    () =>
      (dealersQuery.data?.data ?? []).map((dealer) => ({
        value: String(dealer.id),
        label: dealer.namaDealer || dealer.code || `Dealer ID ${dealer.id}`,
        subtitle: dealer.code || undefined,
      })),
    [dealersQuery.data?.data],
  );

  const cashOptions = React.useMemo(() => {
    const cashes = kasQuery.data?.data ?? [];
    const unique = new Map<string, { id: number; label: string }>();
    cashes.forEach((cash) => {
      const label = getCashLabel(cash);
      if (!unique.has(label)) {
        unique.set(label, { id: Number(cash.id), label });
      }
    });

    const order = ['BCA USD', 'BCA IDR', 'CASH IDR'];
    return Array.from(unique.values()).sort((a, b) => order.indexOf(a.label) - order.indexOf(b.label));
  }, [kasQuery.data?.data]);

  const handleCreate = async (payload: { dealerId: number | string; billDate: string; paidDate?: string }) => {
    try {
      await createMutation.mutateAsync(payload);
      toast.success('Tagihan BBN berhasil ditambahkan');
      setCreateOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Gagal menambahkan tagihan BBN');
    }
  };

  const handleQuickPayment = async (payload: { paidDate: string; cashId: number; amount: number }) => {
    if (!selectedBill) return;

    try {
      const billing = await createBillingMutation.mutateAsync({ bbnBillId: selectedBill.id });
      await createBillingItemMutation.mutateAsync({
        bbnBillBillingId: billing.id,
        paidDate: payload.paidDate,
        cashId: payload.cashId,
        amount: payload.amount,
      });
      toast.success('Pembayaran tagihan BBN berhasil ditambahkan');
      setPaymentOpen(false);
      setSelectedBill(null);
      router.push(`/dashboard/${slug}/tagihan-bbn/${selectedBill.id}`);
    } catch (error: any) {
      if (String(error.message || '').toLowerCase().includes('already') || String(error.message || '').toLowerCase().includes('exists')) {
        try {
          router.push(`/dashboard/${slug}/tagihan-bbn/${selectedBill.id}/pembayaran`);
          setPaymentOpen(false);
          return;
        } catch {
          // noop
        }
      }
      toast.error(error.message || 'Gagal menambahkan pembayaran');
    }
  };

  const handleDelete = async () => {
    if (!selectedBill) return;

    try {
      await deleteMutation.mutateAsync(selectedBill.id);
      toast.success('Tagihan BBN berhasil dihapus');
      setDeleteOpen(false);
      setSelectedBill(null);
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus tagihan BBN');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-[38px] font-semibold tracking-[-0.03em] text-slate-950">Data Tagihan BBN</h1>
          <p className="mt-1 text-base text-slate-500">Kelola data bbn dengan mudah</p>
        </div>

        <BBNBillTable
          items={listQuery.data?.data ?? []}
          search={searchInput}
          isLoading={listQuery.isLoading}
          page={page}
          perPage={perPage}
          totalData={listQuery.data?.meta.total ?? 0}
          onSearchChange={setSearchInput}
          onPageChange={setPage}
          onPerPageChange={(value) => {
            setPerPage(value);
            setPage(1);
          }}
          onAdd={() => setCreateOpen(true)}
          onDetail={(item) => router.push(`/dashboard/${slug}/tagihan-bbn/${item.id}`)}
          onEdit={(item) => router.push(`/dashboard/${slug}/tagihan-bbn/${item.id}/edit`)}
          onPay={(item) => {
            setSelectedBill(item);
            setPaymentOpen(true);
          }}
          onPrint={(item) => window.open(`/dashboard/${slug}/tagihan-bbn/${item.id}?print=1`, '_blank', 'noopener,noreferrer')}
          onDelete={(item) => {
            setSelectedBill(item);
            setDeleteOpen(true);
          }}
        />
      </div>

      <BBNBillFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
        isSubmitting={createMutation.isPending}
        dealerOptions={dealerOptions}
        onDealerSearchChange={setDealerSearch}
      />

      <BBNBillPaymentDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        onSubmit={handleQuickPayment}
        isSubmitting={createBillingMutation.isPending || createBillingItemMutation.isPending}
        bill={selectedBill}
        cashOptions={cashOptions}
      />

      <DeleteBBNBillDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        isDeleting={deleteMutation.isPending}
        bill={selectedBill}
      />
    </DashboardLayout>
  );
}
