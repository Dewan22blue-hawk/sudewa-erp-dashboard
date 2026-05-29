import { useEffect, useMemo, useRef, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Check, ChevronsUpDown, Upload } from 'lucide-react';
import type { Company } from '@/services/company.service';
import type { Account } from '@/@types/account.types';
import type { Kas } from '@/@types/kas.types';
import type { KasHarianFormInput, KasHarianFormValues } from '@/scheme/kas-harian.schema';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { Textarea } from '@/components/ui/textarea';
import { MoneyInput } from '@/components/ui/money-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
  form: UseFormReturn<KasHarianFormInput, unknown, KasHarianFormValues>;
  onSubmit: (data: KasHarianFormValues) => void;
  companies: Company[];
  cashOptions: Kas[];
  accountOptions: Account[];
  isLoadingCash?: boolean;
  isLoadingAccount?: boolean;
  id?: string;
}

export default function KasHarianForm({ form, onSubmit, companies, cashOptions, accountOptions, isLoadingCash, isLoadingAccount, id }: Props) {
  const [cashOpen, setCashOpen] = useState(false);
  const [cashSearch, setCashSearch] = useState('');
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountSearch, setAccountSearch] = useState('');
  const cashDropdownRef = useRef<HTMLDivElement | null>(null);
  const accountDropdownRef = useRef<HTMLDivElement | null>(null);
  const selectedCompanyId = form.watch('company_id');
  const selectedCashId = form.watch('cash_id');
  const selectedAccountId = form.watch('account_id');
  const paymentProof = form.watch('payment_proof');

  const selectedCompany = useMemo(
    () => companies.find((company) => Number(company.id) === Number(selectedCompanyId)),
    [companies, selectedCompanyId],
  );

  const selectedCash = useMemo(
    () => cashOptions.find((cash) => Number(cash.id) === Number(selectedCashId)),
    [cashOptions, selectedCashId],
  );

  const selectedAccount = useMemo(
    () => accountOptions.find((account) => Number(account.id) === Number(selectedAccountId)),
    [accountOptions, selectedAccountId],
  );

  const filteredCashOptions = useMemo(() => {
    const query = cashSearch.trim().toLowerCase();
    if (!query) return cashOptions;

    return cashOptions.filter((cash) =>
      [cash.code, cash.description, cash.type].some((value) => String(value ?? '').toLowerCase().includes(query)),
    );
  }, [cashOptions, cashSearch]);

  const filteredAccountOptions = useMemo(() => {
    const query = accountSearch.trim().toLowerCase();
    if (!query) return accountOptions;

    return accountOptions.filter((account) =>
      [account.code, account.name, account.description].some((value) => String(value ?? '').toLowerCase().includes(query)),
    );
  }, [accountOptions, accountSearch]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!cashDropdownRef.current?.contains(event.target as Node)) {
        setCashOpen(false);
        setCashSearch('');
      }

      if (!accountDropdownRef.current?.contains(event.target as Node)) {
        setAccountOpen(false);
        setAccountSearch('');
      }
    };

    if (cashOpen || accountOpen) {
      document.addEventListener('mousedown', handlePointerDown);
    }

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [accountOpen, cashOpen]);

  return (
    <Form {...form}>
      <form id={id} onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="hidden">
          <FormField
            control={form.control}
            name="company_id"
            render={({ field }) => <input type="hidden" value={field.value} onChange={field.onChange} />}
          />
        </div>

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-base font-medium text-slate-900">Tanggal</FormLabel>
              <FormControl>
                <div className="rounded-2xl border border-slate-200 bg-white">
                  <DatePicker
                    value={field.value instanceof Date ? field.value : null}
                    onChange={(date) => {
                      form.setValue('date', date ?? new Date(''), {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                      });
                    }}
                    placeholder="Jan 20, 2025"
                    className="h-12 rounded-2xl border-0 shadow-none"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel className="text-base font-medium text-slate-900">Perusahaan</FormLabel>
          <div className="flex min-h-12 items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700">
            {selectedCompany?.name ?? 'Perusahaan belum dipilih'}
          </div>
        </div>

        <FormField
          control={form.control}
          name="cash_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium text-slate-900">Kas Terkait</FormLabel>
              <div ref={cashDropdownRef} className="relative">
                <FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    className={cn(
                      'h-12 w-full justify-between rounded-2xl border-slate-200 bg-white px-4 text-left font-normal hover:bg-white',
                      !field.value && 'text-slate-400',
                    )}
                    disabled={isLoadingCash}
                    onClick={() => {
                      if (isLoadingCash) return;
                      setCashOpen((previous) => !previous);
                    }}
                  >
                    {isLoadingCash
                      ? 'Memuat akun kas...'
                      : selectedCash
                        ? `${selectedCash.code} - ${selectedCash.description}`
                        : 'Select an item'}
                    <ChevronsUpDown className="h-4 w-4 shrink-0 text-slate-400" />
                  </Button>
                </FormControl>

                {cashOpen ? (
                  <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[120] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                    <div className="border-b border-slate-100 p-2">
                      <Input data-no-enter-submit="true" placeholder="Cari akun kas..." value={cashSearch} onChange={(event) => setCashSearch(event.target.value)} autoFocus />
                    </div>
                    <div className="max-h-64 overflow-y-auto p-2">
                      {filteredCashOptions.length === 0 ? (
                        <div className="px-3 py-6 text-center text-sm text-slate-500">Data akun kas tidak ditemukan.</div>
                      ) : (
                        filteredCashOptions.map((cash) => (
                          <button
                            key={cash.id}
                            type="button"
                            className="flex w-full items-start gap-2 rounded-xl px-3 py-3 text-left text-sm hover:bg-slate-50"
                            onClick={() => {
                              field.onChange(Number(cash.id));
                              setCashSearch('');
                              setCashOpen(false);
                            }}
                          >
                            <Check className={cn('mt-0.5 h-4 w-4', Number(cash.id) === Number(field.value) ? 'opacity-100' : 'opacity-0')} />
                            <div className="space-y-1">
                              <p className="font-medium text-slate-900">{cash.description}</p>
                              <p className="text-xs text-slate-500">
                                {cash.code} • {cash.type}
                              </p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="account_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium text-slate-900">Nama Akun</FormLabel>
              <div ref={accountDropdownRef} className="relative">
                <FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    className={cn(
                      'h-12 w-full justify-between rounded-2xl border-slate-200 bg-white px-4 text-left font-normal hover:bg-white',
                      !field.value && 'text-slate-400',
                    )}
                    disabled={isLoadingAccount}
                    onClick={() => {
                      if (isLoadingAccount) return;
                      setAccountOpen((previous) => !previous);
                    }}
                  >
                    {isLoadingAccount
                      ? 'Memuat akun...'
                      : selectedAccount
                        ? `${selectedAccount.code} - ${selectedAccount.name}`
                        : 'Select an item'}
                    <ChevronsUpDown className="h-4 w-4 shrink-0 text-slate-400" />
                  </Button>
                </FormControl>

                {accountOpen ? (
                  <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[120] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                    <div className="border-b border-slate-100 p-2">
                      <Input data-no-enter-submit="true" placeholder="Cari akun..." value={accountSearch} onChange={(event) => setAccountSearch(event.target.value)} autoFocus />
                    </div>
                    <div className="max-h-64 overflow-y-auto p-2">
                      {filteredAccountOptions.length === 0 ? (
                        <div className="px-3 py-6 text-center text-sm text-slate-500">Data akun tidak ditemukan.</div>
                      ) : (
                        filteredAccountOptions.map((account) => (
                          <button
                            key={account.id}
                            type="button"
                            className="flex w-full items-start gap-2 rounded-xl px-3 py-3 text-left text-sm hover:bg-slate-50"
                            onClick={() => {
                              field.onChange(Number(account.id));
                              setAccountSearch('');
                              setAccountOpen(false);
                            }}
                          >
                            <Check className={cn('mt-0.5 h-4 w-4', Number(account.id) === Number(field.value) ? 'opacity-100' : 'opacity-0')} />
                            <div className="space-y-1">
                              <p className="font-medium text-slate-900">{account.name}</p>
                              <p className="text-xs text-slate-500">
                                {account.code}
                                {account.description ? ` • ${account.description}` : ''}
                              </p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="transaction_category"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium text-slate-900">Kategori Transaksi</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-12 w-full rounded-2xl border-slate-200 bg-white px-4">
                    <SelectValue placeholder="Pilih kategori transaksi" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="general" className="rounded-xl">Umum (General)</SelectItem>
                  <SelectItem value="operational" className="rounded-xl">Operasional (Operational)</SelectItem>
                  <SelectItem value="director_receivable" className="rounded-xl">Piutang Direktur (Director Receivable)</SelectItem>
                  <SelectItem value="shareholder_receivable" className="rounded-xl">Piutang Pemegang Saham (Shareholder Receivable)</SelectItem>
                  <SelectItem value="receivable" className="rounded-xl">Piutang Usaha (Receivable)</SelectItem>
                  <SelectItem value="inventory" className="rounded-xl">Persediaan (Inventory)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium text-slate-900">Keterangan</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tulis deskripsi di sini"
                  className="min-h-28 resize-none rounded-2xl border-slate-200 px-4 py-3"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="debet"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium text-slate-900">Debet</FormLabel>
              <FormControl>
                <MoneyInput
                  value={field.value ?? 0}
                  onChangeValue={(value) => {
                    field.onChange(value);
                    if (value > 0) {
                      form.setValue('credit', 0, { shouldValidate: true });
                    }
                  }}
                  placeholder="Tambahkan nominal"
                  className="h-12 rounded-2xl border-slate-200 px-4"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="credit"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium text-slate-900">Kredit</FormLabel>
              <FormControl>
                <MoneyInput
                  value={field.value ?? 0}
                  onChangeValue={(value) => {
                    field.onChange(value);
                    if (value > 0) {
                      form.setValue('debet', 0, { shouldValidate: true });
                    }
                  }}
                  placeholder="Tambahkan nominal"
                  className="h-12 rounded-2xl border-slate-200 px-4"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="payment_proof"
          render={() => (
            <FormItem>
              <FormLabel className="text-base font-medium text-slate-900">Bukti Pembayaran (opsional)</FormLabel>
              <FormControl>
                <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-center">
                  <Upload className="mb-3 h-7 w-7 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">{paymentProof ? paymentProof.name : 'Klik untuk upload dokumen'}</span>
                  <span className="mt-1 text-xs text-slate-400">PNG, JPG, PDF maksimal 5MB</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(event) => {
                      form.setValue('payment_proof', event.target.files?.[0] ?? null, {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                      });
                    }}
                  />
                </label>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
