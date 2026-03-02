import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { UseFormReturn } from 'react-hook-form';
import type { AccountFormValues } from '@/scheme/account-master.schema';
import type { AccountGroup } from '@/@types/account-group.types';

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">{description}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Kode Akun */}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kode Akun</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan kode akun" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Grup Akun */}
            <FormField
              control={form.control}
              name="accountGroupId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grup Akun</FormLabel>
                  <FormControl>
                    <Select value={field.value ? String(field.value) : ''} onValueChange={(val) => field.onChange(Number(val))}>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingGroups ? 'Memuat...' : 'Masukkan grup akun'} />
                      </SelectTrigger>
                      <SelectContent>
                        {accountGroups.length === 0 && (
                          <SelectItem value="" disabled>
                            Tidak ada grup akun
                          </SelectItem>
                        )}
                        {accountGroups.map((group) => (
                          <SelectItem key={group.id} value={String(group.id)}>
                            {group.code ? `${group.code}${group.description ? ` - ${group.description}` : ''}` : group.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Kategori (type) */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori</FormLabel>
                  <FormControl>
                    <Select value={field.value ?? 'debet'} onValueChange={(val) => field.onChange(val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent id="account-type-select">
                        <SelectItem value="debet">Debet</SelectItem>
                        <SelectItem value="credit">Kredit</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nama */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Akun</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan nama akun" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Deskripsi */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Tulis deskripsi di sini" className="resize-none" rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Buttons */}
            <div className="flex flex-col gap-2 pt-2">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Menyimpan...' : submitLabel}
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
