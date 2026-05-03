'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserSchema, updateUserSchema, CreateUserFormValues, UpdateUserFormValues } from '@/scheme/user.schema';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { User } from '@/@types/user.types';
import { useAssignRole, useCreateUser, useUpdateUser } from '@/hooks/useUser';
import { useRoles } from '@/hooks/useRole';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import RequiredMark from '@/components/ui/required-mark';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export function UserFormDialog({ open, onOpenChange, user }: Props) {
  const isEdit = Boolean(user);
  const [showPassword, setShowPassword] = useState(false);

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const assignRoleMutation = useAssignRole();
  const { data: roleOptions = [], isLoading: isRolesLoading } = useRoles();

  // Using a union type for potential values
  const form = useForm<CreateUserFormValues | UpdateUserFormValues>({
    resolver: zodResolver(isEdit ? updateUserSchema : createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      username: '',
      firstname: '',
      lastname: '',
      roles: 'employee',
      password: '',
      password_confirmation: '',
    },
  });

  // Reset Form when Modal Opens/Closes or User Changes
  useEffect(() => {
    if (open) {
      if (user) {
        // Edit Mode: Prefill
        form.reset({
          name: user.name,
          email: user.email,
          username: user.username,
          firstname: user.firstname || '',
          lastname: user.lastname || '',
          roles: user.roles?.[0]?.name || roleOptions[0]?.name || '',
          password: '', // Password always empty on edit start
          password_confirmation: '',
        });
      } else {
        // Create Mode: Reset all
        form.reset({
          name: '',
          email: '',
          username: '',
          firstname: '',
          lastname: '',
          roles: roleOptions[0]?.name || 'employee',
          password: '',
          password_confirmation: '',
        });
      }
    }
  }, [open, user, form, roleOptions]);

  const onSubmit = async (values: any) => {
    if (createMutation.isPending || updateMutation.isPending || assignRoleMutation.isPending) return;

    // Hilangkan password kosong agar lolos validasi backend saat edit
    const payload = { ...values } as any;
    if (!payload.password) delete payload.password;
    if (!payload.password_confirmation) delete payload.password_confirmation;

    try {
      if (isEdit && user) {
        await updateMutation.mutateAsync({
          id: user.id,
          ...payload,
        });

        // Update role via dedicated endpoint when changed
        const newRole = payload.roles;
        const currentRole = user.roles?.[0]?.name;
        if (newRole && newRole !== currentRole) {
          await assignRoleMutation.mutateAsync({ id: user.id, role: newRole });
        }
        toast.success('Data berhasil diperbarui');
      } else {
        await createMutation.mutateAsync({
          ...payload,
        });
        toast.success('Data berhasil ditambahkan');
      }
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.message || 'Terjadi kesalahan');
    }
  };

  const isBusy = createMutation.isPending || updateMutation.isPending || assignRoleMutation.isPending || form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Ubah Data User' : 'Tambah Data User'}</DialogTitle>
          <DialogDescription className="hidden">Form untuk {isEdit ? 'mengubah' : 'menambah'} data user</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap<RequiredMark /></FormLabel>
                  <FormControl>
                    <Input placeholder="Tambahkan nama" {...field} disabled={isBusy} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email<RequiredMark /></FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="user@mail.com" {...field} disabled={isBusy || isEdit} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username<RequiredMark /></FormLabel>
                    <FormControl>
                      <Input placeholder="username" {...field} disabled={isBusy || isEdit} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Depan<RequiredMark /></FormLabel>
                    <FormControl>
                      <Input placeholder="Nama depan" {...field} disabled={isBusy} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Belakang</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama belakang" {...field} disabled={isBusy} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password {isEdit && '(Opsional)'}{!isEdit && <RequiredMark />}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input type={showPassword ? 'text' : 'password'} placeholder={isEdit ? 'Kosongkan jika tidak diubah' : 'Masukkan password'} {...field} disabled={isBusy} />
                      <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)} disabled={isBusy}>
                        {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                        <span className="sr-only">Toggle password visibility</span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password_confirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Konfirmasi Password{!isEdit && <RequiredMark />}</FormLabel>
                  <FormControl>
                    <Input type={showPassword ? 'text' : 'password'} placeholder="Ulangi password" {...field} disabled={isBusy} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="roles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role<RequiredMark /></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={isBusy || isRolesLoading}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={isRolesLoading ? 'Memuat role...' : 'Pilih role'} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roleOptions.map((role) => (
                        <SelectItem key={role.id} value={role.name}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2 pt-4">
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={isBusy}>
                {isBusy ? 'Menyimpan...' : 'Simpan'}
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={() => onOpenChange(false)} disabled={isBusy}>
                Batal
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
