import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AccountForm } from './AccountForm';
import { accountSchema, type AccountFormValues } from '@/scheme/account-master.schema';
import { useAccount } from '@/hooks/useAccount';
import { useAccountGroups } from '@/hooks/useAccountGroup';
import { useUpdateAccount } from '@/hooks/useAccount';
import { ApiValidationError } from '@/lib/api/response';
import { toast } from 'sonner';

export const AccountEditPage = () => {
  const router = useRouter();
  const id = router.query.id as string | undefined;

  const { data, isLoading, isError } = useAccount(id);
  const { data: accountGroupsData, isLoading: isLoadingGroups } = useAccountGroups({ page: 1, perPage: 100, search: '' });
  const updateMutation = useUpdateAccount();

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      accountGroupId: undefined,
      code: '',
      name: '',
      description: '',
      isActive: true,
    } satisfies Partial<AccountFormValues>,
  });

  useEffect(() => {
    if (data) {
      form.reset({
        accountGroupId: Number(data.accountGroupId),
        code: data.code,
        name: data.name,
        description: data.description ?? '',
        isActive: data.isActive,
      });
    }
  }, [data, form]);

  const handleSubmit = async (values: AccountFormValues) => {
    if (!id) return;
    try {
      await updateMutation.mutateAsync({ id, payload: values });
      toast.success('Akun berhasil diperbarui');
      router.push('/master-data/account');
    } catch (error) {
      if (error instanceof ApiValidationError) {
        Object.entries(error.fieldErrors).forEach(([field, messages]) => {
          const mappedField = field === 'account_group_id' ? 'accountGroupId' : field;
          form.setError(mappedField as keyof AccountFormValues, { message: messages?.[0] || 'Validasi gagal' });
        });
        toast.error(error.message || 'Validasi gagal');
        return;
      }
      toast.error('Gagal memperbarui akun');
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
        <Card className="p-6 text-red-600">Gagal memuat detail akun</Card>
      </DashboardLayout>
    );
  }

  const accountGroups = accountGroupsData?.data ?? [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Edit Akun</h1>
            <p className="text-sm text-muted-foreground">Perbarui informasi akun</p>
          </div>
        </div>

        <Card className="p-6">
          <AccountForm form={form} accountGroups={accountGroups} onSubmit={handleSubmit} onCancel={() => router.push('/master-data/account')} isSubmitting={updateMutation.isPending} submitLabel="Perbarui" />
          {isLoadingGroups && <p className="mt-3 text-sm text-muted-foreground">Memuat opsi grup akun...</p>}
        </Card>
      </div>
    </DashboardLayout>
  );
};
