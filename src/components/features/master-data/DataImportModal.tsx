'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    onImport: (file: File) => Promise<void>;
    isPending: boolean;
}

export function DataImportModal({ open, onOpenChange, title, description, onImport, isPending }: Props) {
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        if (!open) {
            setFile(null);
        }
    }, [open]);

    const handleImport = async () => {
        if (!file) {
            toast.error('Pilih file terlebih dahulu');
            return;
        }

        try {
            await onImport(file);
            toast.success('Data berhasil diimport');
            onOpenChange(false);
            setFile(null);
        } catch (error: any) {
            toast.error(error?.message || 'Terjadi kesalahan saat mengimport data');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <label className="block cursor-pointer rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600 transition hover:border-slate-400 hover:bg-slate-100">
                        <Upload className="mx-auto mb-2 h-8 w-8 text-slate-400" />
                        <span className="block font-medium">{file ? file.name : 'Pilih file .xlsx'}</span>
                        <span className="mt-1 block text-xs text-slate-500">Klik atau seret file ke sini</span>
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                            className="hidden"
                        />
                    </label>

                    <span className="text-xs text-muted-foreground">Berikut adalah <a href="https://docs.google.com/spreadsheets/d/1WdGMJEme7eGxp6GDJ-px2PmVurSdYHoKkv6za0VN8AI/edit?usp=sharing" className="text-blue-600 underline cursor-pointer" target="_blank" rel="noopener noreferrer">template import file</a></span>

                    <div className="flex gap-3 pt-2">
                        <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                            Batal
                        </Button>
                        <Button className="flex-1" onClick={handleImport} disabled={!file || isPending}>
                            {isPending ? 'Mengimpor...' : 'Import'}
                        </Button>
                    </div>
                </div>
            </DialogContent >
        </Dialog >
    );
}
