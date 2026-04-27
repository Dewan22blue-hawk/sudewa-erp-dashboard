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
    serial_number?: string;
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
            price: '',
            serial_number: '',
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
                price: '',
                serial_number: '',
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
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">

                    {/* Kode Aset */}
                    <div className="space-y-2">
                        <Label htmlFor="code" className="text-gray-900 font-medium">Kode Aset</Label>
                        <Input
                            id="code"
                            placeholder="Contoh: AST-WJR0001"
                            {...register('code', { required: 'Kode aset wajib diisi' })}
                            className={errors.code ? 'border-red-500' : ''}
                        />
                        {errors.code && <p className="text-red-500 text-xs">{errors.code.message}</p>}
                    </div>

                    {/* Tanggal Beli */}
                    <div className="space-y-2">
                        <Label htmlFor="purchase_date" className="text-gray-900 font-medium">Tanggal Beli</Label>
                        <Input
                            id="purchase_date"
                            type="date"
                            {...register('purchase_date', { required: 'Tanggal beli wajib diisi' })}
                            className={errors.purchase_date ? 'border-red-500' : ''}
                        />
                        {errors.purchase_date && <p className="text-red-500 text-xs">{errors.purchase_date.message}</p>}
                    </div>

                    {/* Nama Barang */}
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-900 font-medium">Nama Barang</Label>
                        <Input
                            id="name"
                            placeholder="Contoh: Sapu"
                            {...register('name', { required: 'Nama barang wajib diisi' })}
                            className={errors.name ? 'border-red-500' : ''}
                        />
                        {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                    </div>

                    {/* Tipe Aset */}
                    <div className="space-y-2">
                        <Label htmlFor="type" className="text-gray-900 font-medium">Tipe Aset</Label>
                        <Controller
                            control={control}
                            name="type"
                            rules={{ required: 'Tipe aset wajib dipilih' }}
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Select an item" />
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

                    {/* Harga Beli */}
                    <div className="space-y-2">
                        <Label htmlFor="price" className="text-gray-900 font-medium">Harga Beli</Label>
                        <Controller
                            control={control}
                            name="price"
                            rules={{ required: 'Harga wajib diisi' }}
                            render={({ field }) => (
                                <MoneyInput
                                    id="price"
                                    placeholder="Nominal"
                                    value={Number(field.value)}
                                    onChangeValue={(v) => field.onChange(v)}
                                    className={errors.price ? 'border-red-500' : ''}
                                />
                            )}
                        />
                        {errors.price && <p className="text-red-500 text-xs">{errors.price.message}</p>}
                    </div>

                    {/* Serial Number */}
                    <div className="space-y-2">
                        <Label htmlFor="serial_number" className="text-gray-900 font-medium">Serial Number</Label>
                        <Input
                            id="serial_number"
                            placeholder="Contoh: AWS0001"
                            {...register('serial_number')}
                        />
                    </div>

                    <div className="flex flex-col space-y-2 pt-2">
                        <Button type="submit" className="w-full bg-[#1e3a5f] hover:bg-[#152e4d]">Simpan</Button>
                        <Button type="button" variant="outline" className="w-full" onClick={onClose}>Batal</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
