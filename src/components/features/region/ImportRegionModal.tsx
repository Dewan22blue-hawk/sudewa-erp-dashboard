import React, { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ImportRegionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (file: File) => void;
    isUploading?: boolean;
}

export function ImportRegionModal({ isOpen, onClose, onImport, isUploading = false }: ImportRegionModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleImport = () => {
        if (selectedFile) {
            onImport(selectedFile);
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Import Data Wilayah</DialogTitle>
                    <DialogDescription>
                        Unggah file CSV dengan struktur kolom yang sesuai untuk mengimpor data wilayah.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                    <div className="rounded-md bg-blue-50 p-4">
                        <h4 className="text-sm font-medium text-blue-800 mb-2">Panduan Struktur File CSV</h4>
                        <p className="text-xs text-blue-700 mb-3">
                            File excel/CSV anda wajib memiliki header (baris pertama) persis seperti di bawah ini:
                        </p>
                        <div className="rounded-md border bg-white overflow-hidden">
                            <Table className="text-xs">
                                <TableHeader className="bg-gray-50">
                                    <TableRow>
                                        <TableHead className="h-8 py-1">kode</TableHead>
                                        <TableHead className="h-8 py-1">nama</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="py-1">BDG</TableCell>
                                        <TableCell className="py-1">KAB. BANDUNG</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="py-1">BDGB</TableCell>
                                        <TableCell className="py-1">KAB. BANDUNG BARAT</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="file-upload">Pilih File CSV/Excel</Label>
                        <Input
                            id="file-upload"
                            type="file"
                            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            disabled={isUploading}
                        />
                    </div>

                    <div className="flex flex-col space-y-2 pt-4">
                        <Button 
                            className="w-full bg-[#1e3a5f] hover:bg-[#152e4d]"
                            onClick={handleImport}
                            disabled={!selectedFile || isUploading}
                        >
                            {isUploading ? 'Mengunggah...' : 'Import Data'}
                        </Button>
                        <Button 
                            type="button" 
                            variant="outline" 
                            className="w-full" 
                            onClick={handleClose}
                            disabled={isUploading}
                        >
                            Batal
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
