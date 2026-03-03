import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useCreateTypeUnit } from '@/hooks/useTypeUnit';
import { typeUnitSchema, type TypeUnitFormValues } from '@/scheme/type-unit.schema';
import { TypeUnitForm } from '@/components/features/type-unit/TypeUnitForm';
import { ChevronLeft } from 'lucide-react';

export default function CreateTypeUnitPage() {
  const router = useRouter();
  const createTypeUnit = useCreateTypeUnit();

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

  const onSubmit = async (values: TypeUnitFormValues) => {
    if (!values.brandId) {
      toast.error('Brand ID wajib diisi');
      return;
    }

    try {
      await createTypeUnit.mutateAsync({
        ...values,
        brandId: Number(values.brandId),
        brutoWeight: values.brutoWeight ?? null,
        nettoWeight: values.nettoWeight ?? null,
        capacity: values.capacity ?? null,
      });
      toast.success('Data berhasil ditambahkan');
      const slug = router.query.slug as string;
      router.push(`/dashboard/${slug}/master/type-unit`);
    } catch (error) {
      console.error('Failed to create type unit:', error);
      toast.error('Gagal menambahkan data tipe unit');
    }
  };

  const handleCancel = () => {
    const slug = router.query.slug as string;
    router.push(`/dashboard/${slug}/master/type-unit`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-muted p-2 cursor-pointer hover:bg-muted/80 transition-colors" onClick={handleCancel}>
            <ChevronLeft className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Tambahkan Tipe Unit</h1>
            <p className="text-sm text-muted-foreground">Masukkan detail tipe baru</p>
          </div>
        </div>

        {/* FORM CARD */}
        <Card className="rounded-xl p-8">
          <TypeUnitForm form={form} onSubmit={onSubmit} onCancel={handleCancel} isSubmitting={createTypeUnit.isPending} submitLabel="Simpan" />
        </Card>
      </div>
    </DashboardLayout>
  );
}
