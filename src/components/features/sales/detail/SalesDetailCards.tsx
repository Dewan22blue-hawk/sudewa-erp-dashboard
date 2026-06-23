import { Card, CardContent } from '@/components/ui/card';
import { FileText, DollarSign, ListChecks, Calendar, User } from 'lucide-react';
import { SalesItem } from '../sales.data';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils/currency';
import { getHistoryUsdAmount, getHistoryBcaIdrAmount, getHistoryCashIdrAmount } from '@/utils/payment-helpers';

interface Props {
  data: SalesItem;
  billingHistories?: any[];
}

export function SalesDetailCards({ data, billingHistories = [] }: Props) {
  const totalDppFromItems = (data.lineItems ?? []).reduce((sum, item) => sum + Number(item.dpp ?? 0), 0);
  const totalPpnFromItems = (data.lineItems ?? []).reduce((sum, item) => sum + Number(item.ppn ?? 0), 0);
  const totalDpp = totalDppFromItems > 0 ? totalDppFromItems : Number(data.totalDpp ?? 0);
  const totalPpn = totalPpnFromItems > 0 ? totalPpnFromItems : Number(data.totalPpn ?? 0);
  const totalJual = Number(data.totalJual ?? 0);
  const totalPaidFromField = Number(data.totalBayar ?? 0);
  const totalPaidFromDiff = Math.max(0, totalJual - Number(data.kurangBayar ?? 0));
  const totalPaid = Math.min(totalJual, Math.max(totalPaidFromField, totalPaidFromDiff));
  const kurangBayar = Math.max(0, totalJual - totalPaid);
  const percentagePaid = totalJual > 0 ? Math.min(100, Math.max(0, Math.round((totalPaid / totalJual) * 100))) : 0;

  const kreditBankUsd = billingHistories.reduce((sum, item) => sum + getHistoryUsdAmount(item), 0);
  const kreditBankIdr = billingHistories.reduce((sum, item) => sum + getHistoryBcaIdrAmount(item), 0);
  const kreditCashIdr = billingHistories.reduce((sum, item) => sum + getHistoryCashIdrAmount(item), 0);

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

      {/* Card 2: Jumlah Penjualan */}
      <Card className="rounded-lg border border-slate-200 shadow-sm h-full">
        <CardContent className="p-5 flex flex-col h-full gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-md">
              <DollarSign className="h-5 w-5 text-emerald-500" />
            </div>
            <h3 className="text-sm font-semibold text-slate-700">Jumlah Penjualan</h3>
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
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-sm font-semibold text-slate-900">
              <span>Total Penjualan</span>
              <span>{formatCurrency(data.totalJual)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Riwayat Pembayaran */}
      <Card className="rounded-lg border border-slate-200 shadow-sm h-full">
        <CardContent className="p-5 flex flex-col h-full gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-md">
              <ListChecks className="h-5 w-5 text-red-500" />
            </div>
            <h3 className="text-sm font-semibold text-slate-700">Riwayat Pembayaran</h3>
          </div>

          <div className="space-y-3 text-xs text-slate-500 flex-1 flex flex-col">
            <div className="flex items-center justify-between">
              <span>Kredit Bank USD</span>
              <span className="text-sm font-semibold text-slate-900">{formatCurrency(kreditBankUsd, 'USD')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Kredit Bank IDR</span>
              <span className="text-sm font-semibold text-slate-900">{formatCurrency(kreditBankIdr)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Kredit Cash IDR</span>
              <span className="text-sm font-semibold text-slate-900">{formatCurrency(kreditCashIdr)}</span>
            </div>

            <div className="pt-2 mt-auto border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                <span>Kurang Bayar</span>
                <span className="text-red-500 font-bold">{formatCurrency(kurangBayar)}</span>
              </div>

              <div className="space-y-1">
                <Progress value={percentagePaid} className="h-1.5" />
                <div className="text-right text-[10px] text-slate-400">{percentagePaid}% Terbayar</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

