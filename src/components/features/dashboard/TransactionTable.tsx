import { TransactionEntry } from '@/@types/dashboard';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMemo, useState } from 'react';
import { formatDate } from '@/lib/utils/format';

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
  const [filter, setFilter] = useState<FilterMode>('all');

  const filtered = useMemo(() => {
    if (!data) return [];
    if (filter === 'all') return data;
    return data.filter((item) => item.type === filter);
  }, [data, filter]);

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
              <TableHead className="text-slate-900 font-bold">Nota</TableHead>
              <TableHead className="text-slate-900 font-bold">Tanggal</TableHead>
              <TableHead className="text-slate-900 font-bold">Penjualan</TableHead>
              <TableHead className="text-slate-900 font-bold">Customer</TableHead>
              <TableHead className="text-slate-900 font-bold">Akun</TableHead>
              <TableHead className="text-right text-slate-900 font-bold">Total</TableHead>
              <TableHead className="text-slate-900 font-bold">Keterangan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((item, idx) => (
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
