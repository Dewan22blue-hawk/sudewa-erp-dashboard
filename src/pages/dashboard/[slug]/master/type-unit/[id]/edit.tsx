import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useTypeUnit, useUpdateTypeUnit } from '@/hooks/useTypeUnit';
import { typeUnitSchema, type TypeUnitFormValues } from '@/scheme/type-unit.schema';
import { TypeUnitForm } from '@/components/features/type-unit/TypeUnitForm';
import { ChevronLeft } from 'lucide-react';

export default function EditTypeUnitPage() {
  const router = useRouter();
  const { id } = router.query;
  const { data: typeUnit, isLoading, isError } = useTypeUnit(id as string);
  const updateTypeUnit = useUpdateTypeUnit();

  const form = useForm<TypeUnitFormValues>({
    resolver: zodResolver(typeUnitSchema),
    defaultValues: {
      code: '',
      brandId: undefined,
      name: '',
      unitType: '',
      unitModel: '',
      brutoWeight: undefined,
      nettoWeight: undefined,
      capacity: undefined,
      image: null,
    },
  });

  // Reset form when data is loaded
  useEffect(() => {
    if (typeUnit) {
      form.reset({
        code: typeUnit.code ?? '',
        // brandId can come from either brandId or nested brand
        brandId: typeUnit.brandId ?? typeUnit.brand?.id,
        name: typeUnit.name ?? '',
        unitType: typeUnit.unitType ?? '',
        unitModel: typeUnit.unitModel ?? '',
        brutoWeight: typeUnit.brutoWeight ?? undefined,
        nettoWeight: typeUnit.nettoWeight ?? undefined,
        capacity: typeUnit.capacity ?? undefined,
        image: null,
      });
    }
  }, [typeUnit, form]);

  const onSubmit = async (values: TypeUnitFormValues) => {
    if (!id) return;
    const slug = router.query.slug as string;
    if (!values.brandId) {
      toast.error('Brand ID wajib diisi');
      return;
    }

    try {
      await updateTypeUnit.mutateAsync({
        id: id as string,
        payload: {
          ...values,
          brandId: Number(values.brandId),
          brutoWeight: values.brutoWeight ?? null,
          nettoWeight: values.nettoWeight ?? null,
          capacity: values.capacity ?? null,
        },
      });
      toast.success('Data berhasil diperbarui');
      router.push(`/dashboard/${slug}/master/type-unit`);
    } catch (error) {
      console.error('Failed to update type unit:', error);
      toast.error('Gagal memperbarui data tipe unit');
    }
  };

  const handleCancel = () => {
    const slug = router.query.slug as string;
    router.push(`/dashboard/${slug}/master/type-unit`);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="text-center text-muted-foreground p-10">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !typeUnit) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="text-center text-destructive p-10">Data tidak ditemukan atau terjadi kesalahan</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-muted p-2 cursor-pointer hover:bg-muted/80 transition-colors" onClick={handleCancel}>
            <ChevronLeft className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Edit Tipe Unit</h1>
            <p className="text-sm text-muted-foreground">Ubah detail tipe unit</p>
          </div>
        </div>

        {/* FORM CARD */}
        <Card className="rounded-xl p-8">
          <TypeUnitForm form={form} onSubmit={onSubmit} onCancel={handleCancel} isSubmitting={updateTypeUnit.isPending} submitLabel="Perbarui" />
        </Card>
      </div>
    </DashboardLayout>
  );
}
