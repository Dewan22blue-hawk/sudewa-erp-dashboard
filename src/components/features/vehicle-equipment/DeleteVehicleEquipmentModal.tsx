import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DeleteVehicleEquipmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting?: boolean;
}

export function DeleteVehicleEquipmentModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    isDeleting = false 
}: DeleteVehicleEquipmentModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[420px] rounded-2xl bg-white p-6 border border-gray-100 shadow-2xl">
                <DialogHeader className="space-y-1">
                    <DialogTitle className="text-[20px] font-bold text-gray-900 leading-none">
                        Hapus Data Ini?
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-500 pt-2 font-medium">
                        Apa anda yakin ingin menghapus data ini?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="pt-6 flex sm:justify-end gap-3.5">
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={onClose}
                        disabled={isDeleting}
                        className="w-full sm:w-auto border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold px-5 py-2.5 rounded-xl text-sm"
                    >
                        Batal
                    </Button>
                    <Button 
                        type="button" 
                        disabled={isDeleting}
                        onClick={onConfirm}
                        className="w-full sm:w-auto bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-semibold px-5 py-2.5 rounded-xl text-sm"
                    >
                        {isDeleting ? 'Menghapus...' : 'Hapus'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
