import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AccountGroupTable } from './AccountGroupTable';
import { AccountGroupFormModal } from './AccountGroupFormModal';
import { useAccountGroups, useDeleteAccountGroup, useCreateAccountGroup, useUpdateAccountGroup } from '@/hooks/useAccountGroup';
import { useQueryParamsTable } from '@/hooks/useQueryParamsTable';
import type { AccountGroup } from '@/@types/account-group.types';
import { accountGroupSchema, type AccountGroupFormValues } from '@/scheme/account-group.schema';
import { toast } from 'sonner';
import { ApiResponseError, ApiValidationError } from '@/lib/api/response';
import { useCompany } from '@/contexts/CompanyContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Upload } from 'lucide-react';

export const AccountGroupListPage = () => {
  const { companyId } = useCompany();
  const { page, perPage, search, setPage, setPerPage, setSearch } = useQueryParamsTable({ defaultPerPage: 10 });

  const { data, isLoading, isError, isFetching } = useAccountGroups({
    page,
    perPage,
    search,
    company_id: companyId ?? undefined,
    enabled: !!companyId,
  });
  const createMutation = useCreateAccountGroup();
  const updateMutation = useUpdateAccountGroup();
  const deleteMutation = useDeleteAccountGroup();

  const [selectedToDelete, setSelectedToDelete] = useState<AccountGroup | null>(null);
  const [editing, setEditing] = useState<AccountGroup | null>(null);
  const [openForm, setOpenForm] = useState(false);

  const form = useForm<AccountGroupFormValues>({
    resolver: zodResolver(accountGroupSchema),
    defaultValues: {
      group_code: '',
      description: '',
    },
  });

  const handleDelete = async () => {
    if (!selectedToDelete) return;
    try {
      await deleteMutation.mutateAsync(selectedToDelete.id);
      toast.success('Grup akun berhasil dihapus');
    } catch (error) {
      const message = error instanceof ApiResponseError ? error.message : 'Gagal menghapus grup akun';
      toast.error(message);
    } finally {
      setSelectedToDelete(null);
    }
  };

  const handleAdd = () => {
    setEditing(null);
    form.reset({
      group_code: '',
      description: '',
    });
    setOpenForm(true);
  };

  const handleEdit = (item: AccountGroup) => {
    setEditing(item);
    form.reset({
      group_code: item.code,
      description: item.description ?? '',
    });
    setOpenForm(true);
  };

  const handleSubmit = async (values: AccountGroupFormValues) => {
    if (!companyId) {
      toast.error('ID Perusahaan tidak ditemukan');
      return;
    }

    const payload = {
      ...values,
      company_id: companyId,
    };

    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, payload });
        toast.success('Grup akun berhasil diperbarui');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Grup akun berhasil dibuat');
      }
      setOpenForm(false);
      setEditing(null);
    } catch (error) {
      if (error instanceof ApiValidationError) {
        Object.entries(error.fieldErrors).forEach(([field, messages]) => {
          const fieldName = field === 'group_code' ? 'group_code' : field;
          form.setError(fieldName as any, { message: messages?.[0] || 'Validasi gagal' });
        });
        toast.error(error.message || 'Validasi gagal');
        return;
      }
      toast.error(editing ? 'Gagal memperbarui grup akun' : 'Gagal membuat grup akun');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Grup Akun</h1>
            <p className="text-sm text-muted-foreground">Kelola grup akun untuk mengatur akun transaksi</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <div className="relative w-64 text-gray-400 focus-within:text-gray-900">
              <Input
                placeholder="Search here"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-3 h-10 border-gray-200 rounded-lg text-gray-900"
              />
            </div>
            <div className="flex flex-row gap-2">
              <Button onClick={() => {}} className="gap-2" variant="outline">
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
            <div className="text-center text-red-600">Gagal memuat data grup akun</div>
          ) : (
            <AccountGroupTable
              data={data?.data ?? []}
              meta={data?.meta}
              page={page}
              perPage={perPage}
              isLoading={isLoading || isFetching}
              onEdit={handleEdit}
              onDelete={setSelectedToDelete}
              onPageChange={setPage}
              onPerPageChange={setPerPage}
            />
          )}
        </div>
      </div>

      <AccountGroupFormModal
        open={openForm}
        onOpenChange={setOpenForm}
        form={form}
        onSubmit={handleSubmit}
        title={editing ? 'Edit Grup Akun' : 'Tambah Grup Akun'}
        description={editing ? 'Perbarui informasi grup akun' : 'Buat grup akun baru untuk mengelompokkan akun'}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        submitLabel={editing ? 'Perbarui' : 'Simpan'}
      />

      <AlertDialog open={!!selectedToDelete} onOpenChange={(open) => !open && setSelectedToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Grup Akun?</AlertDialogTitle>
            <AlertDialogDescription>Data yang dihapus tidak dapat dikembalikan.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700" disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};
