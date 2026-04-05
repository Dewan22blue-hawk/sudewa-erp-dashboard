import { Card, CardContent } from '@/components/ui/card';
import { UnitTransactionDetail } from '@/@types/unit-transaction.types';
import { Calendar, User, FileText, DollarSign, Warehouse } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';

interface Props {
  data: UnitTransactionDetail;
}

export function PurchaseDetailCards({ data }: Props) {
  const totalBruto = Number(data.unit_transaction_bruto_total ?? data.unit_transaction_item_bruto_total ?? 0);
  const totalHpp = Number(data.unit_transaction_item_total_hpp ?? 0);
  const totalDpp = Number(data.unit_transaction_item_total_dpp ?? 0);
  const totalPpn = Number(data.unit_transaction_item_total_ppn ?? 0);

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
                {data.created_at ? new Date(data.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
              </div>
            </div>
            <div className="space-y-1">
              <p>Supplier</p>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <User className="h-4 w-4 text-slate-500" />
                <span className="uppercase">{data.person?.name ?? '-'}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p>Gudang</p>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Warehouse className="h-4 w-4 text-slate-500" />
                <span>{data.warehouse?.name ?? '-'}</span>
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
              <span>Total HPP</span>
              <span className="text-sm font-semibold text-slate-900">{formatCurrency(totalHpp)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Total DPP</span>
              <span className="text-sm font-semibold text-slate-900">{formatCurrency(totalDpp)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Total PPN</span>
              <span className="text-sm font-semibold text-slate-900">{formatCurrency(totalPpn)}</span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-sm font-semibold text-slate-900">
              <span>Total Pembelian</span>
              <span>{formatCurrency(totalBruto)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Ringkasan Transaksi */}
      <Card className="rounded-lg border border-slate-200 shadow-sm h-full">
        <CardContent className="p-5 flex flex-col h-full gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-red-50">
              <DollarSign className="h-5 w-5 text-red-500" />
            </div>
            <h3 className="text-sm font-semibold text-slate-700">Ringkasan Nilai</h3>
          </div>

          <div className="space-y-3 text-xs text-slate-500">
            <div className="flex items-center justify-between">
              <span>Bruto</span>
              <span className="text-sm font-semibold text-slate-900">{formatCurrency(totalBruto)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>DPP</span>
              <span className="text-sm font-semibold text-slate-900">{formatCurrency(totalDpp)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>PPN</span>
              <span className="text-sm font-semibold text-red-500">{formatCurrency(totalPpn)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
