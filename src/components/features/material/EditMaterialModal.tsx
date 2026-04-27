import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MoneyInput } from '@/components/ui/money-input';
import { MaterialFormData } from './MaterialFormModal';
import type { Material } from '@/@types/material.types';

interface EditMaterialModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: MaterialFormData) => void;
    initialData: Material | null;
}

export function EditMaterialModal({ isOpen, onClose, onSave, initialData }: EditMaterialModalProps) {
    if (!initialData) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Data Material</DialogTitle>
                    <DialogDescription>
                        Edit data material baru
                    </DialogDescription>
                </DialogHeader>
                
                <EditMaterialInnerForm 
                    initialData={initialData} 
                    onClose={onClose} 
                    onSave={onSave} 
                />
            </DialogContent>
        </Dialog>
    );
}

interface InnerProps {
    initialData: Material;
    onClose: () => void;
    onSave: (data: MaterialFormData) => void;
}

function EditMaterialInnerForm({ initialData, onClose, onSave }: InnerProps) {
    const { control, register, handleSubmit, formState: { errors } } = useForm<MaterialFormData>({
        defaultValues: {
            code: initialData.code || '',
            name: initialData.name || '',
            price: initialData.price || '',
            type: initialData.type || ''
        }
    });

    const onSubmit = (data: MaterialFormData) => {
        onSave(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="space-y-2">
                <Label htmlFor="edit-code" className="text-gray-900 font-medium">Kode Material</Label>
                <Input
                    id="edit-code"
                    placeholder="Masukkan kode material"
                    {...register('code')}
                    className={errors.code ? 'border-red-500' : ''}
                />
                {errors.code && <p className="text-red-500 text-xs">{errors.code.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-gray-900 font-medium">Deskripsi</Label>
                <Input
                    id="edit-name"
                    placeholder="Masukkan deskripsi"
                    {...register('name', { required: 'Deskripsi wajib diisi' })}
                    className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="edit-price" className="text-gray-900 font-medium">Harga</Label>
                <Controller
                    control={control}
                    name="price"
                    rules={{ required: 'Harga wajib diisi' }}
                    render={({ field }) => (
                        <MoneyInput
                            value={field.value === '' ? null : Number(field.value || 0)}
                            onChangeValue={field.onChange}
                            placeholder="Masukkan jumlah"
                            className={errors.price ? 'border-red-500' : ''}
                        />
                    )}
                />
                {errors.price && <p className="text-red-500 text-xs">{errors.price.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="edit-type" className="text-gray-900 font-medium">Satuan</Label>
                <Input
                    id="edit-type"
                    placeholder="Masukkan satuan"
                    {...register('type', { required: 'Satuan wajib diisi' })}
                    className={errors.type ? 'border-red-500' : ''}
                />
                {errors.type && <p className="text-red-500 text-xs">{errors.type.message}</p>}
            </div>

            <div className="flex flex-col space-y-2 pt-4">
                <Button type="submit" className="w-full bg-[#1e3a5f] hover:bg-[#152e4d]">Simpan</Button>
                <Button type="button" variant="outline" className="w-full" onClick={onClose}>Batal</Button>
            </div>
        </form>
    );
}
