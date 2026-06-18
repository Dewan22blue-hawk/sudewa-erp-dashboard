'use client';

import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useSalesDetail, useUpdateSales } from '@/hooks/useSales';
import { useEffect, useMemo, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { useCompany } from '@/contexts/CompanyContext';
import { getCustomerById, getCustomers } from '@/services/customer.service';
import { mapCustomerToSalesOption, SalesCustomerOption } from '@/services/sales-customer.mapper';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ChevronLeft, Check, ChevronsUpDown, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function EditSalesPage() {
  const router = useRouter();
  const { slug, itemId } = router.query;
  const { companyId } = useCompany();

  const salesId = Array.isArray(itemId) ? itemId[0] : itemId;
  const { data: salesDetail, isLoading: isSalesLoading } = useSalesDetail(salesId);
  const updateMutation = useUpdateSales();

  const [personId, setPersonId] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [alamat, setAlamat] = useState('');
  const [npwp, setNpwp] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<SalesCustomerOption | null>(null);
  const [customerList, setCustomerList] = useState<SalesCustomerOption[]>([]);
  const [isCustomerOpen, setIsCustomerOpen] = useState(false);
  const [isLoadingCustomerList, setIsLoadingCustomerList] = useState(false);
  const [isLoadingCustomerDetail, setIsLoadingCustomerDetail] = useState(false);

  // Load customer list for search
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

  // Sync initial values when sales detail data loads
  useEffect(() => {
    if (salesDetail?.raw) {
      const raw = salesDetail.raw;
      const initialPersonId = String(raw.person_id ?? raw.person?.id ?? '');
      setPersonId(initialPersonId);

      if (raw.created_at) {
        setPurchaseDate(raw.created_at.split('T')[0]);
      }

      if (initialPersonId) {
        const fetchCustomerDetail = async () => {
          try {
            setIsLoadingCustomerDetail(true);
            const detail = await getCustomerById(initialPersonId);
            setAlamat(detail.address ?? '');
            setNpwp(detail.npwp ?? '');
          } catch {
            console.error('Failed to fetch customer detail');
          } finally {
            setIsLoadingCustomerDetail(false);
          }
        };
        fetchCustomerDetail();
      }
    }
  }, [salesDetail]);

  // Sync selectedCustomer option when list and personId are resolved
  useEffect(() => {
    if (personId && customerList.length > 0) {
      const found = customerList.find((opt) => opt.value === personId);
      if (found) {
        setSelectedCustomer(found);
      }
    }
  }, [personId, customerList]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!personId) {
      toast.error('Customer wajib dipilih');
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
      const raw = salesDetail?.raw;
      if (!raw || !salesId) {
        toast.error('Data penjualan tidak ditemukan');
        return;
      }

      const payload = {
        company_id: Number(companyId),
        person_id: Number(personId),
        code: raw.code || '',
        type: 'sales' as const,
        max_capacity: Number(raw.max_capacity ?? 1.0),
        stock_state: raw.stock_state || 'draft',
        warehouse_id: raw.warehouse_id ? Number(raw.warehouse_id) : undefined,
        unit_type_id: raw.unit_transaction_items?.[0]?.unit_type_id ? Number(raw.unit_transaction_items[0].unit_type_id) : undefined,
        qty_total: raw.unit_transaction_items?.[0]?.qty_total ? Number(raw.unit_transaction_items[0].qty_total) : undefined,
        price: raw.unit_transaction_items?.[0]?.price ? Number(raw.unit_transaction_items[0].price) : undefined,
        bbn_price: raw.transaction_bbn_total ? Number(raw.transaction_bbn_total) : undefined,
        other_fee: raw.transaction_other_fee ? Number(raw.transaction_other_fee) : undefined,
        transaction_date: purchaseDate,
      };

      await updateMutation.mutateAsync({
        id: salesId,
        payload,
      });

      toast.success('Penjualan berhasil diperbarui');
      router.push(`/dashboard/${slug}/sales`);
    } catch (err: any) {
      const apiMessage = err?.message || 'Gagal memperbarui penjualan';
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

  if (isSalesLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!salesDetail?.raw) {
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

  const invoiceCode = salesDetail.raw.code || '';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push(`/dashboard/${slug}/sales`)}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-6 w-6 text-slate-800" />
          </button>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Edit Penjualan</h1>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Kode Jual</span>
              <span className="text-blue-600 font-medium">{invoiceCode}</span>
            </div>
          </div>
        </div>

        {/* FORM CONTAINER */}
        <div className="rounded-xl border bg-white p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900">Informasi Penjualan</h2>
            <div className="border-b border-slate-100 my-4" />

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

              {/* CUSTOMER */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Customer</Label>
                <Popover open={isCustomerOpen} onOpenChange={setIsCustomerOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      role="combobox"
                      aria-expanded={isCustomerOpen}
                      aria-controls="customer-combobox-list"
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    >
                      <span className={cn('truncate', !selectedCustomer && 'text-muted-foreground')}>
                        {selectedCustomer ? selectedCustomer.label : isLoadingCustomerList ? 'Memuat customer...' : 'Pilih customer'}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="Cari customer (kode/nama)..." />
                      <CommandList id="customer-combobox-list">
                        <CommandEmpty>Customer tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                          {customerList.map((option) => (
                            <CommandItem
                              key={option.value}
                              value={option.keyword}
                              onSelect={async () => {
                                setPersonId(option.value);
                                setSelectedCustomer(option);
                                setIsCustomerOpen(false);
                                try {
                                  setIsLoadingCustomerDetail(true);
                                  const detail = await getCustomerById(option.value);
                                  setAlamat(detail.address ?? '');
                                  setNpwp(detail.npwp ?? '');
                                } catch {
                                  toast.error('Gagal memuat detail customer');
                                } finally {
                                  setIsLoadingCustomerDetail(false);
                                }
                              }}
                            >
                              <Check className={cn('mr-2 h-4 w-4', personId === option.value ? 'opacity-100' : 'opacity-0')} />
                              {option.label}
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
                  value={alamat}
                  readOnly
                  disabled={isLoadingCustomerDetail}
                  className="bg-transparent border-slate-200"
                  placeholder="Alamat customer"
                />
              </div>

              {/* NPWP */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">NPWP</Label>
                <Input
                  value={npwp}
                  readOnly
                  disabled={isLoadingCustomerDetail}
                  className="bg-transparent border-slate-200"
                  placeholder="NPWP customer"
                />
              </div>
            </div>

            {/* BUTTONS */}
            <div className="flex justify-center gap-3 pt-4 border-t border-slate-50">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push(`/dashboard/${slug}/sales`)}
                className="text-slate-500 hover:text-slate-900 font-medium"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending || isLoadingCustomerDetail}
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
