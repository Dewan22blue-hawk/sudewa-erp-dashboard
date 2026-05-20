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
  getPrimaryTarifItem,
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
  const primaryTarif = getPrimaryTarifItem(data);

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
          <DetailField label="Muatan" value={primaryTarif?.loadContent || '-'} />
          <DetailField label="QTY" value={primaryTarif?.qty ? `${primaryTarif.qty} PCS` : '-'} />
        </div>
      </SectionCard>

      <SectionCard title="Detail Order">
        <div className="grid gap-6 md:grid-cols-2">
          <DetailField label="Loading In" value={primaryTarif?.loadingIn || data.loadingIn || '-'} />
          <DetailField label="Tujuan Kirim" value={primaryTarif?.deliveryDestination || '-'} />
          <DetailField label="Loading Out" value={primaryTarif?.loadingOut || data.loadingOut || '-'} />
          <DetailField label="Tipe Armada" value={getOrderVehicleTypeLabel(data, primaryTarif)} />
        </div>
      </SectionCard>

      <SectionCard title="Keuangan">
        <div className="grid gap-6 md:grid-cols-3">
          <DetailField label="UJ Driver" value={formatOrderCurrency(primaryTarif?.driverFee || data.ujDriver)} />
          <DetailField label="Invoice Ekspedisi" value={formatOrderCurrency(primaryTarif?.expeditionInvoice || data.billInvoice)} />
          <DetailField label="PPN" value={formatOrderCurrency(data.ppn)} />
        </div>
      </SectionCard>

      <SectionCard title="Status Order">
        <div className="flex flex-col gap-3">
          <DetailField
            label="Status pengiriman"
            value={
              <Badge variant="outline" className={cn('rounded-full px-3 py-1 text-sm font-medium', getOrderStatusBadgeClassName(data.status))}>
                {getOrderStatusLabel(data.status)}
              </Badge>
            }
          />
          <DetailField label="Catatan" value={data.note || '-'} />
        </div>
      </SectionCard>

      {data.tarifs.length > 1 ? (
        <SectionCard title="Order List Tarif">
          <div className="space-y-4">
            {data.tarifs.map((item, index) => (
              <div key={item.id || `${item.tarifId}-${index}`} className="rounded-2xl border border-slate-200 px-4 py-4">
                <div className="mb-4 text-sm font-semibold text-slate-900">Item Tarif #{index + 1}</div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <DetailField label="Loading In" value={item.loadingIn || '-'} />
                  <DetailField label="Loading Out" value={item.loadingOut || '-'} />
                  <DetailField label="Tujuan Kirim" value={item.deliveryDestination || '-'} />
                  <DetailField label="Tipe Armada" value={getOrderVehicleTypeLabel(data, item)} />
                  <DetailField label="Muatan" value={item.loadContent || '-'} />
                  <DetailField label="QTY" value={item.qty || '-'} />
                  <DetailField label="UJ Driver" value={formatOrderCurrency(item.driverFee)} />
                  <DetailField label="Invoice" value={formatOrderCurrency(item.expeditionInvoice)} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      ) : null}
    </div>
  );
}
