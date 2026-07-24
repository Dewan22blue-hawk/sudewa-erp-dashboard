'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/common/PageHeader';
import BaseTable, { ColumnDef } from '@/components/ui/base-table';
import { useRefundList } from '@/hooks/useRefundAdministrasi';
import { UnitTransactionRefund } from '@/@types/refund.type';
import { RefundStatusBadge } from '@/components/features/refund/RefundStatusBadge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronRight, Eye, MoreVertical, Pencil, Plus } from 'lucide-react';
import { ReferenceLink } from '@/components/ui/reference-link';
import { currenciesFormat } from '@/components/ui/currenciesFormat';
import { CopyBox } from '@/components/ui/copy-box';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { usePurchaseById, usePurchaseUnitItemDetails } from '@/hooks/usePurchase';
import { usePermissionGuard } from '@/hooks/usePermissionGuard';

const formatDate = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('id-ID');
};

export default function TransaksiRefundBeliPage() {
  const router = useRouter();
  const slug = typeof router.query.slug === 'string' ? router.query.slug : '';
  const unitTransactionId = typeof router.query.unit_transaction_id === 'string' ? router.query.unit_transaction_id : undefined;

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [search, setSearch] = useState('');

  const { hasPermission } = usePermissionGuard();
  const canCreate = hasPermission('transaction:create');
  const canEdit = hasPermission('transaction:edit');

  const refundQuery = useRefundList({
    page,
    perPage,
    search: search || undefined,
    unit_transaction_id: unitTransactionId,
  });

  const { data: purchase } = usePurchaseById(unitTransactionId || '');
  const { data: purcahseItemDetails } = usePurchaseUnitItemDetails(purchase?.id || '');

  const handleDetail = useCallback((trxId: string, rfdId: string) => {
    router.push(`/dashboard/${slug}/transaksi/pembelian-unit/${trxId}/refund/${rfdId}`);
  }, [router, slug]);

  const handleEdit = useCallback((trxId: string, rfdId: string) => {
    router.push(`/dashboard/${slug}/transaksi/refund-beli/${rfdId}/edit?unit_transaction_id=${trxId}`);
  }, [router, slug]);

  const columns = useMemo<ColumnDef<UnitTransactionRefund>[]>(
    () => [
      {
        header: 'TANGGAL REFUND',
        accessorKey: 'refund_date',
        sortable: true,
        alignment: 'left',
        cell: (item) => formatDate(item.refund_date),
      },
      {
        header: 'KODE REFUND',
        accessorKey: 'code',
        sortable: true,
        alignment: 'left',
        cell: (item) => <CopyBox text={item.code} />,
      },
      {
        header: 'NOMINAL REFUND',
        accessorKey: 'refund_amount',
        sortable: true,
        alignment: 'left',
        cell: (item) => currenciesFormat('idr', item.refund_amount),
      },
      {
        header: 'TOTAL DIBAYAR',
        alignment: 'left',
        cell: (item) => {
          const totalPaid = item.total_paid ?? (item.payments ?? []).reduce((acc, p) => acc + Number(p.amount), 0);
          return currenciesFormat('idr', totalPaid);
        },
      },
      {
        header: 'SISA BAYAR',
        alignment: 'left',
        cell: (item) => {
          const totalPaid = item.total_paid ?? (item.payments ?? []).reduce((acc, p) => acc + Number(p.amount), 0);
          const remaining = item.remaining_payment ?? Math.max(0, item.refund_amount - totalPaid);
          return <span className="font-medium text-amber-700">{currenciesFormat('idr', remaining)}</span>;
        },
      },
      {
        header: 'QTY',
        accessorKey: 'total_qty',
        sortable: true,
        alignment: 'left',
        cell: (item) => item.total_qty + ' Unit',
      },
      {
        header: 'aksi',
        alignment: 'left',
        sticky: 'right',
        cell: (item) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEdit(item.unit_transaction_id || item.transaction?.id || '', item.id)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDetail(item.unit_transaction_id || item.transaction?.id || '', item.id)}>
                <Eye className="mr-2 h-4 w-4" /> Detail / Kelola Unit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [page, perPage, handleDetail, handleEdit],
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* BREADCRUMB HEADER */}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="hover:text-slate-800 cursor-pointer" onClick={() => router.push(`/dashboard/${slug}/transaksi/pembelian-unit`)}>
            Pembelian Unit
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="font-medium text-slate-800">Data Refund Pembelian</span>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={() => router.push(`/dashboard/${slug}/transaksi/pembelian-unit`)} variant="ghost" size="icon" className="h-10 w-10 rounded-md border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <ArrowLeft className="h-5 w-5 text-slate-700" />
            </Button>
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-slate-900">Data Refund Pembelian</h1>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <span>Kode Beli:</span>
                <span className="text-blue-600 font-semibold">{purchase?.code}</span>
              </div>
            </div>
          </div>
        </div>

        <BaseTable
          data={refundQuery.data?.data ?? []}
          columns={columns}
          loading={refundQuery.isLoading}
          searchPlaceholder="Cari kode refund..."
          onSearchChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          showLimitChange
          perPage={perPage}
          onPerPageChange={(limit) => {
            setPerPage(limit);
            setPage(1);
          }}
          meta={
            refundQuery.data?.meta
              ? {
                currentPage: refundQuery.data.meta.currentPage,
                perPage: refundQuery.data.meta.perPage,
                lastPage: refundQuery.data.meta.lastPage,
                total: refundQuery.data.meta.total,
              }
              : undefined
          }
          headerActions=
          {(
            <div className="flex flex-col gap-2 md:flex-row md:items-center justify-between">
              <div className="flex items-center gap-2">
                {canCreate && (
                  <Button
                    onClick={() => router.push(`/dashboard/${slug}/transaksi/refund-beli/create?unit_transaction_id=${unitTransactionId || ''}`)}
                    className="w-full sm:w-auto bg-[#1e3a5f] hover:bg-[#152e4d]"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Data Refund
                  </Button>
                )}
              </div>
            </div>
          )}
          onPageChange={setPage}
        />
      </div>
    </DashboardLayout>
  );
}
