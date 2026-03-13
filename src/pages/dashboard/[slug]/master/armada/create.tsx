import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ArmadaForm, ArmadaFormData } from '@/components/features/armada/ArmadaForm';
import { DUMMY_ARMADAS, setDummyArmadas } from '@/components/features/armada/armada.data';
import { toast } from 'sonner';
import { useRouter } from 'next/router';
import { ChevronLeft } from 'lucide-react';

export default function CreateArmadaPage() {
    const router = useRouter();
    const { slug } = router.query;

    const handleSave = (data: ArmadaFormData) => {
        const newId = DUMMY_ARMADAS.length > 0 ? Math.max(...DUMMY_ARMADAS.map(d => d.id)) + 1 : 1;
        const newEntry = { id: newId, ...data };

        // Push state manually
        setDummyArmadas([newEntry, ...DUMMY_ARMADAS]);

        toast.success('Data armada berhasil ditambahkan');
        if (slug) {
            router.push(`/dashboard/${slug}/master/armada`);
        }
    };

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
                        <p className="text-sm text-gray-500">Tambah armada baru</p>
                    </div>
                </div>

                <ArmadaForm title="Tambah Armada" onSubmit={handleSave} />
            </div>
        </DashboardLayout>
    );
}
