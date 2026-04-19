import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Driver, DriverPayload } from '@/@types/driver.types';

export interface DriverFormData {
    name: string;
    address: string;
    identityNumber: string;
    phone: string;
    driveLicenseNumber: string;
    joinedAt: string;
}

interface DriverFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: DriverPayload) => void;
    initialData?: Driver | null;
    isSubmitting?: boolean;
    companyId?: string | number;
}

const emptyValues: DriverFormData = {
    name: '',
    address: '',
    identityNumber: '',
    phone: '',
    driveLicenseNumber: '',
    joinedAt: '',
};

export function DriverFormModal({
    isOpen,
    onClose,
    onSave,
    initialData,
    isSubmitting = false,
    companyId,
}: DriverFormModalProps) {
    const isEdit = !!initialData;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<DriverFormData>({ defaultValues: emptyValues });

    // Populate form when editing
    useEffect(() => {
        if (isOpen && initialData) {
            reset({
                name: initialData.name || '',
                address: initialData.address || '',
                identityNumber: initialData.identityNumber || '',
                phone: initialData.phone || '',
                driveLicenseNumber: initialData.driveLicenseNumber || '',
                // Normalize ISO date to YYYY-MM-DD for <input type="date">
                joinedAt: initialData.joinedAt
                    ? initialData.joinedAt.substring(0, 10)
                    : '',
            });
        } else if (!isOpen) {
            reset(emptyValues);
        }
    }, [isOpen, initialData, reset]);

    const onSubmit = (data: DriverFormData) => {
        onSave({
            company_id: companyId,
            name: data.name,
            address: data.address || undefined,
            phone: data.phone || undefined,
            identity_number: data.identityNumber || undefined,
            drive_license_identity_number: data.driveLicenseNumber || undefined,
            joined_at: data.joinedAt || undefined,
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[440px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-900">
                        {isEdit ? 'Edit Data Driver' : 'Tambah Data Driver'}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-500">
                        Masukkan detail driver baru
                    </DialogDescription>
                </DialogHeader>

                {isOpen && (
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-4 pt-2 max-h-[75vh] overflow-y-auto px-1"
                    >
                        {/* Nama Driver */}
                        <div className="space-y-1.5">
                            <Label htmlFor="driver-name" className="text-sm font-medium text-gray-700">
                                Nama Driver
                            </Label>
                            <Input
                                id="driver-name"
                                placeholder="Tambahkan nama driver"
                                {...register('name', { required: 'Nama Driver wajib diisi', maxLength: { value: 249, message: 'Maks 249 karakter' } })}
                                className={errors.name ? 'border-red-500' : ''}
                                disabled={isSubmitting}
                            />
                            {errors.name && (
                                <p className="text-red-500 text-xs">{errors.name.message}</p>
                            )}
                        </div>

                        {/* Alamat */}
                        <div className="space-y-1.5">
                            <Label htmlFor="driver-address" className="text-sm font-medium text-gray-700">
                                Alamat
                            </Label>
                            <Textarea
                                id="driver-address"
                                placeholder="Tambahkan Alamat"
                                {...register('address', { maxLength: { value: 249, message: 'Maks 249 karakter' } })}
                                className={`resize-none ${errors.address ? 'border-red-500' : ''}`}
                                rows={3}
                                disabled={isSubmitting}
                            />
                            {errors.address && (
                                <p className="text-red-500 text-xs">{errors.address.message}</p>
                            )}
                        </div>

                        {/* KTP */}
                        <div className="space-y-1.5">
                            <Label htmlFor="driver-ktp" className="text-sm font-medium text-gray-700">
                                KTP
                            </Label>
                            <Input
                                id="driver-ktp"
                                placeholder="Tambahkan nomor ktp"
                                {...register('identityNumber')}
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Phone */}
                        <div className="space-y-1.5">
                            <Label htmlFor="driver-phone" className="text-sm font-medium text-gray-700">
                                Phone
                            </Label>
                            <Input
                                id="driver-phone"
                                placeholder="Tambahkan nomor telepon"
                                {...register('phone', { maxLength: { value: 249, message: 'Maks 249 karakter' } })}
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* SIM */}
                        <div className="space-y-1.5">
                            <Label htmlFor="driver-sim" className="text-sm font-medium text-gray-700">
                                SIM
                            </Label>
                            <Input
                                id="driver-sim"
                                placeholder="Tambahkan nomor SIM"
                                {...register('driveLicenseNumber')}
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* TGL Gabung */}
                        <div className="space-y-1.5">
                            <Label htmlFor="driver-joined-at" className="text-sm font-medium text-gray-700">
                                TGL Gabung
                            </Label>
                            <div className="relative">
                                <Input
                                    id="driver-joined-at"
                                    type="date"
                                    placeholder="Pick a date"
                                    {...register('joinedAt')}
                                    className="pl-9"
                                    disabled={isSubmitting}
                                />
                                <svg
                                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" />
                                    <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 pt-2 pb-1">
                            <Button
                                type="submit"
                                className="w-full bg-[#1e3a5f] hover:bg-[#152e4d]"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                Batal
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
