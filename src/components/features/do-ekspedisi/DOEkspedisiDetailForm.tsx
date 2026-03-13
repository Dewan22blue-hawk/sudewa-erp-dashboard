import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/router';
import { DODetail } from './do-ekspedisi.data';

export type DOEkspedisiDetailFormData = Omit<DODetail, 'id' | 'doId'>;

interface DOEkspedisiDetailFormProps {
    initialData?: DODetail;
    onSubmit: (data: DOEkspedisiDetailFormData) => void;
}

export function DOEkspedisiDetailForm({ initialData, onSubmit }: DOEkspedisiDetailFormProps) {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors } } = useForm<DOEkspedisiDetailFormData>({
        defaultValues: initialData || {
            customer: '', muat: '', muatan: '', tujuanKirim: '', bongkar: '', invoice: '', banSerep: '', pipaPress1: '', pipaPress2: '', biayaTambahan: '', ppn: '', fee: '', ujDriver: '', lainnya: '', pph: ''
        }
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 rounded-xl border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6">

                <div className="space-y-2 relative">
                    <Label htmlFor="customer">Customer <span className="text-red-500">*</span></Label>
                    <Input id="customer" placeholder="Masukkan customer" {...register('customer', { required: 'Wajib diisi' })} className={errors.customer ? 'border-red-500' : ''} />
                    {errors.customer && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-0">{errors.customer.message}</p>}
                </div>
                <div className="space-y-2 relative">
                    <Label htmlFor="muat">Muat <span className="text-red-500">*</span></Label>
                    <Input id="muat" placeholder="Masukkan lokasi muat" {...register('muat', { required: 'Wajib diisi' })} className={errors.muat ? 'border-red-500' : ''} />
                    {errors.muat && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-0">{errors.muat.message}</p>}
                </div>
                <div className="space-y-2 relative">
                    <Label htmlFor="muatan">Muatan <span className="text-red-500">*</span></Label>
                    <Input id="muatan" placeholder="Masukkan muatan" {...register('muatan', { required: 'Wajib diisi' })} className={errors.muatan ? 'border-red-500' : ''} />
                    {errors.muatan && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-0">{errors.muatan.message}</p>}
                </div>

                <div className="space-y-2 relative">
                    <Label htmlFor="tujuanKirim">Tujuan Kirim</Label>
                    <Input id="tujuanKirim" placeholder="Masukkan tujuan kirim" {...register('tujuanKirim')} />
                </div>
                <div className="space-y-2 relative">
                    <Label htmlFor="bongkar">Bongkar <span className="text-red-500">*</span></Label>
                    <Input id="bongkar" placeholder="Masukkan informasi bongkar" {...register('bongkar', { required: 'Wajib diisi' })} className={errors.bongkar ? 'border-red-500' : ''} />
                    {errors.bongkar && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-0">{errors.bongkar.message}</p>}
                </div>
                <div className="space-y-2 relative">
                    <Label htmlFor="invoice">Invoice Ekspedisi</Label>
                    <Input id="invoice" placeholder="Masukkan nomor invoice" {...register('invoice')} />
                </div>

                <div className="space-y-2 relative">
                    <Label htmlFor="banSerep">Ban Serep</Label>
                    <Input id="banSerep" placeholder="Masukkan info ban serep" {...register('banSerep')} />
                </div>
                <div className="space-y-2 relative">
                    <Label htmlFor="pipaPress1">Pipa Press 1</Label>
                    <Input id="pipaPress1" placeholder="Masukkan info pipa press 1" {...register('pipaPress1')} />
                </div>
                <div className="space-y-2 relative">
                    <Label htmlFor="pipaPress2">Pipa Press 2</Label>
                    <Input id="pipaPress2" placeholder="Masukkan info pipa press 2" {...register('pipaPress2')} />
                </div>

                <div className="space-y-2 relative">
                    <Label htmlFor="biayaTambahan">Biaya Tambahan</Label>
                    <Input id="biayaTambahan" placeholder="Masukkan nominal" {...register('biayaTambahan')} />
                </div>
                <div className="space-y-2 relative">
                    <Label htmlFor="ppn">PPN 11%</Label>
                    <Input id="ppn" placeholder="Masukkan nominal" {...register('ppn')} />
                </div>
                <div className="space-y-2 relative">
                    <Label htmlFor="fee">Fee 4%</Label>
                    <Input id="fee" placeholder="Masukkan nominal" {...register('fee')} />
                </div>

                <div className="space-y-2 relative">
                    <Label htmlFor="ujDriver">UJ Driver</Label>
                    <Input id="ujDriver" placeholder="Masukkan nominal" {...register('ujDriver')} />
                </div>
                <div className="space-y-2 relative">
                    <Label htmlFor="lainnya">Lainnya</Label>
                    <Input id="lainnya" placeholder="Masukkan nominal" {...register('lainnya')} />
                </div>
                <div className="space-y-2 relative">
                    <Label htmlFor="pph">PPH</Label>
                    <Input id="pph" placeholder="Masukkan nominal" {...register('pph')} />
                </div>
            </div>

            <div className="flex justify-center gap-4 mt-8 pt-4">
                <Button type="button" variant="outline" className="w-[120px]" onClick={() => router.back()}>
                    Batal
                </Button>
                <Button type="submit" className="w-[120px] bg-[#1e3a5f] hover:bg-[#152e4d] text-white">
                    Simpan
                </Button>
            </div>
        </form>
    );
}
