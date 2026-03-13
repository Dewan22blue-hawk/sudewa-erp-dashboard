import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ArmadaForm, ArmadaFormData } from '@/components/features/armada/ArmadaForm';
import { Armada, DUMMY_ARMADAS, setDummyArmadas } from '@/components/features/armada/armada.data';
import { toast } from 'sonner';
import { useRouter } from 'next/router';
import { ChevronLeft } from 'lucide-react';

export default function EditArmadaPage() {
    const router = useRouter();
    const { slug, id } = router.query;
    const [initialData, setInitialData] = useState<Armada | null>(null);

    useEffect(() => {
        if (id) {
            const numId = Number(id);
            const found = DUMMY_ARMADAS.find(a => a.id === numId);
            if (found) {
                setInitialData(found);
            } else {
                toast.error('Data armada tidak ditemukan');
                router.push(`/dashboard/${slug}/master/armada`);
            }
        }
    }, [id, slug, router]);

    const handleSave = (data: ArmadaFormData) => {
        if (!initialData) return;

        // Update dummy data store
        const updated = DUMMY_ARMADAS.map(d => d.id === initialData.id ? { ...d, ...data } : d);
        setDummyArmadas(updated);

        toast.success('Data armada berhasil diubah');
        if (slug) {
            router.push(`/dashboard/${slug}/master/armada`);
        }
    };

    if (!initialData) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">Memuat data...</p>
                </div>
            </DashboardLayout>
        );
    }

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
                        <h1 className="text-xl font-semibold text-gray-900">Detail Armada</h1>
                        <p className="text-sm text-gray-500">Nomor Polisi <span className="text-[#1e3a5f] font-medium">{initialData.noPolisi}</span></p>
                    </div>
                </div>

                <ArmadaForm title="Edit Armada" initialData={initialData} onSubmit={handleSave} />
            </div>
        </DashboardLayout>
    );
}
