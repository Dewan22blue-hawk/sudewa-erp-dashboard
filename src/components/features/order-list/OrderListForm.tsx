import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { ChevronLeft, Plus, Save, Trash2 } from 'lucide-react';
import type { OrderList, OrderListVehicleType } from '@/@types/order-list.types';
import type { Tarif } from '@/@types/tarif.types';
import { SearchableSelect, type SearchableSelectOption } from '@/components/features/vehicle-data/SearchableSelect';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MoneyInput } from '@/components/ui/money-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { orderListFormSchema, type OrderListFormSchema } from '@/schemas/order-list.schema';
import {
  ORDER_LIST_EDIT_STATUS_OPTIONS,
  ORDER_LIST_STATUS_OPTIONS,
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
  mode,
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
  const totalTarifGroups = watchedItems?.length ?? 0;
  const totalCargoItems = (watchedItems ?? []).reduce((sum, item) => sum + (item?.cargoItems?.length ?? 0), 0);
  const totalCargoQty = (watchedItems ?? []).reduce(
    (sum, item) => sum + (item?.cargoItems ?? []).reduce((cargoSum, cargoItem) => cargoSum + Number(cargoItem?.qty ?? 0), 0),
    0,
  );

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
      setValue(`items.${index}.vehicleType`, vehicleType, { shouldValidate: true, shouldDirty: true });
      const tarifId = watchedItems?.[index]?.tarifId ?? '';
      const matchedTarif = getTarifById(tarifId);
      const fee = getVehicleFee(matchedTarif, vehicleType);
      setValue(`items.${index}.driverFee`, fee.driverFee, { shouldDirty: true });
      setValue(`items.${index}.expeditionInvoice`, fee.invoice, { shouldDirty: true });
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onCancel} className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-[20px] font-semibold text-slate-950 md:text-[24px]">
            {mode === 'create' ? 'Form Input Order' : 'Edit Data Order'}
          </h1>
        </div>
      </div>

      <div>
        <h2 className="text-[18px] font-semibold text-slate-950">{mode === 'create' ? 'Form Detail Order' : 'Edit Detail Order'}</h2>
        <div className="mt-4 h-px bg-slate-200" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-[20px] border border-slate-200 p-5 shadow-sm">
          <p className="text-sm text-slate-500">Grup Tarif</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{totalTarifGroups}</p>
        </Card>
        <Card className="rounded-[20px] border border-slate-200 p-5 shadow-sm">
          <p className="text-sm text-slate-500">Item Muatan</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{totalCargoItems}</p>
        </Card>
        <Card className="rounded-[20px] border border-slate-200 p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Qty</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{totalCargoQty}</p>
        </Card>
      </div>

      <div className="space-y-5">
        <section className="rounded-[20px] border border-[#E5E7EB] bg-white px-5 py-6 shadow-sm">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            <div className="space-y-2 lg:col-span-8">
              <Label>Nama Customer</Label>
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
                    className={`h-12 rounded-xl border-[#E5E7EB] ${errors.customerId ? 'border-red-500' : ''}`}
                  />
                )}
              />
              {selectedCustomer?.subtitle ? <p className="text-xs text-slate-500">Kode customer: {selectedCustomer.subtitle}</p> : null}
              {errors.customerId ? <p className="text-xs text-red-500">{errors.customerId.message}</p> : null}
            </div>

            <div className="space-y-2 lg:col-span-4">
              <Label>Status</Label>
              <Controller
                control={control}
                name="status"
                rules={{ required: 'Status wajib dipilih' }}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={`h-12 rounded-xl border-[#E5E7EB] ${errors.status ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      {(mode === 'edit' ? ORDER_LIST_EDIT_STATUS_OPTIONS : ORDER_LIST_STATUS_OPTIONS).map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status ? <p className="text-xs text-red-500">{errors.status.message}</p> : null}
            </div>
          </div>
        </section>

        {fields.map((field, index) => {
          const item = watchedItems?.[index];
          const tarif = getTarifById(item?.tarifId ?? '');

          return (
            <section key={field.id} className="rounded-[20px] border border-[#E5E7EB] bg-white px-5 py-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">Rute & Armada {fields.length > 1 ? `#${index + 1}` : ''}</h3>
                <div className="flex items-center gap-2">
                  {index === fields.length - 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        append({
                          localId: createItemId(),
                          tarifId: '',
                          vehicleType: 'fuso',
                          loadingIn: '',
                          loadingOut: '',
                          deliveryDestination: '',
                          cargoItems: [createCargoItem()],
                          driverFee: 0,
                          expeditionInvoice: 0,
                        })
                      }
                      className="h-10 w-10 rounded-xl border-slate-200"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  ) : null}
                  {fields.length > 1 ? (
                    <Button type="button" variant="outline" size="icon" onClick={() => remove(index)} className="h-10 w-10 rounded-xl border-slate-200">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                <div className="space-y-2 lg:col-span-12">
                  <Label>Tarif</Label>
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
                        className={`h-12 rounded-xl border-[#E5E7EB] ${errors.items?.[index]?.tarifId ? 'border-red-500' : ''}`}
                      />
                    )}
                  />
                  {errors.items?.[index]?.tarifId ? <p className="text-xs text-red-500">{errors.items[index]?.tarifId?.message}</p> : null}
                </div>

                <div className="space-y-2 lg:col-span-12">
                  <Label>Loading In</Label>
                  <Input
                    readOnly
                    value={item?.loadingIn ?? ''}
                    placeholder="Contoh: Surabaya"
                    className="h-12 rounded-xl border-[#E5E7EB] bg-slate-50"
                  />
                </div>

                <div className="space-y-2 lg:col-span-4">
                  <Label>Loading Out</Label>
                  <Input
                    readOnly
                    value={item?.loadingOut ?? ''}
                    placeholder="Contoh: Yogyakarta"
                    className="h-12 rounded-xl border-[#E5E7EB] bg-slate-50"
                  />
                </div>

                <div className="space-y-2 lg:col-span-4">
                  <Label>Tujuan Kirim</Label>
                  <Input
                    placeholder="Contoh: Nama PT"
                    className={`h-12 rounded-xl border-[#E5E7EB] ${errors.items?.[index]?.deliveryDestination ? 'border-red-500' : ''}`}
                    {...register(`items.${index}.deliveryDestination`, { required: 'Tujuan kirim wajib diisi' })}
                  />
                  {errors.items?.[index]?.deliveryDestination ? (
                    <p className="text-xs text-red-500">{errors.items[index]?.deliveryDestination?.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2 lg:col-span-4">
                  <Label>Tipe Armada</Label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Controller
                        control={control}
                        name={`items.${index}.vehicleType`}
                        rules={{ required: 'Tipe armada wajib dipilih' }}
                        render={({ field: controllerField }) => (
                          <Select value={controllerField.value} onValueChange={(value: OrderListVehicleType) => handleVehicleTypeChange(index, value)}>
                            <SelectTrigger className="h-12 rounded-xl border-[#E5E7EB]">
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
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => appendCargoItem(index)}
                      className="h-12 w-12 rounded-xl border-slate-200"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {tarif ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 lg:col-span-12">
                    Tarif terpilih: {tarif.loadingIn || '-'} ke {tarif.loadingOut || '-'}
                  </div>
                ) : null}

                <div className="space-y-3 lg:col-span-12">
                  <div className="text-sm font-semibold text-slate-900">Muatan</div>
                  {(item?.cargoItems ?? []).map((cargoItem, cargoIndex) => (
                    <div key={cargoItem.localId || `${field.id}-cargo-${cargoIndex}`} className="grid grid-cols-1 gap-3 rounded-xl border border-slate-100 p-3 lg:grid-cols-12">
                      <div className="space-y-2 lg:col-span-6">
                        <Label>{cargoIndex === 0 ? 'Muatan' : `Muatan #${cargoIndex + 1}`}</Label>
                        <Input
                          placeholder="Contoh: Motor vario"
                          className={`h-12 rounded-xl border-[#E5E7EB] ${errors.items?.[index]?.cargoItems?.[cargoIndex]?.loadContent ? 'border-red-500' : ''}`}
                          {...register(`items.${index}.cargoItems.${cargoIndex}.loadContent`, { required: 'Muatan wajib diisi' })}
                        />
                        {errors.items?.[index]?.cargoItems?.[cargoIndex]?.loadContent ? (
                          <p className="text-xs text-red-500">{errors.items[index]?.cargoItems?.[cargoIndex]?.loadContent?.message}</p>
                        ) : null}
                      </div>

                      <div className="space-y-2 lg:col-span-5">
                        <Label>{cargoIndex === 0 ? 'QTY' : `QTY #${cargoIndex + 1}`}</Label>
                        <Input
                          type="number"
                          min={0}
                          placeholder="0"
                          className={`h-12 rounded-xl border-[#E5E7EB] ${errors.items?.[index]?.cargoItems?.[cargoIndex]?.qty ? 'border-red-500' : ''}`}
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

                      <div className="flex items-end lg:col-span-1">
                        {(item?.cargoItems?.length ?? 0) > 1 ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeCargoItem(index, cargoIndex)}
                            className="h-12 w-12 rounded-xl border-slate-200"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        ) : (
                          <div className="h-12 w-12" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        })}

        <section className="rounded-[20px] border border-[#E5E7EB] bg-white px-5 py-6 shadow-sm">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            <div className="space-y-2 lg:col-span-12">
              <Label>UJ Driver</Label>
              <Controller
                control={control}
                name="ujDriver"
                render={({ field }) => (
                  <MoneyInput
                    value={field.value}
                    onChangeValue={field.onChange}
                    disabled
                    placeholder="Terisi otomatis by tipe armada"
                    className="h-12 rounded-xl border-[#E5E7EB] bg-slate-50"
                  />
                )}
              />
            </div>

            <div className="space-y-2 lg:col-span-6">
              <Label>Invoice Ekspedisi</Label>
              <Controller
                control={control}
                name="invoiceBill"
                render={({ field }) => (
                  <MoneyInput
                    value={field.value}
                    onChangeValue={field.onChange}
                    disabled
                    placeholder="Terisi otomatis dari total tarif"
                    className={`h-12 rounded-xl border-[#E5E7EB] bg-slate-50 ${errors.invoiceBill ? 'border-red-500' : ''}`}
                  />
                )}
              />
              {errors.invoiceBill ? <p className="text-xs text-red-500">{errors.invoiceBill.message}</p> : null}
            </div>

            <div className="space-y-2 lg:col-span-6">
              <Label>PPN</Label>
              <Controller
                control={control}
                name="ppn"
                render={({ field }) => (
                  <MoneyInput
                    value={field.value}
                    onChangeValue={field.onChange}
                    placeholder="Masukkan nominal PPN"
                    className="h-12 rounded-xl border-[#E5E7EB]"
                  />
                )}
              />
            </div>

            <div className="space-y-2 lg:col-span-12">
              <Label>Catatan</Label>
              <Textarea
                rows={4}
                placeholder="Tambahkan catatan order bila diperlukan"
                className="rounded-2xl border-[#E5E7EB]"
                {...register('note')}
              />
            </div>

            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 lg:col-span-12">
              Ringkasan biaya: UJ Driver {formatOrderCurrency(watchedUjDriver)} • Invoice {formatOrderCurrency(invoiceBill)} • PPN {formatOrderCurrency(watchedPpn)}
            </div>
          </div>
        </section>
      </div>

      <div className="flex items-center justify-center gap-4 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting} className="rounded-xl px-6 text-slate-700">
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting} className="rounded-xl bg-[#1f4163] px-6 hover:bg-[#183552]">
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </div>
    </form>
  );
}
