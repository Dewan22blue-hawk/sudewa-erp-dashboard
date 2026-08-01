'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MoneyInput } from '@/components/ui/money-input';
import { formatMoneyInput } from '@/lib/utils/money-input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Check, ChevronsUpDown } from 'lucide-react';
import { editUnitSchema, EditUnitFormData } from './edit-unit.schema';
import { ProductOption } from './edit-unit.types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { useUnitFormula } from '@/hooks/useUnitFormula';
import { useTaxDefault } from '@/hooks/useTax';
import { useTypeUnits } from '@/hooks/useTypeUnit';

interface EditUnitFormProps {
  defaultValues: EditUnitFormData;
  onSubmit?: (data: EditUnitFormData) => void;
  onCancel: () => void;
  readOnly?: boolean;
  showAddUnitButton?: boolean;
  onAddUnitClick?: () => void;
  prependFields?: ReactNode;
  hideCustomerField?: boolean;
  submitDisabled?: boolean;
  cancelDisabled?: boolean;
  productOptions?: ProductOption[];
  searchableTypeUnit?: boolean;
  hideItemFields?: boolean;
}

export function EditUnitForm({
  defaultValues,
  onSubmit = () => { },
  onCancel,
  readOnly = false,
  prependFields,
  submitDisabled = false,
  cancelDisabled = false,
  productOptions,
  searchableTypeUnit = false,
  hideItemFields = false,
}: EditUnitFormProps) {
  const [isUsd, setIsUsd] = useState(Boolean(defaultValues?.hargaUsd && Number(defaultValues.hargaUsd) > 0));

  const [selectedDppTaxVersionId, setSelectedDppTaxVersionId] = useState<string | number | null>(defaultValues?.dppTaxVersionId ?? null);
  const [selectedPpnTaxVersionId, setSelectedPpnTaxVersionId] = useState<string | number | null>(defaultValues?.ppnTaxVersionId ?? null);
  const [openTypeSelect, setOpenTypeSelect] = useState(false);

  const { data: defaultDppTax } = useTaxDefault('dpp');
  const { data: defaultPpnTax } = useTaxDefault('ppn');
  const { data: typeUnitData } = useTypeUnits();

  const typeUnitList = useMemo(() => {
    const list = typeUnitData?.data;
    if (Array.isArray(list)) return list;
    if (list && Array.isArray((list as any).data)) return (list as any).data;
    return [];
  }, [typeUnitData]);

  useEffect(() => {
    if (defaultDppTax?.id && selectedDppTaxVersionId == null) {
      setSelectedDppTaxVersionId(defaultDppTax.id);
    }
  }, [defaultDppTax, selectedDppTaxVersionId]);

  useEffect(() => {
    if (defaultPpnTax?.id && selectedPpnTaxVersionId == null) {
      setSelectedPpnTaxVersionId(defaultPpnTax.id);
    }
  }, [defaultPpnTax, selectedPpnTaxVersionId]);

  const form = useForm<EditUnitFormData>({
    resolver: zodResolver(editUnitSchema),
    defaultValues: {
      ...defaultValues,
      tipeUnit: defaultValues?.tipeUnit || '',
      qty: defaultValues?.qty ?? 1,
      harga: defaultValues?.harga || 0,
      biayaBbn: defaultValues?.biayaBbn || 0,
      biayaEkspedisi: defaultValues?.biayaEkspedisi || 0,
      biayaLain: defaultValues?.biayaLain || 0,
      hargaUsd: defaultValues?.hargaUsd || 0,
      hargaPerUnitUsd: defaultValues?.hargaPerUnitUsd || 0,
    },
  });

  const qty = Number(form.watch('qty') ?? defaultValues?.qty ?? 1);
  const harga = Number(form.watch('harga') ?? defaultValues?.harga ?? 0);
  const biayaBbn = Number(form.watch('biayaBbn') ?? defaultValues?.biayaBbn ?? 0);
  const biayaEkspedisi = Number(form.watch('biayaEkspedisi') ?? defaultValues?.biayaEkspedisi ?? 0);
  const biayaLain = Number(form.watch('biayaLain') ?? defaultValues?.biayaLain ?? 0);
  const unitOptions = productOptions;

  const { formula } = useUnitFormula({
    qty_total: qty,
    price: harga,
    bbn_price: biayaBbn,
    expedition_fee: biayaEkspedisi,
    other_fee: biayaLain,
    dpp_tax_id: selectedDppTaxVersionId ?? undefined,
    ppn_tax_id: selectedPpnTaxVersionId ?? undefined,
  });

  const toNumber = (value: unknown): number => {
    const normalized = Number(value ?? 0);
    return Number.isFinite(normalized) ? normalized : 0;
  };

  const hppSatuanVal = Number(formula?.hpp_per_unit_price ?? defaultValues?.hppSatuan ?? 0);
  const dppSatuanVal = Number(formula?.dpp_per_unit_price ?? defaultValues?.dppSatuan ?? 0);
  const ppnSatuanVal = Number(formula?.ppn_per_unit_price ?? defaultValues?.ppnSatuan ?? 0);
  const totalHppVal = Number(formula?.hpp_total_price ?? defaultValues?.totalHpp ?? 0);
  const totalDppVal = Number(formula?.dpp_total_price ?? defaultValues?.totalDpp ?? 0);
  const totalPpnVal = Number(formula?.ppn_total_price ?? defaultValues?.totalPpn ?? 0);

  const handleFormSubmit = (values: EditUnitFormData) => {
    onSubmit({
      ...values,
      dppTaxVersionId: selectedDppTaxVersionId ?? undefined,
      ppnTaxVersionId: selectedPpnTaxVersionId ?? undefined,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Section Header */}
        <div>
          <h2 className="text-xl font-semibold text-foreground tracking-tight">Informasi Penjualan</h2>
          <p className="text-sm text-gray-500 mt-1">Kelola detail informasi penjualan unit dan biaya-biaya terkait</p>
          <div className="my-6 h-px bg-muted/60" />
        </div>

        {prependFields}

        {!hideItemFields && (
          <>
            {/* ROW 1: Tipe Unit, Qty, Harga */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="tipeUnit"
                render={({ field }) => (
                  <FormItem className="min-w-0">
                    <FormLabel className="text-sm font-medium">Tipe Unit</FormLabel>
                    <div className="flex items-center gap-2">
                      {searchableTypeUnit ? (
                        <Popover open={openTypeSelect} onOpenChange={setOpenTypeSelect}>
                          <FormControl>
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                role="combobox"
                                aria-expanded={false}
                                aria-controls="combobox-options"
                                disabled={readOnly}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <span className={cn('truncate', !field.value && 'text-muted-foreground')}>
                                  {unitOptions?.find((option) => option.value === field.value)?.label ?? 'Select an item'}
                                </span>
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </button>
                            </PopoverTrigger>
                          </FormControl>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                              <CommandInput placeholder="Cari tipe unit..." />
                              <CommandList>
                                <CommandEmpty>Tipe Unit tidak ditemukan.</CommandEmpty>
                                <CommandGroup>
                                  {unitOptions?.map((option) => (
                                    <CommandItem key={option.value} value={option.label} onSelect={() => {
                                      field.onChange(option.value);
                                      const matched = typeUnitList.find((item: any) => String(item.id) === String(option.value));
                                      const sellPriceVal = matched?.sellPrice ?? matched?.sell_price;
                                      if (sellPriceVal !== undefined && sellPriceVal !== null) {
                                        form.setValue('harga', Number(sellPriceVal));
                                      }
                                      setOpenTypeSelect(false);
                                    }}>
                                      <Check className={cn('mr-2 h-4 w-4', field.value === option.value ? 'opacity-100' : 'opacity-0')} />
                                      {option.label}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <Select onValueChange={(val) => {
                          field.onChange(val);
                          const matched = typeUnitList.find((item: any) => String(item.id) === String(val));
                          const sellPriceVal = matched?.sellPrice ?? matched?.sell_price;
                          if (sellPriceVal !== undefined && sellPriceVal !== null) {
                            form.setValue('harga', Number(sellPriceVal));
                          }
                        }} defaultValue={field.value} disabled={readOnly}>
                          <FormControl>
                            <SelectTrigger className="w-full bg-transparent">
                              <SelectValue placeholder="Select an item" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {unitOptions?.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                      <Input
                        type="number"
                        min="1"
                        placeholder='1'
                        className="bg-transparent"
                        value={field.value ?? '1'}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === '' ? undefined : Number(value));
                        }}
                        disabled={readOnly}
                      />
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
                      <MoneyInput
                        className="bg-transparent"
                        name={field.name}
                        onBlur={field.onBlur}
                        value={toNumber(field.value)}
                        onChangeValue={field.onChange}
                        disabled={readOnly}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* USD Transaction Toggle */}
            <div className="flex items-center space-x-2 py-1">
              <input autoComplete="off"
                type="checkbox"
                id="sales_is_usd"
                checked={isUsd}
                onChange={(e) => {
                  setIsUsd(e.target.checked);
                  if (!e.target.checked) {
                    form.setValue('hargaUsd', 0);
                    form.setValue('hargaPerUnitUsd', 0);
                  }
                }}
                disabled={readOnly}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <Label htmlFor="sales_is_usd" className="text-sm font-medium cursor-pointer">
                Transaksi USD (Gunakan mata uang asing USD)
              </Label>
            </div>

            {/* USD Inputs */}
            {isUsd && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-md border border-amber-200 bg-amber-50/30 animate-in fade-in slide-in-from-top-2 duration-200">
                <FormField
                  control={form.control}
                  name="hargaUsd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-amber-900">Total Harga (USD)</FormLabel>
                      <FormControl>
                        <MoneyInput
                          currency="USD"
                          placeholder="$ 0.00"
                          name={field.name}
                          value={field.value ?? 0}
                          onChangeValue={(val) => field.onChange(val === 0 ? undefined : val)}
                          disabled={readOnly}
                          onBlur={field.onBlur}
                          className="border-amber-200 focus:border-amber-300 focus:ring-amber-200 bg-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hargaPerUnitUsd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-amber-900">Harga Satuan (USD)</FormLabel>
                      <FormControl>
                        <MoneyInput
                          currency="USD"
                          placeholder="$ 0.00"
                          name={field.name}
                          value={field.value ?? 0}
                          onChangeValue={(val) => field.onChange(val === 0 ? undefined : val)}
                          disabled={readOnly}
                          onBlur={field.onBlur}
                          className="border-amber-200 focus:border-amber-300 focus:ring-amber-200 bg-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* ROW 2: Biaya BBN, Biaya Ekspedisi, Biaya Lain */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="biayaBbn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Biaya BBN</FormLabel>
                    <FormControl>
                      <MoneyInput
                        placeholder="Value"
                        className="bg-transparent"
                        name={field.name}
                        onBlur={field.onBlur}
                        value={toNumber(field.value)}
                        onChangeValue={field.onChange}
                        disabled={readOnly}
                      />
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
                      <MoneyInput
                        placeholder="Value"
                        className="bg-transparent"
                        name={field.name}
                        onBlur={field.onBlur}
                        value={toNumber(field.value)}
                        onChangeValue={field.onChange}
                        disabled={readOnly}
                      />
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
                      <MoneyInput
                        placeholder="Value"
                        className="bg-transparent"
                        name={field.name}
                        onBlur={field.onBlur}
                        value={toNumber(field.value)}
                        onChangeValue={field.onChange}
                        disabled={readOnly}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* ROW 3: HPP Satuan, DPP Satuan, PPN Satuan */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormItem>
                <FormLabel className="text-sm font-medium">HPP Satuan</FormLabel>
                <FormControl>
                  <Input
                    value={formatMoneyInput(String(Math.round(hppSatuanVal)))}
                    className="bg-transparent"
                    disabled
                    readOnly
                  />
                </FormControl>
              </FormItem>

              <FormItem>
                <FormLabel className="text-sm font-medium">DPP Satuan</FormLabel>
                <FormControl>
                  <Input
                    value={formatMoneyInput(String(Math.round(dppSatuanVal)))}
                    className="bg-transparent"
                    disabled
                    readOnly
                  />
                </FormControl>
              </FormItem>

              <FormItem>
                <FormLabel className="text-sm font-medium">PPN Satuan</FormLabel>
                <FormControl>
                  <Input
                    value={formatMoneyInput(String(Math.round(ppnSatuanVal)))}
                    className="bg-transparent"
                    disabled
                    readOnly
                  />
                </FormControl>
              </FormItem>
            </div>

            {/* ROW 4: Total HPP, Total DPP + Tax Selector, Total PPN + Tax Selector */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormItem>
                <FormLabel className="text-sm font-medium">Total HPP</FormLabel>
                <FormControl>
                  <Input
                    value={formatMoneyInput(String(Math.round(totalHppVal)))}
                    className="bg-transparent"
                    disabled
                    readOnly
                  />
                </FormControl>
              </FormItem>

              <FormItem>
                <FormLabel className="text-sm font-medium">Total DPP</FormLabel>
                <FormControl>
                  <Input
                    value={formatMoneyInput(String(Math.round(totalDppVal)))}
                    className="bg-transparent"
                    disabled
                    readOnly
                  />
                </FormControl>
              </FormItem>

              <FormItem>
                <FormLabel className="text-sm font-medium">Total PPN</FormLabel>
                <FormControl>
                  <Input
                    value={formatMoneyInput(String(Math.round(totalPpnVal)))}
                    className="bg-transparent"
                    disabled
                    readOnly
                  />
                </FormControl>
              </FormItem>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center items-center gap-6 pt-10">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={form.formState.isSubmitting || cancelDisabled}
            className="text-muted-foreground font-medium hover:text-foreground"
          >
            Batal
          </Button>
          {!readOnly && (
            <Button type="submit" disabled={form.formState.isSubmitting || submitDisabled} className="bg-[#1e293b] hover:bg-[#0f172a] text-white font-medium min-w-[120px] rounded-lg">
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