import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { MoneyInput } from '@/components/ui/money-input';
import { formatCurrency } from '@/lib/utils/currency';
import { Button } from '@/components/ui/button';
import { Save, Plus, ChevronsUpDown, Check } from 'lucide-react';
import { createPurchaseUnitSchema, type CreatePurchaseUnitFormValues } from '@/scheme/purchase.schema';
import { useTypeUnits, useCreateTypeUnit } from '@/hooks/useTypeUnit';
import { useBrands } from '@/hooks/useBrand';
import { TypeUnit } from '@/@types/type-unit.types';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { useUnitFormula } from '@/hooks/useUnitFormula';

// Extending the schema type for the form, or similar
// For now we map to any for simplicity in this step, but ideal is strict typing.
// The schema `createPurchaseUnitSchema` has snake_case/camelCase mix.
// We need to match the form fields to the schema.
// Schema: typeUnitId, typeUnitName, qty, price, biayaBBN, biayaEkspedisi, biayaLain
// UI Sales: tipeUnit, qty, harga, biayaBbn, biayaEkspedisi, biayaLain, totalHpp, etc.

// We will use a local interface that matches the UI for the form state,
// and then map it to the submission format if needed.
// But for parity, let's try to match valid keys.

interface Props {
  onSubmit: (data: CreatePurchaseUnitFormValues) => void;
  defaultValues?: Partial<CreatePurchaseUnitFormValues>;
  readOnly?: boolean;
  loading?: boolean;
  onCancel?: () => void;
  companyId?: string | null;
  excludedTypeUnitIds?: string[];
  prependFields?: React.ReactNode;
}

