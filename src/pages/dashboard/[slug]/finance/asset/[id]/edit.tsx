import React from 'react';
import { useRouter } from 'next/router';
import { ChevronLeft } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FinanceAssetEditForm } from '@/components/features/finance/asset/FinanceAssetEditForm';
import { useFinanceAssetDetail, useUpdateFinanceAsset } from '@/hooks/useFinanceAsset';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function FinanceAssetEditPage() {
    const router = useRouter();
    const { slug, id } = router.query;

    const { data: asset, isLoading, error } = useFinanceAssetDetail(id as string);
    const updateMutation = useUpdateFinanceAsset();

    const handleSave = async (data: any) => {
        try {
            await updateMutation.mutateAsync({ 
                id: id as string, 
                data: {
                    ...data,
                    description: data.description || `Penyusutan data asset ${id}`
                } 
            });
            toast.success('Data aset berhasil diperbarui');
            router.push(`/dashboard/${slug}/finance/asset`);
        } catch (error: any) {
            toast.error(error.message || 'Gagal memperbarui data aset');
        }
    };

    const handleCancel = () => {
        router.push(`/dashboard/${slug}/finance/asset`);
    };

    if (error) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                    <p className="text-gray-500 font-medium">Gagal memuat data aset.</p>
                    <button onClick={handleCancel} className="text-[#1e3a5f] font-semibold hover:underline flex items-center gap-1">
                        <ChevronLeft className="h-4 w-4" /> Kembali
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-start gap-4">
                    <button 
                        onClick={handleCancel}
                        className="mt-1 p-1 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                    >
                        <ChevronLeft className="h-6 w-6 text-gray-900" />
                    </button>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold text-gray-900">Edit Aset</h1>
                        <p className="text-sm text-gray-500">Edit data aset inventaris</p>
                    </div>
                </div>

                {isLoading || !asset ? (
                    <div className="space-y-6">
                        <Skeleton className="h-[400px] w-full rounded-xl" />
                        <div className="flex justify-center gap-4">
                            <Skeleton className="h-10 w-32 rounded-lg" />
                            <Skeleton className="h-10 w-32 rounded-lg" />
                        </div>
                    </div>
                ) : (
                    <FinanceAssetEditForm 
                        initialData={asset}
                        onSave={handleSave}
                        onCancel={handleCancel}
                        isSaving={updateMutation.isPending}
                    />
                )}
            </div>
        </DashboardLayout>
    );
}
