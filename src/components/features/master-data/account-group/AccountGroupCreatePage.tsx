import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AccountGroupForm } from './AccountGroupForm';
import { accountGroupSchema, type AccountGroupFormValues } from '@/scheme/account-group.schema';
import { useCreateAccountGroup } from '@/hooks/useAccountGroup';
import { ApiValidationError } from '@/lib/api/response';
import { toast } from 'sonner';

export const AccountGroupCreatePage = () => {
  const router = useRouter();
  const form = useForm<AccountGroupFormValues>({
    resolver: zodResolver(accountGroupSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      isActive: true,
    } satisfies Partial<AccountGroupFormValues>,
  });

  const createMutation = useCreateAccountGroup();

  const handleSubmit = async (values: AccountGroupFormValues) => {
    try {
      await createMutation.mutateAsync(values);
      toast.success('Grup akun berhasil dibuat');
      router.push('/master-data/account-group');
    } catch (error) {
      if (error instanceof ApiValidationError) {
        Object.entries(error.fieldErrors).forEach(([field, messages]) => {
          form.setError(field as keyof AccountGroupFormValues, { message: messages?.[0] || 'Validasi gagal' });
        });
        toast.error(error.message || 'Validasi gagal');
        return;
      }
      toast.error('Gagal membuat grup akun');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Tambah Grup Akun</h1>
            <p className="text-sm text-muted-foreground">Buat grup akun baru untuk mengelompokkan akun</p>
          </div>
        </div>

        <Card className="p-6">
          <AccountGroupForm form={form} onSubmit={handleSubmit} onCancel={() => router.push('/master-data/account-group')} isSubmitting={createMutation.isPending} />
        </Card>
      </div>
    </DashboardLayout>
  );
};
