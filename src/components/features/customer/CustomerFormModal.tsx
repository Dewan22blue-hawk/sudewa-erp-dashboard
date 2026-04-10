import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import RequiredMark from '@/components/ui/required-mark';

export interface CustomerFormData {
    namaDealer: string;
    namaCustomer: string;
    pic: string;
    alamat: string;
    phone: string;
    maps: string;
}

interface CustomerFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: CustomerFormData) => void;
    initialData?: CustomerFormData | null;
}

export function CustomerFormModal({ isOpen, onClose, onSave, initialData }: CustomerFormModalProps) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<CustomerFormData>({
        defaultValues: {
            namaDealer: '',
            namaCustomer: '',
            pic: '',
            alamat: '',
            phone: '',
            maps: ''
        },
        values: initialData || { namaDealer: '', namaCustomer: '', pic: '', alamat: '', phone: '', maps: '' }
    });

    useEffect(() => {
        if (!isOpen) {
            reset({ namaDealer: '', namaCustomer: '', pic: '', alamat: '', phone: '', maps: '' });
        }
    }, [isOpen, reset]);

    const onSubmit = (data: CustomerFormData) => {
        onSave(data);
    };

    const isEdit = !!initialData;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Data Customer' : 'Tambah Data Customer'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Edit data customer baru' : 'Masukkan data customer baru'}
                    </DialogDescription>
                </DialogHeader>
                {isOpen && (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4 max-h-[70vh] overflow-y-auto px-1">
                        <div className="space-y-2">
                            <Label htmlFor="namaDealer">Nama Dealer<RequiredMark /></Label>
                            <Input
                                id="namaDealer"
                                placeholder="Tambahkan nama dealer"
                                {...register('namaDealer', { required: 'Nama Dealer wajib diisi' })}
                                className={errors.namaDealer ? 'border-red-500' : ''}
                            />
                            {errors.namaDealer && <p className="text-red-500 text-xs">{errors.namaDealer.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="namaCustomer">Nama Customer<RequiredMark /></Label>
                            <Input
                                id="namaCustomer"
                                placeholder="Tambahkan nama customer"
                                {...register('namaCustomer', { required: 'Nama Customer wajib diisi' })}
                                className={errors.namaCustomer ? 'border-red-500' : ''}
                            />
                            {errors.namaCustomer && <p className="text-red-500 text-xs">{errors.namaCustomer.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="pic">PIC<RequiredMark /></Label>
                            <Input
                                id="pic"
                                placeholder="Tambahkan PIC"
                                {...register('pic', { required: 'PIC wajib diisi' })}
                                className={errors.pic ? 'border-red-500' : ''}
                            />
                            {errors.pic && <p className="text-red-500 text-xs">{errors.pic.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="alamat">Alamat<RequiredMark /></Label>
                            <Textarea
                                id="alamat"
                                placeholder="Tambahkan Alamat"
                                {...register('alamat', { required: 'Alamat wajib diisi' })}
                                className={errors.alamat ? 'border-red-500 resize-none' : 'resize-none'}
                                rows={3}
                            />
                            {errors.alamat && <p className="text-red-500 text-xs">{errors.alamat.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone<RequiredMark /></Label>
                            <Input
                                id="phone"
                                placeholder="Tambahkan nomer telepon"
                                {...register('phone', { required: 'Phone wajib diisi' })}
                                className={errors.phone ? 'border-red-500' : ''}
                            />
                            {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="maps">Maps<RequiredMark /></Label>
                            <Input
                                id="maps"
                                placeholder="Tambahkan link maps"
                                {...register('maps', { required: 'Maps wajib diisi' })}
                                className={errors.maps ? 'border-red-500' : ''}
                            />
                            {errors.maps && <p className="text-red-500 text-xs">{errors.maps.message}</p>}
                        </div>

                        <div className="flex flex-col space-y-2 pt-4">
                            <Button type="submit" className="w-full bg-[#1e3a5f] hover:bg-[#152e4d]">Simpan</Button>
                            <Button type="button" variant="outline" className="w-full" onClick={onClose}>Batal</Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
