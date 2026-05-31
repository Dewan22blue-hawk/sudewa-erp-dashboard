import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ArmadaForm } from '@/components/features/armada/ArmadaForm';
import { toast } from 'sonner';
import { useRouter } from 'next/router';
import { ChevronLeft } from 'lucide-react';
import { useCreateArmada } from '@/hooks/useArmada';
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

export default function CreateArmadaPage() {
  const router = useRouter();
  const { slug } = router.query;
  const createMutation = useCreateArmada();

  const handleSave = async (payload: ArmadaPayload) => {
    try {
      await createMutation.mutateAsync(payload);
      toast.success('Data armada berhasil ditambahkan');
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <button onClick={() => router.back()} className="rounded-md p-1 transition-colors hover:bg-gray-100">
            <ChevronLeft className="h-5 w-5 text-gray-500" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Detail Armada</h1>
            <p className="text-sm text-gray-500">Tambah armada baru</p>
          </div>
        </div>

        <ArmadaForm title="Tambah Armada" onSubmit={handleSave} isSubmitting={createMutation.isPending} />
      </div>
    </DashboardLayout>
  );
}
