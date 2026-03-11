import { Card, CardContent } from '@/components/ui/card';
import { Purchase } from '@/@types/purchase.types';
import { Calendar, User, FileText, DollarSign, ListTodo } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils/currency';

interface Props {
  data: Purchase;
}

export function PurchaseDetailCards({ data }: Props) {
  const percentagePaid = data.totalPurchase > 0 ? Math.round(((data.totalPurchase - data.remainingPayment) / data.totalPurchase) * 100) : 0;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Card 1: Informasi Invoice */}
      <Card className="rounded-lg border border-slate-200 shadow-sm h-full">
        <CardContent className="p-5 flex flex-col h-full gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-blue-50">
              <FileText className="h-5 w-5 text-blue-500" />
            </div>
            <h3 className="text-sm font-semibold text-slate-700">Informasi Invoice</h3>
          </div>

          <div className="space-y-3 text-xs text-slate-500">
            <div className="space-y-1">
              <p>Nomor Invoice</p>
              <p className="text-sm font-semibold text-slate-900">{data.code}</p>
            </div>
            <div className="space-y-1">
              <p>Tanggal</p>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Calendar className="h-4 w-4 text-slate-500" />
                {new Date(data.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </div>
            </div>
            <div className="space-y-1">
              <p>Supplier</p>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <User className="h-4 w-4 text-slate-500" />
                <span className="uppercase">{data.supplierName}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Jumlah Pembelian */}
      <Card className="rounded-lg border border-slate-200 shadow-sm h-full">
        <CardContent className="p-5 flex flex-col h-full gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-emerald-50">
              <DollarSign className="h-5 w-5 text-emerald-500" />
            </div>
            <h3 className="text-sm font-semibold text-slate-700">Jumlah Pembelian</h3>
          </div>

          <div className="space-y-3 text-xs text-slate-500">
            <div className="flex items-center justify-between">
              <span>Total DPP</span>
              <span className="text-sm font-semibold text-slate-900">{formatCurrency(data.totalDpp)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Total PPN</span>
              <span className="text-sm font-semibold text-slate-900">{formatCurrency(data.totalPpn)}</span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-sm font-semibold text-slate-900">
              <span>Total Pembelian</span>
              <span>{formatCurrency(data.totalPurchase)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Status Pembayaran */}
      <Card className="rounded-lg border border-slate-200 shadow-sm h-full">
        <CardContent className="p-5 flex flex-col h-full gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-red-50">
              <ListTodo className="h-5 w-5 text-red-500" />
            </div>
            <h3 className="text-sm font-semibold text-slate-700">Status Pembayaran</h3>
          </div>

          <div className="space-y-3 text-xs text-slate-500">
            <div className="flex items-center justify-between">
              <span>Total Harga</span>
              <span className="text-sm font-semibold text-slate-900">{formatCurrency(data.totalPurchase)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Total Bayar</span>
              <span className="text-sm font-semibold text-slate-900">{formatCurrency(data.totalPurchase - data.remainingPayment)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Kurang Bayar</span>
              <span className="text-sm font-semibold text-red-500">{formatCurrency(data.remainingPayment)}</span>
            </div>

            <div className="pt-1 space-y-1">
              <Progress value={percentagePaid} className="h-2 bg-slate-200" />
              <div className="text-[11px] text-slate-500">{percentagePaid}% Terbayar</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
