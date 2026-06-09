import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BBNForm } from '@/components/features/bbn/BBNForm';
import { useCreateBBN } from '@/hooks/useBBN';
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

export default function CreateBBNPage() {
    const router = useRouter();
    const slug = router.query.slug as string;
    const createMutation = useCreateBBN();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: BBNPayload) => {
        setIsSubmitting(true);
        try {
            await createMutation.mutateAsync(data);
            toast.success('Data biaya berhasil ditambahkan');
            router.push(`/dashboard/${slug}/master/bbn`);
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <BBNForm 
                title="Tambah Data Biaya" 
                onSubmit={handleSubmit} 
                isSubmitting={isSubmitting} 
            />
        </DashboardLayout>
    );
}
