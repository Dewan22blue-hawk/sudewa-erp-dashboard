import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DOEkspedisiDetailForm, DOEkspedisiDetailFormData } from '@/components/features/do-ekspedisi/DOEkspedisiDetailForm';
import { DOEkspedisi, DUMMY_DO_EKSPEDISI, DUMMY_DO_DETAILS, setDummyDODetails } from '@/components/features/do-ekspedisi/do-ekspedisi.data';
import { toast } from 'sonner';
import { useRouter } from 'next/router';
import { ChevronLeft } from 'lucide-react';

export default function CreateDOEkspedisiDetailPage() {
    const router = useRouter();
    const { slug, id } = router.query;

    const [doData, setDoData] = useState<DOEkspedisi | null>(null);

    useEffect(() => {
        if (id) {
            const numId = Number(id);
            const foundDO = DUMMY_DO_EKSPEDISI.find(d => d.id === numId);
            if (foundDO) {
                setDoData(foundDO);
            } else {
                router.push(`/dashboard/${slug}/do-ekspedisi`);
            }
        }
    }, [id, slug, router]);

    const handleSave = (data: DOEkspedisiDetailFormData) => {
        if (!id) return;

        const newDetailId = DUMMY_DO_DETAILS.length > 0 ? Math.max(...DUMMY_DO_DETAILS.map(d => d.id)) + 1 : 1;
        const newEntry = { id: newDetailId, doId: Number(id), ...data };

        setDummyDODetails([newEntry, ...DUMMY_DO_DETAILS]);

        toast.success('Informasi Muatan DO Ekspedisi berhasil ditambahkan');
        if (slug && id) {
            router.push(`/dashboard/${slug}/do-ekspedisi/detail/${id}`);
        }
    };

    if (!doData) return null;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => router.back()}
                        className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5 text-gray-500" />
                    </button>
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">Detail DO</h1>
                        <p className="text-sm text-gray-500">Nomor Polisi <span className="text-blue-600">{doData.noPolisi}</span></p>
                    </div>
                </div>

                <h3 className="text-lg font-medium">Form Detail DO</h3>
                <DOEkspedisiDetailForm onSubmit={handleSave} />
            </div>
        </DashboardLayout>
    );
}
