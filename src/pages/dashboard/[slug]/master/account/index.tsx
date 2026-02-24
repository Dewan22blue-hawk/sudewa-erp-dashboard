import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAccounts, useDeleteAccount, useCreateAccount, useUpdateAccount } from '@/hooks/useAccount';
import { useCompany } from '@/contexts/CompanyContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { Account, AccountType } from '@/@types/account.types';
import { z } from 'zod';
import { AccountFormModal } from '@/components/features/account/AccountFormModal';
import { DeleteAccountDialog } from '@/components/features/account/DeleteAccountDialog';
import { AccountTable } from '@/components/features/account/AccountTable';
import { toast } from 'sonner';

type FilterTab = 'ALL' | AccountType;

const createAccountModalSchema = z.object({
  code: z.string().min(1, 'Kode akun wajib diisi'),
  group: z.string().min(1, 'Grup akun wajib diisi'),
  category: z.enum(['DEBET', 'KREDIT']),
  description: z.string().min(1, 'Deskripsi wajib diisi'),
});

type CreateAccountModalFormValues = z.infer<typeof createAccountModalSchema>;

export default function AccountPage() {
  const { companyId } = useCompany();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('ALL');

  const deleteAccount = useDeleteAccount();
  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();

  // Modal & Dialog states
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    mode: 'CREATE' | 'EDIT';
    account?: Account;
  }>({ isOpen: false, mode: 'CREATE' });

  const [deleteConfig, setDeleteConfig] = useState<{
    isOpen: boolean;
    account?: Account;
  }>({ isOpen: false });

  // Shared form instance for both Create and Edit
  const form = useForm<CreateAccountModalFormValues>({
    resolver: zodResolver(createAccountModalSchema),
    defaultValues: { code: '', group: '', category: 'DEBET', description: '' },
  });

  const handleOpenCreateModal = () => {
    form.reset({ code: '', group: '', category: 'DEBET', description: '' });
    setModalConfig({ isOpen: true, mode: 'CREATE' });
  };

  const handleOpenEditModal = (account: Account) => {
    form.reset({
      code: account.code,
      group: account.group,
      category: account.category,
      description: account.description,
    });
    setModalConfig({ isOpen: true, mode: 'EDIT', account });
  };

  const handleCloseModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  const onSubmit = async (values: CreateAccountModalFormValues) => {
    try {
      if (modalConfig.mode === 'CREATE') {
        if (!companyId) return;

        await createAccount.mutateAsync({
          ...values,
          accountType: 'AKTIVA',
          isActive: true,
          companyId,
        });
        toast.success('Data berhasil ditambahkan');
      } else if (modalConfig.mode === 'EDIT' && modalConfig.account) {
        await updateAccount.mutateAsync({
          id: modalConfig.account.id,
          payload: {
            ...values,
            accountType: modalConfig.account.accountType,
            parentId: modalConfig.account.parentId,
            isActive: modalConfig.account.isActive,
          },
        });
        toast.success('Data berhasil diperbarui');
      }
      handleCloseModal();
    } catch (error: any) {
      if (error?.message === 'Kode akun sudah digunakan') {
        form.setError('code', { type: 'manual', message: 'Kode akun sudah digunakan' });
      } else {
        toast.error(`Gagal ${modalConfig.mode === 'CREATE' ? 'menambahkan' : 'memperbarui'} data akun`);
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfig.account) return;
    try {
      await deleteAccount.mutateAsync(deleteConfig.account.id);
      setDeleteConfig({ isOpen: false });
      toast.success('Data berhasil dihapus');
    } catch {
      toast.error('Gagal menghapus data akun');
    }
  };

  const filter = activeFilter === 'ALL' ? undefined : activeFilter;
  const { data, isLoading, isFetching, isError } = useAccounts(companyId, filter);

  if (isError) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Akun</h1>
              <p className="text-sm text-muted-foreground">Kelola akun finance dengan mudah</p>
            </div>
          </div>
          <Card className="rounded-xl p-6">
            <div className="text-center text-destructive">Gagal memuat data</div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Akun</h1>
            <p className="text-sm text-muted-foreground">Kelola akun finance dengan mudah</p>
          </div>

          <Button onClick={handleOpenCreateModal} className="gap-2">
            <Plus className="h-4 w-4" />
            Tambah
          </Button>
        </div>

        {/* CONTENT CARD */}
        <Card className="rounded-xl overflow-hidden">
          <div className="p-6 space-y-6">
            {/* FILTER TABS */}
            <div className="flex items-center gap-2">
              {(['ALL', 'AKTIVA', 'PASIVA'] as const).map((tab) => (
                <Button
                  key={tab}
                  variant={activeFilter === tab ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveFilter(tab)}
                >
                  {tab === 'ALL' ? 'Semua' : tab === 'AKTIVA' ? 'Aktiva' : 'Pasiva'}
                </Button>
              ))}
            </div>

            {/* TABLE COMPONENT */}
            <AccountTable
              data={data?.data}
              total={data?.meta.total}
              isLoading={isLoading || isFetching}
              onEdit={handleOpenEditModal}
              onDelete={(account) => setDeleteConfig({ isOpen: true, account })}
            />
          </div>
        </Card>
      </div>

      <DeleteAccountDialog
        open={deleteConfig.isOpen}
        onOpenChange={(isOpen) => setDeleteConfig((prev) => ({ ...prev, isOpen }))}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteAccount.isPending}
      />

      <AccountFormModal
        open={modalConfig.isOpen}
        onOpenChange={(isOpen) => setModalConfig((prev) => ({ ...prev, isOpen }))}
        form={form}
        onSubmit={onSubmit}
        title={modalConfig.mode === 'CREATE' ? 'Tambah Data Akun Transaksi' : 'Edit Data Akun Transaksi'}
        description={modalConfig.mode === 'CREATE' ? 'Masukkan detail akun baru' : 'Perbarui detail akun'}
        submitLabel={modalConfig.mode === 'CREATE' ? 'Simpan' : 'Perbarui'}
        isSubmitting={createAccount.isPending || updateAccount.isPending}
      />
    </DashboardLayout>
  );
}
