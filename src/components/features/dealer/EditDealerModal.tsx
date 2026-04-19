import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DealerFormData } from './DealerFormModal';
import type { Dealer } from '@/@types/dealer.types';

interface EditDealerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: DealerFormData) => void;
    initialData: Dealer | null;
}

export function EditDealerModal({ isOpen, onClose, onSave, initialData }: EditDealerModalProps) {
    if (!initialData) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Data Dealer</DialogTitle>
                    <DialogDescription>
                        Perbarui detail data dealer ini
                    </DialogDescription>
                </DialogHeader>
                
                <EditDealerInnerForm 
                    initialData={initialData} 
                    onClose={onClose} 
                    onSave={onSave} 
                />
            </DialogContent>
        </Dialog>
    );
}

interface InnerProps {
    initialData: Dealer;
    onClose: () => void;
    onSave: (data: DealerFormData) => void;
}

function EditDealerInnerForm({ initialData, onClose, onSave }: InnerProps) {
    const { register, handleSubmit, formState: { errors } } = useForm<DealerFormData>({
        defaultValues: {
            namaDealer: initialData.namaDealer || '',
            alamat: initialData.alamat || '',
            pic: initialData.pic || '',
            handphone: initialData.handphone || ''
        }
    });

    const onSubmit = (data: DealerFormData) => {
        onSave(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="space-y-2">
                <Label htmlFor="edit-namaDealer">Nama Dealer</Label>
                <Input
                    id="edit-namaDealer"
                    placeholder="Masukkan nama dealer"
                    {...register('namaDealer', { required: 'Nama Dealer wajib diisi' })}
                    className={errors.namaDealer ? 'border-red-500' : ''}
                />
                {errors.namaDealer && <p className="text-red-500 text-xs">{errors.namaDealer.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="edit-alamat">Alamat</Label>
                <Textarea
                    id="edit-alamat"
                    placeholder="Masukkan alamat dealer"
                    {...register('alamat', { required: 'Alamat wajib diisi' })}
                    className={errors.alamat ? 'border-red-500 resize-none' : 'resize-none'}
                    rows={3}
                />
                {errors.alamat && <p className="text-red-500 text-xs">{errors.alamat.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="edit-pic">PIC</Label>
                <Input
                    id="edit-pic"
                    placeholder="Masukkan PIC"
                    {...register('pic', { required: 'PIC wajib diisi' })}
                    className={errors.pic ? 'border-red-500' : ''}
                />
                {errors.pic && <p className="text-red-500 text-xs">{errors.pic.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="edit-handphone">Handphone</Label>
                <Input
                    id="edit-handphone"
                    placeholder="Masukkan nomor handphone"
                    {...register('handphone', { required: 'Handphone wajib diisi' })}
                    className={errors.handphone ? 'border-red-500' : ''}
                />
                {errors.handphone && <p className="text-red-500 text-xs">{errors.handphone.message}</p>}
            </div>

            <div className="flex flex-col space-y-2 pt-4">
                <Button type="submit" className="w-full bg-[#1e3a5f] hover:bg-[#152e4d]">Simpan Perubahan</Button>
                <Button type="button" variant="outline" className="w-full" onClick={onClose}>Batal</Button>
            </div>
        </form>
    );
}
