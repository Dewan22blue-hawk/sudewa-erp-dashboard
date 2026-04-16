import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export interface VendorFormData {
    name: string;
    address: string;
    picName: string;
    phone: string;
}

interface VendorFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: VendorFormData) => void;
}

export function VendorFormModal({ isOpen, onClose, onSave }: VendorFormModalProps) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<VendorFormData>({
        defaultValues: {
            name: '',
            address: '',
            picName: '',
            phone: ''
        }
    });

    useEffect(() => {
        if (!isOpen) {
            reset({ name: '', address: '', picName: '', phone: '' });
        }
    }, [isOpen, reset]);

    const onSubmit = (data: VendorFormData) => {
        onSave(data);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Tambah Data Vendor</DialogTitle>
                    <DialogDescription>
                        Masukkan detail vendor baru
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-gray-900 font-medium">Nama Vendor</Label>
                            <Input
                                id="name"
                                placeholder="Masukkan nama vendor"
                                {...register('name', { required: 'Nama Vendor wajib diisi' })}
                                className={errors.name ? 'border-red-500' : ''}
                            />
                            {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address" className="text-gray-900 font-medium">Alamat</Label>
                            <Textarea
                                id="address"
                                placeholder="Masukkan alamat"
                                rows={3}
                                {...register('address', { required: 'Alamat wajib diisi' })}
                                className={errors.address ? 'border-red-500 resize-none' : 'resize-none'}
                            />
                            {errors.address && <p className="text-red-500 text-xs">{errors.address.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="picName" className="text-gray-900 font-medium">PIC</Label>
                            <Input
                                id="picName"
                                placeholder="Masukkan PIC"
                                {...register('picName', { required: 'PIC wajib diisi' })}
                                className={errors.picName ? 'border-red-500' : ''}
                            />
                            {errors.picName && <p className="text-red-500 text-xs">{errors.picName.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-gray-900 font-medium">Handphone</Label>
                            <Input
                                id="phone"
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
            </DialogContent>
        </Dialog>
    );
}
