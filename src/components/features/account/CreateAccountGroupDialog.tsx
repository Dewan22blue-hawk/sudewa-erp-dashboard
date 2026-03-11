import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useQuickCreateAccountGroup } from '@/hooks/useAccountGroup';
import { useCompany } from '@/contexts/CompanyContext';
import { toast } from 'sonner';
import { ApiValidationError } from '@/lib/api/response';

const schema = z.object({
  groupCode: z.string().min(1, 'Kode grup wajib diisi'),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface CreateAccountGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (id: number | string) => void;
}

export function CreateAccountGroupDialog({ open, onOpenChange, onCreated }: CreateAccountGroupDialogProps) {
  const { companyId } = useCompany();
  const createMutation = useQuickCreateAccountGroup();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      groupCode: '',
      description: '',
    },
  });

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset({ groupCode: '', description: '' });
    }
  }, [open, form]);

  const handleSubmit = async (values: FormValues) => {
    if (!companyId) {
      toast.error('Pilih perusahaan terlebih dahulu');
      return;
    }

    try {
      const group = await createMutation.mutateAsync({
        companyId,
        groupCode: values.groupCode,
        description: values.description || undefined,
      });
      toast.success('Grup akun berhasil ditambahkan');
      onCreated?.(group.id);
      onOpenChange(false);
    } catch (error: any) {
      if (error instanceof ApiValidationError) {
        Object.entries(error.fieldErrors).forEach(([field, messages]) => {
          const mapped = field === 'group_code' ? 'groupCode' : field;
          form.setError(mapped as keyof FormValues, { message: messages?.[0] ?? 'Validasi gagal' });
        });
        toast.error(error.message || 'Validasi gagal');
        return;
      }
      toast.error(error?.message || 'Gagal membuat grup akun');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Tambah Grup Akun</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">Buat grup akun baru tanpa keluar dari formulir.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="groupCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kode Grup</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan kode grup" {...field} />
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
                    <Textarea rows={3} placeholder="Masukkan deskripsi" className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-2 pt-2">
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Menyimpan...' : 'Simpan'}
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={() => onOpenChange(false)} disabled={createMutation.isPending}>
                Batal
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
