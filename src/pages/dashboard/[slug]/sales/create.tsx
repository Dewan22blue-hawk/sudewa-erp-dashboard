'use client';

import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EditUnitForm } from '@/components/features/sales/edit/EditUnitForm';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateSales } from '@/hooks/useSales';
import { useCompany } from '@/contexts/CompanyContext';
import { EditUnitFormData } from '@/components/features/sales/edit/edit-unit.schema';
import { useEffect, useMemo, useState } from 'react';
import { generateSalesCode } from '@/lib/utils/sales';
import { getCustomerById, getCustomers } from '@/services/customer.service';
import { mapCustomerDetailToSalesForm, mapCustomerToSalesOption, SalesCustomerOption } from '@/services/sales-customer.mapper';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCreateUnitItem } from '@/hooks/useUnitTransactionItem';
import { useCreateTypeUnit, useTypeUnits } from '@/hooks/useTypeUnit';
import { getTypeUnitById } from '@/services/type-unit.service';
import { useBrands } from '@/hooks/useBrand';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type SalesCreateFormState = {
  customerId: string;
  unitTypeId: string;
  code: string;
  tanggal: string;
  alamat: string;
  npwp: string;
  qty?: number;
  price: number;
};

const DEFAULT_WAREHOUSE_ID = 1;

