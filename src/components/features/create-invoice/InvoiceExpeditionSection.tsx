import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { InvoiceFormValues } from './create-invoice.data';

interface InvoiceExpeditionSectionProps {
  values: Pick<InvoiceFormValues, 'nomorInvoice' | 'lampiran' | 'perihal' | 'tanggal'>;
  errors: Partial<Record<string, string>>;
  onValueChange: (field: string, value: string) => void;
}

export function InvoiceExpeditionSection({ values, errors, onValueChange }: InvoiceExpeditionSectionProps) {
  return (
    <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
      <h4 className="text-lg font-semibold text-gray-900">Informasi Ekspedisi</h4>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Nomor Invoice */}
        <div className="space-y-2">
          <Label htmlFor="nomorInvoice">
            Nomor Invoice <span className="text-red-500">*</span>
          </Label>
          <Input id="nomorInvoice" placeholder="Masukkan nomor invoice" value={values.nomorInvoice} onChange={(e) => onValueChange('nomorInvoice', e.target.value)} className={errors.nomorInvoice ? 'border-red-500' : ''} />
          {errors.nomorInvoice && <p className="text-xs text-red-500">{errors.nomorInvoice}</p>}
        </div>

        {/* Lampiran */}
        <div className="space-y-2">
          <Label htmlFor="lampiran">Lampiran</Label>
          <Input id="lampiran" placeholder="Masukkan lampiran" value={values.lampiran} onChange={(e) => onValueChange('lampiran', e.target.value)} />
        </div>

        {/* Perihal */}
        <div className="space-y-2">
          <Label htmlFor="perihal">Perihal</Label>
          <Input id="perihal" placeholder="Masukkan perihal" value={values.perihal} onChange={(e) => onValueChange('perihal', e.target.value)} />
        </div>

        {/* Tanggal */}
        <div className="space-y-2">
          <Label htmlFor="tanggal">Tanggal</Label>
          <Input id="tanggal" type="date" placeholder="Pick a date" value={values.tanggal} onChange={(e) => onValueChange('tanggal', e.target.value)} />
        </div>
      </div>
    </section>
  );
}
