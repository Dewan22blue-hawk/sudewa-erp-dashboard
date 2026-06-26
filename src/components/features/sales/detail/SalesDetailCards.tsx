import { Card, CardContent } from '@/components/ui/card';
import { FileText, DollarSign, ListChecks, Calendar, User } from 'lucide-react';
import { SalesItem } from '../sales.data';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils/currency';
import { getHistoryTotalIdrEquivalent } from '@/utils/payment-helpers';

interface Props {
  data: SalesItem;
  billingHistories?: any[];
}

export function SalesDetailCards({ data, billingHistories = [] }: Props) {
  const totalDppFromItems = (data.lineItems ?? []).reduce((sum, item) => sum + Number(item.dpp ?? 0), 0);
  const totalPpnFromItems = (data.lineItems ?? []).reduce((sum, item) => sum + Number(item.ppn ?? 0), 0);
  const totalDpp = totalDppFromItems > 0 ? totalDppFromItems : Number(data.totalDpp ?? 0);
  const totalPpn = totalPpnFromItems > 0 ? totalPpnFromItems : Number(data.totalPpn ?? 0);
  const totalHpp = Number(data.totalHpp ?? 0) || (totalDpp + totalPpn);
  const totalBiaya = Number(data.totalBiaya ?? 0);
  const totalJual = Number(data.totalJual ?? 0);

  const historyPaid = billingHistories.reduce((sum, item) => sum + getHistoryTotalIdrEquivalent(item), 0);
  const kurangBayar = Math.max(0, totalJual - historyPaid);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Card 1: Informasi Penjualan */}
      <Card className="rounded-lg border border-slate-200 shadow-sm h-full">
        <CardContent className="p-5 flex flex-col h-full gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-md">
              <FileText className="h-5 w-5 text-blue-500" />
            </div>
            <h3 className="text-sm font-semibold text-slate-700">Informasi Penjualan</h3>
          </div>

          <div className="space-y-3 text-xs text-slate-500">
            <div className="space-y-1">
              <p>Nomor Invoice</p>
              <p className="text-sm font-semibold text-slate-900">{data.kodeJual}</p>
            </div>

            <div className="space-y-1">
              <p>Tanggal</p>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Calendar className="h-4 w-4 text-slate-500" />
                <span>{data.tanggal}</span>
              </div>
            </div>

            <div className="space-y-1">
              <p>Customer</p>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <User className="h-4 w-4 text-slate-500" />
                <span className="uppercase truncate">{data.customer}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Detail Penjualan */}
      <Card className="rounded-lg border border-slate-200 shadow-sm h-full">
        <CardContent className="p-5 flex flex-col h-full gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-md">
              <DollarSign className="h-5 w-5 text-emerald-500" />
            </div>
            <h3 className="text-sm font-semibold text-slate-700">Detail Penjualan</h3>
          </div>

          <div className="space-y-3 text-xs text-slate-500">
            <div className="flex items-center justify-between">
              <span>Total DPP</span>
              <span className="text-sm font-semibold text-slate-900">{formatCurrency(totalDpp)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Total PPN</span>
              <span className="text-sm font-semibold text-slate-900">{formatCurrency(totalPpn)}</span>
            </div>
            <div className="border-t border-slate-100 my-1"></div>
            <div className="flex items-center justify-between text-slate-900">
              <span className="font-bold text-sm">Total HPP</span>
              <span className="text-sm font-bold">{formatCurrency(totalHpp)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Total Biaya</span>
              <span className="text-sm font-semibold text-slate-900">{formatCurrency(totalBiaya)}</span>
            </div>
            <div className="border-t border-slate-100 my-1"></div>
            <div className="flex items-center justify-between text-slate-900">
              <span className="font-bold uppercase text-sm">TOTAL PENJUALAN</span>
              <span className="text-sm font-bold">{formatCurrency(totalJual)}</span>
            </div>
            {data.price_usd ? (
              <div className="flex items-center justify-between text-xs text-amber-800 bg-amber-50/50 px-2 py-1 rounded border border-amber-100 mt-2">
                <span className="font-medium">Total Harga (USD)</span>
                <span className="font-bold">{formatCurrency(data.price_usd, 'USD')}</span>
              </div>
            ) : null}
            {data.price_per_unit_usd ? (
              <div className="flex items-center justify-between text-xs text-amber-800 bg-amber-50/50 px-2 py-1 rounded border border-amber-100">
                <span className="font-medium">Harga Satuan (USD)</span>
                <span className="font-bold">{formatCurrency(data.price_per_unit_usd, 'USD')}</span>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Rincian Nilai */}
      <Card className="rounded-lg border border-slate-200 shadow-sm h-full">
        <CardContent className="p-5 flex flex-col h-full gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-md">
              <ListChecks className="h-5 w-5 text-red-500" />
            </div>
            <h3 className="text-sm font-semibold text-slate-700">Rincian Nilai</h3>
          </div>

          <div className="space-y-3 text-xs text-slate-500 flex-1 flex flex-col">
            <div className="flex items-center justify-between">
              <span>DPP</span>
              <span className="text-sm font-semibold text-slate-900">{formatCurrency(totalDpp)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>PPN</span>
              <span className="text-sm font-semibold text-slate-900">{formatCurrency(totalPpn)}</span>
            </div>
            <div className="border-t border-slate-100 my-1 mt-auto"></div>
            <div className="flex items-center justify-between text-slate-900 pt-2">
              <span className="font-bold uppercase text-sm">TOTAL PENJUALAN</span>
              <span className="text-sm font-bold">{formatCurrency(totalJual)}</span>
            </div>
            <div className="flex items-center justify-between text-red-600">
              <span className="font-bold uppercase text-sm">KURANG BAYAR</span>
              <span className="text-sm font-bold">{formatCurrency(kurangBayar)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

