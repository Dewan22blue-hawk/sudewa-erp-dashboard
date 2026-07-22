import React, { useMemo } from 'react';
import { CashFlowItem } from '@/services/cashFlow.service';
import { TableRow, TableCell } from '@/components/ui/table';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import BaseTable, { ColumnDef } from '@/components/ui/base-table';
import { TextTruncate } from '@/components/ui/text-truncate';
import { CopyBox } from '@/components/ui/copy-box';

interface LaporanKasTableProps {
  data: CashFlowItem[];
  totalPemasukan?: number;
  totalPengeluaran?: number;
  onSort?: (key: string) => void;
  sortKey?: string;
  sortOrder?: 'asc' | 'desc';
}

const formatCurrency = (val: number) => {
  return `Rp ${val.toLocaleString('id-ID')}`;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return format(date, 'dd MMMM yyyy', { locale: id });
};

export function LaporanKasTable({
  data,
  totalPemasukan = 0,
  totalPengeluaran = 0,
  onSort,
  sortKey,
  sortOrder,
}: LaporanKasTableProps) {
  const columns = useMemo<ColumnDef<CashFlowItem>[]>(
    () => [
      {
        header: 'Tanggal',
        accessorKey: 'date',
        sortable: true,
        alignment: 'center',
        cell: (item) => formatDate(item.date),
      },
      {
        header: 'Nota Reff',
        accessorKey: 'code',
        sortable: true,
        alignment: 'left',
        cell: (item) => <CopyBox text={item?.code} />
      },
      {
        header: 'Keterangan',
        accessorKey: 'note',
        sortable: true,
        alignment: 'left',
        cell: (item) => <TextTruncate text={item.note || '-'} maxLength={20} />,
      },
      {
        header: 'PEMASUKAN',
        accessorKey: 'debet',
        alignment: 'center',
        cell: (item) => (
          <span className="text-emerald-600 font-semibold">
            {item.debet > 0 ? formatCurrency(item.debet) : '-'}
          </span>
        ),
      },
      {
        header: 'PENGELUARAN',
        accessorKey: 'credit',
        alignment: 'center',
        cell: (item) => (
          <span className="text-rose-600 font-semibold">
            {item.credit > 0 ? formatCurrency(item.credit) : '-'}
          </span>
        ),
      },
    ],
    []
  );

  const footerRow = useMemo(
    () => (
      <TableRow className="group bg-slate-50/50 hover:bg-slate-50/50 border-t border-slate-200">
        <TableCell colSpan={3} className="px-4 py-4 text-right">
          <span className="text-sm font-semibold text-slate-900 pr-12">Grand Total</span>
        </TableCell>
        <TableCell className="px-4 py-4 text-sm font-bold text-slate-900 text-center">
          {formatCurrency(totalPemasukan)}
        </TableCell>
        <TableCell className="px-4 py-4 text-sm font-bold text-slate-900 text-center">
          {formatCurrency(totalPengeluaran)}
        </TableCell>
      </TableRow>
    ),
    [totalPemasukan, totalPengeluaran]
  );

  return (
    <BaseTable
      data={data}
      columns={columns}
      footer={footerRow}
      sortBy={sortKey}
      sortDirection={sortOrder}
      onSortChange={onSort ? (key, direction) => onSort(key) : undefined}
    />
  );
}
