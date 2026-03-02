import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type { AccountGroup } from '@/@types/account-group.types';
import type { AccountFormValues } from '@/scheme/account-master.schema';
import type { UseFormReturn } from 'react-hook-form';

interface AccountFormProps {
  form: UseFormReturn<AccountFormValues>;
  accountGroups: AccountGroup[];
  onSubmit: (values: AccountFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export const AccountForm = ({ form, accountGroups, onSubmit, onCancel, isSubmitting = false, submitLabel = 'Simpan' }: AccountFormProps) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="accountGroupId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grup Akun</FormLabel>
                <FormControl>
                  <Select value={field.value ? String(field.value) : ''} onValueChange={(value) => field.onChange(Number(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih grup akun" />
                    </SelectTrigger>
                    <SelectContent>
                      {accountGroups.map((group) => (
                        <SelectItem key={group.id} value={String(group.id)}>
                          {group.name}
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
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kode Akun</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan kode" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi</FormLabel>
              <FormControl>
                <Textarea placeholder="Tambahkan deskripsi" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <FormLabel>Status</FormLabel>
                <p className="text-sm text-muted-foreground">Aktifkan akun untuk dapat digunakan</p>
              </div>
              <FormControl>
                <Switch checked={!!field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
};
