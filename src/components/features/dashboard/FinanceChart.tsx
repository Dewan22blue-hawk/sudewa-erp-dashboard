import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { FinanceSeriesPoint, FinanceSeriesValues } from '@/@types/dashboard';

interface FinanceChartProps {
  data: FinanceSeriesPoint[];
  isLoading?: boolean;
}

type ChartMode = 'income' | 'expense';
type TransactionType = 'sales' | 'purchase';

const SERIES_META = [
  { key: 'bcaUsd', label: 'BCA USD', color: '#B0160D' },
  { key: 'bcaIdr', label: 'BCA IDR', color: '#ECB45B' },
  { key: 'cash', label: 'CASH IDR', color: '#1C3A58' },
] as const;

const MONTH_ORDER = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

const monthLabel = (month: string) => month.slice(0, 3);

const tooltipFormatter = (value: number) => new Intl.NumberFormat('id-ID').format(value);

/**
 * Resolve the correct FinanceSeriesValues from a series point.
 *
 * Backward compatible:
 * - If item[mode][transactionType] exists → use nested structure
 * - Otherwise → fallback to flat item[mode] (old data shape)
 */
function resolveSeriesValues(
  item: FinanceSeriesPoint,
  mode: ChartMode,
  transactionType: TransactionType,
): FinanceSeriesValues {
  const modeData = item[mode];
  const nested = modeData[transactionType];
  if (nested) return nested;
  // Fallback: use flat structure (backward compat)
  return {
    bcaUsd: modeData.bcaUsd,
    bcaIdr: modeData.bcaIdr,
    cash: modeData.cash,
  };
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-md bg-black px-3 py-2 text-xs text-white shadow-lg">
      <div className="space-y-1">
        {payload.map((item: any) => (
          <div key={item.name} className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: item.color }} />
            <span className="font-medium">{item.name}</span>
            <span className="font-semibold">Rp {tooltipFormatter(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkeletonChart() {
  return (
    <Card className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Grafik</p>
          <p className="text-xs text-slate-500">Memvisualisasikan pemasukan vs pengeluaran</p>
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-36 animate-pulse rounded-md bg-slate-100" />
          <div className="h-10 w-36 animate-pulse rounded-md bg-slate-100" />
        </div>
      </div>
      <div className="h-80 animate-pulse rounded-lg bg-slate-100" />
    </Card>
  );
}

export function FinanceChart({ data, isLoading }: FinanceChartProps) {
  const [mode, setMode] = useState<ChartMode>('income');
  const [transactionType, setTransactionType] = useState<TransactionType>('sales');

  const chartData = useMemo(() => {
    const sorted = [...(data || [])].sort(
      (a, b) => MONTH_ORDER.indexOf(a.month.toLowerCase()) - MONTH_ORDER.indexOf(b.month.toLowerCase()),
    );

    return sorted.map((item) => {
      const values = resolveSeriesValues(item, mode, transactionType);
      return {
        month: monthLabel(item.month),
        'BCA USD': values.bcaUsd,
        'BCA IDR': values.bcaIdr,
        'CASH IDR': values.cash,
      };
    });
  }, [data, mode, transactionType]);

  if (isLoading) return <SkeletonChart />;
  if (!data?.length) {
    return (
      <Card className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-center py-12 text-slate-500">
          <p className="font-medium">Belum ada data transaksi</p>
          <p className="text-sm mt-2">Data akan muncul setelah ada mutasi dari sistem</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-base font-semibold text-slate-900">Grafik</p>
          <p className="text-sm text-slate-500">Pilih tipe arus kas untuk melihat trennya.</p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Filter 1: Mode (Pemasukan / Pengeluaran) */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">Tampilkan</span>
            <Select value={mode} onValueChange={(val: ChartMode) => setMode(val)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Pemasukan</SelectItem>
                <SelectItem value="expense">Pengeluaran</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter 2: Transaction Type (Penjualan / Pembelian) */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">Tipe</span>
            <Select value={transactionType} onValueChange={(val: TransactionType) => setTransactionType(val)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">Penjualan</SelectItem>
                <SelectItem value="purchase">Pembelian</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={320}>
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} width={32} domain={[0, 'auto']} />
            <Tooltip content={<CustomTooltip />} />
            {SERIES_META.map((series) => (
              <Line key={series.key} type="monotone" dataKey={series.label} stroke={series.color} strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-6">
        {SERIES_META.map((series) => (
          <div key={series.key} className="flex items-center gap-2 text-sm text-slate-600">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: series.color }} />
            {series.label}
          </div>
        ))}
      </div>
    </Card>
  );
}
