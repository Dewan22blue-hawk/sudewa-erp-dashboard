import { useState } from 'react';
import { useRouter } from 'next/router';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card } from '@/components/ui/card';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AccountGroupTable } from './AccountGroupTable';
import { useAccountGroups, useDeleteAccountGroup } from '@/hooks/useAccountGroup';
import { useQueryParamsTable } from '@/hooks/useQueryParamsTable';
import type { AccountGroup } from '@/@types/account-group.types';
import { toast } from 'sonner';
import { ApiResponseError } from '@/lib/api/response';

export const AccountGroupListPage = () => {
  const router = useRouter();
  const { page, perPage, search, setPage, setPerPage, setSearch } = useQueryParamsTable({ defaultPerPage: 10 });

  const { data, isLoading, isError, isFetching } = useAccountGroups({ page, perPage, search });
  const deleteMutation = useDeleteAccountGroup();

  const [selected, setSelected] = useState<AccountGroup | null>(null);

  const handleDelete = async () => {
    if (!selected) return;
    try {
      await deleteMutation.mutateAsync(selected.id);
      toast.success('Grup akun berhasil dihapus');
    } catch (error) {
      const message = error instanceof ApiResponseError ? error.message : 'Gagal menghapus grup akun';
      toast.error(message);
    } finally {
      setSelected(null);
    }
  };

  const handleEdit = (item: AccountGroup) => router.push(`/master-data/account-group/${item.id}/edit`);
  const handleAdd = () => router.push('/master-data/account-group/create');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Grup Akun</h1>
            <p className="text-sm text-muted-foreground">Kelola grup akun untuk mengatur akun transaksi</p>
          </div>
        </div>

        <Card className="p-6">
          {isError ? (
            <div className="text-center text-red-600">Gagal memuat data grup akun</div>
          ) : (
            <AccountGroupTable
              data={data?.data ?? []}
              meta={data?.meta}
              search={search}
              page={page}
              perPage={perPage}
              isLoading={isLoading || isFetching}
              onSearchChange={setSearch}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={setSelected}
              onPageChange={setPage}
              onPerPageChange={setPerPage}
            />
          )}
        </Card>
      </div>

      <AlertDialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
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
