import React from 'react';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { DoEkspedisi } from '@/@types/do-ekspedisi.types';

interface DOEkspedisiDetailCardProps {
  data: DoEkspedisi;
}

export function DOEkspedisiDetailCard({ data }: DOEkspedisiDetailCardProps) {
  return (
    <Card className="rounded-[20px] border border-[#E5E7EB] px-5 py-6 shadow-sm">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2">
          <Label>Tanggal</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              readOnly
              value={data.date ? format(new Date(data.date), 'dd MMMM yyyy') : '-'}
              className="h-11 rounded-xl border-[#E5E7EB] bg-white pl-10 text-slate-700"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Nomor Polisi</Label>
          <Input readOnly value={data.vehicle?.registrationNumber || '-'} className="h-11 rounded-xl border-[#E5E7EB] bg-white text-slate-700" />
        </div>

        <div className="space-y-2">
          <Label>Driver</Label>
          <Input readOnly value={data.driver?.name || '-'} className="h-11 rounded-xl border-[#E5E7EB] bg-white text-slate-700" />
        </div>

        <div className="space-y-2">
          <Label>Jenis Kendaraan</Label>
          <Input readOnly value={data.vehicle?.type || '-'} className="h-11 rounded-xl border-[#E5E7EB] bg-white text-slate-700" />
        </div>
      </div>
    </Card>
  );
}
