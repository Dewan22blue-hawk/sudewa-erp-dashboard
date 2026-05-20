import React from 'react';
import { format } from 'date-fns';
import type { DoEkspedisi } from '@/@types/do-ekspedisi.types';

interface DOEkspedisiDetailCardProps {
  data: DoEkspedisi;
}

function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-slate-700">{label}</p>
      <div className="text-[16px] font-semibold text-slate-950">{value || '-'}</div>
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
          <DetailField label="Loading In" value={order?.loadingIn || firstItem?.loadingIn || '-'} />
          <DetailField label="Loading Out" value={order?.loadingOut || firstItem?.loadingOut || '-'} />
          <DetailField label="Tujuan Kirim" value={order?.destination || firstItem?.destination || '-'} />
          <DetailField label="Muatan" value={order?.loadContent || '-'} />
          <DetailField label="QTY" value={order?.qty || '-'} />
        </div>
      </Section>
    </div>
  );
}
