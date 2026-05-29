import React from 'react';
import { useRouter } from 'next/router';
import { ChevronLeft } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FinanceAssetDetailForm } from '@/components/features/finance/asset/FinanceAssetDetailForm';
import { useFinanceAssetDetail } from '@/hooks/useFinanceAsset';
import { Skeleton } from '@/components/ui/skeleton';

export default function FinanceAssetDetailPage() {
    const router = useRouter();
    const { slug, id } = router.query;

    const { data: asset, isLoading, error } = useFinanceAssetDetail(id as string);

    const handleBack = () => {
        router.push(`/dashboard/${slug}/finance/asset`);
    };

    if (error) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                    <p className="text-gray-500 font-medium">Gagal memuat detail data aset.</p>
                    <button onClick={handleBack} className="text-[#1e3a5f] font-semibold hover:underline flex items-center gap-1">
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
                        onClick={handleBack}
                        className="mt-1 p-1 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                    >
                        <ChevronLeft className="h-6 w-6 text-gray-900" />
                    </button>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold text-gray-900">Detail Aset</h1>
                        <p className="text-sm text-gray-500">Detail data aset inventaris</p>
                    </div>
                </div>

                {isLoading || !asset ? (
                    <div className="space-y-6">
                        <Skeleton className="h-[400px] w-full rounded-xl" />
                        <div className="flex justify-center">
                            <Skeleton className="h-10 w-32 rounded-lg" />
                        </div>
                    </div>
                ) : (
                    <FinanceAssetDetailForm 
                        asset={asset}
                        onBack={handleBack}
                    />
                )}
            </div>
        </DashboardLayout>
    );
}
