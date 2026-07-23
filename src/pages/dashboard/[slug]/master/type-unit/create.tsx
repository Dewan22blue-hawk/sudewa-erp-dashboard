import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useCreateTypeUnit } from '@/hooks/useTypeUnit';
import { typeUnitSchema, type TypeUnitFormValues } from '@/scheme/type-unit.schema';
import { TypeUnitForm } from '@/components/features/type-unit/TypeUnitForm';
import { ChevronRight } from 'lucide-react';

export default function CreateTypeUnitPage() {
  const router = useRouter();
  const createTypeUnit = useCreateTypeUnit();
  const slug = typeof router.query.slug === 'string' ? router.query.slug : '';

  const form = useForm<TypeUnitFormValues>({
    resolver: zodResolver(typeUnitSchema),
    defaultValues: {
      code: '',
      brandId: 0,
      name: '',
      unitType: '',
      unitModel: '',
      brutoWeight: undefined,
      nettoWeight: undefined,
      capacity: undefined,
      image: null,
      sellPrice: undefined,
      buyPrice: undefined,
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
      router.push(`/dashboard/${slug}/master/type-unit`);
    } catch (error) {
      console.error('Failed to create type unit:', error);
      toast.error('Gagal menambahkan data tipe unit');
    }
  };

  const handleCancel = () => {
    router.push(`/dashboard/${slug}/master/type-unit`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* BREADCRUMB HEADER */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="hover:text-foreground cursor-pointer" onClick={handleCancel}>
            Tipe Unit
          </span>
          <ChevronRight className="h-4 w-4 shrink-0" />
          <span className="font-medium text-foreground">Tambah Tipe Unit</span>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-slate-950">Tambahkan Tipe Unit</h1>
          <p className="text-sm text-muted-foreground">Masukkan detail tipe baru</p>
        </div>

        {/* FORM CARD */}
        <Card className="rounded-md p-6">
          <TypeUnitForm form={form} onSubmit={onSubmit} onCancel={handleCancel} isSubmitting={createTypeUnit.isPending} submitLabel="Simpan" />
        </Card>
      </div>
    </DashboardLayout>
  );
}
