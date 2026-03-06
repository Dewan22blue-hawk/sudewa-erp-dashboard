import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// useEffect removed - not used
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { MoneyInput } from '@/components/ui/money-input';
import { formatCurrency } from '@/lib/utils/currency';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save } from 'lucide-react';
import { createPurchaseUnitSchema } from '@/scheme/purchase.schema';
import { PRODUCT_OPTIONS } from '@/components/features/sales/edit/edit-unit.data';

// Extending the schema type for the form, or similar
// For now we map to any for simplicity in this step, but ideal is strict typing.
// The schema `createPurchaseUnitSchema` has snake_case/camelCase mix.
// We need to match the form fields to the schema.
// Schema: typeUnitId, typeUnitName, qty, price, biayaBBN, biayaEkspedisi, biayaLain
// UI Sales: tipeUnit, qty, harga, biayaBbn, biayaEkspedisi, biayaLain, totalHpp, etc.

// We will use a local interface that matches the UI for the form state,
// and then map it to the submission format if needed.
// But for parity, let's try to match valid keys.

import { CreatePurchaseUnitFormValues } from '@/scheme/purchase.schema';

interface Props {
  onSubmit: (data: CreatePurchaseUnitFormValues) => void;
  defaultValues?: Partial<CreatePurchaseUnitFormValues>;
  readOnly?: boolean;
  loading?: boolean;
  onCancel?: () => void;
}

export default function PurchaseUnitForm({ onSubmit, defaultValues, readOnly, loading, onCancel }: Props) {
  const form = useForm({
    resolver: zodResolver(createPurchaseUnitSchema),
    defaultValues: {
      typeUnitId: defaultValues?.typeUnitId || '',
      qty: defaultValues?.qty || 1,
      price: defaultValues?.price || 0,
      biayaBBN: defaultValues?.biayaBBN || 0,
      biayaEkspedisi: defaultValues?.biayaEkspedisi || 0,
      biayaLain: defaultValues?.biayaLain || 0,
      // Header-like fields not in schema but needed for UI calculation
      // We might need to handle these separately or extend schema.
      // For now, let's just use the fields we have in schema and add calculated display fields.
      ...defaultValues,
    },
  });

  // Watch fields for calculation
  const qty = form.watch('qty') || 0;
  const price = form.watch('price') || 0; // HPP Satuan base
  const biayaBBN = form.watch('biayaBBN') || 0;
  const biayaEkspedisi = form.watch('biayaEkspedisi') || 0;
  const biayaLain = form.watch('biayaLain') || 0;

  // Calculations
  const hppSatuan = price + (biayaBBN + biayaEkspedisi + biayaLain) / (qty || 1);
  const ppnSatuan = hppSatuan * 0.11;
  const dppSatuan = hppSatuan; // Simplified for now, usually DPP = HPP

  // Totals
  const totalHpp = hppSatuan * qty;
  const totalDpp = dppSatuan * qty;
  const totalPpn = ppnSatuan * qty;

  // We can use useEffect to set these if they are part of the form data
  // Or just display them. The Sales form sets them.

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Section Header */}
        <div>
          <h2 className="text-lg font-semibold text-foreground">Informasi Pembelian</h2>
          <div className="my-4 h-px bg-border" />
        </div>

        {/* ROW 1: Tipe Unit, Qty, Harga */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="typeUnitId"
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
            name="price"
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
            name="biayaBBN"
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

        {/* ROW 3: Total HPP, Total DPP, Total PPN (Read Only / Calculated) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormItem>
            <FormLabel className="text-sm font-medium">Total HPP</FormLabel>
            <FormControl>
              <Input value={formatCurrency(totalHpp)} className="bg-muted/50" disabled readOnly />
            </FormControl>
          </FormItem>

          <FormItem>
            <FormLabel className="text-sm font-medium">Total DPP</FormLabel>
            <FormControl>
              <Input value={formatCurrency(totalDpp)} className="bg-muted/50" disabled readOnly />
            </FormControl>
          </FormItem>

          <FormItem>
            <FormLabel className="text-sm font-medium">Total PPN</FormLabel>
            <FormControl>
              <Input value={formatCurrency(totalPpn)} className="bg-muted/50" disabled readOnly />
            </FormControl>
          </FormItem>
        </div>

        {/* ROW 4: HPP Satuan, DPP Satuan, PPN Satuan (Read Only / Calculated) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormItem>
            <FormLabel className="text-sm font-medium">HPP Satuan</FormLabel>
            <FormControl>
              <Input value={formatCurrency(hppSatuan)} className="bg-muted/50" disabled readOnly />
            </FormControl>
          </FormItem>

          <FormItem>
            <FormLabel className="text-sm font-medium">DPP Satuan</FormLabel>
            <FormControl>
              <Input value={formatCurrency(dppSatuan)} className="bg-muted/50" disabled readOnly />
            </FormControl>
          </FormItem>

          <FormItem>
            <FormLabel className="text-sm font-medium">PPN Satuan</FormLabel>
            <FormControl>
              <Input value={formatCurrency(ppnSatuan)} className="bg-muted/50" disabled readOnly />
            </FormControl>
          </FormItem>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-8">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={loading} className="text-muted-foreground hover:text-foreground">
            Batal
          </Button>
          {!readOnly && (
            <Button type="submit" disabled={loading} className="bg-[#1e293b] hover:bg-[#0f172a] text-white min-w-25">
              {loading ? (
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
