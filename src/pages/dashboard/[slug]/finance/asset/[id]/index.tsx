import React from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FinanceAssetDetailForm } from '@/components/features/finance/asset/FinanceAssetDetailForm';
import { useFinanceAssetDetail } from '@/hooks/useFinanceAsset';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

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
                        <ArrowLeft className="h-4 w-4" /> Kembali
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button onClick={handleBack} variant="ghost" size="icon" className="h-10 w-10 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                        <ArrowLeft className="h-5 w-5 text-slate-700" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-950">Detail Aset</h1>
                        <p className="text-sm text-slate-500">Detail data aset inventaris</p>
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
