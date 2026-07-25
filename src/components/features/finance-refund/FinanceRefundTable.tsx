import { useMemo, useState } from 'react';
import type { FinanceRefundRecord, RefundTransactionType } from '@/@types/finance-refund.types';
import type { PaginationMeta } from '@/@types/pagination.types';
import FinanceRefundApprovalModal from '@/components/features/finance-refund/FinanceRefundApprovalModal';
import { RefundStatusBadge } from '@/components/features/refund/RefundStatusBadge';
import { Button } from '@/components/ui/button';
import { CopyBox } from '@/components/ui/copy-box';
import { ReferenceLink } from '@/components/ui/reference-link';
import { useRouter } from 'next/router';
import { currenciesFormat } from '@/components/ui/currenciesFormat';
import { TextTruncate } from '@/components/ui/text-truncate';
import BaseTable, { ColumnDef } from '@/components/ui/base-table';

interface FinanceRefundTableProps {
  data: FinanceRefundRecord[];
  meta?: PaginationMeta & { from?: number; to?: number };
  page: number;
  isLoading?: boolean;
  transactionType: RefundTransactionType;
  onPageChange: (page: number) => void;
}

const formatDate = (value: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('id-ID');
};

export default function FinanceRefundTable({ data, meta, page, isLoading = false, transactionType, onPageChange }: FinanceRefundTableProps) {
  const [selectedRefund, setSelectedRefund] = useState<FinanceRefundRecord | null>(null);
  const router = useRouter();
  const { slug } = router.query;
  const slugStr = typeof slug === 'string' ? slug : '';

  const columns = useMemo<ColumnDef<FinanceRefundRecord>[]>(
    () => [
      {
        header: 'KODE REFUND',
        accessorKey: 'refundCode',
        sortable: true,
        alignment: 'left',
        cell: (item) => <CopyBox text={item.refundCode} />,
      },
      {
        header: transactionType === 'sales' ? 'NO PENJUALAN' : 'NO PEMBELIAN',
        accessorKey: 'transactionCode',
        sortable: true,
        alignment: 'left',
        cell: (item) => (
          <ReferenceLink href={`/dashboard/${slugStr}/transaksi/${transactionType === 'sales' ? 'penjualan-unit' : 'pembelian-unit'}/${item.transactionId}`}>
            {item.transactionCode}
          </ReferenceLink>
        )
      },
      {
        header: transactionType === 'sales' ? 'NAMA CUSTOMER' : 'NAMA SUPPLIER',
        accessorKey: 'partnerName',
        sortable: true,
        alignment: 'left',
        cell: (item) => <ReferenceLink href={`/dashboard/${slugStr}/master/${transactionType === 'sales' ? 'customer' : 'supplier'}?search=${item.partnerName}`}>{item.partnerName}</ReferenceLink>,
      },
      {
        header: 'TANGGAL',
        accessorKey: 'refundDate',
        sortable: true,
        alignment: 'center',
        cell: (item) => <span className="text-slate-800 font-normal">{formatDate(item.refundDate)}</span>,
      },
      {
        header: transactionType === 'sales' ? 'TOTAL PENJUALAN' : 'TOTAL PEMBELIAN',
        accessorKey: 'totalTransaction',
        sortable: true,
        alignment: 'center',
        cell: (item) => (
          <span className="text-slate-800 font-normal">
            {currenciesFormat('idr', item.totalTransaction ?? 0)}
          </span>
        ),
      },
      {
        header: 'TOTAL REFUND',
        accessorKey: 'refundAmount',
        sortable: true,
        alignment: 'center',
        cell: (item) => <span className="text-slate-800 font-normal">{currenciesFormat('idr', item.refundAmount)}</span>,
      },
      {
        header: transactionType === 'sales' ? 'KAS KELUAR' : 'KAS MASUK',
        accessorKey: 'cashName',
        sortable: true,
        alignment: 'left',
        cell: (item) => item.cashName ? (
          <ReferenceLink href={`/dashboard/${slugStr}/master/kas?search=${item.cashName}`}>
            {item.cashName}
          </ReferenceLink >
        ) : <span>-</span>
      },
      {
        header: 'KETERANGAN',
        accessorKey: 'note',
        sortable: true,
        alignment: 'left',
        cell: (item) => <TextTruncate maxLength={20} text={item.note || '-'} />,
      },
      {
        header: 'STATUS',
        accessorKey: 'status',
        sortable: true,
        alignment: 'center',
        cell: (item) => <RefundStatusBadge status={item.status} />,
      },
      {
        header: 'aksi',
        alignment: 'center',
        sticky: 'right',
        cell: (item) => (
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs font-semibold px-3 font-sans border-slate-200 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 shadow-none transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedRefund(item);
            }}
          >
            {item.status === 'approve' ? 'Sudah disetujui' : 'Setujui'}
          </Button>
        ),
      }
    ],
    [transactionType, slugStr],
  );

  return (
    <>
      <BaseTable
        data={data}
        columns={columns}
        loading={isLoading}
        defaultSort={{ key: 'refundDate', direction: 'desc' }}
        onRowClick={(item) => setSelectedRefund(item)}
        meta={meta ? {
          currentPage: page,
          perPage: meta.perPage || 10,
          lastPage: meta.lastPage || 1,
          total: meta.total || data.length,
        } : undefined}
        onPageChange={onPageChange}
      />

      {selectedRefund ? (
        <FinanceRefundApprovalModal
          open={Boolean(selectedRefund)}
          onClose={() => setSelectedRefund(null)}
          refund={selectedRefund}
          transactionType={transactionType}
        />
      ) : null}
    </>
  );
}
