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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useDeleteFinanceRefund } from '@/hooks/useFinanceRefund';
import { toast } from 'sonner';

const DeleteFinanceRefundAction = ({ item, transactionType }: { item: FinanceRefundRecord, transactionType: RefundTransactionType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isChecked, setIsChecked] = useState(true);
  const deleteMutation = useDeleteFinanceRefund(transactionType);

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50 ml-1"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" align="center" className="max-w-xs bg-white text-slate-800 p-4 shadow-lg border border-slate-200" onPointerDownOutside={() => setIsOpen(false)}>
          <div className="space-y-3">
            <p className="text-sm font-medium">Konfirmasi Hapus</p>
            <p className="text-xs text-slate-500">Unit akan diperbarui stock status nya juga.</p>
            <div className="flex items-start space-x-2">
              <Checkbox
                id={`checkbox-${item.id}`}
                checked={isChecked}
                onCheckedChange={(c) => setIsChecked(c as boolean)}
                className="mt-0.5"
              />
              <label htmlFor={`checkbox-${item.id}`} className="text-xs font-medium cursor-pointer leading-tight">
                Hapus Data Finance Refund {transactionType === 'sales' ? 'Jual' : 'Beli'}
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => setIsOpen(false)} className="h-7 text-xs px-2">Batal</Button>
              <Button
                size="sm"
                className="h-7 text-xs bg-red-600 hover:bg-red-700 px-2 text-white"
                disabled={deleteMutation.isPending}
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    await deleteMutation.mutateAsync({ refundId: item.id, deleteFinanceRefund: isChecked });
                    toast.success('Data berhasil dihapus');
                    setIsOpen(false);
                  } catch (err: any) {
                    toast.error(err.message || 'Gagal menghapus data');
                  }
                }}
              >
                {deleteMutation.isPending ? 'Menghapus...' : 'Hapus'}
              </Button>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

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
          <div className="flex items-center justify-center">
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
            <DeleteFinanceRefundAction item={item} transactionType={transactionType} />
          </div>
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
