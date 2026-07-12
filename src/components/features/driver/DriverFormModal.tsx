import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Driver, DriverPayload } from '@/@types/driver.types';

export interface DriverFormData {
  name: string;
  address: string;
  phone: string;
  npwp: string;
  picName: string;
  identityNumber: string;
  driveLicenseNumber: string;
  mapLink: string;
  socialMedia1Link: string;
  socialMedia2Link: string;
  socialMedia3Link: string;
  socialMedia4Link: string;
  websiteLink: string;
  joinDate: string;
  image: FileList | null;
}

interface DriverFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: DriverPayload) => void;
  initialData?: Driver | null;
  isSubmitting?: boolean;
  companyId?: string | number;
  userId?: string | number;
}

const emptyValues: Omit<DriverFormData, 'image'> & { image: null } = {
  name: '',
  address: '',
  phone: '',
  npwp: '',
  picName: '',
  identityNumber: '',
  driveLicenseNumber: '',
  mapLink: '',
  socialMedia1Link: '',
  socialMedia2Link: '',
  socialMedia3Link: '',
  socialMedia4Link: '',
  websiteLink: '',
  joinDate: '',
  image: null,
};

export function DriverFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  isSubmitting = false,
  companyId,
  userId,
}: DriverFormModalProps) {
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DriverFormData>({ defaultValues: emptyValues });

  useEffect(() => {
    if (isOpen && initialData) {
      reset({
        name: initialData.name || '',
        address: initialData.address || '',
        phone: initialData.phone || '',
        npwp: initialData.npwp || '',
        picName: initialData.picName || '',
        identityNumber: initialData.identityNumber || '',
        driveLicenseNumber: initialData.driveLicenseNumber || '',
        mapLink: initialData.mapLink || '',
        socialMedia1Link: initialData.socialMedia1Link || '',
        socialMedia2Link: initialData.socialMedia2Link || '',
        socialMedia3Link: initialData.socialMedia3Link || '',
        socialMedia4Link: initialData.socialMedia4Link || '',
        websiteLink: initialData.websiteLink || '',
        joinDate: initialData.joinedAt ? initialData.joinedAt.substring(0, 10) : '',
        image: null,
      });
    } else if (!isOpen) {
      reset(emptyValues);
    }
  }, [isOpen, initialData, reset]);

  const onSubmit = (data: DriverFormData) => {
    onSave({
      company_id: companyId,
      user_id: userId,
      name: data.name,
      address: data.address || undefined,
      phone: data.phone || undefined,
      npwp: data.npwp || undefined,
      pic_name: data.picName || undefined,
      identity_number: data.identityNumber || undefined,
      drive_license_identity_number: data.driveLicenseNumber || undefined,
      map_link: data.mapLink || undefined,
      social_media_1_link: data.socialMedia1Link || undefined,
      social_media_2_link: data.socialMedia2Link || undefined,
      social_media_3_link: data.socialMedia3Link || undefined,
      social_media_4_link: data.socialMedia4Link || undefined,
      website_link: data.websiteLink || undefined,
      join_date: data.joinDate || undefined,
      image: data.image?.[0] ?? null,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md sm:max-w-[425px] max-h-[90vh] overflow-hidden flex flex-col rounded-2xl border-0 bg-white p-0 shadow-2xl">
        <DialogHeader className="px-6 py-5 border-b shrink-0 text-left">
          <DialogTitle className="text-[18px] font-semibold text-[#171717]">{isEdit ? 'Edit Data Driver' : 'Tambah Data Driver'}</DialogTitle>
          <DialogDescription className="text-[15px] text-[#71717A]">
            {isEdit ? 'Perbarui detail driver' : 'Masukkan detail driver baru'}
          </DialogDescription>
        </DialogHeader>

        {isOpen && (
          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {/* Nama Driver */}
              <div className="space-y-1.5">
                <Label htmlFor="driver-name">Nama Driver</Label>
                <Input
                  id="driver-name"
                  placeholder="Tambahkan nama driver"
                  {...register('name', { required: 'Nama Driver wajib diisi', maxLength: { value: 249, message: 'Maks 249 karakter' } })}
                  className={errors.name ? 'border-red-500' : ''}
                  disabled={isSubmitting}
                />
                {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
              </div>

              {/* Alamat */}
              <div className="space-y-1.5">
                <Label htmlFor="driver-address">Alamat</Label>
                <Textarea id="driver-address" placeholder="Tambahkan alamat" {...register('address')} className="resize-none" rows={3} disabled={isSubmitting} />
              </div>

              {/* KTP */}
              <div className="space-y-1.5">
                <Label htmlFor="driver-ktp">KTP</Label>
                <Input id="driver-ktp" placeholder="Tambahkan nomor KTP" {...register('identityNumber')} disabled={isSubmitting} />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="driver-phone">Phone</Label>
                <Input id="driver-phone" placeholder="Tambahkan nomor telepon" {...register('phone')} disabled={isSubmitting} />
              </div>

              {/* Nomor SIM */}
              <div className="space-y-1.5">
                <Label htmlFor="driver-sim">Nomor SIM</Label>
                <Input id="driver-sim" placeholder="Tambahkan nomor SIM" {...register('driveLicenseNumber')} disabled={isSubmitting} />
              </div>

              {/* Tgl. Gabung */}
              <div className="space-y-1.5">
                <Label htmlFor="driver-join-date">Tgl. Gabung</Label>
                <Input id="driver-join-date" type="date" {...register('joinDate')} disabled={isSubmitting} />
              </div>
            </div>

            <div className="shrink-0 flex gap-3 px-6 py-4 border-t bg-gray-50">
              <Button type="button" variant="outline" className="flex-1 h-11 rounded-xl border-[#D4D4D8] text-[15px] text-[#171717]" onClick={onClose} disabled={isSubmitting}>
                Batal
              </Button>
              <Button type="submit" className="flex-1 h-11 rounded-xl bg-[#1F3B5B] text-[15px] font-medium text-white hover:bg-[#19314b]" disabled={isSubmitting}>
                {isSubmitting ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