export default function CreateSalesPage() {
  const router = useRouter();
  const { companyId } = useCompany();
  const createSalesMutation = useCreateSales();
  const createItemMutation = useCreateUnitItem();
  const createTypeUnitMutation = useCreateTypeUnit();
  const { data: unitTypeData, isLoading: isLoadingUnitTypes } = useTypeUnits();
  const { data: brandsData, isLoading: isLoadingBrands } = useBrands();
  const slugQuery = router.query.slug;
  const slug = Array.isArray(slugQuery) ? slugQuery[0] : slugQuery || '';
  const salesPath = slug ? `/dashboard/${slug}/sales` : '/sales';
  const generatedCode = useMemo(() => generateSalesCode(router.query.slug), [router.query.slug]);

  const [customerList, setCustomerList] = useState<SalesCustomerOption[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<SalesCustomerOption | null>(null);
  const [isCustomerOpen, setIsCustomerOpen] = useState(false);
  const [isLoadingCustomerList, setIsLoadingCustomerList] = useState(false);
  const [isLoadingCustomerDetail, setIsLoadingCustomerDetail] = useState(false);
  const [isOpenCreateTypeUnitModal, setIsOpenCreateTypeUnitModal] = useState(false);
  const [typeUnitImage, setTypeUnitImage] = useState<File | null>(null);

  const [form, setForm] = useState<SalesCreateFormState>({
    customerId: '',
    unitTypeId: '',
    code: generatedCode,
    tanggal: new Date().toISOString().split('T')[0],
    alamat: '',
    npwp: '',
    qty: undefined,
    price: 0,
  });

  useEffect(() => {
    setForm((prev) => ({ ...prev, code: generatedCode }));
  }, [generatedCode]);

  const unitTypeOptions = useMemo(() => {
    return (unitTypeData?.data ?? []).map((item) => ({
      value: String(item.id),
      label: item.name,
    }));
  }, [unitTypeData?.data]);

  const brandOptions = useMemo(() => {
    const maybeList = (brandsData as any)?.data;
    return Array.isArray(maybeList) ? maybeList : [];
  }, [brandsData]);

  useEffect(() => {
    let isMounted = true;

    const loadCustomers = async () => {
      if (!companyId) return;
      try {
        setIsLoadingCustomerList(true);
        const response = await getCustomers({ company_id: companyId, perPage: 100, page: 1 });
        if (!isMounted) return;
        setCustomerList((response.data ?? []).map(mapCustomerToSalesOption));
      } catch {
        toast.error('Gagal memuat data customer');
      } finally {
        if (isMounted) setIsLoadingCustomerList(false);
      }
    };

    loadCustomers();

    return () => {
      isMounted = false;
    };
  }, [companyId]);

  const handleSelectCustomer = async (option: SalesCustomerOption) => {
    setSelectedCustomer(option);
    setForm((prev) => ({ ...prev, customerId: option.value, alamat: '', npwp: '' }));
    setIsCustomerOpen(false);

    try {
      setIsLoadingCustomerDetail(true);
      const detail = await getCustomerById(option.value);
      const mapped = mapCustomerDetailToSalesForm(detail);
      setForm((prev) => ({
        ...prev,
        customerId: mapped.customerId,
        alamat: mapped.alamat,
        npwp: mapped.npwp,
      }));
    } catch {
      toast.error('Gagal mengambil detail customer');
    } finally {
      setIsLoadingCustomerDetail(false);
    }
  };

  const handleSubmit = async (data: EditUnitFormData) => {
    const toNumber = (value: unknown) => {
      const normalized = Number(value ?? 0);
      return Number.isFinite(normalized) ? normalized : 0;
    };

    const customerId = Number(form.customerId || 0);
    const companyIdNumber = Number(companyId || 0);
    const unitTypeId = Number(data.tipeUnit || form.unitTypeId || 0);
    const qty = toNumber(data.qty);
    const price = toNumber(data.harga);
    const biayaBbn = toNumber(data.biayaBbn);
    const biayaEkspedisi = toNumber(data.biayaEkspedisi);
    const biayaLain = toNumber(data.biayaLain);

    if (!customerId) {
      toast.error('Customer wajib dipilih');
      return;
    }

    if (!companyIdNumber) {
      toast.error('Company tidak valid');
      return;
    }

    if (!unitTypeId) {
      toast.error('Tipe Unit wajib dipilih');
      return;
    }

    const transactionPayload = {
      company_id: companyIdNumber,
      person_id: customerId,
      warehouse_id: DEFAULT_WAREHOUSE_ID,
      code: form.code,
      type: 'sales' as const,
      max_capacity: qty,
      stock_state: 'draft',
    };

    if (!transactionPayload.code?.trim()) {
      toast.error('Kode transaksi wajib diisi');
      return;
    }

    if (!transactionPayload.max_capacity || transactionPayload.max_capacity <= 0) {
      toast.error('QTY wajib diisi dan minimal 1');
      return;
    }

    const readErrorMessage = (error: unknown): string => {
      const err = error as any;
      const detail = err?.details;

      if (typeof detail === 'string' && detail.trim()) return detail;

      if (detail && typeof detail === 'object') {
        const text = Object.values(detail)
          .flatMap((value: any) => (Array.isArray(value) ? value : [value]))
          .map((value: any) => String(value))
          .join(', ')
          .trim();
        if (text) return text;
      }

      return String(err?.message ?? 'Gagal menambahkan penjualan unit');
    };

    try {
      const selectedTypeUnit = await getTypeUnitById(unitTypeId, { companyId: companyIdNumber });
      const availableStock = Number(selectedTypeUnit.availableStock ?? 0);

      if (availableStock < qty) {
        toast.error('Stock tidak mencukupi');
        return;
      }

      // STEP 1: create transaction
      const transaction = await createSalesMutation.mutateAsync(transactionPayload);
      const transactionId = Number(transaction?.id ?? 0);

      if (!transactionId) {
        throw new Error('ID transaksi tidak ditemukan');
      }

      // STEP 2: create transaction item
      await createItemMutation.mutateAsync({
        unit_transaction_id: String(transactionId),
        unit_type_id: String(unitTypeId),
        qty_total: qty,
        price,
        bbn_price: biayaBbn,
        expedition_fee: biayaEkspedisi,
        other_fee: biayaLain,
      });

      toast.success('Penjualan unit berhasil ditambahkan');
      router.push(salesPath);
    } catch (error) {
      const message = readErrorMessage(error);
      if (message.toLowerCase().includes('no stock available')) {
        toast.error('Stok untuk tipe unit ini tidak tersedia di warehouse. Silakan pilih tipe unit lain yang tersedia.');
        return;
      }
      toast.error(message);
    }
  };

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
      await createTypeUnitMutation.mutateAsync({
        code,
        name: name || code,
        brandId,
        unitType: description || undefined,
        unitModel: description || undefined,
        nettoWeight: netto ? Number(netto) : undefined,
        brutoWeight: bruto ? Number(bruto) : undefined,
        image: typeUnitImage,
      });

      toast.success('Tipe unit berhasil ditambahkan');
      setIsOpenCreateTypeUnitModal(false);
      setTypeUnitImage(null);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Gagal menambahkan tipe unit';
      toast.error(message);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(salesPath)}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-semibold tracking-tight">Tambah Penjualan</h1>
          </div>
          <div className="flex items-center gap-2 mt-1 ml-7 text-xs">
            <span className="text-muted-foreground">Kode Jual</span>
            <span className="text-blue-500 font-medium">{generatedCode}</span>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5 md:p-6 shadow-sm">
          <EditUnitForm
            defaultValues={{
              customer: selectedCustomer?.label ?? '',
              tipeUnit: form.unitTypeId,
              qty: form.qty,
              harga: form.price,
              hppSatuan: 0,
              totalHpp: 0,
              dppSatuan: 0,
              totalDpp: 0,
              ppnSatuan: 0,
              totalPpn: 0,
              biayaBbn: 0,
              biayaEkspedisi: 0,
              biayaLain: 0,
            }}
            prependFields={
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Tanggal</Label>
                  <Input
                    type="date"
                    value={form.tanggal}
                    onChange={(e) => setForm((prev) => ({ ...prev, tanggal: e.target.value }))}
                    className="bg-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Customer</Label>
                  <Popover open={isCustomerOpen} onOpenChange={setIsCustomerOpen}>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="outline" role="combobox" aria-expanded={isCustomerOpen} className="w-full justify-between bg-transparent font-normal">
                        <span className={cn('truncate', !selectedCustomer && 'text-muted-foreground')}>
                          {selectedCustomer ? selectedCustomer.label : isLoadingCustomerList ? 'Memuat customer...' : 'Pilih customer'}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Cari customer (kode/nama)..." />
                        <CommandList>
                          <CommandEmpty>Customer tidak ditemukan.</CommandEmpty>
                          <CommandGroup>
                            {customerList.map((option) => (
                              <CommandItem key={option.value} value={option.keyword} onSelect={() => handleSelectCustomer(option)}>
                                <Check className={cn('mr-2 h-4 w-4', form.customerId === option.value ? 'opacity-100' : 'opacity-0')} />
                                {option.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Alamat</Label>
                  <Input value={form.alamat} readOnly disabled={isLoadingCustomerDetail} className="bg-transparent" placeholder="Alamat customer" />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">NPWP</Label>
                  <Input value={form.npwp} readOnly disabled={isLoadingCustomerDetail} className="bg-transparent" placeholder="NPWP customer" />
                </div>
              </div>
            }
            hideCustomerField
            productOptions={unitTypeOptions}
            searchableTypeUnit
            showAddUnitButton
            onAddUnitClick={() => setIsOpenCreateTypeUnitModal(true)}
            onSubmit={handleSubmit}
            onCancel={() => router.push(salesPath)}
            submitDisabled={createSalesMutation.isPending || createItemMutation.isPending || isLoadingCustomerList || isLoadingCustomerDetail || isLoadingUnitTypes}
            cancelDisabled={createSalesMutation.isPending || createItemMutation.isPending}
          />
        </div>
      </div>

      <Dialog open={isOpenCreateTypeUnitModal} onOpenChange={setIsOpenCreateTypeUnitModal}>
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
              <select id="brandId" name="brandId" className="w-full border rounded-md h-10 px-3" required defaultValue="" disabled={isLoadingBrands}>
                <option value="" disabled>
                  {isLoadingBrands ? 'Memuat merk...' : 'Pilih merk'}
                </option>
                {brandOptions.map((brand: any) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
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
              <Input id="image" name="image" type="file" accept="image/*" onChange={(e) => setTypeUnitImage(e.target.files?.[0] || null)} />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsOpenCreateTypeUnitModal(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={createTypeUnitMutation.isPending} className="bg-[#1e293b] hover:bg-[#0f172a] text-white">
                {createTypeUnitMutation.isPending ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
