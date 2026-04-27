import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AccountTable } from '@/components/features/account/AccountTable';
import { AccountFormModal } from '@/components/features/account/AccountFormModal';
import { useAccounts, useCreateAccount, useDeleteAccount, useUpdateAccount } from '@/hooks/useAccount';
import { useAccountGroups } from '@/hooks/useAccountGroup';
import { useQueryParamsTable } from '@/hooks/useQueryParamsTable';
import type { Account } from '@/@types/account.types';
import { toast } from 'sonner';
import { Plus, Upload } from 'lucide-react';
import { ApiResponseError, ApiValidationError } from '@/lib/api/response';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { accountSchema, type AccountFormValues } from '@/scheme/account-master.schema';
import { useCompany } from '@/contexts/CompanyContext';
import { AccountImportModal } from '@/components/features/account/AccountImportModal';


export const AccountListPage = () => {
  const { companyId, isLoading: isLoadingCompany } = useCompany();
  const { page, perPage, search, setPage, setPerPage, setSearch } = useQueryParamsTable({ defaultPerPage: 10 });

  const { data, isLoading, isError, isFetching } = useAccounts({
    page,
    perPage,
    search,
    company_id: companyId ?? undefined,
    enabled: !isLoadingCompany && !!companyId,
  });
  const { data: accountGroupsData, isLoading: isLoadingGroups } = useAccountGroups({
    page: 1,
    perPage: 100,
    search: '',
    company_id: companyId ?? undefined,
    enabled: !isLoadingCompany && !!companyId,
  });

  const createMutation = useCreateAccount();
  const updateMutation = useUpdateAccount();
  const deleteMutation = useDeleteAccount();

  const [selected, setSelected] = useState<Account | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [openImport, setOpenImport] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      accountGroupId: undefined,
      code: '',
      name: '',
      description: '',
      type: 'debet',
      isActive: true,
    },
  });

  const accountGroups = accountGroupsData?.data ?? [];

  const resetForm = () => {
    form.reset({
      accountGroupId: undefined,
      code: '',
      name: '',
      description: '',
      type: 'debet',
      isActive: true,
    });
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      await deleteMutation.mutateAsync(selected.id);
      toast.success('Akun berhasil dihapus');
    } catch (error) {
      const message = error instanceof ApiResponseError ? error.message : 'Gagal menghapus akun';
      toast.error(message);
    } finally {
      setSelected(null);
    }
  };

  const handleAdd = () => {
    setEditing(null);
    resetForm();
    setOpenForm(true);
  };

  const handleEdit = (item: Account) => {
    setEditing(item);
    form.reset({
      accountGroupId: Number(item.accountGroupId),
      code: item.code,
      name: item.name,
      description: item.description ?? '',
      type: item.type === 'debit' ? 'debet' : (item.type ?? 'debet'),
      isActive: item.isActive,
    });
    setOpenForm(true);
  };

  const handleSubmit = async (values: AccountFormValues) => {
    const payload = {
      accountGroupId: values.accountGroupId,
      code: values.code,
      name: values.name,
      description: values.description,
      type: values.type,
    };

    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, payload });
        toast.success('Akun berhasil diperbarui');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Akun berhasil dibuat');
      }
      setOpenForm(false);
      setEditing(null);
      resetForm();
    } catch (error) {
      if (error instanceof ApiValidationError) {
        Object.entries(error.fieldErrors).forEach(([field, messages]) => {
          const mappedField = field === 'account_group_id' ? 'accountGroupId' : field;
          form.setError(mappedField as keyof AccountFormValues, { message: messages?.[0] || 'Validasi gagal' });
        });
        toast.error(error.message || 'Validasi gagal');
        return;
      }
      const message = error instanceof ApiResponseError ? error.message : 'Gagal menyimpan akun';
      toast.error(message);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Akun</h1>
            <p className="text-sm text-muted-foreground">Kelola akun transaksi dengan mudah</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <div className="relative w-64 text-gray-400 focus-within:text-gray-900">
              <Input placeholder="Search here" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-3 h-10 border-gray-200 rounded-lg text-gray-900" />
            </div>
            <div className="flex flex-row gap-2">
              <Button onClick={() => setOpenImport(true)} className="gap-2" variant="outline">
                <Upload className="h-4 w-4" />
                Import
              </Button>
              <Button onClick={handleAdd} className="gap-2">
                <Plus className="h-4 w-4" />
                Tambah
              </Button>
            </div>
          </div>

          {isError ? (
            <div className="text-center text-red-600">Gagal memuat data akun</div>
          ) : (
            <AccountTable data={data?.data ?? []} total={data?.meta.total} isLoading={isLoading || isFetching} onEdit={handleEdit} onDelete={setSelected} page={page} perPage={perPage} onPageChange={setPage} onPerPageChange={setPerPage} />
          )}
        </div>
      </div >

      <AlertDialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Akun?</AlertDialogTitle>
            <AlertDialogDescription>Tindakan ini akan menghapus akun secara permanen.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700" disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AccountFormModal
        open={openForm}
        onOpenChange={(open) => {
          setOpenForm(open);
          if (!open) {
            setEditing(null);
            resetForm();
          }
        }}
        form={form}
        onSubmit={handleSubmit}
        title={editing ? 'Edit Data Akun Transasaksi' : 'Tambah Data Akun Transasaksi'}
        description={editing ? 'Perbarui detail akun' : 'Masukkan detail akun baru'}
        submitLabel={editing ? 'Perbarui' : 'Simpan'}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        accountGroups={accountGroups}
        isLoadingGroups={isLoadingGroups}
      />

      <AccountImportModal
        open={openImport}
        onOpenChange={setOpenImport}
        companyId={companyId ?? ''}
      />
    </DashboardLayout >

  );
};
