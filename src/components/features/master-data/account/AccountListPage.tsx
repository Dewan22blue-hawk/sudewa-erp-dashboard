import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AccountTable } from '@/components/features/account/AccountTable';
import { AccountFormModal } from '@/components/features/account/AccountFormModal';
import { AccountImportModal } from '@/components/features/account/AccountImportModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAccounts, useCreateAccount, useDeleteAccount, useUpdateAccount } from '@/hooks/useAccount';
import { useAccountGroups } from '@/hooks/useAccountGroup';
import { useQueryParamsTable } from '@/hooks/useQueryParamsTable';
import { useCompany } from '@/contexts/CompanyContext';
import { accountSchema, type AccountFormValues } from '@/scheme/account-master.schema';
import type { Account } from '@/@types/account.types';
import { ACCOUNT_CATEGORY_OPTIONS, getAccountTypeFromCategory } from '@/lib/account';
import { ApiResponseError, ApiValidationError } from '@/lib/api/response';
import { toast } from 'sonner';
import { CircleAlert, Download, PencilLine, Plus, Search, Upload } from 'lucide-react';

type BulkFormValues = {
  accountGroupId: string;
  category: string;
};

const initialBulkFormValues: BulkFormValues = {
  accountGroupId: '',
  category: '',
};

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

  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [editing, setEditing] = useState<Account | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [openForm, setOpenForm] = useState(false);
  const [openImport, setOpenImport] = useState(false);
  const [openBulkUpdate, setOpenBulkUpdate] = useState(false);
  const [openBulkConfirm, setOpenBulkConfirm] = useState(false);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [bulkForm, setBulkForm] = useState<BulkFormValues>(initialBulkFormValues);

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      accountGroupId: undefined,
      code: '',
      name: '',
      description: '',
      category: undefined,
      isActive: true,
    },
  });

  const accountGroups = accountGroupsData?.data ?? [];
  const accounts = data?.data;
  const accountRows = accounts ?? [];
  const totalAccounts = data?.meta.total ?? 0;

  useEffect(() => {
    const availableIds = new Set((accounts ?? []).map((item) => String(item.id)));
    setSelectedIds((previous) => new Set(Array.from(previous).filter((id) => availableIds.has(id))));
  }, [accounts]);

  const resetForm = () => {
    form.reset({
      accountGroupId: undefined,
      code: '',
      name: '',
      description: '',
      category: undefined,
      isActive: true,
    });
  };

  const resetBulkForm = () => {
    setBulkForm(initialBulkFormValues);
  };

  const translateValidationMessage = (message: string, field: string): string => {
    const msg = message.toLowerCase();
    if (msg.includes('already been taken')) {
      if (field === 'code') return 'Kode akun sudah digunakan.';
      return 'Nilai ini sudah digunakan.';
    }
    if (msg.includes('required')) {
      if (field === 'code') return 'Kode akun wajib diisi.';
      if (field === 'name') return 'Nama akun wajib diisi.';
      if (field === 'account_group_id' || field === 'accountGroupId') return 'Grup akun wajib dipilih.';
      if (field === 'category') return 'Kategori laporan wajib dipilih.';
      return 'Kolom ini wajib diisi.';
    }
    if (msg.includes('invalid') || msg.includes('must be')) {
      if (field === 'category') return 'Kategori laporan yang dipilih tidak valid.';
      if (field === 'account_group_id' || field === 'accountGroupId') return 'Grup akun yang dipilih tidak valid.';
      return 'Nilai yang dimasukkan tidak valid.';
    }
    return message;
  };

  const mapValidationErrors = (error: ApiValidationError) => {
    Object.entries(error.fieldErrors).forEach(([field, messages]) => {
      const mappedField = field === 'account_group_id' ? 'accountGroupId' : field;
      const originalMessage = messages?.[0] || 'Validasi gagal';
      const translatedMessage = translateValidationMessage(originalMessage, field);
      form.setError(mappedField as keyof AccountFormValues, { message: translatedMessage });
    });
  };

  const handleAdd = () => {
    setEditing(null);
    resetForm();
    setOpenForm(true);
  };

  const handleEdit = (account: Account) => {
    setEditing(account);
    form.reset({
      accountGroupId: Number(account.accountGroupId),
      code: account.code,
      name: account.name,
      description: account.description ?? '',
      category: (account.category as AccountFormValues['category']) ?? undefined,
      isActive: account.isActive,
    });
    setOpenForm(true);
  };

  const handleSubmit = async (values: AccountFormValues) => {
    const payload = {
      accountGroupId: values.accountGroupId,
      code: values.code,
      name: values.name,
      description: values.description,
      category: values.category,
      type: getAccountTypeFromCategory(values.category),
    };

    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, payload });
        toast.success('Data akun berhasil diperbarui');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Data akun berhasil ditambahkan');
      }

      setOpenForm(false);
      setEditing(null);
      resetForm();
    } catch (error) {
      console.error('[Create/Update Account Error]:', error);
      if (error instanceof ApiValidationError) {
        mapValidationErrors(error);
        let mainMessage = error.message;
        if (mainMessage.toLowerCase().includes('validation') || mainMessage.toLowerCase().includes('given data was invalid')) {
          mainMessage = 'Gagal menyimpan data karena validasi tidak terpenuhi.';
        }
        toast.error(mainMessage);
        return;
      }

      const apiErrorMessage = (error as any)?.message || (error as any)?.details;
      const message = error instanceof ApiResponseError 
        ? error.message 
        : (typeof apiErrorMessage === 'string' ? apiErrorMessage : 'Gagal menyimpan akun');
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    if (!selectedAccount) return;

    try {
      await deleteMutation.mutateAsync(selectedAccount.id);
      toast.success('Data akun berhasil dihapus');
      setSelectedIds((previous) => {
        const next = new Set(previous);
        next.delete(String(selectedAccount.id));
        return next;
      });
    } catch (error) {
      const message = error instanceof ApiResponseError ? error.message : 'Gagal menghapus akun';
      toast.error(message);
    } finally {
      setSelectedAccount(null);
    }
  };

  const toggleRow = (id: string, checked: boolean) => {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const toggleAll = (checked: boolean) => {
    const currentPageIds = accountRows.map((item) => String(item.id));

    setSelectedIds((previous) => {
      const next = new Set(previous);
      currentPageIds.forEach((id) => {
        if (checked) {
          next.add(id);
        } else {
          next.delete(id);
        }
      });
      return next;
    });
  };

  const handleOpenBulkUpdate = () => {
    if (selectedIds.size === 0) {
      toast.error('Pilih akun terlebih dahulu');
      return;
    }

    resetBulkForm();
    setOpenBulkUpdate(true);
  };

  const handleBulkUpdateRequest = () => {
    if (!bulkForm.accountGroupId) {
      toast.error('Grup akun wajib dipilih');
      return;
    }

    if (!bulkForm.category) {
      toast.error('Kategori laporan wajib dipilih');
      return;
    }

    setOpenBulkConfirm(true);
  };

  const handleBulkUpdateConfirm = async () => {
    if (!bulkForm.accountGroupId || !bulkForm.category) return;

    const selectedRows = accountRows.filter((account) => selectedIds.has(String(account.id)));

    if (selectedRows.length === 0) {
      toast.error('Akun terpilih tidak ditemukan pada halaman ini');
      setOpenBulkConfirm(false);
      setOpenBulkUpdate(false);
      return;
    }

    setBulkSubmitting(true);

    try {
      for (const account of selectedRows) {
        await updateMutation.mutateAsync({
          id: account.id,
          payload: {
            accountGroupId: Number(bulkForm.accountGroupId),
            code: account.code,
            name: account.name,
            description: account.description ?? '',
            category: bulkForm.category,
            type: getAccountTypeFromCategory(bulkForm.category),
          },
        });
      }

      toast.success(`${selectedRows.length} akun berhasil diperbarui`);
      setOpenBulkConfirm(false);
      setOpenBulkUpdate(false);
      setSelectedIds(new Set());
      resetBulkForm();
    } catch (error) {
      const message = error instanceof ApiResponseError ? error.message : 'Gagal memperbarui akun terpilih';
      toast.error(message);
    } finally {
      setBulkSubmitting(false);
    }
  };

  const handleExport = () => {
    if (accountRows.length === 0) {
      toast.error('Tidak ada data untuk diexport');
      return;
    }

    const headers = ['Kode Akun', 'Nama Akun', 'Grup Akun', 'Kategori Akun', 'Deskripsi'];
    const rows = accountRows.map((account) => [
      account.code,
      account.name,
      account.accountGroupCode ?? '-',
      ACCOUNT_CATEGORY_OPTIONS.find((item) => item.value === account.category)?.label ?? account.category ?? '-',
      account.description ?? '-',
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `akun-page-${page}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Akun</h1>
          <p className="text-sm text-muted-foreground">Kelola akun finance dengan mudah</p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-1 flex-col gap-4 lg:flex-row lg:items-center">
              <div className="relative w-full max-w-[320px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Cari akun..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="h-10 rounded-xl border-gray-200 bg-white pl-9 text-sm text-gray-900 shadow-none focus-visible:ring-slate-300"
                />
              </div>

              <div className="flex items-center gap-2.5 text-sm text-slate-500">
                <span>Show</span>
                <Select value={String(perPage)} onValueChange={(value) => {
                  setPerPage(Number(value));
                  setPage(1);
                }}>
                  <SelectTrigger className="h-10 w-[80px] rounded-xl border-gray-200 bg-white px-3 text-sm text-slate-900 shadow-none focus:ring-slate-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 25, 50, 100].map((option) => (
                      <SelectItem key={option} value={String(option)}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span>entries</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="ghost" className="h-10 rounded-xl px-3.5 text-sm font-medium text-slate-700 hover:bg-slate-100" onClick={handleExport}>
                <Upload className="mr-1.5 h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" className="h-10 rounded-xl border-gray-200 px-4 text-sm font-medium text-slate-800 shadow-none hover:bg-slate-50" onClick={() => setOpenImport(true)}>
                <Download className="mr-1.5 h-4 w-4" />
                Import
              </Button>
              <Button className="h-10 rounded-xl bg-[#1F3B5B] px-4 text-sm font-medium text-white hover:bg-[#1B3450]" onClick={handleAdd}>
                <Plus className="mr-1.5 h-4 w-4" />
                Tambah
              </Button>
            </div>
          </div>

          {selectedIds.size > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" className="h-10 rounded-xl border-gray-200 px-4 text-sm font-medium text-slate-800 shadow-none hover:bg-slate-50" onClick={handleOpenBulkUpdate}>
                <PencilLine className="mr-1.5 h-4 w-4" />
                Update
              </Button>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span>{selectedIds.size} Akun Terpilih</span>
                <span className="text-base text-emerald-500">✓</span>
              </div>
            </div>
          )}

          {isError ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-5 text-base text-red-600">
              Gagal memuat data akun.
            </div>
          ) : (
            <AccountTable
              data={accountRows}
              total={totalAccounts}
              isLoading={isLoading || isFetching}
              page={page}
              perPage={perPage}
              selectedIds={selectedIds}
              onToggleAll={toggleAll}
              onToggleRow={toggleRow}
              onEdit={handleEdit}
              onDelete={setSelectedAccount}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>

      <AlertDialog open={!!selectedAccount} onOpenChange={(open) => !open && setSelectedAccount(null)}>
        <AlertDialogContent className="max-w-[440px] rounded-[28px] border-0 p-0 shadow-2xl">
          <div className="px-8 pb-8 pt-10 text-center">
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-[6px] border-red-500/90 text-red-500">
              <CircleAlert className="h-12 w-12" strokeWidth={2.5} />
            </div>

            <AlertDialogHeader className="mt-8 space-y-4 text-center">
              <AlertDialogTitle className="text-[2rem] font-semibold leading-tight tracking-[-0.04em] text-slate-950">
                Hapus data akun ini?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-lg leading-8 text-slate-500">
                Data akun yang dihapus tidak bisa dikembalikan lagi.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter className="mt-8 flex-col gap-3 sm:flex-col">
              <AlertDialogAction className="h-14 rounded-2xl bg-[#1F3B5B] text-lg font-semibold text-white hover:bg-[#1B3450]" onClick={handleDelete} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? 'Menghapus...' : 'Ya'}
              </AlertDialogAction>
              <AlertDialogCancel className="h-14 rounded-2xl border-slate-200 text-lg font-semibold text-slate-950 shadow-none hover:bg-slate-50">
                Tidak
              </AlertDialogCancel>
            </AlertDialogFooter>
          </div>
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
        title={editing ? 'Ubah Data Akun Transaksi' : 'Tambah Data Akun Transaksi'}
        description={editing ? 'Ubah detail akun dengan cepat dan mudah' : 'Masukkan detail akun baru'}
        submitLabel="Simpan"
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        accountGroups={accountGroups}
        isLoadingGroups={isLoadingGroups}
      />

      <Dialog open={openBulkUpdate} onOpenChange={(open) => {
        setOpenBulkUpdate(open);
        if (!open) {
          resetBulkForm();
        }
      }}>
        <DialogContent className="max-w-[calc(100%-2rem)] rounded-[28px] border-0 p-0 shadow-2xl sm:max-w-[560px]" showCloseButton={false}>
          <div className="px-6 pb-6 pt-8 sm:px-9">
            <DialogHeader className="space-y-2 text-left">
              <DialogTitle className="text-[2rem] font-semibold tracking-[-0.04em] text-slate-950">Ubah Data Akun Transasaksi</DialogTitle>
              <DialogDescription className="text-lg text-slate-500">Ubah detail akun dengan cepat dan mudah</DialogDescription>
            </DialogHeader>

            <div className="mt-8 space-y-6">
              <div className="space-y-2.5">
                <label className="block text-base font-semibold text-slate-900">Grup Akun</label>
                <Select value={bulkForm.accountGroupId} onValueChange={(value) => setBulkForm((previous) => ({ ...previous, accountGroupId: value }))}>
                  <SelectTrigger className="h-14 rounded-2xl border-slate-200 px-4 text-base shadow-none focus:ring-slate-300">
                    <SelectValue placeholder="Select an item" />
                  </SelectTrigger>
                  <SelectContent>
                    {accountGroups.map((group) => (
                      <SelectItem key={group.id} value={String(group.id)}>
                        {group.code || group.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2.5">
                <label className="block text-base font-semibold text-slate-900">Kategori Laporan</label>
                <Select value={bulkForm.category} onValueChange={(value) => setBulkForm((previous) => ({ ...previous, category: value }))}>
                  <SelectTrigger className="h-14 rounded-2xl border-slate-200 px-4 text-base shadow-none focus:ring-slate-300">
                    <SelectValue placeholder="Select an item" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCOUNT_CATEGORY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <Button className="h-14 rounded-2xl bg-[#1F3B5B] text-lg font-semibold text-white hover:bg-[#1B3450]" onClick={handleBulkUpdateRequest}>
                Simpan
              </Button>
              <Button variant="outline" className="h-14 rounded-2xl border-slate-200 text-lg font-semibold text-slate-950 shadow-none hover:bg-slate-50" onClick={() => setOpenBulkUpdate(false)}>
                Batal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={openBulkConfirm} onOpenChange={setOpenBulkConfirm}>
        <AlertDialogContent className="max-w-[440px] rounded-[28px] border-0 p-0 shadow-2xl">
          <div className="px-8 pb-8 pt-10 text-center">
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-[6px] border-red-500/90 text-red-500">
              <CircleAlert className="h-12 w-12" strokeWidth={2.5} />
            </div>

            <AlertDialogHeader className="mt-8 space-y-4 text-center">
              <AlertDialogTitle className="text-[2rem] font-semibold leading-tight tracking-[-0.04em] text-slate-950">
                Proses ini akan merubah seluruh data
              </AlertDialogTitle>
              <AlertDialogDescription className="text-lg leading-8 text-slate-500">
                Apakah kamu yakin untuk mengubah group dan akun?
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter className="mt-8 flex-col gap-3 sm:flex-col">
              <AlertDialogAction className="h-14 rounded-2xl bg-[#1F3B5B] text-lg font-semibold text-white hover:bg-[#1B3450]" onClick={handleBulkUpdateConfirm} disabled={bulkSubmitting}>
                {bulkSubmitting ? 'Menyimpan...' : 'Ya'}
              </AlertDialogAction>
              <AlertDialogCancel className="h-14 rounded-2xl border-slate-200 text-lg font-semibold text-slate-950 shadow-none hover:bg-slate-50" disabled={bulkSubmitting}>
                Tidak
              </AlertDialogCancel>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <AccountImportModal open={openImport} onOpenChange={setOpenImport} companyId={companyId ?? ''} />
    </DashboardLayout>
  );
};
