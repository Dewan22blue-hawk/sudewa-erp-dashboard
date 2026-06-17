import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils/currency';
import type { WithholdingTaxReport, UpdateWithholdingTaxReportPayload } from '@/@types/laporan-bukti-potong.types';

const schema = z.object({
  no_bukpot: z.string().min(1, 'Nomor Bukti Potong harus diisi'),
  masa_bukpot: z.string().min(1, 'Masa Bukti Potong harus diisi'),
  pph: z.union([z.string(), z.number()]).transform((v) => Number(v)),
  uang_muka_pph: z.string().min(1, 'Uang Muka PPH harus diisi'),
  jumlah_pembayaran: z.union([z.string(), z.number()]).transform((v) => Number(v)),
  tgl_dibayar: z.string().min(1, 'Tanggal Dibayar harus diisi'),
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

interface Props {
  initialData: WithholdingTaxReport;
  onSubmit: (data: UpdateWithholdingTaxReportPayload) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function LaporanBuktiPotongForm({ initialData, onSubmit, onCancel, isSubmitting }: Props) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormInput, any, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      no_bukpot: initialData.no_bukpot,
      masa_bukpot: String(initialData.masa_bukpot),
      pph: initialData.pph,
      uang_muka_pph: initialData.uang_muka_pph,
      jumlah_pembayaran: initialData.jumlah_pembayaran,
      tgl_dibayar: initialData.tgl_dibayar,
    },
  });

  useEffect(() => {
    reset({
      no_bukpot: initialData.no_bukpot,
      masa_bukpot: String(initialData.masa_bukpot),
      pph: initialData.pph,
      uang_muka_pph: initialData.uang_muka_pph,
      jumlah_pembayaran: initialData.jumlah_pembayaran,
      tgl_dibayar: initialData.tgl_dibayar,
    });
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-8 rounded-[22px] border border-slate-200">
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900 border-b pb-4">Informasi Invoice</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Tanggal</label>
            <Input value={initialData.tgl_invoice} readOnly className="bg-slate-50 cursor-not-allowed h-11" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Customer</label>
            <Input value={initialData.nama_customer} readOnly className="bg-slate-50 cursor-not-allowed h-11" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">No Invoice</label>
            <Input value={initialData.no_invoice} readOnly className="bg-slate-50 cursor-not-allowed h-11" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Nominal Invoice</label>
            <Input value={formatCurrency(initialData.nominal_invoice)} readOnly className="bg-slate-50 cursor-not-allowed h-11" />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900 border-b pb-4">Detail Bukti Potong</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Nomor Bukti Potong</label>
            <Input {...register('no_bukpot')} placeholder="Masukkan nomor bukti potong" className="h-11" />
            {errors.no_bukpot && <p className="text-xs text-red-500">{errors.no_bukpot.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Masa Bukti Potong</label>
            <Input {...register('masa_bukpot')} placeholder="Misal: 1" className="h-11" />
            {errors.masa_bukpot && <p className="text-xs text-red-500">{errors.masa_bukpot.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">PPH</label>
            <Input {...register('pph')} type="number" placeholder="Rp" className="h-11" />
            {errors.pph && <p className="text-xs text-red-500">{errors.pph.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Uang Muka PPH</label>
            <Input {...register('uang_muka_pph')} placeholder="Misal: Dari Bukti Potong" className="h-11" />
            {errors.uang_muka_pph && <p className="text-xs text-red-500">{errors.uang_muka_pph.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Jumlah Pembayaran</label>
            <Input {...register('jumlah_pembayaran')} type="number" placeholder="Rp" className="h-11" />
            {errors.jumlah_pembayaran && <p className="text-xs text-red-500">{errors.jumlah_pembayaran.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Tanggal Dibayar</label>
            <Input {...register('tgl_dibayar')} type="date" className="h-11" />
            {errors.tgl_dibayar && <p className="text-xs text-red-500">{errors.tgl_dibayar.message}</p>}
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center gap-4 pt-6 mt-8">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting} className="w-[140px] h-11 text-base font-semibold">
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting} className="w-[140px] h-11 text-base font-semibold bg-[#1f4163] hover:bg-[#183552]">
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {isSubmitting ? 'Menyimpan' : 'Simpan'}
        </Button>
      </div>
    </form>
  );
}
