import type { WithholdingTaxItem } from '@/@types/withholding-tax.types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils/currency';
import { useWithholdingTaxDetail } from '@/hooks/useWithholdingTax';
import { format } from 'date-fns';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  itemId: number | null;
}

const formatDate = (value: string | null | undefined) => {
  if (!value) return '-';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : format(parsed, 'dd/MM/yyyy');
};

export default function WithholdingTaxDetailModal({ isOpen, onClose, itemId }: Props) {
  const { data, isLoading } = useWithholdingTaxDetail(isOpen ? itemId : null);

  const formatSource = (source: string) => {
    if (source === 'client_supplier') return 'Client / Supplier';
    return source.charAt(0).toUpperCase() + source.slice(1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-slate-100 pb-4 mb-4">
          <DialogTitle className="text-xl">Detail Bukti Potong</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
            <Skeleton className="h-32 w-full" />
          </div>
        ) : data ? (
          <div className="space-y-6">
            
            {/* Header Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Source</p>
                <p className="text-sm font-semibold text-slate-900">{formatSource(data.source)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">No Bukti Potong</p>
                <p className="text-sm font-semibold text-slate-900">{data.withholding_number || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Masa Bukti Potong</p>
                <p className="text-sm font-semibold text-slate-900">{data.withholding_age || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Tanggal Bayar</p>
                <p className="text-sm font-semibold text-slate-900">{formatDate(data.payment_date)}</p>
              </div>
            </div>

            {/* Grid Layout for details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center border-b border-slate-100 pb-2">
                    Informasi Keuangan
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Kas Terkait</span>
                      <span className="text-sm font-medium text-slate-900 text-right">
                        {data.cash ? `${data.cash.code} - ${data.cash.cash_name || data.cash.description || ''}` : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Nominal PPH</span>
                      <span className="text-sm font-medium text-slate-900">
                        {formatCurrency(data.pph_amount || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Uang Muka PPH</span>
                      <span className="text-sm font-medium text-slate-900 text-right max-w-[200px] truncate" title={data.pph_description || ''}>
                        {data.pph_description || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                      <span className="text-sm font-medium text-slate-700">Jumlah Pembayaran</span>
                      <span className="text-sm font-bold text-emerald-600">
                        {formatCurrency(data.payment_amount || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center border-b border-slate-100 pb-2">
                    Referensi Transaksi (Invoice)
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">No Invoice</span>
                      <span className="text-sm font-medium text-slate-900">
                        {data.do_invoice?.code || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Tanggal Invoice</span>
                      <span className="text-sm font-medium text-slate-900">
                        {formatDate(data.do_invoice?.date)}
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-slate-500 mt-0.5">Customer</span>
                      <span className="text-sm font-medium text-slate-900 text-right">
                        {data.do_invoice?.customer?.name || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Nominal Invoice</span>
                      <span className="text-sm font-medium text-slate-900">
                        {formatCurrency(data.do_invoice?.total_amount ?? data.do_invoice?.invoice_amount ?? data.do_invoice?.bill_invoice ?? 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="py-10 text-center text-sm text-slate-500">
            Data tidak ditemukan.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
