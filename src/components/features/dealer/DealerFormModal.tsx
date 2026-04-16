import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export interface DealerFormData {
    namaDealer: string;
    alamat: string;
    pic: string;
    handphone: string;
}

interface DealerFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: DealerFormData) => void;
}

export function DealerFormModal({ isOpen, onClose, onSave }: DealerFormModalProps) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<DealerFormData>({
        defaultValues: {
            namaDealer: '',
            alamat: '',
            pic: '',
            handphone: ''
        }
    });

    useEffect(() => {
        if (!isOpen) {
            reset({ namaDealer: '', alamat: '', pic: '', handphone: '' });
        }
    }, [isOpen, reset]);

    const onSubmit = (data: DealerFormData) => {
        onSave(data);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Tambah Data Dealer</DialogTitle>
                    <DialogDescription>
                        Masukkan detail dealer baru
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="namaDealer">Nama Dealer</Label>
                            <Input
                                id="namaDealer"
                                placeholder="Masukkan nama dealer"
                                {...register('namaDealer', { required: 'Nama Dealer wajid diisi' })}
                                className={errors.namaDealer ? 'border-red-500' : ''}
                            />
                            {errors.namaDealer && <p className="text-red-500 text-xs">{errors.namaDealer.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="alamat">Alamat</Label>
                            <Textarea
                                id="alamat"
                                placeholder="Masukkan alamat dealer"
                                {...register('alamat', { required: 'Alamat wajib diisi' })}
                                className={errors.alamat ? 'border-red-500 resize-none' : 'resize-none'}
                                rows={3}
                            />
                            {errors.alamat && <p className="text-red-500 text-xs">{errors.alamat.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="pic">PIC</Label>
                            <Input
                                id="pic"
                                placeholder="Masukkan PIC"
                                {...register('pic', { required: 'PIC wajib diisi' })}
                                className={errors.pic ? 'border-red-500' : ''}
                            />
                            {errors.pic && <p className="text-red-500 text-xs">{errors.pic.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="handphone">Handphone</Label>
                            <Input
                                id="handphone"
                                placeholder="Masukkan nomor handphone"
                                {...register('handphone', { required: 'Handphone wajib diisi' })}
                                className={errors.handphone ? 'border-red-500' : ''}
                            />
                            {errors.handphone && <p className="text-red-500 text-xs">{errors.handphone.message}</p>}
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
