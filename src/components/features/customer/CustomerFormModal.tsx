import type { CustomerFormValues } from '@/scheme/customer.schema';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import RequiredMark from '@/components/ui/required-mark';
import { Textarea } from '@/components/ui/textarea';
import type { UseFormReturn } from 'react-hook-form';

interface CustomerFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<CustomerFormValues>;
  onSubmit: (values: CustomerFormValues) => void;
  title: string;
  description: string;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export function CustomerFormModal({
  open,
  onOpenChange,
  form,
  onSubmit,
  title,
  description,
  submitLabel = 'Simpan',
  isSubmitting = false,
}: CustomerFormModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[410px] rounded-2xl border-0 bg-white p-0 shadow-2xl sm:max-w-[410px]">
        <div className="px-6 py-6">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-[18px] font-semibold text-[#171717]">{title}</DialogTitle>
            <DialogDescription className="text-[15px] text-[#71717A]">{description}</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[14px] font-medium text-[#171717]">
                      Nama Customer<RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Tambahkan nama customer"
                        className="h-12 rounded-xl border-[#E4E4E7] px-4 text-[15px] placeholder:text-[#A1A1AA]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pic"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[14px] font-medium text-[#171717]">PIC</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Tambahkan PIC"
                        className="h-12 rounded-xl border-[#E4E4E7] px-4 text-[15px] placeholder:text-[#A1A1AA]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[14px] font-medium text-[#171717]">Alamat</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Tambahkan Alamat"
                        className="min-h-[112px] rounded-xl border-[#E4E4E7] px-4 py-3 text-[15px] placeholder:text-[#A1A1AA] resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[14px] font-medium text-[#171717]">Phone</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Tambahkan nomer telepon"
                        className="h-12 rounded-xl border-[#E4E4E7] px-4 text-[15px] placeholder:text-[#A1A1AA]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="map_link"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[14px] font-medium text-[#171717]">Maps</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Tambahkan link maps"
                        className="h-12 rounded-xl border-[#E4E4E7] px-4 text-[15px] placeholder:text-[#A1A1AA]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="npwp"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[14px] font-medium text-[#171717]">NPWP</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Tambahkan NPWP"
                        className="h-12 rounded-xl border-[#E4E4E7] px-4 text-[15px] placeholder:text-[#A1A1AA]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-3 pt-2">
                <Button type="submit" className="h-11 rounded-xl bg-[#1F3B5B] text-[15px] font-medium text-white hover:bg-[#19314b]" disabled={isSubmitting}>
                  {isSubmitting ? 'Menyimpan...' : submitLabel}
                </Button>
                <Button type="button" variant="outline" className="h-11 rounded-xl border-[#D4D4D8] text-[15px] text-[#171717]" onClick={() => onOpenChange(false)}>
                  Batal
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
