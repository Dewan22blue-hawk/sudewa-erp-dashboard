import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AssetType } from '@/@types/asset.types';
import { MoneyInput } from '@/components/ui/money-input';

export interface AssetFormData {
    company_id: number;
    name: string;
    code: string;
    purchase_date: string;
    type: AssetType;
    price: string | number;
}

interface AssetFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: AssetFormData) => void;
    companyId: number;
}

export function AssetFormModal({ isOpen, onClose, onSave, companyId }: AssetFormModalProps) {
    const { register, handleSubmit, reset, control, formState: { errors } } = useForm<AssetFormData>({
        defaultValues: {
            company_id: companyId,
            name: '',
            code: '',
            purchase_date: '',
            type: 'inventory',
            price: ''
        }
    });

    useEffect(() => {
        if (isOpen) {
            reset({
                company_id: companyId,
                name: '',
                code: '',
                purchase_date: '',
                type: 'inventory',
                price: ''
            });
        }
    }, [isOpen, reset, companyId]);

    const onSubmit = (data: AssetFormData) => {
        onSave(data);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Tambah Data Aset</DialogTitle>
                    <DialogDescription>
                        Masukkan detail aset baru
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-900 font-medium">Nama Aset</Label>
                        <Input
                            id="name"
                            placeholder="Masukkan nama aset"
                            {...register('name', { required: 'Nama aset wajib diisi' })}
                            className={errors.name ? 'border-red-500' : ''}
                        />
                        {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="code" className="text-gray-900 font-medium">Kode Aset</Label>
                        <Input
                            id="code"
                            placeholder="Masukkan kode aset"
                            {...register('code', { required: 'Kode aset wajib diisi' })}
                            className={errors.code ? 'border-red-500' : ''}
                        />
                        {errors.code && <p className="text-red-500 text-xs">{errors.code.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="purchase_date" className="text-gray-900 font-medium">Tanggal Pembelian</Label>
                        <Input
                            id="purchase_date"
                            type="date"
                            {...register('purchase_date', { required: 'Tanggal pembelian wajib diisi' })}
                            className={errors.purchase_date ? 'border-red-500' : ''}
                        />
                        {errors.purchase_date && <p className="text-red-500 text-xs">{errors.purchase_date.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type" className="text-gray-900 font-medium">Tipe</Label>
                        <Controller
                            control={control}
                            name="type"
                            rules={{ required: 'Tipe wajib dipilih' }}
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Pilih tipe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="inventory">Inventory</SelectItem>
                                        <SelectItem value="vehicles">Vehicles</SelectItem>
                                        <SelectItem value="buildings">Buildings</SelectItem>
                                        <SelectItem value="land">Land</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.type && <p className="text-red-500 text-xs">{errors.type.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="price" className="text-gray-900 font-medium">Harga</Label>
                        <Controller
                            control={control}
                            name="price"
                            rules={{ required: 'Harga wajib diisi' }}
                            render={({ field }) => (
                                <MoneyInput
                                    id="price"
                                    placeholder="Masukkan harga"
                                    value={Number(field.value)}
                                    onChangeValue={(v) => field.onChange(v)}
                                    className={errors.price ? 'border-red-500' : ''}
                                />
                            )}
                        />
                        {errors.price && <p className="text-red-500 text-xs">{errors.price.message}</p>}
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
