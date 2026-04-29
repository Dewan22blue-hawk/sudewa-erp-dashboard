'use client';

import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/common/PageHeader';
import PurchaseUnitForm from '@/components/features/purchase/PurchaseUnitForm';
import { useCreatePurchase } from '@/hooks/usePurchase';
import { ChevronRight, Check, ChevronsUpDown } from 'lucide-react';
import { useCompany } from '@/contexts/CompanyContext';
import { useSuppliers } from '@/hooks/useSupplier';
import { useEffect, useMemo, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CreatePurchaseUnitFormValues } from '@/scheme/purchase.schema';
import { CreatePurchaseRequest } from '@/@types/purchase.types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api/client';
import { purchaseService } from '@/services/purchase.service';

type WarehouseDataResponse = {
  success?: boolean;
  data?: {
    capacity?: number | string;
    unit_transactions?: {
      data?: Array<{
        max_capacity?: number | string;
      }>;
      total?: number;
    };
  };
};

const getWarehouseRemainingCapacity = async (warehouseId: number): Promise<{ remaining: number; used: number; capacity: number }> => {
  const response = await apiClient.get<WarehouseDataResponse>(`/wapi/warehouse/warehouse-data/${warehouseId}`, {
    params: {
      per_page: 500,
    },
  });

  const payload = response.data;
  const capacity = Number(payload?.data?.capacity ?? 0);
  const rows = payload?.data?.unit_transactions?.data ?? [];

  const used = rows.reduce((acc, row) => acc + Number(row?.max_capacity ?? 0), 0);
  const remaining = Math.max(0, capacity - used);

  return { remaining, used, capacity };
};

const DEFAULT_WAREHOUSE_ID = 1;

