import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AccountForm } from './AccountForm';
import { accountSchema, type AccountFormValues } from '@/scheme/account-master.schema';
import { useAccountGroups } from '@/hooks/useAccountGroup';
import { useCreateAccount } from '@/hooks/useAccount';
import { ApiValidationError } from '@/lib/api/response';
import { toast } from 'sonner';

export const AccountCreatePage = () => {
  const router = useRouter();
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

  const { data: accountGroupsData, isLoading: isLoadingGroups } = useAccountGroups({ page: 1, perPage: 100, search: '' });
  const createMutation = useCreateAccount();

  const handleSubmit = async (values: AccountFormValues) => {
    try {
      await createMutation.mutateAsync({
        accountGroupId: values.accountGroupId,
        code: values.code,
        name: values.name,
        description: values.description,
        isActive: values.isActive,
      });
      toast.success('Akun berhasil dibuat');
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
      toast.error('Gagal membuat akun');
    }
  };

  const accountGroups = accountGroupsData?.data ?? [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Tambah Akun</h1>
            <p className="text-sm text-muted-foreground">Buat akun baru dan hubungkan ke grup akun</p>
          </div>
        </div>

        <Card className="p-6">
          <AccountForm form={form} accountGroups={accountGroups} onSubmit={handleSubmit} onCancel={() => router.push('/master-data/account')} isSubmitting={createMutation.isPending} submitLabel="Simpan" />
          {isLoadingGroups && <p className="mt-3 text-sm text-muted-foreground">Memuat opsi grup akun...</p>}
        </Card>
      </div>
    </DashboardLayout>
  );
};
