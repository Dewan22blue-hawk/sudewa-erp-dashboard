import { UseFormReturn } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { KasHarianFormValues } from '@/scheme/kas-harian.schema';

interface Props {
  form: UseFormReturn<KasHarianFormValues>;
  onSubmit: (data: KasHarianFormValues) => void;
  id?: string;
}

export default function KasHarianForm({ form, onSubmit, id }: Props) {
  return (
    <Form {...form}>
      <form id={id} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="tanggal"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Tanggal</FormLabel>
              <FormControl>
                <DatePicker value={field.value} onChange={field.onChange} placeholder="Pick a date" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="akun"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Akun Terkait</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan akun" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipe Transaksi</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="debit">Debit (Uang Masuk)</SelectItem>
                  <SelectItem value="kredit">Kredit (Uang Keluar)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="keterangan"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Keterangan</FormLabel>
              <FormControl>
                <Textarea placeholder="Tulis deskripsi di sini" className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nominal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nominal</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Tambahkan nominal" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
