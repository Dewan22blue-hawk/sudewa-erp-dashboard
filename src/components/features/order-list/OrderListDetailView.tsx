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
          <DetailField
            label="Muatan"
            value={
              orderTarifs.length ? (
                <div className="space-y-3">
                  {orderTarifs.map((item, index) => {
                    const cargoItems = item.tarifItems?.length
                      ? item.tarifItems
                      : item.loadContent
                        ? [{ id: `${item.id}-fallback`, loadContent: item.loadContent, qty: Number(item.qty ?? 0) }]
                        : [];

                    const cargoLabel = cargoItems.length
                      ? cargoItems.map((cargoItem) => cargoItem.loadContent).filter(Boolean).join(', ')
                      : '-';

                    return (
                      <div key={`${item.id}-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                        <div className="font-semibold text-slate-900">#{index + 1}</div>
                        <div>Muatan: {cargoLabel}</div>
                        <div>QTY: {cargoItems.length ? cargoItems.map((cargoItem) => cargoItem.qty).filter((qty) => qty > 0).join(', ') || item.qty || '-' : item.qty || '-'}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                '-'
              )
            }
          />
          <DetailField label="QTY" value={orderTarifs[0]?.qty ? `${orderTarifs[0].qty} PCS` : '-'} />
        </div>
      </SectionCard>

      <SectionCard title="Detail Order">
        <div className="grid gap-6 md:grid-cols-2">
          <DetailField label="Loading In" value={orderTarifs[0]?.loadingIn || data.loadingIn || '-'} />
          <DetailField label="Tujuan Kirim" value={orderTarifs[0]?.deliveryDestination || '-'} />
          <DetailField label="Loading Out" value={orderTarifs[0]?.loadingOut || data.loadingOut || '-'} />
          <DetailField label="Tipe Armada" value={getOrderVehicleTypeLabel(data, orderTarifs[0])} />
        </div>
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
