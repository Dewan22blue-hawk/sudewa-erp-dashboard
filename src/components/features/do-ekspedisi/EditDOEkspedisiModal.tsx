import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DOEkspedisiForm, DOEkspedisiFormData } from '@/components/features/do-ekspedisi/DOEkspedisiForm';
import { DOEkspedisi, DUMMY_DO_EKSPEDISI, setDummyDOs } from '@/components/features/do-ekspedisi/do-ekspedisi.data';
import { toast } from 'sonner';

interface EditDOEkspedisiModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData: DOEkspedisi | null;
    onSuccess?: () => void;
}

export function EditDOEkspedisiModal({ isOpen, onClose, initialData, onSuccess }: EditDOEkspedisiModalProps) {
    const handleSave = (data: DOEkspedisiFormData) => {
        if (!initialData) return;

        const updatedEntry = { ...initialData, ...data, kodeDO: initialData.kodeDO };

        const updatedList = DUMMY_DO_EKSPEDISI.map(item =>
            item.id === initialData.id ? updatedEntry : item
        );

        setDummyDOs(updatedList);

        toast.success('Data DO Ekspedisi berhasil diperbarui');
        onClose();
        if (onSuccess) onSuccess();
    };

    if (!initialData) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <DialogTitle className="text-xl">Edit DO Ekspedisi</DialogTitle>
                            <DialogDescription className="mt-2 text-sm text-gray-500">
                                Perbarui detail data ekspedisi
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="mt-2">
                    <DOEkspedisiForm
                        initialData={initialData}
                        title="Edit DO Ekspedisi"
                        onSubmit={handleSave}
                        hideCancelButton={false}
                        onCancel={onClose}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
