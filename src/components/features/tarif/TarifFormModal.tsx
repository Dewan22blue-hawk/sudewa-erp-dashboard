import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface TarifFormData {
    namaDealer: string;
    provinsi: string;
    tujuan: string;
    jarak: string;
    day: number;
    invCdd: number;
    invFuso: number;
    ujCdd: number;
    ujFuso: number;
}

interface TarifFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: TarifFormData) => void;
    initialData?: TarifFormData | null;
}

export function TarifFormModal({ isOpen, onClose, onSave, initialData }: TarifFormModalProps) {
    const { register, handleSubmit, reset, control, formState: { errors } } = useForm<TarifFormData>({
        defaultValues: {
            namaDealer: '',
            provinsi: '',
            tujuan: '',
            jarak: '',
            day: 1,
            invCdd: 0,
            invFuso: 0,
            ujCdd: 0,
            ujFuso: 0
        },
        values: initialData || { namaDealer: '', provinsi: '', tujuan: '', jarak: '', day: 1, invCdd: 0, invFuso: 0, ujCdd: 0, ujFuso: 0 }
    });

    useEffect(() => {
        if (!isOpen) {
            reset({ namaDealer: '', provinsi: '', tujuan: '', jarak: '', day: 1, invCdd: 0, invFuso: 0, ujCdd: 0, ujFuso: 0 });
        }
    }, [isOpen, reset]);

    const onSubmit = (data: TarifFormData) => {
        // Ensure numeric fields are actually numbers when saving
        onSave({
            ...data,
            day: Number(data.day),
            invCdd: Number(data.invCdd),
            invFuso: Number(data.invFuso),
            ujCdd: Number(data.ujCdd),
            ujFuso: Number(data.ujFuso)
        });
    };

    const isEdit = !!initialData;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Data Tarif' : 'Tambah Data Tarif'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Edit detail tarif' : 'Masukkan detail tarif baru'}
                    </DialogDescription>
                </DialogHeader>
                {isOpen && (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4 max-h-[70vh] overflow-y-auto px-1">
                        <div className="space-y-2">
                            <Label htmlFor="namaDealer">Nama Dealer</Label>
                            <Input
                                id="namaDealer"
                                placeholder="Tambahkan nama dealer"
                                {...register('namaDealer', { required: 'Nama Dealer wajib diisi' })}
                                className={errors.namaDealer ? 'border-red-500' : ''}
                            />
                            {errors.namaDealer && <p className="text-red-500 text-xs">{errors.namaDealer.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="provinsi">Provinsi</Label>
                            <Input
                                id="provinsi"
                                placeholder="Tambahkan provinsi"
                                {...register('provinsi', { required: 'Provinsi wajib diisi' })}
                                className={errors.provinsi ? 'border-red-500' : ''}
                            />
                            {errors.provinsi && <p className="text-red-500 text-xs">{errors.provinsi.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tujuan">Tujuan</Label>
                            <Input
                                id="tujuan"
                                placeholder="Tambahkan tujuan"
                                {...register('tujuan', { required: 'Tujuan wajib diisi' })}
                                className={errors.tujuan ? 'border-red-500' : ''}
                            />
                            {errors.tujuan && <p className="text-red-500 text-xs">{errors.tujuan.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="jarak">Jarak (km)</Label>
                                <Input
                                    id="jarak"
                                    placeholder="e.g. 100 km"
                                    {...register('jarak', { required: 'Jarak wajib diisi' })}
                                    className={errors.jarak ? 'border-red-500' : ''}
                                />
                                {errors.jarak && <p className="text-red-500 text-xs">{errors.jarak.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="day">Day</Label>
                                <Input
                                    id="day"
                                    type="number"
                                    placeholder="Hari"
                                    {...register('day', { required: 'Day wajib diisi', valueAsNumber: true, min: 1 })}
                                    className={errors.day ? 'border-red-500' : ''}
                                />
                                {errors.day && <p className="text-red-500 text-xs">{errors.day.message}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="invCdd">INV CDD (Rp)</Label>
                                <Input
                                    id="invCdd"
                                    type="number"
                                    placeholder="0"
                                    {...register('invCdd', { required: 'Wajib diisi', valueAsNumber: true, min: 0 })}
                                    className={errors.invCdd ? 'border-red-500' : ''}
                                />
                                {errors.invCdd && <p className="text-red-500 text-xs">{errors.invCdd.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="invFuso">INV Fuso (Rp)</Label>
                                <Input
                                    id="invFuso"
                                    type="number"
                                    placeholder="0"
                                    {...register('invFuso', { required: 'Wajib diisi', valueAsNumber: true, min: 0 })}
                                    className={errors.invFuso ? 'border-red-500' : ''}
                                />
                                {errors.invFuso && <p className="text-red-500 text-xs">{errors.invFuso.message}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="ujCdd">UJ CDD (Rp)</Label>
                                <Input
                                    id="ujCdd"
                                    type="number"
                                    placeholder="0"
                                    {...register('ujCdd', { required: 'Wajib diisi', valueAsNumber: true, min: 0 })}
                                    className={errors.ujCdd ? 'border-red-500' : ''}
                                />
                                {errors.ujCdd && <p className="text-red-500 text-xs">{errors.ujCdd.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ujFuso">UJ Fuso (Rp)</Label>
                                <Input
                                    id="ujFuso"
                                    type="number"
                                    placeholder="0"
                                    {...register('ujFuso', { required: 'Wajib diisi', valueAsNumber: true, min: 0 })}
                                    className={errors.ujFuso ? 'border-red-500' : ''}
                                />
                                {errors.ujFuso && <p className="text-red-500 text-xs">{errors.ujFuso.message}</p>}
                            </div>
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
