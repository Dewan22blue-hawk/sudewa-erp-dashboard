import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DOEkspedisiForm, DOEkspedisiFormData } from '@/components/features/do-ekspedisi/DOEkspedisiForm';
import { DUMMY_DO_EKSPEDISI, setDummyDOs } from '@/components/features/do-ekspedisi/do-ekspedisi.data';
import { toast } from 'sonner';
import { useRouter } from 'next/router';
import { ChevronLeft } from 'lucide-react';

export default function CreateDOEkspedisiPage() {
    const router = useRouter();
    const { slug } = router.query;

    const handleSave = (data: DOEkspedisiFormData) => {
        const newId = DUMMY_DO_EKSPEDISI.length > 0 ? Math.max(...DUMMY_DO_EKSPEDISI.map(d => d.id)) + 1 : 1;

        // Auto-generate Kode DO if not provided.
        const generatedKodeDO = data.kodeDO || `DOE-WJR${newId.toString().padStart(6, '0')}`;

        const newEntry = { id: newId, ...data, kodeDO: generatedKodeDO };

        setDummyDOs([newEntry, ...DUMMY_DO_EKSPEDISI]);

        toast.success('Data DO Ekspedisi berhasil ditambahkan');
        if (slug) {
            router.push(`/dashboard/${slug}/do-ekspedisi`);
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
                        <h1 className="text-xl font-semibold text-gray-900">Form Data Ekspedisi</h1>
                        <p className="text-sm text-gray-500">Masukkan detail data ekspedisi baru</p>
                    </div>
                </div>

                <DOEkspedisiForm title="Tambah DO Ekspedisi" onSubmit={handleSave} />
            </div>
        </DashboardLayout>
    );
}
