import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DeleteArmadaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting?: boolean;
}

export function DeleteArmadaModal({ isOpen, onClose, onConfirm, isDeleting = false }: DeleteArmadaModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle className="text-xl">Hapus Data Ini?</DialogTitle>
                    <DialogDescription className="text-base pt-2">
                        Apa anda yakin ingin menghapus data ini?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex justify-end gap-2 pt-6">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Batal
                    </Button>
                    <Button type="button" className="bg-red-600 hover:bg-red-700 text-white" onClick={onConfirm} disabled={isDeleting}>
                        {isDeleting ? 'Menghapus...' : 'Hapus'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
