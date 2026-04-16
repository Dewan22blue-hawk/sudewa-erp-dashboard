import React from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { VendorFormData } from './VendorFormModal';
import type { Vendor } from '@/@types/vendor.types';

interface EditVendorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: VendorFormData) => void;
    initialData: Vendor | null;
}

export function EditVendorModal({ isOpen, onClose, onSave, initialData }: EditVendorModalProps) {
    if (!initialData) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Data Vendor</DialogTitle>
                    <DialogDescription>
                        Edit data vendor baru
                    </DialogDescription>
                </DialogHeader>
                
                <EditVendorInnerForm 
                    initialData={initialData} 
                    onClose={onClose} 
                    onSave={onSave} 
                />
            </DialogContent>
        </Dialog>
    );
}

interface InnerProps {
    initialData: Vendor;
    onClose: () => void;
    onSave: (data: VendorFormData) => void;
}

function EditVendorInnerForm({ initialData, onClose, onSave }: InnerProps) {
    const { register, handleSubmit, formState: { errors } } = useForm<VendorFormData>({
        defaultValues: {
            name: initialData.name || '',
            address: initialData.address || '',
            picName: initialData.picName || '',
            phone: initialData.phone || ''
        }
    });

    const onSubmit = (data: VendorFormData) => {
        onSave(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-gray-900 font-medium">Nama Dealer</Label>
                <Input
                    id="edit-name"
                    placeholder="Masukkan nama dealer"
                    {...register('name', { required: 'Nama Vendor wajib diisi' })}
                    className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="edit-address" className="text-gray-900 font-medium">Alamat</Label>
                <Textarea
                    id="edit-address"
                    placeholder="Masukkan alamat"
                    rows={3}
                    {...register('address', { required: 'Alamat wajib diisi' })}
                    className={errors.address ? 'border-red-500 resize-none' : 'resize-none'}
                />
                {errors.address && <p className="text-red-500 text-xs">{errors.address.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="edit-picName" className="text-gray-900 font-medium">PIC</Label>
                <Input
                    id="edit-picName"
                    placeholder="Masukkan PIC"
                    {...register('picName', { required: 'PIC wajib diisi' })}
                    className={errors.picName ? 'border-red-500' : ''}
                />
                {errors.picName && <p className="text-red-500 text-xs">{errors.picName.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="edit-phone" className="text-gray-900 font-medium">Handphone</Label>
                <Input
                    id="edit-phone"
                    placeholder="Masukkan nomor handphone"
                    {...register('phone', { required: 'Nomor Handphone wajib diisi' })}
                    className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
            </div>

            <div className="flex flex-col space-y-2 pt-4">
                <Button type="submit" className="w-full bg-[#1e3a5f] hover:bg-[#152e4d]">Simpan</Button>
                <Button type="button" variant="outline" className="w-full" onClick={onClose}>Batal</Button>
            </div>
        </form>
    );
}
