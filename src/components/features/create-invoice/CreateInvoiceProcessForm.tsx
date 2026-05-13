import * as React from 'react';
import { ChevronLeft, Printer } from 'lucide-react';
import type { CreateInvoiceDetailRow, CreateInvoiceProcessValues } from '@/@types/create-invoice.types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { formatDisplayDate, formatMoney } from './create-invoice.utils';

interface Props {
  title: string;
  values: CreateInvoiceProcessValues;
  rows: CreateInvoiceDetailRow[];
  onBack: () => void;
  onCancel: () => void;
  onChange: <K extends keyof CreateInvoiceProcessValues>(field: K, value: CreateInvoiceProcessValues[K]) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export function CreateInvoiceProcessForm({
  title,
  values,
  rows,
  onBack,
  onCancel,
  onChange,
  onSubmit,
  isSubmitting = false,
}: Props) {
  const totalInvoice = rows.reduce((sum, row) => sum + row.invoiceExpedition, 0);
  const totalAdditional = rows.reduce((sum, row) => sum + row.additionalCost, 0);
  const totalPayment = totalInvoice + totalAdditional;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <button type="button" onClick={onBack} className="rounded-md p-1 transition-colors hover:bg-slate-100">
          <ChevronLeft className="h-5 w-5 text-slate-500" />
        </button>
        <div>
          <h1 className="text-[18px] font-semibold text-slate-900 md:text-[20px]">{title}</h1>
        </div>
      </div>

      <Card className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="space-y-5">
          <div>
            <h2 className="text-[18px] font-semibold text-slate-900">Informasi Ekspedisi</h2>
          </div>

          <div className="h-px bg-slate-200" />

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-900">Tanggal</Label>
              <DatePicker
                value={values.date}
                onChange={(date) => onChange('date', date ? date.toISOString().slice(0, 10) : '')}
                placeholder="Pick a date"
                className="h-12 rounded-xl border-slate-200 bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-900">Perihal</Label>
              <Input
                value={values.subject}
                onChange={(event) => onChange('subject', event.target.value)}
                placeholder="Contoh: Invoice Ekspedisi"
                className="h-12 rounded-xl border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-900">Nama Customer</Label>
              <Input
                value={values.customerName}
                onChange={(event) => onChange('customerName', event.target.value)}
                placeholder="Masukkan nama customer"
                className="h-12 rounded-xl border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-900">Lampiran</Label>
              <Input
                value={values.attachment}
                onChange={(event) => onChange('attachment', event.target.value)}
                placeholder="Contoh: 1 lembar"
                className="h-12 rounded-xl border-slate-200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-900">Isi Surat</Label>
            <Textarea
              value={values.letterContent}
              onChange={(event) => onChange('letterContent', event.target.value)}
              placeholder="Contoh: Pembayaran dapat dilakukan ke rekening xx"
              className="min-h-[120px] rounded-xl border-slate-200"
            />
          </div>

          <div className="overflow-hidden rounded-[20px] border border-slate-200">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#eef3f8]">
                  <TableRow className="border-slate-200">
                    {['NO', 'TANGGAL', 'KODE DO', 'NO POLISI', 'TYPE', 'DRIVER', 'LOADING IN', 'TUJUAN KIRIM', 'LOADING OUT', 'NO SURAT DO', 'QTY', 'NO SURAT JALAN', 'INV EKSPEDISI', 'BIAYA TAMBAHAN', 'TOTAL PAYMENT'].map((header) => (
                      <TableHead key={header} className="whitespace-nowrap px-4 py-4 text-center text-sm font-semibold text-slate-900">
                        {header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, index) => (
                    <TableRow key={`${row.invoiceId}-${index}`} className="border-slate-100">
                      <TableCell className="px-4 py-3 text-center text-sm text-slate-700">{index + 1}</TableCell>
                      <TableCell className="px-4 py-3 text-center text-sm text-slate-700">{formatDisplayDate(row.date)}</TableCell>
                      <TableCell className="px-4 py-3 text-center text-sm text-slate-700">{row.doCode}</TableCell>
                      <TableCell className="px-4 py-3 text-center text-sm text-slate-700">{row.noPolisi}</TableCell>
                      <TableCell className="px-4 py-3 text-center text-sm text-slate-700">{row.type}</TableCell>
                      <TableCell className="px-4 py-3 text-center text-sm text-slate-700">{row.driver}</TableCell>
                      <TableCell className="px-4 py-3 text-center text-sm text-slate-700">{row.loadingIn}</TableCell>
                      <TableCell className="px-4 py-3 text-center text-sm text-slate-700">{row.destination}</TableCell>
                      <TableCell className="px-4 py-3 text-center text-sm text-slate-700">{row.loadingOut}</TableCell>
                      <TableCell className="px-4 py-3 text-center text-sm text-slate-700">{row.doLetterCode}</TableCell>
                      <TableCell className="px-4 py-3 text-center text-sm text-slate-700">{row.qty}</TableCell>
                      <TableCell className="px-4 py-3 text-center text-sm text-slate-700">{row.doAssignmentCode}</TableCell>
                      <TableCell className="px-4 py-3 text-right text-sm text-slate-700">{formatMoney(row.invoiceExpedition)}</TableCell>
                      <TableCell className="px-4 py-3 text-right text-sm text-slate-700">{formatMoney(row.additionalCost)}</TableCell>
                      <TableCell className="px-4 py-3 text-right text-sm font-medium text-slate-900">{formatMoney(row.invoiceExpedition + row.additionalCost)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-[#effaf3]">
                    <TableCell colSpan={12} className="px-4 py-4 text-center text-[18px] font-semibold text-slate-900">
                      PAYMENT DITRANSFER KE REKENING PT WAJIRA TRANSINDO 
                    </TableCell>
                    <TableCell className="px-4 py-4 text-right text-sm font-semibold text-slate-900">{formatMoney(totalInvoice)}</TableCell>
                    <TableCell className="px-4 py-4 text-right text-sm font-semibold text-slate-900">{formatMoney(totalAdditional)}</TableCell>
                    <TableCell className="px-4 py-4 text-right text-sm font-semibold text-slate-900">{formatMoney(totalPayment)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-center gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="h-11 rounded-xl px-6 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900">
          Batal
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="h-11 rounded-xl bg-[#1f4163] px-6 text-sm font-medium hover:bg-[#183552]"
        >
          <Printer className="mr-2 h-4 w-4" />
          {isSubmitting ? 'Memproses...' : 'Print Invoice'}
        </Button>
      </div>
    </div>
  );
}
