'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { MoneyInput } from '@/components/ui/money-input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Save } from 'lucide-react';
import { editUnitSchema, EditUnitFormData } from './edit-unit.schema';
import { PRODUCT_OPTIONS } from './edit-unit.data';

interface EditUnitFormProps {
  defaultValues: EditUnitFormData;
  onSubmit?: (data: EditUnitFormData) => void; // Optional because readOnly won't submit
  onCancel: () => void;
  readOnly?: boolean;
  showAddUnitButton?: boolean;
  onAddUnitClick?: () => void;
}

/**
 * Edit Unit Form - EXACT sesuai Figma
 * Layout: Tipe Unit + Qty | Harga | Satuan (2 cols) | Biaya
 */
export function EditUnitForm({ defaultValues, onSubmit = () => { }, onCancel, readOnly = false, showAddUnitButton = false, onAddUnitClick }: EditUnitFormProps) {
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
          <h2 className="text-xl font-semibold text-foreground tracking-tight">Informasi Penjualan</h2>
          <div className="my-6 h-px bg-muted/60" />
        </div>

        <FormField
          control={form.control}
          name="customer"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Customer</FormLabel>
              <FormControl>
                <Input {...field} placeholder="PT XX" className="bg-transparent max-w-sm" disabled={readOnly} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ROW 1: Tipe Unit, Qty, Harga */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="tipeUnit"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Tipe Unit</FormLabel>
                <div className="flex items-center gap-2">
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={readOnly}>
                    <FormControl>
                      <SelectTrigger className="w-full bg-transparent">
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

                  {showAddUnitButton && !readOnly && (
                    <Button type="button" variant="outline" size="icon" className="h-10 w-10 shrink-0 bg-transparent" onClick={onAddUnitClick}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
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
                  <Input type="number" min="1" className="bg-transparent" {...field} onChange={(e) => field.onChange(Number(e.target.value))} disabled={readOnly} />
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
                  <MoneyInput className="bg-transparent" {...field} value={field.value || 0} onChangeValue={field.onChange} disabled={readOnly} />
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
                  <MoneyInput placeholder="Value" className="bg-transparent" {...field} value={field.value || 0} onChangeValue={field.onChange} disabled={readOnly} />
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
                <FormLabel className="text-sm font-medium">Biaya Expedisi</FormLabel>
                <FormControl>
                  <MoneyInput placeholder="Value" className="bg-transparent" {...field} value={field.value || 0} onChangeValue={field.onChange} disabled={readOnly} />
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
                  <MoneyInput placeholder="Value" className="bg-transparent" {...field} value={field.value || 0} onChangeValue={field.onChange} disabled={readOnly} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ROW 3: HPP Satuan, DPP Satuan, PPN Satuan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="hppSatuan"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">HPP Satuan</FormLabel>
                <FormControl>
                  <MoneyInput placeholder="Rp 99.999" className="bg-transparent" {...field} value={field.value || 0} onChangeValue={field.onChange} disabled={readOnly} />
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
                  <MoneyInput placeholder="Rp 99.999" className="bg-transparent" {...field} value={field.value || 0} onChangeValue={field.onChange} />
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
                  <MoneyInput placeholder="Rp 99.999" className="bg-transparent" {...field} value={field.value || 0} onChangeValue={field.onChange} disabled={readOnly} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ROW 4: Total HPP, Total DPP, Total PPN */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="totalHpp"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Total HPP</FormLabel>
                <FormControl>
                  <MoneyInput placeholder="Rp 99.999" className="bg-transparent" disabled {...field} value={field.value || 0} onChangeValue={field.onChange} />
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
                  <MoneyInput placeholder="Rp 99.999" className="bg-transparent" disabled {...field} value={field.value || 0} onChangeValue={field.onChange} />
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
                  <MoneyInput placeholder="Rp 99.999" className="bg-transparent" disabled {...field} value={field.value || 0} onChangeValue={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center items-center gap-6 pt-10">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={form.formState.isSubmitting} className="text-muted-foreground font-medium hover:text-foreground">
            Batal
          </Button>
          {!readOnly && (
            <Button type="submit" disabled={form.formState.isSubmitting} className="bg-[#1e293b] hover:bg-[#0f172a] text-white font-medium min-w-[120px] rounded-lg">
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