export default function CreatePurchasePage() {
  const router = useRouter();
  const { slug } = router.query;
  const { companyId } = useCompany();
  const mutation = useCreatePurchase();
  const { data: supplierData } = useSuppliers(companyId || null);
  const [personId, setPersonId] = useState('');
  const [supplierOpen, setSupplierOpen] = useState(false);

  const personOptions = useMemo(() => supplierData?.data ?? [], [supplierData]);

  const selectedPerson = useMemo(() => {
    return personOptions.find((person) => String(person.id) === personId);
  }, [personOptions, personId]);

  useEffect(() => {
    setPersonId('');
  }, []);

  const generatedCode = useMemo(() => {
    const now = new Date();
    const ymd = now.toISOString().split('T')[0].replace(/-/g, '');
    const ms = String(now.getMilliseconds()).padStart(3, '0');
    const seq = String(now.getSeconds()).padStart(2, '0');
    const slugCode = String(slug || 'UNK')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');
    const companyCode = slugCode ? slugCode.slice(0, 3) : 'UNK';
    return `PBL-${companyCode}/${ymd}-${seq}${ms}`;
  }, [slug]);

  const handleSubmit = async (data: CreatePurchaseUnitFormValues) => {
    try {
      const personNumeric = Number(personId);
      const warehouseNumeric = DEFAULT_WAREHOUSE_ID;
      const companyNumeric = Number(companyId);
      const qtyNumber = Number(data.qty ?? 0);
      const unitTypeIdNumber = Number(data.typeUnitId ?? 0);
      const priceNumber = Number(data.price ?? 0);
      const bbnNumber = Number(data.biayaBBN ?? 0);
      const expeditionNumber = Number(data.biayaEkspedisi ?? 0);
      const otherFeeNumber = Number(data.biayaLain ?? 0);

      if (!personNumeric || personNumeric <= 0) {
        toast.error('Supplier wajib dipilih (person_id tidak boleh kosong)');
        return;
      }

      if (!warehouseNumeric || warehouseNumeric <= 0) {
        toast.error('Warehouse ID wajib diisi (gunakan ID yang valid, contoh: 1)');
        return;
      }

      if (!companyNumeric || companyNumeric <= 0) {
        toast.error('Company ID tidak valid. Silakan pilih company terlebih dahulu.');
        return;
      }

      if (!qtyNumber || qtyNumber <= 0) {
        toast.error('Qty wajib diisi dan minimal 1');
        return;
      }

      if (!unitTypeIdNumber || unitTypeIdNumber <= 0) {
        toast.error('Tipe unit wajib dipilih sebelum menyimpan pembelian.');
        return;
      }

      // Non-blocking precheck: backend remains the source of truth for capacity validation.
      await getWarehouseRemainingCapacity(warehouseNumeric);

      const payload: CreatePurchaseRequest = {
        warehouse_id: warehouseNumeric,
        person_id: personNumeric,
        company_id: companyNumeric,
        code: generatedCode,
        type: 'purchase',
        max_capacity: String(qtyNumber),
        stock_state: 'draft',
        unit_type_id: unitTypeIdNumber,
        qty_total: qtyNumber,
        price: priceNumber,
        bbn_price: bbnNumber,
        expedition_fee: expeditionNumber,
        other_fee: otherFeeNumber,
      };

      if (process.env.NODE_ENV !== 'production') {
        // Log untuk debug jika validasi backend gagal
        console.debug('create purchase payload', payload);
      }

      await mutation.mutateAsync(payload);

      toast.success('Pembelian berhasil dibuat');
      router.push(`/dashboard/${slug}/transaksi/pembelian-unit`);
    } catch (err: any) {
      const statusCode = err?.statusCode ?? err?.response?.status;
      const apiMessage = err?.message;
      const apiErrors = err?.details || err?.response?.data?.errors;

      // Some backend deployments persist the transaction but return 405.
      if (statusCode === 405 || String(apiMessage ?? '').toLowerCase().includes('method not allowed')) {
        try {
          const probe = await purchaseService.getPurchases(String(companyId), {
            page: 1,
            perPage: 20,
            search: generatedCode,
            withTotals: false,
          });
          const alreadyCreated = probe.data.find((item) => item.code === generatedCode);
          if (alreadyCreated) {
            toast.success('Pembelian berhasil dibuat');
            router.push(`/dashboard/${slug}/transaksi/pembelian-unit`);
            return;
          }
        } catch {
          // Continue to normal error toast below.
        }
      }

      let detail = '';
      if (apiErrors && typeof apiErrors === 'object') {
        if (Array.isArray((apiErrors as any).max_capacity)) {
          toast.error('Kapasitas gudang tidak cukup. Gunakan Warehouse ID lain atau sesuaikan max capacity.');
          return;
        }
        const entries = Object.entries(apiErrors)
          .map(([k, v]) => {
            const msg = Array.isArray(v) ? v[0] : String(v);
            return `${k}: ${msg}`;
          })
          .join(', ');
        detail = entries;
      }
      const detailJson = err?.response?.data ? JSON.stringify(err.response.data) : '';
      toast.error(detail || apiMessage || 'Gagal membuat pembelian');
      if (process.env.NODE_ENV !== 'production') {
        console.error('create purchase error', err?.response?.data || err);
        if (detailJson) console.error('create purchase error detail', detailJson);
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* BREADCRUMB HEADER */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="hover:text-foreground cursor-pointer" onClick={() => router.push(`/dashboard/${slug}/transaksi/pembelian-unit`)}>
            Pembelian Unit
          </span>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-foreground">Tambah Pembelian</span>
        </div>

        <div className="flex flex-col gap-1">
          <PageHeader title="Tambah Pembelian Unit" description="" />
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Kode Beli</span>
            <span className="text-blue-600 font-medium">{generatedCode}</span>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 md:p-8">
          <PurchaseUnitForm
            onSubmit={handleSubmit}
            loading={mutation.isPending}
            onCancel={() => router.push(`/dashboard/${slug}/transaksi/pembelian-unit`)}
            companyId={companyId}
            prependFields={
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Supplier</Label>
                  <Popover open={supplierOpen} onOpenChange={setSupplierOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        role="combobox"
                        aria-expanded={supplierOpen}
                        aria-controls="supplier-combobox-list"
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      >
                        <span className={cn('truncate', !selectedPerson && 'text-muted-foreground')}>{selectedPerson ? selectedPerson.name : 'Pilih supplier'}</span>
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

                <div className="space-y-2">
                  <Label>Alamat</Label>
                  <Input value={selectedPerson?.address ?? ''} readOnly className="bg-transparent" placeholder="Alamat supplier" />
                </div>

                <div className="space-y-2">
                  <Label>NPWP</Label>
                  <Input value={selectedPerson?.npwp ?? ''} readOnly className="bg-transparent" placeholder="NPWP supplier" />
                </div>
              </div>
            }
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
