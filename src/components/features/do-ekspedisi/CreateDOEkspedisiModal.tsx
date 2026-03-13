import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DOEkspedisiForm, DOEkspedisiFormData } from '@/components/features/do-ekspedisi/DOEkspedisiForm';
import { DUMMY_DO_EKSPEDISI, setDummyDOs } from '@/components/features/do-ekspedisi/do-ekspedisi.data';
import { toast } from 'sonner';

interface CreateDOEkspedisiModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function CreateDOEkspedisiModal({ isOpen, onClose, onSuccess }: CreateDOEkspedisiModalProps) {
    const handleSave = (data: DOEkspedisiFormData) => {
        const newId = DUMMY_DO_EKSPEDISI.length > 0 ? Math.max(...DUMMY_DO_EKSPEDISI.map(d => d.id)) + 1 : 1;

        // Auto-generate Kode DO if not provided.
        const generatedKodeDO = data.kodeDO || `DOE-WJR${newId.toString().padStart(6, '0')}`;

        const newEntry = { id: newId, ...data, kodeDO: generatedKodeDO };

        setDummyDOs([newEntry, ...DUMMY_DO_EKSPEDISI]);

        toast.success('Data DO Ekspedisi berhasil ditambahkan');
        onClose();
        if (onSuccess) onSuccess();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <DialogTitle className="text-xl">Tambah DO Ekspedisi</DialogTitle>
                            <DialogDescription className="mt-2 text-sm text-gray-500">
                                Masukkan detail data ekspedisi baru
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="mt-2">
                    <DOEkspedisiForm
                        title="Tambah DO Ekspedisi"
                        onSubmit={handleSave}
                        hideCancelButton={false}
                        onCancel={onClose}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
