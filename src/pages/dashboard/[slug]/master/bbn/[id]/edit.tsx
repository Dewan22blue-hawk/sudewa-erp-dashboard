import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BBNForm } from '@/components/features/bbn/BBNForm';
import { useBBNDetail, useUpdateBBN } from '@/hooks/useBBN';
import type { ApiError } from '@/@types/api';
import type { BBNPayload } from '@/@types/bbn.types';
import { toast } from 'sonner';

const getErrorMessage = (error: unknown) => {
    const apiError = error as ApiError | undefined;
    const details = apiError?.details;

    if (details && typeof details === 'object' && !Array.isArray(details)) {
        const firstDetail = Object.values(details).flatMap((value) => {
            if (Array.isArray(value)) return value.map(String);
            return [String(value)];
        })[0];

        if (firstDetail) return firstDetail;
    }

    if (typeof details === 'string' && details.trim()) {
        return details;
    }

    return apiError?.message || 'Gagal menyimpan data';
};

export default function EditBBNPage() {
    const router = useRouter();
    const slug = router.query.slug as string;
    const id = router.query.id as string;
    
    const { data: bbnData, isLoading, isError } = useBBNDetail(id);
    const updateMutation = useUpdateBBN();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: BBNPayload) => {
        if (!id) return;
        setIsSubmitting(true);
        try {
            await updateMutation.mutateAsync({ id, data });
            toast.success('Data biaya berhasil diubah');
            router.push(`/dashboard/${slug}/master/bbn`);
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            {isLoading ? (
                <div className="flex h-[400px] items-center justify-center">
                    <p className="text-gray-500">Memuat data...</p>
                </div>
            ) : isError ? (
                <div className="flex h-[400px] flex-col items-center justify-center space-y-4">
                    <p className="text-red-500">Gagal memuat data biaya</p>
                    <button onClick={() => router.back()} className="text-blue-500 underline">Kembali</button>
                </div>
            ) : bbnData ? (
                <BBNForm 
                    initialData={bbnData}
                    title="Edit Data Biaya" 
                    onSubmit={handleSubmit} 
                    isSubmitting={isSubmitting} 
                />
            ) : null}
        </DashboardLayout>
    );
}
