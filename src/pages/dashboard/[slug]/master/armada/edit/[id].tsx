import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ArmadaForm } from '@/components/features/armada/ArmadaForm';
import { toast } from 'sonner';
import { useRouter } from 'next/router';
import { ChevronLeft } from 'lucide-react';
import { useArmadaDetail, useUpdateArmada } from '@/hooks/useArmada';
import type { ArmadaPayload } from '@/@types/armada.types';
import { ApiValidationError } from '@/lib/api/response';
import type { ApiError } from '@/@types/api';

const extractValidationMessages = (error: unknown) => {
  if (error instanceof ApiValidationError) {
    const messages = Object.entries(error.fieldErrors ?? {}).flatMap(([field, fieldMessages]) =>
      (fieldMessages ?? []).map((message) => `${field}: ${message}`),
    );

    return {
      title: error.message || 'Validation error',
      description: messages.join('\n'),
    };
  }

  const apiError = error as ApiError & {
    fieldErrors?: Record<string, string[]>;
    response?: { data?: { errors?: Record<string, string[]>; message?: string } };
  };

  const rawFieldErrors =
    apiError?.fieldErrors ??
    apiError?.response?.data?.errors ??
    (typeof apiError?.details === 'object' && apiError.details ? (apiError.details as Record<string, string[]>) : undefined);

  if (rawFieldErrors && typeof rawFieldErrors === 'object') {
    const messages = Object.entries(rawFieldErrors).flatMap(([field, fieldMessages]) => {
      if (Array.isArray(fieldMessages)) {
        return fieldMessages.map((message) => `${field}: ${message}`);
      }
      return [`${field}: ${String(fieldMessages)}`];
    });

    return {
      title: apiError?.message || apiError?.response?.data?.message || 'Validation error',
      description: messages.join('\n'),
    };
  }

  return {
    title: apiError?.message || 'Gagal menyimpan data armada',
    description: '',
  };
};

export default function EditArmadaPage() {
  const router = useRouter();
  const { slug, id } = router.query;
  const { data: initialData, isLoading, isError } = useArmadaDetail(id ? String(id) : null);
  const updateMutation = useUpdateArmada();

  const handleSave = async (payload: ArmadaPayload) => {
    if (!id) return;

    try {
      await updateMutation.mutateAsync({ id: String(id), payload });
      toast.success('Data armada berhasil diubah');
      if (slug) {
        router.push(`/dashboard/${slug}/master/armada`);
      }
    } catch (error: any) {
      const validation = extractValidationMessages(error);
      toast.error(validation.title, {
        description: validation.description || undefined,
      });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <p className="text-gray-500">Memuat data...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !initialData) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <p className="text-red-500">Gagal memuat data armada</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <button onClick={() => router.back()} className="rounded-md p-1 transition-colors hover:bg-gray-100">
            <ChevronLeft className="h-5 w-5 text-gray-500" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Detail Armada</h1>
            <p className="text-sm text-gray-500">
              Nomor Polisi <span className="font-medium text-[#1e3a5f]">{initialData.registrationNumber}</span>
            </p>
          </div>
        </div>

        <ArmadaForm title="Edit Armada" initialData={initialData} onSubmit={handleSave} isSubmitting={updateMutation.isPending} />
      </div>
    </DashboardLayout>
  );
}
