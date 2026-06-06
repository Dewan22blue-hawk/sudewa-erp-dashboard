import { useEffect, useMemo } from 'react';
import { z } from 'zod';
import { Controller, type FieldErrors, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarDays, Loader2, PackageSearch } from 'lucide-react';
import type { UnitTransactionRefund } from '@/@types/refund.type';
import { useCreateRefund, useRefundDetail, useRefundSelectableItems, useUpdateRefund } from '@/hooks/useRefundAdministrasi';
import { createRefundSchema, type CreateRefundFormValues } from '@/schemas/refund.schema';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ApiValidationError } from '@/lib/api/response';
import { toast } from 'sonner';
import { refundInputClassName, refundLabelClassName, refundPrimaryButtonClassName, refundSecondaryButtonClassName } from './purchase-refund.styles';
import { formatCurrency } from '@/lib/utils/currency';

interface PurchaseRefundFormModalProps {
  open: boolean;
  onClose: () => void;
  transactionId: string;
  refund?: UnitTransactionRefund | null;
  entityLabel?: 'pembelian' | 'penjualan';
  mode?: 'create' | 'edit' | 'detail';
}

const displayDate = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().split('T')[0] || '';
};

const getDisplayStatus = (refund?: UnitTransactionRefund | null) => {
  if (!refund) return 'belum-dibayar';
  const totalPaid = (refund.payments ?? []).reduce((total, item) => total + Number(item.amount), 0);
  if (totalPaid <= 0) return 'belum-dibayar';
  if (totalPaid >= Number(refund.refund_amount || 0)) return 'lunas';
  return 'proses';
};

const formatDate = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('id-ID');
};

const parseCurrencyInput = (value: string) => {
  const numericValue = value.replace(/[^\d]/g, '');
  return numericValue ? Number(numericValue) : 0;
};

const getRefundErrorMessage = (error: unknown, titleLabel: string) => {
  const rawMessage = error instanceof Error ? error.message : '';

  if (rawMessage === 'Failed to update unit transaction refund') {
    return 'Gagal memperbarui data refund. Backend mengembalikan error saat memproses status item unit.';
  }

  if (rawMessage === 'Failed to create unit transaction refund') {
    return 'Gagal membuat data refund.';
  }

  return rawMessage || `Gagal menyimpan data refund ${titleLabel}`;
};

const getFirstFormErrorMessage = (errors: FieldErrors<CreateRefundFormValues & { status?: string }>) => {
  const messages = [
    errors.refund_amount?.message,
    errors.refund_date?.message,
    errors.unit_transaction_item_detail_ids?.message,
    errors.note?.message,
  ];

  return messages.find((message): message is string => typeof message === 'string' && message.length > 0) ?? 'Lengkapi data refund terlebih dahulu.';
};

