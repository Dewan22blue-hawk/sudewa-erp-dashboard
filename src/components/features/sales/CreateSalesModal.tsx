import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { EditUnitForm } from '@/components/features/sales/edit/EditUnitForm';
import { EditUnitFormData } from '@/components/features/sales/edit/edit-unit.schema';
import { toast } from 'sonner';

interface CreateSalesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function CreateSalesModal({ isOpen, onClose, onSuccess }: CreateSalesModalProps) {
    const handleSubmit = (data: EditUnitFormData) => {
        // Mock submission
        setTimeout(() => {
            toast.success('Penjualan unit berhasil ditambahkan');
            onClose();
            if (onSuccess) onSuccess();
        }, 800);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[850px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <DialogTitle className="text-xl">Tambah Penjualan</DialogTitle>
                            <DialogDescription className="mt-2">
                                Masukkan detail penjualan unit baru.
                            </DialogDescription>
                        </div>
                        <div className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-md border border-blue-100 mr-4">
                            Kode Jual: <span className="font-semibold">INV-WIN/2026---</span>
                        </div>
                    </div>
                </DialogHeader>

                <div className="mt-2">
                    <EditUnitForm
                        defaultValues={{
                            customer: 'PT XX',
                            tipeUnit: '',
                            qty: 1,
                            harga: 0,
                            hppSatuan: 0,
                            totalHpp: 0,
                            dppSatuan: 0,
                            totalDpp: 0,
                            ppnSatuan: 0,
                            totalPpn: 0,
                            biayaBbn: 0,
                            biayaEkspedisi: 0,
                            biayaLain: 0,
                        }}
                        onSubmit={handleSubmit}
                        onCancel={onClose}
                        showAddUnitButton
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
