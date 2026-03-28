import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { EditUnitForm } from '@/components/features/sales/edit/EditUnitForm';
import { EditUnitFormData } from '@/components/features/sales/edit/edit-unit.schema';
import { toast } from 'sonner';
import { useCreateSales } from '@/hooks/useSales';
import { useCustomers } from '@/hooks/useCustomer';
import { useCompany } from '@/contexts/CompanyContext';
import { useRouter } from 'next/router';
import { generateSalesCode } from '@/lib/utils/sales';

interface CreateSalesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function CreateSalesModal({ isOpen, onClose, onSuccess }: CreateSalesModalProps) {
    const router = useRouter();
    const { companyId } = useCompany();
    const createSalesMutation = useCreateSales();
    const { data: customerData } = useCustomers(companyId || null);
    const generatedCode = generateSalesCode(router.query.slug);

    const handleSubmit = async (data: EditUnitFormData) => {
        const selectedCustomer =
            (customerData?.data ?? []).find((item) => String(item.name).trim().toLowerCase() === String(data.customer ?? '').trim().toLowerCase()) ?? null;

        const customerId = Number(selectedCustomer?.id ?? 0);
        if (!customerId) {
            toast.error('Customer tidak valid. Silakan isi nama customer sesuai data master.');
            return;
        }

        const payload = {
            person_id: customerId,
            warehouse_id: 1,
            code: generatedCode,
            type: 'sales' as const,
            max_capacity: Number(data.qty ?? 0),
            stock_state: 'draft',
        };

        if (!payload.max_capacity || payload.max_capacity <= 0) {
            toast.error('QTY wajib diisi dan minimal 1');
            return;
        }

        try {
            await createSalesMutation.mutateAsync(payload);
            toast.success('Penjualan unit berhasil ditambahkan');
            onClose();
            if (onSuccess) onSuccess();
        } catch {
            toast.error('Gagal menambahkan penjualan unit');
        }
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
                            Kode Jual: <span className="font-semibold">{generatedCode}</span>
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
