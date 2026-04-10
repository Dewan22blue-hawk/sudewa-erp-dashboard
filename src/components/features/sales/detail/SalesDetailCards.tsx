import { Card, CardContent } from '@/components/ui/card';
import { FileText, DollarSign, ListChecks, Calendar, User } from 'lucide-react';
import { SalesItem } from '../sales.data';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils/currency';

interface Props {
  data: SalesItem;
}

export function SalesDetailCards({ data }: Props) {
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

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Card 1: Informasi Penjualan */}
      <Card className="rounded-xl border border-input shadow-sm h-full">
        <CardContent className="p-6 flex flex-col h-full space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-gray-500 font-medium">Informasi Penjualan</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Nomor Invoice</p>
              <p className="font-semibold">{data.kodeJual}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-gray-500">Tanggal</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{data.tanggal}</span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-gray-500">Customer</p>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium uppercase truncate">{data.customer}</span>
              </div>
            </div>

            {/* <div className="space-y-1">
              <p className="text-sm text-gray-500">Warehouse</p>
              <div className="flex items-center gap-2">
                <span className="font-medium uppercase truncate">{data.warehouse ?? '-'}</span>
              </div>
            </div> */}
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Jumlah Penjualan */}
      <Card className="rounded-xl border border-input shadow-sm h-full">
        <CardContent className="p-6 flex flex-col h-full space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-gray-500 font-medium">Jumlah Penjualan</h3>
          </div>

          <div className="space-y-3 pt-2 flex-1">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Total DPP</span>
              <span className="font-medium">{formatCurrency(totalDpp)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Total PPN</span>
              <span className="font-medium">{formatCurrency(totalPpn)}</span>
            </div>
            <div className="pt-4 mt-auto border-t flex justify-between items-center">
              <span className="font-medium">Total Pembelian</span>
              <span className="font-bold text-lg">{formatCurrency(data.totalJual)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Status Pembayaran */}
      <Card className="rounded-xl border border-input shadow-sm h-full">
        <CardContent className="p-6 flex flex-col h-full space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <ListChecks className="h-5 w-5 text-red-500" />
            </div>
            <h3 className="text-gray-500 font-medium">Status Pembayaran</h3>
          </div>

          <div className="space-y-3 pt-2 flex-1">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Total Harga</span>
              <span className="font-medium">{formatCurrency(data.totalJual)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Total Bayar</span>
              <span className="font-medium">{formatCurrency(totalPaid)}</span>
            </div>

            <div className="pt-4 mt-auto border-t space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Kurang Bayar</span>
                <span className="font-bold text-lg text-red-500">{formatCurrency(kurangBayar)}</span>
              </div>

              <div className="space-y-2">
                <Progress value={percentagePaid} className="h-2" />
                <div className="text-right text-xs text-gray-500">{percentagePaid}% Terbayar</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
