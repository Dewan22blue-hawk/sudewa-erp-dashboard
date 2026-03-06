'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { MoneyInput } from '@/components/ui/money-input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save } from 'lucide-react';
import { editUnitSchema, EditUnitFormData } from './edit-unit.schema';
import { PRODUCT_OPTIONS } from './edit-unit.data';

interface EditUnitFormProps {
  defaultValues: EditUnitFormData;
  onSubmit?: (data: EditUnitFormData) => void; // Optional because readOnly won't submit
  onCancel: () => void;
  readOnly?: boolean;
}

/**
 * Edit Unit Form - EXACT sesuai Figma
 * Layout: Tipe Unit + Qty | Harga | Satuan (2 cols) | Biaya
 */
export function EditUnitForm({ defaultValues, onSubmit = () => { }, onCancel, readOnly = false }: EditUnitFormProps) {
  const form = useForm<EditUnitFormData>({
    resolver: zodResolver(editUnitSchema),
    defaultValues,
  });

  const qty = form.watch('qty');
  const hppSatuan = form.watch('hppSatuan');
  const dppSatuan = form.watch('dppSatuan');
  const ppnSatuan = form.watch('ppnSatuan');

  // Auto-calculate totals when qty or satuan changes
  useEffect(() => {
    form.setValue('totalHpp', qty * hppSatuan);
    form.setValue('totalDpp', qty * dppSatuan);
    form.setValue('totalPpn', qty * ppnSatuan);
  }, [qty, hppSatuan, dppSatuan, ppnSatuan, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Section Header */}
        <div>
          <h2 className="text-lg font-semibold text-foreground">Informasi Penjualan</h2>
          <div className="my-4 h-[1px] bg-border" />
        </div>

        {/* ROW 1: Tipe Unit, Qty, Harga */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="tipeUnit"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Tipe Unit</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={readOnly}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select an item" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PRODUCT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="qty"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">QTY</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} onChange={(e) => field.onChange(Number(e.target.value))} disabled={readOnly} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="harga"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Harga</FormLabel>
                <FormControl>
                  <MoneyInput {...field} value={field.value || 0} onChangeValue={field.onChange} disabled={readOnly} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ROW 2: Biaya BBN, Biaya Ekspedisi, Biaya Lain */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="biayaBbn"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Biaya BBN</FormLabel>
                <FormControl>
                  <MoneyInput placeholder="Value" {...field} value={field.value || 0} onChangeValue={field.onChange} disabled={readOnly} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="biayaEkspedisi"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Biaya Ekspedisi</FormLabel>
                <FormControl>
                  <MoneyInput placeholder="Value" {...field} value={field.value || 0} onChangeValue={field.onChange} disabled={readOnly} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="biayaLain"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Biaya Lain</FormLabel>
                <FormControl>
                  <MoneyInput placeholder="Value" {...field} value={field.value || 0} onChangeValue={field.onChange} disabled={readOnly} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ROW 3: Total HPP, Total DPP, Total PPN */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="totalHpp"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Total HPP</FormLabel>
                <FormControl>
                  <MoneyInput className="bg-muted/50" disabled {...field} value={field.value || 0} onChangeValue={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="totalDpp"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Total DPP</FormLabel>
                <FormControl>
                  <MoneyInput className="bg-muted/50" disabled {...field} value={field.value || 0} onChangeValue={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="totalPpn"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Total PPN</FormLabel>
                <FormControl>
                  <MoneyInput className="bg-muted/50" disabled {...field} value={field.value || 0} onChangeValue={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ROW 4: HPP Satuan, DPP Satuan, PPN Satuan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="hppSatuan"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">HPP Satuan</FormLabel>
                <FormControl>
                  <MoneyInput placeholder="Rp 0" {...field} value={field.value || 0} onChangeValue={field.onChange} disabled={readOnly} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dppSatuan"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">DPP Satuan</FormLabel>
                <FormControl>
                  <MoneyInput placeholder="Rp 0" {...field} value={field.value || 0} onChangeValue={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ppnSatuan"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">PPN Satuan</FormLabel>
                <FormControl>
                  <MoneyInput placeholder="Rp 0" {...field} value={field.value || 0} onChangeValue={field.onChange} disabled={readOnly} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-8">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={form.formState.isSubmitting} className="text-muted-foreground hover:text-foreground">
            Batal
          </Button>
          {!readOnly && (
            <Button type="submit" disabled={form.formState.isSubmitting} className="bg-[#1e293b] hover:bg-[#0f172a] text-white min-w-[100px]">
              {form.formState.isSubmitting ? (
                'Menyimpan...'
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Simpan
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
