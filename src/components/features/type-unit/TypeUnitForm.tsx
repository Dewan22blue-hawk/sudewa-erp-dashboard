import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { MoneyInput } from '@/components/ui/money-input';
import { UseFormReturn } from 'react-hook-form';
import type { TypeUnitFormValues } from '@/scheme/type-unit.schema';
import { Check, ChevronsUpDown, Save } from 'lucide-react';
import { useBrands } from '@/hooks/useBrand';
import { useState } from 'react';
import { CreateBrandDialog } from './CreateBrandDialog';
import { cn } from '@/lib/utils';
import RequiredMark from '@/components/ui/required-mark';
import type { Brand } from '@/@types/brand.types';

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
  const { data: brandsData, isLoading: isBrandLoading } = useBrands({ 
    perPage: 100,
    sort_by: 'name',
    sort_order: 'asc' 
  });
  const brands: Brand[] = Array.isArray(brandsData) ? brandsData : ((brandsData as any)?.data ?? []);
  const [openBrandDialog, setOpenBrandDialog] = useState(false);
  const [openBrandSelect, setOpenBrandSelect] = useState(false);
  const [brandSearch, setBrandSearch] = useState('');
  const filteredBrands = brands.filter((brand: Brand) => {
    if (!brandSearch.trim()) return true;
    const keyword = brandSearch.toLowerCase();
    return brand.name.toLowerCase().includes(keyword) || String(brand.id).includes(keyword);
  });

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <div className="space-y-8">
            {/* Section 1: Informasi Unit */}
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-semibold text-slate-900">Informasi Unit</h3>
                <p className="text-xs text-slate-500">Detail brand, kode, jenis, tipe, dan model unit</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="brandId"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-semibold text-slate-700">Merk<RequiredMark /></FormLabel>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <Popover
                            open={openBrandSelect}
                            onOpenChange={(open) => {
                              setOpenBrandSelect(open);
                              if (!open) setBrandSearch('');
                            }}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                role="combobox"
                                aria-expanded={openBrandSelect}
                                disabled={isBrandLoading}
                                className="h-10 w-full justify-between rounded-lg border-slate-200 bg-white px-3 text-sm font-normal text-slate-700 shadow-none hover:bg-slate-50 focus-visible:ring-slate-300"
                              >
                                <span className={cn('truncate', !field.value && 'text-slate-400')}>
                                  {field.value
                                    ? brands.find((brand: Brand) => brand.id === Number(field.value))?.name ?? 'Pilih Merk'
                                    : isBrandLoading
                                    ? 'Memuat...'
                                    : 'Pilih Merk'}
                                </span>
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 text-slate-400" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                              <Command shouldFilter={false}>
                                <CommandInput placeholder="Cari merk..." value={brandSearch} onValueChange={setBrandSearch} className="h-9" />
                                <CommandList>
                                  <CommandEmpty>Merk tidak ditemukan.</CommandEmpty>
                                  <CommandGroup>
                                    {filteredBrands.map((brand: Brand) => (
                                      <CommandItem
                                        key={brand.id}
                                        value={`${brand.name} ${brand.id}`}
                                        onSelect={() => {
                                          field.onChange(brand.id);
                                          setOpenBrandSelect(false);
                                          setBrandSearch('');
                                        }}
                                      >
                                        <Check className={cn('mr-2 h-4 w-4', Number(field.value) === brand.id ? 'opacity-100' : 'opacity-0')} />
                                        <span className="truncate">{brand.name}</span>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-10 w-10 flex-shrink-0 rounded-lg border-slate-200 text-slate-700 shadow-none hover:bg-slate-50"
                          onClick={() => setOpenBrandDialog(true)}
                        >
                          +
                        </Button>
                      </div>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-semibold text-slate-700">Kode<RequiredMark /></FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Masukkan Kode"
                          className="h-10 rounded-lg border-slate-200 px-3 text-sm shadow-none focus-visible:ring-slate-300 bg-white placeholder:text-slate-400"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="unitType"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-semibold text-slate-700">Jenis<RequiredMark /></FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Masukkan Jenis"
                          className="h-10 rounded-lg border-slate-200 px-3 text-sm shadow-none focus-visible:ring-slate-300 bg-white placeholder:text-slate-400"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-semibold text-slate-700">Tipe Unit<RequiredMark /></FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Masukkan Tipe"
                          className="h-10 rounded-lg border-slate-200 px-3 text-sm shadow-none focus-visible:ring-slate-300 bg-white placeholder:text-slate-400"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="unitModel"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-semibold text-slate-700">Model</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Masukkan Model"
                          className="h-10 rounded-lg border-slate-200 px-3 text-sm shadow-none focus-visible:ring-slate-300 bg-white placeholder:text-slate-400"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Section 2: Dimensi & Berat */}
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-semibold text-slate-900">Dimensi & Berat</h3>
                <p className="text-xs text-slate-500">Informasi berat bersih (netto) dan kotor (bruto) unit</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="nettoWeight"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-semibold text-slate-700">Netto (Kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Masukkan Berat"
                          className="h-10 rounded-lg border-slate-200 px-3 text-sm shadow-none focus-visible:ring-slate-300 bg-white placeholder:text-slate-400"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(parseNumber(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brutoWeight"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-semibold text-slate-700">Bruto (Kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Masukkan Berat"
                          className="h-10 rounded-lg border-slate-200 px-3 text-sm shadow-none focus-visible:ring-slate-300 bg-white placeholder:text-slate-400"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(parseNumber(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Section 3: Informasi Harga */}
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-semibold text-slate-900">Informasi Harga</h3>
                <p className="text-xs text-slate-500">Harga beli dan harga jual unit dalam Rupiah</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="buyPrice"
                  render={({ field: { onChange, value, ...rest } }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-semibold text-slate-700">Harga Beli<RequiredMark /></FormLabel>
                      <FormControl>
                        <MoneyInput
                          placeholder="Masukkan Harga"
                          className="h-10 rounded-lg border-slate-200 px-3 text-sm shadow-none focus-visible:ring-slate-300 bg-white placeholder:text-slate-400"
                          {...rest}
                          value={value ?? 0}
                          onChangeValue={onChange}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sellPrice"
                  render={({ field: { onChange, value, ...rest } }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-semibold text-slate-700">Harga Jual<RequiredMark /></FormLabel>
                      <FormControl>
                        <MoneyInput
                          placeholder="Masukkan Harga"
                          className="h-10 rounded-lg border-slate-200 px-3 text-sm shadow-none focus-visible:ring-slate-300 bg-white placeholder:text-slate-400"
                          {...rest}
                          value={value ?? 0}
                          onChangeValue={onChange}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-8">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isSubmitting}
              className="text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="bg-[#1F3B5B] hover:bg-[#1B3450] text-white min-w-[120px] rounded-lg shadow-sm gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                'Menyimpan...'
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {submitLabel}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>

      <CreateBrandDialog
        open={openBrandDialog}
        onOpenChange={setOpenBrandDialog}
        onCreated={(id) => {
          form.setValue('brandId', id, { shouldValidate: true });
        }}
      />
    </>
  );
}
