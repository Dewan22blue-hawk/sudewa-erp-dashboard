'use client';

import { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { useUnitTypeSalesTrend } from '@/hooks/useDashboardData';
import { BarChart3, TrendingUp, Calendar as CalendarIcon, PackageCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  companyId?: string | null;
}

const BAR_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
  '#F97316', // Orange
  '#14B8A6', // Teal
];

function formatLabelDate(dateStr: string): string {
  try {
    if (!dateStr) return '-';
    // Format YYYY-MM-DD -> DD MMM
    if (dateStr.length === 10) {
      const parsed = parseISO(dateStr);
      return format(parsed, 'dd MMM', { locale: id });
    }
    // Format YYYY-MM -> MMM YYYY
    if (dateStr.length === 7) {
      const parsed = parseISO(`${dateStr}-01`);
      return format(parsed, 'MMM yyyy', { locale: id });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) {
  if (!active || !payload || !payload.length) return null;

  const totalDaySales = payload.reduce((acc, item) => acc + (Number(item.value) || 0), 0);

  return (
    <div className="rounded-xl bg-slate-900 px-4 py-3 text-white shadow-2xl text-xs space-y-2 min-w-[180px] border border-slate-700">
      <div className="flex items-center justify-between border-b border-slate-700 pb-1.5 font-semibold text-slate-200">
        <span>{formatLabelDate(label || '')}</span>
        <span className="text-[11px] text-slate-400">({label})</span>
      </div>
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {payload.map((entry, idx) => (
          <div key={idx} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-300 truncate max-w-[120px]">{entry.name}</span>
            </div>
            <span className="font-bold text-white">{entry.value} unit</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-slate-700 pt-1.5 font-bold text-emerald-400">
        <span>Total Terjual:</span>
        <span>{totalDaySales} unit</span>
      </div>
    </div>
  );
}

export function UnitTypeSalesTrendChart({ companyId }: Props) {
  const [periodPreset, setPeriodPreset] = useState<'last_week' | 'month' | 'year' | 'custom'>('last_week');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const queryParams = useMemo(() => {
    if (periodPreset === 'custom' && dateRange?.from && dateRange?.to) {
      return {
        company_id: companyId || undefined,
        start_date: format(dateRange.from, 'yyyy-MM-dd'),
        end_date: format(dateRange.to, 'yyyy-MM-dd'),
      };
    }
    return {
      company_id: companyId || undefined,
      range: periodPreset === 'custom' ? 'last_week' : periodPreset,
    };
  }, [companyId, periodPreset, dateRange]);

  const { data: rawTrendData, isLoading } = useUnitTypeSalesTrend(queryParams);

  // Transform API response into Recharts series data
  const { chartData, unitTypeKeys, totalPeriodSales, topUnitType } = useMemo(() => {
    const list = rawTrendData || [];
    if (list.length === 0) {
      return { chartData: [], unitTypeKeys: [], totalPeriodSales: 0, topUnitType: '-' };
    }

    const unitKeys: string[] = [];
    const labelMap = new Map<string, Record<string, number>>();
    const unitTypeTotalSalesMap = new Map<string, number>();

    list.forEach((item) => {
      const uName = item.unit_type_name || `Unit ${item.unit_type_id}`;
      if (!unitKeys.includes(uName)) {
        unitKeys.push(uName);
      }

      let uTotal = 0;
      item.trend.forEach((pt) => {
        const rawLabel = pt.label;
        if (!labelMap.has(rawLabel)) {
          labelMap.set(rawLabel, {});
        }
        const record = labelMap.get(rawLabel)!;
        record[uName] = (record[uName] || 0) + (pt.total_sales || 0);
        uTotal += pt.total_sales || 0;
      });

      unitTypeTotalSalesMap.set(uName, (unitTypeTotalSalesMap.get(uName) || 0) + uTotal);
    });

    const transformedChartData = Array.from(labelMap.entries()).map(([label, records]) => ({
      label,
      ...records,
    }));

    let grandTotal = 0;
    let topName = '-';
    let topVal = -1;

    unitTypeTotalSalesMap.forEach((val, key) => {
      grandTotal += val;
      if (val > topVal) {
        topVal = val;
        topName = key;
      }
    });

    return {
      chartData: transformedChartData,
      unitTypeKeys: unitKeys,
      totalPeriodSales: grandTotal,
      topUnitType: topVal > 0 ? topName : '-',
    };
  }, [rawTrendData]);

  return (
    <Card className="rounded-[20px] border border-slate-200 bg-white p-7 shadow-sm">
      <CardHeader className="p-0 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-[17px] font-bold text-slate-900">Trend Penjualan Tipe Unit</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Grafik statistik tren unit tipe terjual berdasarkan periode</p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={periodPreset}
            onValueChange={(val: any) => {
              setPeriodPreset(val);
              if (val !== 'custom') {
                setDateRange(undefined);
              }
            }}
          >
            <SelectTrigger className="h-9 w-40 bg-white border-slate-200 text-xs rounded-lg font-medium shadow-sm">
              <SelectValue placeholder="Pilih Periode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_week">Seminggu Ini</SelectItem>
              <SelectItem value="month">Bulan Ini</SelectItem>
              <SelectItem value="year">Tahun Ini</SelectItem>
              <SelectItem value="custom">Rentang Tanggal</SelectItem>
            </SelectContent>
          </Select>

          {periodPreset === 'custom' && (
            <DatePickerWithRange
              date={dateRange}
              onChange={setDateRange}
              placeholder="Rentang tanggal"
              className="h-9 text-xs"
            />
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0 pt-6 space-y-6">
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <PackageCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total Terjual</p>
              <p className="text-base font-bold text-slate-900">{totalPeriodSales.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-500">unit</span></p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Tipe Unit Terlaris</p>
              <p className="text-base font-bold text-slate-900 truncate max-w-[160px]">{topUnitType}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <CalendarIcon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Varian Tipe Unit</p>
              <p className="text-base font-bold text-slate-900">{unitTypeKeys.length} <span className="text-xs font-normal text-slate-500">tipe</span></p>
            </div>
          </div>
        </div>

        {/* Bar Chart View */}
        {isLoading ? (
          <div className="h-80 w-full animate-pulse rounded-xl bg-slate-100" />
        ) : chartData.length > 0 ? (
          <div className="h-[320px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                {unitTypeKeys.map((key, idx) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    name={key}
                    fill={BAR_COLORS[idx % BAR_COLORS.length]}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={48}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <BarChart3 className="h-10 w-10 text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-600">Belum ada data statistik penjualan unit tipe</p>
            <p className="text-xs text-slate-400 mt-1">Coba ubah periode atau rentang tanggal pada filter</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
