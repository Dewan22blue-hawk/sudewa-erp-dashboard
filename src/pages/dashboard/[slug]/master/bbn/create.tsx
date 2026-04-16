import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BBNForm } from '@/components/features/bbn/BBNForm';
import { useCreateBBN } from '@/hooks/useBBN';
import type { BBNPayload } from '@/@types/bbn.types';
import { toast } from 'sonner';

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
        } catch (error: any) {
            toast.error(error.message || 'Gagal menyimpan data');
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