export default function PurchaseUnitForm({ onSubmit, defaultValues, readOnly, loading, onCancel, companyId, excludedTypeUnitIds = [], prependFields }: Props) {
  void companyId;
  const queryClient = useQueryClient();
  const { data: typeUnitData, isLoading: typeUnitLoading, isError: typeUnitError, refetch: refetchTypeUnits } = useTypeUnits();
  const { data: brandsData } = useBrands();
  const createTypeUnit = useCreateTypeUnit();

  const [openTypeModal, setOpenTypeModal] = useState(false);
  const [typeImage, setTypeImage] = useState<File | null>(null);
  const [openTypeSelect, setOpenTypeSelect] = useState(false);

  const form = useForm<CreatePurchaseUnitFormValues>({
    resolver: zodResolver(createPurchaseUnitSchema),
    defaultValues: {
      typeUnitId: defaultValues?.typeUnitId || '',
      qty: defaultValues?.qty,
      price: defaultValues?.price || 0,
      biayaBBN: defaultValues?.biayaBBN || 0,
      biayaEkspedisi: defaultValues?.biayaEkspedisi || 0,
      biayaLain: defaultValues?.biayaLain || 0,
      ...defaultValues,
    },
  });

  const qty = Number(form.watch('qty') ?? 0);
  const price = Number(form.watch('price') ?? 0);
  const biayaBBN = Number(form.watch('biayaBBN') ?? 0);
  const biayaEkspedisi = Number(form.watch('biayaEkspedisi') ?? 0);
  const biayaLain = Number(form.watch('biayaLain') ?? 0);

  const { formula } = useUnitFormula({
    qty_total: qty,
    price,
    bbn_price: biayaBBN,
    expedition_fee: biayaEkspedisi,
    other_fee: biayaLain,
  });

  const hppSatuan = Number(formula?.hpp_per_unit_price ?? 0);
  const dppSatuan = Number(formula?.dpp_per_unit_price ?? 0);
  const ppnSatuan = Number(formula?.ppn_per_unit_price ?? 0);
  const totalHpp = Number(formula?.hpp_total_price ?? 0);
  const totalDpp = Number(formula?.dpp_total_price ?? 0);
  const totalPpn = Number(formula?.ppn_total_price ?? 0);

  const typeUnitOptions = useMemo<TypeUnit[]>(() => {
    const maybeList = (typeUnitData as any)?.data;
    if (Array.isArray(maybeList)) return maybeList as TypeUnit[];
    if (maybeList && Array.isArray(maybeList.data)) return maybeList.data as TypeUnit[];
    return [];
  }, [typeUnitData]);
  const brandOptions = useMemo(() => {
    const maybeList = (brandsData as any)?.data;
    return Array.isArray(maybeList) ? maybeList : [];
  }, [brandsData]);

  const handleCreateTypeUnit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const code = String(formData.get('code') || '').trim();
    const name = String(formData.get('name') || '').trim();
    const brandId = Number(formData.get('brandId') || 0);
    const description = String(formData.get('description') || '').trim();
    const netto = formData.get('nettoWeight');
    const bruto = formData.get('brutoWeight');

    if (!code) {
      toast.error('Kode tipe wajib diisi');
      return;
    }

    if (!brandId) {
      toast.error('Merk kendaraan wajib dipilih');
      return;
    }

    try {
      const created = await createTypeUnit.mutateAsync({
        code,
        name: name || code,
        brandId,
        unitType: description || undefined,
        unitModel: description || undefined,
        nettoWeight: netto ? Number(netto) : undefined,
        brutoWeight: bruto ? Number(bruto) : undefined,
        image: typeImage,
      });

      if (created?.id) {
        form.setValue('typeUnitId', String(created.id));
        // Inject the newly created type unit into the cached list so the select shows it immediately
        queryClient.setQueryData(['type-units'], (prev: any) => {
          if (!prev) return { data: [created], meta: { total: 1, currentPage: 1, perPage: 10, lastPage: 1 } };
          const alreadyExist = prev.data?.some((item: any) => item.id === created.id);
          const mergedData = alreadyExist ? prev.data : [created, ...(prev.data ?? [])];
          return { ...prev, data: mergedData };
        });
        toast.success('Tipe unit berhasil ditambahkan');
      }

      setOpenTypeModal(false);
      setTypeImage(null);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Gagal menambahkan tipe unit';
      toast.error(message);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {prependFields}

          <div>
            <h2 className="text-lg font-semibold text-foreground">Unit</h2>
            <div className="my-4 h-px bg-border" />
          </div>

          {/* Row Type Unit / Qty / Harga */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="typeUnitId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Tipe Unit (Opsional)</FormLabel>
                  <div className="flex items-center gap-2">
                    <Popover open={openTypeSelect} onOpenChange={setOpenTypeSelect}>
                      <FormControl>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            role="combobox"
                            aria-expanded={openTypeSelect}
                            aria-controls="type-unit-combobox-list"
                            disabled={readOnly}
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <span className={cn('truncate', !field.value && 'text-muted-foreground')}>
                              {field.value ? typeUnitOptions.find((option) => String(option.id) === field.value)?.name ?? 'Pilih tipe unit' : 'Pilih tipe unit'}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </button>
                        </PopoverTrigger>
                      </FormControl>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput placeholder="Cari tipe unit..." />
                          <CommandList id="type-unit-combobox-list">
                            {typeUnitLoading && <div className="px-3 py-2 text-xs text-muted-foreground">Memuat tipe unit...</div>}
                            {typeUnitError && (
                              <div className="px-3 py-2 text-xs text-destructive">
                                Gagal memuat tipe unit.{' '}
                                <button type="button" className="underline" onClick={() => refetchTypeUnits()}>
                                  Coba lagi
                                </button>
                              </div>
                            )}
                            <CommandEmpty>Tipe unit tidak ditemukan.</CommandEmpty>
                            <CommandGroup>
                              {typeUnitOptions.map((option) => (
                                <CommandItem
                                  key={option.id}
                                  value={`${option.name} ${option.code ?? ''} ${option.id}`}
                                  disabled={excludedTypeUnitIds.includes(String(option.id))}
                                  onSelect={() => {
                                    if (excludedTypeUnitIds.includes(String(option.id))) return;
                                    field.onChange(String(option.id));
                                    setOpenTypeSelect(false);
                                  }}
                                >
                                  <Check className={cn('mr-2 h-4 w-4', field.value === String(option.id) ? 'opacity-100' : 'opacity-0')} />
                                  <span className="truncate">{option.name}</span>
                                  {excludedTypeUnitIds.includes(String(option.id)) && <span className="ml-auto text-xs text-muted-foreground">Sudah dipakai</span>}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <Button type="button" variant="outline" size="icon" className="h-10 w-10" onClick={() => setOpenTypeModal(true)}>
                      <Plus className="h-4 w-4" />
                    </Button>
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
                      value={field.value ?? ''}
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
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Harga</FormLabel>
                  <FormControl>
                    <MoneyInput name={field.name} value={Number(field.value) || 0} onChangeValue={(val) => field.onChange(val)} onBlur={field.onBlur} disabled={readOnly} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="pt-2">
            <h2 className="text-sm font-semibold text-foreground">Harga</h2>
          </div>

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

          <div className="pt-2">
            <h2 className="text-sm font-semibold text-foreground">Total Harga</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormItem>
              <FormLabel className="text-sm font-medium">HPP Total</FormLabel>
              <FormControl>
                <Input value={formatCurrency(totalHpp)} className="bg-muted/50" disabled readOnly />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel className="text-sm font-medium">DPP Total</FormLabel>
              <FormControl>
                <Input value={formatCurrency(totalDpp)} className="bg-muted/50" disabled readOnly />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel className="text-sm font-medium">PPN Total</FormLabel>
              <FormControl>
                <Input value={formatCurrency(totalPpn)} className="bg-muted/50" disabled readOnly />
              </FormControl>
            </FormItem>
          </div>

          <div className="pt-2">
            <h2 className="text-sm font-semibold text-foreground">Biaya</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="biayaBBN"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Biaya BBN</FormLabel>
                  <FormControl>
                    <MoneyInput placeholder="Value" name={field.name} value={Number(field.value) || 0} onChangeValue={(val) => field.onChange(val)} onBlur={field.onBlur} disabled={readOnly} />
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
                    <MoneyInput placeholder="Value" name={field.name} value={Number(field.value) || 0} onChangeValue={(val) => field.onChange(val)} onBlur={field.onBlur} disabled={readOnly} />
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
                    <MoneyInput placeholder="Value" name={field.name} value={Number(field.value) || 0} onChangeValue={(val) => field.onChange(val)} onBlur={field.onBlur} disabled={readOnly} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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

      <Dialog open={openTypeModal} onOpenChange={setOpenTypeModal}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Tambah Data Tipe</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleCreateTypeUnit}>
            <div className="space-y-2">
              <Label htmlFor="code">Kode Tipe</Label>
              <Input id="code" name="code" placeholder="Masukkan kode tipe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nama Tipe</Label>
              <Input id="name" name="name" placeholder="Masukkan nama tipe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Input id="description" name="description" placeholder="Masukkan deskripsi" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brandId">Merk Kendaraan</Label>
              <select id="brandId" name="brandId" className="w-full border rounded-md h-10 px-3" required defaultValue="">
                <option value="" disabled>
                  Pilih merk
                </option>
                {brandOptions.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="nettoWeight">Berat Netto</Label>
                <Input id="nettoWeight" name="nettoWeight" type="number" step="0.01" placeholder="Masukkan berat" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brutoWeight">Berat Bruto</Label>
                <Input id="brutoWeight" name="brutoWeight" type="number" step="0.01" placeholder="Masukkan berat" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Gambar (opsional)</Label>
              <Input id="image" name="image" type="file" accept="image/*" onChange={(e) => setTypeImage(e.target.files?.[0] || null)} />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setOpenTypeModal(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={createTypeUnit.isPending} className="bg-[#1e293b] hover:bg-[#0f172a] text-white">
                {createTypeUnit.isPending ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
