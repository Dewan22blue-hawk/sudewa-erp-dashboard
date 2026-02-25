import { CashflowSummary as CashflowSummaryType } from '@/@types/dashboard';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { formatMoney } from '@/lib/utils/format';

interface CashflowSummaryProps {
  data?: CashflowSummaryType;
  isLoading?: boolean;
}

function SummaryTable({ title, rows }: { title: string; rows: CashflowSummaryType['incomes'] }) {
  return (
    <Card className="rounded-sm border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between bg-[#1f304f] px-5 py-4">
        <span className="text-[15px] font-semibold text-white">{title}</span>
        <span className="text-[15px] font-semibold text-white">Jumlah</span>
      </div>
      <div className="p-0">
        <Table>
          <TableBody>
            {rows.map((row, idx) => {
              // Menyesuaikan format sesuai yang di mock untuk USD (dengan decimal .00)
              const formattedValue = row.currency === 'USD'
                ? `$ ${(row.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : formatMoney(row.amount, row.currency);

              return (
                <TableRow key={`${row.account}-${idx}`} className="border-b border-slate-50 hover:bg-slate-50/50 last:border-none">
                  <TableCell className="px-5 py-5 text-[13px] font-medium text-slate-800">{row.account}</TableCell>
                  <TableCell className="px-5 py-5 text-right text-[13px] text-slate-700">{formattedValue}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

function LoadingState() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="h-56 animate-pulse rounded-[20px] bg-slate-100" />
      <div className="h-56 animate-pulse rounded-[20px] bg-slate-100" />
    </div>
  );
}

export function CashflowSummary({ data, isLoading }: CashflowSummaryProps) {
  if (isLoading) return <LoadingState />;
  if (!data) return null;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <SummaryTable title="Pemasukan" rows={data.incomes} />
      <SummaryTable title="Pengeluaran" rows={data.outcomes} />
    </div>
  );
}
