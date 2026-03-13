import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/router';
import { DOEkspedisi } from './do-ekspedisi.data';

export type DOEkspedisiFormData = Omit<DOEkspedisi, 'id' | 'kodeDO'> & { kodeDO?: string };

interface DOEkspedisiFormProps {
    initialData?: DOEkspedisi;
    title: string;
    onSubmit: (data: DOEkspedisiFormData) => void;
    hideCancelButton?: boolean;
    onCancel?: () => void;
}

export function DOEkspedisiForm({ initialData, title, onSubmit, hideCancelButton = false, onCancel }: DOEkspedisiFormProps) {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors } } = useForm<DOEkspedisiFormData>({
        defaultValues: initialData || {
            kodeDO: '',
            tanggal: '',
            noPolisi: '',
            tipeKendaraan: '',
            driver: ''
        }
    });

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            router.back();
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 rounded-xl border border-gray-200">
            <div className="space-y-4 max-w-2xl">
                <div className="space-y-2 relative">
                    <Label htmlFor="kodeDO">ID DO</Label>
                    <Input id="kodeDO" placeholder="DOE-0374HHHH" {...register('kodeDO')} readOnly={!!initialData} className={initialData ? 'bg-gray-50' : ''} />
                </div>

                <div className="space-y-2 relative">
                    <Label htmlFor="tanggal">Tanggal <span className="text-red-500">*</span></Label>
                    <Input id="tanggal" type="date" placeholder="Pick a date" {...register('tanggal', { required: 'Wajib diisi' })} className={errors.tanggal ? 'border-red-500' : ''} />
                    {errors.tanggal && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-0">{errors.tanggal.message}</p>}
                </div>

                <div className="space-y-2 relative">
                    <Label htmlFor="noPolisi">No Polisi <span className="text-red-500">*</span></Label>
                    <Input id="noPolisi" placeholder="Masukkan nomor polisi" {...register('noPolisi', { required: 'Wajib diisi' })} className={errors.noPolisi ? 'border-red-500' : ''} />
                    {errors.noPolisi && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-0">{errors.noPolisi.message}</p>}
                </div>

                <div className="space-y-2 relative">
                    <Label htmlFor="tipeKendaraan">Tipe Kendaraan</Label>
                    <Input id="tipeKendaraan" placeholder="Masukkan tipe kendaraan" {...register('tipeKendaraan')} />
                </div>

                <div className="space-y-2 relative">
                    <Label htmlFor="driver">Driver <span className="text-red-500">*</span></Label>
                    <Input id="driver" placeholder="Masukkan nama driver" {...register('driver', { required: 'Wajib diisi' })} className={errors.driver ? 'border-red-500' : ''} />
                    {errors.driver && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-0">{errors.driver.message}</p>}
                </div>
            </div>

            <div className="flex flex-col gap-3 max-w-2xl">
                <Button type="submit" className="w-full bg-[#1e3a5f] hover:bg-[#152e4d]">
                    Simpan
                </Button>
                {!hideCancelButton && (
                    <Button type="button" variant="outline" className="w-full" onClick={handleCancel}>
                        Batal
                    </Button>
                )}
            </div>
        </form>
    );
}
