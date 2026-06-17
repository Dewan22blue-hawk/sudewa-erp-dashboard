'use client';

import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { usePurchaseById, useUpdatePurchase } from '@/hooks/usePurchase';
import { useEffect, useMemo, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { useCompany } from '@/contexts/CompanyContext';
import { useSuppliers } from '@/hooks/useSupplier';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ChevronLeft, Check, ChevronsUpDown, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function EditPurchasePage() {
  const router = useRouter();
  const { slug, itemId } = router.query;
  const { companyId } = useCompany();

  const { data: purchase, isLoading: isPurchaseLoading } = usePurchaseById(itemId as string);
  const updateMutation = useUpdatePurchase();
  const { data: supplierData } = useSuppliers(companyId || null);

  const [personId, setPersonId] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [supplierOpen, setSupplierOpen] = useState(false);

  const personOptions = useMemo(() => supplierData?.data ?? [], [supplierData]);

  const selectedPerson = useMemo(() => {
    return personOptions.find((person) => String(person.id) === personId);
  }, [personOptions, personId]);

  // Sync initial values when purchase data loads
  useEffect(() => {
    if (purchase) {
      setPersonId(purchase.companyId || '');
      if (purchase.transaction_date) {
        setPurchaseDate(purchase.transaction_date.split('T')[0]);
      } else if (purchase.date) {
        setPurchaseDate(purchase.date.split('T')[0]);
      }
    }
  }, [purchase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!personId) {
      toast.error('Supplier wajib dipilih');
      return;
    }

    if (!purchaseDate) {
      toast.error('Tanggal wajib diisi');
      return;
    }

    if (!companyId) {
      toast.error('Company ID tidak valid. Silakan pilih company terlebih dahulu.');
      return;
    }

    try {
      const payload = {
        company_id: Number(companyId),
        person_id: Number(personId),
        code: purchase?.code || '',
        type: 'purchase' as const,
        max_capacity: String(purchase?.maxCapacity ?? 1.0),
        stock_state: purchase?.stockState || 'draft',
        transaction_date: purchaseDate,
      };

      await updateMutation.mutateAsync({
        id: itemId as string,
        payload,
      });

      toast.success('Pembelian berhasil diperbarui');
      router.push(`/dashboard/${slug}/transaksi/pembelian-unit`);
    } catch (err: any) {
      const apiMessage = err?.message || 'Gagal memperbarui pembelian';
      const apiErrors = err?.details || err?.response?.data?.errors;
      let detail = '';

      if (apiErrors && typeof apiErrors === 'object') {
        detail = Object.entries(apiErrors)
          .map(([k, v]) => {
            const msg = Array.isArray(v) ? v[0] : String(v);
            return `${k}: ${msg}`;
          })
          .join(', ');
      }

      toast.error(detail || apiMessage);
    }
  };

  if (isPurchaseLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!purchase) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">Data tidak ditemukan</p>
          <button onClick={() => router.back()} className="text-blue-600 hover:underline">
            Kembali
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push(`/dashboard/${slug}/transaksi/pembelian-unit`)}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-6 w-6 text-slate-800" />
          </button>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Edit Pembelian</h1>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Kode Beli</span>
              <span className="text-blue-600 font-medium">{purchase.code}</span>
            </div>
          </div>
        </div>

        {/* FORM CONTAINER */}
        <div className="rounded-xl border bg-white p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* TANGGAL */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Tanggal</Label>
                <DatePicker
                  value={purchaseDate}
                  onChange={(date) => {
                    if (date) {
                      const offset = date.getTimezoneOffset();
                      const adjusted = new Date(date.getTime() - offset * 60 * 1000);
                      setPurchaseDate(adjusted.toISOString().split('T')[0]);
                    }
                  }}
                  placeholder="Pick a date"
                  className="h-10 border-slate-200 bg-white"
                />
              </div>

              {/* SUPPLIER */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Supplier</Label>
                <Popover open={supplierOpen} onOpenChange={setSupplierOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      role="combobox"
                      aria-expanded={supplierOpen}
                      aria-controls="supplier-combobox-list"
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    >
                      <span className={cn('truncate', !selectedPerson && 'text-muted-foreground')}>
                        {selectedPerson ? selectedPerson.name : 'Pilih supplier'}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="Cari supplier..." />
                      <CommandList id="supplier-combobox-list">
                        <CommandEmpty>Supplier tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                          {personOptions.map((person) => (
                            <CommandItem
                              key={String(person.id)}
                              value={`${person.name} ${person.code ?? ''} ${person.id}`}
                              onSelect={() => {
                                setPersonId(String(person.id));
                                setSupplierOpen(false);
                              }}
                            >
                              <Check className={cn('mr-2 h-4 w-4', personId === String(person.id) ? 'opacity-100' : 'opacity-0')} />
                              {person.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* ALAMAT */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Alamat</Label>
                <Input
                  value={selectedPerson?.address ?? ''}
                  readOnly
                  className="bg-transparent border-slate-200"
                  placeholder="Alamat supplier"
                />
              </div>

              {/* NPWP */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">NPWP</Label>
                <Input
                  value={selectedPerson?.npwp ?? ''}
                  readOnly
                  className="bg-transparent border-slate-200"
                  placeholder="NPWP supplier"
                />
              </div>
            </div>

            {/* BUTTONS */}
            <div className="flex justify-center gap-3 pt-4 border-t border-slate-50">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push(`/dashboard/${slug}/transaksi/pembelian-unit`)}
                className="text-slate-500 hover:text-slate-900 font-medium"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-[#1A365D] hover:bg-[#122744] text-white px-5"
              >
                <Save className="h-4 w-4 mr-2" />
                Simpan
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
