import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { ChevronLeft, Plus, Save, Trash2 } from 'lucide-react';
import type { OrderList, OrderListVehicleType } from '@/@types/order-list.types';
import type { Tarif } from '@/@types/tarif.types';
import { SearchableSelect, type SearchableSelectOption } from '@/components/features/vehicle-data/SearchableSelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MoneyInput } from '@/components/ui/money-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { orderListFormSchema, type OrderListFormSchema } from '@/schemas/order-list.schema';
import {
  ORDER_LIST_VEHICLE_OPTIONS,
  formatOrderCurrency,
} from './order-list.utils';

export interface OrderListFormItemValue {
  localId: string;
  id?: number;
  tarifId: string;
  vehicleType: OrderListVehicleType;
  loadingIn: string;
  loadingOut: string;
  deliveryDestination: string;
  cargoItems: OrderListFormCargoItemValue[];
  driverFee: number;
  expeditionInvoice: number;
}

export interface OrderListFormCargoItemValue {
  localId: string;
  id?: number;
  loadContent: string;
  qty: number;
}

export interface OrderListFormValues extends OrderListFormSchema {}

interface OrderListFormProps {
  mode: 'create' | 'edit';
  initialData?: OrderList | null;
  customerOptions: SearchableSelectOption[];
  tarifOptions: SearchableSelectOption[];
  tarifRecords: Tarif[];
  customerLoading?: boolean;
  tarifLoading?: boolean;
  onCustomerSearch: (value: string) => void;
  onTarifSearch: (value: string) => void;
  onSubmit: (values: OrderListFormValues) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const createItemId = () => Math.random().toString(36).slice(2, 11);

const createCargoItem = (overrides?: Partial<OrderListFormCargoItemValue>): OrderListFormCargoItemValue => ({
  localId: createItemId(),
  id: overrides?.id,
  loadContent: overrides?.loadContent ?? '',
  qty: Number(overrides?.qty ?? 0),
});

const getVehicleFee = (tarif: Tarif | undefined, vehicleType: OrderListVehicleType) => {
  if (!tarif) return { driverFee: 0, invoice: 0 };
  if (vehicleType === 'towing') {
    return {
      driverFee: Number(tarif.ujTowing ?? 0),
      invoice: 0,
    };
  }
  if (vehicleType === 'cdd') {
    return {
      driverFee: Number(tarif.ujCdd ?? 0),
      invoice: Number(tarif.invCdd ?? 0),
    };
  }
  return {
    driverFee: Number(tarif.ujFuso ?? 0),
    invoice: Number(tarif.invFuso ?? 0),
  };
};

const toItemDefaults = (order?: OrderList | null): OrderListFormItemValue[] => {
  if (!order?.tarifs?.length) {
    return [
      {
        localId: createItemId(),
        tarifId: '',
        vehicleType: 'fuso',
        loadingIn: '',
        loadingOut: '',
        deliveryDestination: '',
        cargoItems: [createCargoItem()],
        driverFee: 0,
        expeditionInvoice: 0,
      },
    ];
  }

  return order.tarifs.map((item) => ({
    localId: createItemId(),
    id: item.id,
    tarifId: item.tarifId ? String(item.tarifId) : '',
    vehicleType: item.vehicleType ?? 'fuso',
    loadingIn: item.loadingIn ?? '',
    loadingOut: item.loadingOut ?? '',
    deliveryDestination: item.deliveryDestination ?? '',
    cargoItems:
      item.tarifItems?.length
        ? item.tarifItems.map((tarifItem) =>
            createCargoItem({
              id: tarifItem.id,
              loadContent: tarifItem.loadContent,
              qty: Number(tarifItem.qty ?? 0),
            }),
          )
        : [
            createCargoItem({
              loadContent: item.loadContent ?? '',
              qty: Number(item.qty ?? 0),
            }),
          ],
    driverFee: Number(item.driverFee ?? 0),
    expeditionInvoice: Number(item.expeditionInvoice ?? order.billInvoice ?? 0),
  }));
};

const mergeSelectOptions = (options: SearchableSelectOption[], extras: SearchableSelectOption[]) => {
  const map = new Map<string, SearchableSelectOption>();
  [...extras, ...options].forEach((option) => {
    if (option.value) {
      map.set(option.value, option);
    }
  });
  return Array.from(map.values());
};

export function OrderListForm({
  initialData,
  customerOptions,
  tarifOptions,
  tarifRecords,
  customerLoading = false,
  tarifLoading = false,
  onCustomerSearch,
  onTarifSearch,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: OrderListFormProps) {
  const defaultCustomerOption = React.useMemo<SearchableSelectOption[]>(() => {
    if (!initialData?.customer?.id) return [];
    return [
      {
        value: String(initialData.customer.id),
        label: initialData.customer.name,
        subtitle: initialData.customer.code,
      },
    ];
  }, [initialData?.customer]);

  const defaultTarifOptions = React.useMemo<SearchableSelectOption[]>(() => {
    if (!initialData?.tarifs?.length) return [];
    return initialData.tarifs
      .filter((item) => item.tarifId)
      .map((item) => ({
        value: String(item.tarifId),
        label: [item.tarif?.loadingIn || item.loadingIn, item.tarif?.loadingOut || item.loadingOut].filter(Boolean).join(' - ') || `Tarif #${item.tarifId}`,
        subtitle: item.tarif?.customer?.name,
      }));
  }, [initialData?.tarifs]);

  const mergedCustomerOptions = React.useMemo(
    () => mergeSelectOptions(customerOptions, defaultCustomerOption),
    [customerOptions, defaultCustomerOption],
  );
  const mergedTarifOptions = React.useMemo(() => mergeSelectOptions(tarifOptions, defaultTarifOptions), [tarifOptions, defaultTarifOptions]);

  const {
    control,
    register,
    handleSubmit,
    getValues,
    reset,
    setValue,
    formState: { errors },
  } = useForm<OrderListFormValues>({
    resolver: zodResolver(orderListFormSchema),
    defaultValues: {
      customerId: initialData?.customerId ? String(initialData.customerId) : '',
      status: initialData?.status ?? 'pending',
      invoiceBill: Number(initialData?.billInvoice ?? 0),
      ppn: Number(initialData?.ppn ?? 0),
      ujDriver: Number(initialData?.ujDriver ?? 0),
      note: initialData?.note ?? '',
      items: toItemDefaults(initialData),
    },
  });

  React.useEffect(() => {
    reset({
      customerId: initialData?.customerId ? String(initialData.customerId) : '',
      status: initialData?.status ?? 'pending',
      invoiceBill: Number(initialData?.billInvoice ?? 0),
      ppn: Number(initialData?.ppn ?? 0),
      ujDriver: Number(initialData?.ujDriver ?? 0),
      note: initialData?.note ?? '',
      items: toItemDefaults(initialData),
    });
  }, [initialData, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchedItems = useWatch({ control, name: 'items' });
  const customerId = useWatch({ control, name: 'customerId' });
  const invoiceBill = useWatch({ control, name: 'invoiceBill' });
  const watchedPpn = useWatch({ control, name: 'ppn' });
  const watchedUjDriver = useWatch({ control, name: 'ujDriver' });
  const selectedCustomer = mergedCustomerOptions.find((item) => item.value === customerId);

  const appendCargoItem = React.useCallback(
    (itemIndex: number) => {
      const current = getValues(`items.${itemIndex}.cargoItems`) ?? [];
      setValue(`items.${itemIndex}.cargoItems`, [...current, createCargoItem()], { shouldDirty: true, shouldTouch: true });
    },
    [getValues, setValue],
  );

  const removeCargoItem = React.useCallback(
    (itemIndex: number, cargoIndex: number) => {
      const current = getValues(`items.${itemIndex}.cargoItems`) ?? [];
      if (current.length <= 1) return;
      const next = current.filter((_, index) => index !== cargoIndex);
      setValue(`items.${itemIndex}.cargoItems`, next, { shouldDirty: true, shouldTouch: true });
    },
    [getValues, setValue],
  );

  const getTarifById = React.useCallback(
    (tarifId: string): Tarif | undefined => {
      const fromLookup = tarifRecords.find((item) => String(item.id) === tarifId);
      if (fromLookup) return fromLookup;

      const fromInitial = initialData?.tarifs?.find((item) => String(item.tarifId) === tarifId)?.tarif;
      if (fromInitial) {
        return {
          id: fromInitial.id,
          uuid: fromInitial.uuid,
          customerId: Number(fromInitial.customerId ?? 0),
          loadingIn: fromInitial.loadingIn,
          loadingOut: fromInitial.loadingOut,
          distance: Number(fromInitial.distance ?? 0),
          ujTowing: fromInitial.ujTowing ?? null,
          ujCdd: fromInitial.ujCdd ?? null,
          ujFuso: fromInitial.ujFuso ?? null,
          invCdd: fromInitial.invCdd ?? null,
          invFuso: fromInitial.invFuso ?? null,
          customer: fromInitial.customer,
        };
      }
      return undefined;
    },
    [initialData?.tarifs, tarifRecords],
  );

  const handleTarifChange = React.useCallback(
    (index: number, tarifId: string) => {
      setValue(`items.${index}.tarifId`, tarifId, { shouldValidate: true, shouldDirty: true });
      const matchedTarif = getTarifById(tarifId);
      if (!matchedTarif) return;

      const nextVehicleType = watchedItems?.[index]?.vehicleType ?? 'fuso';
      const fee = getVehicleFee(matchedTarif, nextVehicleType);

      setValue(`items.${index}.loadingIn`, matchedTarif.loadingIn ?? '', { shouldDirty: true });
      setValue(`items.${index}.loadingOut`, matchedTarif.loadingOut ?? '', { shouldDirty: true });
      setValue(`items.${index}.driverFee`, fee.driverFee, { shouldDirty: true });
      setValue(`items.${index}.expeditionInvoice`, fee.invoice, { shouldDirty: true });
    },
    [getTarifById, setValue, watchedItems],
  );

  const handleVehicleTypeChange = React.useCallback(
    (index: number, vehicleType: OrderListVehicleType) => {
      const itemsCount = watchedItems?.length ?? 0;
      for (let i = 0; i < itemsCount; i++) {
        setValue(`items.${i}.vehicleType`, vehicleType, { shouldValidate: true, shouldDirty: true });
        const tarifId = watchedItems?.[i]?.tarifId ?? '';
        const matchedTarif = getTarifById(tarifId);
        const fee = getVehicleFee(matchedTarif, vehicleType);
        setValue(`items.${i}.driverFee`, fee.driverFee, { shouldDirty: true });
        setValue(`items.${i}.expeditionInvoice`, fee.invoice, { shouldDirty: true });
      }
    },
    [getTarifById, setValue, watchedItems],
  );

  React.useEffect(() => {
    const totalDriver = (watchedItems ?? []).reduce((sum, item) => sum + Number(item?.driverFee ?? 0), 0);
    setValue('ujDriver', totalDriver, { shouldDirty: true });
  }, [setValue, watchedItems]);

  React.useEffect(() => {
    const totalInvoice = (watchedItems ?? []).reduce((sum, item) => sum + Number(item?.expeditionInvoice ?? 0), 0);
    setValue('invoiceBill', totalInvoice, { shouldDirty: true });
  }, [setValue, watchedItems]);

  React.useEffect(() => {
    const calculatedPpn = Math.round(Number(invoiceBill || 0) * 0.011);
    setValue('ppn', calculatedPpn, { shouldDirty: true });
  }, [invoiceBill, setValue]);

  const onInvalid = (errors: any) => {
    console.error('Form validation failed:', errors);
    toast.error('Form tidak valid. Harap periksa kembali inputan Anda.');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
      <input type="hidden" {...register('status')} />
      <input type="hidden" {...register('note')} />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full p-1.5 text-slate-900 transition hover:bg-slate-100"
        >
          <ChevronLeft className="h-6 w-6 stroke-[2.5]" />
        </button>
        <h1 className="text-2xl font-semibold text-slate-950">
          Form Input Order
        </h1>
      </div>

      <div className="space-y-2">
        <h2 className="text-[17px] font-bold text-slate-950">Form Detail Order</h2>
        <div className="h-px bg-slate-200" />
      </div>

      <div className="space-y-5">
        {/* Card 1 — Customer */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-none">
          <div className="space-y-2">
            <Label className="text-[14px] font-semibold text-slate-900">Nama Customer</Label>
            <div className="w-full max-w-[420px]">
              <Controller
                control={control}
                name="customerId"
                rules={{ required: 'Customer wajib dipilih' }}
                render={({ field }) => (
                  <SearchableSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={mergedCustomerOptions}
                    placeholder="Masukkan nama customer"
                    searchPlaceholder="Cari customer..."
                    loading={customerLoading}
                    onSearchChange={onCustomerSearch}
                    className={`h-10 rounded-xl border-[#E5E7EB] bg-white text-[15px] ${errors.customerId ? 'border-red-500' : ''}`}
                  />
                )}
              />
              {selectedCustomer?.subtitle ? (
                <p className="text-xs text-slate-400 mt-1">Kode customer: {selectedCustomer.subtitle}</p>
              ) : null}
              {errors.customerId ? (
                <p className="text-xs text-red-500 mt-1">{errors.customerId.message}</p>
              ) : null}
            </div>
          </div>
        </section>

        {fields.map((field, index) => {
          const item = watchedItems?.[index];
          const tarif = getTarifById(item?.tarifId ?? '');

          return (
            <section key={field.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-none space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <Label className="text-[15px] font-bold text-slate-900">Rute #{index + 1}</Label>
                {fields.length > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="h-8 px-2 text-xs font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Hapus Rute
                  </Button>
                ) : null}
              </div>

              {/* Row 1: Pilih Rute & Loading In */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-[14px] font-semibold text-slate-900">Pilih Rute / Tarif</Label>
                  <Controller
                    control={control}
                    name={`items.${index}.tarifId`}
                    rules={{ required: 'Tarif wajib dipilih' }}
                    render={({ field: controllerField }) => (
                      <SearchableSelect
                        value={controllerField.value}
                        onChange={(value) => handleTarifChange(index, value)}
                        options={mergedTarifOptions}
                        placeholder="Pilih tarif"
                        searchPlaceholder="Cari tarif..."
                        loading={tarifLoading}
                        onSearchChange={onTarifSearch}
                        className={`h-10 rounded-xl border-[#E5E7EB] bg-white text-[15px] ${errors.items?.[index]?.tarifId ? 'border-red-500' : ''}`}
                      />
                    )}
                  />
                  {errors.items?.[index]?.tarifId ? (
                    <p className="text-xs text-red-500 mt-1">{errors.items[index]?.tarifId?.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label className="text-[14px] font-semibold text-slate-900">Loading In</Label>
                  <Input
                    readOnly
                    value={item?.loadingIn ?? ''}
                    placeholder="Contoh: Surabaya"
                    className="h-10 rounded-xl border-[#E5E7EB] bg-slate-50 text-[15px] shadow-none cursor-default"
                  />
                </div>
              </div>

              {/* Row 2: Loading Out, Tujuan Kirim, Tipe Armada */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-[14px] font-semibold text-slate-900">Loading Out</Label>
                  <Input
                    readOnly
                    value={item?.loadingOut ?? ''}
                    placeholder="Contoh: Yogyakarta"
                    className="h-10 rounded-xl border-[#E5E7EB] bg-slate-50 text-[15px] shadow-none cursor-default"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[14px] font-semibold text-slate-900">Tujuan Kirim</Label>
                  <Input
                    placeholder="Contoh: Nama PT"
                    className={`h-10 rounded-xl border-[#E5E7EB] bg-white text-[15px] shadow-none ${errors.items?.[index]?.deliveryDestination ? 'border-red-500' : ''}`}
                    {...register(`items.${index}.deliveryDestination`, { required: 'Tujuan kirim wajib diisi' })}
                  />
                  {errors.items?.[index]?.deliveryDestination ? (
                    <p className="text-xs text-red-500 mt-1">{errors.items[index]?.deliveryDestination?.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label className="text-[14px] font-semibold text-slate-900">Tipe Armada</Label>
                  <Controller
                    control={control}
                    name={`items.${index}.vehicleType`}
                    rules={{ required: 'Tipe armada wajib dipilih' }}
                    render={({ field: controllerField }) => (
                      <Select
                        value={controllerField.value}
                        onValueChange={(value: OrderListVehicleType) => handleVehicleTypeChange(index, value)}
                        disabled={index > 0}
                      >
                        <SelectTrigger className="h-10 rounded-xl border-[#E5E7EB] bg-white text-[15px] shadow-none disabled:bg-slate-50 disabled:opacity-100 disabled:cursor-not-allowed">
                          <SelectValue placeholder="Pilih armada" />
                        </SelectTrigger>
                        <SelectContent>
                          {ORDER_LIST_VEHICLE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              {tarif ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-500">
                  Tarif terpilih: {tarif.loadingIn || '-'} ke {tarif.loadingOut || '-'}
                </div>
              ) : null}

              {/* Divider */}
              <div className="h-px bg-slate-100 my-2" />

              {/* Muatan Section */}
              <div className="space-y-4">
                <Label className="text-[14px] font-semibold text-slate-900">Muatan</Label>

                <div className="grid grid-cols-1 gap-3">
                  {/* Header kolom */}
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex-1">
                      <Label className="text-[13px] font-medium text-slate-500">Nama Muatan</Label>
                    </div>
                    <div className="w-[120px]">
                      <Label className="text-[13px] font-medium text-slate-500">QTY</Label>
                    </div>
                    <div className="w-10 shrink-0" />
                  </div>

                  {/* Baris muatan */}
                  {(item?.cargoItems ?? []).map((cargoItem, cargoIndex) => {
                    const cargoKey = cargoItem?.localId || `cargo-${index}-${cargoIndex}`;
                    const cargoCount = item?.cargoItems?.length ?? 0;
                    return (
                      <div key={cargoKey} className="flex items-start gap-3 w-full">
                        <div className="flex-1 space-y-1">
                          <Input
                            placeholder="Contoh: Motor vario"
                            className={`h-10 rounded-xl border-[#E5E7EB] bg-white text-[15px] shadow-none ${errors.items?.[index]?.cargoItems?.[cargoIndex]?.loadContent ? 'border-red-500' : ''}`}
                            {...register(`items.${index}.cargoItems.${cargoIndex}.loadContent`, { required: 'Muatan wajib diisi' })}
                          />
                          {errors.items?.[index]?.cargoItems?.[cargoIndex]?.loadContent ? (
                            <p className="text-xs text-red-500">{errors.items[index]?.cargoItems?.[cargoIndex]?.loadContent?.message}</p>
                          ) : null}
                        </div>

                        <div className="w-[120px] space-y-1">
                          <Input
                            type="number"
                            min={0}
                            placeholder="0"
                            className={`h-10 rounded-xl border-[#E5E7EB] bg-white text-[15px] shadow-none ${errors.items?.[index]?.cargoItems?.[cargoIndex]?.qty ? 'border-red-500' : ''}`}
                            {...register(`items.${index}.cargoItems.${cargoIndex}.qty`, {
                              valueAsNumber: true,
                              required: 'Qty wajib diisi',
                              min: { value: 1, message: 'Qty minimal 1' },
                            })}
                          />
                          {errors.items?.[index]?.cargoItems?.[cargoIndex]?.qty ? (
                            <p className="text-xs text-red-500">{errors.items[index]?.cargoItems?.[cargoIndex]?.qty?.message}</p>
                          ) : null}
                        </div>

                        <div className="shrink-0 flex items-center h-10">
                          {cargoCount > 1 ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => removeCargoItem(index, cargoIndex)}
                              className="h-10 w-10 rounded-xl border-red-200 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          ) : (
                            <div className="w-10 h-10" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => appendCargoItem(index)}
                  className="h-9 rounded-xl border-slate-200 px-4 text-[14px] flex items-center gap-2 text-slate-600 hover:bg-slate-50"
                >
                  <Plus className="h-4 w-4" />
                  Tambah Muatan
                </Button>
              </div>
            </section>
          );
        })}

        {/* Button Tambah Rute Baru di Bawah Rute Terakhir */}
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            const currentVehicleType = watchedItems?.[0]?.vehicleType ?? 'fuso';
            append({
              localId: createItemId(),
              tarifId: '',
              vehicleType: currentVehicleType,
              loadingIn: '',
              loadingOut: '',
              deliveryDestination: '',
              cargoItems: [createCargoItem()],
              driverFee: 0,
              expeditionInvoice: 0,
            });
          }}
          className="w-full h-11 rounded-2xl border-dashed border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-50 flex items-center justify-center gap-2 font-medium"
        >
          <Plus className="h-4 w-4" />
          Tambah Rute Pengiriman
        </Button>




        {/* Card 4 — UJ Driver, Invoice, PPN */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-none space-y-4">
          <div className="space-y-2">
            <Label className="text-[14px] font-semibold text-slate-900">UJ Driver</Label>
            <Controller
              control={control}
              name="ujDriver"
              render={({ field }) => (
                <MoneyInput
                  value={field.value}
                  onChangeValue={field.onChange}
                  disabled
                  placeholder="Terisi otomatis by tipe armada"
                  className="h-10 rounded-xl border-[#E5E7EB] bg-slate-50 text-[15px] shadow-none cursor-default"
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-[14px] font-semibold text-slate-900">Invoice Ekspedisi</Label>
              <Controller
                control={control}
                name="invoiceBill"
                render={({ field }) => (
                  <MoneyInput
                    value={field.value}
                    onChangeValue={field.onChange}
                    placeholder="Masukkan nominal invoice"
                    className={`h-10 rounded-xl border-[#E5E7EB] bg-white text-[15px] shadow-none ${errors.invoiceBill ? 'border-red-500' : ''}`}
                  />
                )}
              />
              {errors.invoiceBill ? (
                <p className="text-xs text-red-500 mt-1">{errors.invoiceBill.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label className="text-[14px] font-semibold text-slate-900">PPN</Label>
              <Controller
                control={control}
                name="ppn"
                render={({ field }) => (
                  <MoneyInput
                    value={field.value}
                    onChangeValue={field.onChange}
                    placeholder="Masukkan nominal PPN"
                    className="h-10 rounded-xl border-[#E5E7EB] bg-white text-[15px] shadow-none"
                  />
                )}
              />
            </div>
          </div>

          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-500">
            Ringkasan biaya: UJ Driver {formatOrderCurrency(watchedUjDriver)} • Invoice {formatOrderCurrency(invoiceBill)} • PPN {formatOrderCurrency(watchedPpn)}
          </div>
        </section>
      </div>

      <div className="flex items-center justify-center gap-6 pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-xl px-6 text-slate-700 font-semibold hover:bg-slate-100 transition text-[15px]"
        >
          Batal
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-[#1e3a5f] px-6 h-10 hover:bg-[#152e4d] text-white font-semibold flex items-center gap-2 text-[15px] shadow-none"
        >
          <Save className="h-4 w-4" />
          {isSubmitting ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </div>
    </form>
  );
}
