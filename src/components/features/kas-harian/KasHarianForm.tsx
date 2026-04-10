import type { Company } from '@/services/company.service';
import type { Kas } from '@/@types/kas.types';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { MoneyInput } from '@/components/ui/money-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Textarea } from '@/components/ui/textarea';
import type { KasHarianFormValues } from '@/scheme/kas-harian.schema';
import { cn } from '@/lib/utils';

import type { Account } from '@/@types/account.types';

interface Props {
  form: UseFormReturn<KasHarianFormValues>;
  onSubmit: (data: KasHarianFormValues) => void;
  companies: Company[];
  cashOptions: Kas[];
  accountOptions?: Account[];
  isLoadingCompanies?: boolean;
  isLoadingCash?: boolean;
  isLoadingAccounts?: boolean;
  id?: string;
}

export default function KasHarianForm({ form, onSubmit, companies, cashOptions, accountOptions = [], isLoadingCompanies, isLoadingCash, isLoadingAccounts, id }: Props) {
  const [cashOpen, setCashOpen] = useState(false);
  const [cashSearch, setCashSearch] = useState('');
  const cashDropdownRef = useRef<HTMLDivElement | null>(null);
  const selectedCashId = form.watch('cash_id');
  const selectedCash = useMemo(() => cashOptions.find((cash) => Number(cash.id) === selectedCashId), [cashOptions, selectedCashId]);
  const filteredCashOptions = useMemo(() => {
    const query = cashSearch.trim().toLowerCase();
    if (!query) return cashOptions;

    return cashOptions.filter((cash) => [cash.code, cash.description, cash.type].some((value) => value.toLowerCase().includes(query)));
  }, [cashOptions, cashSearch]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!cashDropdownRef.current?.contains(event.target as Node)) {
        setCashOpen(false);
        setCashSearch('');
      }
    };

    if (cashOpen) {
      document.addEventListener('mousedown', handlePointerDown);
    }

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [cashOpen]);

  const [accountOpen, setAccountOpen] = useState(false);
  const [accountSearch, setAccountSearch] = useState('');
  const accountDropdownRef = useRef<HTMLDivElement | null>(null);
  const selectedAccountId = form.watch('account_id');
  const selectedAccount = useMemo(() => accountOptions.find((acc) => Number(acc.id) === selectedAccountId), [accountOptions, selectedAccountId]);
  const filteredAccountOptions = useMemo(() => {
    const query = accountSearch.trim().toLowerCase();
    if (!query) return accountOptions;

    return accountOptions.filter((acc) => [acc.code, acc.name, acc.description].some((value) => value?.toLowerCase().includes(query)));
  }, [accountOptions, accountSearch]);

  useEffect(() => {
    const handlePointerDownAccount = (event: MouseEvent) => {
      if (!accountDropdownRef.current?.contains(event.target as Node)) {
        setAccountOpen(false);
        setAccountSearch('');
      }
    };

    if (accountOpen) {
      document.addEventListener('mousedown', handlePointerDownAccount);
    }

    return () => {
      document.removeEventListener('mousedown', handlePointerDownAccount);
    };
  }, [accountOpen]);

  return (
    <Form {...form}>
      <form id={id} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="hidden">
          <FormField
            control={form.control}
            name="company_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Perusahaan</FormLabel>
                <Select value={field.value ? String(field.value) : undefined} onValueChange={(value) => field.onChange(Number(value))} disabled={isLoadingCompanies}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingCompanies ? 'Memuat perusahaan...' : 'Pilih perusahaan'} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={String(company.id)}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Tanggal</FormLabel>
              <FormControl>
                <DatePicker value={field.value} onChange={field.onChange} placeholder="Jan 20, 2025" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

          <FormField
            control={form.control}
            name="cash_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kas</FormLabel>
                <div ref={cashDropdownRef} className="relative">
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      type="button"
                      className={cn('w-full justify-between font-normal', !field.value && 'text-muted-foreground')}
                      disabled={isLoadingCash}
                      onClick={() => {
                        if (isLoadingCash) return;
                        setCashOpen((prev) => !prev);
                      }}
                    >
                      {isLoadingCash ? 'Memuat kas...' : selectedCash ? `${selectedCash.code} - ${selectedCash.description}` : 'Select an item'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>

                  {cashOpen ? (
                    <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[120] rounded-md border bg-popover shadow-md">
                      <div className="border-b p-2">
                        <Input placeholder="Cari kas..." value={cashSearch} onChange={(event) => setCashSearch(event.target.value)} autoFocus />
                      </div>
                      <div className="max-h-[260px] overflow-y-auto p-1">
                        {filteredCashOptions.length === 0 ? (
                          <div className="px-3 py-6 text-center text-sm text-muted-foreground">Kas tidak ditemukan.</div>
                        ) : (
                          filteredCashOptions.map((cash) => (
                            <button
                              key={cash.id}
                              type="button"
                              className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                              onClick={() => {
                                field.onChange(Number(cash.id));
                                setCashSearch('');
                                setCashOpen(false);
                              }}
                            >
                              <Check className={cn('h-4 w-4', Number(cash.id) === field.value ? 'opacity-100' : 'opacity-0')} />
                              <div className="flex flex-col">
                                <span>{cash.description}</span>
                                <span className="text-xs text-muted-foreground">
                                  {cash.code} - {cash.type}
                                </span>
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
                <FormLabel>Nama Akun</FormLabel>
                <div ref={accountDropdownRef} className="relative">
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      type="button"
                      className={cn('w-full justify-between font-normal', !field.value && 'text-muted-foreground')}
                      disabled={isLoadingAccounts}
                      onClick={() => {
                        if (isLoadingAccounts) return;
                        setAccountOpen((prev) => !prev);
                      }}
                    >
                      {isLoadingAccounts ? 'Memuat akun...' : selectedAccount ? `${selectedAccount.code} - ${selectedAccount.name}` : 'Select an item'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>

                  {accountOpen ? (
                    <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[120] rounded-md border bg-popover shadow-md">
                      <div className="border-b p-2">
                        <Input placeholder="Cari akun..." value={accountSearch} onChange={(event) => setAccountSearch(event.target.value)} autoFocus />
                      </div>
                      <div className="max-h-[260px] overflow-y-auto p-1">
                        {filteredAccountOptions.length === 0 ? (
                          <div className="px-3 py-6 text-center text-sm text-muted-foreground">Akun tidak ditemukan.</div>
                        ) : (
                          filteredAccountOptions.map((acc) => (
                            <button
                              key={acc.id}
                              type="button"
                              className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                              onClick={() => {
                                field.onChange(Number(acc.id));
                                setAccountSearch('');
                                setAccountOpen(false);
                              }}
                            >
                              <Check className={cn('h-4 w-4', Number(acc.id) === field.value ? 'opacity-100' : 'opacity-0')} />
                              <div className="flex flex-col">
                                <span>{acc.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {acc.code} - {acc.type}
                                </span>
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
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Keterangan</FormLabel>
              <FormControl>
                <Textarea placeholder="Tulis deskripsi di sini" className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-1">
          <FormField
            control={form.control}
            name="debet"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Debet</FormLabel>
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
                <FormLabel>Kredit</FormLabel>
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
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="rounded-lg border bg-slate-50 px-3 py-2 text-xs text-slate-600">
          Isi salah satu saja: `debet` untuk uang masuk atau `kredit` untuk uang keluar.
        </div>
      </form>
    </Form>
  );
}
