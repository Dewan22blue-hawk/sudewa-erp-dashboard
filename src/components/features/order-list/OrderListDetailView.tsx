import * as React from 'react';
import { ChevronLeft } from 'lucide-react';
import type { OrderList } from '@/@types/order-list.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  formatOrderCurrency,
  getOrderVehicleTypeLabel,
  getOrderStatusBadgeClassName,
  getOrderStatusLabel,
} from './order-list.utils';

interface DetailFieldProps {
  label: string;
  value: React.ReactNode;
}

function DetailField({ label, value }: DetailFieldProps) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-slate-600">{label}</p>
      <div className="text-[18px] font-semibold text-slate-950">{value}</div>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-sm">
      <div className="bg-[#eef3f8] px-5 py-4">
        <h2 className="text-[18px] font-semibold text-slate-950">{title}</h2>
      </div>
      <div className="px-5 py-6">{children}</div>
    </section>
  );
}

interface OrderListDetailViewProps {
  data: OrderList;
  onBack: () => void;
}

export function OrderListDetailView({ data, onBack }: OrderListDetailViewProps) {
  const orderTarifs = React.useMemo(() => {
    return data.tarifs?.length ? data.tarifs : [];
  }, [data.tarifs]);

  const summaryCargoItems = React.useMemo(() => {
    const map = new Map<string, number>();
    
    orderTarifs.forEach((tarif) => {
      const items = tarif.tarifItems?.length
        ? tarif.tarifItems
        : tarif.loadContent
          ? [{ loadContent: tarif.loadContent, qty: Number(tarif.qty ?? 0) }]
          : [];
          
      items.forEach((item) => {
        const name = String(item.loadContent || '').trim();
        if (!name) return;
        const currentQty = map.get(name) || 0;
        map.set(name, currentQty + Number(item.qty || 0));
      });
    });
    
    return Array.from(map.entries()).map(([loadContent, qty], idx) => ({
      id: `summary-${idx}`,
      loadContent,
      qty,
    }));
  }, [orderTarifs]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button type="button" variant="ghost" size="icon" onClick={onBack} className="h-10 w-10 rounded-full">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-[20px] font-semibold text-slate-950 md:text-[24px]">Detail Order</h1>
      </div>

      <SectionCard title="Detail Customer">
        <div className="grid gap-6 md:grid-cols-2">
          <DetailField label="Nama Customer" value={data.customer?.name || '-'} />
          <DetailField label="Kode Order" value={data.code || '-'} />
          
          <div className="md:col-span-2 space-y-2">
            <p className="text-sm text-slate-600 font-medium">Ringkasan (Summary) Total Muatan</p>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full border-collapse text-left text-sm text-slate-500">
                <thead className="bg-slate-50 text-xs uppercase text-slate-700">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold w-[60px]">No</th>
                    <th className="px-4 py-2.5 font-semibold">Nama Muatan</th>
                    <th className="px-4 py-2.5 font-semibold w-[150px]">Total QTY</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {summaryCargoItems.length ? (
                    summaryCargoItems.map((cargoItem, idx) => (
                      <tr key={cargoItem.id || idx} className="hover:bg-slate-50 text-[15px] text-slate-900">
                        <td className="px-4 py-2.5 font-medium text-slate-500">{idx + 1}</td>
                        <td className="px-4 py-2.5 font-semibold">{cargoItem.loadContent || '-'}</td>
                        <td className="px-4 py-2.5 font-semibold">{cargoItem.qty} PCS</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-4 text-center text-slate-400">
                        Tidak ada data muatan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Detail Rute &amp; Muatan">
        <div className="space-y-6">
          {orderTarifs.map((item, index) => {
            const cargoItems = item.tarifItems?.length
              ? item.tarifItems
              : item.loadContent
                ? [{ id: `${item.id}-fallback`, loadContent: item.loadContent, qty: Number(item.qty ?? 0) }]
                : [];

            return (
              <div key={item.id || index} className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-none">
                {/* Header Sub-Card */}
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-800">
                    Rute #{index + 1}: {item.loadingIn || '-'} ke {item.loadingOut || '-'}
                  </span>
                  <span className="text-xs font-medium bg-[#eef3f8] text-slate-700 px-2 py-0.5 rounded-full">
                    {getOrderVehicleTypeLabel(data, item)}
                  </span>
                </div>
                
                {/* Detail Fields */}
                <div className="p-4 grid gap-4 md:grid-cols-3">
                  <div className="space-y-0.5">
                    <p className="text-xs text-slate-500">Tujuan Kirim</p>
                    <p className="text-sm font-semibold text-slate-900">{item.deliveryDestination || '-'}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs text-slate-500">UJ Driver</p>
                    <p className="text-sm font-semibold text-slate-900">{formatOrderCurrency(item.driverFee)}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs text-slate-500">Invoice Ekspedisi</p>
                    <p className="text-sm font-semibold text-slate-900">{formatOrderCurrency(item.expeditionInvoice)}</p>
                  </div>
                </div>

                {/* Cargo Table for this specific route */}
                <div className="border-t border-slate-100 p-4 space-y-2">
                  <p className="text-xs font-semibold text-slate-500">Muatan Rute #{index + 1}</p>
                  <div className="overflow-hidden rounded-lg border border-slate-200">
                    <table className="w-full border-collapse text-left text-xs text-slate-500">
                      <thead className="bg-slate-50 text-slate-700 uppercase">
                        <tr>
                          <th className="px-3 py-2 font-semibold w-[50px]">No</th>
                          <th className="px-3 py-2 font-semibold">Nama Muatan</th>
                          <th className="px-3 py-2 font-semibold w-[120px]">QTY</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {cargoItems.length ? (
                          cargoItems.map((cargo, cIdx) => (
                            <tr key={cargo.id || cIdx} className="hover:bg-slate-50 text-[13px] text-slate-900 font-medium">
                              <td className="px-3 py-2 text-slate-500">{cIdx + 1}</td>
                              <td className="px-3 py-2 font-semibold">{cargo.loadContent}</td>
                              <td className="px-3 py-2 font-semibold">{cargo.qty} PCS</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="px-3 py-3 text-center text-slate-400">
                              Tidak ada data muatan untuk rute ini
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="Keuangan">
        <div className="grid gap-6 md:grid-cols-3">
          <DetailField label="Total UJ Driver" value={formatOrderCurrency(data.ujDriver)} />
          <DetailField label="Total Invoice Ekspedisi" value={formatOrderCurrency(data.billInvoice)} />
          <DetailField label="PPN" value={formatOrderCurrency(data.ppn)} />
        </div>
      </SectionCard>

      <SectionCard title="Status Order">
        <div className="space-y-1">
          <DetailField
            label="Status pengiriman"
            value={
              <Badge variant="outline" className={cn('rounded-full px-3 py-1 text-sm font-medium', getOrderStatusBadgeClassName(data.status))}>
                {getOrderStatusLabel(data.status)}
              </Badge>
            }
          />
        </div>
      </SectionCard>
    </div>
  );
}
