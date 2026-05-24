import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import RequiredMark from '@/components/ui/required-mark';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { UseFormReturn } from 'react-hook-form';
import type { AccountFormValues } from '@/scheme/account-master.schema';
import type { AccountGroup } from '@/@types/account-group.types';
import { ACCOUNT_CATEGORY_OPTIONS } from '@/lib/account';
import { cn } from '@/lib/utils';
import { SearchableSelect } from '@/components/features/vehicle-data/SearchableSelect';
import { CreateAccountGroupDialog } from './CreateAccountGroupDialog';
import { Plus } from 'lucide-react';

interface AccountFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<AccountFormValues>;
  onSubmit: (values: AccountFormValues) => void;
  title: string;
  description: string;
  submitLabel?: string;
  isSubmitting?: boolean;
  accountGroups: AccountGroup[];
  isLoadingGroups?: boolean;
}

export function AccountFormModal({ open, onOpenChange, form, onSubmit, title, description, submitLabel = 'Simpan', isSubmitting = false, accountGroups, isLoadingGroups = false }: AccountFormModalProps) {
  const [openCreateGroup, setOpenCreateGroup] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] rounded-[24px] border-0 p-0 shadow-2xl sm:max-w-[540px]" showCloseButton={false}>
        <DialogHeader className="space-y-1 border-b border-slate-100 px-5 pb-0 pt-5 text-left sm:px-6">
          <DialogTitle className="text-[1.55rem] font-semibold tracking-[-0.03em] text-slate-950">{title}</DialogTitle>
          <DialogDescription className="pb-5 text-sm text-slate-500">{description}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-5 pb-5 pt-5 sm:px-6">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem className="space-y-2.5">
                  <FormLabel className="text-sm font-semibold text-slate-900">Kode Akun<RequiredMark /></FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan kode akun" className="h-12 rounded-xl border-slate-200 px-4 text-sm shadow-none focus-visible:ring-slate-300" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accountGroupId"
                render={({ field }) => (
                <FormItem className="space-y-2.5">
                  <FormLabel className="text-sm font-semibold text-slate-900">Grup Akun<RequiredMark /></FormLabel>
                  <FormControl>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                    <SearchableSelect
                      value={field.value ? String(field.value) : ''}
                      onChange={(value) => field.onChange(Number(value))}
                      options={accountGroups.map((group) => ({
                      value: String(group.id),
                      label: group.code || String(group.id),
                      subtitle: group.description ?? undefined,
                      }))}
                      placeholder={isLoadingGroups ? 'Memuat...' : 'Select an item'}
                      searchPlaceholder="Cari grup akun..."
                      emptyText="Grup akun tidak ditemukan."
                      loading={isLoadingGroups}
                      className="h-12 rounded-xl border-slate-200 px-4 text-sm shadow-none focus-visible:ring-slate-300"
                    />
                    </div>
                    <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 flex-shrink-0 rounded-xl border-slate-200 text-slate-900 shadow-none hover:bg-slate-50"
                    onClick={() => setOpenCreateGroup(true)}
                    >
                    <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                <FormItem className="space-y-2.5">
                  <FormLabel className="text-sm font-semibold text-slate-900">Kategori Laporan<RequiredMark /></FormLabel>
                  <FormControl>
                    <Select value={field.value ?? ''} onValueChange={(val) => field.onChange(val)}>
                      <SelectTrigger className="h-12 rounded-xl border-slate-200 px-4 text-sm shadow-none focus:ring-slate-300">
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
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-2.5">
                  <FormLabel className="text-sm font-semibold text-slate-900">Nama Akun<RequiredMark /></FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan nama akun" className="h-12 rounded-xl border-slate-200 px-4 text-sm shadow-none focus-visible:ring-slate-300" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="space-y-2.5">
                  <FormLabel className="text-sm font-semibold text-slate-900">Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Tulis deskripsi di sini" className="min-h-[92px] resize-none rounded-xl border-slate-200 px-4 py-3 text-sm shadow-none focus-visible:ring-slate-300" rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-3 pt-2">
              <Button type="submit" className={cn('h-12 w-full rounded-xl bg-[#1F3B5B] text-sm font-semibold text-white hover:bg-[#1B3450]')} disabled={isSubmitting}>
                {isSubmitting ? 'Menyimpan...' : submitLabel}
              </Button>
              <Button type="button" variant="outline" className="h-12 w-full rounded-xl border-slate-200 text-sm font-semibold text-slate-900 shadow-none hover:bg-slate-50" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>

      <CreateAccountGroupDialog
        open={openCreateGroup}
        onOpenChange={setOpenCreateGroup}
        onCreated={(id) => {
          form.setValue('accountGroupId', Number(id), {
            shouldDirty: true,
            shouldValidate: true,
          });
        }}
      />
    </Dialog>
  );
}
