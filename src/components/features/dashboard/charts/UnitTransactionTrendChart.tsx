'use client';

import { useMemo } from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useUnitTransactionTrend } from '@/hooks/useDashboardData';
import { TrendingUp, FileDown, FileUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

interface Props {
  startDate: string | null;
  endDate: string | null;
}

function formatLabelDate(dateStr: string): string {
  try {
    if (!dateStr) return '-';
    if (dateStr.length === 10) {
      const parsed = parseISO(dateStr);
      return format(parsed, 'dd MMM', { locale: id });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-xl bg-slate-900 px-4 py-3 text-white shadow-2xl text-xs space-y-2 min-w-[180px] border border-slate-700">
      <div className="flex items-center justify-between border-b border-slate-700 pb-1.5 font-semibold text-slate-200">
        <span>{formatLabelDate(label || '')}</span>
      </div>
      <div className="space-y-1.5">
        {payload.map((entry: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-300">{entry.name}</span>
            </div>
            <span className="font-bold text-white">{entry.value} transaksi</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatPeriod(start: string | null, end: string | null): string {
  if (!start && !end) return 'Semua Periode';
  try {
    const formatStr = (dStr: string) => {
      const parsed = parseISO(dStr);
      return format(parsed, 'dd MMM yyyy', { locale: id });
    };
    if (start && end) {
      return `${formatStr(start)} - ${formatStr(end)}`;
    }
    if (start) {
      return `Mulai ${formatStr(start)}`;
    }
    if (end) {
      return `Hingga ${formatStr(end)}`;
    }
  } catch {
    return `${start || ''} - ${end || ''}`;
  }
  return '';
}

export function UnitTransactionTrendChart({ startDate, endDate }: Props) {
  const { data, isLoading } = useUnitTransactionTrend(startDate, endDate);

  const summary = data?.summary || { total_sales_transactions: 0, total_purchase_transactions: 0 };
  const chartData = data?.trend || [];

  return (
    <Card className="rounded-[20px] border border-slate-200 bg-white p-7 shadow-sm">
      <CardHeader className="p-0 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-[17px] font-bold text-slate-900">Trend Jual Beli Unit</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Grafik statistik tren jumlah transaksi penjualan dan pembelian unit</p>
          </div>
        </div>
        <div className="text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 flex items-center gap-1.5 self-start md:self-auto">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
          <span>{formatPeriod(startDate, endDate)}</span>
        </div>
      </CardHeader>

      <CardContent className="p-0 pt-6 space-y-6">
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <FileUp className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total Penjualan</p>
              <p className="text-base font-bold text-slate-900">
                {summary.total_sales_transactions.toLocaleString('id-ID')}{' '}
                <span className="text-xs font-normal text-slate-500">transaksi</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <FileDown className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total Pembelian</p>
              <p className="text-base font-bold text-slate-900">
                {summary.total_purchase_transactions.toLocaleString('id-ID')}{' '}
                <span className="text-xs font-normal text-slate-500">transaksi</span>
              </p>
            </div>
          </div>
        </div>

        {/* Line Chart View */}
        {isLoading ? (
          <div className="h-80 w-full animate-pulse rounded-xl bg-slate-100" />
        ) : chartData.length > 0 ? (
          <div className="h-[320px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="label"
                  tickFormatter={formatLabelDate}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={{ stroke: '#CBD5E1' }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '16px', fontSize: '12px' }}
                  formatter={(val) => <span className="text-xs font-medium text-slate-700">{val}</span>}
                />
                <Line
                  type="monotone"
                  dataKey="sales_count"
                  name="Penjualan"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="purchase_count"
                  name="Pembelian"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <TrendingUp className="h-10 w-10 text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-600">Belum ada data statistik trend transaksi unit</p>
            <p className="text-xs text-slate-400 mt-1">Coba ubah periode atau rentang tanggal pada filter</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
