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
  const orderTarifs = data.tarifs.length ? data.tarifs : [];
  const firstTarif = orderTarifs[0];
  const cargoItems = firstTarif?.tarifItems?.length
    ? firstTarif.tarifItems
    : firstTarif?.loadContent
      ? [{ id: `${firstTarif.id}-fallback`, loadContent: firstTarif.loadContent, qty: Number(firstTarif.qty ?? 0) }]
      : [];

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
            <p className="text-sm text-slate-600 font-medium">Detail Muatan</p>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full border-collapse text-left text-sm text-slate-500">
                <thead className="bg-slate-50 text-xs uppercase text-slate-700">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold w-[60px]">No</th>
                    <th className="px-4 py-2.5 font-semibold">Nama Muatan</th>
                    <th className="px-4 py-2.5 font-semibold w-[150px]">QTY</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {cargoItems.length ? (
                    cargoItems.map((cargoItem, idx) => (
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

      <SectionCard title="Detail Order">
        {orderTarifs.length > 1 ? (
          <div className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <DetailField label="Tipe Armada" value={getOrderVehicleTypeLabel(data, orderTarifs[0])} />
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full border-collapse text-left text-sm text-slate-500">
                <thead className="bg-slate-50 text-xs uppercase text-slate-700">
                  <tr>
                    <th className="px-4 py-3 font-semibold">No</th>
                    <th className="px-4 py-3 font-semibold">Loading In</th>
                    <th className="px-4 py-3 font-semibold">Loading Out</th>
                    <th className="px-4 py-3 font-semibold">Tujuan Kirim</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {orderTarifs.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{idx + 1}</td>
                      <td className="px-4 py-3 text-slate-900">{item.loadingIn || '-'}</td>
                      <td className="px-4 py-3 text-slate-900">{item.loadingOut || '-'}</td>
                      <td className="px-4 py-3 text-slate-900">{item.deliveryDestination || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <DetailField label="Loading In" value={orderTarifs[0]?.loadingIn || data.loadingIn || '-'} />
            <DetailField label="Tujuan Kirim" value={orderTarifs[0]?.deliveryDestination || '-'} />
            <DetailField label="Loading Out" value={orderTarifs[0]?.loadingOut || data.loadingOut || '-'} />
            <DetailField label="Tipe Armada" value={getOrderVehicleTypeLabel(data, orderTarifs[0])} />
          </div>
        )}
      </SectionCard>

      <SectionCard title="Keuangan">
        <div className="grid gap-6 md:grid-cols-2">
          <DetailField label="UJ Driver" value={formatOrderCurrency(orderTarifs[0]?.driverFee || data.ujDriver)} />
          <DetailField label="Invoice Ekspedisi" value={formatOrderCurrency(orderTarifs[0]?.expeditionInvoice || data.billInvoice)} />
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
