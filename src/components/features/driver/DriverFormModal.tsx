import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export interface DriverFormData {
    namaDriver: string;
    ktp: string;
    alamat: string;
    handphone: string;
    sim: string;
}

interface DriverFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: DriverFormData) => void;
    initialData?: DriverFormData | null;
}

export function DriverFormModal({ isOpen, onClose, onSave, initialData }: DriverFormModalProps) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<DriverFormData>({
        defaultValues: {
            namaDriver: '',
            ktp: '',
            alamat: '',
            handphone: '',
            sim: ''
        },
        values: initialData || { namaDriver: '', ktp: '', alamat: '', handphone: '', sim: '' }
    });

    useEffect(() => {
        if (!isOpen) {
            reset({ namaDriver: '', ktp: '', alamat: '', handphone: '', sim: '' });
        }
    }, [isOpen, reset]);

    const onSubmit = (data: DriverFormData) => {
        onSave(data);
    };

    const isEdit = !!initialData;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Data Driver' : 'Tambah Data Driver'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Masukkan detail driver baru' : 'Masukkan detail driver baru'}
                    </DialogDescription>
                </DialogHeader>
                {isOpen && (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4 max-h-[70vh] overflow-y-auto px-1">
                        <div className="space-y-2">
                            <Label htmlFor="namaDriver">Nama Driver</Label>
                            <Input
                                id="namaDriver"
                                placeholder="Tambahkan nama driver"
                                {...register('namaDriver', { required: 'Nama Driver wajib diisi' })}
                                className={errors.namaDriver ? 'border-red-500' : ''}
                            />
                            {errors.namaDriver && <p className="text-red-500 text-xs">{errors.namaDriver.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ktp">KTP</Label>
                            <Input
                                id="ktp"
                                placeholder="Tambahkan nomor ktp"
                                {...register('ktp', { required: 'KTP wajib diisi' })}
                                className={errors.ktp ? 'border-red-500' : ''}
                            />
                            {errors.ktp && <p className="text-red-500 text-xs">{errors.ktp.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="alamat">Alamat</Label>
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
                            <Label htmlFor="handphone">Phone</Label>
                            <Input
                                id="handphone"
                                placeholder="Tambahkan nomor telepon"
                                {...register('handphone', { required: 'Phone wajib diisi' })}
                                className={errors.handphone ? 'border-red-500' : ''}
                            />
                            {errors.handphone && <p className="text-red-500 text-xs">{errors.handphone.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sim">SIM</Label>
                            <Input
                                id="sim"
                                placeholder="Tambahkan nomor SIM"
                                {...register('sim', { required: 'SIM wajib diisi' })}
                                className={errors.sim ? 'border-red-500' : ''}
                            />
                            {errors.sim && <p className="text-red-500 text-xs">{errors.sim.message}</p>}
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