export default function PurchaseRefundFormModal({
  open,
  onClose,
  transactionId,
  refund,
  entityLabel = 'pembelian',
  mode,
}: PurchaseRefundFormModalProps) {
  const resolvedMode = mode ?? (refund ? 'edit' : 'create');
  const isDetail = resolvedMode === 'detail';
  const isEdit = resolvedMode === 'edit';
  const isCreate = resolvedMode === 'create';
  const titleLabel = entityLabel === 'penjualan' ? 'penjualan' : 'pembelian';
  const createMutation = useCreateRefund();
  const updateMutation = useUpdateRefund();
  const refundDetailQuery = useRefundDetail(!isCreate && refund?.id ? refund.id : undefined);
  const effectiveRefund = refundDetailQuery.data ?? refund ?? null;
  const selectableItemsQuery = useRefundSelectableItems(transactionId);
  const selectableItems = selectableItemsQuery.items;
  const displayedItems = useMemo(() => (isDetail ? effectiveRefund?.items ?? [] : selectableItems), [effectiveRefund?.items, isDetail, selectableItems]);
  const lessPayment = effectiveRefund
    ? Math.max(0, Number(effectiveRefund.remaining_payment ?? Number(effectiveRefund.refund_amount || 0) - (effectiveRefund.payments ?? []).reduce((total, item) => total + Number(item.amount), 0)))
    : 0;
  const qty = effectiveRefund?.total_qty ?? effectiveRefund?.items?.length ?? 0;
  const selectedIdsFromRefund = useMemo(
    () =>
      effectiveRefund?.items
        ?.map((item) => Number(item.pivot?.unit_transaction_item_detail_id ?? item.id))
        .filter((value) => Number.isFinite(value)) ?? [],
    [effectiveRefund?.items],
  );

  const form = useForm<CreateRefundFormValues & { status?: string }>({
    resolver: zodResolver(createRefundSchema.extend({ status: z.string().optional() })),
    defaultValues: {
      unit_transaction_id: transactionId,
      refund_date: displayDate(effectiveRefund?.refund_date) || new Date().toISOString().split('T')[0],
      refund_amount: effectiveRefund?.refund_amount !== undefined && effectiveRefund?.refund_amount !== null ? Number(effectiveRefund.refund_amount) : undefined,
      note: effectiveRefund?.note || '',
      unit_transaction_item_detail_ids: selectedIdsFromRefund,
      status: getDisplayStatus(effectiveRefund),
    },
  });

  const selectedIds = form.watch('unit_transaction_item_detail_ids');
  const selectedItems = useMemo(
    () => displayedItems.filter((item) => selectedIds.includes(Number(item.id))),
    [displayedItems, selectedIds],
  );
  const selectedTotal = useMemo(
    () => selectedItems.reduce((total, item) => total + Number(item.price ?? 0), 0),
    [selectedItems],
  );
  const allSelected = displayedItems.length > 0 && selectedIds.length === displayedItems.length;

  useEffect(() => {
    if (!open) return;

    form.reset({
      unit_transaction_id: transactionId,
      refund_date: displayDate(effectiveRefund?.refund_date) || new Date().toISOString().split('T')[0],
      refund_amount: effectiveRefund?.refund_amount !== undefined && effectiveRefund?.refund_amount !== null ? Number(effectiveRefund.refund_amount) : undefined,
      note: effectiveRefund?.note || '',
      unit_transaction_item_detail_ids: selectedIdsFromRefund,
      status: getDisplayStatus(effectiveRefund),
    });
  }, [effectiveRefund, form, open, selectedIdsFromRefund, transactionId]);

  const isPending = createMutation.isPending || updateMutation.isPending;
  const isLoadingItems =
    selectableItemsQuery.transactionQuery.isLoading ||
    selectableItemsQuery.itemDetailsQuery.isLoading ||
    (!isCreate && refundDetailQuery.isLoading);

  const toggleItem = (itemId: number, checked: boolean) => {
    const next = checked ? [...selectedIds, itemId] : selectedIds.filter((id) => id !== itemId);
    form.setValue('unit_transaction_item_detail_ids', next, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const toggleAllItems = (checked: boolean) => {
    form.setValue(
      'unit_transaction_item_detail_ids',
      checked ? displayedItems.map((item) => Number(item.id)) : [],
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
  };

  const onSubmit = form.handleSubmit(
    async (values) => {
      try {
        if (isEdit && effectiveRefund) {
          await updateMutation.mutateAsync({
            id: effectiveRefund.id,
            payload: {
              unit_transaction_id: values.unit_transaction_id,
              refund_date: values.refund_date,
              refund_amount: values.refund_amount,
              note: values.note,
              unit_transaction_item_detail_ids: values.unit_transaction_item_detail_ids,
            },
          });
          toast.success(`Data refund ${titleLabel} berhasil diperbarui`);
        } else {
          await createMutation.mutateAsync(values);
          toast.success(`Data refund ${titleLabel} berhasil ditambahkan`);
        }
        onClose();
      } catch (error: any) {
        if (error instanceof ApiValidationError) {
          const itemDetailErrors = error.fieldErrors.unit_transaction_item_detail_ids ?? error.fieldErrors['unit_transaction_item_detail_ids.0'];
          if (itemDetailErrors?.[0]) {
            form.setError('unit_transaction_item_detail_ids', {
              type: 'server',
              message: itemDetailErrors[0],
            });
          }
        }
        toast.error(getRefundErrorMessage(error, titleLabel));
      }
    },
    (errors) => {
      toast.error(getFirstFormErrorMessage(errors));
    },
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className={
          'flex h-[calc(100vh-2rem)] max-h-[880px] w-[calc(100vw-2rem)] max-w-[920px] flex-col overflow-hidden rounded-[14px] border-none p-0 shadow-[0_20px_50px_rgba(15,23,42,0.25)] sm:h-[min(90vh,880px)] sm:w-[calc(100vw-4rem)] sm:max-w-[920px]'
        }
      >
        <DialogHeader className="shrink-0 px-6 pb-0 pt-7 text-left">
          <DialogTitle className="text-[18px] font-semibold text-[#111827]">
            {isDetail ? `Detail Refund ${titleLabel}` : isEdit ? `Ubah Data Refund ${titleLabel}` : `Tambah Data Refund ${titleLabel}`}
          </DialogTitle>
          <p className="mt-2 text-sm text-[#6B7280]">
            {isDetail ? 'Lihat detail refund yang sudah dibuat' : isEdit ? 'Ubah detail refund dengan cepat dan mudah' : 'Tambah detail refund dengan cepat dan mudah'}
          </p>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="min-w-0 flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-6 pb-5 pt-6">
            <div>
              <Label className={refundLabelClassName}>Tanggal Refund</Label>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6B7280]" />
                <Input type="date" className={`${refundInputClassName} pl-12`} readOnly={isDetail} {...form.register('refund_date')} />
              </div>
              {form.formState.errors.refund_date ? <p className="mt-2 text-sm text-red-600">{form.formState.errors.refund_date.message}</p> : null}
            </div>

            <div>
              <Label className={refundLabelClassName}>Nominal Refund</Label>
              <Controller
                control={form.control}
                name="refund_amount"
                render={({ field }) => (
                  <Input
                    type="text"
                    inputMode="numeric"
                    className={refundInputClassName}
                    placeholder="Rp 0"
                    readOnly={isDetail}
                    value={field.value === undefined || field.value === null || Number(field.value) === 0 ? '' : formatCurrency(Number(field.value))}
                    onChange={(event) => {
                      field.onChange(parseCurrencyInput(event.target.value));
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                )}
              />
              {form.formState.errors.refund_amount ? <p className="mt-2 text-sm text-red-600">{form.formState.errors.refund_amount.message}</p> : null}
              {!form.formState.errors.refund_amount ? (
                <p className="mt-2 text-xs text-[#6B7280]">
                  Nominal refund diisi manual. Nilai unit terpilih hanya sebagai referensi.
                </p>
              ) : null}
            </div>

            <div>
              <Label className={refundLabelClassName}>Catatan Refund</Label>
              <Input className={refundInputClassName} placeholder="Contoh: refund karena terdapat kecacatan" readOnly={isDetail} {...form.register('note')} />
            </div>

            <div className="min-w-0 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-[14px] font-semibold text-[#111827]">{isDetail ? 'Detail Unit yang Direfund' : 'Pilih Unit yang Direfund'}</h3>
                  <p className="mt-1 text-xs text-[#6B7280]">{isDetail ? 'Daftar item detail unit yang termasuk ke refund ini.' : 'Checklist manual item detail yang ingin direfund.'}</p>
                </div>
                <div className="shrink-0 text-sm font-medium text-emerald-700">{formatCurrency(selectedTotal)}</div>
              </div>

              <div className="max-w-full overflow-hidden rounded-[12px] border border-[#D9DEE8] bg-white">
                <div className="max-h-[260px] overflow-y-auto">
                  <div className="max-w-full overflow-x-auto">
                    <Table className="w-max min-w-full">
                      <TableHeader>
                        <TableRow className="bg-[#E9EEF5] hover:bg-[#E9EEF5]">
                          <TableHead className="w-14 px-4 text-center">
                            <Checkbox checked={allSelected} disabled={isDetail || displayedItems.length === 0} onCheckedChange={(checked) => toggleAllItems(Boolean(checked))} />
                          </TableHead>
                          <TableHead className="whitespace-nowrap px-4 text-[#111827]">Warna</TableHead>
                          <TableHead className="whitespace-nowrap px-4 text-[#111827]">No. Mesin</TableHead>
                          <TableHead className="whitespace-nowrap px-4 text-[#111827]">No. Rangka</TableHead>
                          <TableHead className="whitespace-nowrap px-4 text-[#111827]">Status Stok</TableHead>
                          <TableHead className="whitespace-nowrap px-4 text-[#111827]">Status Forecast</TableHead>
                          <TableHead className="whitespace-nowrap px-4 text-[#111827]">Status Unit</TableHead>
                          <TableHead className="whitespace-nowrap px-4 text-[#111827]">Tanggal Dibuat</TableHead>
                          <TableHead className="whitespace-nowrap px-4 text-right text-[#111827]">Nilai</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoadingItems ? (
                          <TableRow>
                            <TableCell colSpan={9} className="h-28 text-center text-[#6B7280]">
                              <div className="flex items-center justify-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Memuat unit transaksi...
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : displayedItems.length > 0 ? (
                          displayedItems.map((item) => (
                            <TableRow key={item.id} className="border-[#E5E7EB] hover:bg-white">
                              <TableCell className="px-4 py-3 text-center">
                                <Checkbox
                                  checked={selectedIds.includes(Number(item.id))}
                                  disabled={isDetail}
                                  onCheckedChange={(checked) => toggleItem(Number(item.id), Boolean(checked))}
                                />
                              </TableCell>
                              <TableCell className="whitespace-nowrap px-4 py-3 text-sm text-[#111827]">{item.color || '-'}</TableCell>
                              <TableCell className="whitespace-nowrap px-4 py-3 text-sm text-[#111827]">{item.machine_number || '-'}</TableCell>
                              <TableCell className="whitespace-nowrap px-4 py-3 text-sm text-[#111827]">{item.chassis_number || '-'}</TableCell>
                              <TableCell className="whitespace-nowrap px-4 py-3 text-sm text-[#111827]">{item.in_stock ? 'Tersedia' : 'Tidak tersedia'}</TableCell>
                              <TableCell className="whitespace-nowrap px-4 py-3 text-sm text-[#111827]">{item.is_forecast ? 'Forecast' : 'Normal'}</TableCell>
                              <TableCell className="whitespace-nowrap px-4 py-3 text-sm text-[#111827]">{item.status || '-'}</TableCell>
                              <TableCell className="whitespace-nowrap px-4 py-3 text-sm text-[#111827]">{formatDate(item.created_at)}</TableCell>
                              <TableCell className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-[#111827]">{formatCurrency(Number(item.price ?? 0))}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={9} className="h-28 text-center text-[#6B7280]">
                              <div className="flex flex-col items-center justify-center gap-2">
                                <PackageSearch className="h-5 w-5" />
                                Tidak ada unit transaksi yang tersedia untuk direfund.
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>

              {!isDetail && form.formState.errors.unit_transaction_item_detail_ids ? (
                <p className="text-sm text-red-600">{form.formState.errors.unit_transaction_item_detail_ids.message}</p>
              ) : null}
            </div>

            {isEdit ? (
              <>
                <div>
                  <Label className={refundLabelClassName}>Kurang Bayar</Label>
                  <Input readOnly className={refundInputClassName} value={formatCurrency(lessPayment)} />
                </div>

                <div>
                  <Label className={refundLabelClassName}>QTY</Label>
                  <Input readOnly className={refundInputClassName} value={String(qty)} />
                </div>

                <div>
                  <Label className={refundLabelClassName}>Status</Label>
                <Select value={form.watch('status') || 'belum-dibayar'} onValueChange={(value) => form.setValue('status', value)} disabled={isDetail}>
                  <SelectTrigger className={refundInputClassName}>
                    <SelectValue placeholder="Select an item" />
                  </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lunas">Lunas</SelectItem>
                      <SelectItem value="proses">Proses</SelectItem>
                      <SelectItem value="belum-dibayar">Belum dibayar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : null}
          </div>

          <div className="shrink-0 space-y-3 border-t border-slate-200 bg-white px-6 pb-7 pt-4">
            {isDetail ? (
              <Button type="button" variant="outline" className={`w-full ${refundSecondaryButtonClassName}`} onClick={onClose}>
                Tutup
              </Button>
            ) : (
              <>
                <Button type="submit" className={`w-full ${refundPrimaryButtonClassName}`} disabled={isPending}>
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Simpan
                </Button>
                <Button type="button" variant="outline" className={`w-full ${refundSecondaryButtonClassName}`} onClick={onClose} disabled={isPending}>
                  Batal
                </Button>
              </>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
