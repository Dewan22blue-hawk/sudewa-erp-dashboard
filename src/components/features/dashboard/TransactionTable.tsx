import { TransactionEntry } from '@/@types/dashboard';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMemo, useState } from 'react';
import { formatDate } from '@/lib/utils/format';
import { useTableSort } from '@/hooks/useTableSort';
import { SortableHeader } from '@/components/ui/sortable-header';

interface TransactionTableProps {
  data: TransactionEntry[];
  isLoading?: boolean;
}

type FilterMode = 'all' | 'income' | 'expense';

function LoadingTable() {
  return (
    <Card className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="h-6 w-32 animate-pulse rounded bg-slate-100" />
        <div className="h-10 w-32 animate-pulse rounded bg-slate-100" />
      </div>
      <div className="h-80 animate-pulse rounded-lg bg-slate-100" />
    </Card>
  );
}

export function TransactionTable({ data, isLoading }: TransactionTableProps) {
  const [filter, setFilter] = useState<FilterMode>('expense');

  const filtered = useMemo(() => {
    if (!data) return [];
    if (filter === 'all') return data;
    return data.filter((item) => item.type === filter);
  }, [data, filter]);

  const { sortedData, sortKey, sortOrder, handleSort } = useTableSort({
    data: filtered,
  });

  if (isLoading) return <LoadingTable />;
  if (!data?.length) return null;

  return (
    <Card className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-slate-900">Detail Pemasukan</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600">Tampilkan</span>
          <Select value={filter} onValueChange={(val: FilterMode) => setFilter(val)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Pemasukan</SelectItem>
              <SelectItem value="expense">Pengeluaran</SelectItem>
              <SelectItem value="all">Semua</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <Table>
          <TableHeader className="bg-slate-100">
            <TableRow className='font-bold'>
              <TableHead className="p-0 text-slate-900 font-bold min-w-[120px]">
                <SortableHeader title="Nota" sortKey="note" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="w-full justify-start text-slate-900 px-4" />
              </TableHead>
              <TableHead className="p-0 text-slate-900 font-bold min-w-[120px]">
                <SortableHeader title="Tanggal" sortKey="date" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="w-full justify-start text-slate-900 px-4" />
              </TableHead>
              <TableHead className="p-0 text-slate-900 font-bold min-w-[150px]">
                <SortableHeader title="Penjualan" sortKey="sale" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="w-full justify-start text-slate-900 px-4" />
              </TableHead>
              <TableHead className="p-0 text-slate-900 font-bold min-w-[150px]">
                <SortableHeader title="Customer" sortKey="customer" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="w-full justify-start text-slate-900 px-4" />
              </TableHead>
              <TableHead className="p-0 text-slate-900 font-bold min-w-[150px]">
                <SortableHeader title="Akun" sortKey="account" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="w-full justify-start text-slate-900 px-4" />
              </TableHead>
              <TableHead className="p-0 text-right text-slate-900 font-bold min-w-[150px]">
                <SortableHeader title="Total" sortKey="total" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="w-full justify-end text-slate-900 px-4" />
              </TableHead>
              <TableHead className="p-0 text-slate-900 font-bold min-w-[180px]">
                <SortableHeader title="Keterangan" sortKey="description" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="w-full justify-start text-slate-900 px-4" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((item, idx) => (
              <TableRow key={`${item.note}-${idx}`} className="hover:bg-slate-50/50">
                <TableCell className="font-medium text-slate-800">{item.note}</TableCell>
                <TableCell className="text-slate-700">{formatDate(item.date)}</TableCell>
                <TableCell className="text-slate-700">{item.sale}</TableCell>
                <TableCell className="text-slate-700">{item.customer}</TableCell>
                <TableCell className="text-slate-700">{item.account}</TableCell>
                <TableCell className="text-right font-semibold text-slate-800">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: item.currency,
                    minimumFractionDigits: 0,
                  }).format(item.total)}
                </TableCell>
                <TableCell className="text-slate-700">{item.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
