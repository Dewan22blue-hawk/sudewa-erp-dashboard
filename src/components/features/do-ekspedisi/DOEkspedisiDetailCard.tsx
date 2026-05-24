import React from 'react';
import { format } from 'date-fns';
import type { DoEkspedisi, DoEkspedisiOrderTarifItem } from '@/@types/do-ekspedisi.types';

interface DOEkspedisiDetailCardProps {
  data: DoEkspedisi;
}

function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-slate-700">{label}</p>
      <div className="text-[16px] font-semibold text-slate-950">{value ?? '-'}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="bg-[#eef3f8] px-6 py-4">
        <h2 className="text-[18px] font-semibold text-slate-950">{title}</h2>
      </div>
      <div className="px-6 py-6">{children}</div>
    </section>
  );
}

export function DOEkspedisiDetailCard({ data }: DOEkspedisiDetailCardProps) {
  const firstItem = data.items?.[0];
  const order = data.orderList;
  const orderDetails = React.useMemo<DoEkspedisiOrderTarifItem[]>(
    () =>
      order?.tarifs && order.tarifs.length > 0
        ? order.tarifs
        : [
            {
              id: 0,
              loadingIn: order?.loadingIn || firstItem?.loadingIn || '-',
              loadingOut: order?.loadingOut || firstItem?.loadingOut || '-',
              deliveryDestination: order?.destination || firstItem?.destination || '-',
              loadContent: order?.loadContent || '-',
              qty: Number(order?.qty || 0),
              tarifItems: [],
            },
          ],
    [firstItem?.destination, firstItem?.loadingIn, firstItem?.loadingOut, order?.destination, order?.loadContent, order?.loadingIn, order?.loadingOut, order?.qty, order?.tarifs],
  );

  React.useEffect(() => {
    console.log('[DOEkspedisiDetailCard] detail data', data);
    console.log('[DOEkspedisiDetailCard] order list', order);
    console.log('[DOEkspedisiDetailCard] order details', orderDetails);
    console.log(
      '[DOEkspedisiDetailCard] muatan summary',
      orderDetails.map((item, index) => ({
        index,
        id: item.id,
        loadContent: item.loadContent,
        qty: item.qty,
        tarifItems: item.tarifItems,
      })),
    );
  }, [data, order, orderDetails]);

  return (
    <div className="space-y-6">
      <Section title="Detail Driver">
        <div className="grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-3">
          <DetailField label="Tanggal Pengiriman" value={data.date ? format(new Date(data.date), 'dd/MM/yyyy') : '-'} />
          <DetailField label="Kode DO" value={data.doCode || '-'} />
          <div />
          <DetailField label="Nama Driver" value={data.driver?.name || '-'} />
          <DetailField label="Tipe Armada" value={data.vehicle?.type || '-'} />
          <DetailField label="Nomor Polisi" value={data.vehicle?.registrationNumber || '-'} />
        </div>
      </Section>

      <Section title="Detail Order Customer">
        <div className="grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-3">
          <DetailField label="Nama Customer" value={order?.customerName || firstItem?.customerName || firstItem?.customer?.name || '-'} />
          <DetailField label="Kode Order" value={data.orderCode || order?.code || '-'} />
          <div />
        </div>

        <div className="mt-6 space-y-4">
          {orderDetails.map((item, index) => {
            const allTarifItems = item.tarifItems && item.tarifItems.length ? item.tarifItems : order?.tarifs?.find((t) => t.id === item.id)?.tarifItems ?? [];
            const muatanList = (allTarifItems ?? []).map((t) => t.loadContent).filter(Boolean);
            const muatanText = muatanList.length ? muatanList.join(', ') : item.loadContent || order?.loadContent || '-';

            return (
              <div key={`${item.id}-${index}`} className="rounded-lg border border-slate-200 px-4 py-4">
                <div className="mb-3 text-sm font-semibold text-slate-900">Detail Order #{index + 1}</div>
                {muatanList.length ? (
                  <div className="mb-3 rounded-md border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    Muatan: {muatanText}
                  </div>
                ) : null}
                <div className="grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-3">
                  <DetailField label="Loading In" value={item.loadingIn || '-'} />
                  <DetailField label="Loading Out" value={item.loadingOut || '-'} />
                  <DetailField label="Tujuan Kirim" value={item.deliveryDestination || '-'} />
                  <DetailField label="Muatan" value={muatanText} />
                  <DetailField label="QTY" value={item.qty || '-'} />
                </div>
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
