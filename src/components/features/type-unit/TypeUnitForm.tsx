import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import type { TypeUnitFormValues } from '@/scheme/type-unit.schema';
import { Save } from 'lucide-react';
import { useBrands } from '@/hooks/useBrand';

interface TypeUnitFormProps {
  form: UseFormReturn<TypeUnitFormValues>;
  onSubmit: (values: TypeUnitFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function TypeUnitForm({ form, onSubmit, onCancel, isSubmitting = false, submitLabel = 'Simpan' }: TypeUnitFormProps) {
  // Utility for parsing number fields nicely
  const parseNumber = (value: string) => (value === '' ? undefined : Number(value));
  const { data: brands = [], isLoading: isBrandLoading } = useBrands();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <div className="space-y-8">
          {/* Section Merk */}
          <div className="grid grid-cols-[120px_1fr] md:grid-cols-[160px_1fr] items-center gap-4">
            <FormLabel className="text-sm font-semibold text-gray-900">Merk</FormLabel>
            <FormField
              control={form.control}
              name="brandId"
              render={({ field }) => (
                <FormItem className="max-w-[300px]">
                  <Select value={field.value ? field.value.toString() : ''} onValueChange={(val) => field.onChange(Number(val))} disabled={isBrandLoading}>
                    <FormControl>
                      <SelectTrigger className="bg-white border-gray-200 h-10 rounded-lg text-gray-500 font-medium">
                        <SelectValue placeholder={isBrandLoading ? 'Memuat...' : 'Pilih Merk'} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id.toString()}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Section Unit */}
          <div className="space-y-4">
            <h3 className="text-[13px] font-medium text-gray-400">Unit</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              <div className="grid grid-cols-[120px_1fr] md:grid-cols-[160px_1fr] items-center gap-4">
                <FormLabel className="text-sm font-semibold text-gray-900">Kode</FormLabel>
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Masukkan Kode" className="bg-white border-gray-200 h-10 rounded-lg font-medium placeholder:font-normal placeholder:text-gray-400" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-[120px_1fr] md:grid-cols-[100px_1fr] items-center gap-4">
                <FormLabel className="text-sm font-semibold text-gray-900">Jenis</FormLabel>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Masukkan Jenis" className="bg-white border-gray-200 h-10 rounded-lg font-medium placeholder:font-normal placeholder:text-gray-400" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              <div className="grid grid-cols-[120px_1fr] md:grid-cols-[160px_1fr] items-center gap-4">
                <FormLabel className="text-sm font-semibold text-gray-900">Tipe</FormLabel>
                <FormField
                  control={form.control}
                  name="unitType"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Masukkan Tipe" className="bg-white border-gray-200 h-10 rounded-lg font-medium placeholder:font-normal placeholder:text-gray-400" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-[120px_1fr] md:grid-cols-[100px_1fr] items-center gap-4">
                <FormLabel className="text-sm font-semibold text-gray-900">Model</FormLabel>
                <FormField
                  control={form.control}
                  name="unitModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Masukkan Model" className="bg-white border-gray-200 h-10 rounded-lg font-medium placeholder:font-normal placeholder:text-gray-400" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Section Berat */}
          <div className="space-y-4 pt-2">
            <h3 className="text-[13px] font-medium text-gray-400">Berat</h3>
            <div className="space-y-4 max-w-[500px]">
              <div className="grid grid-cols-[120px_1fr] md:grid-cols-[160px_1fr] items-center gap-4">
                <FormLabel className="text-sm font-semibold text-gray-900">Netto</FormLabel>
                <FormField
                  control={form.control}
                  name="nettoWeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Masukkan Berat"
                          className="bg-white border-gray-200 h-10 rounded-lg font-medium placeholder:font-normal placeholder:text-gray-400"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(parseNumber(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-[120px_1fr] md:grid-cols-[160px_1fr] items-center gap-4">
                <FormLabel className="text-sm font-semibold text-gray-900">Bruto</FormLabel>
                <FormField
                  control={form.control}
                  name="brutoWeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Masukkan Berat"
                          className="bg-white border-gray-200 h-10 rounded-lg font-medium placeholder:font-normal placeholder:text-gray-400"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(parseNumber(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Section Harga */}
          <div className="space-y-4 pt-2">
            <h3 className="text-[13px] font-medium text-gray-400">Harga</h3>
            <div className="space-y-4 max-w-[500px]">
              <div className="grid grid-cols-[120px_1fr] md:grid-cols-[160px_1fr] items-center gap-4">
                <FormLabel className="text-sm font-semibold text-gray-900">Harga Jual</FormLabel>
                <FormField
                  control={form.control}
                  name="sellPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Masukkan Harga"
                          className="bg-white border-gray-200 h-10 rounded-lg font-medium placeholder:font-normal placeholder:text-gray-400"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(parseNumber(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-[120px_1fr] md:grid-cols-[160px_1fr] items-center gap-4">
                <FormLabel className="text-sm font-semibold text-gray-900">Harga Beli</FormLabel>
                <FormField
                  control={form.control}
                  name="buyPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Masukkan Harga"
                          className="bg-white border-gray-200 h-10 rounded-lg font-medium placeholder:font-normal placeholder:text-gray-400"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(parseNumber(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-8 pt-12 pb-4">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting} className="text-gray-900 hover:text-gray-900 hover:bg-gray-100 font-medium px-6">
            Batal
          </Button>
          <Button type="submit" className="bg-[#2B3B52] hover:bg-[#1E2A3C] text-white min-w-[140px] rounded-lg shadow-sm" disabled={isSubmitting}>
            {isSubmitting ? (
              'Menyimpan...'
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {submitLabel}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
