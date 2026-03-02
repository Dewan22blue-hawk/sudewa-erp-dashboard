import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AccountGroupForm } from './AccountGroupForm';
import { accountGroupSchema, type AccountGroupFormValues } from '@/scheme/account-group.schema';
import { useAccountGroup, useUpdateAccountGroup } from '@/hooks/useAccountGroup';
import { ApiValidationError } from '@/lib/api/response';
import { toast } from 'sonner';

export const AccountGroupEditPage = () => {
  const router = useRouter();
  const id = router.query.id as string | undefined;

  const { data, isLoading, isError } = useAccountGroup(id);
  const updateMutation = useUpdateAccountGroup();

  const form = useForm<AccountGroupFormValues>({
    resolver: zodResolver(accountGroupSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      isActive: true,
    } satisfies Partial<AccountGroupFormValues>,
  });

  useEffect(() => {
    if (data) {
      form.reset({
        code: data.code,
        name: data.name,
        description: data.description ?? '',
        isActive: data.isActive,
      });
    }
  }, [data, form]);

  const handleSubmit = async (values: AccountGroupFormValues) => {
    if (!id) return;
    try {
      await updateMutation.mutateAsync({ id, payload: values });
      toast.success('Grup akun berhasil diperbarui');
      router.push('/master-data/account-group');
    } catch (error) {
      if (error instanceof ApiValidationError) {
        Object.entries(error.fieldErrors).forEach(([field, messages]) => {
          form.setError(field as keyof AccountGroupFormValues, { message: messages?.[0] || 'Validasi gagal' });
        });
        toast.error(error.message || 'Validasi gagal');
        return;
      }
      toast.error('Gagal memperbarui grup akun');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <Card className="p-6">Memuat data...</Card>
      </DashboardLayout>
    );
  }

  if (isError || !data) {
    return (
      <DashboardLayout>
        <Card className="p-6 text-red-600">Gagal memuat detail grup akun</Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Edit Grup Akun</h1>
            <p className="text-sm text-muted-foreground">Perbarui informasi grup akun</p>
          </div>
        </div>

        <Card className="p-6">
          <AccountGroupForm form={form} onSubmit={handleSubmit} onCancel={() => router.push('/master-data/account-group')} isSubmitting={updateMutation.isPending} submitLabel="Perbarui" />
        </Card>
      </div>
    </DashboardLayout>
  );
};
