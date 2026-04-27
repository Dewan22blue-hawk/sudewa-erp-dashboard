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
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">{isEdit ? 'Edit Data Driver' : 'Tambah Data Driver'}</DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            {isEdit ? 'Perbarui detail driver' : 'Masukkan detail driver baru'}
          </DialogDescription>
        </DialogHeader>

        {isOpen && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2 max-h-[75vh] overflow-y-auto px-1">
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="driver-pic">PIC</Label>
                <Input id="driver-pic" placeholder="Tambahkan PIC" {...register('picName')} disabled={isSubmitting} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="driver-phone">Phone</Label>
                <Input id="driver-phone" placeholder="Tambahkan nomor telepon" {...register('phone')} disabled={isSubmitting} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="driver-address">Alamat</Label>
              <Textarea id="driver-address" placeholder="Tambahkan alamat" {...register('address')} className="resize-none" rows={3} disabled={isSubmitting} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="driver-npwp">NPWP</Label>
                <Input id="driver-npwp" placeholder="Tambahkan NPWP" {...register('npwp')} disabled={isSubmitting} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="driver-ktp">Identity Number</Label>
                <Input id="driver-ktp" placeholder="Tambahkan nomor KTP" {...register('identityNumber')} disabled={isSubmitting} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="driver-sim">Drive License Identity Number</Label>
                <Input id="driver-sim" placeholder="Tambahkan nomor SIM" {...register('driveLicenseNumber')} disabled={isSubmitting} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="driver-join-date">Join Date</Label>
                <Input id="driver-join-date" type="date" {...register('joinDate')} disabled={isSubmitting} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="driver-map-link">Maps</Label>
              <Input id="driver-map-link" placeholder="Tambahkan link maps" {...register('mapLink')} disabled={isSubmitting} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="driver-social-1">Social Media 1</Label>
                <Input id="driver-social-1" placeholder="https://..." {...register('socialMedia1Link')} disabled={isSubmitting} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="driver-social-2">Social Media 2</Label>
                <Input id="driver-social-2" placeholder="https://..." {...register('socialMedia2Link')} disabled={isSubmitting} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="driver-social-3">Social Media 3</Label>
                <Input id="driver-social-3" placeholder="https://..." {...register('socialMedia3Link')} disabled={isSubmitting} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="driver-social-4">Social Media 4</Label>
                <Input id="driver-social-4" placeholder="https://..." {...register('socialMedia4Link')} disabled={isSubmitting} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="driver-website">Website</Label>
              <Input id="driver-website" placeholder="https://www.example.com" {...register('websiteLink')} disabled={isSubmitting} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="driver-image">Image</Label>
              <Input id="driver-image" type="file" accept="image/*" {...register('image')} disabled={isSubmitting} />
            </div>

            <div className="flex flex-col gap-2 pt-2 pb-1">
              <Button type="submit" className="w-full bg-[#1e3a5f] hover:bg-[#152e4d]" disabled={isSubmitting}>
                {isSubmitting ? 'Menyimpan...' : 'Simpan'}
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={onClose} disabled={isSubmitting}>
                Batal
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
