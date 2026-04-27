import React from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Armada, ArmadaPayload } from '@/@types/armada.types';

export interface ArmadaFormData {
  registrationNumber: string;
  type: string;
  machineNumber: string;
  chassisNumber: string;
  stnkAge: string;
  kirAge: string;
  stnkNumber: string;
  kirBook: string;
  equipmentText: string;
}

interface ArmadaFormProps {
  initialData?: Armada;
  title: string;
  onSubmit: (data: ArmadaPayload) => void | Promise<void>;
  isSubmitting?: boolean;
}

const toInputDate = (value?: string | null) => (value ? value.substring(0, 10) : '');

const defaultValues: ArmadaFormData = {
  registrationNumber: '',
  type: '',
  machineNumber: '',
  chassisNumber: '',
  stnkAge: '',
  kirAge: '',
  stnkNumber: '',
  kirBook: '',
  equipmentText: '',
};

export function ArmadaForm({ initialData, title, onSubmit, isSubmitting = false }: ArmadaFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ArmadaFormData>({
    defaultValues: initialData
      ? {
          registrationNumber: initialData.registrationNumber,
          type: initialData.type,
          machineNumber: initialData.machineNumber,
          chassisNumber: initialData.chassisNumber,
          stnkAge: toInputDate(initialData.stnkAge),
          kirAge: toInputDate(initialData.kirAge),
          stnkNumber: initialData.stnkNumber ?? '',
          kirBook: initialData.kirBook ?? '',
          equipmentText: initialData.equipment.join(', '),
        }
      : defaultValues,
  });

  const submitForm = (data: ArmadaFormData) => {
    const equipment = data.equipmentText
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    onSubmit({
      registration_number: data.registrationNumber,
      type: data.type,
      machine_number: data.machineNumber,
      chassis_number: data.chassisNumber,
      stnk_age: data.stnkAge || null,
      kir_age: data.kirAge || null,
      stnk_number: data.stnkNumber || null,
      kir_book: data.kirBook || null,
      equipment,
    });
  };

  return (
    <form onSubmit={handleSubmit(submitForm)} className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-6 border-b pb-4 text-lg font-semibold text-gray-900">{title}</h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="registrationNumber">Nomor Polisi</Label>
            <Input
              id="registrationNumber"
              placeholder="Tambah nomor polisi"
              {...register('registrationNumber', { required: 'Nomor polisi wajib diisi', maxLength: { value: 249, message: 'Maks 249 karakter' } })}
              className={errors.registrationNumber ? 'border-red-500' : ''}
            />
            {errors.registrationNumber && <p className="text-xs text-red-500">{errors.registrationNumber.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipe</Label>
            <Input
              id="type"
              placeholder="Tambah tipe armada"
              {...register('type', { required: 'Tipe wajib diisi', maxLength: { value: 249, message: 'Maks 249 karakter' } })}
              className={errors.type ? 'border-red-500' : ''}
            />
            {errors.type && <p className="text-xs text-red-500">{errors.type.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="machineNumber">Nomor Mesin</Label>
            <Input
              id="machineNumber"
              placeholder="Tambah nomor mesin"
              {...register('machineNumber', { required: 'Nomor mesin wajib diisi', maxLength: { value: 249, message: 'Maks 249 karakter' } })}
              className={errors.machineNumber ? 'border-red-500' : ''}
            />
            {errors.machineNumber && <p className="text-xs text-red-500">{errors.machineNumber.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="chassisNumber">Nomor Rangka</Label>
            <Input
              id="chassisNumber"
              placeholder="Tambah nomor rangka"
              {...register('chassisNumber', { required: 'Nomor rangka wajib diisi', maxLength: { value: 249, message: 'Maks 249 karakter' } })}
              className={errors.chassisNumber ? 'border-red-500' : ''}
            />
            {errors.chassisNumber && <p className="text-xs text-red-500">{errors.chassisNumber.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="stnkAge">Masa STNK</Label>
            <Input id="stnkAge" type="date" {...register('stnkAge')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="kirAge">Masa KIR</Label>
            <Input id="kirAge" type="date" {...register('kirAge')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stnkNumber">Nomor STNK</Label>
            <Input id="stnkNumber" placeholder="Tambah nomor STNK" {...register('stnkNumber', { maxLength: { value: 249, message: 'Maks 249 karakter' } })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="kirBook">Buku KIR</Label>
            <Input id="kirBook" placeholder="Tambah buku KIR" {...register('kirBook', { maxLength: { value: 249, message: 'Maks 249 karakter' } })} />
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <Label htmlFor="equipmentText">Perlengkapan</Label>
          <Textarea
            id="equipmentText"
            rows={4}
            placeholder="Pisahkan tiap perlengkapan dengan koma. Contoh: dongkrak, toolkit, ban serep"
            {...register('equipmentText')}
            className="resize-none"
          />
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 pb-8 pt-2">
        <Button type="button" variant="outline" className="w-[120px]" onClick={() => router.back()} disabled={isSubmitting}>
          Batal
        </Button>
        <Button type="submit" className="w-[120px] bg-[#1e3a5f] hover:bg-[#152e4d]" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </div>
    </form>
  );
}
