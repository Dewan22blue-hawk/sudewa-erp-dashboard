import { CashflowSummary as CashflowSummaryType } from '@/@types/dashboard';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatMoney } from '@/lib/utils/format';

interface CashflowSummaryProps {
  data?: CashflowSummaryType;
  isLoading?: boolean;
}

function SummaryTable({ title, rows }: { title: string; rows: CashflowSummaryType['incomes'] }) {
  return (
    <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-800 px-4 py-3 text-sm font-semibold text-white">{title}</div>
      <div className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-slate-700">Akun</TableHead>
              <TableHead className="text-right text-slate-700">Jumlah</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, idx) => (
              <TableRow key={`${row.account}-${idx}`} className="hover:bg-slate-50/50">
                <TableCell className="font-medium text-slate-800">{row.account}</TableCell>
                <TableCell className="text-right text-slate-700">{formatMoney(row.amount, row.currency)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

function LoadingState() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="h-56 animate-pulse rounded-2xl bg-slate-100" />
      <div className="h-56 animate-pulse rounded-2xl bg-slate-100" />
    </div>
  );
}

export function CashflowSummary({ data, isLoading }: CashflowSummaryProps) {
  if (isLoading) return <LoadingState />;
  if (!data) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <SummaryTable title="Pemasukan" rows={data.incomes} />
      <SummaryTable title="Pengeluaran" rows={data.outcomes} />
    </div>
  );
}
